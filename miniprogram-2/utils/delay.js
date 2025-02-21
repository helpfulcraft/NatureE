/**
 * 延迟执行
 * @param {number} time 延迟时间(ms)
 * @returns {Promise}
 */
export const delay = (time = 500) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

/**
 * 带数据的延迟执行
 * @param {any} data 要返回的数据
 * @param {number} time 延迟时间(ms)
 * @returns {Promise<any>}
 */
export const delayWithData = (data, time = 500) => {
  return delay(time).then(() => data);
}; 