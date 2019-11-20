import { asyncRoutes, constantRoutes, level_one, level_two, level_three, level_four, level_admin } from '@/router'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  // if (route.meta && route.meta.roles) {
  //   return roles.some(role => route.meta.roles.includes(role))
  // } else {
  return true
  // }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    // state.addRoutes = asyncRoutes
    // if (routes !== asyncRoutes) {
    //   state.routes = constantRoutes.concat(routes).concat(asyncRoutes)
    // } else {
    state.routes = constantRoutes.concat(routes)
    // }
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      let accessedRoutes
      const limited = roles.limited.limitedType
      console.log('测试权限')
      console.log(roles)
      if (limited === 1) { accessedRoutes = level_one || [] } else if (limited === 2) { accessedRoutes = level_two || [] } else if (limited === 3) { accessedRoutes = level_three || [] } else if (limited === 4) { accessedRoutes = level_four || [] } else { accessedRoutes = level_admin || [] }
      commit('SET_ROUTES', accessedRoutes)
      // if (accessedRoutes !== asyncRoutes) {
      //   accessedRoutes = accessedRoutes.concat(asyncRoutes)
      // }
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
