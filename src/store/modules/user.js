import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import store from '../../store'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  roles: [],
  // 自增主键
  eid: '',
  // 出生日期
  birthdate: '',
  entrydate: '',
  employee_name: '',
  // 规定0 为男， 1为女
  employee_sex: '',
  department: '',
  departments: '',
  employee_phone: '',
  // 规定0 为在职, 1为离职
  employee_status: '',
  employee_email: '',
  employee_identify: '',
  employee_education: '',
  employee_native_place: '',
  // 规定 0 为未婚， 1 为已婚
  employee_marital_status: '',
  personal_info: ''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_PERSONAL_INFO: (state, personal_info) => {
    state.personal_info = personal_info
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      // login({ username: username.trim(), password: password }).then(response => {
      login({ loginEmployeeId: username.trim(), loginEmployeePassword: password }).then(response => {
        const { data } = response
        console.log('设置token')
        console.log(data.token)
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        console.log('成功完成')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    console.log('测试token输出')
    console.log(getToken())
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        console.log('问题')
        const { data, result } = response

        // if (!data) {
        //   reject('Verification failed, please Login again.')
        // }
        // if (result !== 'ok') {
        //   reject('Verification failed, please Login again.')
        // }

        // const { roles, name, avatar, introduction } = data
        //
        // // roles must be a non-empty array
        // if (!roles || roles.length <= 0) {
        //   reject('getInfo: roles must be a non-null array!')
        // }
        commit('SET_ROLES', data.role)
        commit('SET_PERSONAL_INFO', data)

        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resetRouter()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  changeRoles({ commit, dispatch }, role) {
    return new Promise(async resolve => {
      const token = role + '-token'

      commit('SET_TOKEN', token)
      setToken(token)

      const { roles } = await dispatch('getInfo')

      resetRouter()

      // generate accessible routes map based on roles
      const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })

      // dynamically add accessible routes
      router.addRoutes(accessRoutes)

      // reset visited views and cached views
      dispatch('tagsView/delAllViews', null, { root: true })

      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
