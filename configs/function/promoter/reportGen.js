const {
  getDays2Active,
  differenceInDays,
  allWeek,
  allMonth,
  getNameMonth,
  weekNumber,
} = require('../misc');

const promoterRegionReport = async (promoters, progStart) => {
  const data = {};
  await processRegionPromoter(data, promoters, progStart);

  return data;
};

const promoterSummaryReport = async (promoters, progStart) => {
  const data = {};
  await processSummaryPromoter(data, promoters, progStart);
  return data;
};

const weeklyMonthlyReport = async (
  type,
  startDate,
  endDate,
  events,
  progStart
) => {
  const data = {};
  if (type == 'Week') {
    const allWeeks = allWeek(startDate, endDate);
    allWeeks.push('Total');
    allWeeks.map((e) => {
      let key = '';
      if (e == 'Total') {
        key = 'Total';
      } else {
        key = `W${e.weekNum}`;
      }
      data[key] = {
        count: key,
        date: `${e.firstday} - ${e.lastday}`,
        totalScan: 0,
        totalReg: 0,
        totalTier1: 0,
        totalTier2: 0,
        totalTier3: 0,
        totalTier4: 0,
        totalTier5: 0,
        totalTrans: 0,
        totalSales: 0,
        totalSoldUnit: 0,
        totalPromoters: 0,
        totalActivePromoters: 0,
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

    allMonths.push({
      month: 'Total',
      firstday: allMonths[0].firstday,
      lastday: allMonths[allMonths.length - 1].lastday,
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
        totalPromoters: 0,
        totalActivePromoters: 0,
        totalActiveUsers: 0,
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
const processRegionPromoter = async (data, promoters, progStart) => {
  data.total = {
    region: 'Total',
    totalPromoters: 0,
    activePromoter: 0,
    activePromoterPercent: 0,
    effectivePromoter: 0,
    effectivePromoterPercent: 0,
    totalTrialDays: 0,
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
    entitledRewards: 0,
    redeemedReward: 0,
    pendingRedeemReward: 0,
    totalTrans: 0,
    totalTransWithPromo: 0,
    totalSales: 0,
    totalSoldUnit: 0,
    regPerTrialDays: 0,
    activePerTrialDays: 0,
    completedPerTrialDays: 0,
    salesPerTrialDays: 0,
    soldUnitPerTrialDays: 0,
    scanRegRate: 0,
    regActiveRate: 0,
    regTier1Rate: 0,
    regTier2Rate: 0,
    regTier3Rate: 0,
    regTier4Rate: 0,
    regTier5Rate: 0,
    transRate: 0,
    basketSizeSales: 0,
    basketSizeQty: 0,
    totalTransWithPromoPercent: 0,
  };
  for (const promoter of promoters) {
    //repearRedempt not done yet.
    if (!data[promoter.region]) {
      data[promoter.region] = {
        region: promoter.region,
        totalPromoters: 0,
        activePromoter: 0,
        activePromoterPercent: 0,
        effectivePromoter: 0,
        effectivePromoterPercent: 0,
        totalTrialDays: 0,
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
        entitledRewards: 0,
        redeemedReward: 0,
        pendingRedeemReward: 0,
        totalTrans: 0,
        totalTransWithPromo: 0,
        totalSales: 0,
        totalSoldUnit: 0,
        regPerTrialDays: 0,
        activePerTrialDays: 0,
        completedPerTrialDays: 0,
        salesPerTrialDays: 0,
        soldUnitPerTrialDays: 0,
        scanRegRate: 0,
        regActiveRate: 0,
        regTier1Rate: 0,
        regTier2Rate: 0,
        regTier3Rate: 0,
        regTier4Rate: 0,
        regTier5Rate: 0,
        transRate: 0,
        basketSizeSales: 0,
        basketSizeQty: 0,
        totalTransWithPromoPercent: 0,
      };
    }
    data[promoter.region].totalPromoters++;
    data[promoter.region].totalTrialDays += promoter['trial_days'];
    data.total.totalTrialDays += promoter['trial_days'];
    // console.log(user.transactions)
    let lastActivityDate = progStart;
    for (const tran of promoter.transactions) {
      // console.log(tran)
      if (tran.createdAt.getTime() > lastActivityDate.getTime()) {
        lastActivityDate = tran.createdAt;
      }
      if (tran.status == 'Approved') {
        data[promoter.region].totalTrans++;
        data.total.totalTrans++;
        data[promoter.region].totalSales =
          data[promoter.region].totalSales + tran.sales;
        data.total.totalSales = data.total.totalSales + tran.sales;
        data.total.totalSales.toFixed(2);
      }
      if (tran.status == 'Approved' && tran.promo) {
        data[promoter.region].totalTransWithPromo++;
        data.total.totalTransWithPromo++;
        data[promoter.region].totalTransWithPromoPercent = (
          (data[promoter.region].totalTransWithPromo /
            data.total.totalTransWithPromo) *
          100
        ).toFixed(2);
      }
      data[promoter.region].totalSoldUnit = parseInt(tran.dataValues.n_items);
      data.total.totalSoldUnit =
        data.total.totalSoldUnit + data[promoter.region].totalSoldUnit;
      data[promoter.region].basketSizeSales = (
        data[promoter.region].totalSales / data[promoter.region].totalTrans
      ).toFixed(2);
      data[promoter.region].basketSizeQty = (
        data[promoter.region].totalSoldUnit / data[promoter.region].totalTrans
      ).toFixed(2);
      // cbTran()
    }

    if (promoter.users.length > 0) {
      const firstActiveDate = promoter.users.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )[0];
      const lastRegDate = promoter.users.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )[promoter.users.length - 1];
      if (lastRegDate.createdAt.getTime() > lastActivityDate.getTime()) {
        lastActivityDate = lastRegDate;
      }
      data[promoter.region].activePromoter++;
      data.total.activePromoter++;
      data[promoter.region].activePromoterPercent = (
        (data[promoter.region].activePromoter /
          data[promoter.region].totalPromoters) *
        100
      ).toFixed(2);
      data[promoter.region].totalReg += promoter.users.length;
      data.total.totalReg += promoter.users.length;
    }
    let active = 0;
    let completed = 0;
    promoter.users.map((e) => {
      if (e.status == 'Active') {
        active++;
      } else if (e.status == 'Completed') {
        completed++;
      }
      if (e['tier1_date']) {
        data[promoter.region].entitledTier1++;
        data.total.entitledTier1++;
      }
      if (e['tier2_date']) {
        data[promoter.region].entitledTier2++;
        data.total.entitledTier2++;
      }
      if (e['tier3_date']) {
        data[promoter.region].entitledTier3++;
        data.total.entitledTier3++;
      }
      if (e['tier4_date']) {
        data[promoter.region].entitledTier4++;
        data.total.entitledTier4++;
      }
      if (e['tier5_date']) {
        data[promoter.region].entitledTier5++;
        data.total.entitledTier5++;
      }
    });
    const approved = promoter.transactions.filter((e) => {
      if (e.status == 'Approved') return e;
    });
    const redeemedReward = promoter.rewards.filter((e) => {
      if (e.status == 'redeemed') return e;
    });
    const reservedReward = promoter.rewards.filter((e) => {
      if (e.status == 'entitled') return e;
    });

    if (promoter.transactions.length > 0 && approved.length > 0) {
      data[promoter.region].effectivePromoter++;
      data.total.effectivePromoter++;
      data[promoter.region].effectivePromoterPercent = (
        (data[promoter.region].effectivePromoter /
          data[promoter.region].totalPromoters) *
        100
      ).toFixed(2);
    }
    data[promoter.region].activeUser += active;
    data[promoter.region].completedUser += completed;
    data[promoter.region].redeemedReward = redeemedReward.length;
    data[promoter.region].entitledReward = approved.length;
    data[promoter.region].pendingRedeemReward = reservedReward.length;
    data[promoter.region].totalScan =
      data[promoter.region].totalScan + parseInt(promoter.dataValues.n_scans);
    data[promoter.region].regPerTrialDays =
      data[promoter.region].totalReg / data[promoter.region].totalTrialDays;
    data[promoter.region].activePerTrialDays =
      data[promoter.region].activeUser / data[promoter.region].totalTrialDays;
    data[promoter.region].completedPerTrialDays =
      data[promoter.region].completedUser /
      data[promoter.region].totalTrialDays;
    data[promoter.region].salesPerTrialDays =
      data[promoter.region].totalSales / data[promoter.region].totalTrialDays;
    data[promoter.region].soldUnitPerTrialDays =
      data[promoter.region].totalSoldUnit /
      data[promoter.region].totalTrialDays;
    data[promoter.region].scanRegRate =
      data[promoter.region].totalScan / data[promoter.region].totalReg;
    data[promoter.region].regActiveRate =
      data[promoter.region].totalReg / data[promoter.region].activeUser;
    data[promoter.region].scanRegRate =
      data[promoter.region].totalScan / data[promoter.region].totalReg;
    data[promoter.region].regTier1Rate =
      data[promoter.region].entitledTier1 / data[promoter.region].totalReg;
    data[promoter.region].regTier2Rate =
      data[promoter.region].entitledTier2 / data[promoter.region].totalReg;
    data[promoter.region].regTier3Rate =
      data[promoter.region].entitledTier3 / data[promoter.region].totalReg;
    data[promoter.region].regTier4Rate =
      data[promoter.region].entitledTier4 / data[promoter.region].totalReg;
    data[promoter.region].regTier5Rate =
      data[promoter.region].entitledTier5 / data[promoter.region].totalReg;
    data.total.activeUser += active;
    data.total.completedUser += completed;
    data.total.totalScan =
      data.total.totalScan + parseInt(promoter.dataValues.n_scans);
  }
  data.total.basketSizeSales = (
    data.total.totalSales / data.total.totalTrans
  ).toFixed(2);
  data.total.basketSizeQty = (
    data.total.totalSoldUnit / data.total.totalTrans
  ).toFixed(2);
  data.total.regPerTrialDays = data.total.totalReg / data.total.totalTrialDays;
  data.total.activePerTrialDays =
    data.total.activeUser / data.total.totalTrialDays;
  data.total.completedPerTrialDays =
    data.total.completedUser / data.total.totalTrialDays;
  data.total.salesPerTrialDays =
    data.total.totalSales / data.total.totalTrialDays;
  data.total.soldUnitPerTrialDays =
    data.total.totalSoldUnit / data.total.totalTrialDays;
  data.total.scanRegRate = data.total.totalScan / data.total.totalReg;
  data.total.regActiveRate = data.total.totalReg / data.total.activeUser;
  data.total.regTier1Rate = data.total.totalReg / data.total.tier1User;
  data.total.regTier1Rate = data.total.entitledTier1 / data.total.totalReg;
  data.total.regTier2Rate = data.total.entitledTier2 / data.total.totalReg;
  data.total.regTier3Rate = data.total.entitledTier3 / data.total.totalReg;
  data.total.regTier4Rate = data.total.entitledTier4 / data.total.totalReg;
  data.total.regTier5Rate = data.total.entitledTier5 / data.total.totalReg;
};

const processSummaryPromoter = async (data, promoters, progStart) => {
  for (const promoter of promoters) {
    if (!data[promoter.code]) {
      data[promoter.code] = {
        name: promoter.name,
        code: promoter.code,
        number: promoter.number,
        qrcode: promoter.qrcode,
        status: promoter.status,
        totalTrialDays: promoter['trial_days'],
        region: promoter.region,
        state: promoter.state,
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
        regPerTrialDays: 0,
        activePerTrialDays: 0,
        completedPerTrialDays: 0,
        salesPerTrialDays: 0,
        soldUnitPerTrialDays: 0,
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
      data.total = {
        trialDays: 0,
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
        regPerTrialDays: 0,
        activePerTrialDays: 0,
        completedPerTrialDays: 0,
        salesPerTrialDays: 0,
        soldUnitPerTrialDays: 0,
        scanRegRate: 0,
        regActiveRate: 0,
        regTier1Rate: 0,
        regTier2Rate: 0,
        regTier3Rate: 0,
        regTier4Rate: 0,
        regTier5Rate: 0,
        basketSizeSales: 0,
        basketSizeQty: 0,
        totalTransWithPromoPercent: 100,
        transRate: 0,
      };
    }
    data.total.trialDays += promoter['trial_days'];
    const approved = promoter.transactions.filter((e) => {
      if (e.status == 'Approved') return e;
    });
    const redeemedReward = promoter.rewards.filter((e) => {
      if (e.status == 'redeemed') return e;
    });
    const reservedReward = promoter.rewards.filter((e) => {
      if (e.status == 'entitled') return e;
    });
    promoter.users.map((e) => {
      if (e.status == 'Active') {
        data[promoter.code].activeUser++;
      } else if (e.status == 'Repeat') {
        data[promoter.code].repeatRedempt++;
        data[promoter.code].completedUser++;
      } else if (e.status == 'Completed') {
        data[promoter.code].completedUser++;
      }
      if (e['tier1_date']) {
        data[promoter.code].entitledTier1++;
      }
      if (e['tier2_date']) {
        data[promoter.code].entitledTier2++;
      }
      if (e['tier3_date']) {
        data[promoter.code].entitledTier3++;
      }
      if (e['tier4_date']) {
        data[promoter.code].entitledTier4++;
      }
      if (e['tier5_date']) {
        data[promoter.code].entitledTier5++;
      }
    });
    data[promoter.code].totalScan += parseInt(promoter.dataValues.n_scans);
    data[promoter.code].redeemedReward = redeemedReward.length;
    data[promoter.code].entitledReward = approved.length;
    data[promoter.code].pendingRedeemReward = reservedReward.length;
    data.total.activeUser += data[promoter.code].activeUser;
    data.total.totalScan += parseInt(promoter.dataValues.n_scans);
    data.total.redeemedReward += redeemedReward.length;
    data.total.entitledReward = approved.length;
    data.total.pendingRedeemReward = reservedReward.length;

    if (promoter.users.length > 0) {
      data[promoter.code].totalReg += promoter.users.length;
      data.total.totalReg += promoter.users.length;
    }
    for (const tran of promoter.transactions) {
      if (tran.status == 'Approved') {
        data[promoter.code].totalTrans++;
        data.total.totalTrans++;
        data[promoter.code].totalSales += parseInt(tran.sales);
        data.total.totalSales += parseInt(tran.sales);
      }
      if (tran.status == 'Approved' && tran.promo) {
        data[promoter.code].totalTransWithPromo++;
        data.total.totalTransWithPromo++;
        data[promoter.code].totalTransWithPromoPercent = (
          (data[promoter.code].totalTransWithPromo /
            data.total.totalTransWithPromo) *
          100
        ).toFixed(2);
      }
      data[promoter.code].totalSoldUnit = parseInt(tran.dataValues.n_items);
      data.total.totalSoldUnit += data[promoter.code].totalSoldUnit;
      data[promoter.code].basketSizeSales = (
        data[promoter.code].totalSales / data[promoter.code].totalTrans
      ).toFixed(2);
      data[promoter.code].basketSizeQty = (
        data[promoter.code].totalSoldUnit / data[promoter.code].totalTrans
      ).toFixed(2);
      // cbTran()
    }
    data[promoter.code].regPerTrialDays =
      data[promoter.code].totalReg / data[promoter.code].totalTrialDays;
    data[promoter.code].activePerTrialDays =
      data[promoter.code].activeUser / data[promoter.code].totalTrialDays;
    data[promoter.code].completedPerTrialDays =
      data[promoter.code].completedUser / data[promoter.code].totalTrialDays;
    data[promoter.code].salesPerTrialDays =
      data[promoter.code].totalSales / data[promoter.code].totalTrialDays;
    data[promoter.code].soldUnitPerTrialDays =
      data[promoter.code].totalSoldUnit / data[promoter.code].totalTrialDays;
    data[promoter.code].scanRegRate =
      data[promoter.code].totalScan / data[promoter.code].totalReg;
    data[promoter.code].regActiveRate =
      data[promoter.code].activeUser / data[promoter.code].totalReg;
    data[promoter.code].regTier1Rate =
      data[promoter.code].entitledTier1 / data[promoter.code].totalReg;
    data[promoter.code].regTier2Rate =
      data[promoter.code].entitledTier2 / data[promoter.code].totalReg;
    data[promoter.code].regTier3Rate =
      data[promoter.code].entitledTier3 / data[promoter.code].totalReg;
    data[promoter.code].regTier4Rate =
      data[promoter.code].entitledTier4 / data[promoter.code].totalReg;
    data[promoter.code].regTier5Rate =
      data[promoter.code].entitledTier5 / data[promoter.code].totalReg;
    data[promoter.code].transRate =
      data[promoter.code].totalTrans / data[promoter.code].activeUser;
  }
  data.total.basketSizeSales = (
    data.total.totalSales / data.total.totalTrans
  ).toFixed(2);
  data.total.basketSizeQty += (
    data.total.totalSoldUnit / data.total.totalTrans
  ).toFixed(2);
  data.total.regPerTrialDays = data.total.totalReg / data.total.totalTrialDays;
  data.total.activePerTrialDays =
    data.total.activeUser / data.total.totalTrialDays;
  data.total.completedPerTrialDays =
    data.total.completedUser / data.total.totalTrialDays;
  data.total.salesPerTrialDays =
    data.total.totalSales / data.total.totalTrialDays;
  data.total.soldUnitPerTrialDays =
    data.total.totalSoldUnit / data.total.totalTrialDays;
  data.total.scanRegRate = data.total.totalScan / data.total.totalReg;
  data.total.regActiveRate = data.total.totalReg / data.total.activeUser;
  data.total.regTier1Rate = data.total.entitledTier1 / data.total.totalReg;
  data.total.regTier2Rate = data.total.entitledTier2 / data.total.totalReg;
  data.total.regTier3Rate = data.total.entitledTier3 / data.total.totalReg;
  data.total.regTier4Rate = data.total.entitledTier4 / data.total.totalReg;
  data.total.regTier5Rate = data.total.entitledTier5 / data.total.totalReg;
  data.total.transRate = data.total.totalTrans / data.total.activeUser;
};

const processWeekly = async (data, events) => {
  for (const event of events) {
    const myweek = weekNumber(event.createdAt);
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
        case 'transaction':
          data[`W${myweek}`].totalTrans += event.amount;
          data.Total.totalTrans += event.amount;
          break;
        case 'activeUser':
          data[`W${myweek}`].totalActiveUsers += event.amount;
          data.Total.totalActiveUsers += event.amount;
          break;
        case 'tier1':
          data[`W${myweek}`].totalTier1 += event.amount;
          data[`W${myweek}`].totalTier1 += event.amount;
          break;
        case 'tier2':
          data[`W${myweek}`].totalTier2 += event.amount;
          data[`W${myweek}`].totalTier2 += event.amount;
          break;
        case 'tier3':
          data[`W${myweek}`].totalTier3 += event.amount;
          data[`W${myweek}`].totalTier3 += event.amount;
          break;
        case 'tier4':
          data[`W${myweek}`].totalTier4 += event.amount;
          data[`W${myweek}`].totalTier4 += event.amount;
          break;
        case 'tier5':
          data[`W${myweek}`].totalTier5 += event.amount;
          data[`W${myweek}`].totalTier5 += event.amount;
          break;
        case 'transaction':
          data[`W${myweek}`].totalTrans += event.amount;
          data[`W${myweek}`].totalTrans += event.amount;
          break;
        case 'sales':
          data[`W${myweek}`].totalSales += event.amount;
          data[`W${myweek}`].totalSales += event.amount;
          break;
        case 'soldUnit':
          data[`W${myweek}`].totalSoldUnit += event.amount;
          data[`W${myweek}`].totalSoldUnit += event.amount;
          break;
        case 'activePromoter':
          data[`W${myweek}`].totalActivePromoters += event.amount;
          data[`W${myweek}`].totalActivePromoters += event.amount;
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
        case 'transaction':
          data[myMonth].totalTrans += event.amount;
          data.Total.totalTrans += event.amount;
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
        case 'sales':
          data[myMonth].totalSales += event.amount;
          data.Total.totalSales += event.amount;
          break;
        case 'soldUnit':
          data[myMonth].totalSoldUnit += event.amount;
          data.Total.totalSoldUnit += event.amount;
          break;
        case 'activePromoter':
          data[myMonth].totalActivePromoters += event.amount;
          data.Total.totalActivePromoters += event.amount;
          break;
        default:
        // code block
      }
    }
  }
};

module.exports = {
  promoterRegionReport,
  promoterSummaryReport,
  weeklyMonthlyReport,
};
