import isUndefined from 'lodash/isUndefined';
import cloneDeep from 'lodash/cloneDeep';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';

const Y = ['Y'];
const YM = ['Y', 'M'];
const YMD = ['Y', 'M', 'D'];
const YMDT = ['Y', 'M', 'D', 'T'];
const YMDHM = ['YMD', 'H', 'm'];
const YMDWHM = ['YMDW', 'H', 'm'];

/**
 * addZero
 * @param { number } num
 */
function addZero(num) {
  return `${num < 10 ? '0' : ''}${num}`;
}

function makeRange(start, end, step = 1, unwanted) {
  const arr = [];
  for (let i = start; i <= end; i += step) {
    if (Array.isArray(unwanted)) {
      if (unwanted.indexOf(i) === -1) {
        arr.push(i);
      }
    } else {
      arr.push(i);
    }
  }
  return arr;
}

/**
 * 判断是否是闰年
 * @param { number } year
 */
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * 将 20170102 => 2017-01-02
 * @param { number | string } num
 */
function numToDate(num) {
  const str = `${num}`;
  const YN = str.substring(0, 4);
  const M = str.substring(4, 6);
  const D = str.substring(6, 8);
  return `${YN}-${M}-${D}`;
}

/**
 * 求时间区间的并集
 * @param { array } arr
 */
function parseDisabledArr(arr) {
  let min;
  let max;
  let arrNew = cloneDeep(arr);
  arrNew = arrNew.map((item) => {
    const { start, end } = item;
    if (!start && !end) {
      const dateTime = new Date(item).getTime();
      if (dateTime) {
        return {
          start: dateTime,
          end: dateTime,
        };
      }
      return false;
    }
    return {
      start: new Date(start).getTime(),
      end: new Date(end).getTime(),
    };
  });
  let newArr = arrNew.filter(item => !!item);
  // 求时间并集并求出 最大值和最小值
  newArr = newArr.filter((item) => {
    const { start, end } = item;
    if (start && !end) { // 求max
      if (!max) {
        max = start;
      } else {
        max = max > start ? start : max;
      }
      return false;
    }
    if (!start && end) {
      if (!min) {
        min = end;
      } else {
        min = min < end ? end : min;
      }
      return false;
    }
    if (end && start) {
      if (start > end) {
        warn('Datetime: Please check your disabledDate props returns');
        return false;
      }
      if (min && min >= start) {
        min = min < end ? end : min;
        return false;
      }
      if (max && max <= end) {
        max = max > start ? start : max;
        return false;
      }
      return true;
    }
    return true;
  });
  let startEnd = [];
  // 时间排序
  startEnd = newArr.sort((a, b) => a.start - b.start);
  return {
    maxTime: max,
    minTime: min,
    startEnd,
  };
}

/**
 * 求有限时间范围内的 disabledDate时间区间
 * @param { object } disabledArr
 * @param { string | number } minDateTime
 * @param { string | number } maxDateTime
 */

function getDateRangeArr(disabledDateObj, minDateTime, maxDateTime) {
  const {
    minTime,
    maxTime,
    startEnd,
  } = disabledDateObj;
  // 时间范围
  const dateRangeArr = [];
  // 计算时间区间
  if (minTime) { // 计算小于区间
    if (minDateTime <= minTime) {
      dateRangeArr.push({
        start: minDateTime,
        end: minTime,
      });
    }
  }
  /* eslint no-continue:0 */
  for (let i = 0; i < startEnd.length; i++) { // 计算中间区间
    const { start, end } = startEnd[i];
    if (end < start) {
      warn('Datetime: Please check your disabledDate props returns');
      continue;
    }
    if (start >= minDateTime && end <= maxDateTime) { // start end 都在 取值范围内
      dateRangeArr.push(startEnd[i]);
    }
    if (start <= minDateTime && end >= minDateTime && end <= maxDateTime) { // start 不在 end 在
      dateRangeArr.push({
        start: minDateTime,
        end,
      });
      continue;
    }
    if (start >= minDateTime && start <= maxDateTime && end >= maxDateTime) { // end 不在 start 在
      dateRangeArr.push({
        start,
        end: maxDateTime,
      });
      continue;
    }
    if (start <= minDateTime && end >= maxDateTime) { // end 不在 start 不在
      dateRangeArr.push({
        start: minDateTime,
        end: maxDateTime,
      });
      continue;
    }
  }
  // 计算大于时间区间的范围
  if (maxTime) {
    if (maxDateTime > maxTime) {
      dateRangeArr.push({
        start: maxTime,
        end: maxDateTime,
      });
    }
  }
  return dateRangeArr;
}

/**
 * 根据 年 月 计算 天 数
 * @param { Number } year
 * @param { Number } month
 * @returns NUM<number>
 */

function getMonthDays(year, month) {
  let NUM = 30;
  if ([1, 3, 5, 7, 8, 10, 12].indexOf(month) !== -1) {
    NUM = 31;
  }
  if (month === 2) {
    NUM = isLeapYear(year) ? 29 : 28;
  }
  return NUM;
}

/**
 * 解析日期
 * @param { object | string | date | string | number } date
 * @returns times
 */
function parseDate(value) {
  let date = value;
  if (!value) {
    return new Date().getTime();
  }
  if (isObject(date)) {
    date = date.value || date;
  }
  // array
  if (isArray(date)) {
    date = new Date(...date).getTime();
  } else {
    // string number  null 、''、undefined
    date = new Date(date).getTime();
  }
  if (date) {
    return date;
  }
  console.warn('Invalid Date ', value);
  return new Date().getTime();
}


/**
 * 计算时间范围类的月份，根据年
 * @param { String | Number} minDate
 * @param { String | Number } maxDate
 * @param { Number } year
 * @returns year<array>
 */
function getMonthsByYear({ minDate, maxDate, year }) {
  const max = new Date(maxDate);
  const min = new Date(minDate);
  const maxYear = max.getFullYear();
  const minYear = min.getFullYear();
  let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((item, index) => ({
    text: index + 1,
    value: index,
  }));
  if (year > minYear && year < maxYear) {
    return arr;
  }
  const maxTime = max.getTime();
  const minTime = min.getTime();
  if (year === maxYear) {
    arr = arr.filter((item) => {
      const date = new Date(year, item.value, 1);
      return date.getTime() < maxTime;
    });
  }
  if (year === minYear) {
    arr = arr.filter((item) => {
      const date = new Date(year, item.value + 1, 0);
      return date.getTime() > minTime;
    });
  }
  return arr;
}

/**
 * 根据年月，在最大、最小日期范围内，计算当月天数
 * @param minDate { Number|String } 最小日期
 * @param maxDate { Number|String } 最大日期
 * @param year { Number } 当前年
 * @param month { Number } 当前月
 * @returns days<array>
 * */

function getDaysByMonth({
  minDate, maxDate, year, month,
}) {
  const max = new Date(maxDate);
  const min = new Date(minDate);
  const maxYear = max.getFullYear();
  const minYear = min.getFullYear();
  const NUM = getMonthDays(year, month + 1);
  let arr = [];
  for (let i = 1; i <= NUM; i++) {
    arr.push({
      text: i,
      value: i,
    });
  }
  if (year > minYear && year < maxYear) {
    return arr;
  }
  const maxTime = max.getTime();
  const minTime = min.getTime();
  if (year === minYear) {
    arr = arr.filter((item) => {
      const date = new Date(year, month, item.value);
      return date.getTime() > minTime;
    });
  }
  if (year === maxYear) {
    arr = arr.filter((item) => {
      const date = new Date(year, month, item.value);
      return date.getTime() < maxTime;
    });
  }
  return arr;
}

/**
 * 根据最大时间值 最小时间值 求出上下各的天数
 * @param {*} param0
 * @returns days<array>
 */
function getDaysByYear({
  minDate, maxDate, year,
}) {
  const days = [];
  const maxYear = new Date(maxDate).getFullYear();
  const minYear = new Date(minDate).getFullYear();
  const arr = [];
  const start = year - 1 >= minYear ? year - 1 : minYear;
  for (let i = 0; i <= 2; i++) {
    if (i + start <= maxYear) {
      arr.push(start + i);
    }
  }
  arr.forEach((item) => {
    for (let i = 1; i < 13; i += 1) {
      getDaysByMonth({
        minDate, maxDate, year: item, month: i - 1,
      }).forEach((el) => {
        days.push(`${item}${addZero(i)}${addZero(el.value)}` - 0);
      });
    }
  });
  return days;
}

export default {
  isUndefined,
  isArray,
  isObject,
  cloneDeep,
  Y,
  YM,
  YMD,
  YMDT,
  YMDHM,
  YMDWHM,
  makeRange,
  isLeapYear,
  numToDate,
  parseDate,
  getMonthsByYear,
  getDaysByMonth,
  getDaysByYear,
  addZero,
  getDateRangeArr,
  parseDisabledArr,
};
