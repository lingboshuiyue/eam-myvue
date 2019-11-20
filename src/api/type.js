import request from '@/utils/request'

export function fetchTypeList(query) {
  return request({
    url: '/type',
    method: 'get',
    params: query
  })
}

export function fetchAssetsAttributeList(id) {
  return request({
    url: '/assets_attribute/' + id,
    method: 'get'
  })
}

export function fetchTypeOne(id) {
  return request({
    url: '/type/' + id,
    method: 'get'
  })
}

export function fetchTypesList() {
  return request({
    url: '/types',
    method: 'get'
  })
}

export function createType(data) {
  return request({
    url: '/type',
    method: 'post',
    data
  })
}
//
export function updateType(data) {
  return request({
    url: '/type',
    method: 'put',
    data
  })
}
