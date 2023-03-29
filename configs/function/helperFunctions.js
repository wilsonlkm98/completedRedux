const Point = require("../../configs/tables/point");
const Retailer = require("../../configs/tables/retailer");
const Transaction = require("../../configs/tables/transaction");
const User = require("../../configs/tables/user");
const SKU = require("../../configs/tables/sku");
const Item = require("../../configs/tables/item");
const Alloc = require("../../configs/tables/allocation");
const async = require("async");

const getRetailerPoints = (retailerId, callback) => {
	Point.findAll({
		include: {
			model: Retailer,
			as: "retailer",
			where: {
				id: retailerId
			}
		}
	})
		.then(points => {
			let allPoints = points.map(e => {
				return e.point;
			});
			let totalPoints = allPoints.reduce((a, b) => a + b, 0);
			callback(null, totalPoints);
		})
		.catch(err => {
			console.error("Error when finding all points");
			console.error(err);
			callback(err);
		});
};

const getRetailerRecords = (trans, callback) => {
	let allRecords = [];
	let sum = {
		totalReceipts: 0,
		noReceipts: 0,
		pending: 0,
		approved: 0,
		resubmit: 0
	};
	async.forEach(
		trans,
		(tran, cbtran) => {
			console.log(tran);
			let temp = {
				id: tran.id,
				name: tran.user.name,
				number: tran.user.number,
				receiptDate: tran.receiptdate,
				rebateAmount: tran.rebate,
				receiptStatus: tran.status
			};
			sum.totalReceipts += 1;
			if (tran.status == "pending") {
				sum.pending += 1;
			} else if (tran.status == "noReceipt") {
				sum.noReceipts += 1;
			} else if (tran.status == "approved") {
				sum.approved += 1;
			} else if (tran.status == "rejected") {
				sum.resubmit += 1;
				temp.reason = tran.reason;
			}
			allRecords.push(temp);
			cbtran();
		},
		err => {
			if (err) callback(err);
			callback(null, allRecords, sum);
		}
	);
};

const getUserRecord = (name, number, campaignId, retailerId, callback) => {
	let data = {
		name,
		number,
		totalRebate: 0,
		validity: {
			glucernaLiq: true
		}
	};
	SKU.findAll({ where: { campaignId } })
		.then(skus => {
			skus.map(e => {
				data[e.brand] = 0;
			});
			Transaction.findAll({
				where: { campaignId, retailerId },
				include: {
					model: User,
					as: "user",
					where: {
						number
					}
				}
			})
				.then(trans => {
					console.log(trans);
					async.forEach(
						trans,
						(tran, cbtran) => {
							if (tran.retailerId !== retailerId) {
								console.error("store code is different");
								callback("Store Code not match");
							} else {
								Item.findAll({ where: { transactionId: tran.id }, include: { model: SKU } }).then(items => {
									items.map(a => {
										data[a.sku.brand] += a.quantity;
									});
									data.totalRebate += tran.rebate;
									cbtran();
								});
							}
						},
						err => {
							callback(null, data);
						}
					);
				})
				.catch(err => {
					console.error("Error when finding all trans");
					console.error(err);
					callback(err);
				});
		})
		.catch(err => {
			console.error("Error when finding all skus");
			console.error(err);
			callback(err);
		});
};

const calculateRebate = (items, allUsedAlloc, allPoolUsedAlloc, poolNumber, rtl, trans, rebate, callback) => {
	console.log({ allUsedAlloc, allPoolUsedAlloc, poolNumber });
	const { ensure, glucerna, ensureMax, glucernaLiq, ensureLiq } = items;
	var incentive = 0;
	var myrebate = 0;
	var usedAlloc = 0;
	var remainingAlloc = 0;
	var batch = "First";
	var transType = "non-pool";
	var allBatches = [];
	let totalRebates = trans.map(e => {
		return e.rebate;
	});
	let totalensure = trans.map(e => {
		console.log(e.product);
		return e.product.ensure;
	});
	let totalglucerna = trans.map(e => {
		return e.product.glucerna;
	});
	let totalensureliq = trans.map(e => {
		return e.product.ensureLiq;
	});
	let totalglucernaLiq = trans.map(e => {
		if (e.product.glucernaLiq) {
			return e.product.glucernaLiq;
		} else {
			return 0;
		}
	});
	let totalensureMax = trans.map(e => {
		if (e.product.ensureMax) {
			return e.product.ensureMax;
		} else {
			return 0;
		}
	});
	let totalOldBig = totalensure.reduce((a, b) => a + b, 0) + totalglucerna.reduce((a, b) => a + b, 0);
	let totalOldSmall =
		totalensureliq.reduce((a, b) => a + b, 0) + totalglucernaLiq.reduce((a, b) => a + b, 0) + totalensureMax.reduce((a, b) => a + b, 0);
	let totalNewBig = totalensure.reduce((a, b) => a + b, 0) + totalglucerna.reduce((a, b) => a + b, 0) + ensure + glucerna;
	let totalNewSmall = totalensureliq.reduce((a, b) => a + b, 0) + ensureLiq + glucernaLiq + ensureMax;
	if (totalOldBig <= 2) {
		// less than 3
		batch = "First";
		allBatches.push(batch);
		if (totalNewBig >= 3) {
			console.log("deduct first allocation");
			// console.log(rtl.alloc)
			// let newAlloc =  rtl.r_alloc - 1
			// console.log(newAlloc)
			// rtl.r_alloc = newAlloc
			usedAlloc++;
			console.log(rtl.alloc);
		}
		if (totalNewBig >= 10) {
			console.log("deduct second allocation");
			// console.log(rtl.alloc)
			// let newAlloc =  rtl.r_alloc - 1
			// console.log(newAlloc)
			// rtl.r_alloc = newAlloc
			usedAlloc++;
			batch = "Second";
			allBatches.push(batch);
			console.log(rtl.alloc);
		}
	} else if (totalOldBig >= 3 && totalOldBig <= 9) {
		// more than 3 but less than 10
		batch = "First";
		allBatches.push(batch);
		if (totalNewBig >= 10) {
			console.log("deduct second allocation");
			// console.log(rtl.alloc)
			// let newAlloc =  rtl.r_alloc - 1
			// console.log(newAlloc)
			// rtl.r_alloc = newAlloc
			usedAlloc++;
			batch = "Second";
			allBatches.push(batch);
			console.log(rtl.alloc);
		}
	} else if (totalOldBig >= 10) {
		batch = "Second";
		allBatches.push(batch);
	}
	remainingAlloc = parseInt(rtl.alloc) - allUsedAlloc - usedAlloc;
	if (remainingAlloc == 0) {
	} else if (remainingAlloc < 0) {
		let currPoolUsed = allPoolUsedAlloc + usedAlloc;
		if (currPoolUsed > poolNumber) {
			callback("allocation used up");
		}
		transType = "pool";
	}
	let rebateAmt = totalRebates.reduce((a, b) => a + b, 0) + rebate;
	console.log(totalOldBig + ", " + totalOldSmall + ", " + totalNewBig + ", " + totalNewSmall);
	// 4 - 0
	if (totalOldSmall >= 1 && totalOldBig >= 3 && totalOldBig < 7) {
		console.log("already taken first btach RM4");
		if (totalNewBig >= 7) {
			console.log("valid for first batch RM40");
			myrebate += 40;
		}
		if (totalNewBig >= 10 && totalNewSmall >= 2) {
			console.log("valid for second batch RM4");
			myrebate += 4;
		}
		if (totalNewBig >= 14) {
			console.log("valid for second batch RM40");
			myrebate += 40;
		}
		console.log(myrebate);
		// 0 - 40
	} else if (totalOldSmall == 0 && totalOldBig >= 7 && totalOldBig < 14) {
		console.log("already taken first btach RM40");
		if (totalNewBig >= 3 && totalNewSmall >= 1) {
			console.log("valid for first btach RM4");
			myrebate += 4;
		}
		if (totalNewBig >= 10 && totalNewSmall >= 2) {
			console.log("valid for second batch RM4");
			myrebate += 4;
		}
		if (totalNewBig >= 14) {
			console.log("valid for second batch RM40");
			myrebate += 40;
		}
		console.log(myrebate);
		// 4 - 40  && 8 - 40 === can be 1, 7 = 2, 7 = 2, 8 = 2, 9 = 2, 10 = 2, 11 = 2, 12 = 2, 13 = 1, 8 = 1, 9 = 1, 10 = 1, 11 = 1, 12 = 1, 13
	} else if (totalOldSmall >= 1 && totalOldBig >= 7 && totalOldBig < 14) {
		if (totalOldSmall == 1) {
			console.log("already taken first batch RM44");
			if (totalNewBig >= 10 && totalNewSmall >= 2) {
				console.log("valid for second batch RM4");
				myrebate += 4;
			}
			if (totalNewBig >= 14) {
				console.log("valid for second batch RM40");
				myrebate += 40;
			}
		} else if (totalOldSmall >= 2) {
			console.log("already taken first batch RM44 and second batch RM4");
			if (totalNewBig >= 14) {
				console.log("valid for second batch RM40");
				myrebate += 40;
			}
		}
		console.log(myrebate);
		// // 8 - 40 can be 2, 10 = 2, 11 = 2, 12 = 2, 13
		// } else if (totalOldSmall >= 2 && totalOldBig >= 10 && totalOldBig < 14) {
		// 	console.log('already taken first batch RM44 and second batch RM4')
		// 	if(totalNewBig >= 14) {
		// 		console.log('valid for second batch RM40')
		// 		myrebate += 40
		// 	}
		// 	console.log(myrebate);
		// 4 - 80
	} else if (totalOldSmall == 1 && totalOldBig >= 14) {
		console.log("already taken first batch RM44 and second batch RM40");
		if (totalNewSmall >= 2) {
			console.log("valid for second btach RM4");
			myrebate += 4;
		}
		console.log(myrebate);
		// 0 - 80
	} else if (totalOldSmall == 0 && totalOldBig >= 14) {
		console.log("already taken first batch RM40 and second batch RM40");
		if (totalNewBig >= 3 && totalNewSmall >= 1) {
			console.log("valid for first batch RM4");
			myrebate += 4;
		}
		if (totalNewBig >= 10 && totalNewSmall >= 2) {
			console.log("valid for second batch RM4");
			myrebate += 4;
		}
		console.log(myrebate);
		// 8 - 80
	} else if (totalOldSmall >= 2 && totalOldBig >= 14) {
		console.log("already taken first batch RM44 and second batch RM44");
		console.log(myrebate);
		// 0 - 0
	} else if (totalOldSmall == 0 && totalOldBig < 7) {
		console.log("never take any rebate before");
		if (totalNewBig >= 3 && totalNewSmall >= 1) {
			console.log("valid for first batch RM4");
			myrebate += 4;
		}
		if (totalNewBig >= 7) {
			console.log("valid for first batch RM40");
			myrebate += 40;
		}
		if (totalNewBig >= 10 && totalNewSmall >= 2) {
			console.log("valid for second batch RM4");
			myrebate += 4;
		}
		if (totalNewBig >= 14) {
			console.log("valid for second batch RM40");
			myrebate += 40;
		}
		console.log(myrebate);
		// 0 - 0
	} else if (totalOldSmall > 0 && totalOldBig < 3) {
		console.log("never take any rebate before, but bought some liquid and ensure");
		if (totalNewBig >= 3 && totalNewSmall >= 1) {
			console.log("valid for first batch RM4");
			myrebate += 4;
		}
		if (totalNewBig >= 7) {
			console.log("valid for first batch RM40");
			myrebate += 40;
		}
		if (totalNewBig >= 10 && totalNewSmall >= 2) {
			console.log("valid for second batch RM4");
			myrebate += 4;
		}
		if (totalNewBig >= 14) {
			console.log("valid for second batch RM40");
			myrebate += 40;
		}
		console.log(myrebate);
	} else {
		console.log("condition mismatched");
	}
	if (myrebate != rebate) {
		console.log("rebate calculation is incorrect");
		callback("mismatched");
	} else {
		if (myrebate == 40 || myrebate == 44) {
			incentive = 6;
		} else if (myrebate == 80 || myrebate == 84 || myrebate == 88) {
			incentive = 12;
		}
		callback(null, incentive, myrebate, transType, allBatches);
	}
};

const calculateRebate_stc = (items, allUsedAlloc, allPoolUsedAlloc, poolNumber, validity, rtl, trans, rebate, callback) => {
	const { similac } = items;
	var incentive = 0;
	var myrebate = 0;
	var remainingAlloc = 0;
	var usedAlloc = 0;
	var transType = "non-pool";
	let totalRebates = trans.map(e => {
		return e.rebate;
	});
	let totalsimilac = trans.map(e => {
		// console.log(e.product)
		return e.product.similac;
	});
	if (validity.similac) {
		if (similac >= 1) {
			console.log("valid for similac");
			myrebate += 10;
			usedAlloc++;
		} else {
			console.log("purchased similac before");
		}
	}
	if (usedAlloc) {
		remainingAlloc = parseInt(rtl.alloc) - allUsedAlloc - usedAlloc;
		if (remainingAlloc == 0) {
		} else if (remainingAlloc < 0) {
			let currPoolUsed = allPoolUsedAlloc + usedAlloc;
			if (currPoolUsed > poolNumber) {
				callback("allocation used up");
			}
			transType = "pool";
		}
	}
	if (myrebate != rebate) {
		console.log("rebate calculation is incorrect");
		callback("mismatched");
	} else {
		if (myrebate >= 10 && totalRebates == 0) {
			incentive = 10;
		}
		callback(null, incentive, usedAlloc, transType);
	}
};

const calculateRebate_adult = (items, allUsedAlloc, allPoolUsedAlloc, quota, poolNumber, validity, rtl, trans, rebate, callback) => {
	const { ensure, glucerna, ensureLiq, glucernaLiq } = items;
	var incentive = 0;
	var myrebate = 0;
	var remainingAlloc = 0;
	var usedAlloc = 0;
	var transType = "non-pool";
	let totalRebates = trans.map(e => {
		return e.rebate;
	});
	let totalensure = trans.map(e => {
		// console.log(e.product)
		return e.product.ensure;
	});
	let totalglucerna = trans.map(a => {
		return a.product.glucerna
	})
	let totalSmall = trans.map(b = > {
		return parseInt(b.product.ensureLiq) + parseInt(b.product.glucernaLiq)
	})
	if (validity.similac) {
		if (ensure >= 1 && glucerna == 0 && (emsureLiq + glucernaliq) == 0) {
			console.log("valid for ensure");
			myrebate += 10;
			usedAlloc++;
		} else if (ensure == 0 && glucerna >= 1 && (emsureLiq + glucernaliq) == 0) { 
			console.log("valid for glucerna");
			myrebate += 10;
			usedAlloc++;
		} else if ((ensure == 1 || glucerna >= 1) && (emsureLiq >= 1 || glucernaliq >=1)) { 
			console.log("valid for combine");
			myrebate += 12;
			usedAlloc++;
	}
	if (usedAlloc) {
		remainingAlloc = parseInt(rtl.alloc) - allUsedAlloc - usedAlloc;
		if (remainingAlloc == 0) {
		} else if (remainingAlloc < 0) {
			let currPoolUsed = allPoolUsedAlloc + usedAlloc;
			let currAlloc = poolNumber + quota
			if (currPoolUsed > poolNumber) {
				callback("allocation used up");
			}
			transType = "pool";
		}
	}
	if (myrebate != rebate) {
		console.log("rebate calculation is incorrect");
		callback("mismatched");
	} else {
		if (myrebate >= 10 && totalRebates == 0) {
			/// check Incentive report
			incentive = 10;
		}
		callback(null, incentive, usedAlloc, transType);
	}
};

const createAlloc = (userId, batch, transId, callback) => {
	Alloc.findOne({
		where: { batch },
		include: {
			model: User,
			as: "user",
			where: { id: userId }
		}
	})
		.then(myalloc => {
			if (myalloc) {
				let alltrans = JSON.parse(myalloc.transId);
				alltrans.push(transId);
				let strTransId = JSON.stringify(alltrans);
				myalloc.transId = strTransId;
				callback(myalloc);
			} else {
				let newalloc = {
					status: "Incompleted",
					batch,
					userId,
					transId: JSON.stringify([transId])
				};
				const myTran = Alloc.build(newalloc);
				myTran
					.save()
					.then(savedTran => {
						callback(savedTran);
					})
					.catch(err => {
						console.error("Error when creating new allocation");
						console.error(err);
						return res.status(400).json({ error: "Internal Error" });
					});
			}
		})
		.catch(err => {
			console.error("Error when finding allocation");
			console.error(err);
			return res.status(400).json({ error: "Internal Error" });
		});
};

const calculateRebate_sgs = (items, allUsedAlloc, allPoolUsedAlloc, poolNumber, validity, rtl, trans, rebate, callback) => {
	const { glucernaLiq } = items;
	var incentive = 0;
	var myrebate = 0;
	var remainingAlloc = 0;
	var usedAlloc = 0;
	var transType = "non-pool";
	let totalRebates = trans.map(e => {
		return e.rebate;
	});
	let totalsimilac = trans.map(e => {
		// console.log(e.product)
		return e.product.similac;
	});
	if (validity.glucernaLiq) {
		if (glucernaLiq >= 1) {
			console.log("valid for similac");
			myrebate += 3;
			usedAlloc++;
		} else {
			console.log("purchased similac before");
		}
	}
	if (usedAlloc) {
		remainingAlloc = parseInt(rtl.alloc) - allUsedAlloc - usedAlloc;
		if (remainingAlloc == 0) {
		} else if (remainingAlloc < 0) {
			let currPoolUsed = allPoolUsedAlloc + usedAlloc;
			if (currPoolUsed > poolNumber) {
				callback("allocation used up");
			}
			transType = "pool";
		}
	}
	if (myrebate != rebate) {
		console.log("rebate calculation is incorrect");
		callback("mismatched");
	} else {
		if (myrebate >= 3 && totalRebates == 0) {
			incentive = 1;
		}
		callback(null, incentive, usedAlloc, transType);
	}
};

module.exports = {
	getRetailerPoints,
	getRetailerRecords,
	calculateRebate_stc,
	getUserRecord,
	calculateRebate,
	createAlloc,
	calculateRebate_sgs,
	calculateRebate_adult
};
