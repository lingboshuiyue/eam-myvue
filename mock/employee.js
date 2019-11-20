import Mock from 'mockjs'

const List = []
const count = 100
const departments = [{department_id: '1', department_name: '开发部'}, {department_id: '2',department_name: '行政部门'}, {department_id: '3',department_name: '人事部'}, {department_id: '4',department_name: '财务部'}]


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
    eid: '@increment',
    // 出生日期
    birthdate: +Mock.Random.date('T'),
    entrydate: +Mock.Random.date('T'),
    employee_name: '@first',
    // 规定0 为男， 1为女
    'employee_sex|1': ['0', '1'],
    'department|1': [{department_id: '1', department_name: '开发部'}, {department_id: '2',department_name: '行政部门'}, {department_id: '3',department_name: '人事部'}, {department_id: '4',department_name: '财务部'}],
    employee_phone: '15018239490',
    // 规定0 为在职, 1为离职
    'employee_status|1': ['0', '1'],
    // employee_email: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$/,
    employee_email: '792800698@qq.com',
    employee_identify: '110101199003071030',
    'employee_education|1': ['小学', '初中', '高中', '大学', '研究生'],
    employee_native_place: '中国',
    // 规定 0 为未婚， 1 为已婚
    'employee_marital_status|1': ['0', '1']
  }))
}

export default [
  {
    url: '/employee/list',
    type: 'get',
    response: config => {
      const { importance, type, title, page = 1, limit = 20, sort, employee_status, employee_name, department } = config.query
      let mockList = List.filter(item => {
        if (importance && item.importance !== +importance) return false
        if (type && item.type !== type) return false
        if (department && item.department.department_id !== department) return false
        if (title && item.title.indexOf(title) < 0) return false
        if (employee_name && item.employee_name.indexOf(employee_name) < 0) return false
        return true
      })

      if (sort === '-eid') {
        mockList = mockList.reverse()
      }

      if (employee_status === '0') {
        mockList = mockList.filter((item, index) => item.employee_status == '0')
      }
      if (employee_status === '1') {
        mockList = mockList.filter((item, index) => item.employee_status == '1')
      }

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList,
          departments: departments
        }
      }
    }
  },

  {
    url: '/employee/detail',
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
    url: '/employee/pv',
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
    url: '/employee/create',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  {
    url: '/employee/update',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]

