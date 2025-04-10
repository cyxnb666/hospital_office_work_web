import axios from 'axios'
import { Message } from 'element-ui'
import router from '@/router'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 15000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从sessionStorage中获取token
    const token = sessionStorage.getItem('token')
    
    // 如果有token则添加到请求头
    if (token) {
      config.headers['Authorization'] = token
    }
    
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 假设后端返回格式为 { code: 0, data: xxx, message: 'xxx' }
    // 这里可以根据实际后端返回格式调整
    if (res.code === 0 || res.code === 200) {
      return res.data || res
    } else {
      // 统一处理错误
      Message.error(res.message || '操作失败')
      return Promise.reject(new Error(res.message || '操作失败'))
    }
  },
  error => {
    // 处理 HTTP 错误状态
    let message = '连接服务器失败'
    
    if (error.response) {
      const status = error.response.status
      
      switch (status) {
        case 401:
          message = '未授权，请重新登录'
          // 简化的未授权处理 - 直接跳转到登录页
          sessionStorage.clear()
          router.push({ name: 'Login' })
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求错误，未找到该资源'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = `请求错误: ${status}`
      }
    } else if (error.message.includes('timeout')) {
      message = '请求超时'
    }
    
    console.error('响应错误:', error)
    Message.error(message)
    return Promise.reject(error)
  }
)

// 封装GET请求
export function get(url, params = {}) {
  return service({
    url,
    method: 'get',
    params
  })
}

// 封装POST请求
export function post(url, data = {}) {
  return service({
    url,
    method: 'post',
    data
  })
}

// 默认导出service
export default service