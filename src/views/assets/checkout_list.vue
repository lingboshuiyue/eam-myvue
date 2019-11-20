<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.assetsName" placeholder="资产名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.employeeName" placeholder="员工名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-date-picker v-model="listQuery.checkoutTime" type="datetime" clearable class="filter-item" placeholder="出入库日期" @change="handleFilter" />
      <el-select v-model="listQuery.assetsTypeId" placeholder="类型" clearable class="filter-item" style="width: 130px" @change="handleFilter">
        <el-option v-for="item in assetsTypes" :key="item.typeId" :label="item.typeName" :value="item.typeId" />
      </el-select>
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
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
      <el-table-column label="编号" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template v-if="scope.row.assets != null" slot-scope="scope">
          <span>{{ scope.row.checkout }}</span>
        </template>
      </el-table-column>
      <el-table-column label="资产编号" width="110px" align="center">
        <template v-if="scope.row.assets != null" slot-scope="scope">
          <span>{{ scope.row.assets.assetsId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="150px">
        <template v-if="scope.row.assets != null" slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row.assets)">{{ scope.row.assets.assetsName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类别" width="110px" align="center">
        <template slot-scope="scope">
          <span v-for="item in assetsTypes" v-if="scope.row.assets != null">
            <span v-if="item.typeId === scope.row.assets.assetsTypeId">{{ item.typeName }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="变动日期" width="150px" align="center">
        <template v-if="scope.row.assets != null" slot-scope="scope">
          <span>{{ scope.row.checkoutTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="变动方式">
        <template v-if="scope.row.assets != null" slot-scope="scope">
          <span>{{ applyStatusList[scope.row.checkoutWay-1] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数量">
        <template v-if="scope.row.assets != null" slot-scope="scope">
          <span>{{ scope.row.checkCount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请人">
        <template v-if="scope.row.assets != null" slot-scope="scope">
          <span>{{ scope.row.applicant.employeeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审批人">
        <template v-if="scope.row.assets != null" slot-scope="scope">
          <span>{{ scope.row.approver.employeeName }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" style="width: 70%; margin-left: 15%">
      <!--<el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="130px" style="width: 400px; margin-left:50px;">-->
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="130px" style="width: 400px; margin-left:50px;">
        <el-form-item label="资产编号" prop="title">
          <el-input v-model="temp.assetsId" readonly="true" />
        </el-form-item>
        <el-form-item label="名称" prop="type">
          <el-input v-model="temp.assetsName" readonly="true" />
        </el-form-item>
        <el-form-item label="S/N码" prop="type">
          <el-input v-model="temp.assetsSn" readonly="true" />
        </el-form-item>
        <el-form-item label="类别" prop="type">
          <el-input v-model="temp.type.typeName" readonly="true" />
        </el-form-item>
        <el-form-item v-for="item in temp.asseAttributes" v-if="temp.type.typeId != null" :label="item.attributeName" prop="type">
          <el-input v-if="item.assetsInfo != null" v-model="item.assetsInfo.assetsInfo" readonly="true" />
        </el-form-item>
        <el-form-item label="来源" prop="type">
          <el-input v-model="temp.assetsSource" readonly="true" />
        </el-form-item>
        <el-form-item label="购入日期" prop="timestamp">
          <el-date-picker v-model="temp.assetsTime" type="datetime" placeholder="Please pick a date" readonly="true" />
        </el-form-item>
        <el-form-item label="折旧方式" prop="type">
          <el-input v-model="temp.depreciationWay.depreciationWayName" readonly="true" />
        </el-form-item>
        <el-form-item label="资产价值" prop="type">
          <el-input v-model="temp.assetsValue" readonly="true" />
        </el-form-item>
        <el-form-item label="使用期限(年)" prop="type">
          <el-input v-model="temp.serviceLife" readonly="true" />
        </el-form-item>
        <el-form-item label="数量" prop="type">
          <el-input v-model="temp.count" readonly="true" />
        </el-form-item>
        <el-form-item label="易耗品" prop="type">
          <el-input v-model="temp.consumable" readonly="true" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="temp.remarks" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" readonly="true" />
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog :visible.sync="dialogApplyFormVisible">
      <!--<el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="130px" style="width: 400px; margin-left:50px;">-->
      <el-form ref="dataApplyForm" :model="apply" label-position="left" label-width="130px" style="width: 400px; margin-left:50px;">
        <el-form-item label="申请原因" prop="type">
          <el-input v-model="apply.applyReason" type="textarea" placeholder="Please input" />
        </el-form-item>
      </el-form>
      <!-- TODO -->
      <div v-if="1" slot="footer" class="dialog-footer">
        <el-button @click="dialogApplyFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="applyTo">
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
import { fetchAssetsList, fetchPv, createAssets, updateAssets, fetchdepreciationWaysList,
  fetchAssetsAttributeOne, fetchLendReturnList, fetchAssetsOne } from '@/api/assets'
import { checkoutAssets, checkoutAssetsAll } from '@/api/checkout'
import { createApply } from '@/api/apply'
import { fetchTypesList } from '@/api/type'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { mapGetters } from 'vuex'

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
    assetsStatusFilter(status) {
      const statusMap = {
        normal: 'success',
        destroy: 'danger',
        info: 'info'
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
      assetsTypes: '',
      depreciationWays: '',
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: 'asc',
        assetsName: undefined,
        assetsTypeId: undefined,
        assetsTime: undefined,
        assetsTimeTransfor: undefined,
        checkoutTime: undefined,
        checkoutTimeTransfer: undefined,
        eid: undefined,
        checkoutWay: undefined,
        lendTime: undefined,
        lendTimeTransfer: undefined,
        lendReturnType: undefined
      },
      apply: {
        applyId: '',
        employeeId: '',
        applyType: '',
        approvalMainId: '',
        applyReason: '',
        byWho: '',
        assetsId: ''
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: '升序', key: 'asc' }, { label: '降序', key: 'desc' }],
      checkoutWays: [{ label: '正常', key: '入库' }, { label: '归还', key: '出库' }],
      lendReturnTypes: [{ label: '正常', key: '0' }, { label: '归还', key: '1' }, { label: '维修', key: '2' }],
      statusOptions: ['published', 'draft', 'deleted'],
      // assetsStatusList: ['正常', '已借出', '维修', '报废', '变卖'],
      applyStatusList: ['入库', '归还', '报修', '报废', '变卖', '领用'],
      assetsStatusList: ['归还', '维修'],
      lendReturnTypeOptions: ['正常', '已归还', '维修'],

      assetsStatusColorList: ['success', 'danger', 'info'],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: { typeId: '', typeName: '' },
        status: 'published',
        // 新增属性
        assetsId: '',
        assetsSn: '',
        assetsName: '',
        assetsSource: '',
        // 购入日期
        assetsTime: '',
        // 规定0 为正常， 1为报废
        assetsStatus: '0',
        depreciationWay: { depreciationWayId: '', depreciationWayName: '' },
        assetsValue: '',
        remarks: '',
        serviceLife: '',
        count: '',
        consumable: '',
        asseAttributes: '',
        checkoutTime: '',
        lendTime: '',
        expectReturnTime: '',
        realReturnTime: '',
        lendId: ''
      },
      dialogFormVisible: false,
      dialogApplyFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '添加'
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
  computed: {
    ...mapGetters([
      'personal_info'
    ])
  },
  methods: {
    getList() {
      this.listLoading = true
      if (this.listQuery.checkoutTime != null) { this.listQuery.checkoutTimeTransfer = parseTime(this.listQuery.checkoutTime, '{y}{m}{d}') } else { this.listQuery.checkoutTimeTransfer = null }
      console.log('提交前测试')
      console.log(this.listQuery)
      checkoutAssets(this.listQuery).then(response => {
        if (response.data != null) {
          this.list = response.data.list
          this.total = response.data.total
        } else {
          this.list = null
          this.total = 0
        }
      })
      fetchTypesList().then(response => {
        if (response.data != null) { this.assetsTypes = response.data } else { this.assetsTypes = null }
      })

      setTimeout(() => {
        this.listLoading = false
      }, 0.5 * 1000)
    },
    handleTypeFilter() {
      fetchAssetsAttributeOne(this.temp.type.typeId, this.temp.assetsId).then(response => {
        this.temp.asseAttributes = response.data
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    applyTo() {
      const hint = this.assetsStatusList[this.apply.applyType - 2]
      this.$confirm('确定要申请' + hint + '？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const tempData = Object.assign({}, this.apply)
        console.log('申请数据')
        console.log(tempData)
        createApply(tempData).then(() => {
          this.dialogApplyFormVisible = false
          this.$message({
            type: 'success',
            message: '申请成功!'
          })
        })
      }).catch(() => {
        // this.$message({
        //   type: 'info',
        //   message: '申请失败'
        // })
        // this.dialogFormVisible = false
      })
    },
    handleModifyStatus(row, assetsStatus) {
      this.apply.applyReason = ''
      this.dialogApplyFormVisible = true
      this.apply.assetsId = row.assetsId
      this.apply.applyType = assetsStatus
      this.apply.employeeId = this.personal_info.eid
      this.apply.byWho = this.personal_info.eid
      console.log('确认')
      console.log(this.apply)
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
        type: { typeId: '', typeName: '' },
        // 新增属性
        assetsId: '',
        assetsSn: '',
        assetsName: '',
        assetsSource: '',
        // 购入日期
        assetsTime: '',
        // 规定0 为正常， 1为报废
        assetsStatus: '0',
        depreciationWay: { depreciationWayId: '', depreciationWayName: '' },
        assetsValue: '',
        remarks: '',
        serviceLife: '',
        count: '',
        consumable: '',
        asseAttributes: '',
        checkoutTime: '',
        lendTime: '',
        expectReturnTime: '',
        realReturnTime: '',
        lendId: ''
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
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
          createAssets(this.temp).then(response => {
            this.temp.assetsId = response.data.assetsId
            this.temp.assetsTime = response.data.assetsTime
            if ((this.listQuery.page * this.listQuery.limit) > this.total) { this.list.push(this.temp) }
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
      console.log('测试ID值')
      console.log(row.assetsId)
      fetchAssetsOne(row.assetsId).then(response => {
        this.temp = response.data
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.depreciation = this.temp.depreciationWay
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          console.log('测试要提交的数据')
          console.log(tempData)
          updateAssets(tempData).then(() => {
            for (const v of this.list) {
              if (v.assetsId === this.temp.assetsId) {
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
      checkoutAssetsAll().then(response => {
        if (response.data != null) {
          const tempData = response.data
          import('@/vendor/Export2Excel').then(excel => {
            const tHeader = ['编号', '资产编号', '资产名称', '资产类别', '变动日期',
              '变动方式', '数量', '申请人', '审批人']
            const filterVal = ['checkout', 'assetsId', 'assetsName', 'assetsType', 'checkoutTime', 'checkoutWay',
              'checkCount', 'applicant', 'approver']
            const data = this.formatJson(filterVal, tempData)

            excel.export_json_to_excel({
              header: tHeader,
              data,
              filename: 'checkout-list_' + parseTime(new Date())
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
        if (j === 'checkoutTime') {
          return parseTime(v[j])
        } else if (j === 'assetsId') {
          return v['assets'].assetsId
        } else if (j === 'assetsName') {
          return v['assets'].assetsName
        } else if (j === 'assetsType') {
          return v['assets'].type.typeName
        } else if (j === 'checkoutWay') {
          return this.applyStatusList[v[j] - 1]
        } else if (j === 'applicant') {
          return v['applicant'].employeeName
        } else if (j === 'approver') {
          return v['approver'].employeeName
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
    },
    modify(row) {
      this.$confirm('确定要入库？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          type: 'success',
          message: '入库成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '入库失败'
        })
      })
    }
  }
}
</script>
