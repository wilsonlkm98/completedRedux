const { Model, DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const { STRING, BOOLEAN, FLOAT, DATE } = DataTypes;

class POSM extends Model { }

POSM.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			unique: true
		},
		number: {
			type: FLOAT,
			allowNull: true,
			comment: "order number of posm"
		},
		image: {
			type: STRING,
			allowNull: true,
			comment: "posm image"
		},
		imageno: {
			type: STRING,
			allowNull: true,
			comment: "posm image"
		},
		category: {
			type: STRING,
			allowNull: true,
			comment: "posm category"
		},
		reason: {
			type: STRING,
			allowNull: true,
			comment: "posm reason"
		},
		expired: {
			type: DATE,
			allowNull: true,
			comment: "POSM Image expired"
		},
		url: {
			type: STRING,
			allowNull: true,
			comment: "Image Url"
		},

		status: {
			type: STRING,
			allowNull: true,
			comment: "status of posm"
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
	},
	{
		sequelize,
		timestamps: true,
		createdat: true,
		updatedat: true,
		comment: "posm deployment details",
		tableName: "posm",
		modelName: "posm"
	}
);

module.exports = POSM;
