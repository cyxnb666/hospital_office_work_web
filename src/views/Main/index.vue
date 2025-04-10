<template>
  <el-container class="MainView">
    <el-header>
      <Header/>
    </el-header>
    <el-container>
      <el-aside :width="asideWidth">
        <MenuView @collapse="collapse"/>
      </el-aside>
      <el-main>
        <el-card class="box-card routerViewCard">
          <router-view/>
        </el-card>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import Header from './components/Header'
import MenuView from '@/views/Main/components/MenuView.vue'

export default {
  components: {
    MenuView,
    Header
  },
  name: 'MainView',
  data () {
    return {
      asideWidth: '200px'
    }
  },
  methods: {
    collapse (isCollapse) {
      if (isCollapse) {
        this.asideWidth = '65px'
      } else {
        this.asideWidth = '200px'
      }
    }
  },
  computed: {
    // your computed properties here
  },
  watch: {
    // your watch properties here
  },
  created () {
    // your code here
  },
  mounted () {
    // your code here
  }
}
</script>

<style lang="scss" scoped>
.MainView {
  width: 100%;
  height: 100%;
  overflow: hidden;

  .el-header {
    padding: 0;
  }

  .el-container {
    height: calc(100% - 60px);

    .el-aside {
      width: 100%;
      height: 100%;
    }

    .el-main, .el-card {
      overflow: hidden;
      width: 100%;
      height: 100%;

      .routerViewCard {
        width: 100%;
        height: 100%;

        :deep(.el-card__body) {
          box-sizing: border-box;
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}
</style>
