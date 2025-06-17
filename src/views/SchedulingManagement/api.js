import request from '@/assets/request/index'

/**
 * 获取预约数量
 * @param {Object} data - 请求参数 
 * @returns {Promise}
 */
export function getAppointmentCount(data) {
    return request({
        url: '/scheduling/getAppointmentCount',
        method: 'post',
        data
    })
}

/**
 * 医生和部门
 * @param {Object} data - 请求参数 
 * @returns {Promise}
 */
export function getDoctorUsers(data) {
    return request({
        url: '/sysUser/getDoctorUsers',
        method: 'post',
        data
    })
}

/**
 * 获取医生排班信息
 * @param {Object} data - 包含userId和yearMonth的请求参数
 * @returns {Promise}
 */
export function getUserScheduling(data) {
    return request({
        url: '/scheduling/getUserScheduling',
        method: 'post',
        data
    })
}

/**
 * 获取所有医生信息
 */
export function getAllDoctorUsers() {
    return request({
        url: '/sysUser/getAllDoctorUsers',
        method: 'get'
    })
}

export function addScheduling(data) {
    return request({
        url: '/scheduling/addScheduling',
        method: 'post',
        data
    })
}

export function getAppointTaskList(params) {
    return request({
        url: '/scheduling/appointTask',
        method: 'post',
        data: params
    })
}

/**
 * 获取我的课题列表
 * @returns {Promise}
 */
export function getMyTopic() {
    return request({
        url: '/topic/getMyTopic',
        method: 'get'
    })
}

/**
 * 根据课题ID获取患者列表
 * @param {string|number} topicId - 课题ID
 * @returns {Promise}
 */
export function getTopicCustomers(topicId) {
    return request({
        url: `/topicCustomer/topicCustomers/${topicId}`,
        method: 'get'
    })
}

/**
 * 新增预约
 * @param {Object} data - 预约数据
 * @returns {Promise}
 */
export function addAppointment(data) {
    return request({
        url: '/appoint/pcAppoint',
        method: 'post',
        data
    })
}