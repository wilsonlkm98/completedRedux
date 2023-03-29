require("dotenv").config();

const registrationMessage = otp => {
	return `Your OTP code is ${otp}`;
};

// export
module.exports = {
	registrationMessage
};
