const {
  getDays2Active,
  differenceInDays,
  allWeek,
  allMonth,
  getNameMonth,
  weekNumber,
} = require('../misc');

const moment = require('moment');

const retailerRegionReport = async (retailers, progStart) => {
  const data = {};
  await processRegionRetailer(data, retailers, progStart);

  return data;
};

const retailerSummaryReport = async (retailers, progStart) => {
  const data = {};
  await processSummaryRetailer(data, retailers, progStart);
  return data;
};

const retailerStorePerformance = async (retailers, progStart) => {
  const data = {};
  await processStorePerformance(data, retailers, progStart);

  // console.log(data)
  // return 123
  return data;
};

const weeklyMonthlyReport = async (type, startDate, endDate, events) => {
  const data = {};
  // console.log({ type, startDate, endDate });
  if (type == 'Week') {
    const allWeeks = allWeek(startDate, endDate);
    allWeeks.push('Total');
    allWeeks.map((e, i) => {
      let key = '';
      if (e == 'Total') {
        key = 'Total';
      } else {
        key = `W${i + 1}`;
      }
      data[key] = {
        count: key,
        date: e === 'Total' ? '' : `${e.firstday} - ${e.lastday}`,
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
        totalSoldUnit: 0,
        totalStores: 0,
        totalDSRs: 0,
        totalPromoters: 0,
        totalActiveStores: 0,
        totalActiveUsers: 0,
      };
    });
    await processWeekly(data, events);
  } else if (type == 'Month') {
    const sty = new Date(startDate).getFullYear();
    const edy = new Date(endDate).getFullYear();
    let allMonths = [];
    if (sty != edy) {
      return null;
    }
    allMonths = allMonth(startDate, endDate);

    // console.log({ type, startDate, endDate });
    allMonths.push({
      month: 'Total',
      firstday: allMonths[0].firstday,
      lastday: allMonths[allMonths.length + 1].lastday,
    });
    allMonths.map((e) => {
      let key = '';
      key = e.month;
      data[key] = {
        count: key,
        date: `${e.firstday} - ${e.lastday}`,
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
        totalSoldUnit: 0,
        totalStores: 0,
        totalDSRs: 0,
        totalPromoters: 0,
        totalActiveStores: 0,
      };
    });
    await processMonthly(data, events);
  }
  console.log('return data');
  // console.log(data)
  // return 123
  return data;
};

//// Sub Functions //////
const processRegionRetailer = async (data, retailers, progStart) => {
  data.total = {
    region: 'Total',
    totalStore: 0,
    activeStore: 0,
    activeStorePercent: 0,
    effectiveStore: 0,
    effectiveStorePercent: 0,
    daysActivate: 0,
    avgDaysActivate: 0,
    avgActiveDuration: 0,
    targetAlloc: 0,
    completedAlloc: null,
    reservedAlloc: null,
    remainingAlloc: 0,
    totalScan: 0,
    totalReg: 0,
    activeUser: 0,
    completedUser: 0,
    entitledHighest: 0,
    repeatRedempt: 0,
    totalTrans: 0,
    totalTransWithPromo: 0,
    totalSales: 0,
    totalSoldUnit: 0,
    transPerUser: 0,
    salesPerUser: 0,
    soldUnitPerUser: 0,
    basketSizeSales: 0,
    basketSizeQty: 0,
    totalTransWithPromoPercent: 0,
    deployDays: 0,
    regPerDeployDays: 0,
    activePerDeployDays: 0,
    completedPerDeployDays: 0,
    salesPerDeployDays: 0,
    soldUnitPerDeployDays: 0,
    scanRegRate: 0,
    regActiveRate: 0,
    entitledTier1: 0,
    entitledTier2: 0,
    entitledTier3: 0,
    entitledTier4: 0,
    entitledTier5: 0,
    regTier1Rate: 0,
    regTier2Rate: 0,
    regTier3Rate: 0,
    regTier4Rate: 0,
    regTier5Rate: 0,
    regEntiledRate: 0,
  };
  for (const retailer of retailers) {
    // console.log({quota: retailer.dataValues.n_scans})
    const key = {};
    (key.keyStr = retailer.region), (key.name = retailer.region);
    if (!data[key.keyStr]) {
      data[key.keyStr] = {
        region: key.name,
        totalStore: 0,
        activeStore: 0,
        activeStorePercent: 0,
        effectiveStore: 0,
        effectiveStorePercent: 0,
        daysActivate: 0,
        avgDaysActivate: 0,
        avgActiveDuration: 0,
        targetAlloc: 0,
        completedAlloc: null,
        reservedAlloc: null,
        remainingAlloc: 0,
        totalScan: 0,
        totalReg: 0,
        activeUser: 0,
        completedUser: 0,
        entitledHighest: 0,
        repeatRedempt: 0,
        totalTrans: 0,
        totalTransWithPromo: 0,
        totalSales: 0,
        totalSoldUnit: 0,
        transPerUser: 0,
        salesPerUser: 0,
        soldUnitPerUser: 0,
        basketSizeSales: 0,
        basketSizeQty: 0,
        totalTransWithPromoPercent: 0,
        deployDays: 0,
        regPerDeployDays: 0,
        activePerDeployDays: 0,
        completedPerDeployDays: 0,
        salesPerDeployDays: 0,
        soldUnitPerDeployDays: 0,
        scanRegRate: 0,
        regActiveRate: 0,
        entitledTier1: 0,
        entitledTier2: 0,
        entitledTier3: 0,
        entitledTier4: 0,
        entitledTier5: 0,
        regTier1Rate: 0,
        regTier2Rate: 0,
        regTier3Rate: 0,
        regTier4Rate: 0,
        regTier5Rate: 0,
        regEntiledRate: 0,
      };
    }
    data[retailer.region].totalStore++;
    data.total.totalStore++;

    const deployDays = differenceInDays(retailer['first_scan_date'], null);
    data[retailer.region].deployDays += deployDays;
    data.total.deployDays += deployDays;
    let lastActivityDate = new Date(progStart);

    if (retailer.users.length > 0) {
      const firstActiveDate = retailer.users.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )[0];
      const lastRegDate = retailer.users.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )[retailer.users.length - 1];

      if (lastRegDate.createdAt.getTime() > lastActivityDate.getTime()) {
        lastActivityDate = lastRegDate.createdAt
      }
      data[retailer.region].activeStore++;
      data.total.activeStore++;
      data[retailer.region].activeStorePercent = (
        (data[retailer.region].activeStore / data[retailer.region].totalStore) *
        100
      )
      // console.log( getDays2Active(progStart, firstActiveDate.createdAt))
      data[retailer.region].daysActivate =
        data[retailer.region].daysActivate +
        getDays2Active(progStart, firstActiveDate.createdAt);
      data[retailer.region].avgDaysActivate = (
        data[retailer.region].daysActivate / data[retailer.region].activeStore
      )
      data[retailer.region].totalReg += retailer.users.length;
      // data.total.totalReg += retailer.users.length;
    }
    for (const tran of retailer.transactions) {
      // console.log(tran.createdAt)
      if (tran.createdAt.getTime() > lastActivityDate.getTime()) {
        lastActivityDate = tran.createdAt
      }
      if (tran.status == 'Approved') {
        data[retailer.region].totalTrans++;
        data.total.totalTrans++;
        data[retailer.region].totalSales = (parseInt(data[retailer.region].totalSales) + parseInt(tran.sales))
        data.total.totalSales = (data.total.totalSales + tran.sales)
        data[retailer.region].totalSoldUnit += tran.dataValues.n_items
        data.total.totalSoldUnit += tran.dataValues.n_items
        data[retailer.region].completedAlloc += tran.dataValues.n_items
      }
      if (tran.status == 'Approved' && tran.promo) {
        data[retailer.region].totalTransWithPromo++;
        // data.total.totalTransWithPromo++;
        data[retailer.region].totalTransWithPromoPercent = (
          (data[retailer.region].totalTransWithPromo /
            data.total.totalTransWithPromo) *
          100
        )
      }

      data[retailer.region].soldUnitPerUser = (
        data[retailer.region].totalSoldUnit / data[retailer.region].totalReg
      )
      data[retailer.region].salesPerUser = (
        data[retailer.region].totalSales / data[retailer.region].totalReg
      )
      data[retailer.region].transPerUser = (
        data[retailer.region].totalTrans / data[retailer.region].totalReg
      )
      data[retailer.region].basketSizeSales = (
        data[retailer.region].totalSales / data[retailer.region].totalTrans
      )
      data[retailer.region].basketSizeQty = (
        data[retailer.region].totalSoldUnit / data[retailer.region].totalTrans
      )
      // cbTran()
    }

    let active = 0;
    let completed = 0;
    retailer.users.map((e) => {
      if (e.status == 'Active') {
        active++;
      } else if (e.status == 'Completed') {
        completed++;
      }
      else if (e.status == 'Repeat') {
        data[retailer.region].repeatRedempt++
      }
      if (e['tier1_date']) {
        data[retailer.region].entitledTier1++;
        data.total.entitledTier1++;
      }
      if (e['tier2_date']) {
        data[retailer.region].entitledTier2++;
        data.total.entitledTier2++;
      }
      if (e['tier3_date']) {
        data[retailer.region].entitledTier3++;
        data.total.entitledTier3++;
      }
      if (e['tier4_date']) {
        data[retailer.region].entitledTier4++;
        data.total.entitledTier4++;
      }
      if (e['tier5_date']) {
        data[retailer.region].entitledTier5++;
        data.total.entitledTier5++;
      }
    });

    const approved = retailer.transactions.filter((e) => {
      if (e.status == 'Approved') return e;
    });
    // const redeemedReward = retailer.rewards.filter((e) => {
    //   if (e.status == 'redeemed') return e;
    // });
    // const reservedReward = retailer.rewards.filter((e) => {
    //   if (e.status == 'entitled') return e;
    // });

    if (retailer.transactions.length > 0 && approved.length > 0) {
      data[retailer.region].effectiveStore++;
      // data.total.effectiveStore++;
      data[retailer.region].effectiveStorePercent = (
        (data[retailer.region].effectiveStore /
          data[retailer.region].totalStore) *
        100
      )
    }

    data[retailer.region].activeUser += active;
    data[retailer.region].completedUser += completed;
    data[retailer.region].targetAlloc += retailer.quota
      ? retailer.quota.quantity
      : 0;
    data[retailer.region].reservedAlloc += 0;
    data[retailer.region].remainingAlloc =
      data[retailer.region].targetAlloc -
      data[retailer.region].completedAlloc -
      data[retailer.region].reservedAlloc;
    data[retailer.region].totalScan += parseInt(retailer.dataValues.n_scans);
    data[retailer.region].regPerDeployDays =
      (data[retailer.region].totalReg / data[retailer.region].deployDays)
    data[retailer.region].activePerDeployDays =
      (data[retailer.region].activeUser / data[retailer.region].deployDays)
    data[retailer.region].completedPerDeployDays =
      (data[retailer.region].completedUser / data[retailer.region].deployDays)
    data[retailer.region].salesPerDeployDays =
      (data[retailer.region].totalSales / data[retailer.region].deployDays)
    data[retailer.region].soldUnitPerDeployDays =
      (data[retailer.region].totalSoldUnit / data[retailer.region].deployDays)
    data[retailer.region].scanRegRate =
      (data[retailer.region].totalScan / data[retailer.region].totalReg)
    data[retailer.region].regActiveRate =
      (data[retailer.region].totalReg / data[retailer.region].activeUser)
    data[retailer.region].scanRegRate =
      (data[retailer.region].totalScan / data[retailer.region].totalReg)
    data[retailer.region].regTier1Rate =
      (data[retailer.region].entitledTier1 / data[retailer.region].totalReg)
    data[retailer.region].regTier2Rate =
      (data[retailer.region].entitledTier2 / data[retailer.region].totalReg)
    data[retailer.region].regTier3Rate =
      (data[retailer.region].entitledTier3 / data[retailer.region].totalReg)
    data[retailer.region].regTier4Rate =
      (data[retailer.region].entitledTier4 / data[retailer.region].totalReg)
    data[retailer.region].regTier5Rate =
      (data[retailer.region].entitledTier5 / data[retailer.region].totalReg);
    data.total.activeUser += active;
    data.total.completedUser += completed;
    data.total.targetAlloc += retailer.quota ? retailer.quota.quantity : 0;
    // data.total.completedAlloc += redeemedReward.length;
    // data.total.reservedAlloc += reservedReward.length;
    // data.total.remainingAlloc =
    //   data.total.targetAlloc -
    //   data[retailer.region].completedAlloc -
    //   data[retailer.region].reservedAlloc;
    data.total.totalScan += parseInt(retailer.dataValues.n_scans);
    if (data[retailer.region].entitledTier1) {
      data[retailer.region].entitledHighest = '1';
    }
    if (data[retailer.region].entitledTier2) {
      data[retailer.region].entitledHighest = '2';
    }
    if (data[retailer.region].entitledTier3) {
      data[retailer.region].entitledHighest = '3';
    }
    if (data[retailer.region].entitledTier4) {
      data[retailer.region].entitledHighest = '4';
    }
    if (data[retailer.region].entitledTier5) {
      data[retailer.region].entitledHighest = '5';
    }
    data[retailer.region].totalScan += parseInt(retailer.dataValues.n_scans);
    data[retailer.region].regPerDeployDays = data[retailer.region].regPerDeployDays
    data[retailer.region].activePerDeployDays = data[retailer.region].activePerDeployDays
    data[retailer.region].completedPerDeployDays = data[retailer.region].completedPerDeployDays
    data[retailer.region].salesPerDeployDays = data[retailer.region].salesPerDeployDays
    data[retailer.region].soldUnitPerDeployDays = data[retailer.region].soldUnitPerDeployDays
    data[retailer.region].scanRegRate = data[retailer.region].scanRegRate
    data[retailer.region].regActiveRate = data[retailer.region].regActiveRate
    data[retailer.region].scanRegRate = data[retailer.region].scanRegRate
    data[retailer.region].regTier1Rate = data[retailer.region].regTier1Rate
    data[retailer.region].regTier2Rate = data[retailer.region].regTier2Rate
    data[retailer.region].regTier3Rate = data[retailer.region].regTier3Rate
    data[retailer.region].regTier4Rate = data[retailer.region].regTier4Rate
    data[retailer.region].regTier5Rate = data[retailer.region].regTier5Rate
  }

  data.total.soldUnitPerUser = (
    data.total.totalSoldUnit / data.total.totalReg
  );
  data.total.salesPerUser = (
    data.total.totalSales / data.total.totalReg
  );
  data.total.transPerUser = (
    data.total.totalTrans / data.total.totalReg
  );
  data.total.basketSizeSales = (
    data.total.totalSales / data.total.totalTrans
  );
  data.total.basketSizeQty = (
    data.total.totalSoldUnit / data.total.totalTrans
  );
  data.total.regPerDeployDays = (data.total.totalReg / data.total.deployDays)
  data.total.activePerDeployDays =
    (data.total.activeUser / data.total.deployDays)
  data.total.completedPerDeployDays =
    (data.total.completedUser / data.total.deployDays)
  data.total.salesPerDeployDays = (data.total.totalSales / data.total.deployDays)
  data.total.soldUnitPerDeployDays =
    (data.total.totalSoldUnit / data.total.deployDays)
  data.total.scanRegRate = (data.total.totalScan / data.total.totalReg)
  data.total.regActiveRate = (data.total.totalReg / data.total.activeUser)
  data.total.regTier1Rate = (data.total.totalReg / data.total.tier1User)
  data.total.regTier1Rate = (data.total.entitledTier1 / data.total.totalReg)
  data.total.regTier2Rate = (data.total.entitledTier2 / data.total.totalReg)
  data.total.regTier3Rate = (data.total.entitledTier3 / data.total.totalReg)
  data.total.regTier4Rate = (data.total.entitledTier4 / data.total.totalReg)
  data.total.regTier5Rate = (data.total.entitledTier5 / data.total.totalReg)
};

const processSummaryRetailer = async (data, retailers, progStart) => {
  let redeemedReward = []
  let reservedReward = []
  for (const retailer of retailers) {
    if (!data[retailer.code]) {
      data.total = {
        name: 'Total',
        days2Active: 0,
        activeDuration: 0,
        completedAlloc: 0,
        reservedAlloc: 0,
        remainingAlloc: 0,
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
        entitledReward: 0,
        redeemedReward: 0,
        pendingRedeemReward: 0,
        totalTrans: 0,
        totalTransWithPromo: 0,
        totalSales: 0,
        totalSoldUnit: 0,
        regPerActiveDuration: 0,
        activePerActiveDuration: 0,
        completedPerActiveDuration: 0,
        salesPerActiveDuration: 0,
        soldUnitPerActiveDuration: 0,
        scanRegRate: 0,
        regActiveRate: 0,
        regTier1Rate: 0,
        regTier2Rate: 0,
        regTier3Rate: 0,
        regTier4Rate: 0,
        regTier5Rate: 0,
        basketSizeSales: 0,
        basketSizeQty: 0,
        totalTransWithPromoPercent: 0,
        transRate: 0,
      };
      data[retailer.code] = {
        name: retailer.name,
        code: retailer.code,
        storeType: retailer['store_type'],
        qrcode: 'https://buyandredeem.com/welcome?store=' + retailer.id,  // REQUIRED : change based on your requirement
        status: null,
        regDate: moment(retailer['registration_date']).format('YYYY/MM/DD'),
        days2Active: 0,
        activeDuration: 0,
        region: retailer.region,
        state: retailer.state,
        targetAlloc: retailer.quota ? retailer.quota.quantity : 0,
        completedAlloc: 0,
        reservedAlloc: 0,
        remainingAlloc: 0,
        allocStatus: null,
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
        entitledReward: 0,
        redeemedReward: 0,
        pendingRedeemReward: 0,
        totalTrans: 0,
        totalTransWithPromo: 0,
        totalRejected: 0,
        totalEssential: 0,
        totalInfinityPlus: 0,
        totalInfinity: 0,
        totalLimited: 0,
        totalPods: 0,
        totalSales: 0,
        totalSoldUnit: 0,
        regPerActiveDuration: 0,
        activePerActiveDuration: 0,
        completedPerActiveDuration: 0,
        salesPerActiveDuration: 0,
        soldUnitPerActiveDuration: 0,
        scanRegRate: 0,
        regActiveRate: 0,
        regTier1Rate: 0,
        regTier2Rate: 0,
        regTier3Rate: 0,
        regTier4Rate: 0,
        regTier5Rate: 0,
        basketSizeSales: 0,
        basketSizeQty: 0,
        totalTransWithPromoPercent: 0,
        transRate: 0,
      };
    }
    const lastActivityDate = progStart;
    if (!retailer['first_scan_date']) {
      data[retailer.code].activeDuration = 0;
    } else if (retailer['first_scan_date'] && retailer['last_activity_date']) {
      data[retailer.code].activeDuration = differenceInDays(
        retailer['first_scan_date'],
        retailer['last_activity_date']
      );
    } else {
      data[retailer.code].activeDuration = 0;
    }
    // data.total.activeDuration += data[retailer.code].activeDuration;
    const approved = retailer.transactions.filter((e) => {
      if (e.status == 'Approved') return e;
    });

    // const redeemedReward = retailer.rewards.filter((e) => {  // take out reward table
    //   if (e.status == 'redeemed') return e; 
    // });
    // const reservedReward = retailer.rewards.filter((e) => { // take out reward table
    //   if (e.status == 'entitled') return e;
    // });
    if (retailer.transactions.length > 0 && approved.length > 0) {
      data[retailer.code].status = 'Effective';
    } else {
      data[retailer.code].status = 'Inactive';
    }
    retailer.users.map((e) => {
      if (e.status == 'Active') {
        data[retailer.code].activeUser++;
      } else if (e.status == 'Repeat') {
        data[retailer.code].repeatRedempt++;
        data[retailer.code].completedUser++;
      } else if (e.status == 'Completed') {
        data[retailer.code].completedUser++;
      }
      if (e['tier1_date']) {
        data[retailer.code].entitledTier1++;
      }
      if (e['tier2_date']) {
        data[retailer.code].entitledTier2++;
      }
      if (e['tier3_date']) {
        data[retailer.code].entitledTier3++;
      }
      if (e['tier4_date']) {
        data[retailer.code].entitledTier4++;
      }
      if (e['tier5_date']) {
        data[retailer.code].entitledTier5++;
      }
    });
    data[retailer.code].completedAlloc += redeemedReward.length;
    data[retailer.code].reservedAlloc += reservedReward.length;
    data[retailer.code].remainingAlloc =
      data[retailer.code].targetAlloc -
      data[retailer.code].completedAlloc -
      data[retailer.code].reservedAlloc;
    data[retailer.code].totalScan += parseInt(retailer.dataValues.n_scans)
    data[retailer.code].pendingRedeemReward = reservedReward.length;
    data.total.activeUser += data[retailer.code].activeUser;
    data.total.completedAlloc += redeemedReward.length;
    data.total.reservedAlloc += reservedReward.length;
    data.total.remainingAlloc =
      data[retailer.code].targetAlloc -
      data[retailer.code].completedAlloc -
      data[retailer.code].reservedAlloc;
    data.total.totalScan += parseInt(retailer.dataValues.n_scans)
    data.total.redeemedReward += redeemedReward.length;
    data.total.entitledReward = approved.length;
    data.total.pendingRedeemReward = reservedReward.length;
    if (
      data[retailer.code].remainingAlloc / data[retailer.code].targetAlloc >=
      0.4
    ) {
      data[retailer.code].allocStatus = 'Normal';
    } else {
      data[retailer.code].allocStatus = 'Urgent';
    }
    let firstActiveDate = 0;
    if (retailer.users.length > 0) {
      data[retailer.code].status = 'Active';
      firstActiveDate = retailer.users.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )[0];
      data[retailer.code].totalReg += retailer.users.length;
      data.total.totalReg += retailer.users.length;
    }
    if (firstActiveDate) {
      data[retailer.code].days2Active = getDays2Active(
        progStart,
        firstActiveDate
      );
    } else {
      data[retailer.code].days2Active = 'NA';
    }

    data.total.days2Active += parseInt(data[retailer.code].days2Active);

    for (const tran of retailer.transactions) {
      // console.log(tran);
      if (tran.status === 'Approved') {
        data[retailer.code].totalTrans++;
        data.total.totalTrans++;
        data[retailer.code].totalSales += parseInt(tran.sales)
        data.total.totalSales += tran.sales // REQUIRED : add sku item based on requirements
      }

      if (tran.status === 'Approved' && tran.promo) {
        data[retailer.code].totalTransWithPromo++;
        data.total.totalTransWithPromo++;
        data[retailer.code].totalTransWithPromoPercent = (
          (data[retailer.code].totalTransWithPromo /
            data.total.totalTransWithPromo) *
          100
        )
      }
      if (tran.status === 'Rejected') {
        data[retailer.code].totalRejected++;
      }
      let totalSold = (tran.items[0] ? tran.items[0].quantity : 0) // REQUIRED : add sku item based on requirements
      data[retailer.code].redeemedReward = totalSold;
      data[retailer.code].entitledReward = 0;
      data[retailer.code].totalPods += tran.dataValues.nonproduct ? parseInt(tran.dataValues.nonproduct) : 0
      data[retailer.code].totalSoldUnit += totalSold
      data.total.totalSoldUnit += data[retailer.code].totalSoldUnit;
      data[retailer.code].basketSizeSales =
        parseInt(data[retailer.code].totalSales) / parseInt(data[retailer.code].totalTrans)
      data[retailer.code].basketSizeQty =
        parseInt(data[retailer.code].totalSoldUnit) / parseInt(data[retailer.code].totalTrans)

      // cbTran()
    }

    data[retailer.code].regPerActiveDuration =
      (data[retailer.code].totalReg / data[retailer.code].activeDuration)
    data[retailer.code].activePerActiveDuration =
      data[retailer.code].activeUser / data[retailer.code].activeDuration;
    data[retailer.code].completedPerActiveDuration =
      data[retailer.code].completedUser / data[retailer.code].activeDuration;

    data[retailer.code].salesPerActiveDuration =
      data[retailer.code].totalSales / data[retailer.code].activeDuration;

    data[retailer.code].soldUnitPerActiveDuration =
      data[retailer.code].totalSoldUnit / data[retailer.code].activeDuration;

    let scanRate = (data[retailer.code].totalScan / data[retailer.code].totalReg)
    data[retailer.code].scanRegRate = scanRate !== 'Infinity' ? scanRate : 0;
    let activeRate = (data[retailer.code].totalReg / data[retailer.code].activeUser)
    data[retailer.code].regActiveRate = activeRate !== 'Infinity' ? activeRate : 0;
    data[retailer.code].regTier1Rate =
      (data[retailer.code].entitledTier1 / data[retailer.code].totalReg);

    data[retailer.code].regTier2Rate =
      data[retailer.code].entitledTier2 / data[retailer.code].totalReg;
    data[retailer.code].regTier3Rate =
      (data[retailer.code].entitledTier3 / data[retailer.code].totalReg);
    data[retailer.code].regTier4Rate =
      (data[retailer.code].entitledTier4 / data[retailer.code].totalReg);
    data[retailer.code].regTier5Rate =
      (data[retailer.code].entitledTier5 / data[retailer.code].totalReg);
    let tranRate = (data[retailer.code].totalTrans / data[retailer.code].activeUser)
    data[retailer.code].transRate = tranRate;

    data[retailer.code].basketSizeSales = data[retailer.code].basketSizeSales ? data[retailer.code].basketSizeSales : 0
    data[retailer.code].basketSizeQty = data[retailer.code].basketSizeQty ? data[retailer.code].basketSizeQty : 0
  }

  data.total.basketSizeSales = (
    data.total.totalSales / data.total.totalTrans
  );
  data.total.basketSizeQty += (
    data.total.totalSoldUnit / data.total.totalTrans
  );
  data.total.regPerActiveDuration =
    data.total.totalReg / data.total.activeDuration;
  data.total.activePerActiveDuration =
    data.total.activeUser / data.total.activeDuration;
  data.total.completedPerActiveDuration =
    data.total.completedUser / data.total.activeDuration;
  data.total.salesPerActiveDuration =
    data.total.totalSales / data.total.activeDuration;
  data.total.soldUnitPerActiveDuration =
    data.total.totalSoldUnit / data.total.activeDuration;
  data.total.scanRegRate = (data.total.totalScan / data.total.totalReg);
  data.total.regActiveRate = (data.total.totalReg / data.total.activeUser);
  data.total.regTier1Rate = (data.total.entitledTier1 / data.total.totalReg);
  data.total.regTier2Rate = (data.total.entitledTier2 / data.total.totalReg);
  data.total.regTier3Rate = (data.total.entitledTier3 / data.total.totalReg);
  data.total.regTier4Rate = (data.total.entitledTier4 / data.total.totalReg);
  data.total.regTier5Rate = (data.total.entitledTier5 / data.total.totalReg);
  data.total.transRate = (data.total.totalTrans / data.total.activeUser);

};

const processWeekly = async (data, events) => {
  for (const event of events) {
    const myweek = weekNumber(event.createdAt);
    // console.log('myweek', event)
    if (data[`W${myweek}`]) {
      switch (event.type) {
        case 'scan':
          data[`W${myweek}`].totalScan += event.amount;
          data.Total.totalScan += event.amount;
          break;
        case 'register':
          data[`W${myweek}`].totalReg += event.amount;
          data.Total.totalReg += event.amount;
          break;
        case 'activeUser':
          data[`W${myweek}`].totalActiveUsers += event.amount;
          data.Total.totalActiveUsers += event.amount;
          break;
        case 'tier1':
          data[`W${myweek}`].totalTier1 += event.amount;
          data.Total.totalTier1 += event.amount;
          break;
        case 'tier2':
          data[`W${myweek}`].totalTier2 += event.amount;
          data.Total.totalTier2 += event.amount;
          break;
        case 'tier3':
          data[`W${myweek}`].totalTier3 += event.amount;
          data.Total.totalTier3 += event.amount;
          break;
        case 'tier4':
          data[`W${myweek}`].totalTier4 += event.amount;
          data.Total.totalTier4 += event.amount;
          break;
        case 'tier5':
          data[`W${myweek}`].totalTier5 += event.amount;
          data.Total.totalTier5 += event.amount;
          break;
        case 'transaction':
          data[`W${myweek}`].totalTrans += event.amount;
          data.Total.totalTrans += event.amount;
          break;
        case 'sales':
          data[`W${myweek}`].totalSales += parseInt(event.amount);
          data.Total.totalSales += parseInt(event.amount);
          break;
        case 'sku':
          data[`W${myweek}`].totalSoldUnit += event.amount;
          data.Total.totalSoldUnit += event.amount;
          break;

        case 'activeStore':
          data[`W${myweek}`].totalActiveStores += event.amount;
          data.Total.totalActiveStores += event.amount;
          break;
        default:
        // code block
      }
    }
  }
};

const processMonthly = async (data, events) => {
  for (const event of events) {
    const myMonth = getNameMonth(event.createdAt);
    if (data[myMonth]) {
      switch (event.type) {
        case 'scan':
          data[myMonth].totalScan += event.amount;
          data.Total.totalScan += event.amount;
          break;
        case 'register':
          data[myMonth].totalReg += event.amount;
          data.Total.totalReg += event.amount;
          break;
        case 'activeUser':
          data[myMonth].totalActiveUsers += event.amount;
          data.Total.totalActiveUsers += event.amount;
          break;
        case 'tier1':
          data[myMonth].totalTier1 += event.amount;
          data.Total.totalTier1 += event.amount;
          break;
        case 'tier2':
          data[myMonth].totalTier2 += event.amount;
          data.Total.totalTier2 += event.amount;
          break;
        case 'tier3':
          data[myMonth].totalTier3 += event.amount;
          data.Total.totalTier3 += event.amount;
          break;
        case 'tier4':
          data[myMonth].totalTier4 += event.amount;
          data.Total.totalTier4 += event.amount;
          break;
        case 'tier5':
          data[myMonth].totalTier5 += event.amount;
          data.Total.totalTier5 += event.amount;
          break;
        case 'transaction':
          data[myMonth].totalTrans += event.amount;
          data.Total.totalTrans += event.amount;
          break;
        case 'sales':
          data[myMonth].totalSales += event.amount;
          data.Total.totalSales += event.amount;
          break;
        case 'soldunit':
          data[myMonth].totalSoldUnit += event.amount;
          data.Total.totalSoldUnit += event.amount;
          break;
        case 'activeStore':
          data[myMonth].totalActiveStores += event.amount;
          data.Total.totalActiveStores += event.amount;
          break;
        default:
        // code block
      }
    }
  }
};

module.exports = {
  retailerRegionReport,
  retailerSummaryReport,
  weeklyMonthlyReport,
  retailerStorePerformance
};
