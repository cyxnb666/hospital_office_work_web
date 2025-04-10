import Vue from 'vue'
import VueRouter from 'vue-router'
import MainView from '../views/Main/index.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login/index.vue')
  },
  {
    path: '/',
    name: 'Main',
    component: MainView,
    redirect: '/dashboard', // 默认重定向到仪表盘
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        meta: {
          title: '仪表盘',
          icon: 'el-icon-s-home',
          menuId: 0
        },
        component: () => import('../views/Dashboard/index.vue')
      },
    ]
  }
]

const router = new VueRouter({
  routes
})

// 简化路由跳转错误处理
const RouterPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(to) {
  return RouterPush.call(this, to).catch(err => err)
}

// 简化路由守卫，只保留基本的登录检查
router.beforeEach((to, from, next) => {
  // 登录页直接通过
  if (to.name === 'Login') {
    next();
    return;
  }
  
  // 简单检查token，无token则跳转登录页
  const token = sessionStorage.getItem('token');
  if (!token) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router