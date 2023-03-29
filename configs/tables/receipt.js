const { Model, DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const { DATE, STRING, BOOLEAN, FLOAT, DATEONLY } = DataTypes;

class Receipt extends Model { }

Receipt.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			unique: true
		},
		receipt_date: {
			type: DATEONLY,
			allowNull: false,
			comment: "Receipt Date"
		},
		expired: {
			type: DATE,
			allowNull: true,
			comment: "Receipt Image expired"
		},
		url: {
			type: STRING,
			allowNull: true,
			comment: "Image Url"
		},

		amount: {
			type: FLOAT,
			allowNull: false,
			comment: "receipt amount"
		},
		image_key: {
			type: STRING,
			allowNull: false,
			comment: "Image Key for the Receipt"
		},
		invoice_No: {
			type: STRING,
			allowNull: false,
			comment: "Invoice_No of the Receipt"
		}
	},
	{
		sequelize,
		comment: "To store all receipt details",
		tableName: "receipt",
		modelName: "receipt"
	}
);

module.exports = Receipt;
