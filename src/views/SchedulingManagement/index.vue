<template>
  <div class="SchedulingManagement">
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
      <!-- <el-tab-pane label="排班管理" name="1">
        <SchedulingView v-if="activeName === '1'" ref="SchedulingView" :type="0"/>
      </el-tab-pane>
      <el-tab-pane label="预约排班管理" name="2">
        <SchedulingView v-if="activeName === '2'" ref="SchedulingView" :type="1"/>
      </el-tab-pane> -->
      <el-tab-pane label="预约任务管理" name="3">
        <AppointmentTask v-if="activeName === '3'" ref="AppointmentTask"/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import SchedulingView from '@/views/SchedulingManagement/components/Scheduling.vue'
import AppointmentTask from '@/views/SchedulingManagement/components/AppointmentTask.vue'

export default {
  name: 'SchedulingManagement',
  components: { AppointmentTask, SchedulingView },
  data () {
    return {
      activeName: '3'
    }
  },
  methods: {
    handleClick () {
      if (this.activeName === '3' && this.$refs.AppointmentTask) {
        this.$nextTick(() => {
          if (this.$refs.AppointmentTask) {
            this.$refs.AppointmentTask.initialization()
          }
        })
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
.SchedulingManagement,.el-tabs {
  width: 100%;
  height: 100%;
}
::v-deep .el-tabs__content{
  height: calc(100% - 56px);
  .el-tab-pane{
    width: 100%;
    height: 100%;
  }
}
</style>
