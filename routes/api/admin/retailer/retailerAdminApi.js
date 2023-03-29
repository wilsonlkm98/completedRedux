require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const childProcess = require('child_process');
const moment = require('moment');

const router = express.Router();
const sequelize = require('../../../../configs/sequelize.js');

const Collection = require('../../../../configs/tables/collection');
const DSR = require('../../../../configs/tables/dsr');
const Form_generation = require('../../../../configs/tables/gift');
const Item = require('../../../../configs/tables/item');
require('dotenv').config();
const promoter = require('../../../../configs/tables/promoter');
const Quota = require('../../../../configs/tables/quota');
const Receipt = require('../../../../configs/tables/receipt');
const Retailer = require('../../../../configs/tables/retailer');
const Reward = require('../../../../configs/tables/reward');
const SKU = require('../../../../configs/tables/sku');
const Transaction = require('../../../../configs/tables/transaction');
const User = require('../../../../configs/tables/user');
const Scan = require('../../../../configs/tables/scan');
const Event = require('../../../../configs/tables/event');
const Gift = require('../../../../configs/tables/gift');
const Voucher = require('../../../../configs/tables/voucher');
const { authenticate } = require('../../../../configs/function/middlewares');
const {
  retailerRegionReport,
  retailerSummaryReport,
  weeklyMonthlyReport,
  retailerStorePerformance,
} = require('../../../../configs/function/retailer/reportGen');

const { getWeeksDiff } = require('../../../../configs/function/misc');

router.post('/targetOverview', authenticate, async (req, res) => {
  const { token } = req.body;
  try {
    const data = {
      totalStores: 0,
      timeGone: 0,
      activeStores: 0,
      effectiveStores: 0,
      onlineActiveStores: 0,
      offlineActiveStores: 0,
    };
    const dateNow = new Date();
    data.timeGone = getWeeksDiff(process.env.progStart, dateNow);
    const retailers = await Retailer.findAll({
      where: {},
    });
    retailers.map((e) => {
      data.totalStores++;
      if (e.status == 'Active') {
        data.activeStores++;
      }
      if (e.status == 'Effective') {
        data.activeStores++;
        data.effectiveStores++;
      }
      // console.log(e)
      if (
        (e.status == 'Active' || e.status == 'Effective') &&
        e['store_type'] == 'typeA'
      ) {
        data.onlineActiveStores++;
      } else if (
        (e.status == 'Active' || e.status == 'Effective') &&
        e['store_type'] == 'typeB'
      ) {
        data.offlineActiveStores++;
      }
    });
    return res.status(200).json({ data: [data] });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Internal Error' });
  }
});

router.post('/allocationSummary', authenticate, async (req, res) => {
  const { token } = req.body;
  try {
    const data = {
      targetAlloc: 0,
      completedAlloc: 0,
      reservedAlloc: 0,
      remainingAlloc: 0,
    };
    const quota = await Quota.findAll({
      where: {},
      attributes: [
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalAlloc'],
      ],
    });
    // console.log(quota[0])
    data.targetAlloc = quota[0].dataValues.totalAlloc || 0
    const rewards = await Reward.findAll({
      where: {
        status: {
          [Op.or]: ['entitled', 'redeemed'],
        },
      },
    });
    data.reservedAlloc = rewards.filter((e) => {
      if (e.status == 'entitled') return e;
    }).length;
    data.completedAlloc = rewards.filter((e) => {
      if (e.status == 'redeemed') return e;
    }).length;
    data.remainingAlloc =
      data.targetAlloc - data.completedAlloc - data.reservedAlloc;
    return res.status(200).json({ data: [data] });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Internal Error' });
  }
});

router.post('/regionalReport', async (req, res) => {
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
    const retailers = await Retailer.findAll({
      where: {},
      attributes: [
        'first_scan_date',
        'region',
        [sequelize.fn('COUNT', sequelize.col('scans.id')), 'n_scans'],
      ],
      group: [
        'retailer.id',
        'quota.id',
        'users.id',
        'users.name',
        'users.number',
        // 'rewards.id',
        'transactions.id',
      ],
      include: [
        {
          model: User,
          attributes: [
            'createdAt',
            'status',
            'tier1_date',
            'tier2_date',
            'tier3_date',
            'tier4_date',
            'tier5_date',
          ],
        },
        {
          model: Quota,
        },
        {
          model: Scan,
          attributes: [],
        },
        // {
        //   model: Reward,
        //   as: 'rewards',
        // },
        {
          model: Transaction,
          as: 'transactions',
          attributes: [
            'createdAt',
            'sales',
            'status',
            'promo',
            [
              sequelize.fn('SUM', sequelize.col('transactions.items.quantity')),
              'n_items',
            ],
          ],
          group: ['transactions.id'],
          include: [
            {
              model: Item,
              as: 'items',
              attributes: [],
            },
          ],
        },
      ],
    });
    // console.log(retailers[0].n_scans)
    const data = await retailerRegionReport(
      retailers,
      new Date(process.env.progStart)
    );

    // console.log('Object.values(data)', Object.values(data));
    return res.status(200).json({ data: Object.values(data) });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Internal Error' });
  }
});

router.post('/summaryReport', authenticate, async (req, res) => {
  const { startDate, endDate, token } = req.body;
  var stDate = "";
  var edDate = "";
  if (!startDate && !endDate) {
    stDate = new Date(process.env.progStart);
    edDate = new Date();
  } else {
    stDate = new Date(startDate).setHours(00, 00, 00, 000);
    edDate = new Date(endDate).setHours(23, 59, 59, 999);
  }
  try {
    const retailers = await Retailer.findAll({
      where: {},
      attributes: [
        'id',
        'first_scan_date',
        'region',
        'name',
        'code',
        'store_type',
        'qrcode',
        'status',
        'registration_date',
        'last_activity_date',
        'state',
        [sequelize.fn('COUNT', sequelize.col('scans.id')), 'n_scans'],
      ],
      group: [
        'retailer.id',
        'quota.id',
        'transactions.items.id',
        'users.id',
        'users.name',
        'users.number',
        // 'rewards.id',
        'transactions.id',
      ],
      include: [
        {
          model: User,
          attributes: [
            'createdAt',
            'status',
            'tier1_date',
            'tier2_date',
            'tier3_date',
            'tier4_date',
            'tier5_date',
          ],
        },
        {
          model: Quota,
        },
        {
          model: Scan,
          attributes: [],
        },
        {
          model: Transaction,
          as: 'transactions',
          attributes: [
            'id',
            'createdAt',
            'sales',
            'status',
            'nonproduct',
            'promo',
            [
              sequelize.fn('SUM', sequelize.col('transactions.items.quantity')),
              'n_items',
            ],
          ],
          group: ['transactions.id'],
          include: [
            {
              model: Item,
              as: 'items',
              attributes: ['skuId', 'quantity'],
            },
          ],
        },
      ],
    });

    const data = await retailerSummaryReport(
      retailers,
      new Date(process.env.progStart)
    );

    return res.status(200).json({ data: Object.values(data) });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Internal Error' });
  }
});
router.post('/storePerformance', authenticate, async (req, res) => {
  const { startDate, endDate, token } = req.body;
  try {
    const retailers = await Retailer.findAll({
      where: {},
      attributes: [
        'id',
        'first_scan_date',
        'region',
        'name',
        'code',
        'store_type',
        'qrcode',
        'status',
        'registration_date',
        'last_activity_date',
        'state',
        [sequelize.fn('COUNT', sequelize.col('scans.id')), 'n_scans'],
      ],
      group: [
        'retailer.id',
        'quota.id',
        'transactions.items.id',
        'rewards.id',
        'transactions.id',
        'transactions.user.id',
        'transactions.user.number'
      ],
      include: [

        {
          model: Quota,
        },
        {
          model: Scan,
          attributes: [],
        },
        {
          model: Reward,
          as: 'rewards',
          attributes: ['status'],
        },
        {
          model: Transaction,
          as: 'transactions',
          attributes: [
            'createdAt',
            'sales',
            'status',
            'promo',
            'nonproduct',
            'nonproductPrice',
            [
              sequelize.fn('SUM', sequelize.col('transactions.items.quantity')),
              'n_items',
            ],
          ],
          group: ['transactions.id', 'transactions.user.id'],
          include: [
            {
              model: Item,
              as: 'items',
              attributes: ['skuId', 'quantity'],
            },
            {
              model: User,
              as: 'user',
              attributes: ['status'],
            },
          ],
        },
      ],
    });
    const data = await retailerStorePerformance(
      retailers,
      new Date(process.env.progStart)
    );
    return res.status(200).json({ data: Object.values(data) });

  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Internal Error' });
  }
});

router.post('/weeklyMonthlyReport', authenticate, async (req, res) => {
  const { token, type } = req.body;
  try {
    const currentYear = new Date().getFullYear();
    let start = new Date(process.env.progStart).setHours(0, 0, 0, 0);
    let end = moment(new Date()).format('YYYY-MM-DD');

    const query = {
      createdAt: { [Op.between]: [start, end] },
    };
    const events = await Event.findAll({
      where: query,
    });
   
    const data = await weeklyMonthlyReport(type || 'Week', start, end, events);
 
    return res.status(200).json({ data: Object.values(data) });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Internal Error' });
  }
});

module.exports = router;
