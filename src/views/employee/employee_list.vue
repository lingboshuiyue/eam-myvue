<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.employeeName" placeholder="名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.employeeStatus" placeholder="在职状态" style="width: 140px" class="filter-item" clearable @change="handleFilter">
        <el-option v-for="item in employeeStatusOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.departmentId" placeholder="所属部门" style="width: 140px" class="filter-item" clearable @change="handleFilter">
        <el-option v-for="item in departments" :key="item.departmentId" :label="item.departmentName" :value="item.departmentId" />
      </el-select>
      <el-select v-model="listQuery.roleId" placeholder="角色" style="width: 140px" class="filter-item" clearable @change="handleFilter">
        <el-option v-for="item in roles" :key="item.roleId" :label="item.roleName" :value="item.roleId" />
      </el-select>
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加员工
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
      <el-table-column label="编号" prop="eid" sortable="custom" align="center" width="120" :class-name="getSortClass('id')">
        <template slot-scope="scope">
          <span>{{ scope.row.eid }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="160px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.employeeName }}</span>
          <el-tag>{{ row.employeeNativePlace }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="性别" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.employeeSex === true ? '男' : '女' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属部门" width="110px" align="center">
        <template slot-scope="scope">
          <span v-for="item in departments">
            <!--<span v-if="item.departmentId === scope.row.department.departmentId">{{ item.departmentName }}</span>-->
            <span v-if="item.departmentId === scope.row.departmentId">{{ item.departmentName }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="邮箱" width="220px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.employeeEmail }}</span>
        </template>
      </el-table-column>
      <el-table-column label="入职日期" width="300px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.entrydate | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="在职状态" width="110px" align="center">
        <template slot-scope="scope">
          <!--<span>{{ scope.row.employeeStatus == '1' ? '入职' : '离职' }}</span>-->
          <span>{{ scope.row.employeeStatus === true ? '入职' : '离职' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色" width="110px" align="center">
        <template slot-scope="scope">
          <span v-for="item in roles">
            <!--<span v-if="item.roleId == scope.row.role.roleId">{{ item.roleName }}</span>-->
            <span v-if="item.roleId === scope.row.roleId">{{ item.roleName }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.employeeStatus === '0'" type="primary" size="mini" @click="handleModifyStatus(row, true)">
            复职
          </el-button>
          <el-button v-if="row.employeeStatus === '1'" size="mini" type="danger" @click="handleModifyStatus(row, false)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <!--<el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="130px" style="width: 400px; margin-left:50px;">-->
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="130px" style="width: 400px; margin-left:50px;">
        <el-form-item v-if="temp.eid" label="编号" prop="type">
          <el-input v-model="temp.eid" readonly="true" />
        </el-form-item>
        <el-form-item label="登录ID" prop="type" hidden="hidden">
          <el-input v-model="temp.login.loginId" />
        </el-form-item>
        <el-form-item label="账号" prop="type">
          <el-input v-model="temp.login.loginEmployeeId" />
        </el-form-item>
        <el-form-item label="密码" prop="type">
          <el-input v-model="temp.login.loginEmployeePassword" />
        </el-form-item>
        <el-form-item label="姓名" prop="type">
          <el-input v-model="temp.employeeName" />
        </el-form-item>
        <el-form-item label="性别" prop="type">
          <el-radio-group v-model="temp.employeeSex">
            <el-radio label="0" border>男</el-radio>
            <el-radio label="1" border>女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="所属部门" prop="type">
          <el-select v-model="temp.departmentId" class="filter-item" placeholder="Please select">
            <el-option v-for="item in departments" :key="item.departmentId" :label="item.departmentName" :value="item.departmentId" />
          </el-select>
        </el-form-item>
        <el-form-item label="电话" prop="type">
          <el-input v-model="temp.employeePhone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="type">
          <el-input v-model="temp.employeeEmail" />
        </el-form-item>
        <el-form-item label="在职状态" prop="type">
          <el-select v-model="temp.employeeStatus" class="filter-item" placeholder="Please select">
            <el-option v-for="item in employeeStatusOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="type">
          <el-select v-model="temp.roleId" class="filter-item" placeholder="Please select">
            <el-option v-for="item in roles" :key="item.roleId" :label="item.roleName" :value="item.roleId" />
          </el-select>
        </el-form-item>
        <el-form-item label="身份证号" prop="type">
          <el-input v-model="temp.employeeIdentify" />
        </el-form-item>
        <el-form-item label="学历" prop="type">
          <el-input v-model="temp.employeeEducation" />
        </el-form-item>
        <el-form-item label="籍贯" prop="type">
          <el-input v-model="temp.employeeNativePlace" />
        </el-form-item>
        <el-form-item label="婚姻状态" prop="type">
          <el-radio-group v-model="temp.employeeMaritalStatus">
            <el-radio label="0" border>未婚</el-radio>
            <el-radio label="1" border>已婚</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期" prop="type">
          <el-date-picker v-model="temp.birthdate" type="datetime" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="入职日期" prop="type">
          <el-date-picker v-model="temp.entrydate" type="datetime" placeholder="Please pick a date" />
        </el-form-item>
      </el-form>
      <!-- TODO -->
      <div v-if="1" slot="footer" class="dialog-footer">
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
import { fetchEmployeeList, fetchPv, createEmployee, updateEmployee, fetchRoleList, fetchEmployee,
  fetchEmployeeAll } from '@/api/employee'
import { fetchDepartmentList } from '@/api/department'

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
        roleId: undefined
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: '升序', key: 'asc' }, { label: '降序', key: 'desc' }],
      employeeStatusOptions: [{ label: '入职', key: true }, { label: '离职', key: false }],
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
        employeeSexTransfer: '',
        department: { departmentId: '', departmentName: '' },
        employeePhone: '',
        employeeStatus: '',
        employeeEmail: '',
        employeeIdentify: '',
        employeeEducation: '',
        employeeNativePlace: '',
        employeeMaritalStatus: '',
        employeeMaritalStatusTransfer: '',
        birthdate: '',
        entrydate: '',
        login: { loginEmployeeId: '', loginEmployeePassword: '' },
        role: { roleId: '', roleName: '' }
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑员工',
        create: '添加员工'
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
      fetchEmployeeList(this.listQuery).then(response => {
        console.log('个人信息')
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
      })
      fetchDepartmentList().then(response => {
        if (response.data != null) {
          this.departments = response.data
        } else { this.departments = null }
        console.log('测试部门信息')
        console.log(response.data)
      })
      fetchRoleList().then(response => {
        if (response.data != null) {
          this.roles = response.data
        } else {
          this.roles = null
        }
        console.log('测试角色信息')
        console.log(response.data)
      })
      setTimeout(() => {
        this.listLoading = false
      }, 0.5 * 1000)
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$confirm('确定要修改？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        row.employeeStatus = status
        const tempData = Object.assign({}, row)
        updateEmployee(tempData).then(() => {
          for (const v of this.list) {
            if (v.eid === row.eid) {
              const index = this.list.indexOf(v)
              this.list.splice(index, 1, row)
              break
            }
          }
          if (status === true) {
            this.$message({
              type: 'success',
              message: '复职成功!'
            })
          } else {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          }
        })
      }).catch(() => {
        if (status === '1') {
          this.$message({
            type: 'info',
            message: '复职失败'
          })
        } else {
          this.$message({
            type: 'info',
            message: '删除失败'
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
    changeSex(status) {
      console.log('测试状态值')
      console.log(status)
      this.temp.employeeSex = status
      // this.$set(this.temp, 'employeeSex', 1)
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
        employeeSexTransfer: '',
        department: { departmentId: '', departmentName: '' },
        employeePhone: '',
        employeeStatus: '',
        employeeEmail: '',
        employeeIdentify: '',
        employeeEducation: '',
        employeeNativePlace: '',
        employeeMaritalStatus: '',
        employeeMaritalStatusTransfer: '',
        birthdate: '',
        entrydate: '',
        login: { loginEmployeeId: '', loginEmployeePassword: '' },
        role: { roleId: '', roleName: '' }
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
          console.log('发送前测试')
          console.log(this.temp)
          this.temp.employeeSex = this.temp.employeeSex === '0'
          this.temp.employeeMaritalStatus = this.temp.employeeMaritalStatus === '1'
          // this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          // this.temp.author = 'vue-element-admin'
          createEmployee(this.temp).then(response => {
            this.temp.eid = response.data.eid
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
      fetchEmployee(row.eid).then(response => {
        this.temp = response.data
        this.temp.employeeSex = this.temp.employeeSex === true ? '0' : '1'
        this.temp.employeeMaritalStatus = this.temp.employeeMaritalStatus === true ? '1' : '0'
        this.temp.login.loginEmployeePassword = ''
        // this.temp.employeeSexTransfer = this.temp.employeeSex === true ? 2 : 3
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
          this.temp.employeeSex = this.temp.employeeSex === '0'
          this.temp.employeeMaritalStatus = this.temp.employeeMaritalStatus === '1'
          const tempData = Object.assign({}, this.temp)
          console.log(tempData)
          // tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateEmployee(tempData).then(() => {
            for (const v of this.list) {
              if (v.eid === this.temp.eid) {
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
      fetchEmployeeAll().then(response => {
        if (response.data != null) {
          const tempData = response.data
          console.log('测试数据。。。')
          console.log(tempData)
          import('@/vendor/Export2Excel').then(excel => {
            const tHeader = ['员工编号', '姓名', '性别', '部门名称', '手机号',
              '入职状态', '邮箱', '身份证', '教育程度',
              '籍贯', '婚姻状态', '出生日期', '入职日期', '角色名称', '登录账号']
            const filterVal = ['eid', 'employeeName', 'employeeSex', 'department', 'employeePhone',
              'employeeStatus', 'employeeEmail', 'employeeIdentify', 'employeeEducation',
              'employeeNativePlace', 'employeeMaritalStatus', 'birthdate', 'entrydate', 'role', 'loginEmployeeId']
            const data = this.formatJson(filterVal, tempData)
            excel.export_json_to_excel({
              header: tHeader,
              data,
              filename: 'employee-list_' + parseTime(new Date())
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
            message: '暂时没有数据，导出失败!'
          })
        }
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'birthdate' || j === 'entrydate') {
          return parseTime(v[j])
        } else if (j === 'department') {
          return v[j].departmentName
        } else if (j === 'employeeSex') {
          return v[j] === true ? '男' : '女生'
        } else if (j === 'employeeStatus') {
          return v[j] === true ? '在职' : '离职'
        } else if (j === 'employeeMaritalStatus') {
          return v[j] === true ? '已婚' : '未婚'
        } else if (j === 'role') {
          return v[j].roleName
        } else if (j === 'loginEmployeeId') {
          return v['login'].loginEmployeeId
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
