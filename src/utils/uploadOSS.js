import { v4 as uuidv4 } from 'uuid'
import { getAccessInfo } from '@/utils/aliOSS'
import OSS from 'ali-oss'
const { Buffer } = require('buffer')
let ossConfig = null
let catalogue = null

export const uploadOSS = (file) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!ossConfig) {
        const res = await getAccessInfo()
        ossConfig = new OSS({
          accessKeyId: res.accessKeyId,
          accessKeySecret: res.accessKeySecret,
          stsToken: res.securityToken,
          bucket: res.bucketName,
          endpoint: res.endpoint,
          region: res.region,
          secure: true
        })
        catalogue = res.catalogue
      }

      // 生成UUID并获取文件扩展名
      const uuid = uuidv4().replace(/-/g, '')
      const extension = file.name.substring(file.name.lastIndexOf('.'))
      const fileName = `${uuid}${extension}`
      const fullPath = `${catalogue}${fileName}`
      const u8arr = await file.arrayBuffer()
      const buffer = Buffer.from(u8arr)
      const result = await ossConfig.put(fullPath, buffer)

      // 返回一个对象，包含完整URL和文件名
      resolve({
        url: result.url, // 完整URL，用于预览
        fileName: fileName // 文件名，用于提交表单
      })
    } catch (err) {
      reject(err)
    }
  })
}

export default {
  uploadOSS
}
