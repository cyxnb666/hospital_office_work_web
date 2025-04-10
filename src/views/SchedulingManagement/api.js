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