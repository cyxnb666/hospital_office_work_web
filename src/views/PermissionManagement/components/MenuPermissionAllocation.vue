<template>
  <div class="MenuPermissionAllocation" v-loading="loading">
    <div>
      <el-checkbox-group v-model="checkedMenuIds">
        <el-checkbox v-for="item in menuList" :key="item.menuId" :label="item.menuId"
          style="display: block; padding-top: 10px;">
          {{ item.menuName }}
        </el-checkbox>
      </el-checkbox-group>
    </div>
    <!-- 添加分隔线和保存按钮 -->
    <div class="permission-footer">
      <el-divider></el-divider>
      <el-button type="primary" size="small" :loading="saving" :disabled="!currentRoleId" @click="savePermissions">
        保存设置
      </el-button>
    </div>
  </div>
</template>

<script>
import { updateMenuPermission } from '../api'
export default {
  name: 'MenuPermissionAllocation',
  data() {
    return {
      loading: false,
      menuList: [],
      checkedMenuIds: [], // 选中的菜单ID数组
      currentRoleId: null,
      saving: false,
    }
  },
  methods: {
    updateMenuPermissions(data) {
      if (data) {
        // 更新菜单列表
        this.menuList = data

        // 更新选中状态
        this.checkedMenuIds = data
          .filter(item => item.checked)
          .map(item => item.menuId)
      } else {
        // 清空数据
        this.menuList = []
        this.checkedMenuIds = []
      }
    },
    setCurrentRoleId(roleId) {
      this.currentRoleId = roleId
    },
    savePermissions() {
      if (!this.currentRoleId) {
        this.$message.warning('请先选择角色')
        return
      }

      this.saving = true
      const params = {
        menuIds: this.checkedMenuIds,
        roleId: this.currentRoleId
      }

      updateMenuPermission(params)
        .then(() => {
          this.$message.success('权限设置保存成功')
        })
        .catch(() => {})
        .finally(() => {
          this.saving = false
        })
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
.MenuPermissionAllocation {
  // your styles here
}
</style>
