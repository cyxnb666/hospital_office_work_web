<template>
  <el-dialog :title="title" :visible.sync="dialogVisible" :close-on-click-modal="false" width="600px"
    @close="handleClose">
    <el-form :model="submitForm" ref="submitForm" class="demo-form-inline" label-width="100px" :rules="rules">
      <el-form-item label="课题名称" prop="topicName">
        <el-input v-model="submitForm.topicName" placeholder="请输入课题名称"></el-input>
      </el-form-item>
      <el-form-item label="课题类别" prop="topicType">
        <el-select v-model="submitForm.topicType" placeholder="请选择课题类别" style="width: 100%">
          <el-option v-for="item in topicTypeOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="课题负责人" prop="topicLeader">
        <!-- <el-input v-model="submitForm.topicLeader" placeholder="请输入课题负责人"></el-input> -->
        <el-select
    v-model="submitForm.topicLeader"
    filterable
    multiple
    placeholder="课题负责人"
    style="width: 100%"
  >
    <el-option
      v-for="item in topicLeaderOptions"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
      </el-form-item>
      <el-form-item label="课题内容" prop="introduction">
        <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" v-model="submitForm.introduction"
          placeholder="请输入课题内容"></el-input>
      </el-form-item>
      <el-form-item label="调查问卷" prop="surveyId">
        <el-select v-model="submitForm.surveyId" placeholder="请选择调查问卷" style="width: 100%">
          <el-option v-for="item in surveyOptions" :key="item.surveyId" :label="item.surveyName" :value="Number(item.surveyId)">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="课题时段" prop="topicPeriod">
        <el-date-picker v-model="submitForm.topicPeriod" style="width: 100%" type="daterange" value-format="yyyy-MM-dd"
          range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="招募人数" prop="recruitCount">
        <el-input v-model.number="submitForm.recruitCount" placeholder="请输入招募人数">
          <template slot="append">人</template>
        </el-input>
      </el-form-item>

      <el-form-item label="服务次数" prop="testTimes">
        <el-input v-model.number="submitForm.testTimes" placeholder="请输入服务次数">
          <template slot="append">次</template>
        </el-input>
      </el-form-item>

      <el-form-item label="预约间隔期" prop="reserveInterval">
        <el-input v-model.number="submitForm.reserveInterval" placeholder="请输入预约间隔期">
          <template slot="append">天</template>
        </el-input>
      </el-form-item>
      <el-form-item label="年龄" prop="age">
        <div class="age">
          <div class="ageValue">{{ submitForm.age[0] }}岁</div>
          <el-slider v-model="submitForm.age" range show-stops :max="150" :marks="marks" />
          <div class="ageValue">{{ submitForm.age[1] }}岁</div>
        </div>
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-select v-model="submitForm.gender" placeholder="请选择性别" style="width: 100%">
          <el-option v-for="(item, index) in genderList" :key="index" :value="item.value"
            :label="item.label"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="课题状态" prop="enableFlag">
        <el-select v-model="submitForm.enableFlag" placeholder="请选择课题状态" style="width: 100%">
          <el-option v-for="item in stateList" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :loading="loading">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { addTopic, getSurveyAll, updateTopic } from '../api'

export default {
  name: 'TopicAddOrEdit',
  props: {
    topicTypeOptions: {
      type: Array,
      default: () => []
    },
    topicLeaderOptions: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      title: '',
      dialogVisible: false,
      loading: false,
      actionType: 'add', // 新增标识符，用于区分是新增还是编辑
      submitForm: {
        topicName: '',
        topicType: '',
        topicLeader: [],
        introduction: '',
        surveyId: '',
        topicPeriod: [],
        recruitCount: '',
        testTimes: '',
        reserveInterval: '',
        age: [20, 60], // 设置默认年龄范围
        gender: '',
        enableFlag: '1',
        topicId: 0
      },
      marks: {
        0: {
          label: (value) => {
            console.log(value)
            return value + '岁'
          }
        }
      },
      genderList: [
        {
          value: '男',
          label: '男'
        },
        {
          value: '女',
          label: '女'
        },
        {
          value: '不限',
          label: '不限'
        }
      ],
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
        topicName: [
          {
            required: true,
            message: '请输入课题名称'
          }
        ],
        topicType: [
          {
            required: true,
            message: '请选择课题类别'
          }
        ],
        topicLeader: [
          {
            required: true,
            message: '请选择课题负责人'
          }
        ],
        introduction: [
          {
            required: true,
            message: '请输入课题内容'
          }
        ],
        topicPeriod: [
          {
            required: true,
            message: '请选择课题时段'
          }
        ],
        surveyId: [
          {
            required: true,
            message: '请选择调查问卷'
          }
        ],
        age: [
          {
            required: true,
            message: '请选择年龄'
          }
        ],
        gender: [
          {
            required: true,
            message: '请选择性别'
          }
        ],
        enableFlag: [
          {
            required: true,
            message: '请选择课题状态'
          }
        ],
        recruitCount: [
          { required: true, type: 'number', message: '招募人数必须为数字' },
          { type: 'number', min: 1, max: 1000, message: '招募人数必须在1-1000之间' }
        ],
        testTimes: [
          { required: true, type: 'number', message: '服务次数必须为数字' },
          { type: 'number', min: 2, message: '服务次数必须不小于2次' }
        ],
        reserveInterval: [
          { required: true, type: 'number', message: '预约间隔期必须为数字' },
          { type: 'number', min: 1, message: '预约间隔期必须不小于1天' }
        ]
      },
      surveyOptions: []
    }
  },
  methods: {
    getSurveyAllFn(){
      getSurveyAll().then(res => {
        this.surveyOptions = res
      })
    },
    handleClose () {
      this.resetForm()
      this.$nextTick(() => {
        this.$refs.submitForm.clearValidate()
      })
    },
    resetForm () {
      this.submitForm = {
        topicName: '',
        topicType: '',
        topicLeader: [],
        introduction: '',
        surveyId: '',
        topicPeriod: [],
        recruitCount: '',
        testTimes: '',
        reserveInterval: '',
        age: [20, 60],
        gender: '',
        enableFlag: '1',
        topicId: 0
      }
    },
    initialization (type, data) {
      this.getSurveyAllFn()
      this.actionType = type
      this.title = type === 'add' ? '新增课题' : '编辑课题'
      if (type === 'edit' && data) {
        // 处理时间，去掉时分秒部分
        const startDate = data.topicStartTime?.split(' ')[0]
        const endDate = data.topicEndTime?.split(' ')[0]
        const ageCondition = data.topicCondition?.find(item => item.conditionCode === 'AGE')
        const genderCondition = data.topicCondition?.find(item => item.conditionCode === 'GENDER')
        let genderValue = ''
        if (genderCondition && Array.isArray(genderCondition.configRangeArr)) {
          if (
            genderCondition.configRangeArr.length === 2 &&
            genderCondition.configRangeArr.includes('男') &&
            genderCondition.configRangeArr.includes('女')
          ) {
            genderValue = '不限'
          } else {
            genderValue = genderCondition.configRangeArr[0] || ''
          }
        }
        this.submitForm = {
          ...data,
          topicLeader: data.topicLeaderIds || [],
          topicPeriod: [startDate, endDate], // 只保留日期部分
          age: ageCondition?.configRangeArr || [20, 60],
          gender: genderValue
        }
      } else {
        this.resetForm()
      }
      this.dialogVisible = true
    },
    onSubmit () {
      this.$refs.submitForm.validate(valid => {
        if (valid) {
          this.loading = true
          // 构造提交数据
          const submitData = {
            topicName: this.submitForm.topicName,
            topicType: this.submitForm.topicType,
            topicLeader: this.submitForm.topicLeader,
            introduction: this.submitForm.introduction,
            surveyId: this.submitForm.surveyId,
            enableFlag: this.submitForm.enableFlag,
            topicStartTime: this.submitForm.topicPeriod[0].includes(' ')
              ? this.submitForm.topicPeriod[0]
              : this.submitForm.topicPeriod[0] + ' 00:00:00',
            // 处理结束时间
            topicEndTime: this.submitForm.topicPeriod[1].includes(' ')
              ? this.submitForm.topicPeriod[1]
              : this.submitForm.topicPeriod[1] + ' 23:59:59',
            recruitCount: this.submitForm.recruitCount,
            testTimes: this.submitForm.testTimes,
            reserveInterval: this.submitForm.reserveInterval,
            topicCondition: [
              {
                conditionCode: 'AGE',
                configRangeArr: this.submitForm.age,
                ordinal: 1
              },
              {
                conditionCode: 'GENDER',
                configRangeArr: this.submitForm.gender === '不限' ? ['男', '女'] : [this.submitForm.gender],
                ordinal: 2
              }
            ]
          }

          // 编辑时添加ID相关字段
          if (this.actionType === 'edit') {
            submitData.topicId = this.submitForm.topicId
            submitData.topicCondition = submitData.topicCondition.map(item => ({
              ...item,
              topicConditionId: this.submitForm.topicCondition?.find(c => c.conditionCode === item.conditionCode)?.topicConditionId,
              topicId: this.submitForm.topicId
            }))
          }

          // 根据actionType决定调用哪个接口
          const apiRequest = this.actionType === 'add' ? addTopic(submitData) : updateTopic(submitData)

          apiRequest
            .then(() => {
              this.$message.success(this.actionType === 'add' ? '添加成功' : '修改成功')
              this.dialogVisible = false
              this.$parent.onSearch()
            })
            .catch(() => {
              this.$message.error(this.actionType === 'add' ? '添加失败' : '修改失败')
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
.age {
  width: 460px;
  display: flex;
  justify-content: space-between;

  .ageValue {
    width: 50px;
    text-align: center;
  }

  .el-slider {
    width: calc(100% - 100px);
    margin: 0 10px;
  }
}
</style>
