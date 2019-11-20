<template>
  <div class="app-container">
    <el-form ref="form" v-loading="listLoading" :model="form" label-width="120px" style="margin-left: 25%; margin-top: 10%; width: 30%;">
      <el-form-item label="旧密码">
        <el-input v-model="form.password" />
      </el-form-item>
      <el-form-item label="新密码">
        <el-input v-model="form.repassword" />
      </el-form-item>
      <el-form-item label="确认密码">
        <el-input v-model="form.repasswords" />
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
import { updateLoginPassword } from '@/api/employee'

export default {
  name: 'Index',
  computed: {
    ...mapGetters([
      'personal_info'
    ])
  },
  data() {
    return {
      listLoading: false,
      form: {
        password: '',
        repassword: '',
        repasswords: '',
        eid: ''
      }
    }
  },
  methods: {
    resetForm() {
      this.form = {
        password: '',
        repassword: '',
        repasswords: '',
        eid: ''
      }
    },
    onSubmit() {
      this.$confirm('确定要修改？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.listLoading = true
        this.form.eid = this.personal_info.eid
        updateLoginPassword(this.form).then(() => {
          this.resetForm()
          this.$message({
            type: 'success',
            message: '修改成功!'
          })
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
