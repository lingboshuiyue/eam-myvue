<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.departmentName" placeholder="名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.departmentStatus" placeholder="部门状态" style="width: 140px" class="filter-item" clearable @change="handleFilter">
        <el-option v-for="item in departmentStatusOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加部门
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
      style="width: 75%;"
      @sort-change="sortChange"
    >
      <el-table-column label="编号" prop="id" sortable="custom" align="center" width="120" :class-name="getSortClass('id')">
        <template slot-scope="scope">
          <span>{{ scope.row.departmentId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.departmentName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="部门描述" width="220px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.departmentDescribe }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="220px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.datetime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="部门状态" width="220px" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.departmentStatus === true ? 'success' : 'danger'">
            {{ scope.row.departmentStatus === true ? '启用' : '未启用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template v-if="row.departmentStatus === false" slot-scope="{row}">
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" style="width: 70%; margin-left: 15%">
      <!--<el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="130px" style="width: 400px; margin-left:50px;">-->
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="130px" style="width: 400px; margin-left:50px;">
        <el-form-item v-if="temp.departmentId != null" label="编号" prop="type">
          <el-input v-model="temp.departmentId" readonly="true" />
        </el-form-item>
        <el-form-item label="部门名称" prop="departmentName">
          <el-input v-model="temp.departmentName" />
        </el-form-item>
        <el-form-item label="部门描述" prop="departmentDescribe">
          <el-input v-model="temp.departmentDescribe" />
        </el-form-item>
      </el-form>
      <!-- TODO -->
      <div v-if="temp.departmentStatus !== true" slot="footer" class="dialog-footer">
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
import { fetchDepartmentPage, updateDepartment, createDepartment, fetchDepartmentList } from '@/api/department'

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
        departmentStatus: undefined
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: '升序', key: 'asc' }, { label: '降序', key: 'desc' }],
      employeeStatusOptions: [{ label: '入职', key: true }, { label: '离职', key: false }],
      departmentStatusOptions: [{ label: '未启用', key: false }, { label: '启用', key: true }],
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
        department: { departmentId: '', departmentName: '', departmentStatus: false, departmentDescribe: '' },
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
        datetime: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '添加'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        departmentName: [{ required: true, message: '部门名称是必需的', trigger: 'blur' }],
        departmentDescribe: [{ required: true, message: '部门描述是必需的', trigger: 'blur' }],
        departmentStatus: [{ required: true, message: '部门状态是必需的', trigger: 'change' }]
        // timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        // title: [{ required: true, message: 'title is required', trigger: 'blur' }]
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
      fetchDepartmentPage(this.listQuery).then(response => {
        console.log('部门信息')
        console.log(this.personal_info)
        if (response.data != null) {
          this.list = response.data.list
          this.total = response.data.total
        } else {
          this.list = null
          this.total = 0
        }
        // this.departments = response.data.departments

        console.log('查看返回信息')
        console.log(response.data.list)

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      const hint = status === true ? '启用' : '禁用'
      this.$confirm('确定要' + hint + '？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        row.departmentStatus = status
        const tempData = Object.assign({}, row)
        updateDepartment(tempData).then(() => {
          for (const v of this.list) {
            if (v.departmentId === row.departmentId) {
              const index = this.list.indexOf(v)
              this.list.splice(index, 1, row)
              break
            }
          }
          if (status === true) {
            this.$message({
              type: 'success',
              message: hint + '成功!'
            })
          } else {
            this.$message({
              type: 'success',
              message: hint + '成功!'
            })
          }
        })
      }).catch(() => {
        if (status === true) {
          this.$message({
            type: 'info',
            message: hint + '失败'
          })
        } else {
          this.$message({
            type: 'info',
            message: hint + '失败'
          })
        }
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
        department: { departmentId: '', departmentName: '', departmentStatus: false, departmentDescribe: '' },
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
        datetime: ''
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
          this.temp.departmentStatus = false
          createDepartment(this.temp).then(response => {
            // this.temp.departmentId = response.data.departmentId
            this.temp = response.data
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
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        // this.$refs['dataForm'].clearValidate()
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      console.log('表单校验')
      console.log(this.$refs['dataForm'])
      // this.$refs['dataForm'].validate((valid) => {
      this.$refs['dataForm'].validate((valid) => {
      // this.$refs.dataForm.validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          console.log(tempData)
          // tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateDepartment(tempData).then(() => {
            for (const v of this.list) {
              if (v.departmentId === this.temp.departmentId) {
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
      fetchDepartmentList().then(response => {
        if (response.data != null) {
          import('@/vendor/Export2Excel').then(excel => {
            const tHeader = ['编号', '部门名称', '部门描述', '创建时间', '部门状态']
            const filterVal = ['departmentId', 'departmentName', 'departmentDescribe', 'datetime', 'departmentStatus']
            const data = this.formatJson(filterVal, this.list)
            excel.export_json_to_excel({
              header: tHeader,
              data,
              filename: 'department-list_' + parseTime(new Date())
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
        } else if (j === 'departmentStatus') {
          return v[j] === true ? '启用' : '禁用'
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
