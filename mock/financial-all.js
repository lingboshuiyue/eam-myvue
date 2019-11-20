import Mock from 'mockjs'

const List = []
const count = 100
// eslint-disable-next-line no-unused-vars
const baseContent = '<p>I am testing data, I am testing data.</p><p><img src="https://wpimg.wallstcn.com/4c69009c-0fd4-4153-b112-6cb53d1cf943"></p>'
// eslint-disable-next-line no-unused-vars
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'

for (let i = 0; i < count; i++){
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
    type_id: '@increment',
    type_name: Mock.Random.string('京东方单独发份免费看积分的饭卡轮廓度七篇', 5, 8),
    assets_id: '@increment',
    assets_name: Mock.Random.string('的肥胖率的立法儿啊扩大解放南非哦欸德法俄剖析', 5, 8)
  }))
}

export default [
  {
    url: '/financial/all',
    type: 'get',
    response: config => {
      const { importance, type, title, page = 1, limit = 20, sort } = config.query
      let mockList = List.filter(item => {
        if (importance && item.importance !== importance) return false
        if (type && item.type !== importance) return false
        if (title && item.title !== title) return title
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
