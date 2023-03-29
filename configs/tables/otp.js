const { Model, DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const {STRING, BOOLEAN, FLOAT } = DataTypes;

class Otp extends Model {}

Otp.init(
	{
		number: {
			type: STRING,
			allowNull: false,
			comment: "User number for receiving the otp"
		},
		otp: {
			type: STRING,
			allowNull: false,
			comment: "otp number"
		}
	},
	{
		sequelize,
		comment: "To store all otp records",
		tableName: "otp",
		modelName: "otp"
	}
);

module.exports = Otp;
