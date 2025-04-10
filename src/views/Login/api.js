import request from '@/assets/request/index'

/**
 * 退出登录
 * @param {*} data 
 * @returns 
 */
export function loginOut(data) {
    return request({
        url: '/user/logout',
        method: 'post',
        data: data
    })
}

/**
 * 登录
 * @param {*} data 
 * @returns 
 */
export function login(data) {
    return request({
        url: '/user/login',
        method: 'post',
        data: data
    })
}

/**
 * 修改密码
 * @param {Object} data - 包含密码和用户ID的对象
 * @returns {Promise}
 */
export function updatePassword(data) {
    return request({
        url: '/user/updatePassword',
        method: 'post',
        data
    })
}

// 获取用户信息
export function getUserInfo(token) {
    return request({
        url: '/user/info',
        method: 'get',
        params: { token }
    })
}