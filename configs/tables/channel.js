const { Model, DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const { UUID, UUIDV4, STRING, BOOLEAN, FLOAT, DATE } = DataTypes;

class Channel extends Model { }

Channel.init(
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
			comment: "channel code "
		},
		name: {
			type: STRING,
			allowNull: false,
			comment: "channel name"
		},
		type: {
			type: STRING,
			allowNull: true,
			comment: "channel type"
		},
		qrcode: {
			type: STRING,
			allowNull: true,
			comment: "qrcode of the channel"
		},
		region: {
			type: STRING,
			allowNull: true,
			comment: "Region of the channel"
		},
		address: {
			type: STRING,
			allowNull: true,
			comment: "Address"
		},
		number: {
			type: FLOAT,
			allowNull: true,
			comment: "channel Login"
		},
		area: {
			type: STRING,
			allowNull: true,
			comment: "Area"
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
		},
		postcode: {
			type: STRING,
			allowNull: true,
			comment: "Post Code"
		},
		status: {
			type: STRING,
			allowNull: true,
			comment: "Status of the channel"
		},
		first_scan_date: {
			type: DATE,
			allowNull: true,
			comment: "First Scan Date of the channel"
		},
		last_activity_date: {
			type: DATE,
			allowNull: true,
			comment: "last activity Date of the channel"
		},
		registration_date: {
			type: DATE,
			allowNull: true,
			comment: "Registration Date of the channel"
		}
	},
	{
		sequelize,
		timestamps: true,
		createdAt: true,
		updatedAt: true,
		comment: "To store all channel details",
		tableName: "channel",
		modelName: "channel"
	}
);

module.exports = Channel;
