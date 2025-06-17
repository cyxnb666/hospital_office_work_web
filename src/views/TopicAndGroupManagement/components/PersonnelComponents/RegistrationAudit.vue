<template>
  <div class="registration-audit">
    <!-- 查询条件 -->
    <div class="search-form">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="审核状态:">
          <el-select v-model="searchForm.auditStatus" placeholder="请选择审核状态" clearable style="width: 150px;">
            <el-option label="待审核" value="1" />
            <el-option label="审核通过" value="2" />
            <el-option label="审核不通过" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchAudit">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 报名审核表格 -->
    <el-table :data="tableData" border height="250" style="width: 100%" v-loading="loading"
      @selection-change="handleSelectionChange" ref="auditTable">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="customerName" label="患者名称" align="center" />
      <el-table-column prop="superintendentName" label="跟进人" align="center" />
      <el-table-column prop="customerNo" label="登记号" align="center" />
      <el-table-column prop="age" label="年龄" align="center" />
      <el-table-column prop="signUpTime" label="入组时间" align="center" />
      <el-table-column prop="firstVisitTime" label="首次随访时间" align="center" />
      <el-table-column prop="phone" label="联系方式" align="center" />
      <el-table-column label="审核状态" align="center">
        <template slot-scope="scope">
          <el-tag :type="getAuditStatusType(scope.row.reviewStatus)" size="small">
            {{ getAuditStatusText(scope.row.reviewStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="handleDetail(scope.row)">详情</el-button>
          <el-button type="text" @click="handleFollowUpRecord(scope.row)">跟进记录</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-wrapper">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="pagination.current" :page-sizes="[10, 20, 30, 40]" :page-size="pagination.size"
        layout="total, sizes, prev, pager, next, jumper" :total="pagination.total">
      </el-pagination>
    </div>

    <!-- 审核操作按钮 -->
    <div class="audit-actions">
      <el-button type="success" @click="handleBatchAudit('approve')" :disabled="!canAudit">
        审核通过
      </el-button>
      <el-button type="danger" @click="handleBatchAudit('reject')" :disabled="!canAudit">
        审核不通过
      </el-button>
    </div>

    <!-- 跟进记录对话框 -->
    <FollowUpDialog ref="FollowUpDialog" />
  </div>
</template>

<script>
import FollowUpDialog from './mixins/FollowUpDialog.vue'
import { listTopicRecruitment, batchAudit } from '../../api'

export default {
  name: 'RegistrationAudit',
  components: {
    FollowUpDialog
  },
  props: {
    topicId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      searchForm: {
        auditStatus: ''
      },
      tableData: [],
      loading: false,
      selectedRows: [], // 选中的行
      pagination: {
        current: 1,
        size: 10,
        total: 0
      }
    }
  },
  computed: {
    // 判断是否可以进行审核操作（只有全部是待审核状态时才能审核）
    canAudit() {
      if (this.selectedRows.length === 0) return false
      // 报名审核的待审核状态是 '1'
      return this.selectedRows.every(row => row.reviewStatus === '1')
    }
  },
  methods: {
    // 页面状态值转换为API状态值
    getApiAuditStatus(pageStatus) {
      const statusMap = {
        '1': '1', // 待审核 -> 报名待审核
        '2': '6', // 审核通过 -> 审核通过
        '3': '2'  // 审核不通过 -> 报名审核不通过
      }
      return pageStatus ? statusMap[pageStatus] || '' : ''
    },

    loadData() {
      if (!this.topicId) return

      this.loading = true

      const params = {
        condition: {
          auditStatus: this.getApiAuditStatus(this.searchForm.auditStatus),
          queryType: "3", // 报名审核
          superintendentName: "",
          topicId: this.topicId
        },
        pageIndex: this.pagination.current,
        pageSize: this.pagination.size
      }

      listTopicRecruitment(params)
        .then(res => {
          this.tableData = res.items || []
          this.pagination.total = res.totalSize || 0
          this.$emit('updateBadge', res.extendData?.applyAuditAmount || 0)
          this.$emit('updateAllBadges', res.extendData)
        })
        .catch(() => {
          this.$message.error('获取报名审核列表失败')
          this.tableData = []
          this.pagination.total = 0
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 查询方法
    searchAudit() {
      this.pagination.current = 1 // 查询时回到第一页
      this.loadData()
    },

    resetSearch() {
      this.searchForm.auditStatus = ''
      this.pagination.current = 1 // 重置时回到第一页
      this.loadData()
    },

    // 分页处理方法
    handleSizeChange(size) {
      this.pagination.size = size
      this.pagination.current = 1 // 改变每页条数时回到第一页
      this.loadData()
    },

    handleCurrentChange(current) {
      this.pagination.current = current
      this.loadData()
    },

    // 表格选择处理
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 批量审核处理
    handleBatchAudit(action) {
      const actionText = action === 'approve' ? '审核通过' : '审核不通过'

      if (this.selectedRows.length === 0) {
        this.$message.warning('请先选择要审核的记录')
        return
      }

      // 检查是否全部为待审核状态
      if (!this.canAudit) {
        this.$message.warning('只能对状态为"待审核"的记录进行审核操作')
        return
      }

      this.$confirm(`确定要将选中的 ${this.selectedRows.length} 条报名记录${actionText}吗？`, '确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        // 这里调用对应的审核API
        this.performBatchAudit(action, this.selectedRows)
      }).catch(() => {
        // 取消操作
      })
    },

    performBatchAudit(action, selectedRows) {
      const topicCustomerIds = selectedRows.map(row => row.topicCustomerId)
      const auditStatus = action === 'approve' ? '1' : '2'
      const actionText = action === 'approve' ? '审核通过' : '审核不通过'

      const params = {
        auditStatus: auditStatus,
        queryType: "3", // 报名审核
        topicCustomerIds: topicCustomerIds,
        topicId: this.topicId
      }

      console.log(`执行报名${actionText}操作:`, params)

      // 调用真实的批量审核API
      batchAudit(params)
        .then(() => {
          this.$refs.auditTable.clearSelection()
          this.selectedRows = []
          this.$message.success(`报名${actionText}操作成功`)
          // 重新加载数据
          this.loadData()
        })
        .catch(() => {
          this.$message.error(`报名${actionText}操作失败`)
        })
    },

    handleDetail(row) {
      // 添加标识隐藏调查问卷tab
      this.$emit('detail-click', { ...row, hideQuestionnaire: true })
    },

    handleFollowUpRecord(row) {
      console.log('打开跟进记录:', row)
      this.$refs.FollowUpDialog.open(row, this.topicId)
    },

    getAuditStatusText(status) {
      if (status === '1') {
        return '待审核'
      } else if (status === '2') {
        return '审核不通过'
      } else {
        return '审核通过'
      }
    },

    getAuditStatusType(status) {
      if (status === '1') {
        return 'warning'
      } else if (status === '2') {
        return 'danger'
      } else {
        return 'success'
      }
    }
  },
  watch: {
    topicId: {
      handler(newVal, oldVal) {
        // 只重置状态，不自动加载数据
        if (newVal && newVal !== oldVal && String(newVal) !== 'undefined' && String(newVal) !== '') {
          this.pagination.current = 1
          this.searchForm.auditStatus = ''
          this.tableData = []
          this.pagination.total = 0
          // 移除 this.loadData() 调用
        }
      },
      immediate: false
    }
  }
}
</script>

<style lang="scss" scoped>
.registration-audit {
  height: 100%;
  display: flex;
  flex-direction: column;

  .search-form {
    margin-bottom: 20px;
    flex-shrink: 0; // 防止搜索表单被压缩
  }

  .el-table {
    flex: 1;
    margin-bottom: 20px;
    overflow: auto; // 确保表格可以滚动
    min-height: 0; // 允许flex子项缩小
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin: 20px 0;
    flex-shrink: 0; // 防止分页组件被压缩
  }

  .audit-actions {
    display: flex;
    justify-content: center; // 居中显示审核按钮
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    border-top: 1px solid #EBEEF5;
    flex-shrink: 0; // 防止审核按钮区域被压缩
  }
}
</style>