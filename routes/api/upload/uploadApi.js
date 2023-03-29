require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const User = require("../../../configs/tables/user");
const { generateCode } = require("../../../configs/function/misc");
const Transaction = require("../../../configs/tables/transaction");
const Receipt = require("../../../configs/tables/receipt");
const Voucher = require("../../../configs/tables/voucher");
const Retailer = require("../../../configs/tables/retailer");
const Event = require("../../../configs/tables/event");
const Reward = require("../../../configs/tables/reward");

const { s3Upload } = require("../../../configs/function/aws");
const { authenticateStatus } = require("../../../configs/function/middlewares")

const router = express.Router();

//// UPLOAD RECEIPT
// POST @-> /api/receipt/upload
router.post("/upload", authenticateStatus, async (req, res) => {
    const {
        number,
        receiptNo,
        receiptDate,
        uri,
        fileType,
        receiptAmount,
        retailerId,
    } = req.body;

    if (
        !number || !receiptNo || !receiptDate || !uri || !fileType || !receiptAmount) {
        return res.status(400).json({ error: "Missing Input" });
    }

    const regex = /^data:image\/\w+;base64,/;
    const Body = Buffer.from(uri.replace(regex, ""), "base64");
    const Bucket = process.env.BUCKETNAME;
    const ContentType = fileType;
    const ContentEncoding = "base64";

    try {
        const checkUser = await User.findOne({
            where: { number, verified: true },
        });
        if (!checkUser) return res.status(400).json({ error: "User not found" });
        const checkStore = await Retailer.findOne({
            where: { id: retailerId },
        });
        if (!checkStore) return res.status(400).json({ error: "Store not found" });

        const foundVoucher = await Voucher.findAll({
            where: {
                redeemed: false,
                rewardId: null,
            },
        });
        const foundPending = await Transaction.findAll({
            where: { status: "Pending" },
        });
        const totalAvailable = foundVoucher.length - foundPending.length;
        if (totalAvailable <= 0) {
            return res
                .status(400)
                .json({ error: "VOUCHER IS NOT AVAILABLE WHEN UPLOADING RECEIPT" });
        }

        const Key = `${process.env.S3TYPE}/receipt/${checkUser.id
            }/${receiptNo}/${generateCode(6)}`;
        const param = {
            Bucket,
            Key,
            Body,
            ContentEncoding,
            ContentType,
        };

        s3Upload(param, async (err) => {
            if (err) {
                console.error("Error when uploading receipt to s3");
                return res.status(400).json({ error: "Internal Error" });
            }
            const newTransaction = Transaction.build({
                userId: checkUser.id,
                transaction_date: new Date(),
                sales: receiptAmount,
                retailerId,
                status: "Pending",
            });
            const savedTran = await newTransaction.save();
            if (savedTran) {
                const newReceipt = Receipt.build({
                    image_key: Key,
                    invoice_No: receiptNo,
                    amount: receiptAmount,
                    transactionId: savedTran.id,
                    retailerId,
                    receipt_date: receiptDate,
                });
                await newReceipt.save();

                const newEventUpload = Event.build({
                    type: 'transaction',
                    amount: 1,
                    userId: checkUser.id,
                    transactionId: savedTran.id,
                    retailerId,
                })

                await newEventUpload.save();

                return res.status(200).json({ message: "receipt uploaded" });
            } else {
                return res.status(400).json({ message: "error during uploaded" });
            }
        });
    } catch (error) {
        console.error("Error caught in upload receipt api");
        console.error(error);
        return res.status(400).json({ error: "Internal Error" });
    }
});

////  CHECK RECEIPT NO
// POST @-> /api/receipt/checkreceipt
router.post("/checkreceipt", authenticateStatus, async (req, res) => {
    const { date, receiptNo, receiptAmount } = req.body;

    try {
        const foundReceipt = await Receipt.findOne({
            where: { invoice_No: receiptNo, receipt_date: date },
        });
        if (foundReceipt) {
            const foundTransaction = await Transaction.findOne({
                where: { id: foundReceipt.transactionId, sales: receiptAmount, status: { [Op.ne]: "Rejected" } },
            });
            if (foundTransaction) {
                res.status(400).json({ error: "Duplicate Receipt No." });

            } else {
                res.status(200).json({ message: "Not found any duplicate" });
            }
        } else {
            res.status(200).json({ message: "Not found any duplicate" });
        }
    } catch (error) {
        console.error("Error caught in check receipt api");
        console.error(error);
        return res.status(400).json({ error: "Internal Error" });
    }
});

module.exports = router;
