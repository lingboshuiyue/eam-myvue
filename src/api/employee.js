import request from '@/utils/request'

export function fetchEmployeeList(query) {
  return request({
    url: '/employee',
    method: 'get',
    params: query
  })
}

export function fetchEmployee(id) {
  return request({
    url: '/employee/' + id,
    method: 'get'
  })
}

export function fetchEmployeeAll() {
  return request({
    url: '/employee/all',
    method: 'get'
  })
}

export function fetchRoleList() {
  return request({
    url: '/employee/getrole',
    method: 'get'
  })
}

export function fetchPv(pv) {
  return request({
    url: '/employee/pv',
    method: 'get',
    params: { pv }
  })
}

export function createEmployee(data) {
  return request({
    url: '/employee',
    method: 'post',
    data
  })
}

export function updateEmployee(data) {
  return request({
    url: '/employee',
    method: 'put',
    data
  })
}

export function updateLoginPassword(data) {
  return request({
    url: '/employee/changepwd',
    method: 'put',
    data
  })
}
