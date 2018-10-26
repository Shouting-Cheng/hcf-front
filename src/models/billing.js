export default {
  namespace: 'billing',

  state: {
    billingType: {},
    searchBilling:{}
  },

  reducers: {
    setBillingType(state, action) {
      let { billingType } = action;
      return {
        ...state,
        billingType
      };
    },
    setSearchBilling(state, action) {
      let { searchBilling } = action;
      return {
        ...state,
        searchBilling
      };
    },
  },
};
