import request from '@/assets/request/index'

/**
 * 获取课题列表
 * @param {Object} params - 分页查询参数
 * @returns {Promise}
 */
export function getTopicByPage(params) {
    return request({
        url: '/topic/getTopicByPage',
        method: 'post',
        data: params
    })
}

/**
 * 删除课题
 * @param {string|number} topicId - 课题ID
 * @returns {Promise}
 */
export function deleteTopic(topicId) {
    return request({
        url: `/topic/${topicId}`,
        method: 'get'
    })
}

// 获取课题负责人列表
export function getTopicPrincipal() {
    return request({
        url: '/getTopicPrincipal', 
        method: 'get'
    })
}
// 获取全部调查问卷
export function getSurveyAll() {
    return request({
        url: '/survey/all',
        method: 'get'
    })
}

// 生成课题二维码
export function generateQrCode(topicId) {
    return request({
        url: `/topic/generateQrCode/${topicId}`,
        method: 'get'
    })
}

// 更新课题状态
export function updateTopicStatus(topicId) {
    return request({
        url: `/topic/updateTopicStatus/${topicId}`,
        method: 'get'
    })
}

// 获取字典数据
export function getDictByType(dictType) {
    return request({
        url: `/getDictByType?dictType=${dictType}`,
        method: 'get'
    })
}

// 添加课题
export function addTopic(data) {
    return request({
        url: '/topic/addTopic',
        method: 'post',
        data
    })
}

// 获取所有课题列表
export function getAllTopic() {
    return request({
        url: '/topic/getAllTopic',
        method: 'get'
    })
}

// 获取课题分组列表
export function getTopicGroupList(topicId) {
    return request({
        url: `/topicGroup/listTopicGroup/${topicId}`,
        method: 'get'
    })
}

// 更新课题分组状态
export function updateTopicGroupStatus(topicGroupId) {
    return request({
        url: `/topicGroup/updateTopicGroupStatus/${topicGroupId}`,
        method: 'get'
    })
}

// 删除课题分组
export function deleteTopicGroup(topicGroupId) {
    return request({
        url: `/topicGroup/deleteTopicGroup/${topicGroupId}`,
        method: 'get'
    })
}

// 更新课题
export function updateTopic(data) {
    return request({
        url: '/topic/updateTopic',
        method: 'post',
        data
    })
}

// 添加课题分组
export function addTopicGroup(data) {
    return request({
        url: '/topicGroup/addTopicGroup',
        method: 'post',
        data
    })
}

// 修改课题分组
export function updateTopicGroup(data) {
    return request({
        url: '/topicGroup/updateTopicGroup',
        method: 'post',
        data
    })
}

// 获取分组患者列表
export function listGroupCustomer(data) {
    return request({
        url: '/topicGroup/listGroupCustomer',
        method: 'post',
        data
    })
}
export function listTopicCustomer(topicId) {
    return request({
        url: '/topicCustomer/listTopicCustomer',
        method: 'post',
        data: { topicId }
    })
}

// 暂存分组
export function topicTemp(data) {
    return request({
        url: '/topicCustomer/topicTemp',
        method: 'post',
        data
    })
}

// 完成分组
export function completeTopic(data) {
    return request({
        url: '/topicCustomer/completeTopic',
        method: 'post',
        data
    })
}