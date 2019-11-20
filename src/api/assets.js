import request from '@/utils/request'

export function fetchAssetsList(query) {
  return request({
    url: '/assets',
    method: 'get',
    params: query
  })
}

export function fetchAssetsAll() {
  return request({
    url: '/assets/all',
    method: 'get'
  })
}

export function fetchAssetsOne(id) {
  return request({
    url: '/assets/' + id,
    method: 'get'
  })
}

export function fetchAssetsAttributeOne(typeId, assetsId) {
  return request({
    url: '/assets_attribute',
    method: 'get',
    params: { assetsTypeId: typeId, assetsId: assetsId }
  })
}

export function fetchdepreciationWaysList() {
  return request({
    url: '/depreciationWay',
    method: 'get'
  })
}

export function fetchPv(pv) {
  return request({
    url: '/assets/pv',
    method: 'get',
    params: { pv }
  })
}

export function createAssets(data) {
  return request({
    url: '/assets',
    method: 'post',
    data
  })
}

export function updateAssets(data) {
  return request({
    url: '/assets',
    method: 'put',
    data
  })
}

export function checkoutAssets(query) {
  return request({
    url: '/checkout',
    method: 'get',
    params: query
  })
}
