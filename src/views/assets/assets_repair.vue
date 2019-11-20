<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.assetsName" placeholder="名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-date-picker v-model="listQuery.assetsTime" type="datetime" clearable class="filter-item" placeholder="购入日期" @change="handleFilter" />
      <el-select v-model="listQuery.assetsTypeId" placeholder="类型" clearable class="filter-item" style="width: 130px" @change="handleFilter">
        <el-option v-for="item in assetsTypes" :key="item.typeId" :label="item.typeName" :value="item.typeId" />
      </el-select>
      <!--<el-select v-model="listQuery.assetsStatus" placeholder="资产状态" clearable class="filter-item" style="width: 130px" @change="handleFilter">-->
      <!--<el-option v-for="item in assetsStatusOptions" :key="item.key" :label="item.label" :value="item.key" />-->
      <!--</el-select>-->
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <!--<el-button v-if="roles.limited.limitedType === 3" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">-->
      <!--添加资产-->
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
      <el-table-column label="编号" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="scope">
          <span>{{ scope.row.assetsId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="150px">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.assetsName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="来源" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.assetsSource }}</span>
        </template>
      </el-table-column>
      <el-table-column label="购入日期" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.assetsTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类别" width="110px" align="center">
        <template slot-scope="scope">
          <span v-for="item in assetsTypes">
            <span v-if="item.typeId === scope.row.assetsTypeId">{{ item.typeName }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="价值">
        <template slot-scope="scope">
          <span>{{ scope.row.assetsValue }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数量" align="center" width="95">
        <template slot-scope="scope">
          <span v-if="scope.row.count">{{ scope.row.count }}</span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column label="资产状态" class-name="status-col" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.states === false" type="info">
            审核中
          </el-tag>
          <el-tag v-if="scope.row.states === true" :type="assetsStatusColorList[scope.row.assetsStatus]">
            {{ assetsStatusList[scope.row.assetsStatus] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="400" class-name="small-padding fixed-width">
        <template v-if="personal_info.department.departmentName === '维修部门' && row.repairStatus === true" slot-scope="{row}">
          <el-button type="success" size="mini" @click="repair(row)">
            完成
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="130px" style="width: 400px; margin-left:50px;">
        <!--<el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="130px" style="width: 400px; margin-left:50px;">-->
        <el-form-item v-if="temp.assetsId" label="资产编号">
          <el-input v-model="temp.assetsId" readonly="true" />
        </el-form-item>
        <el-form-item label="名称" prop="assetsName">
          <el-input v-model="temp.assetsName" />
        </el-form-item>
        <el-form-item label="S/N码" prop="assetsSn">
          <el-input v-model="temp.assetsSn" />
        </el-form-item>
        <el-form-item label="类别" prop="typeId">
          <el-select v-model="temp.assetsTypeId" class="filter-item" placeholder="Please select" @change="handleTypeFilter">
            <el-option v-for="item in assetsTypes" :key="item.typeId" :label="item.typeName" :value="item.typeId" />
          </el-select>
        </el-form-item>
        <!--<el-form-item v-for="item in temp.asseAttributes" v-if="temp.type.typeId != null" :label="item.attributeName" prop="assetsInfo">-->
        <el-form-item v-for="item in temp.asseAttributes" v-if="temp.assetsTypeId != null" :label="item.attributeName" prop="valid">
          <el-input v-model="item.assetsInfo.assetsInfo" />
        </el-form-item>
        <!--<el-form-item label="来源" prop="assetsSource">-->
        <el-form-item label="来源" prop="valid">
          <el-input v-model="temp.assetsSource" />
        </el-form-item>
        <!--<el-form-item v-if="dialogStatus === 'update'" label="状态" prop="assetsStatus">-->
        <el-form-item v-if="dialogStatus === 'update'" label="状态" prop="select">
          <el-select v-model="temp.assetsStatus" class="filter-item" placeholder="Please select">
            <el-option v-for="item in assetsStatusOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <!--<el-form-item label="折旧方式" prop="depreciationWayId">-->
        <el-form-item label="折旧方式" prop="select">
          <el-select v-model="temp.depreciationWayId" class="filter-item" placeholder="Please select">
            <el-option v-for="item in depreciationWays" :key="item.depreciationWayId" :label="item.depreciationWayName" :value="item.depreciationWayId" />
          </el-select>
        </el-form-item>
        <!--<el-form-item label="资产价值" prop="assetsValue">-->
        <el-form-item label="资产价值" prop="assetsValue">
          <el-input v-model="temp.assetsValue" />
        </el-form-item>
        <!--<el-form-item label="使用期限(年)" prop="serviceLife">-->
        <el-form-item label="使用期限(年)">
          <el-input v-model="temp.serviceLife" />
        </el-form-item>
        <!--<el-form-item label="数量" prop="count">-->
        <el-form-item label="数量">
          <el-input v-model="temp.count" />
        </el-form-item>
        <!--<el-form-item label="易耗品" prop="consumable">-->
        <el-form-item label="易耗品">
          <el-input v-model="temp.consumable" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="temp.remarks" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" :placeholder="roles.limitedType" />
        </el-form-item>
      </el-form>
      <!-- TODO -->
      <div v-if="roles.limited.limitedType === 3" slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogApplyFormVisible">
      <!--<el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="130px" style="width: 400px; margin-left:50px;">-->
      <el-form ref="dataApplyForm" :rules="rules" :model="apply" label-position="left" label-width="130px" style="width: 400px; margin-left:50px;">
        <el-form-item v-if="dialogSellStatus === '5'" label="变卖价格" prop="type">
          <el-input v-model="apply.sellValue" placeholder="Please input" />
        </el-form-item>
        <el-form-item label="申请原因" prop="type">
          <el-input v-model="apply.applyReason" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
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
  fetchAssetsAttributeOne, fetchAssetsOne } from '@/api/assets'
import { createApply } from '@/api/apply'
import { fetchTypesList } from '@/api/type'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { mapGetters } from 'vuex'
import { validateChart, isInteger, isOptions } from '@/utils/validate'

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
        assetsTimeTransfor: undefined
      },
      apply: {
        applyId: '',
        employeeId: '',
        applyType: '',
        approvalMainId: '',
        applyReason: '',
        byWho: '',
        assetsId: '',
        sellValue: '',
        row: ''
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: '升序', key: 'asc' }, { label: '降序', key: 'desc' }],
      assetsStatusOptions: [{ label: '正常', key: 0 }, { label: '已借出', key: 1 }, { label: '维修', key: 2 },
        { label: '报废', key: 3 }, { label: '变卖', key: 4 }, { label: '审核中', key: 5 }],
      statusOptions: ['published', 'draft', 'deleted'],
      assetsStatusList: ['正常', '已借出', '维修', '报废', '变卖', '审核中'],
      applyStatusList: ['入库', '归还', '报修', '报废', '变卖', '领用'],
      assetsStatusColorList: ['success', 'info', 'danger', 'danger', 'danger'],
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
        assetsStatus: 0,
        depreciationWay: { depreciationWayId: '', depreciationWayName: '' },
        assetsValue: '',
        remarks: '',
        serviceLife: '',
        count: '',
        consumable: '',
        asseAttributes: '',
        states: ''
      },
      dialogSellStatus: '',
      dialogFormVisible: false,
      dialogApplyFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        assetsSn: [{
          required: true, message: '必需填写！', trigger: 'blur'
        }, {
          validator: validateChart, trigger: 'blur'
        }],
        assetsName: [{
          required: true, message: '必需填写！', trigger: 'blur'
        }, {
          min: 2, message: '长度在 2 个字符以上', trigger: 'blur'
        }
        ],
        select: [{
          required: true, message: '必需填写！', trigger: 'change', validator: isOptions
        }],
        valid: [{
          required: true, message: '必需填写！', trigger: 'blur'
        }],
        assetsValue: [{
          required: true, message: '必需填写！', trigger: 'blur'
        }, {
          validator: isInteger, trigger: 'blur'
        }]
        // assets_sn: [{
        //   required: true, message: 'S/N码是必需的', trigger: 'blur'
        // }],
        // assets_sn: [{
        //   required: true, message: 'S/N码是必需的', trigger: 'blur'
        // }],
        // assets_sn: [{
        //   required: true, message: 'S/N码是必需的', trigger: 'blur'
        // }],

        // type: [{ required: true, message: 'type is required', trigger: 'blur' }],
        // timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        // title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  computed: {
    ...mapGetters([
      'personal_info',
      'roles'
    ])
  },
  methods: {
    getList() {
      this.listLoading = true
      // this.listQuery.assetsTime = this.listQuery.assetsTime | parseTime('{y}{m}{d}')
      if (this.listQuery.assetsTime != null) { this.listQuery.assetsTimeTransfor = parseTime(this.listQuery.assetsTime, '{y}{m}{d}') } else { this.listQuery.assetsTimeTransfor = null }
      this.listQuery.assetsStatus = 2
      fetchAssetsList(this.listQuery).then(response => {
        if (response.data != null) {
          this.list = response.data.list
          this.total = response.data.total
        } else {
          this.list = null
          this.total = 0
        }
        // Just to simulate the time of the request
      })
      fetchTypesList().then(response => {
        if (response.data != null) { this.assetsTypes = response.data } else { this.assetsTypes = null }
      })
      fetchdepreciationWaysList().then(response => {
        if (response.data != null) { this.depreciationWays = response.data } else { this.depreciationWays = null }
      })
      setTimeout(() => {
        this.listLoading = false
      }, 0.5 * 1000)
    },
    repair(row) {
      this.$confirm('确定维修完成' + '？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        row.repairStatus = false
        const tempData = Object.assign({}, row)
        updateAssets(tempData).then(() => {
          for (const v of this.list) {
            if (v.assetsId === row.assetsId) {
              const index = this.list.indexOf(v)
              this.list.splice(index, 1, row)
              break
            }
          }
          this.$message({
            type: 'info',
            message: '维修成功'
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '维修失败'
        })
      })
    },
    handleTypeFilter() {
      fetchAssetsAttributeOne(this.temp.assetsTypeId, this.temp.assetsId).then(response => {
        this.temp.asseAttributes = response.data
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    applyTo() {
      const hint = this.applyStatusList[this.apply.applyType - 1]
      this.$confirm('确定要申请' + hint + '？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const tempData = Object.assign({}, this.apply)
        createApply(tempData).then(() => {
          this.dialogApplyFormVisible = false
          this.$message({
            type: 'success',
            message: '申请成功!'
          })
          this.temp.states = false
          for (const v of this.list) {
            if (v.assetsId === this.temp.assetsId) {
              const index = this.list.indexOf(v)
              this.list.splice(index, 1, this.temp)
              break
            }
          }
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
      this.temp = row

      this.apply.applyReason = ''
      this.dialogApplyFormVisible = true
      this.apply.sellValue = ''
      this.apply.assetsId = row.assetsId
      this.apply.applyType = assetsStatus
      this.apply.employeeId = this.personal_info.eid
      this.apply.byWho = this.personal_info.eid
      this.dialogSellStatus = assetsStatus
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
        assetsStatus: 0,
        depreciationWay: { depreciationWayId: '', depreciationWayName: '' },
        assetsValue: '',
        remarks: '',
        serviceLife: '',
        count: '',
        consumable: '',
        asseAttributes: '',
        sellValue: '',
        states: ''
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
          createAssets(this.temp).then(response => {
            // this.temp.assetsId = response.data.assetsId
            // this.temp.assetsTime = response.data.assetsTime
            // this.temp.states = 1
            // this.temp.assetsStatus = 0
            this.temp = response.data
            if ((this.listQuery.page * this.listQuery.limit) >= this.total) { this.list.push(this.temp) }
            if ((this.listQuery.page * this.listQuery.limit) === this.total) { this.listQuery.page = this.listQuery.page + 1 }
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
      fetchAssetsOne(row.assetsId).then(response => {
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
          this.temp.depreciation = this.temp.depreciationWay
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
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
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['资产编号', 'S/N码', '名称', '来源', '购入时间',
            '类型ID', '状态', '折扣方式', '部门ID', '资产价值', '备注',
            '使用期限', '数量', '易耗品']
          const filterVal = ['assetsId', 'assetsSn', 'assetsName', 'assetsSource', 'assetsTime',
            'typeId', 'assetsStatus', 'depreciationWayId', 'assetsValue', 'remarks',
            'serviceLife', 'count', 'consumable']

          const data = this.formatJson(filterVal, this.list)

          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: 'assets-list_' + parseTime(new Date())
          })
          this.downloadLoading = false
        })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'assetsTime') {
          return parseTime(v[j])
        } else if (j === 'assetsType') {
          return v[j].type_name
        } else if (j === 'assetsStatus') {
          return this.assetsStatusList[v[j]]
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
