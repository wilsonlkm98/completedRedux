require("dotenv").config();
const express = require("express");
const User = require("../../../configs/tables/user");
const { generateOtp, sendSMS } = require("../../../configs/function/sms");
const { generateCode } = require("../../../configs/function/misc");
const SKU = require("../../../configs/tables/sku");


const router = express.Router();


router.post("/sku/create", async (req, res) => {
    const { brand, weight, name, desc, minQty } = req.body;

    try {
        const newSKU = SKU.build({
            brand,
            weight,
            name,
            desc,
            minQty,
        });
        await newSKU.save();
        return res
            .status(200)
            .json({ status: 200, message: "Saved to database successfully" });
    } catch (error) {
        console.error("Error caught in create sku api");
        console.error(error);
        return res.status(400).json({ error: "Internal Error" });
    }
});
module.exports = router;
