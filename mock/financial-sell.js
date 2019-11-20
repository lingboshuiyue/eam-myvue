import Mock from 'mockjs'

const List = []
const count = 100
// eslint-disable-next-line no-unused-vars
const baseContent = '<p>I am testing data, I am testing data.</p><p><img src="https://wpimg.wallstcn.com/4c69009c-0fd4-4153-b112-6cb53d1cf943"></p>'
// eslint-disable-next-line no-unused-vars
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'

for (let i = 0; i < count; ++i) {
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
    sell_id: '@increment',
    sell_time: Mock.Random.date('yyyy-MM'),
    employee_id: Mock.Random.string('张三是陈李黄和庄吴康赵钱孙', 3, 6),
    last_deal_id: Mock.Random.string('张三是陈李黄和庄吴康赵钱孙', 3, 6),
    assets_id: Mock.Random.integer(1000, 10000),
    sell_count: Mock.Random.integer(10, 100),
    sell_value: Mock.Random.integer(1000, 10000)
  }))
}

export default [
  {
    url: '/financial/sell',
    type: 'get',
    response: config => {
      const { importance, type, title, page, limit, sort } = config.query
      let mockList = List.filter(item => {
        console.log('====item.type:' + type + '======')
        if (importance && item.importance !== +importance) return false
        if (type && item.depreciation_way_id !== type) return false
        if (title && item.title !== title) return false
        return true
      })
      if (sort === '-id') {
        mockList = mockList.reverse()
      }
      const pageList = mockList.filter((item, index) => index < limit * page && index > limit * (page - 1))
      return {
        code: 20000,
        data: {
          items: pageList,
          total: pageList.length
        }
      }
    }
  }
]
