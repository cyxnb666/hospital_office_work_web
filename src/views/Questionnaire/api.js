import request from '@/assets/request/index'

/**
 * 获取问卷列表
 * @param {Object} params - 分页查询参数 
 * @returns {Promise}
 */
export function getQuestionnaireByPage(params) {
    return request({
        url: '/survey/surveyList',
        method: 'post',
        data: params
    })
}

/**
 * 获取问卷题目详情
 * @param {string|number} surveyId - 问卷ID 
 * @returns {Promise}
 */
export function getQuestionDetails(surveyId) {
    return request({
        url: `/survey/surveyQuestion/${surveyId}`,
        method: 'get'
    })
}