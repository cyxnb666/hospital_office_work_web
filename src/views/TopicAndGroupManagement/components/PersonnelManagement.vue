<template>
  <div class="PersonnelManagement">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane name="approved">
        <span slot="label">审核通过患者列表</span>
        <div class="tab-content">
          <ApprovedPatients ref="approvedPatients" :topicId="topicId" :topicInfo="topicInfo"
            @updateAllBadges="updateAllBadges" @detail-click="handleDetailClick" />
        </div>
      </el-tab-pane>

      <el-tab-pane name="survey">
        <span slot="label">
          <el-badge :value="badgeCounts.survey" :hidden="badgeCounts.survey === 0">
            调查问卷审核
          </el-badge>
        </span>
        <div class="tab-content">
          <SurveyAudit ref="surveyAudit" :topicId="topicId" @updateBadge="updateSurveyBadge"
            @updateAllBadges="updateAllBadges" @detail-click="handleDetailClick" />
        </div>
      </el-tab-pane>

      <el-tab-pane name="registration">
        <span slot="label">
          <el-badge :value="badgeCounts.registration" :hidden="badgeCounts.registration === 0">
            报名审核
          </el-badge>
        </span>
        <div class="tab-content">
          <RegistrationAudit ref="registrationAudit" :topicId="topicId" @updateBadge="updateRegistrationBadge"
            @updateAllBadges="updateAllBadges" @detail-click="handleDetailClick" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import ApprovedPatients from './PersonnelComponents/ApprovedPatients.vue'
import SurveyAudit from './PersonnelComponents/SurveyAudit.vue'
import RegistrationAudit from './PersonnelComponents/RegistrationAudit.vue'

export default {
  name: 'PersonnelManagement',
  components: {
    ApprovedPatients,
    SurveyAudit,
    RegistrationAudit
  },
  props: {
    topicId: {
      type: [String, Number],
      default: ''
    },
    topicInfo: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      activeTab: 'approved',
      badgeCounts: {
        survey: 0,      // 待审核调查问卷数量
        registration: 0 // 待审核报名数量
      }
    }
  },
  methods: {
    handleTabClick(tab) {
      console.log('切换到tab:', tab.name)
      // 主动触发对应tab的数据加载
      if (tab.name === 'approved') {
        this.$refs.approvedPatients && this.$refs.approvedPatients.loadData()
      } else if (tab.name === 'survey') {
        this.$refs.surveyAudit && this.$refs.surveyAudit.loadData()
      } else if (tab.name === 'registration') {
        this.$refs.registrationAudit && this.$refs.registrationAudit.loadData()
      }
    },

    // 处理详情点击事件，向上传递给父组件
    handleDetailClick(row) {
      this.$emit('detail-click', row)
    },

    updateAllBadges(extendData) {
      if (extendData) {
        this.badgeCounts.registration = extendData.applyAuditAmount || 0
        this.badgeCounts.survey = extendData.questionnaireAuditAmount || 0
      }
    },

    updateSurveyBadge(count) {
      this.badgeCounts.survey = count
    },

    updateRegistrationBadge(count) {
      this.badgeCounts.registration = count
    },

    // 初始化组件数据
    init() {
      // 清空badge数字，等待子组件加载完成后更新
      this.badgeCounts = {
        survey: 0,
        registration: 0
      }

      // 只加载当前激活tab的数据，避免重复调用
      this.loadCurrentTabData()
    },

    // 加载当前激活tab的数据
    loadCurrentTabData() {
      if (!this.topicId) return // 如果topicId无效，不加载数据

      if (this.activeTab === 'approved') {
        this.$refs.approvedPatients && this.$refs.approvedPatients.loadData()
      } else if (this.activeTab === 'survey') {
        this.$refs.surveyAudit && this.$refs.surveyAudit.loadData()
      } else if (this.activeTab === 'registration') {
        this.$refs.registrationAudit && this.$refs.registrationAudit.loadData()
      }
    },

    // 重置到第一个tab并加载数据
    resetToFirstTab() {
      this.activeTab = 'approved'
      // 清空badge数字
      this.badgeCounts = {
        survey: 0,
        registration: 0
      }
      this.$nextTick(() => {
        this.loadCurrentTabData()
      })
    }
  },
  watch: {
    topicId: {
      handler(newVal, oldVal) {
        // 只有当topicId真正变化且有效时才初始化
        if (newVal && newVal !== oldVal && String(newVal) !== 'undefined') {
          // 重置到第一个tab
          this.activeTab = 'approved'
          // 清空badge数字
          this.badgeCounts = {
            approved: 0,
            survey: 0,
            registration: 0
          }
          // 延迟初始化，确保组件状态已更新
          this.$nextTick(() => {
            this.loadCurrentTabData()
          })
        }
      },
      immediate: false
    }
  }
}
</script>

<style lang="scss" scoped>
.PersonnelManagement {
  height: 100%;

  .el-tabs {
    height: 100%;

    :deep(.el-tabs__content) {
      height: calc(100% - 55px);
      overflow: hidden;
    }

    :deep(.el-tab-pane) {
      height: 100%;
    }

    // Badge样式优化
    :deep(.el-tabs__item) {
      position: relative;
      padding: 6px 20px 0px 0px;

      .el-badge {
        position: relative;
        display: inline-block;

        .el-badge__content {
          position: absolute;
          top: -8px;
          right: -10px;
          transform: none;
          min-width: 16px;
          height: 16px;
          line-height: 16px;
          padding: 0 4px;
          border-radius: 8px;
          font-size: 12px;
          z-index: 10;
        }
      }
    }
  }

  .tab-content {
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
    overflow-y: auto;
  }
}
</style>