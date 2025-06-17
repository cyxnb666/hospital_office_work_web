<template>
  <el-dialog :title="title" :visible.sync="dialogVisible" :close-on-click-modal="false" width="810px"
    @close="handleClose">
    <el-form label-width="80px" ref="submitForm" :model="submitForm" :rules="rules">
      <el-form-item label="归属部门" prop="deptId">
        <el-cascader v-model="submitForm.deptId" :options="departmentsList" :props="{ expandTrigger: 'hover' }"
          placeholder="请选择归属部门" style="width: 100%" clearable>
        </el-cascader>
      </el-form-item>
      <el-form-item label="医师姓名" prop="userName">
        <el-input v-model="submitForm.userName" clearable />
      </el-form-item>
      <el-form-item label="医师电话" prop="phone">
        <el-input v-model="submitForm.phone" />
      </el-form-item>
      <el-form-item label="岗位" prop="roleIds">
        <el-select v-model="submitForm.roleIds" multiple collapse-tags placeholder="请选择岗位" style="width: 100%">
          <el-option v-for="item in rolesList" :key="item.roleId" :label="item.roleName" :value="item.roleId">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="入职时间" prop="entryTime">
        <el-date-picker style="width: 100%" v-model="submitForm.entryTime" type="date" value-format="yyyy-MM-dd"
          placeholder="选择入职时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="当前状态" prop="enableFlag">
        <el-select v-model="submitForm.enableFlag" placeholder="请选择当前状态" style="width: 100%">
          <el-option v-for="item in stateList" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="简介" prop="introduction">
        <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" v-model="submitForm.introduction" />
      </el-form-item>
      <!-- <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="上传照片">
            <div class="photo-upload-container">
              <el-upload ref="photoUpload" class="avatar-uploader" action="#" :http-request="uploadPhoto"
                :show-file-list="false" :before-upload="beforePhotoUpload" :on-exceed="handlePhotoExceed" :limit="1"
                accept=".jpg,.jpeg,.png">
                <div class="avatar-wrapper" v-if="previewUrls.photo">
                  <img :src="previewUrls.photo" class="avatar">
                  <div class="remove-icon" @click.stop="handleRemovePhoto">
                    <i class="el-icon-delete"></i>
                  </div>
                </div>
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="附件">
           
            <div v-if="submitForm.attachment" class="existing-file">
              <div class="file-info">
                <i class="el-icon-document"></i>
                <span class="file-name">{{ getFileName(submitForm.attachment) }}</span>
              </div>
              <div class="file-actions">
                <el-button type="text" @click="downloadAttachment">
                  <i class="el-icon-download"></i> 下载
                </el-button>
                <el-button type="text" @click="handleRemoveAttachment">
                  <i class="el-icon-delete"></i> 删除
                </el-button>
              </div>
            </div>
            
            <el-upload v-else ref="attachmentUpload" class="attachment-upload" drag action="#"
              :http-request="uploadAttachment" :before-upload="beforeAttachmentUpload"
              :on-exceed="handleAttachmentExceed" :limit="1" accept=".pdf,.doc,.docx">
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">只能上传PDF或Word格式文件，且不超过10MB</div>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row> -->
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :loading="loading || photoUploading || attachmentUploading">确
        定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { addUser, updateUser } from '../api'
import { uploadOSS } from '@/utils/uploadOSS'

export default {
  name: 'addOrEdit',
  props: {
    rolesList: {
      type: Array,
      default: () => []
    },
    departmentsList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      title: '',
      dialogVisible: false,
      loading: false,
      photoUploading: false,
      attachmentUploading: false,
      submitForm: {
        deptId: null,
        userName: '',
        phone: '',
        roleIds: [],
        entryTime: '',
        enableFlag: '1',
        introduction: '',
        photo: '',          // 只存储文件名
        attachment: '',     // 只存储文件名
      },
      previewUrls: {       // 预览的完整URL
        photo: ''
      },
      stateList: [
        {
          value: '0',
          label: '停用'
        },
        {
          value: '1',
          label: '启用'
        }
      ],
      rules: {
        deptId: [
          {
            required: true,
            message: '请选择归属部门'
          }
        ],
        userName: [
          {
            required: true,
            message: '请输入医师姓名'
          }
        ],
        phone: [
          {
            required: true,
            message: '请输入医师电话'
          }
        ],
        roleIds: [
          {
            required: true,
            type: 'array',
            message: '请选择至少一个岗位'
          }
        ],
        entryTime: [
          {
            required: true,
            message: '请选择入职时间'
          }
        ]
      }
    }
  },
  computed: {
    ossBaseUrl() {
      try {
        const ossConfig = JSON.parse(sessionStorage.getItem('ossConfig'));
        if (ossConfig) {
          return `https://${ossConfig.bucketName}.${ossConfig.endpoint.replace(/\/+$/, '')}/${ossConfig.catalogue.replace(/\/+$/, '')}/`;
        }
        return '';
      } catch (err) {
        console.error('解析 OSS 配置失败:', err);
        return '';
      }
    }
  },
  methods: {
    getFileName(path) {
      if (!path) return '';
      return path.split('/').pop();
    },

    downloadAttachment() {
      if (!this.submitForm.attachment) return;

      const url = `${this.ossBaseUrl}${this.submitForm.attachment}`;
      const fileName = this.getFileName(this.submitForm.attachment);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    beforePhotoUpload(file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
      const isAllowedType = allowedTypes.includes(file.type)
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isAllowedType) {
        this.$message.error('只能上传JPG/PNG格式的图片!')
        return false
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB!')
        return false
      }
      return true
    },

    beforeAttachmentUpload(file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
      const isAllowedType = allowedTypes.includes(file.type)
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isAllowedType) {
        this.$message.error('只能上传PDF或Word格式的文件!')
        return false
      }
      if (!isLt10M) {
        this.$message.error('文件大小不能超过 10MB!')
        return false
      }
      return true
    },

    uploadPhoto({ file }) {
      this.photoUploading = true
      uploadOSS(file).then((res) => {
        this.submitForm.photo = res.fileName
        this.previewUrls.photo = res.url
        this.$message.success('照片上传成功')
      }).catch((err) => {
        console.error('上传失败', err)
        this.$message.error('照片上传失败')
      }).finally(() => {
        this.photoUploading = false
      })
    },

    uploadAttachment({ file }) {
      this.attachmentUploading = true
      uploadOSS(file).then((res) => {
        this.submitForm.attachment = res.fileName
        this.$message.success('附件上传成功')
      }).catch((err) => {
        console.error('上传失败', err)
        this.$message.error('附件上传失败')
      }).finally(() => {
        this.attachmentUploading = false
      })
    },

    handlePhotoExceed() {
      this.$message.warning('只能上传一张照片，如需更换请先删除当前照片')
    },

    handleAttachmentExceed() {
      this.$message.warning('只能上传一个附件，如需更换请先删除当前附件')
    },

    handleRemovePhoto(e) {
      e.stopPropagation()
      this.$confirm('确定要删除这张照片吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.submitForm.photo = ''
        this.previewUrls.photo = ''
        if (this.$refs.photoUpload) {
          this.$refs.photoUpload.clearFiles()
        }
        this.$message.success('照片已删除')
      }).catch(() => { })
    },

    handleRemoveAttachment() {
      this.$confirm('确定要删除这个附件吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.submitForm.attachment = ''
        if (this.$refs.attachmentUpload) {
          this.$refs.attachmentUpload.clearFiles()
        }
        this.$message.success('附件已删除')
      }).catch(() => { })
    },

    initialization(type, data) {
      this.title = type === 'add' ? '新增医师' : '编辑医师'

      if (type === 'edit') {
        const roleIds = data.roles ? data.roles.map(role => role.roleId) : []

        this.submitForm = {
          ...data,
          deptId: [data.deptId],
          roleIds: roleIds
        }

        if (data.photo) {
          this.previewUrls.photo = `${this.ossBaseUrl}${data.photo}`
        }
      } else {
        this.resetForm()
      }

      this.dialogVisible = true
    },

    handleClose() {
      this.resetForm()
      this.$nextTick(() => {
        this.$refs.submitForm.clearValidate()
      })
    },

    resetForm() {
      this.submitForm = {
        deptId: null,
        userName: '',
        phone: '',
        roleIds: [],
        entryTime: '',
        enableFlag: '1',
        introduction: '',
        photo: '',
        attachment: ''
      }
      this.previewUrls = {
        photo: ''
      }
      if (this.$refs.photoUpload) {
        this.$refs.photoUpload.clearFiles()
      }
      if (this.$refs.attachmentUpload) {
        this.$refs.attachmentUpload.clearFiles()
      }
    },

    onSubmit() {
      if (this.photoUploading || this.attachmentUploading) {
        this.$message.warning('请等待文件上传完成')
        return
      }

      this.$refs.submitForm.validate(valid => {
        if (valid) {
          this.loading = true

          const submitData = {
            ...this.submitForm,
            deptId: Array.isArray(this.submitForm.deptId)
              ? this.submitForm.deptId[this.submitForm.deptId.length - 1]
              : this.submitForm.deptId
          }

          // 根据 title 判断是新增还是编辑
          const isEdit = this.title === '编辑医师'
          const request = isEdit ? updateUser(submitData) : addUser(submitData)

          request.then(() => {
            this.$message.success(`${isEdit ? '修改' : '添加'}成功`)
            this.dialogVisible = false
            this.$emit('refreshData')
          }).catch(() => {
          }).finally(() => {
            this.loading = false
          })
        }
      })
    }
  }
}
</script>

<style lang="scss">
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

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
