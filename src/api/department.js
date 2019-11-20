import request from '@/utils/request'

export function fetchDepartmentList() {
  return request({
    url: '/department',
    method: 'get'
  })
}

export function fetchDepartmentPage(query) {
  return request({
    url: '/department/list',
    method: 'get',
    params: query
  })
}

export function fetchListPage(query) {
  return request({
    url: '/department/list',
    method: 'get',
    params: query
  })
}

export function fetchDepartment(id) {
  return request({
    url: '/department/' + id,
    method: 'get'
  })
}

export function fetchPv(pv) {
  return request({
    url: '/department/pv',
    method: 'get',
    params: { pv }
  })
}

export function createDepartment(data) {
  return request({
    url: '/department',
    method: 'post',
    data
  })
}

export function updateDepartment(data) {
  return request({
    url: '/department',
    method: 'put',
    data
  })
}
