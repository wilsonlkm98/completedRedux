const { Model, DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const { UUID, UUIDV4, STRING, BOOLEAN, FLOAT } = DataTypes;

class Quota extends Model {}

Quota.init(
	{
		id: {
			type: DataTypes.INTEGER,
		    autoIncrement: true,
		    primaryKey: true,
		    unique: true
		},
		quantity: {
			type: FLOAT,
			allowNull: false,
			comment: "quantity of retailer quota"
		}
	},
	{
		sequelize,
		timestamps: true,
		createdAt: true,
		updatedAt: true,
		comment: "To store all retailer quota",
		tableName: "quota",
		modelName: "quota"
	}
);

module.exports = Quota;
