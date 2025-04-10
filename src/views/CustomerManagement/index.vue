<template>
  <div class="CustomerManagement">
    <QueryTable :formDate="formDate" :queryList="queryList" :tableData="tableData" :tableColumn="tableColumn"
      @onSearch="onSearch" label-width="90px" v-loading="loading">
      <template v-slot:operation>
        <el-table-column label="操作" width="80" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="details(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </template>
    </QueryTable>
    <Details ref="Details" :type="1" :show-audit="false" :show-superintendent="true" />
  </div>
</template>

<script>
import QueryTable from '@/components/QueryTable/index.vue'
import Details from '@/views/CustomerManagement/components/Details.vue'
import { getCustomersByPage } from './api'

export default {
  name: 'CustomerManagement',
  components: {
    QueryTable,
    Details
  },
  data() {
    return {
      loading: false,
      formDate: {
        condition: {
          customerName: '',
          phone: ''
        },
        current: 1,
        size: 10,
        total: 0
      },
      queryList: [
        {
          label: '患者姓名:',
          prop: 'customerName',
          type: 'el-input'
        },
        {
          label: '患者电话:',
          prop: 'phone',
          type: 'el-input'
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
          label: '参与课题名称',
          align: 'center'
        },
        // {
        //   prop: 'superintendentName',
        //   label: '负责人',
        //   align: 'center'
        // },
        // {
        //   prop: 'reviewStatus',
        //   label: '审核状态',
        //   align: 'center',
        //   formatter: (row) => {
        //     const statusMap = {
        //       '0': '待审核',
        //       '1': '审核通过',
        //       '2': '审核不通过'
        //     }
        //     return statusMap[row.reviewStatus] || '-'
        //   }
        // },
        {
          prop: 'registTime',
          label: '注册时间',
          align: 'center'
        }
      ]
    }
  },
  methods: {
    // your methods here
    onSearch(params) {
      this.loading = true
      const queryParams = {
        condition: params?.condition || this.formDate.condition,
        pageIndex: params?.current || this.formDate.current,
        pageSize: params?.size || this.formDate.size
      }

      getCustomersByPage(queryParams).then(res => {
        this.tableData = res.items || []
        this.formDate.total = res.totalSize || 0
      }).catch(() => {
      }).finally(() => {
        this.loading = false
      })
    },
    details(row) {
      this.$refs.Details.initialization(row)
    }
  },
  computed: {
    // your computed properties here
  },
  watch: {
    // your watch properties here
  },
  created() {
    this.onSearch()
  },
  mounted() {
    // your code here
  }
}
</script>

<style lang="scss" scoped>
.CustomerManagement {
  width: 100%;
  height: 100%;
}
</style>
