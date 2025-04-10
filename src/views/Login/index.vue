<template>
  <div class="loginIndex" @keydown.enter="onLogin">
    <div class="loginImg"></div>
    <div class="loginBox">
      <!--      <div class="loginLogo">-->
      <!--        <img class="loginLogoImg" src="../../assets/images/loginLogo.png" alt=""></img>-->
      <!--      </div>-->
      <div class="loginContent">
        <div class="login">
          <el-card class="box-card">
            <div class="loginTitle">欢迎登录</div>
            <div class="loginTitle">高泓工作室管理系统</div>
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
import { login, getUserInfo } from "./api";
import { getAccessInfo } from '@/utils/aliOSS';

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
    hasIntersection(roles, arr) {
      return roles.filter(item => arr.includes(item)).length > 0;
    },
    getRouter(roles) {
      const arr = this.$router.options.routes.filter((item) => {
        return item.name === "main";
      })[0].children;
      if (arr?.length) {
        return arr.filter(item => this.hasIntersection(roles, item.rolePermissions));
      }
    },
    onLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          let tokenValue = '';
          let userMenus = [];

          login(this.loginForm)
            .then(loginRes => {
              tokenValue = loginRes.token;
              sessionStorage.setItem('token', tokenValue);
              return getAccessInfo();
            })
            .then(ossRes => {
              sessionStorage.setItem('ossConfig', JSON.stringify(ossRes));
              return getUserInfo(tokenValue);
            })
            .then(userInfo => {
              sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
              // 保存菜单列表
              userMenus = userInfo.menuList || [];
              sessionStorage.setItem('menuList', JSON.stringify(userMenus));

              // 获取用户有权限的第一个菜单作为首页
              const firstMenu = this.getFirstAvailableRoute(userMenus);
              if (firstMenu) {
                this.$router.push({ name: firstMenu });
              } else {
                throw new Error('用户没有可用的菜单权限');
              }

              this.$message.success('登录成功');
            })
            .catch(error => {
              console.error('登录失败:', error);
              this.$message.error(error.message || '登录失败');
            })
            .finally(() => {
              this.loading = false;
            });
        }
      });
    },

    // 根据ordinal获取第一个可用路由
    getFirstAvailableRoute(menuList) {
      if (!menuList || menuList.length === 0) return null;

      // 根据 ordinal 排序菜单
      const sortedMenus = [...menuList].sort((a, b) => a.ordinal - b.ordinal);

      // 获取路由配置
      const routes = this.$router.options.routes.find(
        route => route.name === 'Main'
      )?.children || [];

      // 获取第一个有权限的路由name
      const firstMenu = sortedMenus[0];
      const matchedRoute = routes.find(route => route.meta?.menuId === firstMenu.menuId);

      return matchedRoute?.name;
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
    background-image: url("../../assets/images/loginBG.png");
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
  }

  .loginBox {
    width: 59%;
    height: 100%;
    padding: 20px 80px;
    box-sizing: border-box;

    .loginLogo {
      width: 100%;

      .loginLogoImg {
        width: 100px;
        height: 30px;
      }
    }

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
