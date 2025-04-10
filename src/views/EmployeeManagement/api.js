import request from '@/assets/request/index'

/**
 * 获取OSS配置信息
 * @returns {Promise}
 */
export function getAccessInfo() {
    return request({
        url: '/getAccessInfo',
        method: 'get'
    })
}

/**
 * 获取医师列表数据
 * @param {Object} params - 分页查询参数 
 * @returns {Promise}
 */
export function getUsersByPage(params) {
    return request({
        url: '/sysUser/getUsersByPage',
        method: 'post',
        data: params
    })
}

/**
 * 获取所有角色
 * @returns {Promise}
 */
export function getRoles() {
    return request({
        url: '/getRoles',
        method: 'get'
    })
}

/**
 * 获取所有部门
 * @returns {Promise}
 */
export function getDepartments() {
    return request({
        url: '/getDepartments',
        method: 'get'
    })
}

/**
 * 删除医师
 * @param {number|string} userId - 用户ID
 * @returns {Promise}
 */
export function deleteUsers(userId) {
    return request({
        url: `/sysUser/deleteUser/${userId}`,
        method: 'get',
    })
}

/**
 * 更新用户状态
 * @param {number|string} userId - 用户ID
 * @returns {Promise}
 */
export function updateUserStatus(userId) {
    return request({
        url: `/sysUser/updateUserStatus/${userId}`,
        method: 'post'
    })
}

/**
 * 添加用户
 * @param {Object} data - 用户信息
 * @returns {Promise}
 */
export function addUser(data) {
    return request({
        url: '/sysUser/addUser',
        method: 'post',
        data
    })
}

/**
 * 修改用户
 * @param {Object} data - 用户信息
 * @returns {Promise}
 */
export function updateUser(data) {
    return request({
        url: '/sysUser/updateUser',
        method: 'post',
        data
    })
}

/**
 * 重置用户密码
 * @param {number|string} userId - 用户ID
 * @returns {Promise}
 */
export function resetPassword(userId) {
    return request({
        url: `/user/resetPassword/${userId}`,
        method: 'post'
    })
}