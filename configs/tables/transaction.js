const { Model, DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const { STRING, BOOLEAN, FLOAT, DATE } = DataTypes;

class Transaction extends Model { }

Transaction.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			unique: true
		},
		status: {
			type: STRING,
			allowNull: false,
			comment: "status of transaction"
		},
		reason: {
			type: STRING,
			allowNull: true,
			comment: "reason of validate"
		},
		device: {
			type: STRING,
			allowNull: true,
			comment: "devices"
		},
		sales: {
			type: FLOAT,
			allowNull: false,
			comment: "sales of this transaction"
		},
		transaction_date: {
			type: DATE,
			allowNull: false,
			comment: "incentive to the store"
		},
		promo: {
			type: BOOLEAN,
			allowNull: true,
			comment: "promo status of transaction"
		},
		nonproduct: {
			type: STRING,
			allowNull: true,
			comment: "Non participating product of this transaction"
		},
		nonproductPrice: {
			type: FLOAT,
			allowNull: true,
			comment: "Non participating product price of this transaction"
		},
		state: {
			type: STRING,
			allowNull: true,
			comment: "State of this transaction"
		},
		validator_name: {
			type: STRING,
			allowNull: true,
			comment: "validator name"
		},
		validator_id: {
			type: STRING,
			allowNull: true,
			comment: "validator Id date"
		},
		validated_date: {
			type: DATE,
			allowNull: true,
			comment: "validation date"
		},
		category: {
			type: STRING,
			allowNull: true,
			comment: "category of the transaction"
		}
	},
	{
		sequelize,
		timestamps: true,
		createdat: true,
		updatedat: true,
		comment: "To store all transaction details",
		tableName: "transaction",
		modelName: "transaction"
	}
);

module.exports = Transaction;
