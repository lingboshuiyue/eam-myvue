import request from '@/utils/request'

// 按日期查询资产表
export function findAssetsByDate(query) {
  console.log('/financial/assets_date')
  return request({
    url: '/selectAssetsPageInfoByMonth',
    method: 'get',
    params: query
  })
}
