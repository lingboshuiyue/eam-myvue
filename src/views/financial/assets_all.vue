<template>
  <div class="app-container">
    <div class="filter-container">
      <el-date-picker
        v-model="value2"
        type="month"
        placeholder="选择月"
        @change="getTime()"
      />
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
      <el-table-column label="资产编号" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="scope">
          <span>{{ scope.row.assetsId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="资产sn号" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.assetsSn }}</span>
        </template>
      </el-table-column>
      <el-table-column label="资产名称" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.assetsName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="资产来源" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.assetsSource }}</span>
        </template>
      </el-table-column>
      <el-table-column label="购入时间" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.assetsTime | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="资产类别" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.type.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="资产状态" width="110px" align="center">
        <template slot-scope="scope"> <span v-if="scope.row.assetsStatus == 0">正常</span>
          <span v-if="scope.row.assetsStatus === 1">借出</span>
          <span v-if="scope.row.assetsStatus === 2">维修</span>
          <span v-if="scope.row.assetsStatus === 3">报废</span>
          <span v-if="scope.row.assetsStatus === 4">变卖</span>
        </template>
      </el-table-column>
      <el-table-column label="折旧方式" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ depreciationWayOptions[parseInt(scope.row.depreciationWayId / 10 - 1)] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.remarks }}</span>
        </template>
      </el-table-column>
      <el-table-column label="使用期限" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.serviceLife }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数量" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.count }}</span>
        </template>
      </el-table-column>
      <el-table-column label="易耗品" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.consumable === true ? '是' : '否' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="资产价值" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.assetsValue }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>

import { findAssetsByDate } from '@/api/financial-assets'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

// 日期格式转换
// eslint-disable-next-line no-extend-native
Date.prototype.format = function(fmt) {
  var o = {
    'M+': this.getMonth() + 1, // 月份
    'd+': this.getDate(), // 日
    'h+': this.getHours(), // 小时
    'm+': this.getMinutes(), // 分
    's+': this.getSeconds(), // 秒
    'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
    'S': this.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}

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
    }
  },
  data() {
    return {
      myassetsStatus: undefined,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id',
        assetsTime: undefined
      },
      assetsStatusList: ['正常', '已借出', '维修', '报废', '变卖', '审核中'],
      depreciationWayOptions: ['年限平均法', '双倍余额递减法', '年数总和'],
      value2: '',
      sortOptions: [{ label: '升序', key: '+id' }, { label: '降序', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      temp: [],
      dialogFormVisible: false,
      dialogStatus: '',
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
    // this.getList()
  },
  methods: {
    getList() {
      console.log('mydat:' + this.listQuery.assetsTime)
      this.listLoading = true
      findAssetsByDate(this.listQuery).then(response => {
        if (response.data != null) {
          this.list = response.data.list
          this.total = response.data.total
        } else {
          this.list = null
          this.total = 0
        }

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 1000)
      })
    },
    getTime() {
      this.listQuery.assetsTime = new Date(this.value2).format('yyyy-MM')
      console.log(this.listQuery.assetsTime)
      this.listLoading = true
      this.getList()
    },
    computed: {
      'myassetsStatus': function() {
        return this.list.assets.assetsStatus === 0 ? '正常'
          : (
            this.list.assets.assetsStatus === 1 ? '已借出'
              : (
                this.list.assets.assetsStatus === 2 ? '维修'
                  : (
                    this.list.assets.assetsStatus === 3 ? '报废'
                      : (
                        this.list.assets.assetsStatus === 4 ? '变卖' : '未知'
                      )
                  )
              )

          )
      }
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
    handleDownload() {
      this.downloadLoading = true
      if (this.list != null) {
        console.log('最终测试')
        console.log(this.list)
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['资产编号', '资产sn号', '资产名称', '资产来源', '购入时间', '资产类别', '折旧方式', '资产价值', '备注', '使用期限', '数量', '易耗品', '资产状态']
          const filterVal = ['assetsId', 'assetsSn', 'assetsName', 'assetsSource', 'assetsTime', 'assetsTypeId', 'depreciationWayId', 'assetsValue', 'remarks', 'serviceLife', 'count', 'consumable', 'assetsStatus']
          const data = this.formatJson(filterVal, this.list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: 'financial_assets-list' + parseTime(new Date())
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
        if (j === 'assetsTime') {
          return parseTime(v[j])
        } else if (j === 'consumable') {
          return v[j] === true ? '是' : '否'
        } else if (j === 'assetsStatus') {
          if (v['states'] === false) { return '审核中' } else { return this.assetsStatusList[v[j]] }
        } else if (j === 'assetsTypeId') {
          return v['type'].typeName
        } else if (j === 'depreciationWayId') {
          return this.depreciationWayOptions[ parseInt(v[j] / 10 - 1)]
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
