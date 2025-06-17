<template>
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="1000px" :close-on-click-modal="false"
        @close="handleClose">
        <el-form :model="formData" ref="formRef" :rules="rules" label-width="100px">
            <el-form-item label="组名" prop="topicGroupName">
                <el-input v-model="formData.topicGroupName" placeholder="请输入组名"></el-input>
            </el-form-item>
            <el-form-item label="分组人数" prop="customerNumber">
                <el-input v-model.number="formData.customerNumber" placeholder="请输入分组人数">
                    <template slot="append">人</template>
                </el-input>
            </el-form-item>
            <el-form-item label="分组负责人" prop="groupLeader">
                <el-input v-model="formData.groupLeader" placeholder="请输入分组负责人"></el-input>
            </el-form-item>
            <el-form-item label="启用状态">
                <el-switch v-model="formData.enableFlag" active-value="1" inactive-value="0" active-color="#13ce66"
                    inactive-color="#ff4949">
                </el-switch>
            </el-form-item>
            <el-form-item label="实验次数" prop="testTimes">
                <el-input v-model.number="formData.testTimes" placeholder="请输入实验次数"></el-input>
            </el-form-item>
            <el-form-item label="服务时段" prop="servicePeriod">
                <el-date-picker v-model="formData.servicePeriod" type="daterange" range-separator="至"
                    start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd" style="width: 100%">
                </el-date-picker>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="loading">确 定</el-button>
        </div>
    </el-dialog>
</template>

<script>
import { addTopicGroup, updateTopicGroup, getTopicGroupList } from '../api'

export default {
    name: 'TopicGroupAddOrEdit',
    data() {
        return {
            dialogVisible: false,
            dialogTitle: '',
            loading: false,
            type: 'add', // add或edit
            formData: {
                topicGroupName: '',
                customerNumber: '',
                groupLeader: '',
                enableFlag: '1',
                testTimes: '',
                servicePeriod: [],
                // 编辑时需要的额外字段
                topicGroupId: '',
                topicId: ''
            },
            rules: {
                topicGroupName: [
                    { required: true, message: '请输入组名', trigger: 'blur' }
                ],
                customerNumber: [
                    { required: true, message: '请输入分组人数', trigger: 'blur' },
                    { type: 'number', message: '分组人数必须为数字' }
                ],
                groupLeader: [
                    { required: true, message: '请输入分组负责人', trigger: 'blur' }
                ],
                testTimes: [
                    { required: true, message: '请输入实验次数', trigger: 'blur' },
                    { type: 'number', message: '实验次数必须为数字' }
                ],
                servicePeriod: [
                    { required: true, message: '请选择服务时段', trigger: 'change' }
                ]
            }
        }
    },
    methods: {
        initialization(type, data) {
            this.type = type
            this.dialogTitle = type === 'add' ? '新增分组' : '修改分组'
            this.dialogVisible = true

            if (type === 'add') {
                this.resetForm()
            } else {
                // 编辑时设置回显数据
                const startDate = data.serviceTimeStart?.split(' ')[0]
                const endDate = data.serviceTimeEnd?.split(' ')[0]

                this.formData = {
                    topicGroupName: data.topicGroupName,
                    customerNumber: data.customerNumber,
                    groupLeader: data.groupLeader,
                    enableFlag: data.enableFlag,
                    testTimes: data.testTimes,
                    servicePeriod: [startDate, endDate],
                    // 保存编辑需要的字段
                    topicGroupId: data.topicGroupId,
                    topicId: this.$parent.topicCode
                }
            }
        },

        resetForm() {
            this.formData = {
                topicGroupName: '',
                customerNumber: '',
                groupLeader: '',
                enableFlag: '1',
                testTimes: '',
                servicePeriod: [],
                topicGroupId: '',
                topicId: ''
            }
        },

        handleClose() {
            this.dialogVisible = false
            this.resetForm()
            this.$nextTick(() => {
                this.$refs.formRef && this.$refs.formRef.clearValidate()
            })
        },

        refreshTopicGroupList() {
            const currentTopicId = this.$parent.topicCode
            if (currentTopicId) {
                this.$parent.topicGroupLoading = true
                getTopicGroupList(currentTopicId)
                    .then(res => {
                        this.$parent.topicGroupingTableData = res || []
                    })
                    .catch(() => {
                        this.$message.error('获取课题分组列表失败')
                    })
                    .finally(() => {
                        this.$parent.topicGroupLoading = false
                    })
            }
        },

        handleSubmit() {
            this.$refs.formRef.validate(valid => {
                if (valid) {
                    this.loading = true

                    // 构造基础提交数据
                    const submitData = {
                        topicGroupName: this.formData.topicGroupName,
                        customerNumber: this.formData.customerNumber,
                        groupLeader: this.formData.groupLeader,
                        enableFlag: this.formData.enableFlag,
                        testTimes: this.formData.testTimes,
                        serviceTimeStart: this.formData.servicePeriod[0] + ' 00:00:00',
                        serviceTimeEnd: this.formData.servicePeriod[1] + ' 23:59:59',
                        topicId: this.$parent.topicCode // 从父组件获取当前课题ID
                    }

                    // 如果是编辑模式, 添加必要的字段
                    if (this.type === 'edit') {
                        submitData.topicGroupId = this.formData.topicGroupId
                    }

                    // 根据类型选择不同的API
                    const request = this.type === 'add' ?
                        addTopicGroup(submitData) :
                        updateTopicGroup(submitData)

                    request
                        .then(() => {
                            this.$message.success(this.type === 'add' ? '添加成功' : '修改成功')
                            this.dialogVisible = false
                            // 直接调用刷新方法
                            this.refreshTopicGroupList()
                        })
                        .catch(() => {
                            this.$message.error(this.type === 'add' ? '添加失败' : '修改失败')
                        })
                        .finally(() => {
                            this.loading = false
                        })
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.el-input {
    width: 100%;
}
</style>