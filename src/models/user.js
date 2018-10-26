import { query as queryUsers, queryCurrent } from '../services/user';

export default {
  namespace: 'user',

  state: {
    currentUser: {},
    company: {},
    organization: {},
    proFile:{}
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
    saveOrganization(state, action) {
      return {
        ...state,
        organization: action.payload || {},
      };
    },
    saveProfile(state,action){
      return{
        ...state,
        proFile:action.payload||{}
      }
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
    setToken(state,{token}){
      return  token
    }

  },
};
