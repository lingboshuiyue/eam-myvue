/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  const valid_map = ['admin', 'editor', 'level_one', 'level_two', 'level_three', 'level_four']
  return valid_map.indexOf(str.trim()) >= 0
}

/**
 * @param {string} url
 * @returns {Boolean}
 */
export function validURL(url) {
  const reg = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return reg.test(url)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validLowerCase(str) {
  const reg = /^[a-z]+$/
  return reg.test(str)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUpperCase(str) {
  const reg = /^[A-Z]+$/
  return reg.test(str)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validAlphabets(str) {
  const reg = /^[A-Za-z]+$/
  return reg.test(str)
}

/**
 * @param {string} email
 * @returns {Boolean}
 */
export function validEmail(email) {
  const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return reg.test(email)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function isString(str) {
  if (typeof str === 'string' || str instanceof String) {
    return true
  }
  return false
}

/**
 * @param {Array} arg
 * @returns {Boolean}
 */
export function isArray(arg) {
  if (typeof Array.isArray === 'undefined') {
    return Object.prototype.toString.call(arg) === '[object Array]'
  }
  return Array.isArray(arg)
}

/**
 * 验证 S/N 码
 * @returns {{validator: Function, require: boolean, trigger: string}}
 */
export function validateChart(rule, value, callback) {
  if (!value) { return callback(new Error('输入不能为空')) }
  const reg = /^[a-zA-Z0-9]+$/
  setTimeout(() => {
    if (!reg.test(value)) {
      return callback(new Error('只能输入英文字母和数字'))
    }
    callback()
  })
}

/* 验证内容是否英文数字以及下划线*/
export function isInteger(rule, value, callback) {
  const reg = /^[0-9]+$/
  if (!value) {
    callback()
  } else {
    if (!reg.test(value)) {
      callback(new Error('只能输入数值！'))
    } else {
      if (value <= 0) {
        return callback(new Error('资产价值必需大于0'))
      }
      callback()
    }
  }
}

export function isOptions(rule, value, callback) {
  console.log('测试选项')
  console.log(value)
  if (value != null) { callback() }
  return callback(new Error('必需填写！'))
  // const reg =/^[0-9]+$/;
  // if(!value){
  //   callback();
  // } else {
  //   if (!reg.test(value)){
  //     callback(new Error('只能输入数值！'));
  //   } else {
  //     if(value <= 0){
  //       return callback(new Error("资产价值必需大于0"))
  //     }
  //     callback();
  //   }
  // }
}
