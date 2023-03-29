require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const User = require("../../../configs/tables/user");
const Item = require("../../../configs/tables/item");
const Otp = require("../../../configs/tables/otp");
const {
    registrationMessage,
} = require("../../../configs/function/dynamicController");
const { generateOtp, sendSMS } = require("../../../configs/function/sms");
const Transaction = require("../../../configs/tables/transaction");
const Receipt = require("../../../configs/tables/receipt");
const Reward = require("../../../configs/tables/reward");
const Voucher = require("../../../configs/tables/voucher");
const Retailer = require("../../../configs/tables/retailer");
const Event = require("../../../configs/tables/event");
const { authenticateStatus } = require("../../../configs/function/middlewares")

const fs = require("fs");
const { parse } = require("csv-parse");

const router = express.Router();

///CheckLogin
router.post("/login", (req, res) => {
    const { username, password } = req.body;


    console.log('req.body ----', req.body)
    try {
        // Add code here.
        if (username === 'admin' && password === 'admin') {
            console.log('Success');
            const data = {
                success: true,
                name: username,
                password: password,
                token: 'Tokentest123'
            }
            return res.status(200).json(data);
        }
        else {
            const errorMsg = 'Invalid username or password'
            console.log(errorMsg )
            const data = {
                error: errorMsg, 
                success: false
            }
            return res.status(400).json(data);
        }
    } 
    catch (error) {
        console.error(error);
        return res.status(400).json({ error: "Internal Error" });
    }
});

////Check Valid Store
// POST @-> /api/auth/checkqr
router.post("/checkqr", authenticateStatus, async (req, res) => {
    const { id, fingerprint, browser, mobile } = req.body;

    if (!id) {
        return res.status(400).json({ error: "Url is not defined.Please scan again" });
    }
    try {
        const checkStore = await Retailer.findByPk(id);
        if (!checkStore) {
            return res.status(400).json({ error: "Url is not defined.Please scan again" });
        }

        if (!checkStore.first_scan_date) {
            checkStore.first_scan_date = Date.now();
            await checkStore.save();
        }
        const newEventRegister = Event.build({
            type: "scan",
            amount: 1,
            retailerId: checkStore.id,
        });

        await newEventRegister.save();

        const newScan = Scan.build({
            fingerprint,
            browser,
            mobile,
            retailerId: checkStore.id
        });
        await newScan.save();

        return res.status(200).json({ data: checkStore });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Invalid QR Code" });
    }
});

//// check new/old user and sendOtp
// POST @-> /api/auth/checkUser
router.post("/checkUser", authenticateStatus, async (req, res) => {
    const { number } = req.body;
    if (!number) {
        res.status(400).json({ error: "Number not found" });
    }

    try {
        const findUser = await User.findOne({ where: { number } });
        if (!findUser) {
            return res.status(200).json({ identity: "register" });
        } else {
            if (findUser.verified === true) {
                const foundOtp = await Otp.findOne({ where: { number } });
                if (!foundOtp) {
                    generateOtp(async (otp) => {
                        const newOTP = Otp.build({
                            number,
                            otp,
                        });
                        const message = registrationMessage(otp);
                        if (!message) {
                            res.status(400).json({
                                error: "failed to get message",
                            });
                        }
                        const saveOtp = await newOTP.save();
                        if (saveOtp) {
                            sendSMS(saveOtp.number, message);
                            res.status(200).json({
                                message: "registered succes",
                                number,
                            });
                        } else {
                            res.status(400).json({
                                error: "failed to send otp.",
                            });
                        }
                    });
                    return res.status(200).json({ identity: "login" });
                } else {
                    generateOtp(async (otp) => {
                        foundOtp.otp = otp;
                        const message = registrationMessage(otp);
                        if (!message) {
                            res.status(400).json({
                                error: "failed to get message",
                            });
                        }
                        const saveOtp = await foundOtp.save();
                        if (saveOtp) {
                            sendSMS(saveOtp.number, message);
                        }
                    });
                    return res.status(200).json({ identity: "login" });
                }
            } else {
                return res.status(200).json({ identity: "register" });
            }
        }
    } catch (error) {
        console.error("Error caught in checkUser api");
        console.error(error);
        return res.status(400).json({ error: "Internal Error" });
    }
});

//// Register
// POST @-> /api/auth/register
router.post("/register", authenticateStatus, async (req, res) => {
    const { name, number, email, store } = req.body;
    if (!name || !number || !store)
        return res.status(400).json({
            error: "You have miss something",
        });

    try {
        const user = await User.findOne({ where: { number } });
        const checkStore = await Retailer.findOne({ where: { id: store } });

        if (!checkStore) {
            return res.status(400).json({ error: "Store not found!" });
        }

        if (user) {
            if (user.verified) {
                const foundOtp = await Otp.findOne({ where: { number } });
                if (!foundOtp) {
                    generateOtp(async (otp) => {
                        const newOTP = Otp.build({
                            number,
                            otp,
                        });
                        const message = registrationMessage(otp);
                        if (!message) {
                            res.status(400).json({
                                error: "failed to get message",
                            });
                        }
                        const saveOtp = await newOTP.save();
                        if (saveOtp) {
                            sendSMS(saveOtp.number, message);
                        }
                    });
                } else {
                    generateOtp(async (otp) => {
                        foundOtp.otp = otp;
                        const message = registrationMessage(otp);
                        if (!message) {
                            res.status(400).json({
                                error: "failed to get message",
                            });
                        }
                        const saveOtp = await foundOtp.save();
                        if (saveOtp) {
                            sendSMS(saveOtp.number, message);
                        }
                    });
                }
                return res.status(200).json({ user, message: "registered" });
            } else {
                user.name = name;
                user.email = email;
                await user.save();
                const foundOtp = await Otp.findOne({ where: { number } });
                if (!foundOtp) {
                    generateOtp(async (otp) => {
                        const newOTP = Otp.build({
                            number,
                            otp,
                        });
                        const message = registrationMessage(otp);
                        if (!message) {
                            res.status(400).json({
                                error: "failed to get message",
                            });
                        }
                        const saveOtp = await newOTP.save();
                        if (saveOtp) {
                            sendSMS(saveOtp.number, message);
                            res.status(200).json({
                                message: "registered",
                                number,
                            });
                        } else {
                            res.status(400).json({
                                error: "failed to send otp.",
                            });
                        }
                    });
                } else {
                    generateOtp(async (otp) => {
                        foundOtp.otp = otp;
                        const message = registrationMessage(otp);
                        if (!message) {
                            res.status(400).json({
                                error: "failed to get message",
                            });
                        }
                        const saveOtp = await foundOtp.save();
                        if (saveOtp) {
                            sendSMS(saveOtp.number, message);
                            res.status(200).json({
                                message: "registered",
                                number,
                            });
                        } else {
                            res.status(400).json({
                                error: "failed to send otp.",
                            });
                        }
                    });
                }
            }
        } else {
            try {
                const newUser = new User({
                    name,
                    number,
                    retailerId: store,
                    email: email ? email : "",
                    verify: false,
                    region: checkStore.region,
                    state: checkStore.state,
                    register_date: Date.now(),
                });
                await newUser.save();

                if (checkStore.status === "Inactive") {
                    checkStore.status = "Active";
                    await checkStore.save();
                }
                const foundOtp = await Otp.findOne({ where: { number } });
                if (!foundOtp) {
                    generateOtp(async (otp) => {
                        const newOTP = Otp.build({
                            number,
                            otp,
                        });
                        const message = registrationMessage(otp);
                        if (!message) {
                            res.status(400).json({
                                error: "failed to get message",
                            });
                        }
                        const saveOtp = await newOTP.save();
                        if (saveOtp) {
                            sendSMS(saveOtp.number, message);
                            res.status(200).json({
                                message: "registered",
                            });
                        } else {
                            res.status(400).json({
                                error: "failed to send otp.",
                            });
                        }
                    });
                } else {
                    generateOtp(async (otp) => {
                        foundOtp.otp = otp;
                        const message = registrationMessage(otp);
                        if (!message) {
                            res.status(400).json({
                                error: "failed to get message",
                            });
                        }
                        const saveOtp = await foundOtp.save();
                        if (saveOtp) {
                            sendSMS(saveOtp.number, message);
                            res.status(200).json({
                                message: "registered",
                                number,
                            });
                        } else {
                            res.status(400).json({
                                error: "failed to send otp.",
                            });
                        }
                    });
                }
            } catch (error) {
                console.error("Error caught in creating register api");
                console.error(error);
                return res.status(400).json({ error: "Internal Error" });
            }
        }
    } catch (error) {
        console.error("Error caught in register api");
        console.error(error);
        return res.status(400).json({ error: "Internal Error" });
    }
    // }
});

//// VERIFY
// POST @-> /api/auth/verify
router.post("/verify", authenticateStatus, async (req, res) => {
    const { number, otp } = req.body;
    if (!number || !otp)
        return res.status(400).json({ error: "You have miss something" });
    try {
        const foundOtp = await Otp.findOne({ where: { number } });
        if (!foundOtp) {
            generateOtp(async (otp) => {
                const newOTP = Otp.build({
                    number,
                    otp,
                });
                const message = registrationMessage(otp);
                if (!message) {
                    res.status(400).json({
                        error: "failed to get message",
                    });
                }
                const saveOtp = await newOTP.save();
                if (saveOtp) {
                    sendSMS(saveOtp.number, message);
                    res.status(400).json({
                        error:
                            "You OTP has already expired, we have sent you another OTP. Please try to verify again",
                    });
                } else {
                    console.log("Error sending OTP.");
                    res.status(400).json({
                        error: "failed to send otp.",
                    });
                }
            });
        } else {
            if (foundOtp.otp !== otp) {
                return res
                    .status(400)
                    .json({ error: "OTP incorrect, please try again" });
            } else {
                const getUser = await User.findOne({ where: { number } });
                if (!getUser) return res.status(400).json({ error: "User not found" });
                getUser.verified = true;
                getUser.status = "Registered";
                await getUser.save();

                const newEventRegister = Event.build({
                    type: "register",
                    amount: 1,
                    userId: getUser.id,
                });

                await newEventRegister.save();

                jwt.sign(
                    { id: getUser.id },
                    process.env.JWT_SECRET,
                    { expiresIn: "12h" },
                    (err, token) => {
                        if (err) {
                            console.error(
                                "Error when signing a jwt token in getUserInfo : \n",
                                err
                            );
                            callback("Internal Error", null);
                        }
                        const data = {
                            token,
                            user: getUser,
                            isAuthenticated: true,
                            message: "success",
                        };
                        // console.log(data.message);

                        return res.status(200).json(data);
                    }
                );
            }
        }
    } catch (error) {
        console.error("Error caught in verify api");
        console.error(error);
        return res.status(400).json({ error: "Internal Error" });
    }
});

//// RESEND OTP
// POST @-> /api/user/resend
router.post("/resendOtp", authenticateStatus, async (req, res) => {
    const { number } = req.body;
    const foundRecord = await User.findOne({ where: { number } });
    try {
        if (!foundRecord) {
            return res.status(400).json({
                error:
                    "This phone number doesn't have an account. Please head to sign up.",
            });
        } else {
            const checkOtp = await Otp.findOne({ where: { number } });
            if (!checkOtp) {
                generateOtp(async (otp) => {
                    const newOTP = Otp.build({
                        number,
                        otp,
                    });
                    const message = registrationMessage(otp);
                    if (!message) {
                        res.status(400).json({
                            error: "failed to get message",
                        });
                    }
                    const saveOtp = await newOTP.save();
                    if (saveOtp) {
                        sendSMS(saveOtp.number, message);
                        res.status(200).json({
                            message: "resend succes",
                        });
                    } else {
                        res.status(400).json({
                            error: "failed to send otp.",
                        });
                    }
                });
            } else {
                generateOtp(async (otp) => {
                    checkOtp.otp = otp;
                    const message = registrationMessage(otp);
                    if (!message) {
                        res.status(400).json({
                            error: "failed to get message",
                        });
                    }
                    const saveOtp = await checkOtp.save();
                    if (saveOtp) {
                        sendSMS(saveOtp.number, message);
                        res.status(200).json({
                            message: "resend succes",
                        });
                    } else {
                        console.log("Error sending OTP.");
                        res.status(400).json({
                            error: "failed to send otp.",
                        });
                    }
                });
            }
        }
    } catch (err) {
        console.log("Error when finding customer in resendOtp");
        console.log(err);
        return res.status(400).json({ error: "Internal Error" });
    }
});

////Check max voucher
// POST @-> /api/auth/checkMaxVoucher
router.post("/checkMaxVoucher", authenticateStatus, async (req, res) => {
    const { number } = req.body;
    if (!number) {
        return res.status(400).json({ error: "Number not found" });
    }
    const checkUser = await User.findOne({ where: { number } });
    if (!checkUser) {
        return res.status(400).json({ error: "User not found" });
    }
    const checkTransaction = await Transaction.findAll({
        where: { userId: checkUser.id, status: { [Op.ne]: "Rejected" } },
    });

    if (checkTransaction.length >= 10) {  // REQUIRED : change based on requirements
        return res
            .status(400)
            .json({ error: "You have reached the maximum uploads!" });
    }
    const checkVoucher = await Reward.findAll({
        where: { userId: checkUser.id }
    });

    if (checkVoucher.length >= 10) { // REQUIRED : change based on requirements
        return res
            .status(400)
            .json({ error: "You have redeemed max rewards!" });
    }
    const getPending = await Transaction.findAll({
        where: { userId: checkUser.id, status: "Pending" },
    });

    try {
        const voucher = await Voucher.findAll({
            where: {
                redeemed: false,
                rewardId: null,
            },
        });
        if (voucher.length) {
            const totalPending = await Transaction.findAll({
                where: { status: "Pending" },
            });

            const totalAva = voucher.length - totalPending.length;

            if (totalAva <= 0) {
                return res.status(400).json({ error: "Sorry, no more voucher left." });
            } else {
                return res.status(200).json({ message: "have available voucher" });
            }
        } else {
            return res.status(400).json({ error: "Sorry, no more voucher left." });
        }
    } catch (error) {
        return res.status(400).json({ error: "Internal Voucher Error" });
    }
});

//// Check Reward
// POST @-> /api/auth/checkreward
router.post("/reward", authenticateStatus, async (req, res) => {
    const { number } = req.body;
    let totalVoucher = [];
    if (!number) {
        return res.status(400).json({ error: "Number not found." });
    }
    try {
        const findUser = await User.findOne({ where: { number, verified: true } });
        if (!findUser) {
            return res.status(400).json({ error: "User not found." });
        }

        const getAllVoucher = await Voucher.findAll({ where: { redeemed: true } });
        const getAllReward = await Reward.findAll({
            where: { userId: findUser.id },
        });
        for (a = 0; a < getAllReward.length; a++) {
            let reward = getAllReward[a];
            const checkReward = getAllVoucher.filter((v) => v.rewardId === reward.id);
            if (checkReward) {
                totalVoucher.push(checkReward);
            }
        }

        return res.status(200).json({ data: totalVoucher });
    } catch (error) {
        return res.status(400).json({ error: "Internal Error" });
    }
});

// Import store using csv [Caution]
router.post("/importStoreList", authenticateStatus, async (req, res) => {
    let csvData = [];
    fs.createReadStream("./routes/api/relxqr.csv")
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on("data", function (row) {
            const filterData = {
                id: row[0],
                code: row[1],
                name: row[2],
                state: row[3],
                region: row[4],
            };
            console.log(filterData);
            csvData.push(filterData);
        })
        .on("end", function () {
            console.log("finished");
        })
        .on("error", function (error) {
            console.log(error.message);
        });
    // console.log(csvData);
    try {
        const getStore = await Retailer.findAll({});
        for (a = 0; a < csvData.length; a++) {
            let data = csvData[a];
            // const checkStore = getStore.filter((a) => a.name === data.name)[0];
            // console.log(data);
            // if (checkStore) {
            //   checkStore.region = data.region;
            //   checkStore.code = data.code;
            //   checkStore.state = data.state;
            //   await checkStore.save();
            // } else {
            const newStore = Retailer.build({
                id: data.id,
                name: data.name,
                code: data.code,
                state: data.state,
                region: data.region,
            });
            await newStore.save();
        }

        res.status(200).json({ message: "created" });
    } catch (error) {
        console.error("Error caught in create api");
        console.error(error);
        return res.status(400).json({ error: "Internal Error" });
    }
});

module.exports = router;
