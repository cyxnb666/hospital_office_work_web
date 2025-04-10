<template>
  <div class="EmployeeManagement">
    <QueryTable :formDate="formDate" :queryList="queryList" :tableData="tableData" :tableColumn="tableColumn"
      @onSearch="onSearch" :handleSelectionChange="handleSelectionChange" label-width="90px" :tableSelection="true"
      v-loading="loading">
      <template v-slot:functionalArea>
        <el-button type="primary" size="small" @click="create">添加</el-button>
        <el-button type="primary" size="small" @click="edit" :disabled="tableSelected.length !== 1">修改</el-button>
        <el-button type="danger" size="small" @click="deleteFn" :disabled="tableSelected.length === 0">删除</el-button>
      </template>
      <template v-slot:operation>
        <el-table-column label="状态" width="80" align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.enableFlag" :active-value="'1'" :inactive-value="'0'" active-color="#13ce66"
              inactive-color="#ff4949" @change="handleStatusChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="handleResetPassword(scope.row)" :loading="scope.row.resetting">
              重置密码
            </el-button>
          </template>
        </el-table-column>
      </template>
    </QueryTable>
    <AddOrEdit ref="AddOrEdit" :rolesList="rolesList" :departmentsList="departmentsList" @refreshData="onSearch" />
  </div>
</template>

<script>
import QueryTable from '@/components/QueryTable/index.vue'
import AddOrEdit from '@/views/EmployeeManagement/components/addOrEdit.vue'
import { getUsersByPage, deleteUsers, updateUserStatus, getRoles, getDepartments, resetPassword } from './api'

export default {
  name: 'EmployeeManagement',
  components: {
    AddOrEdit,
    QueryTable
  },
  data () {
    return {
      formDate: {
        condition: {
          userName: '',
          phone: '',
          roleId: ''
        },
        current: 1,
        size: 10,
        total: 0
      },
      queryList: [
        {
          label: '医师姓名:',
          prop: 'userName',
          type: 'el-input',
          placeholder: '请输入医师姓名'
        },
        {
          label: '医师电话:',
          prop: 'phone',
          type: 'el-input',
          placeholder: '请输入医师电话'
        },
        {
          label: '岗位:',
          prop: 'roleId',
          type: 'el-select',
          placeholder: '请选择岗位',
          options: [] // 初始化
        }
      ],
      tableData: [],
      tableColumn: [
        {
          prop: 'userName',
          label: '医师姓名',
          align: 'center'
        },
        {
          prop: 'phone',
          label: '医师电话',
          align: 'center'
        },
        {
          prop: 'roleNames',
          label: '岗位',
          align: 'center'
        },
        {
          prop: 'deptName',
          label: '归属部门',
          align: 'center'
        },
        {
          prop: 'entryTime',
          label: '入职时间',
          align: 'center'
        }
      ],
      tableSelected: [],
      loading: false,
      rolesList: [], // 角色列表
      departmentsList: [] // 部门列表
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
      getUsersByPage(queryParams).then(res => {
        this.tableData = (res.items || []).map(item => ({
          ...item,
          roleNames: item.roles?.map(role => role.roleName).join('、') || ''
        }))
        this.formDate.total = res.totalSize || 0
      }).catch(() => { }).finally(() => {
        this.loading = false
      })
    },
    handleSelectionChange (arr) {
      this.tableSelected = arr
    },
    // 获取部门列表
    getDepartmentsList () {
      getDepartments().then(res => {
        this.departmentsList = this.formatDepartments(res)
      })
    },
    // 格式化部门数据，包含子部门的递归处理
    formatDepartments (departments) {
      return departments.map(dept => {
        const formatted = {
          value: dept.deptId,
          label: dept.deptName
        }
        if (dept.children && dept.children.length > 0) {
          formatted.children = this.formatDepartments(dept.children)
        }
        return formatted
      })
    },
    // 获取岗位列表
    getRolesList () {
      getRoles().then(res => {
        this.rolesList = res
        const postSelect = this.queryList.find(item => item.prop === 'roleId')
        if (postSelect) {
          postSelect.options = res.map(item => ({
            label: item.roleName,
            value: item.roleId
          }))
        }
      })
    },
    create () {
      this.$refs.AddOrEdit.initialization('add')
    },
    edit () {
      const data = this.tableSelected[0]
      this.$refs.AddOrEdit.initialization('edit', data)
    },
    deleteFn () {
      this.$confirm('此操作将删除该医师, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        const ids = this.tableSelected.map(item => item.userId)
        return deleteUsers(ids)
      }).then(() => {
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.onSearch()
      }).catch(() => { })
    },
    handleStatusChange (row) {
      updateUserStatus(row.userId).then(() => {
        this.$message({
          type: 'success',
          message: '状态更新成功'
        })
      }).catch(() => {
        // 如果失败了就回滚开关的状态
        row.enableFlag = row.enableFlag === '1' ? '0' : '1'
      })
    },
    handleResetPassword (row) {
      this.$confirm('确定要重置该用户的密码吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 添加loading状态
        this.$set(row, 'resetting', true)

        return resetPassword(row.userId)
      }).then(() => {
        this.$message({
          type: 'success',
          message: '密码重置成功'
        })
      }).catch((err) => {
        if (err === 'cancel') return
        this.$message({
          type: 'error',
          message: '密码重置失败'
        })
      }).finally(() => {
        // 移除loading状态
        this.$set(row, 'resetting', false)
      })
    }
  },
  created () {
    this.getDepartmentsList()
    this.getRolesList()
    this.onSearch()
  }
}
</script>

<style lang="scss" scoped>
.EmployeeManagement {
  width: 100%;
  height: 100%;
}
</style>
