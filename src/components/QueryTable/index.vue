<template>
  <div class="QueryTable">
    <div class="queryForm">
      <slot name="tabs"/>
      <el-form :inline="true" :model="queryForm" ref="queryForm" class="demo-form-inline" :label-width="labelWidth"
               :size="size">
        <el-form-item v-for="(item, index) in queryList" :key="index" :prop="'condition.' + item.prop"
                      :rules="item.rules" :label="item.label">
          <el-input v-if="item.type === 'el-input'" v-model="queryForm.condition[item.prop]"
                    :placeholder="item.placeholder" clearable/>
          <el-date-picker v-else-if="item.type === 'el-date-picker'" v-model="queryForm.condition[item.prop]"
                          :placeholder="item.placeholder" :type="item.dateType" :value-format="item.valueFormat" clearable :picker-options="item.datePicker"/>
          <el-select v-else-if="item.type === 'el-select'" v-model="queryForm.condition[item.prop]"
                     :placeholder="item.placeholder" :multiple="item.multiple" :collapse-tags="item.collapseTags"
                     clearable>
            <el-option v-for="(item, index) in item.options" :key="index" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch(true)">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="functionalArea">
        <slot name="functionalArea"/>
      </div>
    </div>
    <div class="tableBox">
      <el-table :data="tableData" border style="width: 100%" :height="tableHeight"
                @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" v-if="tableSelection" align="center"/>
        <el-table-column v-for="(item,index) in tableColumn" :key="index" :label="item.label" :prop="item.prop"
                         :width="item.width" :align="item.align" :formatter="item.formatter"/>
        <slot name="operation"/>
      </el-table>
    </div>
    <div class="Pagination">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="queryForm.current" :page-sizes="[10, 20, 30, 40]"
                     :page-size="queryForm.size" layout="total, sizes, prev, pager, next, jumper"
                     :total="formDate.total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QueryTable',
  props: {
    queryList: {
      type: Array,
      default: () => []
    },
    tableData: {
      type: Array,
      default: () => []
    },
    tableColumn: {
      type: Array,
      default: () => []
    },
    formDate: {
      type: Object,
      default: () => {
      }
    },
    tableSelection: {
      type: Boolean,
      default: false
    },
    labelWidth: {
      type: String,
      default: '80px'
    },
    size: {
      type: String,
      default: 'small '
    },
    handleSelectionChange: {
      type: Function,
      default: () => {
      }
    }
  },
  data () {
    return {
      queryForm: {
        condition: {},
        current: 1,
        size: 10,
        total: 0
      },
      tableHeight: 200
    }
  },
  methods: {
    initForm () {
      this.queryForm = Object.assign({}, this.formDate)
    },
    onSearch (type) {
      if (type) this.queryForm.current = 1
      this.$emit('onSearch', this.queryForm)
    },
    resetForm () {
      this.$refs.queryForm.resetFields()
    },
    handleSizeChange (val) {
      this.queryForm.size = val
      this.$emit('onSearch', this.queryForm)
    },
    handleCurrentChange (val) {
      this.queryForm.current = val
      this.$emit('onSearch', this.queryForm)
    },
    setTableHeight () {
      const totalHeight = document.querySelector('.QueryTable')?.clientHeight
      const queryHeight = document.querySelector('.queryForm')?.clientHeight
      const paginationHeight = document.querySelector('.Pagination')?.clientHeight
      this.tableHeight = totalHeight - queryHeight - paginationHeight - 40
      window.onresize = () => {
        this.setTableHeight()
      }
    }
  },
  computed: {},
  watch: {},
  created () {
    this.initForm()
  },
  mounted () {
    this.$nextTick(() => {
      this.setTableHeight()
    })
  }
}
</script>

<style lang="scss" scoped>
.QueryTable {
  height: 100%;

  .tableBox {
    margin: 20px 0;
  }

  .Pagination {
    text-align: right;
  }
}
</style>
