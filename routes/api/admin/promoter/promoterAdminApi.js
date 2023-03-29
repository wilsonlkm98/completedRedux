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
const Quota = require('../../../../configs/tables/quota');
const Receipt = require('../../../../configs/tables/receipt');
const Promoter = require('../../../../configs/tables/promoter');
const Reward = require('../../../../configs/tables/reward');
const SKU = require('../../../../configs/tables/sku');
const Transaction = require('../../../../configs/tables/transaction');
const User = require('../../../../configs/tables/user');
const Scan = require('../../../../configs/tables/scan');
const Event = require('../../../../configs/tables/event');
const { authenticate } = require('../../../../configs/function/middlewares');

const {
  promoterRegionReport,
  promoterSummaryReport,
  weeklyMonthlyReport,
} = require('../../../../configs/function/promoter/reportGen');

router.post('/overviewReport', authenticate, async (req, res) => {
  const { token } = req.body;
  try {
    const data = {
      total: 0,
      active: 0,
      trialDays: 0,
    };
    const promoters = await Promoter.findAll({
      where: {},
    });
    data.total = promoters.length;
    promoters.map((r) => {
      if (r.status == 'Active' || r.status == 'Effective') {
        data.active++;
      }
      data.trialDays += r['trial_days'];
    });
    return res.status(200).json({ data: [data] });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Internal Error' });
  }
});

router.post('/regionalReport', authenticate, async (req, res) => {
  const { startDate, endDate, token } = req.body;
  try {
    const promoters = await Promoter.findAll({
      attributes: [
        'trial_days',
        'region',
        [sequelize.fn('COUNT', sequelize.col('scans.id')), 'n_scans'],
      ],
      group: [
        'promoter.id',
        'users.id',
        'users.name',
        'users.number',
        'rewards.id',
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
          model: Scan,
          attributes: [],
        },
        {
          model: Reward,
          as: 'rewards',
        },
        {
          model: Transaction,
          as: 'transactions',
          attributes: [
            'createdAt',
            'sales',
            'status',
            'promo',
            [
              sequelize.fn('COUNT', sequelize.col('transactions.items.id')),
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

    const data = await promoterRegionReport(
      promoters,
      new Date(process.env.progStart)
    );
    return res.status(200).json({ data: Object.values(data) });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Internal Error' });
  }
});

router.post('/summaryReport', authenticate, async (req, res) => {
  const { startDate, endDate, token } = req.body;
  try {
    const promoters = await Promoter.findAll({
      attributes: [
        'trial_days',
        'region',
        'name',
        'code',
        'qrcode',
        'status',
        'state',
        [sequelize.fn('COUNT', sequelize.col('scans.id')), 'n_scans'],
      ],
      group: [
        'promoter.id',
        'users.id',
        'users.name',
        'users.number',
        'rewards.id',
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
          model: Scan,
          attributes: [],
        },
        {
          model: Reward,
          as: 'rewards',
        },
        {
          model: Transaction,
          as: 'transactions',
          attributes: [
            'createdAt',
            'sales',
            'status',
            'promo',
            [
              sequelize.fn('COUNT', sequelize.col('transactions.items.id')),
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

    // todo Phone Number, Registration - Entitled Rate rows data missing, and found extra rows data
    const data = await promoterSummaryReport(
      promoters,
      new Date(process.env.progStart)
    );
    return res.status(200).json({ data: Object.values(data) });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Internal Error' });
  }
});

router.post('/weeklyMonthlyReport', authenticate, async (req, res) => {
  const { startDate, endDate, token, type } = req.body;
  try {
    const currentYear = new Date().getFullYear();
    let start = new Date(process.env.progStart).setHours(0, 0, 0, 0);
    let end = new Date().setHours(23, 59, 59, 999);
    if (startDate && endDate) {
      start = new Date(startDate).setHours(0, 0, 0, 0);
      end = new Date(endDate).setHours(23, 59, 59, 999);
    }
    console.log(moment(end).format('YYYY-MM-DD'));
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
