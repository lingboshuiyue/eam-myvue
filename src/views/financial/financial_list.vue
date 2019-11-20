<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.depreciationWayId" placeholder="选择折旧方式" clearable class="filter-item" style="width: 200px" @change="handleFilter">
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
      <el-table-column label="折旧编号" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="scope">
          <span>{{ scope.row.depreciation.depreciationId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="资产编号" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.assets.assetsId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="折旧方式" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.depreciationWay.depreciationWayName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="折旧日期" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.depreciation.depreciationTime | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="累计折旧" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.depreciation.accumulatedDepreciation }}</span>
        </template>
      </el-table-column>
      <el-table-column label="本期折旧" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.depreciation.currrentDepreciation }}</span>
        </template>
      </el-table-column>
      <el-table-column label="净残值率" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.depreciation.netSalvage }}</span>
        </template>
      </el-table-column>
      <el-table-column label="净值" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.depreciation.netValue }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>

import { findFinancial_statements, findAssetsById, commitSell, findAllFinancial, findAllFinancialAll } from '@/api/financial-manage'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: '11', display_name: '年限平均法' },
  { key: '22', display_name: '双倍余额递减法' },
  { key: '33', display_name: '年数总和法' }

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
      depreciationTime: undefined,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        importance: undefined,
        title: undefined,
        depreciationWayId: 0,
        sort: '+id',
        assets_id: ''
      },
      assets: {},
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
      console.log('mytype:' + this.listQuery.depreciationWayId)
      this.listLoading = true
      if (this.listQuery.depreciationWayId === 0 || this.listQuery.depreciationWayId === undefined) {
        findAllFinancial(this.listQuery).then(response => {
          console.log('into zhejiu method')
          this.list = response.data.list
          console.log('list:' + this.list)
          this.total = response.data.total
          console.log(response.data)
        })
      }
      if (this.listQuery.depreciationWayId !== 0 && this.listQuery.depreciationWayId !== undefined) {
        console.log('test findFinancial_statements....')
        findFinancial_statements(this.listQuery).then(response => {
          console.log('test findFinancial_statements....')
          this.list = response.data.list
          console.log(this.list)
          this.total = response.data.total
        })
      }
      // Just to simulate the time of the request
      setTimeout(() => {
        this.listLoading = false
        this.listQuery.depreciationWayId = undefined
      }, 0.5 * 1000)
    },
    handleFilter() {
      this.listQuery.page = 1
      console.log('this.this.listQuery.depreciationWayId = ' + this.listQuery.depreciationWayId)
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
      this.listQuery.assets_id = this.list.assets_id
      console.log('===' + this.listQuery + '===')
      findAssetsById(this.listQuery).then(response => {
        this.temp = response.data.items
        this.assets = response.data.assets
        console.log('temp:' + this.assets)
        this.d_total = response.data.total
      })
      this.dialogStatus = 'apply'
      this.dialogFormVisible = true
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
      findAllFinancialAll().then(response => {
        if (response.data != null) {
          const tempData = response.data
          import('@/vendor/Export2Excel').then(excel => {
            const tHeader = ['折旧编号', '资产编号', '折旧方式', '折旧日期', '累计折旧', '本期折旧', '净残值率', '净值']
            const filterVal = ['depreciationId', 'assetsId', 'depreciationWayId', 'depreciationTime', 'accumulatedDepreciation', 'currrentDepreciation', 'netSalvage', 'netValue']
            console.log('最终测试')
            console.log(tempData)
            const data = this.formatJson(filterVal, tempData)
            excel.export_json_to_excel({
              header: tHeader,
              data,
              filename: 'financial-list' + parseTime(new Date())
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
        if (j === 'depreciationTime') {
          return parseTime(v['depreciation'].depreciationTime)
        } else if (j === 'assetsId') {
          return v['assets'].assetsId
        } else if (j === 'depreciationId') {
          return v['depreciation'].depreciationId
        } else if (j === 'depreciationWayId') {
          return v['depreciationWay'].depreciationWayName
        } else if (j === 'depreciationTime') {
          return v['depreciationWay'].depreciationTime
        } else if (j === 'accumulatedDepreciation') {
          return v['depreciation'].accumulatedDepreciation
        } else if (j === 'currrentDepreciation') {
          return v['depreciation'].currrentDepreciation
        } else if (j === 'netSalvage') {
          return v['depreciation'].netSalvage
        } else if (j === 'netValue') {
          return v['depreciation'].netValue
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
