<template>
  <div class="loginIndex" @keydown.enter="onLogin">
    <div class="loginImg"></div>
    <div class="loginBox">
      <div class="loginContent">
        <div class="login">
          <el-card class="box-card">
            <div class="loginTitle">欢迎登录</div>
            <div class="loginTitle">管理系统</div>
            <el-form class="loginForm" label-position="top" :model="loginForm" ref="loginForm" :rules="rules">
              <el-form-item prop="phone">
                <el-input v-model="loginForm.phone" placeholder="请输入账号" prefix-icon="el-icon-user" clearable />
              </el-form-item>
              <el-form-item prop="password">
                <el-input v-model="loginForm.password" placeholder="请输入密码" type="password" show-password
                  prefix-icon="el-icon-lock" clearable />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="onLogin" style="width: 100%" :loading="loading">立即登录</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'loginIndex',
  data() {
    return {
      loginForm: {
        phone: '',
        password: ''
      },
      rules: {
        phone: [
          {
            required: true,
            message: '请输入账号'
          },
        ],
        password: [
          {
            required: true,
            message: '请输入密码'
          }
        ]
      },
      loading: false
    };
  },
  methods: {
    onLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;

          // 模拟登录过程，无需API调用
          setTimeout(() => {
            // 存储必要的模拟数据到sessionStorage
            sessionStorage.setItem('token', 'template-token');
            sessionStorage.setItem('userInfo', JSON.stringify({
              userId: 1,
              userName: 'Admin User'
            }));

            // 存储所有菜单项，不做权限过滤
            const allMenus = [
              { menuId: 0, ordinal: 0 },
              { menuId: 1, ordinal: 1 },
              { menuId: 2, ordinal: 2 },
              { menuId: 3, ordinal: 3 },
              { menuId: 4, ordinal: 4 },
              { menuId: 5, ordinal: 5 },
              { menuId: 6, ordinal: 6 },
              { menuId: 7, ordinal: 7 }
            ];
            sessionStorage.setItem('menuList', JSON.stringify(allMenus));

            // 模拟OSS配置
            sessionStorage.setItem('ossConfig', JSON.stringify({
              bucketName: 'template-bucket',
              endpoint: 'oss-template.example.com',
              catalogue: 'uploads/'
            }));

            // 跳转到仪表盘页面
            this.$router.push({ name: 'Dashboard' });
            this.$message.success('登录成功');
            this.loading = false;
          }, 800);
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.loginIndex {
  width: 100%;
  height: 100%;
  display: flex;

  .loginImg {
    width: 41%;
    height: 100%;
    // 可以添加自定义背景图
    background-color: #f0f2f5;
  }

  .loginBox {
    width: 59%;
    height: 100%;
    padding: 20px 80px;
    box-sizing: border-box;

    .loginContent {
      width: 100%;
      height: calc(100% - 70px);
      display: flex;
      justify-content: center;
      align-items: center;

      .login {
        .box-card {
          width: 400px;

          .loginTitle {
            font-size: 20px;
            font-weight: bold;
          }

          .loginForm {
            margin-top: 20px;
          }
        }
      }
    }
  }
}

:deep(.el-input__inner) {
  box-shadow: 0 0 0 1000px #fff inset;
}
</style>