require("dotenv").config();

const { Router } = require("express");

const moment = require("moment");

/**
  ----- RANDOM GENERATOR -----
  1.) RANDOM VALUE
  3.) GENERATE REFERRAL CODE
  4.) GENERATE TRACKING NUMBER
  5.) GENERATE SCANNING CODE

  ----- CALCULATIONS -----
  1.) DIFFERENCE IN DAYS
  2.) DIFFERENCE IN MONTHS

  ----- FILE -----
  1.) PROCESS CSV FILE
*/

// ================================================== GLOBAL VARIABLES ================================================== //
const nums = "0123456789";
const lowerAlpha = "abcdefghijklmnopqrstuvwxyz";
// const upperAlpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const chars = nums + lowerAlpha;
var namedMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// ================================================== RANDOM GENERATOR ================================================== //
/**
 * GENERATE RANDOM VALUE
 * @param {Number} length required, number || alphabet || others
 * @param {String} type optional
 * @param {*} capOnly optional true || false || "random"
 * @returns value
 */
const makeid = (length) => {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


const randomValue = (length, type, capOnly) => {
  let value = "";
  if (type === "number") {
    // numbers
    for (let i = 0; i < length; i++) {
      value += nums[Math.floor(Math.random() * nums.length)];
    }
  } else if (type === "alphabet") {
    // alphabet
    for (let i = 0; i < length; i++) {
      value += lowerAlpha[Math.floor(Math.random() * lowerAlpha.length)];
    }
  } else {
    // alphanumeric
    for (let i = 0; i < length; i++) {
      value += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  if (capOnly && capOnly === true) return value.toUpperCase();
  else if (capOnly && capOnly === "random") {
    return value
      .split("")
      .map(x => {
        const bool = Math.random() < 0.5;
        if (bool) return x.toUpperCase();
        return x;
      })
      .join("");
  }

  return value;
};

/**
 * GENERATE REFERRAL CODE
 * @param { Function } callback callback(err, referralCode);
 */
const genReferCode = callback => {
  let referralCode = makeid(10);

  User.findOne({ where: { referralCode } })
    .then(found => {
      if (found) {
        genReferCode(callback);
      } else {
        callback(null, referralCode);
      }
    })
    .catch(err => {
      console.error("Error when finding user with this refer code in generate refer code");
      console.error(err);
      callback(err, null);
    });
};

/**
 * GENERATE TRACKING NUMBER
 * @param { Function } callback callback(err, trackingNumber);
 */
const genTrackingNum = callback => {
  let trackingId = randomValue(22, "alphanumeric", "random");
  for (let i = 0; i <= 21; i++) {
    trackingId += chars[Math.floor(Math.random() * chars.length)];
  }

  Order.findOne({ where: { trackingId } })
    .then(found => {
      if (found) {
        genTrackingNum(callback);
      } else {
        callback(null, trackingId);
      }
    })
    .catch(err => {
      console.error("Error when finding exist tracking id in generate tracking number");
      console.error(err);
      callback(err, null);
    });
};

/**
 * GENERATE SCANNING CODE
 * @param {Number} qty number of codes to be generated
 * @param {Function} callback callback(err, codes)
 */
const genScanCodes = (qty, callback) => {
  Code.findAll()
    .then(codes => {
      const allCodes = codes.map(code => code.code);
      let generated = [];
      let i = qty;

      const processCode = fn => {
        if (i > 0) {
          const code = randomValue(10, "alphanumeric", true);
          if (!allCodes.includes(code)) {
            generated.push(code);
            i--;
            processCode(fn);
          } else {
            processCode(fn);
          }
        } else {
          fn();
        }
      };

      processCode(() => callback(null, generated));
    })
    .catch(err => {
      console.error("Error when finding all codes in genScanCodes");
      console.error(err);
      callback(err);
    });
};

// ================================================== CALCULATIONS ================================================== //
/**
 * DIFFERENCE IN DAYS
 * @param {Date} date1 start date
 * @param {Date} date2 end date
 * @returns total days difference
 */
const differenceInDays = (date1, date2) => {
  let startDate = new Date();
  if (date1) {
    startDate = new Date(date1);
  }

  let endDate = new Date()
  if (date2 != null) {
    endDate = new Date(date2);
  }

  //console.log(endDate)
  const ms = 1000;
  const s = 60;
  const m = 60;
  const h = 24;
  // console.log({startDate, endDate})
  const timeDiff = endDate - startDate;
  const dayDiff = timeDiff / (ms * s * m * h);
  return Math.ceil(dayDiff);
};

/**
 *
 * @param {Date} date1 start date
 * @param {Date} date2 end date
 * @returns total months difference
 */
const differenceInMonths = (date1, date2) => {
  const startDate = new Date(date1);
  const endDate = new Date(date2);
  const startMonth = startDate.getMonth();
  const endMonth = endDate.getMonth();
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  return (endDay - startDay) / 30 + endMonth - startMonth + 12 * (endYear - startYear);
};

// ================================================== FILE ================================================== //
// ----- PROCESS CSV FILE ----- //
/**
 * Process CSV file
 * @param {String} data Csv string
 * @param {Function} callback callback(err, data)
 */
const processCsv = (data, callback) => {
  let error = null;
  const lines = data.split("\n");
  let voucherCodes = [];

  if (lines.length < 2) callback("Empty CSV detected, please upload again");
  else {
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const columns = line.split(",");
      if (columns.length !== 1) {
        error = "Please insert the voucher codes in 1 column only";
        break;
      }
      const voucherCode = columns[0];
      if (!voucherCode) continue;
      voucherCodes.push(voucherCode);
    }

    if (error) callback(error);
    else callback(null, voucherCodes);
  }
};

const getMostFrequent = (arr) => {
  let m = 0
  let mf = 1
  let item
  for (var i = 0; i < arr.length; i++) {
    for (var j = i; j < arr.length; j++) {
      if (arr[i] == arr[j])
        m++;
      if (mf <= m) {
        mf = m;
        item = arr[i];
      }
    }
    m = 0;
  }
  return item
}

const getDay = (date) => {
  const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let day = weekday[date.getDay()];
  return day
}

const getDays2Active = (progStartDate, activeDate) => {
  const start = moment(progStartDate);
  const end = moment(activeDate);
  const diff = end.diff(start, "days")
  // console.log({progStartDate, activeDate})
  return diff
}

const weekNumber = (date) => {
  let thedate = new Date(date)
  var onejan = new Date(thedate.getFullYear(), thedate.getMonth(),1);
  var today = new Date(thedate.getFullYear(), thedate.getMonth(), thedate.getDate());
  var days = Math.floor((thedate - onejan) /
    (24 * 60 * 60 * 1000));

  var weekNumber = Math.ceil(days / 7);
  return Math.ceil(weekNumber)
}

const getWeeksDiff = (startDate, endDate) => {
  const msInWeek = 1000 * 60 * 60 * 24 * 7;
  let ed = new Date(endDate)
  let sd = new Date(startDate)
  console.log(ed)
  return Math.round(Math.abs(ed - sd) / msInWeek);
}

const getStartEndDays = (date) => {
  var curr = new Date(date); // get current date

  var first = curr.getDate(); // First day is the day of the month - the day of the week
  // console.log('ffff',curr.getDate() ,curr.getDay())
  var last = first + 6; // last day is the first day + 6

  var firstday = dateFormater(new Date(curr.setDate(first)), '-');
  var lastday = dateFormater(new Date(curr.setDate(last)), '-')
  return { firstday, lastday }
}

function dateFormater(date, separator) {
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();

  // show date and month in two digits
  if (day < 10) {
    day = '0' + day;
  }
  if (month < 10) {
    month = '0' + month;
  }

  // now we have day, month and year
  // use the separator to join them
  return year + separator + month + separator + day;
}


const allWeek = (date1, date2) => {
  const msInWeek = 1000 * 60 * 60 * 24 * 7;
  let startweek = weekNumber(date1)
  let endweek = weekNumber(date2)
  let numWeeks = endweek - startweek
  let weekNum = startweek
  let startDay = new Date(date1)
  let w1 = getStartEndDays(date1)
  let weeks = [{ weekNum, firstday: w1.firstday, lastday: w1.lastday }]
  // console.log('data1',date1)
  console.log('numWeeks', numWeeks)
  for (let i = 0; i <= numWeeks; i++) {
    weekNum = i
    startDay.setDate(startDay.getDate() + 7);
    let flwW = getStartEndDays(startDay)
    console.log('flww', flwW)
    weeks.push({ weekNum, firstday: flwW.firstday, lastday: flwW.lastday })
  }
  console.log(weeks)
  return weeks
}

const allMonth = (date1, date2) => {
  let yr = new Date(date1).getFullYear()
  let em = new Date(date2).getMonth()
  let sm = new Date(date1).getMonth()
  console.log({ em, sm })
  let count = 0
  let months = []
  for (const nm of namedMonths) {
    if (count >= sm && count <= em) {
      const firstday = dateFormater(new Date(yr, count, 1), '-')
      const lastday = dateFormater(new Date(yr, count + 1, 0), '-')
      months.push({ month: nm, firstday, lastday })
    }
    count++
  }
  console.log(months)
  return months
}

const getNameMonth = (date) => {
  let em = new Date(date).getMonth()
  return namedMonths[em]
}

const generateCode = (length) => {
  let max = "";
  let min = "";
  for (let i = 0; i < length; i++) {
    max += "9";
    min += "1";
  }
  max = parseInt(max);
  min = parseInt(min);

  const otp = Math.floor(Math.random() * (max - min + 1)) + min;
  return otp;
};

module.exports = {
  generateCode,
  genTrackingNum,
  genReferCode,
  genScanCodes,
  randomValue,
  differenceInDays,
  differenceInMonths,
  processCsv,
  makeid,
  getMostFrequent,
  getDay,
  allWeek,
  allMonth,
  getNameMonth,
  weekNumber,
  getDays2Active,
  getWeeksDiff
};
