const { Model, DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const { UUID, UUIDV4, STRING, BOOLEAN, FLOAT, DATE } = DataTypes;

class Retailer extends Model { }

Retailer.init(
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
			comment: "store code "
		},
		name: {
			type: STRING,
			allowNull: false,
			comment: "store name"
		},
		store_type: {
			type: STRING,
			allowNull: true,
			comment: "store type"
		},
		qrcode: {
			type: STRING,
			allowNull: true,
			comment: "qrcode of the store"
		},
		region: {
			type: STRING,
			allowNull: false,
			comment: "Region of the store"
		},
		address: {
			type: STRING,
			allowNull: true,
			comment: "Address"
		},
		number: {
			type: FLOAT,
			allowNull: true,
			comment: "Retailer Login"
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
			comment: "Status of the retailer"
		},
		first_scan_date: {
			type: DATE,
			allowNull: true,
			comment: "First Scan Date of the retailer"
		},
		last_activity_date: {
			type: DATE,
			allowNull: true,
			comment: "last activity Date of the retailer"
		},
		registration_date: {
			type: DATE,
			allowNull: true,
			comment: "Registration Date of the retailer"
		}
	},
	{
		sequelize,
		timestamps: true,
		createdAt: true,
		updatedAt: true,
		comment: "To store all retailer details",
		tableName: "retailer",
		modelName: "retailer"
	}
);

module.exports = Retailer;
