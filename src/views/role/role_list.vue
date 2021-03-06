<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.roleName" placeholder="名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.roleStatus" placeholder="角色状态" style="width: 140px" class="filter-item" clearable @change="handleFilter">
        <el-option v-for="item in roleStatusOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.limitedId" placeholder="权限级别" style="width: 140px" class="filter-item" clearable @change="handleFilter">
        <el-option v-for="item in limitedOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加角色
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
      style="width: 90%;"
      @sort-change="sortChange"
    >
      <el-table-column label="编号" prop="id" sortable="custom" align="center" width="120" :class-name="getSortClass('id')">
        <template slot-scope="scope">
          <span>{{ scope.row.roleId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.roleName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="部门状态" width="220px" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.roleStatus === true ? 'success' : 'danger'">
            {{ scope.row.roleStatus === true ? '启用' : '未启用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="权限级别" width="220px" align="center">
        <template slot-scope="scope">
          <span v-for="item in limitedOptions">
            <span v-if="scope.row.limitedId === item.key">{{ item.label }} </span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template v-if="row.roleStatus===false" slot-scope="{row}">
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
        <el-form-item v-if="temp.roleId != null" label="编号" prop="type">
          <el-input v-model="temp.roleId" readonly="true" />
        </el-form-item>
        <el-form-item label="角色名称" prop="type">
          <el-input v-model="temp.roleName" />
        </el-form-item>
        <!--<el-form-item label="角色状态" prop="type">-->
        <!--<el-select v-model="temp.roleStatus" class="filter-item" placeholder="Please select">-->
        <!--<el-option v-for="item in roleStatusOptions" :key="item.key" :label="item.label" :value="item.key" />-->
        <!--</el-select>-->
        <!--</el-form-item>-->
        <el-form-item label="角色描述" prop="type">
          <el-input v-model="temp.roleRemarks" />
        </el-form-item>
        <el-form-item label="权限级别" prop="type">
          <el-select v-model="temp.limitedId" class="filter-item" placeholder="Please select">
            <el-option v-for="item in limitedOptions" :key="item.key" :label="item.label" :value="item.key" />
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
import { fetchTypeList, fetchAssetsAttributeList, updateType, createType } from '@/api/type'
import { fetchRoles, updateRole, createRole, fetchRolesAll } from '@/api/role'

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
        attributeName: undefined,
        roleStatus: undefined,
        limitedId: undefined
      },
      roleStatusOptions: [{ label: '启用', key: true }, { label: '禁用', key: false }],
      limitedOptions: [{ label: '一级权限', key: 1 }, { label: '二级权限', key: 2 },
        { label: '三级权限', key: 3 }, { label: '四级权限', key: 4 }, { label: '管理员权限', key: 5 }],
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: '升序', key: 'asc' }, { label: '降序', key: 'desc' }],
      employeeStatusOptions: [{ label: '入职', key: true }, { label: '离职', key: false }],
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
        asseAttributes: [{ attributeName: '' }],
        limited: { limitedId: '', limitedType: '' }
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑角色',
        create: '添加角色'
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
      fetchRoles(this.listQuery).then(response => {
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
      // Just to simulate the time of the request
      setTimeout(() => {
        this.listLoading = false
      }, 1.5 * 1000)
    },
    addDomain() {
      this.temp.asseAttributes.push({
        attributeName: ''
      })
    },
    removeDomain(item) {
      var index = this.temp.asseAttributes.indexOf(item)
      if (index !== -1) {
        this.temp.asseAttributes.splice(index, 1)
      }
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
        row.roleStatus = status
        const tempData = Object.assign({}, row)
        updateRole(tempData).then(() => {
          for (const v of this.list) {
            if (v.roleId === row.roleId) {
              const index = this.list.indexOf(v)
              this.list.splice(index, 1, row)
              break
            }
          }
          this.$message({
            type: 'success',
            message: '启用成功!'
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
        asseAttributes: [{ attributeName: '' }],
        limited: { limitedId: '', limitedType: '' }
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
          this.temp.roleStatus = false
          createRole(this.temp).then(response => {
            this.temp.roleId = response.data.roleId
            console.log('返回数据')
            console.log(response.data)
            if (this.listQuery.page * this.listQuery.limit <= this.listQuery.total) { this.listQuery.page = this.listQuery.page + 1 }
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
      // fetchAssetsAttributeList(row.typeId).then(response => {
      //   this.temp.asseAttributes = response.data
      //   console.log('测试返回属性值')
      //   console.log(this.temp.asseAttributes)
      //
      // })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          console.log(tempData)
          // tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateRole(tempData).then(() => {
            for (const v of this.list) {
              if (v.roleId === this.temp.roleId) {
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
      fetchRolesAll().then(response => {
        if (response.data != null) {
          const tempData = response.data
          console.log('测试tempData')
          console.log(tempData)
            import('@/vendor/Export2Excel').then(excel => {
              const tHeader = ['角色ID', '角色名称', '角色状态', '角色备注', '权限ID',
                '权限类型', '权限备注']
              const filterVal = ['roleId', 'roleName', 'roleStatus', 'roleRemarks', 'limitedId',
                'limitedType', 'limitedRemarks']
              const data = this.formatJson(filterVal, tempData)
              excel.export_json_to_excel({
                header: tHeader,
                data,
                filename: 'role-list_' + parseTime(new Date())
              })
              this.downloadLoading = false
              this.$message({
                type: 'success',
                message: '导出成功!'
              })
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
        if (j === 'limitedId') {
          return v['limited'].limitedId
        } else if (j === 'limitedType') {
          return v['limited'].limitedType
        } else if (j === 'limitedRemarks') {
          return v['limited'].limitedRemarks
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
