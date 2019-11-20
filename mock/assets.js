import Mock from 'mockjs'

const List = []
const count = 100

const assets_types = [{type_id: '1', type_name: '电脑'},{type_id: '2', type_name: '生活用品'}]


const baseContent = '<p>I am testing data, I am testing data.</p><p><img src="https://wpimg.wallstcn.com/4c69009c-0fd4-4153-b112-6cb53d1cf943"></p>'
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
    importance: '@integer(1, 3)',
    'type|1': ['CN', 'US', 'JP', 'EU'],
    'status|1': ['published', 'draft', 'deleted'],
    display_time: '@datetime',
    comment_disabled: true,
    pageviews: '@integer(300, 5000)',
    image_uri,
    platforms: ['a-platform'],
    // 新增属性 面对修改关闭，面对扩展开放
    // 自增主键
    assets_id: '@increment',
    assets_sn: '@string',
    'assets_name|1': ['华为笔记本', '神州笔记本', '小米笔记本', '联想笔记本'],
    'assets_source|1': '网购',
    // 购入日期
    assets_time: +Mock.Random.date('T'),
    assets_type: {type_id: '1', type_name: '电脑'},
    // 规定0 为正常， 1为报废
    'assets_status|1': ['0', '1', '2'],
    'depreciation_way|1': [{depreciation_way_id: '1', depreciation_way_name: '五折'}, {depreciation_way_id: '2', depreciation_way_name: '六折'}, {depreciation_way_id: '3', depreciation_way_name: '七折'}],
    assets_value: '@integer(300, 5000)',
    remarks: '',
    service_life: '@integer(1,5)',
    count: '1',
    consumable: '易耗品',
    checkout: '@increment',
    'checkout_way|1': ['出库', '入库'],
    check_count: '@integer(10, 20)',
    checkout_time: +Mock.Random.date('T')
  }))
}

export default [
  {
    url: '/assets/list',
    type: 'get',
    response: config => {
      const { importance, type, title, page = 1, limit = 20, sort, assets_name, assets_type } = config.query
      let mockList = List.filter(item => {
        if (importance && item.importance !== +importance) return false
        if (type && item.type !== type) return false
        if (assets_type && item.assets_type.type_id !== assets_type) return false
        if (title && item.title.indexOf(title) < 0) return false
        if (assets_name && item.assets_name.indexOf(assets_name) < 0) return false
        return true
      })

      if (sort === '-id') {
        mockList = mockList.reverse()
      }

      // if (employee_status === '0') {
      //   mockList = mockList.filter((item, index) => item.employee_status == '0')
      // }
      // if (employee_status === '1') {
      //   mockList = mockList.filter((item, index) => item.employee_status == '1')
      // }

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList,
          assets_types: assets_types
        }
      }
    }
  },

  {
    url: '/assets/detail',
    type: 'get',
    response: config => {
      const { id } = config.query
      for (const employee of List) {
        if (employee.id === +id) {
          return {
            code: 20000,
            data: employee
          }
        }
      }
    }
  },

  {
    url: '/assets/pv',
    type: 'get',
    response: _ => {
      return {
        code: 20000,
        data: {
          pvData: [
            { key: 'PC', pv: 1024 },
            { key: 'mobile', pv: 1024 },
            { key: 'ios', pv: 1024 },
            { key: 'android', pv: 1024 }
          ]
        }
      }
    }
  },

  {
    url: '/assets/create',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  {
    url: '/assets/update',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  {
    url: '/assets/checkout',
    type: 'get',
    response: config => {
      const { importance, type, title, page = 1, limit = 20, sort, assets_name, assets_type } = config.query
      let mockList = List.filter(item => {
        if (importance && item.importance !== +importance) return false
        if (type && item.type !== type) return false
        if (assets_type && item.assets_type.type_id !== assets_type) return false
        if (title && item.title.indexOf(title) < 0) return false
        if (assets_name && item.assets_name.indexOf(assets_name) < 0) return false
        return true
      })

      if (sort === '-id') {
        mockList = mockList.reverse()
      }

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      }
    }
  },
]

