<template>
  <div class="Scheduling">
    <el-row :gutter="20">
      <el-col :span="6">
        <div class="userQueryForm">
          <el-input class="userName" v-model="queryForm.condition" placeholder="请输入姓名" clearable/>
          <el-button type="primary" @click="onSearch">查询</el-button>
        </div>
        <el-table :data="tableData" border style="cursor: pointer; width: 100%" height="calc(100% - 100px)"
                  highlight-current-row @current-change="handleCurrentChange" v-loading="loading">
          <el-table-column prop="userName" label="姓名" align="center"/>
          <el-table-column prop="roleName" label="岗位" align="center"/>
        </el-table>
        <div class="pagination-container">
          <el-pagination @size-change="handleSizeChange" @current-change="handlePageChange"
                         :current-page="queryForm.pageIndex" :page-sizes="[10, 20, 30, 40]"
                         :page-size="queryForm.pageSize"
                         layout="total, sizes, prev, pager, next" :total="total">
          </el-pagination>
        </div>
      </el-col>
      <el-col :span="18">
        <div class="calendar">
          <el-calendar v-model="selectedMonth">
            <template slot="dateCell" slot-scope="{ data }">
              <p>{{ data.day.split('-').slice(1).join('-') }}</p>
              <div v-if="showSelect(data)">
                <!-- 排班管理模式 -->
                <template v-if="!type">
                  <!-- 有选中具体医生时显示编辑模式 -->
                  <div v-if="currentRow" style="height: calc(100% - 21px); display: flex; align-items: center">
                    <div class="selectUser">
                      <div class="morning">
                        <div class="label">AM:</div>
                        <el-select :value="getSchedulingUserId(data.day, 'AM')" size="mini"
                                   @change="handleDoctorSelectAM($event, data.day)" clearable placeholder="请选择">
                          <el-option v-for="doctor in doctorOptions" :key="doctor.userId" :label="doctor.userName"
                                     :value="doctor.userId">
                          </el-option>
                        </el-select>
                      </div>
                      <div class="afternoon">
                        <div class="label">PM:</div>
                        <el-select :value="getSchedulingUserId(data.day, 'PM')"  size="mini"
                                   @change="handleDoctorSelectPM($event, data.day)" clearable placeholder="请选择">
                          <el-option v-for="doctor in doctorOptions" :key="doctor.userId" :label="doctor.userName"
                                     :value="doctor.userId">
                          </el-option>
                        </el-select>
                      </div>
                    </div>
                  </div>
                  <!-- 总览模式 -->
                  <div v-else class="schedule-overview">
                    <div class="time-slot">
                      <span class="period" v-if="getDoctorsForPeriod(data.day, 'AM').length">AM:</span>
                      <el-tooltip placement="top" :disabled="!getDoctorsForPeriod(data.day, 'AM').length">
                        <div slot="content">
                          <div v-for="(doctor,index) in getDoctorsForPeriod(data.day, 'AM')" :key="index"
                               class="tooltip-item">
                            {{ doctor.userName }}
                          </div>
                        </div>
                        <span class="doctors-summary">
                          {{ generateSummary(getDoctorsForPeriod(data.day, 'AM')) }}
                        </span>
                      </el-tooltip>
                    </div>
                    <div class="time-slot">
                      <span class="period" v-if="getDoctorsForPeriod(data.day, 'PM').length">PM:</span>
                      <el-tooltip placement="top" :disabled="!getDoctorsForPeriod(data.day, 'PM').length">
                        <div slot="content">
                          <div v-for="(doctor,index) in getDoctorsForPeriod(data.day, 'PM')" :key="index"
                               class="tooltip-item">
                            {{ doctor.userName }}
                          </div>
                        </div>
                        <span class="doctors-summary">
                          {{ generateSummary(getDoctorsForPeriod(data.day, 'PM')) }}
                        </span>
                      </el-tooltip>
                    </div>
                  </div>
                </template>

                <!-- 预约排班管理模式 -->
                <div v-else-if="appointmentMap[data.day] !== undefined" class="alreadyBooked">
                  已预约{{ appointmentMap[data.day] }}人
                </div>
              </div>
            </template>
          </el-calendar>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import moment from 'moment'
import {
  getDoctorUsers,
  getUserScheduling,
  getAllDoctorUsers,
  addScheduling,
  getAppointmentCount
} from '../api'

export default {
  name: 'SchedulingView',
  props: {
    type: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      queryForm: {
        condition: '',
        pageIndex: 1,
        pageSize: 10
      },
      total: 0,
      tableData: [],
      currentRow: null,
      monthSelectList: [],
      selectedMonth: new Date(),
      userName: '',
      loading: false,
      schedulingData: [], // 存储获取到的排班数据
      doctorOptions: [],
      schedulingMap: {},
      morningDoctorId: null,
      afternoonDoctorId: null,
      appointmentData: [],
      appointmentMap: {},
      allSchedulingMap: {} // 存储所有医生的排班数据
    }
  },
  methods: {
    showSelect (data) {
      const day = data.day
      const isCurrentMonth = day.split('-')[1] === moment(this.selectedMonth).format('MM')
      return isCurrentMonth && (this.type === 0 ? true : true)
    },
    onSearch () {
      this.queryForm.pageIndex = 1
      this.fetchDoctorUsers()
    },
    handleSizeChange (val) {
      this.queryForm.pageSize = val
      this.fetchDoctorUsers()
    },
    handlePageChange (val) {
      this.queryForm.pageIndex = val
      this.fetchDoctorUsers()
    },
    handleCurrentChange (val) {
      if (!val) return

      this.currentRow = val
      // 根据类型调用不同的接口
      if (this.type === 1) {
        this.fetchAppointmentCount()
      } else {
        this.fetchUserScheduling()
      }
    },
    fetchAppointmentCount () {
      if (!this.currentRow) return

      const params = {
        userId: this.currentRow.userId,
        yearMonth: moment(this.selectedMonth).format('YYYY-MM')
      }

      getAppointmentCount(params)
        .then((res) => {
          // 重置appointmentMap
          this.appointmentMap = {}

          // 处理返回的数组数据
          if (Array.isArray(res)) {
            res.forEach(item => {
              this.$set(this.appointmentMap, item.appointDay, item.amount)
            })
          }
        })
        .catch()
    },
    fetchAllScheduling () {
      const params = {
        yearMonth: moment(this.selectedMonth).format('YYYY-MM')
      }

      getUserScheduling(params)
        .then(res => {
          // 处理返回的数据
          this.allSchedulingMap = {} // 重置数据
          res.forEach(schedule => {
            const day = schedule.schedulingDay || moment().format('YYYY-MM-DD')
            if (!this.allSchedulingMap[day]) {
              this.allSchedulingMap[day] = {
                AM: [],
                PM: []
              }
            }
            this.allSchedulingMap[day][schedule.timePeriod].push({
              userId: schedule.userId,
              userName: schedule.userName
            })
          })
        })
        .catch(err => {
          console.error('获取排班数据失败:', err)
        })
    },
    getDoctorsForPeriod (day, period) {
      return this.allSchedulingMap[day]?.[period] || []
    },

    // 新增: 生成显示摘要
    generateSummary (doctors) {
      if (!doctors.length) return ''
      if (doctors.length === 1) return doctors[0].userName
      return `${doctors[0].userName}等${doctors.length}人`
    },
    fetchUserScheduling () {
      if (!this.currentRow) return

      const params = {
        userId: this.currentRow.userId,
        yearMonth: moment(this.selectedMonth).format('YYYY-MM')
      }

      getUserScheduling(params)
        .then((res) => {
          this.schedulingData = res
          // 处理排班数据，转换为更易于使用的格式
          this.schedulingMap = {}
          res.forEach((schedule) => {
            if (!this.schedulingMap[schedule.schedulingDay]) {
              this.$set(this.schedulingMap, schedule.schedulingDay, {})
            }
            this.$set(
              this.schedulingMap[schedule.schedulingDay],
              schedule.timePeriod,
              {
                userId: schedule.userId,
                schedulingId: schedule.schedulingId
              }
            )
          })
        })
        .catch()
    },
    handleMonthChange (date) {
      const newMonth = moment(date).format('YYYY-MM')
      const currentMonth = moment(this.selectedMonth).format('YYYY-MM')

      if (newMonth !== currentMonth) {
        this.selectedMonth = date
        if (this.type === 1) {
          // 预约排班管理模式
          if (this.currentRow) {
            this.fetchAppointmentCount()
          }
        } else {
          // 排班管理模式
          if (this.currentRow) {
            // 选中具体医生时获取个人数据
            this.fetchUserScheduling()
          } else {
            // 总览模式获取所有数据
            this.fetchAllScheduling()
          }
        }
      }
    },
    fetchDoctorUsers () {
      this.loading = true
      getDoctorUsers(this.queryForm)
        .then((res) => {
          if (res) {
            this.tableData = res.items || []
            this.total = res.totalSize || 0
          }
        })
        .catch()
        .finally(() => {
          this.loading = false
        })
    },
    fetchSchedulingData () {
      const params = {
        userId: this.currentRow.userId,
        yearMonth: moment(this.selectedMonth).format('YYYY-MM')
      }

      getUserScheduling(params)
        .then((res) => {
          this.schedulingData = res || []
        })
        .catch()
    },

    // 获取所有医生列表
    fetchAllDoctors () {
      getAllDoctorUsers()
        .then((res) => {
          if (res) {
            this.doctorOptions = res
          }
        })
        .catch(() => {
        })
    },

    // 获取指定日期和时段的医生ID
    getSchedulingUserId (day, period) {
      if (
        this.schedulingMap[day] &&
          this.schedulingMap[day][period] &&
          this.schedulingMap[day][period].userId
      ) {
        return this.schedulingMap[day][period].userId
      }
      return null
    },

    // 处理AM时段医生选择
    handleDoctorSelectAM (value, day) {
      this.handleDoctorSelect(value, day, 'AM')
    },

    // 处理PM时段医生选择
    handleDoctorSelectPM (value, day) {
      this.handleDoctorSelect(value, day, 'PM')
    },

    handleDoctorSelect (userId, schedulingDay, timePeriod) {
      if (!this.schedulingMap[schedulingDay]) {
        this.$set(this.schedulingMap, schedulingDay, {})
      }
      const currentScheduling = this.schedulingMap[schedulingDay][timePeriod]

      const params = {
        schedulingDay,
        timePeriod,
        userId, // 直接使用传入的userId，清除时为null
        schedulingId: currentScheduling?.schedulingId || null
      }

      addScheduling(params)
        .then(() => {
          this.$message.success(userId === null ? '取消排班成功' : '排班安排成功')
          this.fetchUserScheduling()
        })
        .catch(() => {
          this.$message.error(userId === null ? '取消排班失败' : '排班安排失败')
          if (currentScheduling) {
            this.$set(this.schedulingMap[schedulingDay], timePeriod, currentScheduling)
          } else if (this.schedulingMap[schedulingDay]) {
            this.$delete(this.schedulingMap[schedulingDay], timePeriod)
          }
        })
    }
  },
  watch: {
    selectedMonth: {
      handler (newVal) {
        if (this.type === 1) {
          // 预约排班管理模式
          if (this.currentRow) {
            this.fetchAppointmentCount()
          }
        } else {
          // 排班管理模式
          if (this.currentRow) {
            this.fetchUserScheduling()
          } else {
            this.fetchAllScheduling()
          }
        }
      },
      immediate: true // 添加 immediate: true 确保首次加载时也能触发
    }
  },
  created () {
    this.fetchDoctorUsers()
    this.fetchAllDoctors()
    if (!this.type) {
      this.fetchAllScheduling() // 只在排班管理模式下初始加载总览数据
    }
  }
}
</script>

<style lang="scss" scoped>
.Scheduling {
  width: 100%;
  height: 100%;

  .el-row {
    width: 100%;
    height: 100%;

    .el-col {
      height: 100%;
      display: flex;
      flex-direction: column;

      .userQueryForm {
        display: flex;
        margin-bottom: 20px;
        flex-shrink: 0; // 防止查询表单被压缩

        .userName {
          margin-right: 20px;
        }
      }

      .calendar {
        width: 100%;
        height: 100%;
        min-height: 0; // 允许内容收缩
        display: flex;
        flex-direction: column;

        .el-calendar {
          width: 100%;
          height: 100%;
          min-height: 0; // 允许内容收缩
          overflow: hidden; // hidden因为要分别控制header和body的滚动
          display: flex;
          flex-direction: column;

          ::v-deep {

            // 固定头部
            .el-calendar__header {
              position: sticky;
              top: 0;
              z-index: 1;
              background: #fff; // 确保背景色遮住下面的内容
              border-bottom: 1px solid #EBEEF5; // 添加底部边框增加区分度
              flex-shrink: 0; // 防止头部被压缩
            }

            .el-calendar__body {
              height: auto;
              flex: 1;
              overflow: auto; // 只让内容区域滚动

              .el-calendar-table {
                width: 100%;

                td {
                  min-height: 100px;
                }
              }
            }
          }
        }
      }
    }
  }
}

::v-deep .el-calendar-day {
  width: 100%;
  height: 100%;
}

.selectUser {

  .afternoon,
  .morning {
    display: flex;
    align-items: center;
    margin: 10px 0;

    .label {
      font-size: 10px;
      font-weight: bold;
    }
  }
}

.schedule-overview {
  padding-top: 10px;
  height: calc(100% - 21px);

  .time-slot {
    margin-bottom: 8px;
    display: flex;
    align-items: center;

    &:last-child {
      margin-bottom: 0;
    }

    .period {
      font-size: 12px;
      font-weight: bold;
      min-width: 30px;
    }

    .doctors-summary {
      color: #606266;
      cursor: pointer;

      &:hover {
        color: #409EFF;
      }
    }
  }
}

.alreadyBooked {
  width: 100%;
  height: calc(100% - 21px);
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
}

::v-deep .el-tooltip {
  font-size: 12px;
}

.pagination-container {
  text-align: right;
  margin-top: 10px;
}
::v-deep .el-calendar__body{
  padding: 0;
}
</style>
