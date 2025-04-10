import request from '@/assets/request/index'

/**
 * 获取角色列表
 * @param {Object} params - 分页查询参数 
 * @returns {Promise}
 */
export function getRolesByPage(params) {
    return request({
        url: '/role/getRolesByPage',
        method: 'post',
        data: params
    })
}

/**
 * 新增角色
 * @param {Object} data - 角色信息
 * @returns {Promise}  
 */
export function addRole(data) {
    return request({
        url: '/role/addRole',
        method: 'post',
        data
    })
}

/**
 * 更新角色
 * @param {Object} data - 角色信息
 * @returns {Promise}
 */
export function updateRole(data) {
    return request({
        url: '/role/updateRole',
        method: 'post',
        data
    })
}

/**
 * 删除角色
 * @param {string|number} roleId - 角色ID
 * @returns {Promise}
 */
export function deleteRole(roleId) {
    return request({
      url: `/role/deleteRole/${roleId}`,
      method: 'get'
    })
  }

/**
 * 更新角色状态
 * @param {string|number} roleId - 角色ID 
 * @returns {Promise}
 */
export function updateRoleStatus(roleId) {
    return request({
      url: `/role/updateRoleStatus/${roleId}`,
      method: 'post'
    })
  }

/**
 * 根据角色ID获取菜单权限
 * @param {string|number} roleId - 角色ID
 * @returns {Promise}
 */
export function getMenuByRoleId(roleId) {
    return request({
      url: `/menu/getMenuByRoleId/${roleId}`,
      method: 'get'
    })
  }

/**
 * 更新菜单权限
 * @param {Object} data - {menuIds: number[], roleId: number}
 * @returns {Promise}
 */
export function updateMenuPermission(data) {
    return request({
      url: '/menu/menuPermission',
      method: 'post',
      data
    })
  }

/**
 * 获取角色下的用户列表
 * @param {Object} params - {pageIndex: number, pageSize: number}
 * @returns {Promise}
 */
export function getUserByRole(params) {
    return request({
      url: '/sysUser/getUserByRole',
      method: 'post',
      data: params
    })
  }

/**
 * 更新用户权限
 * @param {Object} data - {roleId: number, userIds: number[]}
 * @returns {Promise}
 */
export function updateUserPermission(data) {
    return request({
      url: '/sysUser/userPermission',
      method: 'post',
      data
    })
  }