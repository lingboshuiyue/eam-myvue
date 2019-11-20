<template>
  <div class="app-container">
    <div class="filter-container">
      <!--<el-select v-model="listQuery.depreciationWayId" placeholder="选择折旧方式" clearable class="filter-item" style="width: 200px">-->
      <!--<el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />-->
      <!--</el-select>-->
      <!--<el-button v-waves class="filter-item" type="primary"  @click="handleFilter">-->
      <!--确定-->
      <!--</el-button>-->
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
      <el-table-column label="审批流程编号" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="scope">
          <span>{{ scope.row.approvalApplyProcess.approvalApplyProcessId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当前审批结果" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ approvalResultOptions[scope.row.approvalApplyProcess.approvalResult] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审批时间" width="110px" align="center">
        <template v-if="scope.row.approvalApplyProcess.checkTime != null" slot-scope="scope">
          <span>{{ scope.row.approvalApplyProcess.checkTime | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请原因" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.apply.applyReason }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请结果" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.apply.applyResult }}</span>
        </template>
      </el-table-column>
      <el-table-column label="业务名称" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.approvalMain.approvalName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审批人角色" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.role.roleName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审批人姓名" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.approvalName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请人姓名" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.applyName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="110px" align="center">
        <template slot-scope="{row}">
          <el-button v-waves class="filter-item" type="primary" @click="handleUpdate(row)">
            审核
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" label-position="left" label-width="70px" style="width: 600px; margin-left:50px;high:600px">
        <el-form-item label="是否通过">
          <el-radio v-model="result" label="1" border>通过</el-radio>
          <el-radio v-model="result" label="2" border>不通过</el-radio>
        </el-form-item>
        <el-form-item label="原因">
          <el-input
            v-model="reason"
            type="textarea"
            :rows="2"
            placeholder="请输入内容"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="updateData()">
          提交
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import { apploval, apploval_list } from '@/api/financial-manage'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
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
      result: '1',
      reason: '',
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        importance: undefined,
        title: undefined
      },
      approvalApplyProcess: {
        applyId: '',
        approvalApplyProcessId: '',
        approvalReason: '',
        approvalResult: '',
        byWho: '',
        checkTime: '',
        checkWho: '',
        datetime: '',
        deleted: '',
        nextRoleId: '',
        stepId: ''
      },
      approvalResultOptions: ['待审批', '已审批', '不通过'],
      sortOptions: [{ label: '升序', key: '+id' }, { label: '降序', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        apply: ''
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
      console.log('mytype:' + this.result)
      this.listLoading = true
      apploval_list(this.listQuery).then(response => {
        console.log('into apploval method')
        this.list = response.data.list
        console.log('list:')
        console.log(this.list)
        this.total = response.data.total
        console.log(response.data)

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
      this.dialogFormVisible = true
      // this.mylist = Object.assign({},row)
      console.log('this.mylist' + Object.assign({}, row.approvalApplyProcess))
      this.approvalApplyProcess = Object.assign({}, row.approvalApplyProcess)
      // this.approvalApplyProcess.applyId = mylist.apply.applyId
      this.approvalApplyProcess.approvalReason = this.reason
      this.approvalApplyProcess.approvalResult = this.result
      console.log('approvalApplyProcess' + this.approvalApplyProcess)
      // console.log('===' + this.list + '===')
    },
    updateData() {
      console.log('===' + this.reason + '--' + this.result)
      this.approvalApplyProcess.approvalReason = this.reason
      this.approvalApplyProcess.approvalResult = this.result
      this.approvalApplyProcess.datetime = new Date()
      this.approvalApplyProcess.checkTime = new Date()
      apploval(this.approvalApplyProcess).then(response => {
        if (response.data !== null) {
          this.dialogFormVisible = false
          this.getList()
        }
        for (const v of this.list) {
          if (v.approvalApplyProcess.approvalApplyProcessId === this.approvalApplyProcess.approvalApplyProcessId) {
            console.log('测试是否成功')
            const index = this.list.indexOf(v)
            this.list.splice(index, 1)
            break
          }
        }
        this.$message({
          type: 'success',
          message: '审批成功!'
        })
      })
      setTimeout(() => {
        this.dialogFormVisible = false
      }, 0.5 * 1000)
    },
    handleDownload() {
      this.downloadLoading = true
      if (this.list != null) {
          import('@/vendor/Export2Excel').then(excel => {
            const tHeader = ['审批编号', '当前审批结果', '审批时间', '申请原因', '申请结果', '业务名称', '审批人角色', '审批人姓名', '申请人姓名']
            const filterVal = ['approvalApplyProcessId', 'approvalResult', 'checkTime', 'applyReason', 'applyResult', 'approvalName', 'roleName', 'approvalName2', 'applyName']
            const data = this.formatJson(filterVal, this.list)
            excel.export_json_to_excel({
              header: tHeader,
              data,
              filename: 'apploval_result-list' + parseTime(new Date())
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
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'checkTime') {
          if (v[j] != null) { return parseTime(v['approvalApplyProcess'].checkTime) }
          return ''
        } else if (j === 'approvalApplyProcessId') {
          return v['approvalApplyProcess'].approvalApplyProcessId
        } else if (j === 'approvalResult') {
          return this.approvalResultOptions[v['approvalApplyProcess'].approvalResult]
        } else if (j === 'applyReason') {
          return v['apply'].applyReason
        } else if (j === 'applyResult') {
          return v['apply'].applyResult
        } else if (j === 'approvalName') {
          return v['approvalMain'].approvalName
        } else if (j === 'roleName') {
          return v['role'].roleName
        } else if (j === 'approvalName2') {
          return v['approvalName']
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
