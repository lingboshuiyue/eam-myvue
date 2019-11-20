<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.approvalName" placeholder="名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.byWho" placeholder="创建者" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-date-picker v-model="listQuery.datetime" type="datetime" clearable class="filter-item" placeholder="创建时间" @change="handleFilter" />
      <el-select v-model="listQuery.applyType" placeholder="申请类型" style="width: 140px" class="filter-item" clearable @change="handleFilter">
        <el-option v-for="item in applyTypeOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.deleted" placeholder="审批状态" style="width: 140px" class="filter-item" clearable @change="handleFilter">
        <el-option v-for="item in deletedOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加审批规定
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出报表
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="编号" prop="id" sortable="custom" align="center" width="120" :class-name="getSortClass('id')">
        <template slot-scope="scope">
          <span>{{ scope.row.approvalMainId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.approvalName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请类型" width="220px" align="center">
        <template slot-scope="scope">
          <span>{{ applyTypeList[scope.row.applyType-1] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审批步数" width="220px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.stepCnt }}</span>
        </template>
      </el-table-column>
      <el-table-column label="规定者" width="220px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.employee.employeeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.datetime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审批状态" width="220px" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.deleted === true ? 'success' : 'danger'">
            {{ scope.row.deleted === true ? '启用' : '未启用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template v-if="row.deleted===false" slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button type="primary" size="mini" @click="handleModifyStatus(row, true)">
            启用
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <!--<el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="130px" style="width: 400px; margin-left:50px;">-->
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="130px" style="width: 400px; margin-left:50px;">
        <el-form-item v-if="temp.approvalMainId != null" label="编号" prop="type">
          <el-input v-model="temp.approvalMainId" readonly="true" />
        </el-form-item>
        <el-form-item label="名称" prop="type">
          <el-input v-model="temp.approvalName" />
        </el-form-item>
        <el-form-item label="申请类型" prop="type">
          <el-select v-model="temp.applyType" class="filter-item" placeholder="Please select">
            <el-option v-for="item in applyTypeOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item prop="type">
          <span style="font-size: 20px;font-weight: bold;"> 审批流程 </span>
        </el-form-item>
        <span v-for="item in temp.approvalStepDetails" v-if="temp.approvalStepDetails != null" prop="type">
          <el-form-item label="步骤名称">
            <el-input v-model="item.stepName" />
          </el-form-item>
          <el-form-item label="审批角色">
            <el-select v-model="item.roleId" class="filter-item" placeholder="Please select">
              <el-option v-for="item1 in roles" :key="item1.roleId" :label="item1.roleName" :value="item1.roleId" />
            </el-select>
            <el-button v-if="temp.approvalMainId == null" @click.prevent="removeDomain(item)">删除</el-button>
          </el-form-item>
          <el-form-item v-if="temp.approvalMainId == null">
            <el-button @click="addDomain">新增步骤</el-button>
          </el-form-item>
        </span>
        <el-form-item label="审批状态" prop="type">
          <el-select v-model="temp.deleted" class="filter-item" placeholder="Please select">
            <el-option v-for="item in deletedOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
      </el-form>
      <!-- TODO -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchEmployeeList, fetchPv, createEmployee, updateEmployee, fetchRoleList } from '@/api/employee'
import { fetchDepartmentPage, updateDepartment, createDepartment } from '@/api/department'
import { fetchApprovalMainList, createApprovalMain, updateApprovalMain, fetchApprovalMainOne, fetchApprovalMainAll } from '@/api/approval_main'

import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})
import { mapGetters } from 'vuex'
export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  computed: {
    ...mapGetters([
      'personal_info'
    ])
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      departments: null,
      roles: null,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: 'asc',
        employeeStatus: undefined,
        departmentId: undefined,
        employeeName: undefined,
        roleId: undefined,
        departmentStatus: undefined,
        approvalName: undefined,
        applyType: undefined,
        byWho: undefined,
        datetime: undefined,
        datetimeTransfer: undefined,
        deleted: undefined
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: '升序', key: 'asc' }, { label: '降序', key: 'desc' }],
      applyTypeOptions: [{ label: '借用', key: 1 }, { label: '归还', key: 2 }, { label: '报修', key: 3 },
        { label: '报废', key: 4 }, { label: '变卖', key: 5 }, { label: '领用', key: 6 }],
      applyTypeList: ['借用', '归还', '报修', '报废', '变卖', '领用'],
      employeeStatusOptions: [{ label: '入职', key: true }, { label: '离职', key: false }],
      deletedOptions: [{ label: '启用', key: true }, { label: '未启用', key: false }],
      departmentStatusOptions: [{ label: '正常', key: false }, { label: '失效', key: true }],
      employeeMaritalOptions: [{ label: '未婚', key: false }, { label: '已婚', key: true }],
      statusOptions: ['published', 'draft', 'deleted'],
      departmentOptions: '',
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published',
        eid: '',
        employeeName: '',
        employeeSex: '',
        department: { departmentId: '', departmentName: '', departmentStatus: '', departmentDescribe: '' },
        employeePhone: '',
        employeeStatus: '',
        employeeEmail: '',
        employeeIdentify: '',
        employeeEducation: '',
        employeeNativePlace: '',
        employeeMaritalStatus: '',
        birthdate: '',
        entrydate: '',
        login: { loginEmployeeId: '', loginEmployeePassword: '' },
        role: { roleId: '', roleName: '' },
        approvalMainId: undefined,
        approvalName: '',
        applyType: '',
        stepCnt: '',
        datetime: '',
        byWho: '',
        deleted: false,
        employee: { employeeName: '' },
        approvalStepDetails: [{ stepName: '', roleId: '' }]
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'blur' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      console.log('显示')
      console.log(this.listQuery)
      if (this.listQuery.datetime != null) { this.listQuery.datetimeTransfer = parseTime(this.listQuery.datetime, '{y}{m}{d}') } else { this.listQuery.datetimeTransfer = null }
      fetchApprovalMainList(this.listQuery).then(response => {
        if (response.data != null) {
          this.list = response.data.list
          this.total = response.data.total
        } else {
          this.list = null
          this.total = 0
        }
        console.log('查看返回信息')
        console.log(response.data.list)
      })
      fetchRoleList().then(response => {
        if (response.data != null) { this.roles = response.data } else { this.roles = null }
        console.log('测试角色信息')
        console.log(response.data)
      })
      // Just to simulate the time of the request
      setTimeout(() => {
        this.listLoading = false
      }, 0.5 * 1000)
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$confirm('确定要启用？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        row.deleted = status
        const tempData = Object.assign({}, row)
        updateApprovalMain(tempData).then(() => {
          for (const v of this.list) {
            if (v.approvalMainId === row.approvalMainId) {
              const index = this.list.indexOf(v)
              this.list.splice(index, 1, row)
              break
            }
          }
          this.$message({
            type: 'success',
            message: '启用成功'
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '启用失败'
        })
      })
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = 'asc'
      } else {
        this.listQuery.sort = 'desc'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: '',
        eid: '',
        employeeName: '',
        employeeSex: '',
        department: { departmentId: '', departmentName: '', departmentStatus: '', departmentDescribe: '' },
        employeePhone: '',
        employeeStatus: '',
        employeeEmail: '',
        employeeIdentify: '',
        employeeEducation: '',
        employeeNativePlace: '',
        employeeMaritalStatus: '',
        birthdate: '',
        entrydate: '',
        login: { loginEmployeeId: '', loginEmployeePassword: '' },
        role: { roleId: '', roleName: '' },
        approvalMainId: undefined,
        approvalName: '',
        applyType: '',
        stepCnt: '',
        datetime: '',
        byWho: '',
        deleted: false,
        employee: { employeeName: '' },
        approvalStepDetails: [{ stepName: '', roleId: '' }]
      }
    },
    addDomain() {
      this.temp.approvalStepDetails.push({
        stepName: '',
        roleId: ''
      })
    },
    removeDomain(item) {
      var index = this.temp.approvalStepDetails.indexOf(item)
      if (index !== -1 && this.temp.approvalStepDetails.length !== 1) {
        this.temp.approvalStepDetails.splice(index, 1)
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          // this.temp.author = 'vue-element-admin'
          this.temp.byWho = this.personal_info.eid
          createApprovalMain(this.temp).then(response => {
            this.temp.approvalMainId = response.data.approvalMainId
            this.temp.stepCnt = response.data.stepCnt
            this.temp.datetime = response.data.datetime
            this.temp.employee = response.data.employee
            if (this.listQuery.page * this.listQuery.limit <= this.total) { this.listQuery.page = this.listQuery.page + 1 }
            this.list.push(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功操作',
              message: '添加成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      fetchApprovalMainOne(row.approvalMainId).then(response => {
        this.temp = response.data
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      })
      // this.temp = Object.assign({}, row) // copy obj
      // this.temp.timestamp = new Date(this.temp.timestamp)
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          console.log(tempData)
          // tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateApprovalMain(tempData).then(() => {
            for (const v of this.list) {
              if (v.approvalMainId === this.temp.approvalMainId) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify({
              title: '成功操作',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.$notify({
        title: '成功操作',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      const index = this.list.indexOf(row)
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      fetchApprovalMainAll().then(response => {
        if (response.data != null) {
          const tempData = response.data
          import('@/vendor/Export2Excel').then(excel => {
            const tHeader = ['编号', '名称', '申请类型', '审批步数', '规定者',
              '创建时间', '审批状态']
            const filterVal = ['approvalMainId', 'approvalName', 'applyType', 'stepCnt', 'byWho', 'datetime',
              'deleted']
            const data = this.formatJson(filterVal, tempData)
            excel.export_json_to_excel({
              header: tHeader,
              data,
              filename: 'apploval-list_' + parseTime(new Date())
            })
            this.downloadLoading = false
          })
          this.$message({
            type: 'success',
            message: '导出成功!'
          })
        } else {
          this.$message({
            type: 'danger',
            message: '导出失败!'
          })
        }
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'datetime') {
          return parseTime(v[j])
        } else if (j === 'byWho') {
          return v['employee'].employeeName
        } else if (j === 'deleted') {
          return v[j] === true ? '启用' : '未启用'
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `asc`
        ? 'ascending'
        : sort === `desc`
          ? 'descending'
          : ''
    }
  }
}
</script>
