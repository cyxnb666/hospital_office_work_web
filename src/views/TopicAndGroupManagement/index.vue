<template>
  <div class="TopicAndGroupManagement">
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
      <el-tab-pane label="课题管理" name="1"></el-tab-pane>
      <el-tab-pane label="课题人员管理" name="2"></el-tab-pane>
    </el-tabs>
    <div class="TopicAndGroupManagement-content" v-if="activeName === '1'">
      <QueryTable :formDate="formDate" :queryList="queryList" :tableData="tableData" :tableColumn="tableColumn"
        @onSearch="onSearch" label-width="90px" :tableSelection="true" :handleSelectionChange="handleSelectionChange"
        v-loading="loading">
        <template v-slot:functionalArea>
          <el-button type="primary" size="small" @click="create">添加</el-button>
          <el-button type="danger" size="small" @click="deleteFn" :disabled="tableSelected.length === 0">删除
          </el-button>
        </template>
        <template v-slot:operation>
          <el-table-column label="状态" width="80" align="center">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.enableFlag" :active-value="'1'" :inactive-value="'0'" active-color="#13ce66"
                inactive-color="#ff4949" @change="handleStatusChange(scope.row)">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" align="center">
            <template slot-scope="scope">
              <el-button type="text" @click="edit(scope.row)">编辑</el-button>
              <el-button type="text" @click="generateQRCode(scope.row)">生成二维码</el-button>
            </template>
          </el-table-column>
        </template>
      </QueryTable>
      <el-dialog :title="title" :visible.sync="qrCodeDialog.visible" :close-on-click-modal="false" center>
        <div v-loading="qrCodeDialog.loading" class="qr-code-container">
          <img v-if="qrCodeDialog.url" :src="qrCodeDialog.url" alt="课题二维码" class="qr-code-image">
        </div>
      </el-dialog>
    </div>
    <div class="grouping" v-else v-loading="groupingLoading">
      <div class="topicName">
        <TitleLabel title="课题名称" />
        <div class="topicName-content">
          <el-radio-group v-model="topicCode" size="small">
            <el-radio-button v-for="(item, index) in topicList" :key="index" :label="item.topicId">{{ item.topicName }}
            </el-radio-button>
          </el-radio-group>
          <div class="topicConditions">
            <div class="title">课题条件</div>
            <div>
              <template v-if="currentTopicConditions && currentTopicConditions.length">
                <div v-for="(condition, index) in currentTopicConditions" :key="index">
                  {{ index + 1 }}、{{ condition.condition }}
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 课题招募人员清单部分 -->
      <div class="personnelGrouping">
        <TitleLabel title="课题招募人员清单" />
        <div class="personnelGrouping-content">
          <PersonnelManagement ref="PersonnelManagement" :topicId="topicCode" :topicInfo="currentTopic"
            @detail-click="handlePersonnelDetail" />
        </div>
      </div>

      <TopicGroupAddOrEdit ref="TopicGroupAddOrEdit" />
    </div>
    <TopicAddOrEdit ref="TopicAddOrEdit" :topicLeaderOptions="topicLeaderOptions"
      :topicTypeOptions="topicTypeOptions" />
    <Details ref="Details" :type="1" :show-audit="true" :disable-audit="isDetailsDisabled"
      @auditSuccess="handleAuditSuccess" />
  </div>
</template>

<script>
import QueryTable from '@/components/QueryTable/index.vue'
import TopicAddOrEdit from '@/views/TopicAndGroupManagement/components/TopicAddOrEdit.vue'
import TitleLabel from '@/components/TitleLabel/index.vue'
import TopicGroupAddOrEdit from './components/TopicGroupAddOrEdit.vue'
import PersonnelManagement from './components/PersonnelManagement.vue'
import Details from '@/views/CustomerManagement/components/Details.vue'
import {
  getTopicByPage,
  deleteTopic,
  getTopicPrincipal,
  generateQrCode,
  getTopicLeaders,
  updateTopicStatus,
  getDictByType,
  getAllTopic
} from './api'

export default {
  name: 'TopicAndGroupManagement',
  components: {
    TitleLabel,
    TopicAddOrEdit,
    QueryTable,
    TopicGroupAddOrEdit,
    PersonnelManagement,
    Details
  },
  data() {
    return {
      activeName: '1',
      formDate: {
        condition: {
          topicLeader: '',
          topicName: ''
        },
        current: 1,
        size: 10,
        total: 0
      },
      queryList: [
        {
          label: '课题名称:',
          prop: 'topicName',
          type: 'el-input'
        },
        {
          label: '课题负责人:',
          prop: 'topicLeader',
          type: 'el-select',
          options: []
        }
      ],
      topicTypeOptions: [],
      topicLeaderOptions: [],
      tableData: [],
      loading: false,
      groupingLoading: false,
      qrCodeDialog: {
        visible: false,
        loading: false,
        url: ''
      },
      title: '',
      tableColumn: [
        {
          prop: 'topicName',
          label: '课题名称',
          align: 'center'
        },
        {
          prop: 'introduction',
          label: '课题简介',
          align: 'center'
        },
        {
          prop: 'topicLeader',
          label: '课题负责人',
          align: 'center'
        },
        {
          prop: 'topicTimePeriod',
          label: '课题时段',
          align: 'center'
        }
      ],
      tableSelected: [],
      topicCode: '',
      topicList: []
    }
  },
  methods: {
    onSearch(params) {
      this.loading = true
      if (params) {
        this.formDate.current = params.current
        this.formDate.size = params.size
      }
      const queryParams = {
        condition: params?.condition || this.formDate.condition,
        pageIndex: params?.current || this.formDate.current,
        pageSize: params?.size || this.formDate.size
      }
      getTopicByPage(queryParams)
        .then(res => {
          this.tableData = res.items || []
          this.formDate.total = res.totalSize || 0
        })
        .catch(() => {
          this.$message.error('获取课题列表失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    edit(row) {
      console.log(row)
      this.$refs.TopicAddOrEdit.initialization('edit', row)
    },
    create() {
      this.$refs.TopicAddOrEdit.initialization('add')
    },
    deleteFn() {
      if (this.tableSelected.length === 0) {
        return
      }

      this.$confirm('此操作将删除选中课题, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        const ids = this.tableSelected.map(item => item.topicId)
        return deleteTopic(ids)
      }).then(() => {
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.onSearch()
      }).catch(() => {
      })
    },
    handleStatusChange(row) {
      updateTopicStatus(row.topicId)
        .then(() => {
          this.$message.success('状态更新成功')
        })
        .catch(() => {
          // 如果失败了就回滚enableFlag的状态
          row.enableFlag = row.enableFlag === '1' ? '0' : '1'
          this.$message.error('状态更新失败')
        })
    },
    handleSelectionChange(rows) {
      this.tableSelected = rows
    },
    getTopicTypeOptions() {
      getDictByType('TOPIC_TYPE')
        .then(res => {
          this.topicTypeOptions = (res || []).map(item => ({
            value: item.dictCode,
            label: item.dictName
          }))
        })
        .catch(() => {
          this.$message.error('获取课题类别失败')
        })
    },
    getTopicLeaderOptions() {
      getTopicLeaders()
        .then(res => {
          const options = (res || []).map(name => ({
            label: name.userName,
            value: name.userId
          }))

          // 用于新增/编辑弹窗
          this.topicLeaderOptions = options

          // 用于查询条件下拉框
          const topicLeaderQuery = this.queryList.find(item => item.prop === 'topicLeader')
          if (topicLeaderQuery) {
            topicLeaderQuery.options = options
          }
        })
        .catch(() => {
          this.$message.error('获取课题负责人列表失败')
        })
    },
    generateQRCode(row) {
      this.title = row.topicName
      this.qrCodeDialog.loading = true
      this.qrCodeDialog.visible = true

      generateQrCode(row.topicId)
        .then(res => {
          // 拼接完整的OSS URL
          this.qrCodeDialog.url = `${this.ossBaseUrl}${res}`
        })
        .catch(() => {
          this.$message.error('生成二维码失败')
          this.qrCodeDialog.visible = false
        })
        .finally(() => {
          this.qrCodeDialog.loading = false
        })
    },
    handleClick(tab) {
      if (tab.name === '2') {
        this.groupingLoading = true

        getAllTopic()
          .then(res => {
            this.topicList = res.map(topic => ({
              topicId: topic.topicId,
              topicName: topic.topicName,
              topicCondition: topic.topicCondition,
              recruitCount: topic.recruitCount,
              status: topic.status
            }))

            // 如果有课题列表，选中第一个
            if (this.topicList.length > 0) {
              this.topicCode = this.topicList[0].topicId

              // 延迟初始化，确保组件已经渲染完成
              this.$nextTick(() => {
                if (this.$refs.PersonnelManagement) {
                  // 直接调用初始化，不要调用resetToFirstTab避免重复
                  this.$refs.PersonnelManagement.activeTab = 'approved'
                  this.$refs.PersonnelManagement.init()
                }
              })
            }
          })
          .catch(() => {
            this.$message.error('获取课题列表失败')
          })
          .finally(() => {
            this.groupingLoading = false
          })
      }
    },
    // 在methods中添加
    handlePersonnelDetail(row) {
      const detailData = {
        ...row,
        topicId: this.topicCode,
        customerId: row.customerId
      }
      this.$refs.Details.initialization(detailData)
    },

    // 如果还没有handleAuditSuccess方法，也需要添加
    handleAuditSuccess() {
      // 刷新当前选中课题的人员数据
      if (this.$refs.PersonnelManagement) {
        this.$refs.PersonnelManagement.init()
        // 重新加载当前激活tab的数据
        const activeTab = this.$refs.PersonnelManagement.activeTab
        if (activeTab === 'approved') {
          // 审核通过列表会自动重新加载
        } else if (activeTab === 'survey') {
          this.$refs.PersonnelManagement.$refs.surveyAudit &&
            this.$refs.PersonnelManagement.$refs.surveyAudit.loadData()
        } else if (activeTab === 'registration') {
          this.$refs.PersonnelManagement.$refs.registrationAudit &&
            this.$refs.PersonnelManagement.$refs.registrationAudit.loadData()
        }
      }
    }
  },
  computed: {
    isDetailsDisabled() {
      if (!this.currentTopic) return false
      if (this.currentTopic.status === '1') return true
      return false
    },
    currentTopic() {
      return this.topicList.find(topic => topic.topicId === this.topicCode) || null
    },
    currentTopicConditions() {
      const currentTopic = this.topicList.find(topic => topic.topicId === this.topicCode)
      return currentTopic ? currentTopic.topicCondition : []
    },
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
    }
  },
  watch: {
  },
  created() {
    this.onSearch()
    this.getTopicTypeOptions()
    this.getTopicLeaderOptions()
  },
  mounted() {
    // your code here
  }
}
</script>

<style lang="scss" scoped>
.TopicAndGroupManagement {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;

  .el-tabs {
    flex-shrink: 0;
  }

  &-content {
    height: calc(100% - 51px);
    overflow: auto;
  }

  .qr-code-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .qr-code-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  // 分组管理部分
  .grouping {
    height: 100%;
    overflow-y: auto; // 允许垂直滚动

    .topicName {
      &-content {
        padding: 20px;
        box-sizing: border-box;

        .el-radio-group {
          :deep(.el-radio-button__inner) {
            border-left: 1px solid #DCDFE6; // 确保左边框显示
          }
        }

        .topicConditions {
          margin-top: 10px;
          display: flex;

          .title {
            margin-right: 10px;
          }
        }
      }
    }
  }

  // 课题招募人员清单部分
  .personnelGrouping {
    &-content {
      padding: 20px;
      box-sizing: border-box;
      height: calc(100vh - 300px); // 设置合适的高度
    }
  }
}
</style>