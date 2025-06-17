<template>
  <div class="TableView">
    <QueryTable :formDate="formDate" :queryList="queryList" :tableData="tableData" :tableColumn="tableColumn"
                @onSearch="onSearch" :handleSelectionChange="handleSelectionChange" label-width="110px" ref="QueryTable"
                :tableSelection="true"
                v-loading="loading">
      <template v-slot:tabs>
        <el-tabs v-model="activeName" type="card" @tab-click="selectTab">
          <el-tab-pane label="新增资讯" name="0"></el-tab-pane>
          <el-tab-pane label="资讯审核" name="1"></el-tab-pane>
        </el-tabs>
      </template>
      <template v-slot:functionalArea v-if="activeName === '0'">
        <el-button type="primary" size="small" @click="create">添加</el-button>
        <el-button type="danger" size="small" @click="deleteFn" :disabled="tableSelected.length === 0">删除</el-button>
      </template>
      <template v-slot:operation>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="seeFn(scope.row)">
              查看
            </el-button>
            <el-button v-if="scope.row.examineStatus === '2'" type="text" size="small" @click="editFn(scope.row)">
              编辑
            </el-button>
            <el-button v-if="scope.row.examineStatus === '1'" :disabled="scope.row.pushFlag === '1'" type="text" size="small" @click="handlePush(scope.row)">
              {{scope.row.pushFlag === '0' ? '推送' : '已推送'}}
            </el-button>
            <el-button v-if="scope.row.examineStatus === '0' && activeName === '1'" type="text" size="small"
                       @click="toExamine(scope.row)">
              审核
            </el-button>
          </template>
        </el-table-column>
      </template>
    </QueryTable>
    <Information ref="Information" @onSubmit="onSubmit" :topicsList="topicsList"/>
  </div>
</template>

<script>
import QueryTable from '@/components/QueryTable/index.vue'
import Information from './components/Information.vue'
import { getInfoPage, pushInfo, deleteInfo, getAllTopics } from './api'

export default {
  name: 'TableView',
  components: {
    QueryTable,
    Information
  },
  data () {
    return {
      loading: false,
      activeName: '0',
      formDate: {
        condition: {
          title: ''
        },
        current: 1,
        size: 10,
        total: 0
      },
      queryList: [
        {
          label: '资讯信息标题:',
          prop: 'title',
          type: 'el-input'
        }
      ],
      topicsList: [],
      tableData: [],
      tableColumn: [
        {
          prop: 'title',
          label: '资讯信息标题',
          align: 'center'
        },
        {
          prop: 'infoType',
          label: '资讯信息分类',
          align: 'center',
          formatter: (row) => {
            const statusMap = {
              1: '招募信息',
              2: '科普信息'
            }
            return statusMap[row.infoType] || '-'
          }
        },
        {
          prop: 'examineStatus',
          label: '审核状态',
          align: 'center',
          formatter: (row) => {
            const statusMap = {
              0: '审核中',
              1: '通过',
              2: '未通过'
            }
            return statusMap[row.examineStatus] || '-'
          }
        },
        {
          prop: 'releaseTime',
          label: '发布时间',
          align: 'center'
        }
      ],
      tableSelected: []
    }
  },
  methods: {
    onSearch (params) {
      this.loading = true
      if (params) {
        this.formDate.current = params.current
        this.formDate.size = params.size
      }
      const queryParams = {
        condition: params?.condition || this.formDate.condition,
        pageIndex: params?.current || this.formDate.current,
        pageSize: params?.size || this.formDate.size
      }
      queryParams.condition.type = this.activeName
      getInfoPage(queryParams)
        .then(res => {
          this.tableData = res.items || []
          this.formDate.total = res.totalSize || 0
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading = false
        })
    },
    selectTab () {
      this.formDate.condition.title = ''
      this.formDate.current = 1
      this.onSearch()
      this.$nextTick(() => {
        this.$refs.QueryTable.setTableHeight()
      })
    },
    seeFn (row) {
      this.$refs.Information.details(row)
    },
    editFn (row) {
      this.$refs.Information.edit(row)
    },
    toExamine (row) {
      this.$refs.Information.toExamine(row)
    },
    create () {
      this.$refs.Information.initialization()
    },
    handlePush (row) {
      this.$confirm('确定要推送该资讯吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return pushInfo(row.infoId)
      }).then(() => {
        this.$message.success('推送成功')
        this.onSearch() // 刷新列表数据
      }).catch(() => {
      })
    },
    deleteFn () {
      if (this.tableSelected.length === 0) {
        return
      }

      this.$confirm('此操作将删除选中资讯, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        const ids = this.tableSelected.map(item => item.infoId)
        return deleteInfo(ids)
      }).then(() => {
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.onSearch()
      }).catch(() => {
      })
    },
    handleSelectionChange (rows) {
      this.tableSelected = rows
    },
    onSubmit (submitForm) {
      this.tableData.push(submitForm)
    },
    fetchTopics () {
      getAllTopics()
        .then(res => {
          this.topicsList = res || []
        })
        .catch(() => {
        })
    }
  },
  computed: {
    // your computed properties here
  },
  watch: {
    // your watch properties here
  },
  created () {
    this.onSearch()
    this.fetchTopics()
  },
  mounted () {
    // your code here
  }
}
</script>

<style lang="scss" scoped>
.TableView {
  width: 100%;
  height: 100%;
}
</style>
