import request from '@/assets/request/index'

/**
 * 获取OSS配置信息
 * @returns {Promise}
 */
export function getAccessInfo () {
  return request({
    url: '/getAccessInfo',
    method: 'get'
  })
}
