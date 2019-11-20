import request from '@/utils/request'

export function fetchLendReturnList(query) {
  return request({
    url: '/lend_return',
    method: 'get',
    params: query
  })
}

export function fetchLendReturnAll() {
  return request({
    url: '/lend_return/all',
    method: 'get'
  })
}
