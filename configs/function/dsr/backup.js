const { getDays2Active, differenceInDays, allWeek, allMonth, getNameMonth, weekNumber } = require('../../../configs/function/misc');


const dsrRegionReport = async(dsrs, progStart) => {
	let data = {
	}
	await processRegionDsr(data, dsrs, progStart)
	console.log("return data")
	// console.log(data)
	// return 123
	return data
}

const dsrSummaryReport = async(dsrs, progStart) => {
	let data = {
	}
	await processSummaryDsr(data, dsrs, progStart)
	console.log("return data")
	// console.log(data)
	// return 123
	return data
}

const dsrFullReport = async(dsrs, progStart) => {
	let data = []
	await processRawReport(data, dsrs, progStart)
	console.log("return data")
	// console.log(data)
	// return 123
	return data
}

const weeklyMonthlyReport = async(type, startDate, endDate, dsrs, progStart) => {
	let data = {
	}
	if(type == "Week") {
		let allWeeks = allWeek(startDate, endDate)
		allWeeks.push("Total")
		allWeeks.map(e=> {
			let key = ""
			if(e == "Total") {
				key = "Total"
			} else {
				key = "W"+e.weekNum
			}
			data[key] = {
				count: key,
				date: e.firstday+" - "+e.lastday,
				totalScan: 0,
				totalReg: 0,
				totalTier1: 0,
				totalTier2: 0,
				totalTier3: 0,
				totalTier4: 0,
				totalTier5: 0,
				totalTrans: 0,
				totalSales: 0,
				totalSoldUnit:0,
				totalStores: 0,
				totalDsrs: 0,
				totalActiveDsrs: 0,
				totalActiveUsers: 0
			}
		})
		await processWeekly(data, dsrs)
	} else if(type == "Month") {
		let sty = new Date(startDate).getFullYear()
		let edy = new Date(endDate).getFullYear()
		let allMonths = []
		if(sty != edy) {
			return null
		} else {
			allMonths = allMonth(startDate, endDate)
		}

		allMonths.push({month: 'Total', firstday: allMonths[0].firstday, lastday: allMonths[allMonths.length -1].lastday})
		allMonths.map(e=> {
			let key = ""
			key = e.month
			data[key] = {
				count: key,
				date: e.firstday+" - "+e.lastday,
				totalScan: 0,
				totalReg: 0,
				totalActiveUsers: 0,
				totalTier1: 0,
				totalTier2: 0,
				totalTier3: 0,
				totalTier4: 0,
				totalTier5: 0,
				totalTrans: 0,
				totalSales: 0,
				totalSoldUnit:0,
				totalStores: 0,
				totalDsrs: 0,
				totalActiveDsrs: 0,
				totalActiveUsers: 0
			}
		})
		await processMonthly(data, dsrs)
	}
	console.log("return data")
	// console.log(data)
	// return 123
	return data
}

//// Sub Functions //////
const processRawReport = async (data, dsrs, progStart) => {
	for(const dsr of dsrs) {
		for(const visit of dsr.visits) {
			let temp = {
				name: dsr.name,
				code: dsr.code,
				number: dsr.number,
				qrcode: dsr.qrcode,
				vistDate: visit.createdAt,
				storeName: visit.retailer.name,
				storeArea: visit.retailer.city,
				storeState: visit.retailer.state,
				storeRegion: visit.retailer.region,
				scanArea: visit.scanArea,
				scanState: visit.scanState,
				scanRegion: visit.scanRegion
			}
			data.push(temp)
		}
	}
}


const processRegionDsr = async (data, dsrs, progStart) => {
	data["total"] = {
		region: "Total",
		totalDsrs: 0,
		activeDsr: 0,
		activeDsrPercent: 0,
		effectiveDsr: 0,
		effectiveDsrPercent: 0,
		totalVisitDays: 0,
		totalScan: 0,
		totalReg: 0,
		activeUser: 0,
		completedUser: 0,
		entitledTier1: 0,
		entitledTier2: 0,
		entitledTier3: 0,
		entitledTier4: 0,
		entitledTier5: 0,
		repeatRedempt: 0,
		pendingPosm: 0,
		rejectedPosm: 0,
		deployedPosm: 0,
		posm1Deployment: 0,
		posm2Deployment: 0,
		posm3Deployment: 0,
		posm4Deployment: 0,
		posm5Deployment: 0,
		totalTrans: 0,
		totalTransWithPromo: 0,
		totalSales: 0,
	 	totalSoldUnit: 0
	}
	for(const dsr of dsrs) {
		//repearRedempt not done yet.
		if(!data[dsr.region]) {
			data[dsr.region] = {
				region: dsr.region,
				totalDsrs: 0,
				activeDsr: 0,
				activeDsrPercent: 0,
				effectiveDsr: 0,
				effectiveDsrPercent: 0,
				totalVisitDays: 0,
				totalScan: 0,
				totalReg: 0,
				activeUser: 0,
				completedUser: 0,
				entitledTier1: 0,
				entitledTier2: 0,
				entitledTier3: 0,
				entitledTier4: 0,
				entitledTier5: 0,
				repeatRedempt: 0,
				pendingPosm: 0,
				rejectedPosm: 0,
				deployedPosm: 0,
				posm1Deployment: 0,
				posm2Deployment: 0,
				posm3Deployment: 0,
				posm4Deployment: 0,
				posm5Deployment: 0,
				totalTrans: 0,
				totalTransWithPromo: 0,
				totalSales: 0,
			 	totalSoldUnit: 0
			}
		}
		data[dsr.region].totalDsrs++
		data[dsr.region].totalVisitDays += parseInt(dsr.dataValues.n_visits)
		// console.log(user.transactions)
		let dsractive = false
		for(const tran of dsr.transactions) {
			// console.log(tran)
			if(tran.status == "Approved") {
				dsractive = true
				data[dsr.region].totalTrans++
				data.total.totalTrans++
				data[dsr.region].totalSales = data[dsr.region].totalSales + parseInt(tran.sales)
				data.total.totalSales = data.total.totalSales + parseInt(tran.sales)
				data.total.totalSales.toFixed(2)
			}
			if(tran.status == "Approved" && tran.promo){
				data[dsr.region].totalTransWithPromo++
				data.total.totalTransWithPromo++ 
				data[dsr.region].totalTransWithPromoPercent = (data[dsr.region].totalTransWithPromo / data.total.totalTransWithPromo  * 100).toFixed(2)
			}
			data[dsr.region].totalSoldUnit = parseInt(tran.dataValues.n_items)
			data.total.totalSoldUnit = data.total.totalSoldUnit + data[dsr.region].totalSoldUnit
			// cbTran()
		}
			
		if(dsr.users.length > 0) {
			data[dsr.region].activeDsr++
			data.total.activeDsr++
			data[dsr.region].activeDsrPercent = (data[dsr.region].activeDsr / data[dsr.region].totalDsrs  * 100).toFixed(2)
			data[dsr.region].totalReg += dsr.users.length
			data.total.totalReg += dsr.users.length
		}
		if(dsractive) {
			data[dsr.region].activeDsr++
			data.total.activeDsr++
		}
		for (const posm of dsr.posms) {
			if(posm.status == "completed") {
				data[dsr.region].deployedPosm++
			} else if (posm.status == "pending") {
				data[dsr.region].pendingPosm++
			} else if (posm.status == "rejected") {
				data[dsr.region].rejectedPosm++
			}
			let key = "posm"+posm.number+"Deployment"
			data[dsr.region][key]++
		}
		let active = 0 
		let completed = 0
		dsr.users.map(e => {
			if(e.status == "Active") {
				active++
			} else if(e.status == "Completed"){
				completed++
			}
			if(e["tier1-date"]) {
				data[dsr.region].entitledTier1++
				data.total.entitledTier1++
			}
			if(e["tier2-date"]) {
				data[dsr.region].entitledTier2++
				data.total.entitledTier2++
			}
			if(e["tier3-date"]) {
				data[dsr.region].entitledTier3++
				data.total.entitledTier3++
			}
			if(e["tier4-date"]) {
				data[dsr.region].entitledTier4++
				data.total.entitledTier4++
			}
			if(e["tier5-date"]) {
				data[dsr.region].entitledTier5++
				data.total.entitledTier5++
			}
		})
		let approved = dsr.transactions.filter(e => {
			if(e.status == "Approved") return e
		})

		if(dsr.transactions.length > 0 && approved.length > 0) {
			data[dsr.region].effectiveDsr++
			data.total.effectiveDsr++
			data[dsr.region].effectiveDsrPercent = (data[dsr.region].effectiveDsr / data[dsr.region].totalDsrs  * 100).toFixed(2)
		}
		data[dsr.region].activeUser +=  active
		data[dsr.region].completedUser +=  completed
		data[dsr.region].totalScan = data[dsr.region].totalScan + parseInt(dsr.dataValues.n_scans)
		data.total.activeUser +=  active
		data.total.completedUser +=  completed
		data.total.totalScan = data.total.totalScan + parseInt(dsr.dataValues.n_scans)
	}
}

const processSummaryDsr = async (data, dsrs, progStart) => {
	for(const dsr of dsrs) {
		if(!data[dsr.code]) {
			data[dsr.code] = {
				name: dsr.name,
				code: dsr.code,
				qrcode: dsr.qrcode,
				number: dsr.number,
				status: dsr.status,
				visitDays: parseInt(dsr.dataValues.n_visits),
				region: dsr.region,
				state: dsr.state,
				totalScan: 0,
				totalReg: 0,
				activeUser: 0,
				entitledTier1: 0,
				entitledTier2: 0,
				entitledTier3: 0,
				entitledTier4: 0,
				entitledTier5: 0,
				repeatRedempt: 0,
				posmStatus: 0,
				posm1Deployment: 0,
				posm2Deployment: 0,
				posm3Deployment: 0,
				posm4Deployment: 0,
				posm5Deployment: 0,
				totalTrans: 0,
				totalTransWithPromo: 0,
				totalSales: 0,
				totalSoldUnit: 0
			}
			data.total = {
				trialDays: 0,
				totalScan: 0,
				totalReg: 0,
				activeUser: 0,
				entitledTier1: 0,
				entitledTier2: 0,
				entitledTier3: 0,
				entitledTier4: 0,
				entitledTier5: 0,
				repeatRedempt: 0,
				posmStatus: 0,
				posm1Deployment: 0,
				posm2Deployment: 0,
				posm3Deployment: 0,
				posm4Deployment: 0,
				posm5Deployment: 0,
				totalTrans: 0,
				totalTransWithPromo: 0,
				totalSales: 0,
				totalSoldUnit: 0
			}
		}
		let approved = dsr.transactions.filter(e => {
			if(e.status == "Approved") return e
		})
		dsr.users.map(e => {
			if(e.status == "Active") {
				data[dsr.code].activeUser++
			} else if(e.status == "Repeat"){
				data[dsr.code].repeatRedempt++
				data[dsr.code].completedUser++
			}  else if(e.status == "Completed"){
				data[dsr.code].completedUser++
			}
			if(e["tier1-date"]) {
				data[dsr.code].entitledTier1++
			}
			if(e["tier2-date"]) {
				data[dsr.code].entitledTier2++
			}
			if(e["tier3-date"]) {
				data[dsr.code].entitledTier3++
			}
			if(e["tier4-date"]) {
				data[dsr.code].entitledTier4++
			}
			if(e["tier5-date"]) {
				data[dsr.code].entitledTier5++
			}
		})
		data[dsr.code].totalScan += parseInt(dsr.dataValues.n_scans)
		data.total.activeUser +=  data[dsr.code].activeUser
		data.total.totalScan += parseInt(dsr.dataValues.n_scans)
		if(dsr.users.length > 0) {
			data[dsr.code].totalReg += dsr.users.length
			data.total.totalReg += dsr.users.length
		}
		for(const tran of dsr.transactions) {
			if(tran.status == "Approved") {
				data[dsr.code].totalTrans++
				data.total.totalTrans++
				data[dsr.code].totalSales += parseInt(tran.sales)
				data.total.totalSales += parseInt(tran.sales)
			}
			if(tran.status == "Approved" && tran.promo){
				data[dsr.code].totalTransWithPromo++
				data.total.totalTransWithPromo++
				data[dsr.code].totalTransWithPromoPercent = (data[dsr.code].totalTransWithPromo / data.total.totalTransWithPromo  * 100).toFixed(2)
			}
			data[dsr.code].totalSoldUnit = parseInt(tran.dataValues.n_items)
			data.total.totalSoldUnit += data[dsr.code].totalSoldUnit
		}
		for (const posm of dsr.posms) {
			data[dsr.code].posmStatus
			let key = "posm"+posm.number+"Deployment"
			data[dsr.code][key]++
		}
	}
}

const processWeekly = async (data, events) => {
	for(const event of events) {
		let myweek = weekNumber(event.createdAt)
		if(data["W"+myweek]) {
			switch(event.type) {
				case "scan":
				    data["W"+myweek].totalScan += event.amount
				    data["Total"].totalScan += event.amount
				    break;
				case "register":
				    data["W"+myweek].totalReg += event.amount
				    data["Total"].totalReg += event.amount
				    break;
				case "transaction":
				    data["W"+myweek].totalTrans += event.amount
				    data["Total"].totalTrans += event.amount
				    break;
				case "activeUser":
				    data["W"+myweek].totalActiveUsers += event.amount
				    data["Total"].totalActiveUsers += event.amount
				    break;
				case "tier1":
				    data["W"+myweek].totalTier1 += event.amount
				    data["W"+myweek].totalTier1 += event.amount
				    break;
				case "tier2":
				    data["W"+myweek].totalTier2 += event.amount
				    data["W"+myweek].totalTier2 += event.amount
				    break;
				case "tier3":
				    data["W"+myweek].totalTier3 += event.amount
				    data["W"+myweek].totalTier3 += event.amount
				    break;
				case "tier4":
				    data["W"+myweek].totalTier4 += event.amount
				    data["W"+myweek].totalTier4 += event.amount
				    break;
				case "tier5":
				    data["W"+myweek].totalTier5 += event.amount
				    data["W"+myweek].totalTier5 += event.amount
				    break;
				case "transaction":
				    data["W"+myweek].totalTrans += event.amount
				    data["W"+myweek].totalTrans += event.amount
				    break;  
				case "sales":
				    data["W"+myweek].totalSales += event.amount
				    data["W"+myweek].totalSales += event.amount
				    break;  
				case "soldUnit":
				    data["W"+myweek].totalSoldUnit += event.amount
				    data["W"+myweek].totalSoldUnit += event.amount
				    break;  
				case "activeDsr":
				    data["W"+myweek].totalActiveDsrs += event.amount
				    data["W"+myweek].totalActiveDsrs += event.amount
				    break; 
				default:
			    // code block
			} 
		}
	}
}

const processMonthly = async (data, events) => {
	for(const event of events) {
		let myMonth = getNameMonth(event.createdAt)
		if(data[myMonth]) {
			switch(event.type) {
				case "scan":
				    data[myMonth].totalScan += event.amount
				    data["Total"].totalScan += event.amount
				    break;
				case "register":
				    data[myMonth].totalReg += event.amount
				    data["Total"].totalReg += event.amount
				    break;
				case "activeUser":
				    data[myMonth].totalActiveUsers += event.amount
				    data["Total"].totalActiveUsers += event.amount
				    break;
				case "transaction":
				    data[myMonth].totalTrans += event.amount
				    data["Total"].totalTrans += event.amount
				    break;
				case "tier1":
				    data[myMonth].totalTier1 += event.amount
				    data["Total"].totalTier1 += event.amount
				    break;
				case "tier2":
				    data[myMonth].totalTier2 += event.amount
				    data["Total"].totalTier2 += event.amount
				    break;
				case "tier3":
				    data[myMonth].totalTier3 += event.amount
				    data["Total"].totalTier3 += event.amount
				    break;
				case "tier4":
				    data[myMonth].totalTier4 += event.amount
				    data["Total"].totalTier4 += event.amount
				    break;
				case "tier5":
				    data[myMonth].totalTier5 += event.amount
				    data["Total"].totalTier5 += event.amount
				    break;
				case "transaction":
				    data[myMonth].totalTrans += event.amount
				    data["Total"].totalTrans += event.amount
				    break;  
				case "sales":
				    data[myMonth].totalSales += event.amount
				    data["Total"].totalSales += event.amount
				    break;  
				case "soldUnit":
				    data[myMonth].totalSoldUnit += event.amount
				    data["Total"].totalSoldUnit += event.amount
				    break;  
				case "activeDsr":
				    data[myMonth].totalActiveDsrs += event.amount
				    data["Total"].totalActiveDsrs += event.amount
				    break; 
				default:
			    // code block
			} 
		}
	}
}	

module.exports = {
	dsrRegionReport,
	dsrSummaryReport,
	dsrFullReport,
	weeklyMonthlyReport
};