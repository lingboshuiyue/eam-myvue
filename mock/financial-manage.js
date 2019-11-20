import Mock from 'mockjs'

const List = []
const count = 100
// eslint-disable-next-line no-unused-vars
const baseContent = '<p>I am testing data, I am testing data.</p><p><img src="https://wpimg.wallstcn.com/4c69009c-0fd4-4153-b112-6cb53d1cf943"></p>'
// eslint-disable-next-line no-unused-vars
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'

// eslint-disable-next-line no-unused-vars
const assets = {
  assets_id: 1,
  assets_sn: 23453574,
  assets_name: 'ipone18',
  assets_source: '肇庆学院',
  assets_time: '2029-9-6',
  assets_type_id: 2,
  assets_status: 0,
  depreciation_way_id: 3,
  assets_value: 10000,
  remarks: '好货不便宜，便宜没好货',
  service_life: 12,
  count: 100,
  consumable: 1
}
// eslint-disable-next-line no-empty
for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    timestamp: +Mock.Random.date('T'),
    author: '@first',
    reviewer: '@first',
    title: '@title(5, 10)',
    content_short: 'mock data',
    content: baseContent,
    forecast: '@float(0, 100, 2, 2)',
    sort: '+id',
    display_time: '@datetime',
    comment_disabled: true,
    pageviews: '@integer(300, 5000)',
    image_uri,
    platforms: ['a-platform'],
    depreciation_id: '@increment',
    'assets_id|1': Mock.Random.integer(100, 1000),
    'depreciation_way_id|1': ['11', '22', '33'],
    depreciation_time: Mock.Random.date('yyyy-MM-dd'),
    accumulated_depreciation: '呵呵',
    'sell_id|1': 'integer(200,1000)',
    currrent_depreciation: '哈哈',
    net_salvage: 100,
    net_value: 1000
  }))
}

// export default [
//   {
//     url: '/financial/depreciation',
//     type: 'get',
//     response: config => {
//       const { importance, type, title, page = 1, limit = 20, sort } = config.query
//       console.log('====sort:' + sort + '======')
//       let mockList = List.filter(item => {
//         if (importance && item.importance !== +importance) return false
//         if (type && item.depreciation_way_id !== type) return false
//         if (title && item.title !== title) return false
//         return true
//       })
//       if (sort === '-id') {
//         mockList = mockList.reverse()
//       }
//       const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))
//       return {
//         code: 20000,
//         data: {
//           total: pageList.length,
//           items: pageList
//         }
//       }
//     }
//   },
//   {
//     url: '/financial/assets',
//     type: 'get',
//     response: config => {
//       const { assets_id } = config.query
//       const mockList = List.filter(item => {
//         if (assets_id && item.assets_id.length === 0) return false
//         return true
//       })
//       return {
//         code: 20000,
//         data: {
//           total: mockList.length,
//           items: mockList,
//           assets: assets
//         }
//       }
//     }
//   },
//   {
//     url: '/financial/toapply',
//     type: 'get',
//     response: _ => {
//       return {
//         code: 20000,
//         data: 'success'
//       }
//     }
//   }
// ]
