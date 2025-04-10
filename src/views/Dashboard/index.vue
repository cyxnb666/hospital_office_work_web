<template>
    <div class="dashboard">
        <el-row :gutter="20" class="card-row">
            <el-col :span="6" v-for="(card, index) in statCards" :key="index">
                <el-card shadow="hover" class="dashboard-card">
                    <div class="card-header">
                        <i :class="card.icon"></i>
                        <span>{{ card.title }}</span>
                    </div>
                    <div class="card-value">{{ card.value }}</div>
                </el-card>
            </el-col>
        </el-row>

        <el-row :gutter="20" class="card-row">
            <el-col :span="12">
                <el-card shadow="hover" class="chart-card">
                    <div slot="header">
                        <span>近期活动</span>
                    </div>
                    <div class="activity-list">
                        <div class="activity-item" v-for="(item, index) in activities" :key="index">
                            <div class="activity-time">{{ item.time }}</div>
                            <div class="activity-content">{{ item.content }}</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card shadow="hover" class="chart-card">
                    <div slot="header">
                        <span>通知公告</span>
                    </div>
                    <div class="notice-list">
                        <div class="notice-item" v-for="(item, index) in notices" :key="index">
                            <div class="notice-title">{{ item.title }}</div>
                            <div class="notice-content">{{ item.content }}</div>
                            <div class="notice-date">{{ item.date }}</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    name: 'Dashboard',
    data() {
        return {
            statCards: [
                { title: '用户总数', icon: 'el-icon-user', value: '1,234' },
                { title: '课题总数', icon: 'el-icon-collection', value: '56' },
                { title: '客户总数', icon: 'el-icon-s-custom', value: '789' },
                { title: '今日任务', icon: 'el-icon-date', value: '12' }
            ],
            activities: [
                { time: '2025-04-08', content: '完成课题方案提交' },
                { time: '2025-04-07', content: '员工培训计划更新' },
                { time: '2025-04-05', content: '客户回访工作完成' },
                { time: '2025-04-03', content: '系统维护更新' },
                { time: '2025-04-01', content: '新增客户资料录入' }
            ],
            notices: [
                {
                    title: '系统更新通知',
                    content: '系统将于2025年4月15日晚上22:00-次日凌晨2:00进行例行维护更新。',
                    date: '2025-04-10'
                },
                {
                    title: '新功能发布',
                    content: '排班管理模块新增自动排班功能，欢迎体验使用。',
                    date: '2025-04-08'
                },
                {
                    title: '操作指南更新',
                    content: '系统操作手册已更新，请前往帮助中心查看。',
                    date: '2025-04-05'
                }
            ]
        }
    }
}
</script>

<style lang="scss" scoped>
.dashboard {
    .card-row {
        margin-top: 20px;
    }

    .dashboard-card {
        height: 120px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .card-header {
            display: flex;
            align-items: center;
            font-size: 16px;

            i {
                margin-right: 8px;
                font-size: 20px;
                color: #409EFF;
            }
        }

        .card-value {
            font-size: 28px;
            font-weight: bold;
            color: #303133;
        }
    }

    .chart-card {
        height: 300px;

        .activity-list,
        .notice-list {
            height: 240px;
            overflow-y: auto;
        }

        .activity-item {
            padding: 10px 0;
            border-bottom: 1px solid #EBEEF5;

            &:last-child {
                border-bottom: none;
            }

            .activity-time {
                font-size: 14px;
                color: #909399;
                margin-bottom: 5px;
            }

            .activity-content {
                font-size: 14px;
            }
        }

        .notice-item {
            padding: 10px 0;
            border-bottom: 1px solid #EBEEF5;

            &:last-child {
                border-bottom: none;
            }

            .notice-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 5px;
            }

            .notice-content {
                font-size: 14px;
                color: #606266;
                margin-bottom: 5px;
            }

            .notice-date {
                font-size: 12px;
                color: #909399;
                text-align: right;
            }
        }
    }
}
</style>