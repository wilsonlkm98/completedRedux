const { Model, DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const { STRING, BOOLEAN, FLOAT, DATE } = DataTypes;

class Scan extends Model { }

Scan.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			unique: true
		},
		type: {
			type: STRING,

		},
		fingerprint: {  // client.getFingerprint()
			type: STRING,
			allowNull: true,
			comment: "fingerprint of scan"
		},
		browser: { //client.getBrowser()
			type: STRING,
			allowNull: true,
			comment: "broswer of scan"
		},
		mobile: { //client.device()
			type: STRING,
			allowNull: true,
			comment: "mobile of scan"
		}
	},
	{
		sequelize,
		timestamps: true,
		createdat: true,
		updatedat: true,
		comment: "To store all scan details",
		tableName: "scan",
		modelName: "scan"
	}
);

module.exports = Scan;
