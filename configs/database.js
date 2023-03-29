const sequelize = require("./sequelize");
// forum
const User = require("./tables/user")
const Quota = require("./tables/quota")
const Item = require("./tables/item")
const Collection = require("./tables/collection")
const Transaction = require("./tables/transaction")
const SKU = require("./tables/sku")
const Retailer = require("./tables/retailer")
const Reward = require("./tables/reward")
const Receipt = require("./tables/receipt")
const Voucher = require("./tables/voucher")
const Scan = require("./tables/scan")
const Event = require("./tables/event")
const Gift = require("./tables/gift")
const DSR = require("./tables/dsr")
const POSM = require("./tables/posm")
const Visit = require("./tables/visit")
const Photo = require("./tables/photo")
const Promoter = require("./tables/promoter")
const Channel = require("./tables/channel")

// test database
sequelize
	.authenticate()
	.then(() => console.log("Connected to database success"))
	.catch(err => {
		console.error("Connection to database failed");
		console.error(err);
	});

// relationships & associations


//// Retailer ///////
DSR.hasMany(Retailer);
Retailer.belongsTo(DSR);
Promoter.hasMany(Retailer);
Retailer.belongsTo(Promoter);
Retailer.hasMany(Scan);
Scan.belongsTo(Retailer);

//// TRANSACTION //////
User.hasMany(Transaction);
Transaction.belongsTo(User);
Promoter.hasMany(Transaction);
Transaction.belongsTo(Promoter);
Retailer.hasMany(Transaction);
Transaction.belongsTo(Retailer);

Transaction.hasMany(Photo);
Photo.belongsTo(Transaction);
DSR.hasMany(Transaction);
Transaction.belongsTo(DSR);
//// USER /////
Promoter.hasMany(User);
User.hasMany(Promoter);
Retailer.hasMany(User);
User.belongsTo(Retailer);

DSR.hasMany(User);
User.belongsTo(DSR);
User.hasMany(Voucher);
Voucher.belongsTo(User);



///// Collection //////

Transaction.hasOne(Collection);
Collection.belongsTo(Transaction)
User.hasMany(Collection);
Collection.belongsTo(User);
Retailer.hasMany(Collection);
Collection.belongsTo(Retailer);
Promoter.hasMany(Reward);
Reward.belongsTo(Promoter);
///// Receipt //////

Transaction.hasMany(Receipt);
Receipt.belongsTo(Transaction);
Retailer.hasMany(Receipt);
Receipt.belongsTo(Retailer)
Channel.hasMany(Receipt);
Receipt.belongsTo(Channel)
Promoter.hasMany(Receipt);
Receipt.belongsTo(Promoter)

/////  ITEM //////
Transaction.hasMany(Item);
Item.belongsTo(Transaction);
SKU.hasMany(Item);
Item.belongsTo(SKU)

User.hasMany(Item);
Item.belongsTo(User);


///// RULES /////
Retailer.hasMany(Quota);
Quota.belongsTo(Retailer);


Reward.hasOne(Collection);
Collection.belongsTo(Reward);

/// REWARD /////
Transaction.hasMany(Reward);
Reward.belongsTo(Transaction);

User.hasMany(Reward);
Reward.belongsTo(User);

Retailer.hasMany(Reward);
Reward.belongsTo(Retailer);


DSR.hasMany(Reward);
Reward.belongsTo(DSR);

///// Gift //////

Reward.hasOne(Gift);
Gift.belongsTo(Reward);

Reward.hasOne(Voucher);
Voucher.belongsTo(Reward);

///// Event /////
Retailer.hasMany(Event);
Event.belongsTo(Retailer);

User.hasMany(Event);
Event.belongsTo(User);

Transaction.hasMany(Event);
Event.belongsTo(Transaction);

DSR.hasMany(Event);
Event.belongsTo(DSR);
Promoter.hasMany(Event);
Event.belongsTo(Promoter);

///// SCAN ////
Promoter.hasMany(Scan);
Scan.belongsTo(Promoter);
User.hasMany(Scan);
Scan.belongsTo(User);

DSR.hasMany(Scan);
Scan.belongsTo(DSR);

////// VISIT /////
Retailer.hasMany(Visit);
Visit.belongsTo(Retailer);

DSR.hasMany(Visit);
Visit.belongsTo(DSR);

///// POSM /////
DSR.hasMany(POSM);
POSM.belongsTo(DSR);

Retailer.hasMany(POSM);
POSM.belongsTo(Retailer);

// Channel
Channel.hasMany(Scan);
Scan.belongsTo(Channel);
Channel.hasMany(Event);
Event.belongsTo(Channel);
// sync table
// Scan
// 	.sync({ alter: true})
// 	.then(() => {
// 		console.log("Database synced");
// 		// console.log(data);
// 	})
// 	.catch(err => {
// 		console.error("Error when syncing database");
// 		console.error(err);
// 	});

module.exports = sequelize;
