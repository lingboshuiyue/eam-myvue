import Mock from "mockjs";

const tokens = {
  admin: {
    token: 'admin-token'
  },
  editor: {
    token: 'editor-token'
  },
  level_one: {
    token: 'level_one-token'
  },
  level_two: {
    token: 'level_two-token'
  },
  level_three: {
    token: 'level_three-token'
  },
  level_four: {
    token: 'level_four-token'
  }
}
const baseContent = '<p>I am testing data, I am testing data.</p><p><img src="https://wpimg.wallstcn.com/4c69009c-0fd4-4153-b112-6cb53d1cf943"></p>'
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'

const data = Mock.mock({
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
  employee_name: '凌波水月',
  // 规定0 为男， 1为女
  'employee_sex|1': ['0', '1'],
  'department|1': [{department_id: '@number', department_name: '开发部'}, {department_id: '@number',department_name: '行政部门'}, {department_id: '@number',department_name: '人事部'}, {department_id: '@number',department_name: '财务部'}],
  departments: [{department_id: '@number', department_name: '开发部'}, {department_id: '@number',department_name: '行政部门'}, {department_id: '@number',department_name: '人事部'}, {department_id: '@number',department_name: '财务部'}],
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
})

const users = {
  'admin-token': {
    roles: ['admin'],
    introduction: 'I am a super administrator',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Super Admin'
  },
  'editor-token': {
    roles: ['editor'],
    introduction: 'I am an editor',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Normal Editor'
  },
  'level_one-token': {
    roles: ['level_one'],
    introduction: 'I am an level_one',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Normal level_one'
  },
  'level_two-token': {
    roles: ['level_two'],
    introduction: 'I am an level_two',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Normal level_two'
  },
  'level_three-token': {
    roles: ['level_three'],
    introduction: 'I am an level_three',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Normal level_three'
  },
  'level_four-token': {
    roles: ['level_four'],
    introduction: 'I am an level_four',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Normal level_four',
  }
}

export default [
  // user login
  {
    url: '/user/login',
    type: 'post',
    response: config => {
      const { username } = config.body
      const token = tokens[username]

      // mock error
      if (!token) {
        return {
          code: 60204,
          message: 'Account and password are incorrect.'
        }
      }

      return {
        code: 20000,
        data: token
      }
    }
  },

  // get user info
  {
    url: '/user/info\.*',
    type: 'get',
    response: config => {
      const { token } = config.query
      const info = users[token]

      // mock error
      if (!info) {
        return {
          code: 50008,
          message: 'Login failed, unable to get user details.'
        }
      }

      return {
        code: 20000,
        data: info,
        personal_info: data
      }
    }
  },

  // user logout
  {
    url: '/user/logout',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]
