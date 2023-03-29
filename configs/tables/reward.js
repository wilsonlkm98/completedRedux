const { Model, DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const { DATE, STRING, BOOLEAN, FLOAT } = DataTypes;

class Reward extends Model { }

Reward.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			unique: true
		},
		name: {
			type: STRING,
			allowNull: false,
			comment: "gift item name "
		},
		type: {
			type: STRING,
			allowNull: false,
			comment: "type of item "
		},
		redemption_date: {
			type: DATE,
			allowNull: true,
			comment: "Redemption Date of the rewards"
		},
		_entitlement_date: {
			type: DATE,
			allowNull: true,
			comment: "Entitlement Date of the rewards"
		},
		amount: {
			type: FLOAT,
			comment: "amount"
		},
		stock: {
			type: FLOAT,
			defaultValue: 0,
			comment: "inventory stock"
		},
		active: {
			type: BOOLEAN,
			defaultValue: false,
			comment: "allow to be redeemed"
		},
		status: {
			type: STRING,
			allowNull: false,
			comment: "status of the reward"
		}
	},
	{
		sequelize,
		timestamps: true,
		createdAt: true,
		updatedAt: true,
		comment: "To store all reward details",
		tableName: "reward",
		modelName: "reward"
	}
);

module.exports = Reward;
