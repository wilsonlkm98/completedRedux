const { Model, DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const { DATE, STRING, BOOLEAN, FLOAT } = DataTypes;

class Collection extends Model {}

Collection.init(
	{
		id: {
			type: DataTypes.INTEGER,
		    autoIncrement: true,
		    primaryKey: true,
		    unique: true
		},
		amount: {
			type: FLOAT,
			allowNull: false,
			comment: "value collected"
		},
		collection_date: {
			type: DATE,
			allowNull: false,
			comment: "Collection Date"
		},
		type: {
			type: STRING,
			allowNull: false,
			comment: "type of collection"
		}
	},
	{
		sequelize,
		timestamps: true,
		createdat: true,
		updatedat: true,
		comment: "To store all points details",
		tableName: "collection",
		modelName: "collection"
	}
);

module.exports = Collection;
