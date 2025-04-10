<template>
  <div class="Questionnaire">
    <QueryTable :formDate="formDate" :queryList="queryList" :tableData="tableData" :tableColumn="tableColumn"
                @onSearch="onSearch" :handleSelectionChange="handleSelectionChange" label-width="90px" ref="QueryTable"
                :tableSelection="true" v-loading="loading">
      <!-- <template v-slot:functionalArea>
        <el-button type="primary" size="small" @click="create">添加</el-button>
        <el-button type="danger" size="small" @click="deleteFn" :disabled="tableSelected.length === 0">删除</el-button>
      </template> -->
      <template v-slot:operation>
        <el-table-column label="状态" prop="enableFlag" width="80" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.enableFlag === '1'" type="warning">启用</el-tag>
            <el-tag v-if="scope.row.enableFlag === '0'" type="danger">停用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="details(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </template>
    </QueryTable>
    <QuestionnaireDetails ref="QuestionnaireDetails"/>
  </div>
</template>

<script>
import QueryTable from '@/components/QueryTable/index.vue'
import QuestionnaireDetails from '@/views/Questionnaire/components/QuestionnaireDetails.vue'
import { getQuestionnaireByPage, deleteQuestionnaire } from './api'

export default {
  name: 'Questionnaire',
  components: {
    QuestionnaireDetails,
    QueryTable
  },
  data () {
    return {
      formDate: {
        condition: {
          surveyName: '',
          surveyStartTime: '',
          surveyEndTime: '',
          enableFlag: '',
        },
        current: 1,
        size: 10,
        total: 0
      },
      queryList: [
        {
          label: '模板名称:',
          prop: 'surveyName',
          type: 'el-input'
        },
        {
          label: '开始时间:',
          prop: 'surveyStartTime',
          type: 'el-date-picker',
          dateType: 'date',
          valueFormat: 'yyyy-MM-dd 00:00:00',
          datePicker: {
            disabledDate: (time) => {
              const surveyEndTime = this.$refs.QueryTable.queryForm.condition.surveyEndTime
              if (surveyEndTime) { // 如果结束时间不为空，则小于结束时间
                return time.getTime() > new Date(surveyEndTime).getTime()
              }
            }
          }
        },
        {
          label: '失效时间:',
          prop: 'surveyEndTime',
          type: 'el-date-picker',
          dateType: 'date',
          valueFormat: 'yyyy-MM-dd 23:59:59',
          datePicker: {
            disabledDate: (time) => {
              const surveyStartTime = this.$refs.QueryTable.queryForm.condition.surveyStartTime
              if (surveyStartTime) { // 如果开始时间不为空，则大于开始时间
                return time.getTime() < new Date(surveyStartTime).getTime()
              }
            }
          }
        },
        {
          label: '状态:',
          prop: 'enableFlag',
          type: 'el-select',
          options: [
            {
              value: '1',
              label: '启用'
            },
            {
              value: '0',
              label: '停用'
            }
          ]
        },
      ],
      tableData: [],
      loading: false,
      tableColumn: [
        {
          prop: 'surveyName',
          label: '模板名称',
          align: 'center'
        },
        {
          prop: 'surveyStartTime',
          label: '开始时间',
          align: 'center'
        },
        {
          prop: 'surveyEndTime',
          label: '失效时间',
          align: 'center'
        },
        {
          prop: 'createBy',
          label: '创建人',
          align: 'center'
        }
      ],
      tableSelected: []
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

      getQuestionnaireByPage(queryParams)
        .then(res => {
          this.tableData = res.items || []
          this.formDate.total = res.totalSize || 0
        })
        .catch(() => {
          this.$message.error('获取问卷列表失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    details (row) {
      this.$refs.QuestionnaireDetails.initialization('edit', row)
    },
    edit (row) {
      console.log(row)
    },
    create () {
      this.$refs.QuestionnaireDetails.initialization('add')
    },
    deleteFn () {
      this.$confirm('此操作将删除选中的问卷, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleSelectionChange (arr) {
      this.tableSelected = arr
    },
  },
  computed: {
    // your computed properties here
  },
  watch: {
    // your watch properties here
  },
  created () {
    this.onSearch()
  },
  mounted () {
    // your code here
  }
}
</script>

<style lang="scss" scoped>
.Questionnaire {
  width: 100%;
  height: 100%;
}
</style>
