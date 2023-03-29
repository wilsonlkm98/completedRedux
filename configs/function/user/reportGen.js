const { getMostFrequent, getDay } = require('../misc');
const moment = require('moment');

/// Setup Workbook
// todo updated to this mapping
const processBrandData2 = async (data, transactions) => {
  for (const tran of transactions) {
    for (const item of tran.items) {
      if (!data[item.sku.brand]) {
        data[item.sku.brand] = {
          brand: item.sku.brand,
          SalesNorth: 0,
          SalesCentral: 0,
          SalesSouth: 0,
          'SalesEast Malaysia': 0,
          'SalesEast Coast': 0,
          SalesActive: 0,
          SalesInactive: 0,
          SalesRegistered: 0,
          SalesCompleted: 0,
          SalesRepeat: 0,
          QuantityNorth: 0,
          QuantityCentral: 0,
          QuantitySouth: 0,
          'QuantityEast Malaysia': 0,
          'QuantityEast Coast': 0,
          QuantityActive: 0,
          QuantityCompleted: 0,
          QuantityRepeat: 0,
          QuantityInactive: 0,
          QuantityRegistered: 0
        };
      }
      // console.log(tran)
      if (tran.status == 'Approved') {
        let region = tran.user.region.trim()
        let status = tran.user.status.trim()
        data[item.sku.brand][`Sales${region}`] += (item.price) ? item.price : 0
        data[item.sku.brand][`Quantity${region}`] += (item.quantity) ? item.quantity : 0
        data[item.sku.brand][`Sales${status}`] += (item.price) ? item.price : 0
        data[item.sku.brand][`Quantity${status}`] += (item.quantity) ? item.quantity : 0
      }
    }
  }
};

const userRegionReport = async (users, redemptions) => {
  const occurance = {
    total: {
      brands: [],
      days: [],
    },
  };
  const data = {
    total: {
      region: 'Total',
      totalreg: users.length,
      userPercent: 100,
      totalTrans: 0,
      totalTransWithPromo: 0,
      totalTransWithPromoPercent: 100,
      totalSales: 0,
      totalSalesPercent: 100,
      totalSoldUnit: 0,
      MostPreferedBrand: null,
      MostPreferedDay: null,
      soldUnitPerUser: 0,
      salesPerUser: 0,
      transactionsPerUser: 0,
      activeUser: 0,
      basketSizeSales: 0,
      basketSizeQty: 0,
      entitledRewards: 0,
      redeemedRewards: 0,
      pendingRewards: 0,
      redemptionCycle: 0,
    },
  };
  await processRegionUser(data, users, occurance);
  await processRegionReward(data, redemptions);
 
  return data;
};

const customerStatusReport = async (users, redemptions) => {
  const occurance = {
    total: {
      brands: [],
      days: [],
    },
  };
  const data = {
    total: {
      status: 'Total',
      totalreg: users.length,
      userPercent: 0,
      totalTrans: 0,
      totalTransWithPromo: 0,
      totalTransWithPromoPercent: 0,
      totalSales: 0,
      totalSalesPercent: 100,
      totalSoldUnit: 0,
      MostPreferedBrand: null,
      MostPreferedDay: null,
      soldUnitPerUser: 0,
      salesPerUser: 0,
      transactionsPerUser: 0,
      activeUser: 0,
      basketSizeSales: 0,
      basketSizeQty: 0,
      entitledRewards: 0,
      redeemedRewards: 0,
      pendingRewards: 0,
      redemptionCycle: 0,
      entitledTier1: 0,
      entitledTier2: 0,
      entitledTier3: 0,
      entitledTier4: 0,
      entitledTier5: 0,
    },
  };
  await processUserStatus(data, users, occurance);
  await processRewardStatus(data, redemptions);
  console.log('return data');
  // console.log(data)
  // return 123
  return data;
};

const userSummryReport = async (users, redemptions, collections) => {
  const userdata = {};
  const occurance = {};
  await processUser(userdata, users, occurance);
  await processRewards(userdata, redemptions);
  await processCollection(userdata, collections);

  return userdata;
};

const byBrandReport = async (transactions) => {
  const brandData = {};
  await processBrandData2(brandData, transactions);
  return brandData;
};
////// Sub Functions //////
const processUser = async (userdata, users, occurance) => {
  const promoters = await Promoter.findAll({})
  for (const user of users) {
    if (!userdata[user.number]) {
      userdata[user.number] = {
        number: user.number,
        name: user.name,
        email: user.email,
        region: user.region,
        state: user.state,
        address: user.address,
        channel: user.retailer ? user.retailer.name : user.promoterId ? promoters.filter(a => a.id === user.promoterId)[0].name : '',
        subChannel: user.retailer ? user.retailer.code : user.promoterId ? promoters.filter(a => a.id === user.promoterId)[0].code : '',
        registerDate: user.register_date ? moment(user.register_date).format('YYYY/MM/DD') : 'NA',
        firstApproveDate: user.first_approve_date ? moment(user.first_approve_date).format('YYYY/MM/DD') : 'NA',
        tier1Date: user.tier1_date ? moment(user.tier1_date).format('YYYY/MM/DD') : 'NA',
        tier2Date: user.tier2_date ? moment(user.tier2_date).format('YYYY/MM/DD') : 'NA',
        tier3Date: user.tier3_date ? moment(user.tier3_date).format('YYYY/MM/DD') : 'NA',
        tier4Date: user.tier4_date ? moment(user.tier4_date).format('YYYY/MM/DD') : 'NA',
        tier5Date: user.tier5_date ? moment(user.tier5_date).format('YYYY/MM/DD') : 'NA',
        status: user.status,
        totalTrans: 0,
        totalTransPromo: 0,
        entitledCollections: 0,
        redeemedCollections: 0,
        remainingCollections: 0,
        entitledRewards: 0,
        redeemedRewards: 0,
        pendingRewards: 0,
        sales: 0,
        skuQty: 0,
        totalTransWithPromoPercent: 0,
        MostPreferedBrand: null,
        MostPreferedDay: null,
        basketSizeSales: 0,
        basketSizeQty: 0,
      };
      occurance[user.number] = {
        brands: [],
        days: [],
      };
    }
    for (const tran of user.transactions) {
      if (tran.status == 'Approved') {
        userdata[user.number].totalTrans++;
        userdata[user.number].sales =
          userdata[user.number].sales + tran.sales
      }
      if (tran.status == 'Approved' && tran.promo) {
        userdata[user.number].totalTransPromo++;
        userdata[user.number].totalTransWithPromoPercent = (
          (userdata[user.number].totalTransPromo /
            userdata[user.number].totalTrans) *
          100
        )
      }
      userdata[user.number].skuQty = tran.items
        .map((e) => {
          for (let i = 0; i < e.quantity; i++) {
            occurance[user.number].brands.push(e.sku.brand);
          }
          return e.quantity;
        })
        .reduce((a, b) => a + b, 0);
      const day = getDay(tran['transaction_date']);
      occurance[user.number].days.push(day);
    }
    userdata[user.number].basketSizeSales = (userdata[user.number].sales / userdata[user.number].totalTrans)
    userdata[user.number].basketSizeQty = (userdata[user.number].skuQty / userdata[user.number].totalTrans)
    userdata[user.number].MostPreferedBrand = getMostFrequent(
      occurance[user.number].brands
    );
    userdata[user.number].MostPreferedDay = getMostFrequent(
      occurance[user.number].days
    );
  }
};

const processRewards = async (userdata, redemptions) => {
  for (const rdmpt of redemptions) {
    if (userdata[rdmpt.user.number]) {
      if (rdmpt.gift) {
        // console.log(rdmpt.user.number)
        // console.log(userdata[rdmpt.user.number])
        if (!userdata[rdmpt.user.number][rdmpt.gift.type]) {
          userdata[rdmpt.user.number][rdmpt.gift.type] = 0;
        }
        if (rdmpt.status == 'entitled') {
          userdata[rdmpt.user.number][rdmpt.gift.type]++;
        }
      }
      if (rdmpt.status == 'entitled') {
        userdata[rdmpt.user.number].entitledRewards++;
      } else if (rdmpt.status == 'redeemed') {
        userdata[rdmpt.user.number].redeemedRewards++;
      } else if (rdmpt.status == 'pending') {
        userdata[rdmpt.user.number].pendingRewards++;
      }
    } else {
      console.log('user not found');
      console.log(rdmpt.user.number);
    }
  }
};

const processCollection = async (userdata, collections) => {
  for (const collection of collections) {
    if (userdata[collection.user.number]) {
      if (collection.amount > 0) {
        userdata[collection.user.number].entitledCollections =
          userdata[collection.user.number].entitledCollections +
          collection.amount;
      } else if (collection.amount <= 0) {
        console.log({ collection: collection.amount });
        userdata[collection.user.number].redeemedCollections =
          userdata[collection.user.number].redeemedCollections +
          collection.amount;
      }
      userdata[collection.user.number].remainingCollections =
        userdata[collection.user.number].entitledCollections +
        userdata[collection.user.number].redeemedCollections;
    }
  }
};

const processUserStatus = async (data, users, occurance) => {
  for (const user of users) {
    if (!data[user.status]) {
      if (user.status == 'Inactive') {
        data[user.status] = {
          status: user.status,
          totalreg: 0,
          userPercent: 0,
          totalTrans: '-',
          totalTransWithPromo: '-',
          totalTransWithPromoPercent: '-',
          totalSales: '-',
          totalSalesPercent: '-',
          totalSoldUnit: '-',
          MostPreferedBrand: '-',
          MostPreferedDay: '-',
          soldUnitPerUser: '-',
          salesPerUser: '-',
          transactionsPerUser: '-',
          activeUser: '-',
          basketSizeSales: '-',
          basketSizeQty: '-',
          entitledRewards: '-',
          redeemedRewards: '-',
          pendingRewards: '-',
          redemptionCycle: '-',
          entitledTier1: '-',
          entitledTier2: '-',
          entitledTier3: '-',
          entitledTier4: '-',
          entitledTier5: '-',
        };
      }
      data[user.status] = {
        status: user.status,
        totalreg: 0,
        userPercent: 0,
        totalTrans: 0,
        totalTransWithPromo: 0,
        totalTransWithPromoPercent: 0,
        totalSales: 0,
        totalSalesPercent: 0,
        totalSoldUnit: 0,
        totalSold: 0,
        MostPreferedBrand: null,
        MostPreferedDay: null,
        soldUnitPerUser: 0,
        salesPerUser: 0,
        transactionsPerUser: 0,
        activeUser: 0,
        basketSizeSales: 0,
        basketSizeQty: 0,
        entitledRewards: 0,
        redeemedRewards: 0,
        pendingRewards: 0,
        redemptionCycle: 0,
        entitledTier1: 0,
        entitledTier2: 0,
        entitledTier3: 0,
        entitledTier4: 0,
        entitledTier5: 0,
      };
      occurance[user.status] = {
        brands: [],
        days: [],
      };
    }
    if (user['tier1_date']) {
      data[user.status].entitledTier1++;
      data.total.entitledTier1++;
    }
    if (user['tier2_date']) {
      data[user.status].entitledTier2++;
      data.total.entitledTier2++;
    }
    if (user['tier3_date']) {
      data[user.status].entitledTier3++;
      data.total.entitledTier3++;
    }
    if (user['tier4_date']) {
      data[user.status].entitledTier4++;
      data.total.entitledTier4++;
    }
    if (user['tier5_date']) {
      data[user.status].entitledTier5++;
      data.total.entitledTier5++;
    }
    data[user.status].totalreg++;
    data[user.status].userPercent = (
      (data[user.status].totalreg / users.length) *
      100
    ).toFixed(2);
    if (user.status != 'Inactive') {
      for (const tran of user.transactions) {
        if (tran.status == 'Approved') {
          data[user.status].totalTrans++;
          data.total.totalTrans++;
          data[user.status].totalSales += (tran.sales) ? parseInt(tran.sales) : 0;
          data.total.totalSales += (tran.sales) ? parseInt(tran.sales) : 0;
          data[user.status].totalSalesPercent = (
            (data[user.status].totalSales / data.total.totalSales) *
            100
          ).toFixed(2);
        }
        if (tran.status == 'Approved' && tran.promo) {
          data[user.status].totalTransWithPromo++;
          data.total.totalTransWithPromo++;
          data[user.status].totalTransWithPromoPercent =
            (data[user.status].totalTransWithPromo /
              data[user.status].totalTrans *
              100).toFixed(2)
        }
        data[user.status].totalSold = tran.items
          .map((e) => {
            // console.log(e)
            for (let i = 0; i < e.quantity; i++) {
              // console.log(e.sku.brand)
              occurance[user.status].brands.push(e.sku.brand);
              occurance.total.brands.push(e.sku.brand);
            }
            return e.quantity;
          })
          .reduce((a, b) => a + b, 0);
        data.total.totalSoldUnit = data.total.totalSoldUnit + data[user.status].totalSold;
        data[user.status].totalSoldUnit += data[user.status].totalSold

        data[user.status].soldUnitPerUser = (
          data[user.status].totalSoldUnit / data[user.status].totalreg
        ).toFixed(2);
        data[user.status].salesPerUser = (
          data[user.status].totalSales / data[user.status].totalreg
        ).toFixed(2);
        data[user.status].transactionsPerUser = (
          data[user.status].totalTrans / data[user.status].totalreg
        ).toFixed(2);
        data[user.status].basketSizeSales = (
          data[user.status].totalSales / data[user.status].totalTrans
        ).toFixed(2);
        data[user.status].basketSizeQty = (
          data[user.status].totalSoldUnit / data[user.status].totalTrans
        ).toFixed(2);
        const day = getDay(tran['transaction_date']);
        occurance[user.status].days.push(day);
        occurance.total.days.push(day);
        // cbTran()
      }
      if (user.transactions.length > 0) {
        data[user.status].activeUser++;
        data.total.activeUser++;
      }
      data[user.status].MostPreferedBrand = getMostFrequent(
        occurance[user.status].brands
      );
      data[user.status].MostPreferedDay = getMostFrequent(
        occurance[user.status].days
      );
    }
  }

  data.total.soldUnitPerUser = (
    data.total.totalSoldUnit / data.total.totalreg
  ).toFixed(2);
  data.total.salesPerUser = (
    data.total.totalSales / data.total.totalreg
  ).toFixed(2);
  data.total.transactionsPerUser = (
    data.total.totalTrans / data.total.totalreg
  ).toFixed(2);
  data.total.basketSizeSales = (
    data.total.totalSales / data.total.totalTrans
  ).toFixed(2);
  data.total.basketSizeQty = (
    data.total.totalSoldUnit / data.total.totalTrans
  ).toFixed(2);
  data.total.userPercent = (
    (data.total.totalreg / users.length) *
    100
  ).toFixed(2);
  data.total.totalTransWithPromoPercent = ((data.total.totalTransWithPromo / data.total.totalTrans) * 100).toFixed(2);
  data.total.totalSales = data.total.totalSales.toFixed(2);
  data.total.MostPreferedBrand = getMostFrequent(occurance.total.brands);
  data.total.MostPreferedDay = getMostFrequent(occurance.total.days);
};

const processRewardStatus = async (data, redemptions) => {
  for (const rdmpt of redemptions) {
    if (rdmpt.user.status != 'Inactive' && rdmpt.user.status != 'Active') {
      if (rdmpt.gift) {
        if (!data[rdmpt.user.status][rdmpt.gift.type]) {
          data[rdmpt.user.status][rdmpt.gift.type] = 0;
          data.total[rdmpt.gift.type] = 0;
          data.Inactive[rdmpt.gift.type] = '-';
          data.Active[rdmpt.gift.type] = '-';
        }
        if (rdmpt.status == 'entitled') {
          data[rdmpt.user.status][rdmpt.gift.type]++;
          data.total[rdmpt.gift.type]++;
        }
        if (rdmpt.status == 'entitled') {
          data[rdmpt.user.status].entitledRewards++;
          data.total.entitledRewards++;
        } else if (rdmpt.status == 'redeemed') {
          data[rdmpt.user.status].redeemedRewards++;
          data.total.redeemedRewards++;
        } else if (rdmpt.status == 'pending') {
          data[rdmpt.user.status].pendingRewards++;
          data.total.pendingRewards++;
        }
      }
    }
  }
};

const processRegionUser = async (data, users, occurance) => {
  for (const user of users) {
    if (!data[user.region]) {
      console.log('enter')
      data[user.region] = {
        region: user.region,
        totalreg: 0,
        userPercent: 0,
        totalTrans: 0,
        totalTransWithPromo: 0,
        totalTransWithPromoPercent: 0,
        totalSales: 0,
        totalSalesPercent: 0,
        totalSoldUnit: 0,
        MostPreferedBrand: null,
        MostPreferedDay: null,
        soldUnitPerUser: 0,
        salesPerUser: 0,
        transactionsPerUser: 0,
        activeUser: 0,
        basketSizeSales: 0,
        basketSizeQty: 0,
        entitledRewards: 0,
        redeemedRewards: 0,
        pendingRewards: 0,
        redemptionCycle: 0,
      };
      occurance[user.region] = {
        brands: [],
        days: [],
      };
    }
    data[user.region].totalreg++;
    data[user.region].userPercent = (
      (data[user.region].totalreg / users.length) *
      100
    ).toFixed(2);

    for (const tran of user.transactions) {
      if (tran.status == 'Approved') {
        data[user.region].totalTrans++;
        data.total.totalTrans++;
        data[user.region].totalSales += (tran.sales) ? parseInt(tran.sales) : 0
        data.total.totalSales += (tran.sales) ? parseInt(tran.sales) : 0
        data[user.region].totalSalesPercent = (
          (data[user.region].totalSales / data.total.totalSales) *
          100
        ).toFixed(2);
      }
      if (tran.status == 'Approved' && tran.promo) {
        data[user.region].totalTransWithPromo++;
        data.total.totalTransWithPromo++;
        data[user.region].totalTransWithPromoPercent = (
          (data[user.region].totalTransWithPromo /
            data.total.totalTransWithPromo) *
          100
        ).toFixed(2);
      }
      let itemNo = tran.items
        .map((e) => {
          for (let i = 0; i < e.quantity; i++) {
            occurance[user.region].brands.push(e.sku.brand);
            occurance.total.brands.push(e.sku.brand);
          }
          return e.quantity;
        })
        .reduce((a, b) => a + b, 0);
      data[user.region].totalSoldUnit += itemNo
      data.total.totalSoldUnit += itemNo

      data[user.region].soldUnitPerUser = (
        data[user.region].totalSoldUnit / data[user.region].totalreg
      ).toFixed(2);
      data[user.region].salesPerUser = (
        data[user.region].totalSales / data[user.region].totalreg
      ).toFixed(2);
      data[user.region].transactionsPerUser = (
        data[user.region].totalTrans / data[user.region].totalreg
      ).toFixed(2);
      data[user.region].basketSizeSales = (
        data[user.region].totalSales / data[user.region].totalTrans
      ).toFixed(0);
      data[user.region].basketSizeQty = (
        data[user.region].totalSoldUnit / data[user.region].totalTrans
      ).toFixed(0);
      const day = getDay(tran['transaction_date']);
      occurance[user.region].days.push(day);
      occurance.total.days.push(day);
      // cbTran()
    }
    if (user.transactions.length > 0) {
      data[user.region].activeUser++;
      data.total.activeUser++;
    }
    // console.log(occurance[user.region])

    data[user.region].MostPreferedBrand = getMostFrequent(
      occurance[user.region].brands
    );
    data[user.region].MostPreferedDay = getMostFrequent(
      occurance[user.region].days
    );
  }

  data.total.soldUnitPerUser = (
    data.total.totalSoldUnit / data.total.totalreg
  ).toFixed(2);
  data.total.salesPerUser = (
    data.total.totalSales / data.total.totalreg
  ).toFixed(2);
  data.total.transactionsPerUser = (
    data.total.totalTrans / data.total.totalreg
  ).toFixed(2);
  data.total.basketSizeSales = (
    data.total.totalSales / data.total.totalTrans
  ).toFixed(2);
  data.total.basketSizeQty = (
    data.total.totalSoldUnit / data.total.totalTrans
  ).toFixed(2);
  data.total.totalSales = (data.total.totalSales).toFixed(2);
  data.total.MostPreferedBrand = getMostFrequent(occurance.total.brands);
  data.total.MostPreferedDay = getMostFrequent(occurance.total.days);
};

const processRegionReward = async (data, redemptions) => {
  for (const rdmpt of redemptions) {
    if (rdmpt.gift) {
      if (!data[rdmpt.user.region][rdmpt.gift.type]) {
        data[rdmpt.user.region][rdmpt.gift.type] = 0;
        data.total[rdmpt.gift.type] = 0;
      }
      if (rdmpt.status == 'entitled') {
        data[rdmpt.user.region][rdmpt.gift.type]++;
        data.total[rdmpt.gift.type]++;
      }
      if (rdmpt.status == 'entitled') {
        data[rdmpt.user.region].entitledRewards++;
        data.total.entitledRewards++;
      } else if (rdmpt.status == 'redeemed') {
        data[rdmpt.user.region].redeemedRewards++;
        data.total.redeemedRewards++;
      } else if (rdmpt.status == 'pending') {
        data[rdmpt.user.region].pendingRewards++;
        data.total.pendingRewards++;
      }
    }
  }
};

const processBrandData = async (data, transactions) => {
  for (const tran of transactions) {
    for (const item of tran.items) {
      if (!data[item.sku.brand]) {
        data[item.sku.brand] = {
          brand: item.sku.brand,
          sales: {
            North: 0,
            Central: 0,
            South: 0,
            'East Malaysia': 0,
            'East Coast': 0,
            Active: 0,
            Inactive: 0,
            Completed: 0,
            Repeat: 0,
          },
          quantity: {
            North: 0,
            Central: 0,
            South: 0,
            'East Malaysia': 0,
            'East Coast': 0,
            Active: 0,
            Completed: 0,
            Repeat: 0,
            Inactive: 0,
          },
        };
      }
      // console.log(tran)
      if (tran.status == 'Approved') {
        data[item.sku.brand].sales[tran.user.region] =
          data[item.sku.brand].sales[tran.user.region] + item.price;
        data[item.sku.brand].quantity[tran.user.region] =
          data[item.sku.brand].quantity[tran.user.region] + item.quantity;
        data[item.sku.brand].sales[tran.user.status] =
          data[item.sku.brand].sales[tran.user.status] + item.price;
        data[item.sku.brand].quantity[tran.user.status] =
          data[item.sku.brand].quantity[tran.user.status] + item.quantity;
      }
    }
  }
};

module.exports = {
  userRegionReport,
  customerStatusReport,
  userSummryReport,
  byBrandReport,
};
