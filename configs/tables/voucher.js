const { Model, DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const { STRING, BOOLEAN, FLOAT, DATE } = DataTypes;

class Voucher extends Model { }

Voucher.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			unique: true
		},
		type: {
			type: STRING,
			allowNull: true,
			comment: "type of the voucher"
		},
		code: {
			type: STRING,
			allowNull: true,
			comment: "code of the voucher"
		},
		amount: {
			type: FLOAT,
			allowNull: false,
			comment: "amount of the voucher"
		},
		redeemed: {
			type: BOOLEAN,
			allowNull: false,
			comment: "redemption of the voucher"
		},
		redeemedDate: {
			type: DATE,
		},
		reserved: {
			type: BOOLEAN,
			default: false,
		},
		reservedDate: {
			type: DATE,
		},
		
	},
	{
		sequelize,
		timestamps: true,
		createdAt: true,
		updatedAt: true,
		comment: "To store all voucher details",
		tableName: "voucher",
		modelName: "voucher"
	}
);

module.exports = Voucher;
