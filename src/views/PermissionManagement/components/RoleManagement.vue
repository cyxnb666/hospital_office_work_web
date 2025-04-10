<template>
  <div class="RoleManagement">
    <div class="titleBox">
      <TitleLabel title="角色管理（岗位）" />
      <div class="titleBox-right">
        <el-button type="success" icon="el-icon-plus" size="mini" plain @click="create"></el-button>
        <el-button type="primary" icon="el-icon-edit" size="mini" plain @click="edit"></el-button>
        <el-button type="danger" icon="el-icon-delete" size="mini" plain @click="deleteFn"></el-button>
      </div>
    </div>
    <el-table :data="tableData" border style="cursor: pointer; width: 100%" height="calc(100% - 102px)" highlight-current-row
      @current-change="tableCurrentChange" v-loading="loading">
      <el-table-column prop="roleName" label="角色名称" align="center" />
      <el-table-column prop="description" label="说明" align="center" />
      <el-table-column label="启用状态" width="80" align="center">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.enableFlag" :active-value="'1'" :inactive-value="'0'" active-color="#13ce66"
            inactive-color="#ff4949" @change="handleStatusChange(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
    </el-table>
    <div class="Pagination">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryForm.current" :page-sizes="[10, 20, 30, 40]" :page-size="queryForm.size"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <el-dialog :title="title" :visible.sync="dialogVisible" :close-on-click-modal="false" width="500px"
      @close="handleClose">
      <el-form :model="submitForm" ref="submitForm" class="demo-form-inline" :rules="rules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="submitForm.roleName" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="说明" prop="description">
          <el-input v-model="submitForm.description" placeholder="请输入说明"></el-input>
        </el-form-item>
        <el-form-item label="启用状态" prop="enableFlag">
          <el-select v-model="submitForm.enableFlag" placeholder="请选择启用状态" style="width: 100%">
            <el-option v-for="item in stateList" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="onSubmit">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import TitleLabel from '@/components/TitleLabel/index.vue'
import { getRolesByPage, addRole, updateRole, deleteRole, updateRoleStatus } from '../api'

export default {
  name: 'RoleManagement',
  components: { TitleLabel },
  data() {
    return {
      loading: false,
      queryForm: {
        current: 1,
        size: 10,
      },
      total: 0,
      tableData: [],
      title: '',
      dialogVisible: false,
      submitForm: {
        roleName: '',
        description: '',
        enableFlag: '1',
        roleId: undefined
      },
      rules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          }
        ]
      },
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
      currentRow: null
    }
  },
  methods: {
    fetchRoleList() {
      this.loading = true
      const params = {
        pageIndex: this.queryForm.current,
        pageSize: this.queryForm.size
      }

      getRolesByPage(params).then(res => {
        console.log(res)
        this.tableData = res.items || []
        this.total = res.totalSize || 0
      }).catch(() => {}).finally(() => {
        this.loading = false
      })
    },
    tableCurrentChange(val) {
      this.currentRow = val
      this.$emit('tableCurrentChange', val)
    },
    handleClose() {
      this.submitForm = {
        description: '',
        enableFlag: '1',
        roleName: '',
        roleId: undefined
      }
      this.$nextTick(() => {
        this.$refs.submitForm.clearValidate()
      })
    },
    create() {
      this.title = '新增角色'
      this.handleClose()
      this.dialogVisible = true
    },
    edit() {
      if (!this.currentRow) {
        this.$message.warning('请选择要编辑的角色')
        return
      }
      this.submitForm = {
        description: this.currentRow.description || '',
        enableFlag: this.currentRow.enableFlag || '1',
        roleName: this.currentRow.roleName || '',
        roleId: this.currentRow.roleId
      }
      this.title = '编辑角色'
      this.dialogVisible = true
    },
    deleteFn() {
      if (!this.currentRow) {
        this.$message.warning('请选择要删除的角色')
        return
      }

      this.$confirm(`确定要删除角色"${this.currentRow.roleName}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        return deleteRole(this.currentRow.roleId)
      }).then(() => {
        this.$message.success('删除成功')
        this.currentRow = null
        this.fetchRoleList()
      }).catch(() => {})
    },
    handleStatusChange(row) {
      updateRoleStatus(row.roleId).then(() => {
        this.$message.success('状态更新成功')
      }).catch(() => {
        // 如果失败了就回滚开关的状态
        row.enableFlag = row.enableFlag === '1' ? '0' : '1'
        this.$message.error('状态更新失败')
      })
    },
    onSubmit() {
      this.$refs.submitForm.validate((valid) => {
        if (valid) {
          const isEdit = this.title === '编辑角色'

          const requestData = {
            description: this.submitForm.description,
            enableFlag: this.submitForm.enableFlag,
            roleName: this.submitForm.roleName
          }

          // 如果是编辑，添加roleId
          if (isEdit) {
            requestData.roleId = this.submitForm.roleId
          }

          // 发送请求
          const request = isEdit ? updateRole(requestData) : addRole(requestData)

          request.then(() => {
            this.$message.success(`${isEdit ? '编辑' : '新增'}成功`)
            this.dialogVisible = false
            this.fetchRoleList()
          }).catch(() => {})
        } else {
          return false
        }
      })
    },
    handleSizeChange(size) {
      this.queryForm.size = size
      this.fetchRoleList()
    },
    handleCurrentChange(current) {
      this.queryForm.current = current
      this.fetchRoleList()
    }
  },
  computed: {
    // your computed properties here
  },
  watch: {
    // your watch properties here
  },
  created() {
    this.fetchRoleList()
  },
  mounted() {
    // your code here
  }
}
</script>

<style lang="scss" scoped>
.RoleManagement {
  width: 100%;
  height: 100%;

  .titleBox {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .Pagination {
    margin-top: 20px;
    text-align: center;
  }
}
</style>
