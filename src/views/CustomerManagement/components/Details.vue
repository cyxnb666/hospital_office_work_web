<template>
  <div class="details-container">
    <el-dialog title="患者详情" :visible.sync="dialogVisible" :close-on-click-modal="false" width="80%"
      @close="handleClose">
      <div class="Details">
        <div class="customerInformation">
          <div class="customerInformation-top">
            <el-avatar :size="56" :src="details.avatar || circleUrl" @error="handleAvatarError">
            </el-avatar>
            <div class="name">{{ details.customerName }}</div>
          </div>
          <el-tabs v-if="type" v-model="activeTab" :stretch="true">
            <el-tab-pane label="基本信息" name="1"></el-tab-pane>
            <el-tab-pane label="调查问卷" name="2"
              v-if="currentSurveyQuestion?.length && !details.hideQuestionnaire"></el-tab-pane>
            <el-tab-pane label="同意书" name="3" v-if="currentSignFileOssId"></el-tab-pane>
            <el-tab-pane label="上传报告" name="4" v-if="currentReportImages?.length"></el-tab-pane>
          </el-tabs>
          <el-divider v-else></el-divider>
          <div class="basicData" v-if="activeTab === '1'">
            <!-- <div class="basicData-item">
              <div class="label">出生年月</div>
              <div class="value">{{ details.birthday }}</div>
            </div> -->
            <div class="basicData-item">
              <div class="label">年龄</div>
              <div class="value">{{ details.age }}岁</div>
            </div>
            <div class="basicData-item">
              <div class="label">性别</div>
              <div class="value">{{ details.gender }}</div>
            </div>
            <!-- <div class="basicData-item">
              <div class="label">病历号</div>
              <div class="value">{{ details.medicalRecordNo }}</div>
            </div> -->
            <!-- <div class="basicData-item">
              <div class="label">所在地区</div>
              <div class="value">{{ currentTopicInfo?.region || details.region }}</div>
            </div> -->
            <!-- <div class="basicData-item">
              <div class="label">详细地址</div>
              <div class="value">{{ currentTopicInfo?.address || details.address }}</div>
            </div> -->
            <div class="basicData-item">
              <div class="label">联系方式</div>
              <div class="value">{{ details?.phone || '-' }}</div>
            </div>
            <div class="basicData-item" v-if="showSuperintendent">
              <div class="label">负责人</div>
              <div class="value">{{ getCurrentTopicSuperintendent }}</div>
            </div>
            <div class="basicData-item" v-if="showAudit">
              <div class="label">负责人</div>
              <div class="value">{{ details.superintendentName || '-' }}</div>
            </div>
          </div>
          <div class="consentForm" v-if="activeTab === '2'">
            <div class="questionnaire">
              <el-empty v-if="!currentSurveyQuestion?.length" description="暂无问卷" />
              <template v-else>
                <!-- 问卷标题和列表 -->
                <div v-for="(survey, surveyIndex) in currentSurveyQuestion" :key="surveyIndex" class="survey-container">
                  <div class="survey-title">{{ survey.surveyName }}</div>

                  <!-- 循环问题列表 -->
                  <el-card v-for="(question, questionIndex) in survey.surveyQuestions" :key="questionIndex"
                    class="questionnaire-item" v-if="!question.questionParentId">
                    <!-- 父问题标题 -->
                    <div class="subject">
                      <span class="question-title">{{ questionIndex + 1 }}. {{ question.questionContent }}</span>
                    </div>

                    <!-- 父问题选项 -->
                    <template v-if="question.questionType === 'RADIO' || question.questionType === 'CHECKBOX'">
                      <div class="option" v-for="(option, optionIndex) in question.options" :key="optionIndex">
                        <el-image style="width: 26px; height: 26px"
                          :src="getOptionImage(option.checked, question.questionType)" />
                        <span class="option-text" :class="{ 'checked': option.checked }">
                          {{ option.optionContent }}
                        </span>
                      </div>
                    </template>

                    <!-- 输入框类型问题 -->
                    <template v-else-if="question.questionType === 'INPUT' && question.inputValue">
                      <div class="input-answer">
                        答: {{ question.inputValue }}
                      </div>
                    </template>

                    <!-- 子问题部分 -->
                    <template v-if="question.children && question.children.length">
                      <div v-for="(childQuestion, childIndex) in question.children" :key="'child-' + childIndex"
                        class="child-question">
                        <div class="subject">
                          <span class="question-title">
                            {{ questionIndex + 1 }}.{{ childIndex + 1 }}. {{ childQuestion.questionContent }}
                          </span>
                        </div>

                        <!-- 子问题选项 -->
                        <template
                          v-if="childQuestion.questionType === 'RADIO' || childQuestion.questionType === 'CHECKBOX'">
                          <div class="option" v-for="(option, optionIndex) in childQuestion.options" :key="optionIndex">
                            <el-image style="width: 26px; height: 26px"
                              :src="getOptionImage(option.checked, childQuestion.questionType)" />
                            <span class="option-text" :class="{ 'checked': option.checked }">
                              {{ option.optionContent }}
                            </span>
                          </div>
                        </template>

                        <!-- 子问题输入框 -->
                        <template v-else-if="childQuestion.questionType === 'INPUT' && childQuestion.inputValue">
                          <div class="input-answer">
                            答: {{ childQuestion.inputValue }}
                          </div>
                        </template>
                      </div>
                    </template>
                  </el-card>
                </div>
              </template>
            </div>
          </div>
          <div class="consentForm" v-if="activeTab === '3'">
            <div class="consentForm-title">知情同意书·同意签字页</div>
            <div class="consentForm-header">临床研究项目名称：甲减方治疗原发性甲状腺功能减退症的临床疗效评价研究</div>
            <div class="consentForm-header">承担单位：成都中医药大学附属医院</div>
            <div class="consentForm-header">课题编号：2023MS589</div>
            <div class="consentForm-header">同意声明：</div>
            <p>1. 我已经阅读了上述有关本研究的介绍，而且有机会就此项研究与医生讨论并提出问题。我提出的所有问题都得到了满意的答复。</p>
            <p>2. 我知道参加本研究可能产生的风险和受益。我知晓参加研究是自愿的，我确认已有充足时间对此进行考虑，而且明白：</p>
            <ul>
              <li>(1) 我可以随时向医生咨询更多的信息。</li>
              <li>(2) 我可以随时退出本研究，而不会受到歧视或报复，医疗待遇与权益不会受到影响。</li>
              <li>(3) 我同样清楚，如果我中途退出研究，特别是由于药物的原因使我退出研究时，我应将我的病情变化告诉医生，完成相应的体格检查和理化检查，这将对整个研究十分有利。</li>
              <li>(4) 如果因病情变化我需要采取任何其他的药物治疗，我会在事先征求医生的意见，或在事后如实告诉医生。</li>
              <li>(5) 我同意研究者、申办者代表、伦理委员会和项目管理部门查阅我的研究资料。</li>
              <li>(6) 我将获得一份经过签名并注明日期的知情同意书副本。</li>
            </ul>
            <p>最后，我决定同意参加本项研究，并保证尽量遵从医嘱。</p>
            <p>
              <label for="patientSignature">患者签名：</label>
              <el-image v-if="currentSignFileOssId" :src="`${ossBaseUrl}${currentSignFileOssId}`"
                :preview-src-list="[`${ossBaseUrl}${currentSignFileOssId}`]" fit="contain" class="signature-image">
              </el-image>
            </p>
            <p class="contact-line">
              <label>联系手机：</label>
              <span>{{ currentTopicInfo?.phone || '-' }}</span>
            </p>
            <p>我确认已向患者解释了本试验的详细情况，包括其权利以及可能的受益和风险，并给其一份签署过的知情同意书副本。</p>
            <p>
              <label for="doctorSignature">医生签名：</label>
            </p>
            <p>
              <label for="patientPhone">联系手机：</label>
            </p>
          </div>
          <div class="uploadReports" v-if="activeTab === '4'">
            <el-empty v-if="!currentReportImages?.length" description="暂无报告" />
            <template v-else>
              <div class="report-container">
                <div class="image-list">
                  <el-image v-for="(imageUrl, index) in currentReportImages" :key="index" :src="imageUrl" fit="cover"
                    :preview-src-list="currentReportImages" class="report-image">
                    <template #error>
                      <div class="image-error">
                        <i class="el-icon-picture-outline"></i>
                      </div>
                    </template>
                  </el-image>
                </div>
              </div>
            </template>
          </div>

        </div>
        <div class="groupingData">
          <el-radio-group class="topic" v-model="activeName" size="small">
            <el-radio-button v-for="(item, index) in topicList" :key="index" :label="item.topicId">
              {{ item.topicName }}
            </el-radio-button>
          </el-radio-group>
          <el-divider></el-divider>
          <el-table :data="tableData" border style="width: 100%" :span-method="objectSpanMethod" v-loading="loading">
            <!-- <el-table-column prop="topicGroupName" label="组名" align="center" /> -->
            <el-table-column prop="topicGroupName" label="课程名称" width="140" align="center">
              <template #default="scope">
                {{ scope.row.topicGroupName }}
              </template>
            </el-table-column>
            <el-table-column prop="customerNo" label="登记号" width="180" align="center">
              <template #default="scope">
                <template v-if="scope.row.customerNo">
                  {{ scope.row.customerNo }}
                </template>
                <template v-else>
                  <div style="display: flex; align-items: center;">
                    <el-input size="mini" v-model="scope.row.inputCustomerNo" style="width: 100px; margin-right: 8px;"
                      placeholder="请输入" :disabled="isTopicDisabled(scope.row)">
                    </el-input>
                    <el-button size="mini" type="primary" @click="handleSetCustomerNo(scope.row)"
                      :disabled="isTopicDisabled(scope.row)">
                      确定
                    </el-button>
                  </div>
                </template>
              </template>
            </el-table-column>
            <el-table-column prop="testTimes" label="服务次数" align="center" />
            <el-table-column prop="serviceCount" label="服务次" align="center" />
            <el-table-column prop="takeMedicineTime" label="取药时间" align="center" />
            <el-table-column label="检查报告" align="center" width="90">
              <template #default="scope">
                <el-button type="text" v-if="scope.row.isUploadFile" @click="handleDownloadReport(scope.row)">
                  查看
                </el-button>
              </template>
            </el-table-column>
            <el-table-column prop="appointStatus" label="完成状态" align="center" width="80">
              <template #default="scope">
                <span :style="{ color: scope.row.appointStatus === '2' ? '#67C23A' : '#F56C6C' }">
                  {{ scope.row.appointStatus === '2' ? '完成' : '未完成' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="190">
              <template #default="scope">
                <!-- 如果服务已终止，显示的状态文本 -->
                <template v-if="scope.row.isServiceStop">
                  <span class="service-stopped">服务已终止</span>
                </template>
                <!-- 如果服务未终止，显示操作按钮 -->
                <template v-else>
                  <el-button type="text" v-if="scope.row.takeMedicineBtn && !scope.row.isTakeMedicine"
                    @click="handleTakeMedicine(scope.row)"
                    :disabled="!scope.row.customerNo || isTopicDisabled(scope.row)">
                    取药
                  </el-button>
                  <el-button type="text" v-if="scope.row.uploadFileBtn" @click="handleUploadReport(scope.row)"
                    :disabled="isTopicDisabled(scope.row)">
                    上传报告
                  </el-button>
                  <el-button type="text" style="color: #ff4949" v-if="scope.row.stopServiceBtn"
                    @click="handleStopService(scope.row)" :disabled="isStopServiceDisabled(scope.row)">
                    终止服务
                  </el-button>
                </template>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <!-- <div v-if="showAudit" style="padding-top: 20px;">
        <el-form label-width="120px">
          <el-form-item label="审核不通过原因" v-if="!disableAudit || (disableAudit && details.reviewStatus === '2')">
            <el-input v-model="rejectReason" type="textarea" :rows="2" placeholder="请输入审核不通过原因" style="width: 300px"
              :disabled="disableAudit">
            </el-input>
          </el-form-item>
          <el-form-item>

            <template v-if="disableAudit">
              <template v-if="details.reviewStatus === '1'">
                <el-button type="primary" disabled>审核通过</el-button>
              </template>
              <template v-else-if="details.reviewStatus === '2'">
                <el-button type="danger" disabled>审核不通过</el-button>
              </template>
            </template>

            <template v-else>
              <el-button type="danger" @click="auditReject" style="margin-right: 20px">审核不通过</el-button>
              <el-button type="primary" @click="auditPass">审核通过</el-button>
            </template>
          </el-form-item>
        </el-form>
      </div> -->
    </el-dialog>

    <!-- 上传报告弹窗 -->
    <el-dialog title="上传报告" :visible.sync="uploadDialogVisible" width="500px" :close-on-click-modal="false">
      <el-upload class="upload-demo" drag action="#" :http-request="submitUpload" :before-upload="beforeUpload"
        :file-list="fileList" :multiple="false" :limit="1" accept=".pdf,.doc,.docx" :on-change="handleFileChange"
        :auto-upload="false">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">只能上传PDF或Word格式文件，且不超过10MB</div>
      </el-upload>
      <span slot="footer" class="dialog-footer">
        <el-button @click="uploadDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitUpload" :loading="uploadLoading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getCustomerById, uploadReport, takeMedicine, terminateService, setCustomerNo, auditCustomer } from '../api'

export default {
  name: 'DetailsView',
  props: {
    type: {
      type: Number,
      default: 0
    },
    showAudit: {
      type: Boolean,
      default: false
    },
    disableAudit: {
      type: Boolean,
      default: false
    },
    showSuperintendent: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      details: {
        customerName: '',
        birthday: '',
        gender: '',
        medicalRecordNo: '',
        region: '',
        address: '',
        phone: '',
        age: '',
        reportImages: []
      },
      surveyQuestion: [],
      topicList: [],
      circleUrl: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      activeName: '',
      activeTab: '1',

      uploadDialogVisible: false,
      uploadLoading: false,
      currentRow: null,
      fileList: [],
      rejectReason: '',
    }
  },
  computed: {
    ossBaseUrl() {
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
    },
    tableData() {
      if (!this.currentGroupDetail || !this.currentGroupDetail.length) {
        return []
      }

      return this.currentGroupDetail.reduce((acc, group) => {
        const baseRow = {
          topicGroupName: group.topicName,
          customerNo: group.customerNo,
          inputCustomerNo: '',
          testTimes: group.testTimes,
          topicCustomerId: group.topicCustomerId,
          topicGroupId: group.topicGroupId,
        }

        const rows = group.appointList.map((appoint, index) => ({
          ...baseRow,
          ...appoint,
          serviceCount: `第${appoint.serviceCount}次`,
          _groupIndex: acc.length
        }))

        return [...acc, ...rows]
      }, [])
    },
    currentGroupDetail() {
      if (!this.topicList || !Array.isArray(this.topicList)) {
        return []
      }
      const currentTopic = this.topicList.find(topic => topic.topicId === this.activeName)
      return currentTopic && Array.isArray(currentTopic.groupDetail)
        ? currentTopic.groupDetail
        : []
    },
    getCurrentTopicSuperintendent() {
      return this.currentTopicInfo?.superintendentName || '-'
    },
    currentTopicInfo() {
      if (!this.topicList || !this.activeName) return null
      return this.topicList.find(topic => topic.topicId === this.activeName) || null
    },
    currentSurveyQuestion() {
      return this.currentTopicInfo?.surveyQuestion || []
    },
    currentReportImages() {
      return this.currentTopicInfo?.reportImages || []
    },
    currentSignFileOssId() {
      return this.currentTopicInfo?.signFileOssId || ''
    }
  },
  methods: {
    handleClose() {
      this.details = {
        customerName: '',
        birthday: '',
        gender: '',
        medicalRecordNo: '',
        region: '',
        address: '',
        phone: '',
        age: ''
      }
      this.signFileOssId = ''
      this.surveyQuestion = []
      this.topicList = []
      this.activeName = ''
      this.activeTab = '1'
      this.rejectReason = ''
      this.dialogVisible = false
    },
    initialization(row) {
      this.dialogVisible = true
      this.loading = true

      const params = {
        customerId: row.customerId,
        topicId: row.topicId
      }

      if (row.topicCustomerId) {
        params.topicCustomerId = row.topicCustomerId
      }

      getCustomerById(params).then(res => {
        if (res) {
          this.details = {
            ...res.customerDetail,
            topicCustomerId: row.topicCustomerId,
            topicId: row.topicId,
            hideQuestionnaire: row.hideQuestionnaire
          }
          this.topicList = Array.isArray(res.topicDetail) ? res.topicDetail : []
          if (this.topicList.length > 0) {
            this.activeName = this.topicList[0].topicId
          }
          if (this.currentTopicInfo?.superintendent) {
            this.administrator = this.currentTopicInfo.superintendent
          }
          if (this.details.rejectedReason) {
            this.rejectReason = this.details.rejectedReason
          }
        }
      }).catch(() => {
      }).finally(() => {
        this.loading = false
      })
    },
    objectSpanMethod({ row, column, rowIndex }) {
      const firstColumns = ['topicGroupName', 'customerNo', 'testTimes']
      const columnIndex = firstColumns.indexOf(column.property)

      if (columnIndex > -1) {
        const rows = this.tableData.filter(
          item => item._groupIndex === row._groupIndex
        )

        if (rowIndex === row._groupIndex) {
          return {
            rowspan: rows.length,
            colspan: 1
          }
        } else {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }
    },
    getOptionImage(checked, type) {
      if (checked) {
        return type === 'RADIO'
          ? require('@/assets/images/radioChecked.png')
          : require('@/assets/images/checked.png')
      }
      return type === 'RADIO'
        ? require('@/assets/images/radio.png')
        : require('@/assets/images/checkbox.png')
    },
    // 处理下载报告
    handleDownloadReport(row) {
      if (!row.fileOssId) {
        this.$message.warning('无可下载的文件')
        return
      }

      const downloadUrl = `${this.ossBaseUrl}${row.fileOssId}`
      window.open(downloadUrl)
      // const link = document.createElement('a')
      // link.style.display = 'none'
      // link.href = `//i.demo.com/ExpCourse/dowloadFile?url=${downloadUrl}`
      //
      // // 设置下载文件名 - 从fileOssId中提取文件扩展名
      // const extension = row.fileOssId.substring(row.fileOssId.lastIndexOf('.')) || ''
      // link.download = `报告文件${extension}` // 不知道要不要改名字
      //
      // // 添加到页面，触发点击，然后移除
      // document.body.appendChild(link)
      // link.click()
      // document.body.removeChild(link)
    },

    // 处理取药
    handleTakeMedicine(row) {
      this.$confirm('确认该患者已取药？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        takeMedicine(row.appointId)
          .then(() => {
            this.$message.success('已确认取药')
            // 刷新当前患者数据
            this.initialization({
              customerId: this.details.customerId,
              topicId: this.details.topicId,
              topicCustomerId: this.details.topicCustomerId
            })
          })
          .catch(() => { })
      }).catch(() => { })
    },

    // 处理终止服务
    handleStopService(row) {
      this.$confirm('确认要终止该患者的服务吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        terminateService(row.topicCustomerId)
          .then(() => {
            this.$message.success('服务已终止')
            this.initialization({
              customerId: this.details.customerId,
              topicId: this.details.topicId,
              topicCustomerId: this.details.topicCustomerId
            })
          })
          .catch(() => {
            this.$message.error('终止服务失败')
          })
      }).catch(() => { })
    },
    handleUploadReport(row) {
      this.currentRow = row
      this.uploadDialogVisible = true
      this.fileList = []
    },

    beforeUpload(file) {
      const isValidType = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ].includes(file.type)

      if (!isValidType) {
        this.$message.error('只能上传PDF或Word格式的文件!')
        return false
      }

      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        this.$message.error('文件大小不能超过10MB!')
        return false
      }
      return true
    },

    handleUploadSuccess() {
      this.$message.success('报告上传成功')
      this.uploadDialogVisible = false
      this.initialization({
        customerId: this.details.customerId,
        topicId: this.details.topicId,
        topicCustomerId: this.details.topicCustomerId
      })
    },

    handleUploadError() {
      this.$message.error('报告上传失败')
    },

    submitUpload() {
      if (!this.fileList.length) {
        this.$message.warning('请先选择文件')
        return
      }

      this.uploadLoading = true
      const formData = new FormData()
      formData.append('file', this.fileList[0].raw)
      formData.append('appointId', this.currentRow.appointId)
      formData.append('topicCustomerId', this.currentRow.topicCustomerId)
      formData.append('topicGroupId', this.currentRow.topicGroupId)

      uploadReport(formData)
        .then(() => {
          this.handleUploadSuccess()
        })
        .catch(() => { })
        .finally(() => {
          this.uploadLoading = false
        })
    },

    handleAvatarError() {
      // 如果avatar加载失败，会自动回退到默认图片（circleUrl）
      console.warn('Avatar loading failed, using default avatar')
    },

    handleSetCustomerNo(row) {
      if (!row.inputCustomerNo) {
        this.$message.warning('请输入序号')
        return
      }

      const params = {
        customerNo: row.inputCustomerNo,
        topicCustomerId: row.topicCustomerId
      }

      setCustomerNo(params)
        .then(() => {
          this.$message.success('序号设置成功')
          // 刷新当前患者数据
          this.initialization({
            customerId: this.details.customerId,
            topicId: this.details.topicId,
            topicCustomerId: this.details.topicCustomerId
          })
        })
        .catch(() => {
          this.$message.error('序号设置失败')
        })
    },

    handleFileChange(file) {
      this.fileList = [file]
    },

    isTopicDisabled(row) {
      if (!this.topicList || !this.activeName) return false
      const currentTopic = this.topicList.find(topic => topic.topicId === this.activeName)
      return currentTopic?.enableFlag === '0'
    },
    isStopServiceDisabled(row) {
      if (this.isTopicDisabled(row)) {
        return true
      }

      return this.details.reviewStatus !== '6'
    },

    auditPass() {
      if (!this.administrator) {
        this.$message.warning('请选择负责人')
        return
      }

      this.$confirm('确认审核通过?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        const params = {
          customerId: this.details.customerId,
          superintendent: this.administrator,
          reviewStatus: '1',  // 审核通过
          topicId: this.details.topicId
        }
        return auditCustomer(params)
      }).then(() => {
        this.$message.success('审核通过成功')
        this.rejectReason = ''
        this.administrator = ''
        this.dialogVisible = false
        this.$emit('auditSuccess')
      }).catch(() => { })
    },

    auditReject() {
      if (!this.administrator) {
        this.$message.warning('请选择负责人')
        return
      }

      if (!this.rejectReason.trim()) {
        this.$message.warning('请输入审核不通过原因')
        return
      }

      this.$confirm('确认审核不通过?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        const params = {
          customerId: this.details.customerId,
          superintendent: this.administrator,
          reviewStatus: '2',  // 审核不通过
          rejectedReason: this.rejectReason,
          topicId: this.details.topicId
        }
        return auditCustomer(params)
      }).then(() => {
        this.$message.success('审核不通过成功')
        this.rejectReason = ''
        this.administrator = ''
        this.dialogVisible = false
        this.$emit('auditSuccess')
      }).catch(() => { })
    }
  }
}
</script>

<style lang="scss" scoped>
.Details {
  display: flex;
  justify-content: space-between;

  .customerInformation {
    width: 500px;
    background-color: #F7F8FA;
    margin-right: 20px;
    padding: 20px;
    box-sizing: border-box;
    max-height: 700px;
    display: flex;
    flex-direction: column;

    &-top {
      text-align: center;

      .name {
        margin-top: 10px;
        font-size: 18px;
        font-weight: bold;
      }
    }

    .basicData {
      &-item {
        display: flex;
        margin-bottom: 20px;

        .label {
          width: 90px;
          font-size: 16px;
        }

        .value {
          font-size: 16px;
          color: #000;
        }
      }
    }

    .consentForm {
      flex: 1;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background-color: #ddd;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-track {
        background-color: #f5f5f5;
      }

      &-title {
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 20px;
      }

      &-header {
        text-align: left;
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 10px;
      }

      p {
        margin-bottom: 10px;
      }

      ul {
        padding: 0 10px;
        margin-bottom: 10px;

        li {
          list-style: none;
          margin-bottom: 10px;
        }
      }
    }
  }

  .groupingData {
    width: calc(100% - 520px);
    background-color: #F7F8FA;
    padding: 20px;
    box-sizing: border-box;

    .topic {
      width: 100%;
      overflow-x: auto;

      :deep(.el-radio-button__inner) {
        border-left: 1px solid #DCDFE6; // 确保左边框显示
      }
    }
  }

  :deep(.el-button--text.is-disabled) {
    color: #c0c4cc !important;
  }
}

.questionnaire {
  .questionnaire-item {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    .subject {
      font-size: 18px;
      display: flex;
      align-items: center;
      margin-bottom: 10px;

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

.service-stopped {
  color: #909399;
  font-size: 14px;
}

.signature-line {
  display: flex;
  align-items: center;
  margin: 20px 0;

  label {
    margin-right: 10px;
    flex-shrink: 0;
  }

  .signature-image {
    width: 150px;
    height: 60px;
    border-radius: 4px;
  }
}

.survey-container {
  margin-bottom: 30px;

  &:last-child {
    margin-bottom: 0;
  }

  .survey-title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #303133;
  }
}

.input-answer {
  margin: 10px 0;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  color: #606266;
}

::v-deep .el-dialog__body {
  padding: 20px !important;
}

::v-deep .el-dialog {
  margin-top: 7vh !important;
}

.el-divider {
  margin: 20px 0;
}

.uploadReports {
  .report-container {
    padding: 20px 0;
    max-height: 480px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #ddd;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-track {
      background-color: #f5f5f5;
    }

    .image-list {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      padding-right: 6px;

      .report-image {
        width: 200px;
        height: 200px;
        border-radius: 4px;
        cursor: pointer;
      }

      .image-error {
        width: 100%;
        height: 100%;
        background-color: #f5f7fa;
        display: flex;
        align-items: center;
        justify-content: center;

        i {
          font-size: 30px;
          color: #909399;
        }
      }
    }
  }
}
</style>
