import { isUrl } from '../utils/utils';

const menuData = [
  // {
  //   name: '我的预付款',
  //   icon: 'book',
  //   path: 'pre-payment',
  //   children: [
  //     {
  //       name: '我的预付款',
  //       path: 'my-pre-payment',
  //     },
  //   ]
  // },
  {
    name: '系统管理',
    icon: 'setting',
    path: 'setting',
    children: [
      {
        name: '网页生成器',
        path: 'component-manager',
      },
      {
        name: '接口管理',
        path: 'interface',
      },
      {
        name: '模块管理',
        path: 'modules',
      },
      {
        name: '多语言管理',
        path: 'language',
      },
      {
        name: '菜单管理',
        path: 'menu',
      },
      {
        name: '角色管理',
        path: 'role',
      },
      {
        name: '员工管理',
        path: 'employee',
      },
    ],
  },
];

function formatter(data, parentPath = '/', parentAuthority) {
  return data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
