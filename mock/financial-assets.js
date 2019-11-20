import Mock from 'mockjs'

const List = []
const count = 100
// eslint-disable-next-line no-unused-vars
const baseContent = '<p>I am testing data, I am testing data.</p><p><img src="https://wpimg.wallstcn.com/4c69009c-0fd4-4153-b112-6cb53d1cf943"></p>'
// eslint-disable-next-line no-unused-vars
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'

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
    assets_id: '@increment',
    assets_sn: Mock.Random.integer(10000, 100000),
    'assets_name|1': ['联想', 'ipad', 'ipone', '小米', '神州', '华硕', '惠普', '华为', '戴尔', '三星', '宏基', '荣耀'],
    assets_source: '肇庆学院',
    assets_time: Mock.Random.date('yyyy-MM'),
    assets_type_id: Mock.Random.integer(1, 100),
    assets_status: Mock.Random.integer(0, 4),
    depreciation_way_id: Mock.Random.integer(1, 100),
    assets_value: Mock.Random.float(3000, 100000),
    remarks: Mock.Random.string('ashjhdfkajhkfadfjkdfjsakjhdfajhdfd', 6, 8),
    service_life: Mock.Random.integer(0, 4),
    count: Mock.Random.integer(1, 100),
    consumable: Mock.Random.boolean()
  }))
}

export default [
  {
    url: '/financial/date',
    type: 'get',
    response: config => {
      const { importance, type, title, page = 1, limit = 20, sort, dat } = config.query
      // eslint-disable-next-line no-unused-vars
      console.log('===' + dat + '====')
      let mockList = List.filter(item => {
        console.log('mock dat:' + item.assets_time)
        if (dat && item.assets_time !== dat) return false
        if (importance && item.importance !== importance) return false
        if (title && item.title !== title) return false
        if (type && item.type !== title) return false
        return true
      })
      if (sort === '-id') {
        // eslint-disable-next-line no-const-assign
        mockList = mockList.reverse()
      }
      const pageList = mockList.filter((item, index) => index < limit * page && index > limit * (page - 1))
      return {
        code: 20000,
        data: {
          total: pageList.length,
          items: pageList
        }
      }
    }
  }
]
