const { Model, DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const { UUID, STRING, BOOLEAN, FLOAT } = DataTypes;

class DSR extends Model { }

DSR.init(
	{
		id: {
			type: UUID,
			primaryKey: true,
			unique: true
		},
		code: {
			type: STRING,
			allowNull: false,
			comment: "dsr code "
		},
		name: {
			type: STRING,
			allowNull: false,
			comment: "dsr name"
		},
		number: {
			type: STRING,
			allowNull: true,
			comment: "dsr phone number"
		},
		qrcode: {
			type: STRING,
			allowNull: true,
			comment: "dsr qrcode"
		},
		status: {
			type: STRING,
			allowNull: false,
			comment: "dsr status"
		},
		region: {
			type: STRING,
			allowNull: false,
			comment: "Region of the dsr"
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
		comment: "To store all dsr details",
		tableName: "dsr",
		modelName: "dsr"
	}
);

module.exports = DSR;
