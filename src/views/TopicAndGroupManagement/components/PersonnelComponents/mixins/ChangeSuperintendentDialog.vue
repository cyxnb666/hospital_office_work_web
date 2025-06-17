<template>
  <el-dialog 
    title="变更跟进人" 
    :visible.sync="dialogVisible" 
    width="400px" 
    :close-on-click-modal="false"
    @close="handleClose">
    
    <el-form :model="form" ref="form" :rules="rules" label-width="80px">
      <el-form-item label="负责人:" prop="superintendent">
        <el-select 
          v-model="form.superintendent" 
          placeholder="请选择负责人" 
          style="width: 100%"
          v-loading="loading">
          <el-option
            v-for="item in superintendentOptions"
            :key="item.userId"
            :label="item.userName"
            :value="item.userId">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getTopicLeaders, changeSuperintendent } from '../../../api'

export default {
  name: 'ChangeSuperintendentDialog',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      submitting: false,
      
      // 表单数据
      form: {
        superintendent: ''
      },
      
      // 验证规则
      rules: {
        superintendent: [
          { required: true, message: '请选择负责人', trigger: 'change' }
        ]
      },
      
      // 负责人选项列表
      superintendentOptions: [],
      
      // 当前患者信息
      patientInfo: null,
      topicId: null
    }
  },
  methods: {
    // 打开弹窗
    open(patientData, topicId) {
      this.patientInfo = patientData
      this.topicId = topicId
      this.dialogVisible = true
      this.loadSuperintendentOptions()
    },
    
    // 关闭弹窗
    handleClose() {
      this.dialogVisible = false
      this.resetForm()
    },
    
    // 重置表单
    resetForm() {
      this.form = {
        superintendent: ''
      }
      this.superintendentOptions = []
      this.patientInfo = null
      this.topicId = null
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    
    // 加载负责人选项
    loadSuperintendentOptions() {
      this.loading = true
      
      getTopicLeaders(this.topicId)
        .then(res => {
          this.superintendentOptions = res || []
        })
        .catch(() => {
          this.$message.error('获取负责人列表失败')
          this.superintendentOptions = []
        })
        .finally(() => {
          this.loading = false
        })
    },
    
    // 提交变更
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitting = true
          
          const submitData = {
            superintendent: this.form.superintendent,
            topicCustomerId: this.patientInfo.topicCustomerId
          }
          
          console.log('变更跟进人:', submitData)
          
          changeSuperintendent(submitData)
            .then(() => {
              this.$message.success('变更跟进人成功')
              this.dialogVisible = false
              // 通知父组件刷新数据
              this.$emit('change-success')
            })
            .catch(() => {
              this.$message.error('变更跟进人失败')
            })
            .finally(() => {
              this.submitting = false
            })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-select {
  width: 100%;
}
</style>