<template>
  <div class="MenuView">
    <el-menu class="el-menu-vertical-demo" :collapse="isCollapse" :default-active="activeIndex" @select="handleSelect">
      <el-menu-item v-for="(item, index) in routerList" :key="index" :index="item.name">
        <i :class="item.meta.icon" />
        <template slot="title">
          <span class="metaTitle">{{ item.meta.title }}</span>
        </template>
      </el-menu-item>
    </el-menu>
    <div class="isCollapse" @click="setCollapse">
      <i :class="isCollapse ? 'el-icon-arrow-right' : 'el-icon-arrow-left'" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'MenuView',
  data() {
    return {
      activeIndex: 'Home',
      isCollapse: false,
      routerList: []
    }
  },
  methods: {
    handleSelect(key) {
      this.$router.push({ name: key })
    },
    setCollapse() {
      this.isCollapse = !this.isCollapse
      this.$emit('collapse', this.isCollapse)
    },
    getRouter() {
      // 从sessionStorage获取菜单列表
      const menuList = JSON.parse(sessionStorage.getItem('menuList') || '[]');

      // 获取路由配置
      const allRoutes = this.$router.options.routes.find(
        (item) => item.name === 'Main'
      )?.children || [];

      // 过滤出用户有权限的路由
      if (menuList.length && allRoutes.length) {
        // 使用menuId进行匹配
        this.routerList = allRoutes.filter(route =>
          menuList.some(menu => menu.menuId === route.meta?.menuId)
        );

        // 按照后端返回的ordinal排序
        this.routerList.sort((a, b) => {
          const aMenu = menuList.find(m => m.menuId === a.meta?.menuId);
          const bMenu = menuList.find(m => m.menuId === b.meta?.menuId);
          return (aMenu?.ordinal || 0) - (bMenu?.ordinal || 0);
        });
      } else {
        this.routerList = [];
      }
    }
  },
  computed: {
    // your computed properties here
  },
  watch: {
    $route(to) {
      this.activeIndex = to.name
    }
  },
  created() {
    this.getRouter()
    this.activeIndex = this.$route.name
  },
  mounted() {
    // your code here
  }
}
</script>

<style lang="scss" scoped>
.MenuView {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  background-color: #ffffff;

  .el-menu {
    width: 100%;
    height: calc(100% - 50px);
    overflow-x: hidden;
  }

  .isCollapse {
    width: 100%;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
}
</style>
