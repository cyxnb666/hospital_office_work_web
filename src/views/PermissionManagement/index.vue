<template>
  <div class="PermissionManagement">
    <el-row :gutter="20">
      <el-col :span="12">
        <RoleManagement ref="RoleManagement" @tableCurrentChange="handleRoleChange" />
      </el-col>
      <el-col :span="12">
        <el-collapse v-model="activeNames" @change="handleChange">
          <el-collapse-item name="1">
            <template slot="title">
              <TitleLabel title="菜单权限分配" />
            </template>
            <MenuPermissionAllocation ref="MenuPermissionAllocation" />
          </el-collapse-item>
          <el-collapse-item name="2">
            <template slot="title">
              <TitleLabel title="用户权限分配" />
            </template>
            <UserPermAssignment ref="UserPermAssignment" />
          </el-collapse-item>
        </el-collapse>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import UserPermAssignment from '@/views/PermissionManagement/components/UserPermAssignment.vue'
import MenuPermissionAllocation from '@/views/PermissionManagement/components/MenuPermissionAllocation.vue'
import RoleManagement from '@/views/PermissionManagement/components/RoleManagement.vue'
import TitleLabel from '@/components/TitleLabel/index.vue'

import { getMenuByRoleId } from './api'

export default {
  name: 'PermissionManagement',
  components: {
    TitleLabel,
    RoleManagement,
    MenuPermissionAllocation,
    UserPermAssignment
  },
  data() {
    return {
      activeNames: ['1', '2']
    }
  },
  methods: {
    handleChange(val) {
      console.log(val)
    },
    handleRoleChange(role) {
      if (role) {
        // 设置当前角色ID
        this.$refs.MenuPermissionAllocation.setCurrentRoleId(role.roleId)

        this.$refs.MenuPermissionAllocation.loading = true;

        // 获取菜单权限
        getMenuByRoleId(role.roleId).then(res => {
          this.$refs.MenuPermissionAllocation.updateMenuPermissions(res)
        }).catch(err => {}).finally(() => {
          this.$refs.MenuPermissionAllocation.loading = false;
        });

        // 该角色下的用户列表
        this.$refs.UserPermAssignment.loadUsersByRole(role.roleId)
      } else {
        // 清空数据和角色ID
        this.$refs.MenuPermissionAllocation.setCurrentRoleId(null)
        this.$refs.MenuPermissionAllocation.updateMenuPermissions(null)
        // 清空用户列表
        this.$refs.UserPermAssignment.clearUsers()
      }
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
.PermissionManagement {
  width: 100%;
  height: 100%;

  .el-row,
  .el-col {
    height: 100%;
  }

  // 添加右侧列的滚动条
  .el-col:last-child {
    overflow-y: auto;
    padding-right: 10px;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #dcdfe6;
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f5f7fa;
    }
  }

  ::v-deep .el-collapse {
    border-top: none;
    
    .el-collapse-item__header {
      padding-left: 10px;
    }
    
    .el-collapse-item__content {
      padding: 10px;
    }
  }
}
</style>
