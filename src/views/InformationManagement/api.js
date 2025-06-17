import request from '@/assets/request/index'

/**
 * 获取资讯列表
 * @param {Object} params - 分页查询参数
 * @returns {Promise}
 */
export function getInfoPage (params) {
  return request({
    url: '/info/getInfoPage',
    method: 'post',
    data: params
  })
}

// 推送资讯
export function pushInfo (infoId) {
  return request({
    url: `/info/pushInfo/${infoId}`,
    method: 'post'
  })
}

/**
 * 删除资讯
 * @param {string|number} infoId - 资讯ID
 * @returns {Promise}
 */
export function deleteInfo (infoId) {
  return request({
    url: `/info/deleteInfo/${infoId}`,
    method: 'post'
  })
}

/**
 * 获取所有课题列表
 * @returns {Promise}
 */
export function getAllTopics () {
  return request({
    url: '/getTopics',
    method: 'get'
  })
}

/**
 * 新增资讯
 * @param {Object} data - 资讯数据
 * @returns {Promise}
 */
export function addInfo (data) {
  return request({
    url: '/info/addInfo',
    method: 'post',
    data
  })
}

/**
 * 更新资讯
 * @param {Object} data - 资讯数据
 * @returns {Promise}
 */
export function updateInfo (data) {
  return request({
    url: '/info/updateInfo',
    method: 'post',
    data
  })
}

export function auditInfo (data) {
  return request({
    url: '/info/auditInfo',
    method: 'post',
    data
  })
}
