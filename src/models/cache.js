export default {
  namespace: 'cache',

  state: {
    request: {},
    financeAudit: {},
    approveRequest: {},
  },

  reducers: {
    setRequest(state, action) {
      let { request } = action.payload;
      return {
        ...state,
        request,
      };
    },
    setApproveRequest(state, action) {
      let { approveRequest } = action.payload;
      return { ...state, approveRequest };
    },

    setFinanceAudit(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
