<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.applyType" placeholder="选择分类" clearable class="filter-item" style="width: 200px" @change="handleFilter">
        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" @click="handleFilter">
        确定
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
      <el-table-column label="申请编号" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="scope">
          <span>{{ scope.row.apply.applyId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="业务名称" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.approvalMain.approvalName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="员工姓名" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.employee.employeeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请结果" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.apply.applyResult }}</span>
        </template>
      </el-table-column>
      <el-table-column label="原因" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.apply.applyReason }}</span>
        </template>
      </el-table-column>
      <el-table-column label="显示" width="110px" align="center">
        <template slot-scope="{row}">
          <el-button v-waves class="filter-item" type="primary" @click="handleUpdate(row)">
            详情
          </el-button>
        </template>
      </el-table-column>

    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" label-position="left" label-width="70px" style="width: 600px; margin-left:50px;high:600px">
        <el-form-item label="申请编号">
          <el-input v-model="apply.applyId" readonly />
        </el-form-item>
        <el-form-item label="审批业务">
          <el-input v-model="approvalMain.approvalName" readonly />
        </el-form-item>
        <el-form-item label="申请人姓名">
          <el-input v-model="employee.employeeName" readonly />
        </el-form-item>
        <el-form-item label="申请结果">
          <el-input v-model="apply.applyResult " readonly />
        </el-form-item>
        <el-form-item label="原因">
          <el-input v-model="apply.applyReason" readonly />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-input v-model="apply.startTime" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" readonly />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-input v-model="apply.endTime" readonly />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogFormVisible = !dialogFormVisible">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import { applyResult_list, applyResult_sort, applyResult_all } from '@/api/apply-result'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: '1', display_name: '借用' },
  { key: '2', display_name: '归还' },
  { key: '3', display_name: '报修' },
  { key: '4', display_name: '报废' },
  { key: '5', display_name: '变卖' },
  { key: '6', display_name: '领用' }

]
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

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
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        importance: undefined,
        title: undefined,
        applyType: undefined,
        sort: '+id'
      },
      apply: {
        applyId: '',
        applyReason: '',
        applyResult: ''
      },
      approvalMain: {
        approvalName: ''
      },
      employee: {
        employeeName: ''
      },
      calendarTypeOptions,
      sortOptions: [{ label: '升序', key: '+id' }, { label: '降序', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      temp: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        apply: '变卖申请'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
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
      console.log(this.listQuery)
      console.log('mytype:' + this.listQuery.applyType)
      this.listLoading = true
      if (this.listQuery.applyType === 0 || this.listQuery.applyType === undefined) {
        applyResult_list(this.listQuery).then(response => {
          console.log('into 申请结果 method')
          this.list = response.data.list
          this.total = response.data.total
          console.log(response.data)
        })
      }
      if (this.listQuery.applyType !== 0 && this.listQuery.applyType !== undefined) {
        applyResult_sort(this.listQuery).then(response => {
          console.log('test applyResult_sort....')
          this.list = response.data.list
          console.log(this.list)
          this.total = response.data.total
        })
      }
      // Just to simulate the time of the request
      setTimeout(() => {
        this.listLoading = false
      }, 0.5 * 1000)
    },
    handleFilter() {
      this.listQuery.page = 1
      console.log('this.this.listQuery.depreciationWayId = ' + this.listQuery.applyType)
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
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
        type: ''
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
    handleUpdate(row) {
      this.listLoading = true
      this.dialogFormVisible = true
      this.apply = Object.assign({}, row.apply)
      this.approvalMain = Object.assign({}, row.approvalMain)
      this.employee = Object.assign({}, row.employee)
      setTimeout(() => {
        this.listLoading = false
      }, 0.5 * 1000)
    },
    updateData() {
      console.log('into updateData')
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          console.log('into updateData....')
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          commitSell(this.dataForm).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'commited Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDownload() {
      this.downloadLoading = true
      applyResult_all().then(response => {
        if (response.data != null) {
          const tempData = response.data
            import('@/vendor/Export2Excel').then(excel => {
              const tHeader = ['申请编号', '业务名称', '员工姓名', '申请结果', '原因', '开始时间', '结束时间']
              const filterVal = ['applyId', 'approvalName', 'employeeName', 'applyResult', 'applyReason', 'startTime', 'endTime']
              const data = this.formatJson(filterVal, tempData)
              excel.export_json_to_excel({
                header: tHeader,
                data,
                filename: 'apply_result-list' + parseTime(new Date())
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
        if (j === 'startTime') {
          return parseTime(v['apply'].startTime)
        } else if (j === 'endTime') {
          return parseTime(v['apply'].endTime)
        } else if (j === 'applyId') {
          return v['apply'].applyId
        } else if (j === 'approvalName') {
          return v['approvalMain'].approvalName
        } else if (j === 'employeeName') {
          return v['employee'].employeeName
        } else if (j === 'applyResult') {
          return v['apply'].applyResult
        } else if (j === 'applyReason') {
          return v['apply'].applyReason
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}`
        ? 'ascending'
        : sort === `-${key}`
          ? 'descending'
          : ''
    }
  }
}
</script>
