import request from '@/utils/request'

// 查看所有结果
export function applyResult_list(query) {
  console.log('applyResult_list...')
  return request({
    url: 'selectAllApply',
    method: 'get',
    params: query
  })
}
// 分类查看申请结果
export function applyResult_sort(query) {
  console.log('applyResult_sort...')
  return request({
    url: 'selectApplyByApplyType',
    method: 'get',
    params: query
  })
}

// 查看所有申请结果
export function applyResult_all() {
  return request({
    url: '/selectAllApply/all',
    method: 'get'
  })
}
