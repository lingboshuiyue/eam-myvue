import request from '@/utils/request'

export function findApply() {

}
// 查看折旧报表
export function findFinancial_statements(query) {
  console.log('/DepreciationDetail/depreciation')
  return request({
    url: '/depreciation',
    method: 'get',
    params: query
  })
}
export function findAllFinancial(query) {
  console.log('/DepreciationDetail/depreciation')
  return request({
    url: '/selectAllDepreciation',
    method: 'get',
    params: query
  })
}

export function findAllFinancialAll() {
  return request({
    url: '/selectAllDepreciation/all',
    method: 'get'
  })
}

// 查看资产表
export function findAssetsById(query) {
  console.log('/financial/assets')
  return request({
    url: '/financial/assets',
    method: 'get',
    params: query
  })
}
// 提交申请变卖表
export function commitSell(data) {
  console.log('/financial/toapply')
  return request({
    url: '/financial/toapply',
    method: 'get',
    params: data
  })
}
// 查看月增加对账表
export function reconciliation() {
  return request({
    url: '/financial/reconciliation',
    method: 'get'
  })
}
// 查看资产汇总表
export function findFinancial(query) {
  return request({
    url: '/selectAssetsTotal',
    method: 'get',
    params: query
  })
}
// 查看接触归还表
export function findLend(query) {
  console.log('/financial/lend')
  return request({
    url: '/selectAllLendReturnDetail',
    method: 'get',
    params: query
  })
}
// 查看报废表
export function findScrap(query) {
  console.log('/financial/scrap')
  return request({
    url: '/selectAllScrapDetail',
    method: 'get',
    params: query
  })
}
// 变卖表
export function findSell(query) {
  console.log('/financial/sell')
  return request({
    url: '/selectSellDetail',
    method: 'get',
    params: query
  })
}
// 查看申请结果
export function applyResult(query) {
  console.log('applyResult..')
  return request({
    url: '/selectAllApply',
    method: 'get',
    params: query
  })
}
// 查询审核
export function apploval_list(query) {
  console.log('selectAllApprovalApply..')
  return request({
    url: 'selectAllApprovalApply',
    method: 'get',
    params: query
  })
}
// 审核
export function apploval(data) {
  console.log('apploval..')
  return request({
    url: 'approval',
    method: 'post',
    data
  })
}

