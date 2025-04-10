<template>
  <div class="HeaderView">
    <div class="HeaderView-Title">高泓工作室管理系统</div>
    <div class="HeaderView-Right">
      <div class="HeaderView-Right-honorific">您好!</div>
      <el-dropdown @command="handleCommand">
        <span class="el-dropdown-link">
          {{ userName }}
          <i class="el-icon-caret-bottom el-icon--right"></i>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
            <el-dropdown-item command="exitTheSystem">退出系统</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <el-dialog title="修改密码" :visible.sync="dialogVisible" :close-on-click-modal="false" width="600px"
      @close="handleClose">
      <el-form :model="submitForm" ref="submitForm" :rules="rules" class="demo-form-inline">
        <el-form-item label="原密码" prop="password">
          <el-input v-model="submitForm.password" placeholder="原密码" show-password></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="submitForm.newPassword" placeholder="新密码" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="submitForm.confirmPassword" placeholder="确认密码" show-password></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onSubmit" :loading="loading" size="small">保 存</el-button>
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { loginOut, updatePassword } from '@/views/Login/api'
export default {
  name: 'HeaderView',
  data() {
    return {
      userName: '',
      dialogVisible: false,
      loading: false,
      submitForm: {
        password: '',
        newPassword: '',
        confirmPassword: ''
      },
      rules: {
        password: [
          { required: true, message: '请输入原密码' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码' },
          {
            pattern: /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,16}$/,
            message: '密码长度为8-16位，必须包含数字、字母、特殊字符'
          }
        ],
        confirmPassword: [
          { required: true, message: '请输入确认密码' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.submitForm.newPassword) {
                callback(new Error('两次输入的密码不一致'))
              } else {
                callback()
              }
            }
          }
        ]
      }
    }
  },
  methods: {
    handleClose() {
      this.submitForm = {
        password: '',
        newPassword: '',
        confirmPassword: ''
      }
      this.$nextTick(() => {
        this.$refs.submitForm.clearValidate()
      })
    },
    onSubmit() {
      this.$refs.submitForm.validate((valid) => {
        if (valid) {
          this.loading = true;

          const params = {
            oldPassword: this.submitForm.password,
            password: this.submitForm.newPassword,
            userId: JSON.parse(sessionStorage.getItem('userInfo')).userId
          }

          updatePassword(params)
            .then(() => {
              this.$message.success('密码修改成功，请重新登录');
              this.dialogVisible = false;
              // 修改成功后退出登录
              this.exitTheSystem('修改成功请重新登录');
            })
            .catch(() => {
              this.$message.error('密码修改失败');
            })
            .finally(() => {
              this.loading = false;
            });
        }
      });
    },
    handleCommand(command) {
      if (command === 'exitTheSystem') {
        this.exitTheSystem('退出登录成功')
      } else if (command === 'changePassword') {
        this.dialogVisible = true
      }
    },
    exitTheSystem(text) {
      loginOut().then(() => {
        this.$message.success(text)
        this.$router.push({ name: 'Login' })
        sessionStorage.clear()
      }).catch(() => { })
    }
  },
  computed: {
    // your computed properties here
  },
  watch: {
    // your watch properties here
  },
  created() {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    if (userInfo) {
      this.userName = userInfo.userName;
    }
  },
  mounted() {
    // your code here
  }
}
</script>

<style lang="scss" scoped>
.HeaderView {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  padding: 0 20px;
  box-sizing: border-box;

  &-Title {
    width: 180px;
    text-align: center;
    font-weight: bold;
    font-size: 18px;
  }

  &-Right {
    display: flex;

    &-honorific {
      margin-right: 10px;
    }

    .el-dropdown-link {
      cursor: pointer;
    }
  }
}
</style>
