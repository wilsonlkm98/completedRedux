require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const childProcess = require('child_process');
const moment = require('moment');
const AWS = require("aws-sdk");
const router = express.Router();
const sequelize = require('../../../../configs/sequelize.js');

const Collection = require('../../../../configs/tables/collection');
const DSR = require('../../../../configs/tables/dsr');
const Item = require('../../../../configs/tables/item');
require('dotenv').config();

const Receipt = require('../../../../configs/tables/receipt');
const Reward = require('../../../../configs/tables/reward');
const SKU = require('../../../../configs/tables/sku');
const Transaction = require('../../../../configs/tables/transaction');
const User = require('../../../../configs/tables/user');
const Retailer = require('../../../../configs/tables/retailer');
const Scan = require('../../../../configs/tables/scan');
const Event = require('../../../../configs/tables/event');
const Visit = require('../../../../configs/tables/visit');
const POSM = require('../../../../configs/tables/posm');
const { authenticate } = require('../../../../configs/function/middlewares');
const {
  dsrRegionReport,
  dsrSummaryReport,
  dsrFullReport,
  weeklyMonthlyReport,
} = require('../../../../configs/function/dsr/reportGen');

router.post('/overviewReport', authenticate, async (req, res) => {
  try {
    const data = {
      total: 0,
      active: 0,
      effective: 0,
      inactive: 0,
    };
    const dsrs = await DSR.findAll({});
    dsrs.map((e) => {
      if (e.status == 'Active') data.active++
      else if (e.status === 'Effective') {
        data.effective++
      } else if (e.status === 'Inactive') {
        data.inactive++
      }
      data.total++
    });

    return res.status(200).json({ data: [data] });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Internal Error' });
  }
});

router.post('/storeSum', authenticate, async (req, res) => {
  const { token } = req.body;
  try {
    const data = {
      stores: 0,
      completedPosm: 0,
      pendingPosm: 0,
      rejectedPosm: 0,
    };
    data.stores = await Retailer.count({
      where: {},
    });
    const posms = await POSM.findAll({});
    posms.map((e) => {
      if (e.status == 'Approved')
        data.completedPosm++
      else if (e.status == 'Pending')
        data.pendingPosm++
      else if (e.status == 'Rejected')
        data.rejectedPosm++
    });
    return res.status(200).json({ data: [data] });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Internal Error' });
  }
});

router.post('/regionalReport', authenticate, async (req, res) => {
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
    const dsrs = await DSR.findAll({
      attributes: [
        'region',
        [sequelize.fn('COUNT', sequelize.col('scans.id')), 'n_scans'],
        [sequelize.fn('COUNT', sequelize.col('visits.id')), 'n_visits'],
      ],
      group: [
        'dsr.id',
        'users.id',
        'users.name',
        'posms.id',
        'users.number',
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
          model: POSM,
          as: 'posms',
          attributes: ['number', 'status'],
        },
        {
          model: Visit,
          attributes: [],
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
    const data = await dsrRegionReport(dsrs, new Date(process.env.progStart));
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
    stDate = new Date(startDate);
    edDate = new Date(endDate);
  }
  try {
    const dsrs = await DSR.findAll({
      where: {
        createdAt: {
          [Op.between]: [moment(stDate).startOf('day').format(), moment(edDate).endOf('day').format()],
        },
      },
      attributes: [
        'region',
        'name',
        'code',
        'qrcode',
        'status',
        'state',
        [sequelize.fn('COUNT', sequelize.col('scans.id')), 'n_scans'],
        [sequelize.fn('COUNT', sequelize.col('visits.id')), 'n_visits'],
      ],
      group: [
        'dsr.id',
        'users.id',
        'users.name',
        'posms.id',
        'users.number',
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
          model: POSM,
          as: 'posms',
          attributes: ['number', 'status'],
        },
        {
          model: Visit,
          attributes: [],
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
    const data = await dsrSummaryReport(dsrs, new Date(process.env.progStart));
    return res.status(200).json({ data: Object.values(data) });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Internal Error' });
  }
});

router.post('/weeklyMonthlyReport', authenticate, async (req, res) => {
  const { startDate, endDate, token, type } = req.body;
  try {
    let start = new Date(process.env.progStart).setHours(0, 0, 0, 0);
    let end = new Date().setHours(23, 59, 59, 999);
    if (startDate && endDate) {
      start = new Date(startDate).setHours(0, 0, 0, 0);
      end = new Date(endDate).setHours(23, 59, 59, 999);
    }
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

router.post('/fullReport', authenticate, async (req, res) => {
  const { startDate, endDate, token, type } = req.body;
  try {
    const dsrs = await DSR.findAll({
      attributes: ['region', 'name', 'code', 'qrcode', 'number'],
      include: [
        {
          model: Visit,
          as: 'visits',
          include: [
            {
              model: Retailer,
              attributes: ['name', 'city', 'state', 'region'],
            },
          ],
        },
      ],
    });
    const data = await dsrFullReport(dsrs, new Date(process.env.progStart));
    return res.status(200).json({ data: Object.values(data) });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Internal Error' });
  }
});

router.post("/posm/fetch", authenticate, async (req, res) => {
  const { startDate, endDate, status, token } = req.body;
  const newStatus = status ? status : "Pending";
  try {
    var stDate = "";
    var edDate = "";
    if (!startDate && !endDate) {
      stDate = new Date(process.env.progStart).setHours(00, 00, 00, 000);
      edDate = new Date(new Date().setHours(23, 59, 59, 999));
    } else {
      stDate = new Date(startDate).setHours(00, 00, 00, 000);
      edDate = new Date(endDate).setHours(23, 59, 59, 999);
    }

    const trans = await POSM.findAll({
      where: {
        status: newStatus,
        createdAt: {
          [Op.between]: [
            moment(stDate).startOf("day").format(),
            moment(edDate).endOf("day").format(),
          ],
        },
      },
      include:
      {
        model: Retailer,
        as: 'retailer',
        include:
        {
          model: DSR,
          as: 'dsr'
        },
      },
    });

    const s3 = new AWS.S3();
    let data = [];
    for (let i = 0; i < trans.length; i++) {
      const tran = trans[i].dataValues;
      const id = tran.id;
      const store = tran.retailer;
      const name = store.name;
      const code = store.code;
      const registerDate = new Date(store.registration_date).toLocaleString(
        "en-GB"
      );
      const uploadDate = new Date(tran.createdAt).toLocaleDateString("en-GB");
      const status = tran.status;

      const param = {
        Bucket: process.env.BUCKETNAME,
        Key: tran.image,
        Expires: 86400,
      };

      let today = new Date();
      let checkDate = tran.expired;
      const url = [];
      if (today > checkDate || !tran.url) {
        const posmImage = await Promise.resolve(
          s3.getSignedUrlPromise("getObject", param)
        );
        const updatePOSM = await POSM.findOne({ where: { id: tran.id } })
        if (updatePOSM) {
          updatePOSM.url = posmImage
          updatePOSM.expired = today.setDate(today.getDate() + 1)
          await updatePOSM.save();
          url.push(posmImage);
        }
      } else {
        url.push(tran.url);
      }

      data.push({
        id,
        name,
        type: tran.dsrId ? 'Merchandiser' : 'Retailer',
        code,
        registerDate,
        uploadDate,
        status,
        category: tran.category,
        image: url[0],
        dsrName: tran.retailer.dsr.name,

        reason: tran.reason,
        doneBY: tran.validator_name,
        actionDate: tran.validated_date
          ? moment(tran.validated_date).format('YYYY-MM-DD')
          : 'NA',
        actionTime: tran.validated_date
          ? moment(tran.validated_date).format('hh:mm:ss')
          : 'NA',
      });
    }

    return res.status(200).json({ data });

  } catch (error) {
    console.error("Error when verifying admin token");
    console.error(error);
    return res.status(400).json({ error: "Internal Error" });
  }
});

router.post("/validate", async (req, res) => {
  const {
    id,
    reason,
    category,
    status,
    token,
    validatorId,
    validatorName,
  } = req.body;
  console.log(req.body);
  if (!token) return res.status(400).json({ error: "Unverified request" });
  if (status !== "Approved" && status !== "Rejected")
    return res.status(400).json({ error: "Status not found" });
  try {
    const foundTran = await POSM.findByPk(id, {
      include: [DSR, Retailer],
    });
    if (!foundTran) {
      return res.status(400).json({ error: "POSM not found" });
    }
    const foundStore = await Retailer.findOne({ where: { id: foundTran.retailerId } })
    if (!foundStore) {
      return res.status(400).json({ error: "Tran Store not found" });
    }

    const foundDSR = await DSR.findOne({ where: { id: foundStore.dataValues.dsrId } })
    if (!foundDSR) {
      return res.status(400).json({ error: "Tran Store not found" });
    }

    if (status === "Approved") {
      //update store status
      foundDSR.status = 'Effective'
      await foundDSR.save();

      //check existing activeStore event
      const checkActiveDSR = await Event.findOne({ where: { type: 'activeDSR', dsrId: foundDSR.id, } })
      if (!checkActiveDSR) {
        const newEventDSR = Event.build({
          type: 'activeDSR',
          amount: 1,
          dsrId: foundDSR.id,
        })
        await newEventDSR.save();
      }
      foundTran.status = status;
      foundTran.category = category;
      foundTran.validator_id = validatorId;
      foundTran.validator_name = validatorName;
      foundTran.validated_date = Date.now();
      await foundTran.save();

      return res.status(200).json({ message: "Approved Success" });
    } else if (status === "Rejected") {

      if (foundTran.status !== "Approved") {
        foundTran.status = status;
        foundTran.reason = reason;
      }
      foundTran.category = category;
      foundTran.status = status;
      foundTran.validator_id = validatorId;
      foundTran.validator_name = validatorName;
      foundTran.validated_date = Date.now();

      await foundTran.save();
      return res.status(200).json({ message: "Rejected Success" });
    }
    return res.status(200).json();
  } catch (error) {
    console.error("Error caught in admin receipt validation API");
    console.error(error);
    return res.status(400).json({ error: "Internal Error" });
  }
});

module.exports = router;
