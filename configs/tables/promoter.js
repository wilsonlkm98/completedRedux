const { Model, DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const { UUID, UUIDV4, STRING, BOOLEAN, FLOAT } = DataTypes;

class Promoter extends Model { }

Promoter.init(
	{
		id: {
			type: UUID,
			primaryKey: true,
			unique: true,
			defaultValue: UUIDV4,
		},
		code: {
			type: STRING,
			allowNull: false,
			comment: "Promoter code "
		},
		name: {
			type: STRING,
			allowNull: false,
			comment: "promoter name"
		},
		number: {
			type: STRING,
			allowNull: true,
			comment: "promoter phone number"
		},
		qrcode: {
			type: STRING,
			allowNull: true,
			comment: "promoter qrcode"
		},
		status: {
			type: STRING,
			allowNull: true,
			comment: "promoter status"
		},
		trial_days: {
			type: FLOAT,
			allowNull: true,
			comment: "promoter trial days"
		},
		region: {
			type: STRING,
			allowNull: true,
			comment: "Region of the store"
		},
		city: {
			type: STRING,
			allowNull: true,
			comment: "City"
		},
		state: {
			type: STRING,
			allowNull: true,
			comment: "State"
		}
	},
	{
		sequelize,
		timestamps: true,
		createdAt: true,
		updatedAt: true,
		comment: "To store all promoter details",
		tableName: "promoter",
		modelName: "promoter"
	}
);

module.exports = Promoter;
