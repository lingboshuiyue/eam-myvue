<template>
  <div class="app-container">
    <el-form ref="form" v-loading="listLoading" :model="personal_info" label-width="80px" style="margin-left: 100px; width: 30%;">
      <el-form-item label="编号">
        <el-input v-model="personal_info.eid" disabled="true" />
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="personal_info.employeeName" />
      </el-form-item>
      <el-form-item label="性别">
        <el-radio-group v-model="personal_info.employeeSex">
          <el-radio label="0" border>男</el-radio>
          <el-radio label="1" border>女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="所属部门">
        <el-input v-model="personal_info.department.departmentName" disabled="true" />
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input v-model="personal_info.employeePhone" />
      </el-form-item>
      <el-form-item label="在职状态">
        <el-input v-if="personal_info.employeeStatus === true" disabled="true" value="在职" />
        <el-input v-if="personal_info.employeeStatus === false" disabled="true" value="离职" />
      </el-form-item>
      <el-form-item label="电子邮箱">
        <el-input v-model="personal_info.employeeEmail" type="email" />
      </el-form-item>
      <el-form-item label="身份证号">
        <el-input v-model="personal_info.employeeIdentify" />
      </el-form-item>
      <el-form-item label="学历">
        <el-input v-model="personal_info.employeeEducation" disabled="true" />
      </el-form-item>
      <el-form-item label="籍贯">
        <el-input v-model="personal_info.employeeNativePlace" />
      </el-form-item>
      <el-form-item label="婚姻状态">
        <!--<el-select v-model="personal_info.employeeMaritalStatus" class="filter-item" placeholder="Please select">-->
        <!--<el-option v-for="item in employeeMaritalOptions" :key="item.key" :label="item.label" :value="item.key" />-->
        <!--</el-select>-->
        <el-radio-group v-model="personal_info.employeeMaritalStatus">
          <el-radio label="0" border>未婚</el-radio>
          <el-radio label="1" border>已婚</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="出生日期">
        <el-date-picker v-model="personal_info.birthdate" type="date" placeholder="选择日期" style="width: 100%;" />
      </el-form-item>
      <el-form-item label="入职日期">
        <el-date-picker v-model="personal_info.entrydate" type="date" placeholder="选择日期" style="width: 100%;" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">修改</el-button>
        <el-button>取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { updateEmployee } from '@/api/employee'
export default {
  name: 'Index',
  computed: {
    ...mapGetters([
      'personal_info'
    ])
  },
  created() {
    this.personal_info.employeeSex = this.personal_info.employeeSex === true ? '0' : '1'
    this.personal_info.employeeMaritalStatus = this.personal_info.employeeMaritalStatus === false ? '0' : '1'
  },
  data() {
    return {
      listLoading: false,
      employeeMaritalOptions: [{ label: '未婚', key: false }, { label: '已婚', key: true }]
    }
  },
  methods: {
    onSubmit() {
      this.$confirm('确定要修改？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log('查看需要修改的个人信息')
        console.log(this.personal_info)
        this.listLoading = true
        this.personal_info.employeeSex = this.personal_info.employeeSex === '0'
        updateEmployee(this.personal_info).then(() => {
          this.$message({
            type: 'success',
            message: '修改成功!'
          })
          this.personal_info.employeeSex = this.personal_info.employeeSex === true ? '0' : '1'
          this.personal_info.employeeMaritalStatus = this.personal_info.employeeMaritalStatus === false ? '0' : '1'
        })
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 1000)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '修改失败'
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
