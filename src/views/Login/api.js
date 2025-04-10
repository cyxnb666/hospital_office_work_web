import request from '@/request/index'

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
