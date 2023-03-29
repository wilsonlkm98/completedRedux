const { Model, DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const { STRING, BOOLEAN, FLOAT } = DataTypes;

class Gift extends Model {}

Gift.init(
	{
		id: {
			type: DataTypes.INTEGER,
		    autoIncrement: true,
		    primaryKey: true,
		    unique: true
		},
		type: {
			type: STRING,
			allowNull: false,
			comment: "gift type, premium or voucher"
		},
		credit: {
			type: FLOAT,
			allowNull: false,
			comment: "redemption credit"
		},
		item_image: {
			type: STRING,
			allowNull: true,
			comment: "Item Image for the Gift"
		}
	},
	{
		sequelize,
		comment: "To store all gift details",
		tableName: "gift",
		modelName: "gift"
	}
);

module.exports = Gift;
