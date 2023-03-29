const { Model, DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const { DATE, STRING, BOOLEAN, FLOAT } = DataTypes;

class Visit extends Model {}

Visit.init(
	{
		id: {
			type: DataTypes.INTEGER,
		    autoIncrement: true,
		    primaryKey: true,
		    unique: true
		},
		scan_area: {
			type: STRING,
			allowNull: false,
			comment: "Scan Area of DSR"
		},
		scan_state: {
			type: STRING,
			allowNull: false,
			comment: "Scan State of DSR"
		},
		scan_region: {
			type: STRING,
			allowNull: true,
			comment: "Scan Region of event"
		}
	},
	{
		sequelize,
		timestamps: true,
		createdat: true,
		updatedat: true,
		comment: "To store all visit details",
		tableName: "visit",
		modelName: "visit"
	}
);

module.exports = Visit;
