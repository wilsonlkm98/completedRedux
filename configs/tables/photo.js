const { Model, DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const { DATE, STRING, BOOLEAN, FLOAT, DATEONLY } = DataTypes;

class Photo extends Model { }

Photo.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			unique: true
		},
		expired: {
			type: DATE,
			allowNull: true,
			comment: "Photo Image expired"
		},
		url: {
			type: STRING,
			allowNull: true,
			comment: "Photo Image Url"
		},
		image_key: {
			type: STRING,
			allowNull: false,
			comment: "Image Key for the Photo"
		},
	},
	{
		sequelize,
		comment: "To store all photo details",
		tableName: "photo",
		modelName: "photo"
	}
);

module.exports = Photo;
