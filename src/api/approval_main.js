import request from '@/utils/request'

export function fetchApprovalMainList(query) {
  return request({
    url: '/approval_main',
    method: 'get',
    params: query
  })
}

export function fetchApprovalMainAll() {
  return request({
    url: '/approval_main/all',
    method: 'get'
  })
}

export function fetchApprovalMainOne(id) {
  return request({
    url: '/approval_main/' + id,
    method: 'get'
  })
}

export function fetchPv(pv) {
  return request({
    url: '/approval_main/pv',
    method: 'get',
    params: { pv }
  })
}

export function createApprovalMain(data) {
  return request({
    url: '/approval_main',
    method: 'post',
    data
  })
}

export function updateApprovalMain(data) {
  return request({
    url: '/approval_main',
    method: 'put',
    data
  })
}
