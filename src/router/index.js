import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */
import componentsRouter from './modules/components'
import chartsRouter from './modules/charts'
import tableRouter from './modules/table'
import nestedRouter from './modules/nested'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '企业固定资产管理系统', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: 'Profile', icon: 'user', noCache: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/Example',
    component: Layout,
    meta: { title: '以下是示例', icon: 'icon', noCache: true }
  },
  {
    path: '/permission',
    component: Layout,
    redirect: '/permission/page',
    alwaysShow: true, // will always show the root menu
    name: 'Permission',
    meta: {
      title: 'Permission',
      icon: 'lock',
      roles: ['admin', 'editor'] // you can set roles in root nav
    },
    children: [
      {
        path: 'page',
        component: () => import('@/views/permission/page'),
        name: 'PagePermission',
        meta: {
          title: 'Page Permission',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'directive',
        component: () => import('@/views/permission/directive'),
        name: 'DirectivePermission',
        meta: {
          title: 'Directive Permission'
          // if do not set roles, means: this page does not require permission
        }
      },
      {
        path: 'role',
        component: () => import('@/views/permission/role'),
        name: 'RolePermission',
        meta: {
          title: 'Role Permission',
          roles: ['admin']
        }
      }
    ]
  },

  {
    path: '/icon',
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/icons/index'),
        name: 'Icons',
        meta: { title: 'Icons', icon: 'icon', noCache: true }
      }
    ]
  },

  /** when your routing map is too long, you can split it into small modules **/
  componentsRouter,
  chartsRouter,
  nestedRouter,
  tableRouter,

  {
    path: '/example',
    component: Layout,
    redirect: '/example/list',
    name: 'Example',
    meta: {
      title: 'Example',
      icon: 'example'
    },
    children: [
      {
        path: 'create',
        component: () => import('@/views/example/create'),
        name: 'CreateArticle',
        meta: { title: 'Create Article', icon: 'edit' }
      },
      {
        path: 'edit/:id(\\d+)',
        component: () => import('@/views/example/edit'),
        name: 'EditArticle',
        meta: { title: 'Edit Article', noCache: true, activeMenu: '/example/list' },
        hidden: true
      },
      {
        path: 'list',
        component: () => import('@/views/example/list'),
        name: 'ArticleList',
        meta: { title: 'Article List', icon: 'list' }
      }
    ]
  },

  {
    path: '/tab',
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/tab/index'),
        name: 'Tab',
        meta: { title: 'Tab', icon: 'tab' }
      }
    ]
  },

  {
    path: '/error',
    component: Layout,
    redirect: 'noRedirect',
    name: 'ErrorPages',
    meta: {
      title: 'Error Pages',
      icon: '404'
    },
    children: [
      {
        path: '401',
        component: () => import('@/views/error-page/401'),
        name: 'Page401',
        meta: { title: '401', noCache: true }
      },
      {
        path: '404',
        component: () => import('@/views/error-page/404'),
        name: 'Page404',
        meta: { title: '404', noCache: true }
      }
    ]
  },

  {
    path: '/error-log',
    component: Layout,
    children: [
      {
        path: 'log',
        component: () => import('@/views/error-log/index'),
        name: 'ErrorLog',
        meta: { title: 'Error Log', icon: 'bug' }
      }
    ]
  },

  {
    path: '/excel',
    component: Layout,
    redirect: '/excel/export-excel',
    name: 'Excel',
    meta: {
      title: 'Excel',
      icon: 'excel'
    },
    children: [
      {
        path: 'export-excel',
        component: () => import('@/views/excel/export-excel'),
        name: 'ExportExcel',
        meta: { title: 'Export Excel' }
      },
      {
        path: 'export-selected-excel',
        component: () => import('@/views/excel/select-excel'),
        name: 'SelectExcel',
        meta: { title: 'Export Selected' }
      },
      {
        path: 'export-merge-header',
        component: () => import('@/views/excel/merge-header'),
        name: 'MergeHeader',
        meta: { title: 'Merge Header' }
      },
      {
        path: 'upload-excel',
        component: () => import('@/views/excel/upload-excel'),
        name: 'UploadExcel',
        meta: { title: 'Upload Excel' }
      }
    ]
  },

  {
    path: '/zip',
    component: Layout,
    redirect: '/zip/download',
    alwaysShow: true,
    name: 'Zip',
    meta: { title: 'Zip', icon: 'zip' },
    children: [
      {
        path: 'download',
        component: () => import('@/views/zip/index'),
        name: 'ExportZip',
        meta: { title: 'Export Zip' }
      }
    ]
  },

  {
    path: '/pdf',
    component: Layout,
    redirect: '/pdf/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/pdf/index'),
        name: 'PDF',
        meta: { title: 'PDF', icon: 'pdf' }
      }
    ]
  },
  {
    path: '/pdf/download',
    component: () => import('@/views/pdf/download'),
    hidden: true
  },

  {
    path: '/theme',
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/theme/index'),
        name: 'Theme',
        meta: { title: 'Theme', icon: 'theme' }
      }
    ]
  },

  {
    path: '/clipboard',
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/clipboard/index'),
        name: 'ClipboardDemo',
        meta: { title: 'Clipboard', icon: 'clipboard' }
      }
    ]
  },

  {
    path: 'external-link',
    component: Layout,
    children: [
      {
        path: 'https://github.com/PanJiaChen/vue-element-admin',
        meta: { title: 'External Link', icon: 'link' }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

export const level_one = [
  {
    path: '/assets',
    component: Layout,
    redirect: '/assets/assets_list',
    name: 'Assets',
    meta: { title: '资产管理', icon: 'example' },
    children: [
      {
        path: 'assets_list',
        name: 'Assets_list',
        component: () => import('@/views/assets/assets_list'),
        meta: { title: '查看资产列表', icon: 'table' }
      },
      {
        path: 'lend_return_list',
        name: 'Lend_return_list',
        component: () => import('@/views/assets/lend_return_list'),
        meta: { title: '查看已借用列表', icon: 'tree' }
      }
    ]
  },
  {
    path: '/apply',
    component: Layout,
    redirect: '/apply/apply_list',
    children: [
      {
        path: 'apply_list',
        name: 'Apply_list',
        component: () => import('@/views/apply/apply_result'),
        meta: { title: '申请结果', icon: 'table' }
      }
    ]
  },
  {
    path: '/personal',
    component: Layout,
    redirect: '/personal/personal_info',
    name: 'Personal',
    meta: { title: '个人信息管理', icon: 'example' },
    children: [
      {
        path: 'personal_info',
        name: 'Personal_info',
        component: () => import('@/views/personal/personal_info'),
        meta: { title: '修改个人信息', icon: 'table' }
      },
      {
        path: 'personal_password',
        name: 'Personal_password',
        component: () => import('@/views/personal/personal_password'),
        meta: { title: '修改密码', icon: 'table' }
      }
    ]
  }
]

export const level_two = [
  {
    path: '/assets',
    component: Layout,
    redirect: '/assets/assets_list',
    name: 'Assets',
    meta: { title: '资产管理', icon: 'example' },
    children: [
      {
        path: 'assets_list',
        name: 'Assets_list',
        component: () => import('@/views/assets/assets_list'),
        meta: { title: '查看资产列表', icon: 'table' }
      },
      {
        path: 'lend_return_list',
        name: 'Lend_return_list',
        component: () => import('@/views/assets/lend_return_list'),
        meta: { title: '查看已借用列表', icon: 'tree' }
      }
    ]
  },
  {
    path: '/apply',
    component: Layout,
    redirect: '/apply/apply_list',
    children: [
      {
        path: 'apply_list',
        name: 'Apply_list',
        component: () => import('@/views/apply/apply_result'),
        meta: { title: '申请结果', icon: 'table' }
      }
    ]
  },
  {
    path: '/personal',
    component: Layout,
    redirect: '/personal/personal_info',
    name: 'Personal',
    meta: { title: '个人信息管理', icon: 'example' },
    children: [
      {
        path: 'personal_info',
        name: 'Personal_info',
        component: () => import('@/views/personal/personal_info'),
        meta: { title: '修改个人信息', icon: 'table' }
      },
      {
        path: 'personal_password',
        name: 'Personal_password',
        component: () => import('@/views/personal/personal_password'),
        meta: { title: '修改密码', icon: 'table' }
      }
    ]
  },
  {
    path: '/approval',
    component: Layout,
    redirect: '/approval/apploval_result',
    // meta: {title: '查看审批结果', icon: 'example'},
    children: [
      {
        path: 'apploval_result',
        name: 'Apploval_result',
        component: () => import('@/views/approval/apploval_result'),
        meta: { title: '我的审批', icon: 'table' }
      }
    ]
  }

  // 404 page must be placed at the end !!!
  // { path: '*', redirect: '/404', hidden: true }
]

export const level_three = [
  {
    path: '/assets',
    component: Layout,
    redirect: '/assets/assets_list',
    name: 'Assets',
    meta: { title: '资产管理', icon: 'example' },
    children: [
      {
        path: 'assets_list',
        name: 'Assets_list',
        component: () => import('@/views/assets/assets_list'),
        meta: { title: '查看资产列表', icon: 'table' }
      },
      {
        path: 'lend_return_list',
        name: 'Lend_return_list',
        component: () => import('@/views/assets/lend_return_list'),
        meta: { title: '查看已借用列表', icon: 'tree' }
      },
      {
        path: 'assets_repair',
        name: 'assets_repair',
        component: () => import('@/views/assets/assets_repair'),
        meta: { title: '查看维修列表', icon: 'tree' }
      }
    ]
  },
  {
    path: '/apply',
    component: Layout,
    redirect: '/apply/apply_list',
    children: [
      {
        path: 'apply_list',
        name: 'Apply_list',
        component: () => import('@/views/apply/apply_result'),
        meta: { title: '申请结果', icon: 'table' }
      }
    ]
  },
  {
    path: '/personal',
    component: Layout,
    redirect: '/personal/personal_info',
    name: 'Personal',
    meta: { title: '个人信息管理', icon: 'example' },
    children: [
      {
        path: 'personal_info',
        name: 'Personal_info',
        component: () => import('@/views/personal/personal_info'),
        meta: { title: '修改个人信息', icon: 'table' }
      },
      {
        path: 'personal_password',
        name: 'Personal_password',
        component: () => import('@/views/personal/personal_password'),
        meta: { title: '修改密码', icon: 'table' }
      }
    ]
  },
  {
    path: '/financial',
    component: Layout,
    redirect: '/assets_admin/notice_list',
    name: 'Assets_admin',
    meta: { title: '财务管理', icon: 'example' },
    children: [
      // {
      //   path: 'notice_list',
      //   name: 'Notice_list',
      //   component: () => import('@/views/financial/notice_list'),
      //   meta: { title: '申请通知', icon: 'table' }
      // },
      {
        path: 'financial_list',
        name: 'financial_list',
        component: () => import('@/views/financial/financial_list'),
        meta: { title: '查看财务报表', icon: 'tree' }
      },
      {
        path: 'assets_all',
        name: 'assets_all',
        component: () => import('@/views/financial/assets_all'),
        meta: { title: '资产对账表', icon: 'tree' }
      },
      {
        path: 'lend_return',
        name: 'lend_return',
        component: () => import('@/views/financial/lend_return'),
        meta: { title: '资产类型统计表', icon: 'tree' }
      }
    ]
  },
  {
    path: '/approval',
    component: Layout,
    redirect: '/approval/apploval_result',
    // meta: {title: '查看审批结果', icon: 'example'},
    children: [
      {
        path: 'apploval_result',
        name: 'Apploval_result',
        component: () => import('@/views/approval/apploval_result'),
        meta: { title: '我的审批', icon: 'table' }
      }
    ]
  }
]

export const level_four = [
  {
    path: '/assets',
    component: Layout,
    redirect: '/assets/assets_list',
    name: 'Assets',
    meta: { title: '资产管理', icon: 'example' },
    children: [
      {
        path: 'assets_list',
        name: 'Assets_list',
        component: () => import('@/views/assets/assets_list'),
        meta: { title: '查看资产列表', icon: 'table' }
      },
      {
        path: 'lend_return_list',
        name: 'Lend_return_list',
        component: () => import('@/views/assets/lend_return_list'),
        meta: { title: '查看已借用列表', icon: 'tree' }
      },
      {
        path: 'checkout_list',
        name: 'Checkout_list',
        component: () => import('@/views/assets/checkout_list'),
        meta: { title: '库单查看', icon: 'tree' }
      }
    ]
  },
  {
    path: '/department',
    component: Layout,
    redirect: '/department/department_list',
    children: [
      {
        path: 'department_list',
        name: 'Department_list',
        component: () => import('@/views/department/department_list'),
        meta: { title: '部门管理', icon: 'table' }
      }
    ]
  },
  {
    path: '/type',
    component: Layout,
    redirect: '/type/type_list',
    children: [
      {
        path: 'type_list',
        name: 'Type_list',
        component: () => import('@/views/type/type_list'),
        meta: { title: '分类管理', icon: 'table' }
      }
    ]
  },
  {
    path: '/apply',
    component: Layout,
    redirect: '/apply/apply_list',
    children: [
      {
        path: 'apply_list',
        name: 'Apply_list',
        component: () => import('@/views/apply/apply_result'),
        meta: { title: '申请结果', icon: 'table' }
      }
    ]
  },
  {
    path: '/personal',
    component: Layout,
    redirect: '/personal/personal_info',
    name: 'Personal',
    meta: { title: '个人信息管理', icon: 'example' },
    children: [
      {
        path: 'personal_info',
        name: 'Personal_info',
        component: () => import('@/views/personal/personal_info'),
        meta: { title: '修改个人信息', icon: 'table' }
      },
      {
        path: 'personal_password',
        name: 'Personal_password',
        component: () => import('@/views/personal/personal_password'),
        meta: { title: '修改密码', icon: 'table' }
      }
    ]
  },
  {
    path: '/financial',
    component: Layout,
    redirect: '/assets_admin/notice_list',
    name: 'Assets_admin',
    meta: { title: '财务管理', icon: 'example' },
    children: [
      // {
      //   path: 'notice_list',
      //   name: 'Notice_list',
      //   component: () => import('@/views/assets_admin/notice_list'),
      //   meta: { title: '申请通知', icon: 'table' }
      // },
      {
        path: 'financial_list',
        name: 'financial_list',
        component: () => import('@/views/financial/financial_list'),
        meta: { title: '查看财务报表', icon: 'tree' }
      },
      {
        path: 'assets_list',
        name: 'assets_list',
        component: () => import('@/views/financial/assets_all'),
        meta: { title: '资产对账表', icon: 'tree' }
      },
      {
        path: 'lend_return',
        name: 'lend_return',
        component: () => import('@/views/financial/lend_return'),
        meta: { title: '资产类型统计表', icon: 'tree' }
      }
    ]
  },
  {
    path: '/approval',
    component: Layout,
    redirect: '/approval/apploval_result',
    // meta: {title: '查看审批结果', icon: 'example'},
    children: [
      {
        path: 'apploval_result',
        name: 'Apploval_result',
        component: () => import('@/views/approval/apploval_result'),
        meta: { title: '我的审批', icon: 'table' }
      }
    ]
  }
]
export const level_admin = [
  {
    path: '/employee',
    component: Layout,
    redirect: '/employee/employee_list',
    children: [
      {
        path: 'employee_list',
        name: 'Employee_list',
        component: () => import('@/views/employee/employee_list'),
        meta: { title: '员工管理', icon: 'table' }
      }
    ]
  },
  {
    path: '/role',
    component: Layout,
    redirect: '/role/role_list',
    children: [
      {
        path: 'role_list',
        name: 'Role_list',
        component: () => import('@/views/role/role_list'),
        meta: { title: '角色管理', icon: 'table' }
      }
    ]
  },
  {
    path: '/apploval',
    component: Layout,
    redirect: '/apploval/apploval_list',
    children: [
      {
        path: 'apploval_result',
        name: 'Apploval_list',
        component: () => import('@/views/approval/apploval_list'),
        meta: { title: '审批信息管理', icon: 'table' }
      }
    ]
  }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
