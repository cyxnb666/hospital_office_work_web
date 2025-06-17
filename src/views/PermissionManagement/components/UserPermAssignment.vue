<template>
  <div class="UserPermAssignment" v-loading="loading">
    <el-table :data="tableData" border style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column width="55" align="center">
        <template slot-scope="scope">
          <el-checkbox v-model="scope.row.checked" @change="(val) => handleCheckChange(val, scope.row)">
          </el-checkbox>
        </template>
      </el-table-column>
      <el-table-column prop="userName" label="姓名" align="center" />
      <el-table-column prop="phone" label="电话" align="center" />
      <el-table-column prop="deptName" label="部门" align="center" />
    </el-table>
    <el-button style="margin-top: 20px;" type="primary" size="small" :loading="saving" :disabled="!currentRoleId" @click="savePermissions">
      保存设置
    </el-button>
    <div class="Pagination">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryForm.current" :page-sizes="[10, 20, 30, 40]" :page-size="queryForm.size"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { getUserByRole, updateUserPermission } from '../api'
export default {
  name: 'UserPermAssignment',
  data() {
    return {
      loading: false,
      saving: false,
      tableData: [],
      queryForm: {
        pageIndex: 1,
        pageSize: 10
      },
      total: 0,
      currentRoleId: null
    }
  },
  methods: {
    // 加载角色下的用户列表
    loadUsersByRole(roleId) {
      this.currentRoleId = roleId
      this.queryForm.pageIndex = 1  // 重置到第一页
      this.fetchUsers()
    },
    // 获取用户列表数据
    fetchUsers() {
      if (!this.currentRoleId) return

      this.loading = true
      getUserByRole({
        ...this.queryForm,
        condition: this.currentRoleId
      }).then(res => {
        this.tableData = res.items || []
        this.total = res.totalSize || 0
        this.queryForm.pageIndex = res.pageIndex
        this.queryForm.pageSize = res.pageSize
      }).catch(() => {
        this.$message.error('获取用户列表失败')
      }).finally(() => {
        this.loading = false
      })
    },
    // 处理勾选变化
    handleCheckChange(checked, row) {
      row.checked = checked
    },
    // 保存权限设置
    savePermissions() {
      if (!this.currentRoleId) {
        this.$message.warning('请先选择角色')
        return
      }

      // 获取所有选中的用户ID
      const checkedUserIds = this.tableData
        .filter(user => user.checked)
        .map(user => user.userId)

      this.saving = true

      const params = {
        roleId: this.currentRoleId,
        userIds: checkedUserIds
      }

      updateUserPermission(params)
        .then(() => {
          this.$message.success('权限设置保存成功')
        })
        .catch(() => {
          this.$message.error('权限设置保存失败')
        })
        .finally(() => {
          this.saving = false
        })
    },
    // 清空用户列表
    clearUsers() {
      this.currentRoleId = null
      this.tableData = []
      this.total = 0
      this.queryForm.pageIndex = 1
    },

    // 分页处理
    handleSizeChange(val) {
      this.queryForm.pageSize = val
      this.fetchUsers()
    },

    handleCurrentChange(val) {
      this.queryForm.pageIndex = val
      this.fetchUsers()
    },

    handleSelectionChange(val) {
      // 可以添加选中用户的处理逻辑
      console.log('selected users:', val)
    }
  },
  computed: {
    // your computed properties here
  },
  watch: {
    // your watch properties here
  },
  created() {
    // your code here
  },
  mounted() {
    // your code here
  }
}
</script>

<style lang="scss" scoped>
.UserPermAssignment {
  .Pagination {
    margin-top: 20px;
    text-align: center;
  }
}
</style>
