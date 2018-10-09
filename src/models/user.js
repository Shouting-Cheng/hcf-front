import { query as queryUsers, queryCurrent } from '../services/user';

export default {
  namespace: 'user',

  state: {
    currentUser: {},
    company: {}
  },

  reducers: {
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    saveCompany(state, action) {
      return {
        ...state,
        company: action.payload || {},
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload,
        },
      };
    },
  },
};
