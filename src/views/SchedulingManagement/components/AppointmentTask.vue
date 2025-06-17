<template>
  <div class="AppointmentTask">
    <QueryTable :formDate="formDate" :queryList="queryList" :tableData="tableData" :tableColumn="tableColumn"
      @onSearch="onSearch" label-width="100px" ref="QueryTable" v-loading="loading">
      <template v-slot:functionalArea>
        <el-button type="primary" size="small" @click="handleAdd">新增</el-button>
      </template>
      <template v-slot:operation>
        <el-table-column label="操作" width="80" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="details(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </template>
    </QueryTable>
    <Details ref="Details" :type="1" :show-audit="false" :show-superintendent="true" />
    <AppointmentAdd ref="AppointmentAdd" @refresh="onSearch" />
  </div>
</template>

<script>
import QueryTable from '@/components/QueryTable/index.vue'
import Details from '@/views/CustomerManagement/components/Details.vue'
import AppointmentAdd from './AppointmentAdd.vue'
import { getAppointTaskList, getMyTopic } from '../api'

export default {
  name: 'AppointmentTask',
  components: { Details, QueryTable, AppointmentAdd },
  data() {
    return {
      topicOptions: [],
      loading: false,
      formDate: {
        condition: {
          customerName: '',
          phone: '',
          appointStatus: ''
        },
        current: 1,
        size: 10,
        total: 0
      },
      queryList: [
        {
          label: '患者姓名:',
          prop: 'customerName',
          type: 'el-input',
          placeholder: '请输入患者姓名'
        },
        {
          label: '患者电话:',
          prop: 'phone',
          type: 'el-input',
          placeholder: '请输入患者电话'
        },
        {
          label: '预约状态:',
          prop: 'appointStatus',
          type: 'el-select',
          placeholder: '请选择预约状态',
          options: [
            {
              label: '已预约',
              value: '1'
            },
            {
              label: '已完成',
              value: '2'
            }
          ]
        }
      ],
      tableData: [],
      tableColumn: [
        {
          prop: 'customerName',
          label: '患者姓名',
          align: 'center'
        },
        {
          prop: 'phone',
          label: '患者电话',
          align: 'center'
        },
        {
          prop: 'topicName',
          label: '预约课题',
          align: 'center'
        },
        {
          prop: 'topicTimePeriod',
          label: '课题时段',
          align: 'center'
        },
        // {
        //   prop: 'groupName',
        //   label: '分组(序号)',
        //   align: 'center'
        // },
        {
          prop: 'appointTime',
          label: '预约时间',
          align: 'center'
        },
        {
          prop: 'appointStatus',
          label: '预约任务状态',
          align: 'center',
          formatter: (row) => {
            const statusMap = {
              '0': '已取消',
              '1': '已预约',
              '2': '已完成'
            }
            return statusMap[row.appointStatus] || '-'
          }
        }
      ]
    }
  },
  methods: {
    onSearch(params) {
      this.loading = true
      const queryParams = {
        condition: params?.condition || this.formDate.condition,
        pageIndex: params?.current || this.formDate.current,
        pageSize: params?.size || this.formDate.size
      }

      getAppointTaskList(queryParams)
        .then(res => {
          this.tableData = res.items || []
          this.formDate.total = res.totalSize || 0
        })
        .catch(() => { })
        .finally(() => {
          this.loading = false
        })
    },
    details(row) {
      this.$refs.Details.initialization({
        customerId: row.customerId
      })
    },
    fetchTopicOptions() {
      getMyTopic()
        .then(res => {
          this.topicOptions = res || []
          console.log('获取到的课题数据:', res)
        })
        .catch(() => {
          this.$message.error('获取课题列表失败')
        })
    },
    handleAdd() {
      this.$refs.AppointmentAdd.open(this.topicOptions) // 传递课题数据
    },
    initialization() {
      this.$nextTick(() => {
        this.$refs.QueryTable.setTableHeight()
        this.onSearch()
      })
    }
  },
  created() {
    this.fetchTopicOptions()
    this.onSearch()
  }
}
</script>

<style lang="scss" scoped>
.AppointmentTask {
  width: 100%;
  height: 100%;
}
</style>