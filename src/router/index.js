import Vue from 'vue'
import VueRouter from 'vue-router'
import MainView from '../views/Main/index.vue'
import { Message } from "element-ui";

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
    redirect: '/login',
    children: [
      {
        path: '/topicAndGroupManagement',
        name: 'TopicAndGroupManagement',
        meta: {
          title: '课题管理',
          icon: 'el-icon-collection',
          menuId: 1
        },
        component: () => import('../views/TopicAndGroupManagement/index.vue')
      },
      {
        path: '/schedulingManagement',
        name: 'SchedulingManagement',
        meta: {
          title: '预约任务管理',
          icon: 'el-icon-date',
          menuId: 2
        },
        component: () => import('../views/SchedulingManagement/index.vue')
      },
      {
        path: '/customerManagement',
        name: 'CustomerManagement',
        meta: {
          title: '患者管理',
          icon: 'el-icon-s-custom',
          menuId: 3
        },
        component: () => import('../views/CustomerManagement/index.vue')
      },
      {
        path: '/employeeManagement',
        name: 'EmployeeManagement',
        meta: {
          title: '医师管理',
          icon: 'el-icon-user',
          menuId: 4
        },
        component: () => import('../views/EmployeeManagement/index.vue')
      },
      {
        path: '/questionnaire',
        name: 'Questionnaire',
        meta: {
          title: '调查问卷',
          icon: 'el-icon-tickets',
          menuId: 5
        },
        component: () => import('../views/Questionnaire/index.vue')
      },
      {
        path: '/informationManagement',
        name: 'InformationManagement',
        meta: {
          title: '资讯管理',
          icon: 'el-icon-s-grid',
          menuId: 6
        },
        component: () => import('../views/InformationManagement/index.vue')
      },
      {
        path: '/permissionManagement',
        name: 'PermissionManagement',
        meta: {
          title: '权限管理',
          icon: 'el-icon-s-operation',
          menuId: 7
        },
        component: () => import('../views/PermissionManagement/index.vue')
      }
    ]
  }
]
const router = new VueRouter({
  routes
})

const RouterPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(to) {
  return RouterPush.call(this, to).catch(err => err)
}

// router/index.js 中的路由守卫修改如下:

router.beforeEach((to, from, next) => {
  if (to.name === "main") {
    router.push({
      name: "Login",
    }).then(() => {
      sessionStorage.clear()
    });
    return;
  }

  const token = sessionStorage.getItem("token");
  
  // 如果是登录页面，直接通过
  if (to.name === "Login") {
    next();
    return;
  }
  
  if (!token) {
    Message.error({
      message: '请先登录',
      duration: 3000
    });
    next({ name: "Login" });
    return;
  }
  
  // 验证菜单权限
  const menuList = JSON.parse(sessionStorage.getItem('menuList') || '[]');
  const hasPermission = menuList.some(
    menu => menu.menuId === to.meta?.menuId
  );
  
  if (!hasPermission) {
    Message.error({
      message: '无访问权限',
      duration: 3000
    });
    next(false);
    return;
  }
  
  next();
});

export default router
