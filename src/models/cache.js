export default {
  namespace: 'cache',

  state: {
    request: {},
    financeAudit:{}
  },

  reducers: {
    setRequest(state, action) {
      let { request } = action.payload;
      return {
        ...state,
        request,
      };
    },

    setFinanceAudit(state, action){
      return {...state,...action.payload}
    }
  },
};
