<template>
  <el-dialog title="新增预约" :visible.sync="dialogVisible" width="600px" :close-on-click-modal="false"
    @close="handleClose">
    <el-form :model="formData" ref="formRef" :rules="rules" label-width="100px">
      <el-form-item label="预约课题" prop="topicId">
        <el-select v-model="formData.topicId" placeholder="请选择预约课题" style="width: 100%" @change="handleTopicChange">
          <el-option v-for="item in topicOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="患者姓名" prop="customerId">
        <el-select v-model="formData.customerId" placeholder="请选择患者" style="width: 100%" filterable
          :loading="customerLoading" :disabled="!formData.topicId">
          <el-option v-for="item in customerOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="预约时间" prop="appointTime">
        <el-date-picker v-model="formData.appointTime" placeholder="请选择预约时间" style="width: 100%"
          value-format="yyyy-MM-dd" :picker-options="pickerOptions">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="时段" prop="timePeriod">
        <el-select v-model="formData.timePeriod" placeholder="请选择时段" style="width: 100%">
          <el-option v-for="item in timePeriodOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getTopicCustomers, addAppointment } from '../api'
export default {
  name: 'AppointmentAdd',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      formData: {
        topicId: '',
        customerId: '',
        appointTime: '',
        timePeriod: ''
      },
      rules: {
        topicId: [
          { required: true, message: '请选择预约课题', trigger: 'change' }
        ],
        customerId: [
          { required: true, message: '请选择患者', trigger: 'change' }
        ],
        appointTime: [
          { required: true, message: '请选择预约时间', trigger: 'change' }
        ],
        timePeriod: [
          { required: true, message: '请选择时段', trigger: 'change' }
        ]
      },
      timePeriodOptions: [
        { value: 'AM', label: '上午' },
        { value: 'PM', label: '下午' }
      ],
      topicOptions: [],
      customerOptions: [],
      customerLoading: false,
      // 时间选择器配置
      pickerOptions: {
        disabledDate(time) {
          // 禁用今天之前的日期
          return time.getTime() < Date.now() - 8.64e7
        },
        disabledTime(time) {
          const now = new Date()
          const selectedDate = new Date(time)

          // 如果选择的是今天，则禁用当前时间之前的时间
          if (selectedDate.toDateString() === now.toDateString()) {
            const currentHour = now.getHours()
            const currentMinute = now.getMinutes()

            return {
              disabledHours() {
                const hours = []
                for (let i = 0; i < currentHour; i++) {
                  hours.push(i)
                }
                return hours
              },
              disabledMinutes(hour) {
                if (hour === currentHour) {
                  const minutes = []
                  for (let i = 0; i <= currentMinute; i++) {
                    minutes.push(i)
                  }
                  return minutes
                }
                return []
              }
            }
          }
          return {}
        }
      }
    }
  },
  methods: {
    // 打开弹窗
    open(topicOptions = []) {
      this.dialogVisible = true
      this.resetForm()

      // 更新课题选项数据
      if (topicOptions && topicOptions.length > 0) {
        this.updateTopicOptions(topicOptions)
      }
    },

    // 监听预约课题变化
    handleTopicChange(topicId) {
      this.formData.customerId = '' // 清空之前选择的患者
      this.customerOptions = [] // 清空患者选项

      if (topicId) {
        this.fetchCustomers(topicId)
      }
    },

    // 获取患者列表
    fetchCustomers(topicId) {
      this.customerLoading = true
      getTopicCustomers(topicId)
        .then(res => {
          this.customerOptions = (res || []).map(item => ({
            value: item.customerId,
            label: item.customerName
          }))
        })
        .catch(() => {
          this.$message.error('获取患者列表失败')
          this.customerOptions = []
        })
        .finally(() => {
          this.customerLoading = false
        })
    },

    updateTopicOptions(topicData) {
      this.topicOptions = topicData.map(item => ({
        value: item.topicId,
        label: item.topicName
      }))
    },

    // 关闭弹窗
    handleClose() {
      this.dialogVisible = false
      this.resetForm()
      this.$nextTick(() => {
        this.$refs.formRef && this.$refs.formRef.clearValidate()
      })
    },

    // 重置表单
    resetForm() {
      this.formData = {
        topicId: '',
        customerId: '',
        appointTime: '',
        timePeriod: ''
      }
    },

    // 提交表单
    handleSubmit() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          this.loading = true

          // 构造提交数据
          const submitData = {
            appointDay: this.formData.appointTime,
            customerId: this.formData.customerId,
            timePeriod: this.formData.timePeriod,
            topicId: this.formData.topicId
          }

          addAppointment(submitData)
            .then(() => {
              this.$message.success('预约添加成功')
              this.dialogVisible = false
              this.$emit('refresh')
            })
            .catch(() => {
              this.$message.error('预约添加失败')
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-form {
  .el-form-item {
    margin-bottom: 20px;
  }
}
</style>