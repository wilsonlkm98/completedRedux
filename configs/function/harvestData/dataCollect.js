const express = require('express');
const router = express.Router();

const Collection = require("../../../tables/collection");
const DSR = require("../../configs/tables/dsr");
const Form_generation = require("../../configs/tables/gift");
const Item = require("../../configs/tables/item");
const Promoter = require("../../configs/tables/promoter");
const Scan = require("../../configs/tables/scan");
const Quota = require("../../configs/tables/quota");
const Receipt = require("../../configs/tables/receipt");
const Retailer = require("../../configs/tables/retailer");
const Reward = require("../../configs/tables/reward");
const SKU = require("../../configs/tables/sku");
const Transaction = require("../../configs/tables/transaction");
const User = require("../../configs/tables/user");
const Gift = require("../../configs/tables/gift");
const Voucher = require("../../configs/tables/voucher");

/////// UPDATING USER DETAILS //////////////////////

const updateUserStatus = async (status, number) => {
	try {
		const user = await User.findOne({
			where: {
				number
			}
		})
		if (user) {
			user.status = status
			const savedUser = await user.save()
			return savedUser
		} else {
			throw Error("user not found when updating the user status")
		}
	} catch {
		throw Error("Error when update user status in catch")
	}
}

const updateUserTierDate = async (date, tier, number) => {
	try {
		const user = await User.findOne({
			where: {
				number
			}
		})
		let tierDate = tier + "_date"
		if (user) {
			if (user[tierDate]) {
				throw Error("user has already recorded " + tierDate + " date")
			} else {
				user[tierDate] = date
			}
			const savedUser = await user.save()
			return savedUser
		} else {
			throw Error("user not found when updating the user status")
		}
	} catch {
		throw Error("Error when update user tier in catch")
	}
}

///////// UPDATING SCAN DETAILS ///////////////////
const addNewScan = async (fingerprint, browser, mobile, retailerId) => {
	try {

		const newScan = Scan.build({
			fingerprint,
			browser,
			mobile
		})
		const user = await User.findOne({
			where: {
				fingerprint
			}
		})
		if (user) {
			newScan.userId = user.userId
			if (user.dsrId) newScan.dsrId = user.dsrId
		}
		if (retailerId) newScan.retailerId = retailerId
		if (promoterId) newScan.promoterId = promoterId
		const savedScan = await newScan.save()
		return savedScan
	} catch {
		throw Error("Error when add new scan in catch")
	}
}

///////// UPDATING EVENT DETAILS ///////////////////
///// tier1 - 5 => Fire when the user achieved Tier 1 - 5
///// soldunit => Fire when the transaction is been approved.
///// activeUser => Fire when the user turned Active
///// register => Fire when the user done registration
///// scan => Fire when scan event occured 
/////transaction => Fire when there is transaction is happen (May need to approved)
///// sales => Fire when there is transaction is been approved. 
//// activePromoter => Fire when the promoter get active
//// activeStore => Fire when the stores get active
//// activeDsr => Fire when the DSR get active
//// promoterId, retailerId and dsrId only needed for activePromoter/activeStore/activeDsr
const addNewEvent = async (type, amount, userId, promoterId, retailerId, dsrId) => {
	if (type != "activePromoter" || type != "activeStore" || type != "activeDsr") {
		if (!userId) {
			throw Error("Error when userId not found.")
		}
	} else {
		if (type == "activePromoter") {
			if (!promoterId) {
				throw Error("Error when promoterId not found.")
			}
		} else if (type == "activeStore") {
			if (!retailerId) {
				throw Error("Error when retailerId not found.")
			}
		} else if (type == "activeDsr") {
			if (!dsrId) {
				throw Error("Error when dsrId not found.")
			}
		}
	}
	try {
		const newEvent = Event.build({
			type,
			amount
		})
		if (type != "activePromoter" || type != "activeStore" || type != "activeDsr") {

			const user = await User.findOne({
				where: {
					id: userId
				}
			})
			if (user) {
				newEvent.userId = user.userId
				if (user.promoterId) newEvent.promoterId = user.promoterId
				if (user.dsrId) newEvent.dsrId = user.dsrId
				if (user.retailerId) newEvent.retailerId = user.retailerId
			} else {
				throw Error("Error when user not found")
			}
			const savedEvent = await newEvent.save()
			return savedEvent
		} catch {
			throw Error("Error when add new Event in catch")
		}
	}}