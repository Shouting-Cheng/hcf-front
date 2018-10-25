export default {
  namespace: 'budget',

  state: {
    organization: {},
  },

  reducers: {
    setOrganization(state, action) {
      let { organization } = action;
      return {
        ...state,
        organization,
      };
    },
  },
};
