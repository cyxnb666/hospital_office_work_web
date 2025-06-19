import request from '@/assets/request/index'

/**
 * 获取患者列表数据
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getCustomersByPage(params) {
    return request({
        url: '/customer/getCustomerListByPage',
        method: 'post',
        data: params
    })
}

/**
 * 获取患者详情
 * @param {Object} params - customerId和topicId
 * @returns {Promise}
 */
export function getCustomerById(params) {
    return request({
        url: '/customer/getCustomerById',
        method: 'post',
        data: params
    })
}

export function uploadReport(data) {
    return request({
        url: '/customer/uploadReport',
        method: 'post',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

/**
 * 患者取药
 * @param {string|number} appointId - 预约ID
 * @returns {Promise}
 */
export function takeMedicine(appointId) {
    return request({
        url: '/customer/takeMedicine',
        method: 'post',
        data: {
            appointId
        }
    })
}

/**
 * 终止患者服务
 * @param {string|number} topicCustomerId - 患者课题组ID
 * @returns {Promise}
 */
export function terminateService(topicCustomerId) {
    return request({
        url: '/customer/terminateService',
        data: {
            topicCustomerId
        },
        method: 'post'
    })
}

/**
 * 更新完成状态
 * @param {Object} data
 */
export function finishStatus(data) {
    return request({
      url: '/customer/finishStatus',
      method: 'post',
      data 
    })
  }

  export function setCustomerNo(data) {
    return request({
        url: '/customer/setCustomerNo',
        method: 'post',
        data
    })
}

// 添加审核患者的接口
export function auditCustomer(data) {
    return request({
        url: '/customer/auditCustomer',  
        method: 'post',
        data
    })
}