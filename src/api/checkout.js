import request from '@/utils/request'

export function checkoutAssets(query) {
  return request({
    url: '/checkout',
    method: 'get',
    params: query
  })
}

export function checkoutAssetsAll() {
  return request({
    url: '/checkout/all',
    method: 'get'
  })
}

