export default {
  namespace: 'cache',

  state: {
    request: {},
  },

  reducers: {
    setRequest(state, action) {
      let { request } = action.payload;
      return {
        ...state,
        request,
      };
    },
  },
};
