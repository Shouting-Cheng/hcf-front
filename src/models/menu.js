import { routerRedux } from 'dva/router';
import { stringify } from 'qs';
import { fakeAccountLogin } from '../services/api';
import { setAuthority } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';
import { getPageQuery } from '../utils/utils';

export default {
  namespace: 'menu',

  state: {
    menuList: [],
    routerData: {},
  },

  reducers: {
    setMenu(state, { payload }) {
      return {
        ...state,
        menuList: payload.menuList,
        routerData: payload.routerData,
      };
    },
  },
};
