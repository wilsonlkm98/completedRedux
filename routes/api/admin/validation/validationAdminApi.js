require('dotenv').config();
const express = require('express');
const User = require("../../../../configs/tables/user");
const Transaction = require("../../../../configs/tables/transaction");
const Receipt = require("../../../../configs/tables/receipt");
const Voucher = require("../../../../configs/tables/voucher");
const Retailer = require("../../../../configs/tables/retailer");
const Promoter = require("../../../../configs/tables/promoter");
const Reward = require("../../../../configs/tables/reward");
const Item = require("../../../../configs/tables/item");
const SKU = require("../../../../configs/tables/sku");
const Event = require("../../../../configs/tables/event");
const { sendMessage } = require("../../../../configs/function/sms");
const numberRegex = /^\d+$/; // <- only number can exist
const router = express.Router();
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
const s3 = new AWS.S3();
const moment = require('moment');

const {
	validationList,
	overviewRpt,
	lastFewDays,
} = require('../../../../configs/function/operation/validation');

const { authenticate } = require('../../../../configs/function/middlewares');
const { update } = require('../../../../configs/tables/user');

function dateFormater(date, separator) {
	let day = date.getDate();
	let month = date.getMonth() + 1;
	const year = date.getFullYear();

	// show date and month in two digits
	if (day < 10) {
		day = `0${day}`;
	}
	if (month < 10) {
		month = `0${month}`;
	}

	// now we have day, month and year
	// use the separator to join them
	return year + separator + month + separator + day;
}

router.post('/validationList', authenticate, async (req, res) => {
	const { startDate, endDate, status } = req.body;
	const data = await validationList(startDate, endDate, status);

	for (a = 0; a < data.length; a++) {
		const param = {
			Bucket: process.env.BUCKETNAME,
			Key: data[a].receiptKey,
			Expires: 86400,
		};
		let today = new Date();
		let checkDate = data[a].expired;
		const receiptUrl = [];
		// console.log(param.Key)
		if (today > checkDate || !data[a].url || !data[a].expired) {
			// console.log('new')
			const receiptImage = await Promise.resolve(
				s3.getSignedUrlPromise("getObject", param)
			);
			const updateReceipt = await Receipt.findOne({ where: { invoice_No: data[a].receiptNumber } })

			if (updateReceipt) {
				updateReceipt.url = receiptImage
				updateReceipt.expired = today.setDate(today.getDate() + 1)
				await updateReceipt.save();
				receiptUrl.push(receiptImage)
			}
		}
		else {
			// console.log('again')
			receiptUrl.push(data[a].url)
		}
		data[a].receiptImage = receiptUrl;
	}

	return res.status(200).json({ data: data });
});

router.post('/overview', authenticate, async (req, res) => {
	const data = await overviewRpt();
	return res.status(200).json({ data: [data] });
});

router.post('/recentValidation', authenticate, async (req, res) => {
	const data = await lastFewDays(1000);
	const dates = [...Array(5)].map((_, i) => {
		const d = new Date();
		d.setDate(d.getDate() - i);
		const tempdate = dateFormater(d, '-');
		return tempdate;
	});
	// console.log(data)
	// console.log(dates)
	const tosend = dates.map((myd) => {
		const out = data.filter((e) => {
			if (e.thedate == myd) {
				return e;
			}
		})[0];
		if (out !== 0) {
			return out;
		}
		return {
			thedate: myd,
			mypending: 0,
			myrejected: 0,
			myapproved: 0,
			myissues: 0,
		};
	});
	const checkDate = tosend.sort((a, b) => Date.parse(new Date(a.thedate)) - Date.parse(new Date(b.thedate)))

	// console.log(checkDate);
	return res.status(200).json({ data: checkDate });
});

router.post("/validate", authenticate, async (req, res) => {
	const {
		id,
		storeName,
		state,
		receiptNumber,
		receiptDate,
		receiptAmount,
		nonproduct,
		nonproductPrice,
		promo,
		reason,
		status,
		validatorId,
		validatorName,
	} = req.body;
	console.log(req.body);

	if (!storeName) {
		return res.status(400).json({ error: 'Please select a store' })
	}
	if (status !== "Approved" && status !== "Rejected" && status !== "Issue")
		return res.status(400).json({ error: "Status not found" });
	try {
		const foundTran = await Transaction.findByPk(id, {
			include: [User, Retailer, Promoter],
		});
		const foundReceipt = await Receipt.findOne({
			where: { transactionId: foundTran.id },
		});
		if (!foundTran || !foundReceipt) {
			return res.status(400).json({ error: "Transaction not found" });
		}

		const foundStore = await Retailer.findOne({ where: { name: storeName } })
		if (!foundStore) {
			return res.status(400).json({ error: "Tran Store not found" });
		}
		const assignVoucher = await Voucher.findOne({
			where: {
				redeemed: false,
				rewardId: null,
			},
		});
		if (!assignVoucher) {
			return res.status(400).json({ error: "Voucher not found" });
		}
		const foundNewStore = await Retailer.findOne({ where: { name: storeName } })
		if (!foundNewStore) {
			return res.status(400).json({ error: 'Store not found' })
		}
		const findUser = await User.findOne({
			where: { id: foundTran.user.dataValues.id }
		});
		if (!findUser) {
			return res.status(400).json({ error: "User not found." });
		}
		if (status !== 'Rejected') {
			const checkDuplicated = await Receipt.findAll({ where: { invoice_No: receiptNumber, receipt_date: moment(new Date(receiptDate)).format('YYYY-MM-DD') }, include: Transaction })
			if (checkDuplicated.length) {
				for (a = 0; a < checkDuplicated.length; a++) {
					let tran = checkDuplicated[a].transaction.dataValues
					console.log('compare', tran.id, foundTran.id)
					if (tran.status !== 'Rejected' && tran.id !== foundTran.id) {
						return res.status(400).json({ error: 'Duplicated Receipt No.' })
					}
				}
			}
		}

		// REQUIRED : Update the numbers based on requirements
		let tier1 = 1
		let tier2 = 3
		let tier3 = 5
		let tier4 = 7
		let tier5 = 10
		let maxVoucher = 10

		if (status === "Approved") {
			if (foundTran.status !== "Approved") {
				const totalRedeemed = await Reward.findAll({
					where: { userId: findUser.dataValues.id },
				});
				if (totalRedeemed.length < maxVoucher) {
					const newReward = Reward.build({
						name: "Voucher",
						type: assignVoucher.type,
						amount: assignVoucher.amount,
						active: true,
						status: "redeemed",
						userId: findUser.id,
						retailerId: foundStore.id,
						transactionId: foundTran.id,
						redemption_date: Date.now(),
						entitlement_date: Date.now(),

					});
					const savedReward = await newReward.save();

					assignVoucher.rewardId = savedReward.id;
					assignVoucher.redeemed = true;
					assignVoucher.redeemedDate = Date.now();
					assignVoucher.userId = foundTran.user.dataValues.id;
					await assignVoucher.save();
					//update user status to repeat
					if (totalRedeemed.length + 1 === maxVoucher) {
						findUser.status = 'Completed'
					}
					//update user Active status if first approve
					if (!findUser.first_approve_date) {
						findUser.status = 'Active'
						findUser.first_approve_date = Date.now()
						const newEventActive = Event.build({
							type: 'activeUser',
							amount: 1,
							userId: findUser.id,
							transactionId: foundTran.id,
						})
						await newEventActive.save();
					}
					if (totalRedeemed.length + 1 === tier1) {
						findUser.tier1_date = Date.now()

						const newEventTier1 = Event.build({
							type: 'tier1',
							amount: 1,
							userId: findUser.id,
							transactionId: foundTran.id,
						})
						await newEventTier1.save();
					}
					if (totalRedeemed.length + 1 === tier2) {
						findUser.tier2_date = Date.now()

						const newEventTier2 = Event.build({
							type: 'tier2',
							amount: 1,
							userId: findUser.id,
							transactionId: foundTran.id,
						})
						await newEventTier2.save();
					}
					if (totalRedeemed.length + 1 === tier3) {
						findUser.tier3_date = Date.now()
						const newEventTier3 = Event.build({
							type: 'tier3',
							amount: 1,
							userId: findUser.id,
							transactionId: foundTran.id,
						})
						await newEventTier3.save();
					}
					if (totalRedeemed.length + 1 === tier4) {
						findUser.tier4_date = Date.now()

						const newEventTier4 = Event.build({
							type: 'tier4',
							amount: 1,
							userId: findUser.id,
							transactionId: foundTran.id,
						})
						await newEventTier4.save();
					}
					if (totalRedeemed.length + 1 === tier5) {
						findUser.tier5_date = Date.now()

						const newEventTier5 = Event.build({
							type: 'tier5',
							amount: 1,
							userId: findUser.id,
							transactionId: foundTran.id,
						})
						await newEventTier5.save();
					}
					if (totalRedeemed.length + 1 === (tier1 + tier2 + tier3 + tier4 + tier5)) {
						const newEventComplete = Event.build({
							type: 'completedUser',
							amount: 1,
							userId: findUser.id,
							transactionId: foundTran.id,
						})
						await newEventComplete.save();
					}
					//update store status
					foundNewStore.status = 'Effective'
					await findUser.save();
					await foundNewStore.save();

					const options = {
						type: "approved",
						number: foundTran.user.dataValues.number,
						code: assignVoucher.code,
						amount: assignVoucher.amount,
					};

					await sendMessage(options);
				}

			}
			if (findUser.status === 'Completed') {
				//update user status to repeat
				findUser.status = 'Repeat'
				await findUser.save();
			}
			//check Existing Event Sales/ SKU
			const checkEvent = await Event.findOne({ where: { retailerId: foundNewStore.id, transactionId: foundTran.id, type: 'sales' } })
			if (!checkEvent) {
				const newEventSales = Event.build({
					type: 'sales',
					amount: receiptAmount,
					userId: findUser.id,
					transactionId: foundTran.id,
					retailerId: foundNewStore.id,
				})
				const newEventSKU = Event.build({
					type: 'sku',
					amount: 1,
					userId: findUser.id,
					transactionId: foundTran.id,
					retailerId: foundNewStore.id,
				})
				await newEventSKU.save();
				await newEventSales.save()
			}
			//check existing activeStore event
			const checkActiveStore = await Event.findOne({ where: { type: 'activeStore', retailerId: foundStore.id } })
			if (!checkActiveStore) {
				const newEventStore = Event.build({
					type: 'activeStore',
					amount: 1,
					retailerId: foundNewStore.id,
					userId: findUser.id,
					transactionId: foundTran.id,
				})
				await newEventStore.save();

			}

			foundTran.status = status;
			foundTran.sales = receiptAmount;
			foundTran.state = state;
			foundTran.retailerId = foundNewStore.id;
			foundTran.promo = promo === 'YES' ? true : false;
			foundTran.nonproduct = nonproduct;
			foundTran.nonproductPrice = nonproductPrice;
			foundTran.validator_id = validatorId;
			foundTran.validator_name = validatorName;
			if (!foundTran.validated_date) {
				foundTran.validated_date = Date.now();
			}
			foundReceipt.invoice_No = receiptNumber;
			foundReceipt.amount = receiptAmount;
			foundReceipt.receiptDate = receiptDate;

			await foundTran.save();
			await foundReceipt.save();

			return res.status(200).json({ message: "Approved Success" });
		} else if (status === "Rejected") {

			if (foundTran.status !== "Approved") {

				const options1 = {
					type: "rejected",
					number: foundTran.user.dataValues.number,
					reason: reason,
					url: `https://temp.antlysis.com/welcome?store=${foundTran.retailerId ? foundTran.retailer.dataValues.id : ''}`, // REQUIRED : Update based on requirement
				};

				const options2 = {
					type: "rejected",
					number: foundTran.user.dataValues.number,
					reason: reason,
					url: `https://temp.antlysis.com/welcome?promoter=${foundTran.promoterId ? foundTran.promoter.dataValues.id : ''}`, // REQUIRED : Update based on requirement
				};
				await sendMessage(foundTran.promoterId ? options2 : options1);
				foundTran.status = status;
				foundTran.reason = reason;
			}

			// REQUIRED : Add save sku if have enter during validate
			foundTran.sales = receiptAmount;
			foundTran.state = state;
			foundTran.retailerId = foundStore.id;
			foundTran.promo = promo === 'YES' ? true : false;
			foundTran.nonproduct = nonproduct;
			foundTran.nonproductPrice = nonproductPrice;
			foundTran.validator_id = validatorId;
			foundTran.validator_name = validatorName;
			foundTran.validated_date = Date.now();

			foundReceipt.invoice_No = receiptNumber;
			foundReceipt.amount = receiptAmount;
			foundReceipt.receiptDate = receiptDate;

			await foundTran.save();
			await foundReceipt.save();
			return res.status(200).json({ message: "Rejected Success" });
		} else if (status === "Issue") {
			if (foundTran.status !== "Approved") {
				foundTran.status = status;
				foundTran.reason = reason;
			}
			foundTran.sales = receiptAmount;
			foundTran.state = state;
			foundTran.retailerId = foundStore.id
			foundTran.promo = promo === 'YES' ? true : false;
			foundTran.nonproduct = nonproduct;
			foundTran.nonproductPrice = nonproductPrice;
			foundTran.validator_id = validatorId;
			foundTran.validator_name = validatorName;
			foundTran.validated_date = Date.now();

			foundReceipt.invoice_No = receiptNumber;
			foundReceipt.amount = receiptAmount;
			foundReceipt.receiptDate = receiptDate;

			await foundTran.save();
			await foundReceipt.save();

			return res.status(200).json({ message: "Move to Issues" });
		}
		return res.status(200).json();
	} catch (error) {
		console.error("Error caught in admin receipt validation API");
		console.error(error);
		return res.status(400).json({ error: "Internal Error" });
	}
});

router.post("/getVoucherDetails",authenticate, async (req, res) => {
	const { token } = req.body;

	try {
		const totalVoucher = await Voucher.findAll({ where: { amount: 5 } });
		const usedVoucher = await Voucher.findAll({ where: { redeemed: true } });
		const remainVoucher = await Voucher.findAll({ where: { redeemed: false } });
		const entitled = await Reward.findAll({ where: { status: 'entitled' } });

		const data = [
			{
				amount: "RM 5",
				totalVoucher: totalVoucher.length,
				usedVoucher: usedVoucher.length,
				remainVoucher: remainVoucher.length,
				entitled: entitled.length
			},
		];
		return res.status(200).json({ data });

	} catch (error) {
		console.error("Error when verifying admin token");
		console.error(error);
		return res.status(400).json({ error: "Internal Error" });
	}
});

router.post("/getAllStores", async (req, res) => {
	const result = [];
	const stores = await Retailer.findAll({});

	for (let i = 0; i < stores.length; i++) {
		if (!result.includes(stores[i].name)) {
			result.push(stores[i].name);
		}
	}

	const mapStores = result.map((store) => ({
		label: store,
		value: store,
	}));
	res.status(200).json({ data: mapStores });
});
module.exports = router;
