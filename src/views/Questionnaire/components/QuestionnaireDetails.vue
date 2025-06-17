<template>
  <el-dialog :title="title" :visible.sync="dialogVisible" :close-on-click-modal="false" width="60%"
    @close="handleClose">
    <div class="QuestionnaireDetails" v-loading="loading">
      <div class="questionnaireInfo" v-if="!isView">
        <el-form :inline="true" :model="submitForm" class="demo-form-inline" label-width="80px" :rules="rules"
          ref="submitForm" :disabled="isView">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="模板名称" prop="templateName">
                <el-input v-model="submitForm.templateName" placeholder="请输入模板名称" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="开始时间" prop="startTime">
                <el-date-picker style="width: 100%" v-model="submitForm.startTime" value-format="yyyy-MM-dd 00:00:00"
                  :picker-options="startDatePicker" type="date" placeholder="选择日期" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="结束时间" prop="endTime">
                <el-date-picker style="width: 100%" v-model="submitForm.endTime" value-format="yyyy-MM-dd 23:59:59"
                  :picker-options="endDatePicker" type="date" placeholder="选择日期" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div class="questionnaireBox">
        <div class="questionType" v-if="!isView">
          <el-table :data="questionTypeTableData" style="width: 100%" highlight-current-row
            @current-change="handleCurrentChange">
            <el-table-column prop="questionTypeSelection" label="题型选择" align="center" />
          </el-table>
        </div>
        <div class="questionnaire">
          <el-empty v-if="!questionList.length" description="暂无问题" />
          <template v-else>
            <!-- 循环顶级问题 -->
            <el-card v-for="(item, index) in questionList" :key="index" class="questionnaire-item"
              v-if="!item.questionParentId">
              <!-- 父问题标题 -->
              <div class="subject">
                <template v-if="isView">
                  <span class="question-title">{{ index + 1 }}. {{ item.questionContent }}</span>
                </template>
                <template v-else>
                  <TextInput :value.sync="item.questionContent" :label="index + 1 + '.'" />
                </template>
                <el-switch v-if="!isView" v-model="item.required" active-color="#409EFF" inactive-color="#ff4949"
                  :active-text="item.required ? '必填' : '不必填'" />
              </div>

              <!-- 父问题选项 -->
              <template v-if="item.options && item.options.length">
                <div class="option" v-for="(option, optionIndex) in item.options" :key="optionIndex">
                  <el-image style="width: 26px; height: 26px"
                    :src="getOptionImage(option.checked, item.questionType)" />
                  <template v-if="isView">
                    <span class="option-text" :class="{ 'checked': option.checked }">{{ option.optionContent }}</span>
                  </template>
                  <template v-else>
                    <TextInput :value.sync="option.optionContent" width="196px" />
                    <div class="operation">
                      <el-button type="primary" icon="el-icon-arrow-down" plain size="mini"
                        @click="optionDown(index, optionIndex, false)" />
                      <el-button type="primary" icon="el-icon-arrow-up" plain size="mini"
                        @click="optionUp(index, optionIndex, false)" />
                      <el-button type="danger" icon="el-icon-delete" plain size="mini"
                        @click="optionDelete(index, optionIndex, false)" />
                    </div>
                  </template>
                </div>
              </template>

              <!-- 子问题部分 -->
              <template v-if="item.children && item.children.length">
                <div v-for="(childItem, childIndex) in item.children" :key="'child-' + childIndex"
                  class="child-question">
                  <div class="subject">
                    <template v-if="isView">
                      <span class="question-title">{{ index + 1 }}.{{ childIndex + 1 }}. {{ childItem.questionContent
                        }}</span>
                    </template>
                    <template v-else>
                      <TextInput :value.sync="childItem.questionContent" :label="`${index + 1}.${childIndex + 1}.`" />
                    </template>
                    <el-switch v-if="!isView" v-model="childItem.required" active-color="#409EFF"
                      inactive-color="#ff4949" :active-text="childItem.required ? '必填' : '不必填'" />
                  </div>

                  <!-- 子问题选项 -->
                  <div class="option" v-for="(option, optionIndex) in childItem.options" :key="optionIndex">
                    <el-image style="width: 26px; height: 26px"
                      :src="getOptionImage(option.checked, childItem.questionType)" />
                    <template v-if="isView">
                      <span class="option-text" :class="{ 'checked': option.checked }">{{ option.optionContent }}</span>
                    </template>
                    <template v-else>
                      <TextInput :value.sync="option.optionContent" width="196px" />
                      <div class="operation">
                        <el-button type="primary" icon="el-icon-arrow-down" plain size="mini"
                          @click="optionDown(index, optionIndex, false, childIndex)" />
                        <el-button type="primary" icon="el-icon-arrow-up" plain size="mini"
                          @click="optionUp(index, optionIndex, false, childIndex)" />
                        <el-button type="danger" icon="el-icon-delete" plain size="mini"
                          @click="optionDelete(index, optionIndex, false, childIndex)" />
                      </div>
                    </template>
                  </div>
                </div>
              </template>

              <!-- 问题操作按钮 -->
              <div class="questionnaire-item-operation" v-if="!isView">
                <el-button type="primary" icon="el-icon-plus" plain size="mini" @click="addOptions(index)">
                  添加选项
                </el-button>
                <div class="operation">
                  <el-button type="danger" icon="el-icon-delete" plain size="mini"
                    @click="optionDelete(index, null, true)" />
                  <el-button type="primary" icon="el-icon-caret-bottom" plain size="mini"
                    @click="optionDown(index, null, true)" />
                  <el-button type="primary" icon="el-icon-caret-top" plain size="mini"
                    @click="optionUp(index, null, true)" />
                </div>
              </div>
            </el-card>
          </template>
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">{{ isView ? '关闭' : '取消' }}</el-button>
      <el-button type="primary" @click="onSubmit" v-if="!isView">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import TextInput from '@/components/TextInput/index.vue'
import { getQuestionDetails } from '../api'

export default {
  name: 'QuestionnaireDetails',
  components: { TextInput },
  data() {
    return {
      title: '新增问卷',
      submitForm: {
        templateName: '',
        startTime: '',
        endTime: ''
      },
      dialogVisible: false,
      loading: false,
      isView: false,
      startDatePicker: {
        disabledDate: (time) => {
          if (this.submitForm.endTime) {
            return time.getTime() > new Date(this.submitForm.endTime).getTime()
          }
        }
      },
      endDatePicker: {
        disabledDate: (time) => {
          if (this.submitForm.startTime) {
            return time.getTime() < new Date(this.submitForm.startTime).getTime()
          }
        }
      },
      rules: {
        templateName: [
          {
            required: true,
            message: '请输入模板名称'
          }
        ],
        startTime: [
          {
            required: true,
            message: '请选择开始时间'
          }
        ],
        endTime: [
          {
            required: true,
            message: '请选择结束时间'
          }
        ]
      },
      questionTypeTableData: [
        {
          questionTypeSelection: '单选题',
          questionType: 'RADIO'
        },
        {
          questionTypeSelection: '多选题',
          questionType: 'CHECKBOX'
        },
      ],
      questionList: []
    }
  },
  methods: {
    handleClose() {
      this.submitForm = {
        templateName: '',
        startTime: '',
        endTime: ''
      }
      this.questionList = []
      this.isView = false
      this.$nextTick(() => {
        this.$refs.submitForm?.clearValidate()
      })
    },
    onSubmit() {
      this.$refs.submitForm.validate(valid => {
        if (valid) {
          if (!this.questionList.length) {
            this.$message.warning('请添加题目')
            return
          }
          // TODO: 提交表单
          console.log('提交表单', this.submitForm, this.questionList)
        }
      })
    },
    initialization(type, row) {
      this.title = type === 'add' ? '新增问卷' : '问卷详情'
      this.isView = type === 'edit'
      this.dialogVisible = true

      if (type === 'edit' && row) {
        this.loading = true
        this.submitForm = {
          templateName: row.surveyName,
          startTime: row.surveyStartTime,
          endTime: row.surveyEndTime
        }

        getQuestionDetails(row.surveyId)
          .then(res => {
            this.questionList = res || []
          })
          .catch(() => {
            this.$message.error('获取问卷详情失败')
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
    // 处理选项上下移动和删除
    optionDown(index, optionIndex, isQuestion, childIndex) {
      let target
      if (isQuestion) {
        target = this.questionList
        index = optionIndex
      } else if (childIndex !== undefined) {
        target = this.questionList[index].children[childIndex].options
      } else {
        target = this.questionList[index].options
      }

      if (optionIndex < target.length - 1) {
        [target[optionIndex], target[optionIndex + 1]] = [target[optionIndex + 1], target[optionIndex]]
      }
    },
    optionUp(index, optionIndex, isQuestion, childIndex) {
      let target
      if (isQuestion) {
        target = this.questionList
        index = optionIndex
      } else if (childIndex !== undefined) {
        target = this.questionList[index].children[childIndex].options
      } else {
        target = this.questionList[index].options
      }

      if (optionIndex > 0) {
        [target[optionIndex], target[optionIndex - 1]] = [target[optionIndex - 1], target[optionIndex]]
      }
    },
    optionDelete(index, optionIndex, isQuestion, childIndex) {
      let target
      if (isQuestion) {
        target = this.questionList
        index = optionIndex
      } else if (childIndex !== undefined) {
        target = this.questionList[index].children[childIndex].options
      } else {
        target = this.questionList[index].options
      }

      target.splice(optionIndex, 1)
    },
    handleCurrentChange() {
    },
    getOptionImage(checked, type) {
      if (checked) {
        return type === 'RADIO' ?
          require('@/assets/images/radioChecked.png') :
          require('@/assets/images/checked.png')
      }
      return type === 'RADIO' ?
        require('@/assets/images/radio.png') :
        require('@/assets/images/checkbox.png')
    },
    // 添加选项
    addOptions(index, childIndex) {
      const target = childIndex !== undefined
        ? this.questionList[index].children[childIndex]
        : this.questionList[index]

      if (!target.options) {
        this.$set(target, 'options', [])
      }

      target.options.push({
        optionContent: '新选项',
        ordinal: target.options.length + 1
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.QuestionnaireDetails {
  width: 100%;

  .questionnaireBox {
    max-height: 700px;
    display: flex;
    justify-content: space-between;

    .questionType {
      max-height: 700px;
      width: 200px;
      margin-right: 20px;
      border: 1px solid #EBEEF5;
    }

    .questionnaire {
      max-height: 700px;
      width: 100%;
      overflow-y: auto;

      .questionnaire-item {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }

        .subject {
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;

          .question-title {
            flex: 1;
            padding-right: 20px;
          }
        }

        .option {
          display: flex;
          align-items: center;
          margin: 10px 0;
          padding: 5px 0;

          .option-text {
            margin-left: 10px;
            font-size: 14px;

            &.checked {
              color: #409EFF;
              font-weight: 500;
            }
          }

          .operation {
            width: 150px;
            margin-left: 20px;
            display: flex;
            justify-content: space-between;
          }
        }

        .questionnaire-item-operation {
          margin-top: 10px;
          width: 100%;
          display: flex;
          justify-content: space-between;
        }

        .child-question {
          margin-left: 20px;
          margin-top: 15px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 4px;

          &:last-child {
            margin-bottom: 0;
          }

          .subject {
            font-size: 16px;
            margin-bottom: 10px;
          }

          .option {
            margin-left: 20px;
          }
        }
      }
    }
  }
}

.el-form-item {
  width: 100%;
}

::v-deep .el-form-item__content {
  width: calc(100% - 80px);
}

::v-deep .el-dialog__body {
  padding-bottom: 10px;
}
</style>
