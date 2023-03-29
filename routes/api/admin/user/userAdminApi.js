require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const router = express.Router();
const { Op } = require('sequelize');
const sequelize = require('../../../../configs/sequelize.js');

const Collection = require('../../../../configs/tables/collection');
const DSR = require('../../../../configs/tables/dsr');
const Form_generation = require('../../../../configs/tables/gift');
const Item = require('../../../../configs/tables/item');
const promoter = require('../../../../configs/tables/promoter');
const Quota = require('../../../../configs/tables/quota');
const Receipt = require('../../../../configs/tables/receipt');
const Retailer = require('../../../../configs/tables/retailer');
const Reward = require('../../../../configs/tables/reward');
const SKU = require('../../../../configs/tables/sku');
const Transaction = require('../../../../configs/tables/transaction');
const User = require('../../../../configs/tables/user');
const Gift = require('../../../../configs/tables/gift');
const Voucher = require('../../../../configs/tables/voucher');
const { authenticate } = require('../../../../configs/function/middlewares');
const {
  userRegionReport,
  byBrandReport,
  customerStatusReport,
  userSummryReport,
} = require('../../../../configs/function/user/reportGen');

const {
  validationList
} = require('../../../../configs/function/operation/validation');

const { getWeeksDiff } = require('../../../../configs/function/misc');

// const pubKey = fs.readFileSync(path.join(__dirname, '.pubKey.pem'), 'utf8');
// const signOptions = { expiresIn: '10h', algorithm: 'RS256' };

router.post('/targetOverview', authenticate, async (req, res) => {
  const { token } = req.body;
  const data = {
    targetKpi: process.env.targetKpi,
    campaignDuration: process.env.duration,
    timeGone: 0,
  };
  const dateNow = new Date();
  data.timeGone = getWeeksDiff(process.env.progStart, dateNow);
  return res.status(200).json({ data: [data] });
});

router.post('/userTarget', authenticate, async (req, res) => {
  const { token } = req.body;
  const data = [];
  const users = await User.findAll({
    where: { verified: true },
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'userCount'],
    ],
    group: 'status',
  });
  users.map((usr) => {
    let target = '';
    let type = ""
    if (usr.status == 'Active') {
      type = "Total Active Users"
      target = process.env.activeTarget;
    } else if (usr.status == 'Registered') {
      type = "Total Registered Users"
      target = process.env.registerTarget;
    }
    else if (usr.status == 'Repeat') {
      type = "Total Repeat Users"
      target = process.env.completedTarget;
    } else if (usr.status == 'Completed') {
      type = "Total Completed Users"
      target = process.env.completedTarget;
    }
    let temp = {
      type,
      target,
      progress: (usr.dataValues.userCount / target * 100).toFixed(2)
    }
    data.push(temp)
  });

  return res.status(200).json({ data });
});

router.post('/regionalReport', authenticate, async (req, res) => {
  const { startDate, endDate, token } = req.body;
  var stDate = "";
  var edDate = "";
  if (!startDate && !endDate) {
    stDate = new Date(process.env.progStart);
    edDate = new Date().setHours(23, 59, 59, 999);
  } else {
    stDate = new Date(startDate).setHours(00, 00, 00, 000);
    edDate = new Date(endDate).setHours(23, 59, 59, 999);
  }
  try {
    const users = await User.findAll({
      where: {
        verified: true,
        createdAt: {
          [Op.between]: [moment(stDate).startOf('day').format(), moment(edDate).endOf('day').format()],
        },
      },
      include: [
        {
          model: Transaction,
          as: 'transactions',
          include: [
            {
              model: Item,
              as: 'items',
              include: [
                {
                  model: SKU,
                  as: 'sku',
                },
              ],
            },
          ],
        },
      ],
    });
    const redemptions = await Reward.findAll({
      include: [
        {
          model: Gift,
          as: 'gift',
        },
        {
          model: User,
          as: 'user',
          attributes: ['region'],
        },
      ],
    });
    const data = await userRegionReport(users, redemptions);
    return res.status(200).json({ data: Object.values(data) });
  } catch (err) {
    console.log(err)
  }
});

// todo change region to status, now rendering as region
router.post('/statusReport', authenticate, async (req, res) => {
  const { startDate, endDate, token } = req.body;
  var stDate = "";
  var edDate = "";
  if (!startDate && !endDate) {
    stDate = new Date(process.env.progStart);
    edDate = new Date().setHours(23, 59, 59, 999);
  } else {
    stDate = new Date(startDate).setHours(00, 00, 00, 000);
    edDate = new Date(endDate).setHours(23, 59, 59, 999);
  }
  try {
    const users = await User.findAll({
      where: {
        verified: true,
        createdAt: {
          [Op.between]: [moment(stDate).startOf('day').format(), moment(edDate).endOf('day').format()],
        },
      },
      include: [
        {
          model: Transaction,
          as: 'transactions',
          include: [
            {
              model: Item,
              as: 'items',
              include: [
                {
                  model: SKU,
                  as: 'sku',
                },
              ],
            },
          ],
        },
      ],
    });
    const redemptions = await Reward.findAll({
      include: [
        {
          model: Gift,
          as: 'gift',
        },
        {
          model: User,
          as: 'user',
          attributes: ['status'],
        },
      ],
    });
    const data = await customerStatusReport(users, redemptions);
    return res.status(200).json({ data: Object.values(data) });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Internal Error' });
  }
});

router.post('/userSumReport', authenticate, async (req, res) => {
  const { startDate, endDate, token } = req.body;
  var stDate = "";
  var edDate = "";
  if (!startDate && !endDate) {
    stDate = new Date(process.env.progStart);
    edDate = new Date().setHours(23, 59, 59, 999);
  } else {
    stDate = new Date(startDate).setHours(00, 00, 00, 000);
    edDate = new Date(endDate).setHours(23, 59, 59, 999);
  }
  try {
    const users = await User.findAll({
      where: {
        verified: true,
        createdAt: {
          [Op.between]: [moment(stDate).startOf('day').format(), moment(edDate).endOf('day').format()],
        },
      },
      include: [
        {
          model: Retailer,
          as: 'retailer',
        },
        {
          model: Transaction,
          as: 'transactions',
          include: [
            {
              model: Item,
              as: 'items',
              include: [
                {
                  model: SKU,
                  as: 'sku',
                },
              ],
            },
          ],
        },
      ],
    });
    const redemptions = await Reward.findAll({
      include: [
        {
          model: Gift,
          as: 'gift',
        },
        {
          model: User,
          as: 'user',
          attributes: ['number'],
        },
      ],
    });
    const collections = await Collection.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['number'],
        },
      ],
    });
    const data = await userSummryReport(users, redemptions, collections);

    return res.status(200).json({ data: Object.values(data) });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Internal Error' });
  }
});

// todo this does not return anything as the receipts.length is empty
router.post('/transactionReport', authenticate, async (req, res) => {
  const { startDate, endDate, token } = req.body;
  var stDate = "";
  var edDate = "";
  if (!startDate && !endDate) {
    stDate = new Date(process.env.progStart);
    edDate = new Date().setHours(23, 59, 59, 999);
  } else {
    stDate = new Date(startDate).setHours(00, 00, 00, 000);
    edDate = new Date(endDate).setHours(23, 59, 59, 999);
  }
  try {
    const trans = await Transaction.findAll({
      where: {
        createdAt: {
          [Op.between]: [moment(stDate).startOf('day').format(), moment(edDate).endOf('day').format()],
        },
      },
      attributes: ['status', 'sales', 'transaction_date', 'promo'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'number'],
        },
        {
          model: Retailer,
          as: 'retailer',
          attributes: ['name', 'region'],
        },
        {
          model: Receipt,
          as: 'receipts',
          attributes: ['invoice_No', 'receipt_date'],
        },
      ],
    });
    const data = trans.map((e) => {
      const temp = JSON.parse(JSON.stringify(e));
      //// for those more than 1 receipts per transaction
      if (temp.receipts.length >= 2) {
        let ivNo = '';
        let rcptDate = '';
        for (const rcpt of temp.receipts) {
          ivNo = ivNo
            ? `${ivNo} - ${rcpt.invoice_No}`
            : ivNo + rcpt.invoice_No;
          rcptDate = rcptDate
            ? `${rcptDate} - ${rcpt.receipt_date}`
            : rcptDate + rcpt.receipt_date;
        }
        temp.receipt = {
          receiptNo: ivNo,
          receiptDate: rcptDate,
        };
      }
      let tmp = {
        name: temp.user.name,
        number: temp.user.number,
        receiptStatus: temp.status,
        uploadDate: moment(temp.transaction_date).format('YYYY-MM-DD'),
        receiptDate: temp.receipts[0].receipt_date,
        receiptNumber: temp.receipts[0].invoice_No,
        promotion: (temp.promo) ? "Yes" : "No",
        receiptAmount: temp.sales,
        storeName: temp.retailer.name,
        region: temp.retailer.region,
        rewardType: "Voucher"
      }
      return tmp;
    });
    return res.status(200).json({ data });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Internal Error' });
  }
});

router.post('/salesReportByBrand', authenticate, async (req, res) => {
  const { startDate, endDate, token } = req.body;
  var stDate = "";
  var edDate = "";
  if (!startDate && !endDate) {
    stDate = new Date(process.env.progStart).setHours(00, 00, 00, 000);
    edDate = new Date().setHours(23, 59, 59, 999);
  } else {
    stDate = new Date(startDate).setHours(00, 00, 00, 000);
    edDate = new Date(endDate).setHours(23, 59, 59, 999);
  }
  try {
    const trans = await Transaction.findAll({
      where: {
        status: 'Approved',
        createdAt: {
          [Op.between]: [moment(stDate).startOf('day').format(), moment(edDate).endOf('day').format()],
        },
      },
      attributes: ['sales', 'status'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['region', 'status'],
        },
        {
          model: Receipt,
          as: 'receipts',
          attributes: ['invoice_No', 'receipt_date'],
        },
        {
          model: Item,
          as: 'items',
          include: [
            {
              model: SKU,
              as: 'sku',
            },
          ],
        },
      ],
    });
  
    const data = await byBrandReport(trans);

    let newData = Object.values(data).map((a) => {
      return {
        ...a,
        SalesNorth: a.SalesNorth,
        SalesCentral: a.SalesCentral,
        SalesSouth: a.SalesSouth,

        SalesRepeat: a.SalesRepeat,
        SalesActive: a.SalesActive,
      }
    })


    return res.status(200).json({ data: newData });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Internal Error' });
  }
});

module.exports = router;
