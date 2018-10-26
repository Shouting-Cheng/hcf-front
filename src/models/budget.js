export default {
  namespace: 'budget',

  state: {
    organization: {},
    organizationStrategyId: null
  },

  reducers: {
    setOrganization(state, action) {
      let { organization } = action;
      return {
        ...state,
        organization,
      };
    },
    setOrganizationStrategyId(state, action) {
      let { organizationStrategyId } = action;
      return organizationStrategyId
    }
  },
};
