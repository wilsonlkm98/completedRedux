const { Op } = require('sequelize');
const moment = require('moment');
const sequelize = require('../../sequelize.js');

const Transaction = require('../../tables/transaction');
const User = require('../../tables/user');
const Receipt = require('../../tables/receipt');
const Retailer = require('../../tables/retailer');
const Item = require('../../tables/item');
// const Collection = require('../../../configs/tables/collection');
const Reward = require('../../tables/reward');
const Voucher = require('../../tables/voucher');
const Promoter = require('../../tables/promoter');

const validationList = async (startDate, endDate, status, campaignId) => {
  const data = [];

  const query = {
    status: status ? status : 'Pending',
  };
  if (startDate && endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    query.transaction_date = { [Op.between]: [start, end] };
  }
  console.log('checking');
  try {
    const transactions = await Transaction.findAll({
      where: query,
      attributes: [
        'id',
        'status',
        'sales',
        'transaction_date',
        'reason',
        'promo',
        'category',
        'validator_name',
        'validator_id',
        'validated_date',
        [sequelize.fn('SUM', sequelize.col('items.price')), 'receipt_amount'],
        // [
        //   sequelize.fn('SUM', sequelize.col('items.quantity')),
        //   'total_sold_unit',
        // ],
      ],
      group: [
        'receipts.id',
        'user.id',
        'promoter.id',
        'user.name',
        'user.number',
        'transaction.id',
        'items.id',
        'rewards.id',
        'retailer.id',
        'rewards.voucher.id',
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'number'],
        },
        {
          model: Receipt,
          as: 'receipts',
          attributes: ['image_key', 'receipt_date', 'invoice_No', 'url', 'expired'],
        },
        {
          model: Retailer,
          as: 'retailer',
          attributes: ['name'],
        },
        {
          model: Promoter,
          as: 'promoter',
          attributes: ['name'],
        },
        {
          model: Item,
          as: 'items',
        },
        {
          model: Reward,
          as: 'rewards',
          include: [
            {
              model: Voucher,
              as: 'voucher',
              attributes: ['code'],
            },
          ],
        },
      ],
    });

    transactions.map(async (e) => {
      const temp = {
        id: e.id,
        status: e.status,
        receiptDate: e.receipts[0]
          ? moment(e.receipts[0].receipt_date).format('YYYY/MM/DD')
          : 'NA',
        uploadDate: moment(e.transaction_date).format('YYYY/MM/DD'),
        name: e.user.name,
        phoneNumber: e.user.number,
        storeName: e.retailer ? e.retailer.name : '-',
        promoterName: e.promoter ? e.promoter.name : '-',
        channelName: e.channel ? e.channel.name : '-',
        receiptNumber: e.receipts[0] ? e.receipts[0].invoice_No : 'NA',
        receiptAmount: e.sales,
        receiptKey: e.receipts[0].image_key,
        expired: e.receipts[0].expired,
        url: e.receipts[0].url,
        totalSold: e.items.map((c) => { return c.quantity }).reduce((a, b) => a + b, 0), // REQUIRED : Add if want record qty of sku during validate
        // entitledPoints: e.rewards.length,
        promo: e.promo ? 'YES' : 'NO',
        reason: e.reason,
        rewardType: 'Voucher',
        doneBY: e.validator_name,
        actionDate: e.validated_date
          ? moment(e.validated_date).format('YYYY-MM-DD')
          : 'NA',
        actionTime: e.validated_date
          ? moment(e.validated_date).format('hh:mm:ss')
          : 'NA',
      };
      temp.voucherCode = e.rewards
        .map((r) => {
          if (r.voucher) {
            return r.voucher.code;
          }
        })
        .toString();
      // console.log(temp);
      data.push(temp);
    });
    return data;
  } catch (err) {
    console.log(err);
  }
};

const overviewRpt = async () => {
  const data = [];
  const query = {};
  console.log('checking');
  try {
    const transactions = await Transaction.findAll({
      where: query,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count'],
      ],
      group: ['transaction.status'],
    });
    const time = await Transaction.findAll({
      where: query,
      attributes: [
        [sequelize.fn('MIN', sequelize.col('transaction_date')), 'earliest'],
        [sequelize.fn('MAX', sequelize.col('validated_date')), 'latest'],
      ],
    });
    // console.log(time);
    const temp = {
      total: 0,
      rejected: 0,
      pending: 0,
      approved: 0,
      issue: 0,
      earliestTrans:
        time[0] && moment(time[0].dataValues.earliest).format('YYYY-MM-DD'),
      latestValidate:
        time[0] && moment(time[0].dataValues.latest).format('YYYY-MM-DD'),
    };
    transactions.map((e) => {
      temp.total += parseInt(e.dataValues.count)
      if (e.dataValues.status == 'Rejected') {
        temp.rejected += parseInt(e.dataValues.count)
      } else if (e.dataValues.status == 'Pending') {
        temp.pending += parseInt(e.dataValues.count)
      } else if (e.dataValues.status == 'Approved') {
        temp.approved += parseInt(e.dataValues.count)
      } else if (e.dataValues.status == 'Issue') {
        temp.issue += parseInt(e.dataValues.count)
      }
    });
    // console.log(temp);
    return temp;
  } catch (err) {
    console.log(err);
  }
};

const lastFewDays = async (days) => {
  const results = await sequelize.query(
    `${'select date(transaction_date) as thedate, ' +
    "count(id) filter (where status = 'Pending') as mypending, " +
    "count(id) filter (where status = 'Rejected') as myrejected, " +
    "count(id) filter (where status = 'Approved') as myapproved, " +
    "count(id) filter (where status = 'Issue') as myissues " +
    "from transaction WHERE transaction_date > current_date - interval '"
    }${days}' day group by date(transaction_date)`
  );
  // return results[1].fields;
  // console.log(results[0]);
  return results[0];
};

module.exports = {
  validationList,
  lastFewDays,
  overviewRpt,
};
