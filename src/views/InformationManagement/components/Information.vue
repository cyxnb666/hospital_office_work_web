<template>
  <el-dialog :title="title" :visible.sync="dialogVisible" :close-on-click-modal="false" width="1100px"
             @close="handleClose">
    <el-form label-position="top" label-width="80px" :model="submitForm" ref="submitForm" :rules="rules">
      <el-form-item label="资讯标题" prop="infoTitle">
        <el-input v-model="submitForm.infoTitle" placeholder="请输入资讯标题" :disabled="isView || isAudit"/>
      </el-form-item>
      <el-form-item label="资讯内容" prop="infoContent">
        <TinyEditor v-if="dialogVisible" v-model="submitForm.infoContent" :disabled="isView || isAudit"/>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="8" v-if="submitForm.publishAudience === '3'">
          <el-form-item label="指定用户" prop="designatedUser">
            <el-select v-model="submitForm.designatedUser" placeholder="请选择指定用户" style="width: 100%"
                       :disabled="isView || isAudit">
              <el-option v-for="(item, index) in designatedUserList" :key="index" :label="item.label"
                         :value="item.value"/>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="资讯分类" prop="infoType">
            <el-select v-model="submitForm.infoType" placeholder="请选择资讯分类" style="width: 100%"
                       @change="selectedInfoType" :disabled="isView || isAudit">
              <el-option v-for="(item, index) in infoTypeList" :key="index" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="发布人">
            <el-input v-model="submitForm.publisher" disabled/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="发布时间">
            <el-input v-model="submitForm.releaseTime" disabled/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="关联课题" prop="relatedTopics" :rules="submitForm.infoType === '1' ? [
          {
            required: true,
            message: '请选择关联课题'
          }
        ] : []">
            <el-select v-model="submitForm.relatedTopics" placeholder="请选择关联课题" style="width: 100%"
                       @change="handleTopicSelect" :disabled="isView || isAudit">
              <el-option v-for="item in relatedTopicsList" :key="item.value" :label="item.label" :value="item.value" :disabled="item.disabled"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="topicQrcode">
          <el-form-item label="课题二维码">
            <el-image style="width: 200px; height: 200px" :src="topicQrcode" fit="fill"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="封面图片" prop="infoImage">
        <div class="photo-upload-container">
          <!-- 审核模式下隐藏上传功能，只显示预览 -->
          <div v-if="isView || isAudit" class="preview-container">
            <img v-if="previewUrls.photo" :src="previewUrls.photo" class="preview-image">
          </div>
          <el-upload v-else ref="photoUpload" class="avatar-uploader" action="#" :http-request="uploadPhoto"
                     :show-file-list="false" :before-upload="beforePhotoUpload" :on-exceed="handlePhotoExceed"
                     :limit="1"
                     accept=".jpg,.jpeg,.png">
            <div class="avatar-wrapper" v-if="previewUrls.photo">
              <img :src="previewUrls.photo" class="avatar">
              <div class="remove-icon" @click.stop="handleRemovePhoto" v-if="!isView && !isAudit">
                <i class="el-icon-delete"></i>
              </div>
            </div>
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </div>
      </el-form-item>
    </el-form>

    <!-- 审核模式下的审核意见输入框和按钮 -->
    <template v-if="isAudit">
      <div class="audit-section" style="margin-top: 20px;">
        <div class="audit-title" style="margin-bottom: 10px; font-weight: bold;">审核意见</div>
        <el-input type="textarea" :rows="3" placeholder="审核不通过时必须填写理由" v-model="reason"/>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="examineFn(false)" :loading="loading" :disabled="!reason.trim()">
          审核不通过
        </el-button>
        <el-button type="primary" @click="examineFn(true)" :loading="loading">
          审核通过
        </el-button>
      </div>
    </template>

    <!-- 非审核模式下的按钮 -->
    <span slot="footer" class="dialog-footer" v-else>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :loading="loading" v-if="!isView">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import moment from 'moment'
import TinyEditor from '@/components/TinyEditor/index.vue'
import { uploadOSS } from '@/utils/uploadOSS'
import { addInfo, auditInfo, updateInfo } from '../api'

export default {
  name: 'InformationView',
  props: {
    topicsList: {
      type: Array,
      default: () => []
    }
  },
  components: { TinyEditor },
  data () {
    return {
      title: '',
      openType: 0,
      currentInfoId: null,
      dialogVisible: false,
      topicQrcode: '',
      submitForm: {
        infoTitle: '',
        infoContent: '',
        publishAudience: '',
        designatedUser: null,
        pushPath: '',
        relatedTopics: null,
        auditStatus: '1',
        auditStatusName: '审核中',
        infoType: '',
        infoTypeName: '',
        publisher: 'admin',
        releaseTime: '',
        infoImage: '', // 存储文件名
        fileList: []
      },
      previewUrls: {
        photo: '' // 预览的完整URL
      },
      photoUploading: false,
      reason: '',
      rules: {
        infoTitle: [
          {
            required: true,
            message: '请输入资讯标题'
          }
        ],
        infoContent: [
          {
            required: true,
            message: '请输入资讯内容'
          }
        ],
        designatedUser: [
          {
            required: true,
            message: '请选择指定用户'
          }
        ],
        infoType: [
          {
            required: true,
            message: '请选择资讯分类'
          }
        ],
        fileList: [
          {
            required: true,
            message: '请上传封面图片'
          }
        ],
        infoImage: [
          {
            required: true,
            message: '请上传封面图片'
          }
        ]
      },
      publishAudienceList: [
        {
          label: '全部',
          value: '0'
        },
        {
          label: '患者',
          value: '1'
        },
        {
          label: '用户',
          value: '2'
        },
        {
          label: '指定用户',
          value: '3'
        }
      ],
      designatedUserList: [
        {
          label: '张三',
          value: '1'
        },
        {
          label: '李四',
          value: '2'
        }
      ],
      infoTypeList: [
        {
          label: '招募信息',
          value: '1'
        },
        {
          label: '科普信息',
          value: '2'
        }
      ],
      pushPathList: [
        {
          label: '全部',
          value: '0'
        },
        {
          label: '小程序',
          value: '1'
        },
        {
          label: '短信',
          value: '2'
        }
      ],
      loading: false
    }
  },
  methods: {
    handleClose () {
      this.resetForm()
    },
    resetForm () {
      this.submitForm = {
        infoTitle: '',
        infoContent: '',
        publishAudience: '',
        designatedUser: null,
        pushPath: '',
        relatedTopics: null,
        auditStatus: '1',
        auditStatusName: '审核中',
        infoType: '',
        infoTypeName: '',
        publisher: 'admin',
        releaseTime: '',
        infoImage: ''
      }

      // 清空预览URL
      this.previewUrls = {
        photo: ''
      }

      // 清空二维码
      this.topicQrcode = ''

      // 清空上传组件的文件列表
      if (this.$refs.photoUpload) {
        this.$refs.photoUpload.clearFiles()
      }

      // 重置原因
      this.reason = ''

      // 清空审核理由
      this.reason = ''

      // 清空当前ID
      this.currentInfoId = null

      // 清除表单验证
      this.$nextTick(() => {
        if (this.$refs.submitForm) {
          this.$refs.submitForm.clearValidate()
        }
      })
    },
    handleTopicSelect (value) {
      const selectedTopic = this.relatedTopicsList.find(item => item.value === value)
      if (selectedTopic) {
        this.topicQrcode = `${this.ossBaseUrl}${selectedTopic.qrCode}`
      } else {
        this.topicQrcode = ''
      }
    },
    beforePhotoUpload (file) {
      const isImage = file.type.indexOf('image/') === 0
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      if (!isLt5M) {
        this.$message.error('图片大小不能超过 5MB!')
        return false
      }
      return true
    },
    uploadPhoto ({ file }) {
      this.photoUploading = true
      uploadOSS(file)
        .then((res) => {
          // 保存文件名到提交表单
          this.submitForm.infoImage = res.fileName
          // 保存完整URL用于预览
          this.previewUrls.photo = res.url
          this.$message.success('封面图片上传成功')
        })
        .catch((err) => {
          console.error('上传失败', err)
          this.$message.error('封面图片上传失败')
        })
        .finally(() => {
          this.photoUploading = false
        })
    },
    handlePhotoExceed () {
      this.$message.warning('只能上传一张封面图片，如需更换请先删除当前图片')
    },
    handleRemovePhoto (e) {
      e.stopPropagation()
      this.$confirm('确定要删除这张图片吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.submitForm.infoImage = ''
          this.previewUrls.photo = ''
          if (this.$refs.photoUpload) {
            this.$refs.photoUpload.clearFiles()
          }
          this.$message.success('图片已删除')
        })
        .catch(() => {
        })
    },

    onSubmit () {
      this.$refs.submitForm.validate((valid) => {
        if (valid) {
          this.loading = true

          // 解析编辑器内容中的图片和视频
          const content = this.submitForm.infoContent
          const files = this.extractMediaFiles(content)

          const requestData = {
            content: this.submitForm.infoContent,
            coverImg: this.submitForm.infoImage,
            infoType: this.submitForm.infoType,
            title: this.submitForm.infoTitle,
            topicId: this.submitForm.relatedTopics,
            files: files
          }

          // 如果是编辑模式,添加infoId并调用更新接口
          if (this.openType === 1) {
            requestData.infoId = this.submitForm.infoId
            updateInfo(requestData)
              .then(() => {
                this.$message.success('修改成功')
                this.dialogVisible = false
                this.$parent.onSearch()
              })
              .catch(() => {
              })
              .finally(() => {
                this.loading = false
              })
          } else {
            // 新增模式
            addInfo(requestData)
              .then(() => {
                this.$message.success('添加成功')
                this.dialogVisible = false
                this.$parent.onSearch()
              })
              .catch(() => {
              })
              .finally(() => {
                this.loading = false
              })
          }
        }
      })
    },

    // 取媒体文件
    extractMediaFiles (content) {
      const files = []
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content

      // 提取所有图片
      const images = tempDiv.getElementsByTagName('img')
      Array.from(images).forEach(img => {
        const src = img.getAttribute('src')
        if (src && src.includes('hospital_office')) {
          files.push({
            fileOssId: src.split('hospital_office/')[1], // 获取文件名
            infoFileType: 'IMG'
          })
        }
      })

      // 提取所有video标签中的视频
      const videos = tempDiv.getElementsByTagName('video')
      Array.from(videos).forEach(video => {
        const src = video.getAttribute('src')
        if (src && src.includes('hospital_office')) {
          files.push({
            fileOssId: src.split('hospital_office/')[1],
            infoFileType: 'VID'
          })
        }
      })

      // 提取所有source标签中的视频
      const sources = tempDiv.getElementsByTagName('source')
      Array.from(sources).forEach(source => {
        const src = source.getAttribute('src')
        if (src && src.includes('hospital_office')) {
          files.push({
            fileOssId: src.split('hospital_office/')[1],
            infoFileType: 'VID'
          })
        }
      })

      return files
    },
    selectedAudience () {
      this.submitForm.designatedUser = null
    },
    initialization (type, data) {
      this.openType = type
      switch (type) {
        case 0: // 新增
          this.title = '新增资讯'
          this.resetForm()
          this.submitForm.releaseTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
          break

        case 1: // 编辑
          this.title = '编辑资讯'
          this.currentInfoId = data.infoId
          this.setFormData(data)
          break

        case 2: // 详情
          this.title = '资讯详情'
          this.setFormData(data)
          break

        case 3: // 审核
          this.title = '资讯审核'
          this.setFormData(data)
          break
      }

      this.dialogVisible = true
    },
    setFormData (data) {
      this.submitForm = {
        infoTitle: data.title,
        infoContent: data.content,
        infoType: data.infoType,
        infoImage: data.coverImg, // coverImg
        relatedTopics: data.topicId,
        publisher: data.releaseBy, // releaseBy
        releaseTime: data.releaseTime,
        infoId: data.infoId
      }

      // 设置封面图预览
      if (data.coverImg) {
        this.previewUrls.photo = `${this.ossBaseUrl}${data.coverImg}`
      }

      // 设置选中课题的二维码
      const selectedTopic = this.relatedTopicsList.find(item => item.value === data.topicId)
      if (selectedTopic) {
        this.topicQrcode = `${this.ossBaseUrl}${selectedTopic.qrCode}`
      }
    },
    details (row) {
      this.initialization(2, row)
    },

    // 修改edit方法
    edit (row) {
      this.initialization(1, row)
    },
    toExamine (row) {
      this.currentInfoId = row.infoId // 保存当前资讯ID
      this.initialization(3, row)
    },
    examineFn (isPass) {
      // 如果是不通过就需要验证理由
      if (!isPass && !this.reason.trim()) {
        this.$message.error('请输入不通过理由')
        return
      }

      const params = {
        examineStatus: isPass ? '1' : '2',
        infoId: this.currentInfoId,
        remark: isPass ? '' : this.reason.trim()
      }

      this.loading = true

      auditInfo(params)
        .then(() => {
          this.$message.success('审核成功')
          this.dialogVisible = false
          this.$parent.onSearch()
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleChange (file, fileList) {
      this.submitForm.fileList = fileList
    },
    selectedInfoType (value) {
      if (value) {
        this.submitForm.infoTypeName = this.infoTypeList.find(item => item.value === value).label
      } else {
        this.submitForm.infoTypeName = ''
      }
    }
  },
  computed: {
    isView () {
      return this.openType === 2 // 查看模式
    },
    isAudit () {
      return this.openType === 3 // 审核模式
    },
    relatedTopicsList () {
      return this.topicsList.map(topic => ({
        label: topic.topicName,
        value: topic.topicId,
        qrCode: topic.topicQrcode,
        disabled: topic.disabled
      }))
    },
    ossBaseUrl () {
      try {
        const ossConfig = JSON.parse(sessionStorage.getItem('ossConfig'))
        if (ossConfig) {
          return `https://${ossConfig.bucketName}.${ossConfig.endpoint.replace(/\/+$/, '')}/${ossConfig.catalogue.replace(/\/+$/, '')}/`
        }
        return ''
      } catch (err) {
        console.error('解析 OSS 配置失败:', err)
        return ''
      }
    }
  },
  watch: {
    // your watch properties here
  },
  created () {
    // your code here
  },
  mounted () {
    // your code here
  }
}
</script>

<style lang="scss" scoped>
.photo-upload-container {
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }

  .preview-container {
    width: 200px; // 设置一个固定宽度
    height: 200px; // 设置一个固定高度
    overflow: hidden; // 超出部分隐藏
    border: 1px solid #dcdfe6; // 添加边框
    border-radius: 4px;

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: contain; // 保持图片比例完整显示
    }
  }

  .avatar-wrapper {
    position: relative;

    .avatar {
      width: 178px;
      height: 178px;
      display: block;
    }

    .remove-icon {
      position: absolute;
      top: 0;
      right: 0;
      padding: 4px;
      color: #fff;
      background-color: rgba(0, 0, 0, 0.6);
      cursor: pointer;

      &:hover {
        background-color: rgba(0, 0, 0, 0.8);
      }
    }
  }
}
</style>
