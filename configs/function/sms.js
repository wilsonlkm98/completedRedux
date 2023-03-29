/* eslint-disable no-console */
require('dotenv').config();

const Otp = require('../tables/otp');
const fetch = require('node-fetch')
const { APIUSERNAME, APIPASSWORD, NODE_ENV, SMSTYPE } = process.env;

const generateOtp = (callback) => {
  const max = 9999;
  const min = 1111;
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(`Generated OTP : ${otp}`);
  callback(otp);
};

const sendSMS = async (number, message) => {
  try {

    const smshubs = await fetch(`https://smshubs.net/api/sendsms.php?email=${APIUSERNAME}&key=${APIPASSWORD}&recipient=${number}&&message=${APICOMPANY}: ${message}`)
    // new - const smshubs = await fetch(`https://smshubs.net/api/sendsms.php?email=${APIUSERNAME}&key=${APIPASSWORD}&recipient=${number}&&message=${APICOMPANY}: ${message}`)

    if (NODE_ENV === "production" && SMSTYPE === 'SMSHUBS') {
      smshubs
    }
    console.log(smshubs)
  } catch (err) {
    console.error("Error when sending SMS : ");
    console.error(err);
  }
};

const sendMessage = async (options) => {
  const { type, number, amount, code, reason, url } = options;
  if (type === "verification") {
    const foundOtp = await Otp.findOne({ where: { number } });

    if (foundOtp) {
      const message = `Your one time verification code is ${foundOtp.otp}`;
      sendSMS(number, message);
      // console.log("foundOtp", foundOtp.otp)
      return;
    } else {
      const otp = generateOtp(4);
      const message = `Your one time verification code is ${otp}`;
      sendSMS(number, message);
      // console.log("foundOtp", otp)
      const newOtp = new Otp({
        number,
        otp,
      });
      newOtp.save();
      return;
    }
  }
  else if (type === "approved") {
    const message = `Congratulations! Your receipt was approved. The RM${amount} Touch 'n Go e-Wallet Reload Pin is ${code}.`;
    sendSMS(number, message);
    return;
  }
  else if (type === "rejected") {
    const message = `Please resubmit your receipt at: ${url} as your receipt is rejected due to ${reason}`;
    // Your receipt was rejected,because of ${reason}. Resubmit at this ${url}`
    // Rm0.00 Relx: Please resubmit your receipt at: [Link] as your receipt is rejected due to [Reason]
    sendSMS(number, message);
    return;
  }
  else {
    return;
  }
};
module.exports = {
  generateOtp,
  sendSMS,
  sendMessage,
};
