<template>
  <div class="TopicAndGroupManagement">
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
      <el-tab-pane label="课题管理" name="1"></el-tab-pane>
      <el-tab-pane label="课题人员管理" name="2"></el-tab-pane>
    </el-tabs>
    <div class="TopicAndGroupManagement-content" v-if="activeName === '1'">
      <QueryTable :formDate="formDate" :queryList="queryList" :tableData="tableData" :tableColumn="tableColumn"
                  @onSearch="onSearch" label-width="90px" :tableSelection="true"
                  :handleSelectionChange="handleSelectionChange"
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
        <TitleLabel title="课题名称"/>
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
      <div class="personnelGrouping">
        <TitleLabel title="课题招募人员清单"/>
        <div class="personnelGrouping-content">
          <div class="joinedGroup">
            <div class="header">
              <div class="title">审核通过患者列表</div>
              <div>
                (招募人数: {{ currentTopic?.recruitCount || 0 }}人;
                已招募: {{ groupedCustomers.length }}人;
                待招募: {{ remainingSlots }}人)
              </div>
            </div>
            <el-table ref="joinedTable" :data="groupedCustomers" border style="width: 100%"
                      @selection-change="groupSelectionChange($event, 'joinedGroup')" v-loading="separateGrouploading">
              <el-table-column type="selection" width="55" align="center"/>
              <el-table-column prop="customerName" label="患者姓名" align="center">
                <template slot-scope="scope">
                  <div :class="{ serviceStatus: scope.row.serviceStatus === '1' }">{{ scope.row.customerName }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="superintendentName" label="负责人" align="center">
                <template slot-scope="scope">
                  <div :class="{ serviceStatus: scope.row.serviceStatus === '1' }">{{ scope.row.superintendentName }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="gender" label="性别" align="center">
                <template slot-scope="scope">
                  <div :class="{ serviceStatus: scope.row.serviceStatus === '1' }">{{ scope.row.gender }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="birthday" label="出生年月" align="center">
                <template slot-scope="scope">
                  <div :class="{ serviceStatus: scope.row.serviceStatus === '1' }">{{ scope.row.birthday }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="age" label="年龄" align="center">
                <template slot-scope="scope">
                  <div :class="{ serviceStatus: scope.row.serviceStatus === '1' }">{{ scope.row.age }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="phone" label="联系方式" align="center">
                <template slot-scope="scope">
                  <div :class="{ serviceStatus: scope.row.serviceStatus === '1' }">{{ scope.row.phone }}</div>
                </template>
              </el-table-column>
              <el-table-column label="审核状态" align="center" width="100">
                <template slot-scope="scope">
                  <el-tag :type="getReviewStatusType(scope.row.reviewStatus)" size="small">
                    {{ getReviewStatusText(scope.row.reviewStatus) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                  <el-button type="text" @click="details(scope.row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="operation" v-if="currentTopic && currentTopic.status !== '1'">
            <el-button type="danger" size="small" @click="notJoinedGroup" plain style="display: block;width: 100px;"
                       :disabled="!selectedJoinedGroup.length && !selectedNotJoinedGroup.length">
              审核不通过
            </el-button>
            <el-button type="success" size="small" @click="joinedGroup" plain
                       style="display: block;width: 100px;margin: 10px 0"
                       :disabled="!selectedJoinedGroup.length && !selectedNotJoinedGroup.length">
              审核通过
            </el-button>
          </div>
          <div class="notJoinedGroup">
            <div class="header">
              <div class="title">待审核和审核不通过患者列表</div>
              <div>(人数: {{ ungroupedCustomers.length }}人)</div>
            </div>
            <el-table ref="notJoinedTable" :data="ungroupedCustomers" border style="width: 100%"
                      @selection-change="groupSelectionChange($event, 'notJoinedGroup')"
                      v-loading="separateGrouploading">
              <el-table-column type="selection" width="55" align="center"/>
              <el-table-column prop="customerName" label="患者姓名" align="center"/>
              <el-table-column prop="gender" label="性别" align="center"/>
              <el-table-column prop="birthday" label="出生年月" align="center"/>
              <el-table-column prop="age" label="年龄" align="center"/>
              <el-table-column prop="phone" label="联系方式" align="center"/>
              <el-table-column label="审核状态" align="center" width="100">
                <template slot-scope="scope">
                  <el-tag :type="getReviewStatusType(scope.row.reviewStatus)" size="small">
                    {{ getReviewStatusText(scope.row.reviewStatus) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                  <el-button type="text" @click="details(scope.row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <div class="button-container" v-if="currentTopic && currentTopic.status !== '1'">
          <el-button type="primary" @click="handleTemp" :disabled="!topicCode">暂存</el-button>
          <el-button type="success" @click="handleComplete" :disabled="!topicCode">完成</el-button>
        </div>
      </div>

      <TopicGroupAddOrEdit ref="TopicGroupAddOrEdit"/>
    </div>
    <TopicAddOrEdit ref="TopicAddOrEdit"
                    :topicLeaderOptions="queryList.find(item => item.prop === 'topicLeader')?.options || []"
                    :topicTypeOptions="topicTypeOptions"/>
    <Details ref="Details" :type="1" :show-audit="true" :disable-audit="isDetailsDisabled"
             @auditSuccess="handleAuditSuccess"/>
  </div>
</template>

<script>
import QueryTable from '@/components/QueryTable/index.vue'
import TopicAddOrEdit from '@/views/TopicAndGroupManagement/components/TopicAddOrEdit.vue'
import TitleLabel from '@/components/TitleLabel/index.vue'
import TopicGroupAddOrEdit from './components/TopicGroupAddOrEdit.vue'
import Details from '@/views/CustomerManagement/components/Details.vue'
import {
  getTopicByPage,
  deleteTopic,
  getTopicPrincipal,
  generateQrCode,
  updateTopicStatus,
  getDictByType,
  getAllTopic,
  getTopicGroupList,
  updateTopicGroupStatus,
  deleteTopicGroup,
  listGroupCustomer,
  topicTemp,
  completeTopic,
  listTopicCustomer
} from './api'

export default {
  name: 'TopicAndGroupManagement',
  components: {
    TitleLabel,
    TopicAddOrEdit,
    QueryTable,
    TopicGroupAddOrEdit,
    Details
  },
  data () {
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
      tableData: [],
      loading: false,
      groupingLoading: false,
      separateGrouploading: false,
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
      topicCode: '1',
      topicList: [],
      groupedCustomers: [], // 已入组患者
      ungroupedCustomers: [], // 未入组患者
      selectedJoinedGroup: [], // 已入组选中项
      selectedNotJoinedGroup: [], // 未入组选中项
      currentDetailRow: null
    }
  },
  methods: {
    onSearch (params) {
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
    getTopicPrincipalList () {
      getTopicPrincipal()
          .then(res => {
            // 将返回的字符串数组转换为选择框需要的格式
            const options = (res || []).map(name => ({
              label: name,
              value: name // 使用姓名作为value值
            }))

            // 找到课题负责人的查询选项并更新
            const topicLeaderQuery = this.queryList.find(item => item.prop === 'topicLeader')
            if (topicLeaderQuery) {
              topicLeaderQuery.options = options
            }
          })
          .catch(() => {
            this.$message.error('获取课题负责人列表失败')
          })
    },
    edit (row) {
      console.log(row)
      this.$refs.TopicAddOrEdit.initialization('edit', row)
    },
    create () {
      this.$refs.TopicAddOrEdit.initialization('add')
    },
    deleteFn () {
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
    handleStatusChange (row) {
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
    handleSelectionChange (rows) {
      this.tableSelected = rows
    },
    getTopicTypeOptions () {
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
    generateQRCode (row) {
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
    groupSelectionChange (selection, type) {
      // 确保只保留最后选中的一项
      if (selection.length > 1) {
        const lastSelected = selection[selection.length - 1]
        if (type === 'joinedGroup') {
          this.selectedJoinedGroup = [lastSelected]
          // 手动更新表格的选中状态
          this.$nextTick(() => {
            this.groupedCustomers.forEach(row => {
              this.$refs.joinedTable.toggleRowSelection(row, row === lastSelected)
            })
          })
        } else {
          this.selectedNotJoinedGroup = [lastSelected]
          // 手动更新表格的选中状态 
          this.$nextTick(() => {
            this.ungroupedCustomers.forEach(row => {
              this.$refs.notJoinedTable.toggleRowSelection(row, row === lastSelected)
            })
          })
        }
      } else {
        // 如果是取消选中,则正常更新
        if (type === 'joinedGroup') {
          this.selectedJoinedGroup = selection
        } else {
          this.selectedNotJoinedGroup = selection
        }
      }
    },
    handleAuditSuccess () {
      this.loadCustomerList(this.topicCode)
    },
    handleClick (tab) {
      if (tab.name === '2') {
        this.groupingLoading = true
        this.resetGroupState()
        this.currentDetailRow = null

        getAllTopic()
            .then(res => {
              this.topicList = res.map(topic => ({
                topicId: topic.topicId,
                topicName: topic.topicName,
                topicCondition: topic.topicCondition,
                recruitCount: topic.recruitCount,
                status: topic.status
              }))

              // 如果有当前选中的课题，保持选中状态并重新加载数据
              if (this.topicCode && this.topicList.some(topic => topic.topicId === this.topicCode)) {
                this.loadCustomerList(this.topicCode)
              }
              // 如果没有选中课题但有课题列表，选中第一个并加载数据
              else if (this.topicList.length > 0) {
                this.topicCode = this.topicList[0].topicId
              }
            })
            .catch(() => {
              this.$message.error('获取课题列表失败')
            })
            .finally(() => {
              this.groupingLoading = false
            })
      } else {
        this.resetGroupState()
        this.currentDetailRow = null
      }
    },
    details (row) {
      const detailData = {
        ...row,
        topicId: this.topicCode
      }
      this.currentDetailRow = detailData
      this.$refs.Details.initialization(detailData)
    },
    resetGroupState () {
      this.groupedCustomers = []
      this.ungroupedCustomers = []
      this.selectedJoinedGroup = []
      this.selectedNotJoinedGroup = []
    },
    loadCustomerList (topicId) {
      this.separateGrouploading = true
      this.selectedJoinedGroup = []
      this.selectedNotJoinedGroup = []

      listTopicCustomer(topicId)
          .then(res => {
            this.groupedCustomers = res.groupCustomers || []
            this.ungroupedCustomers = res.unGroupCustomers || []
          })
          .catch(() => {
            this.$message.error('获取患者列表失败')
          })
          .finally(() => {
            this.separateGrouploading = false
          })
    },
    // 获取审核状态显示文本
    getReviewStatusText (status) {
      const statusMap = {
        0: '待审核',
        1: '审核通过',
        2: '审核不通过'
      }
      return statusMap[status] || '未知状态'
    },

    // 获取审核状态标签类型
    getReviewStatusType (status) {
      const typeMap = {
        0: 'warning',
        1: 'success',
        2: 'danger'
      }
      return typeMap[status] || 'info'
    },
    notJoinedGroup () {
      const selectedRow = this.selectedJoinedGroup[0] || this.selectedNotJoinedGroup[0]
      if (!selectedRow) {
        return
      }
      this.$refs.Details.initialization({
        ...selectedRow,
        topicId: this.topicCode
      })
    },

    joinedGroup () {
      const selectedRow = this.selectedNotJoinedGroup[0] || this.selectedJoinedGroup[0]
      if (!selectedRow) {
        return
      }
      this.$refs.Details.initialization({
        ...selectedRow,
        topicId: this.topicCode
      })
    },
    getGroupParams () {
      if (!this.topicCode) {
        this.$message.warning('请先选择课题')
        return null
      }

      return {
        topicId: this.topicCode,
      }
    },

    // 暂存
    handleTemp () {
      const params = this.getGroupParams()
      if (!params) return

      topicTemp(params)
          .then(() => {
            this.$message.success('暂存成功')
            this.loadCustomerList(this.topicCode)
          })
          .catch(() => {
          })
    },

    // 完成
    handleComplete () {
      const params = this.getGroupParams()
      if (!params) return

      this.$confirm('确认是否完成该课题?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        return completeTopic(params)
      }).then(() => {
        this.$message.success('成功完成该课题')
        this.refreshAllData()
      }).catch(() => {
        if (this.loading) {
          this.refreshAllData()
        }
      }).finally(() => {
        this.loading = false
      })
    },
    refreshAllData () {
      // 保存当前选中的课题ID
      const currentTopicId = this.topicCode

      // 重新加载课题列表
      getAllTopic().then(res => {
        this.topicList = res.map(topic => ({
          topicId: topic.topicId,
          topicName: topic.topicName,
          topicCondition: topic.topicCondition,
          recruitCount: topic.recruitCount,
          status: topic.status
        }))

        // 恢复之前选中的课题
        if (currentTopicId && this.topicList.some(topic => topic.topicId === currentTopicId)) {
          this.topicCode = currentTopicId
        } else if (this.topicList.length > 0) {
          this.topicCode = this.topicList[0].topicId
        }

        // 加载患者列表
        if (this.topicCode) {
          this.loadCustomerList(this.topicCode)
        }
      }).catch(() => {
        this.$message.error('获取课题列表失败')
      })
    }
  },
  computed: {
    isDetailsDisabled () {
      if (!this.currentTopic) return false
      if (this.currentTopic.status === '1') return true
      return false
    },
    currentTopic () {
      return this.topicList.find(topic => topic.topicId === this.topicCode) || null
    },
    currentTopicConditions () {
      const currentTopic = this.topicList.find(topic => topic.topicId === this.topicCode)
      return currentTopic ? currentTopic.topicCondition : []
    },
    remainingSlots () {
      if (!this.currentTopic) return 0
      return (this.currentTopic.recruitCount || 0) - this.groupedCustomers.length
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
    topicCode () {
      this.currentDetailRow = null
      this.resetGroupState()
      if (this.topicCode) {
        this.loadCustomerList(this.topicCode)
      }
    }
  },
  created () {
    this.onSearch()
    this.getTopicPrincipalList()
    this.getTopicTypeOptions()
  },
  mounted () {
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

  .dialog-content {
    .button-group {
      display: flex;
      justify-content: center;
      gap: 10px;

      .el-button {
        min-width: 100px;
      }
    }
  }

  // 课题分组部分
  .topicGrouping {
    .topicGrouping-header {
      display: flex;
      align-items: center;
      padding: 0 20px 0 0;
      position: sticky; // 让header保持在顶部
      top: 0;
      background: #fff;
      z-index: 1;

      :deep(.TitleLabel) {
        flex: 1;
      }

      .el-button {
        margin-left: 16px;
      }
    }

    &-content {
      padding: 20px;
      box-sizing: border-box;
    }
  }

  // 人员分组部分
  .personnelGrouping {
    .button-container {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 20px;
      padding: 20px;
      position: sticky; // 让按钮固定在底部
      bottom: 0;
      background: #fff;
      z-index: 1;

      .el-button {
        margin: 0 10px;
        padding: 10px 30px;
      }
    }

    &-content {
      padding: 20px;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: flex-start; // 改为flex-start让两边的表格可以独立滚动

      .joinedGroup {
        width: calc(50% - 80px);
        max-height: calc(100vh - 500px); // 设置最大高度
        overflow-y: auto; // 允许垂直滚动

        .header {
          position: sticky; // header固定
          top: 0;
          background: #fff;
          z-index: 1;
          display: flex;
          justify-content: flex-end;
          margin-bottom: 10px;

          .title {
            font-size: 16px;
            margin-right: 10px;
            font-weight: bold;
          }
        }
      }

      .operation {
        margin: 0 40px;
      }

      .notJoinedGroup {
        width: calc(50% - 80px);
        max-height: calc(100vh - 500px); // 设置最大高度
        overflow-y: auto; // 允许垂直滚动

        .header {
          position: sticky; // header固定
          top: 0;
          background: #fff;
          z-index: 1;
          display: flex;
          justify-content: flex-end;
          margin-bottom: 10px;

          .title {
            font-size: 16px;
            margin-right: 10px;
            font-weight: bold;
          }
        }
      }
    }
  }
}

.serviceStatus {
  color: #afb2b8;
}
</style>
