const { Model, DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const { UUID, UUIDV4, STRING, DATE, BOOLEAN } = DataTypes;

class User extends Model {}

User.init(
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
			comment: "user name"
		},
		number: {
			type: STRING,
			primaryKey: true,
			unique: true,
			allowNull: false,
			comment: "user phone number"
		},
		email: {
			type: STRING,
			allowNull: false,
			comment: "user email address"
		},
		fingerprint_id: {
			type: STRING,
			allowNull: true,
			comment: "finger print of the user"
		},
		region: {
			type: STRING,
			allowNull: true,
			comment: "region of the user"
		},
		state: {
			type: STRING,
			allowNull: true,
			comment: "state of the user"
		},
		address: {
			type: STRING,
			allowNull: true,
			comment: "address of the user"
		},
		channel: {
			type: STRING,
			allowNull: true,
			comment: "Entry Channel of the user"
		},
		sub_channel: {
			type: STRING,
			allowNull: true,
			comment: "Sub Entry Channel of the user"
		},
		register_date: {
			type: DATE,
			allowNull: false,
			comment: "Registration Date of the user"
		},
		first_approve_date: {
			type: DATE,
			allowNull: true,
			comment: "First Approve Date of the user"
		},
		tier1_date: {
			type: DATE,
			allowNull: true,
			comment: "Tier 1 Date of the user"
		},
		tier2_date: {
			type: DATE,
			allowNull: true,
			comment: "Tier 2 Date of the user"
		},
		tier3_date: {
			type: DATE,
			allowNull: true,
			comment: "Last Tier Date of the user"
		},
		tier4_date: {
			type: DATE,
			allowNull: true,
			comment: "Last Tier Date of the user"
		},
		tier5_date: {
			type: DATE,
			allowNull: true,
			comment: "Last Tier Date of the user"
		},
		status: {
			type: STRING,
			allowNull: true,
			comment: "status of the user" /// Registered, Active, Completed
		},
		verified: {
			type: BOOLEAN,
			allowNull: true,
			defaultValue: false,
			comment: "Account is verified or not"
		}
	},
	{
		sequelize,
		timestamps: true,
		createdAt: true,
		updatedAt: true,
		comment: "To store all user details",
		tableName: "user",
		modelName: "user",
		indexes: [
			{
				fields: ["number"]
			}
		]
	}
);

module.exports = User;
