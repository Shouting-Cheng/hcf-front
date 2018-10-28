export default {
  namespace: 'setting',

  state: {
    codingRuleObjectId: {},
    expenseTypeSetOfBooks: {},
    standardRulesGroup: '',
    expenseTypeRules: {}
  },

  reducers: {
    setExpenseTypeSetOfBooks(state, action) {
      return {
        ...state,
        expenseTypeSetOfBooks: action.payload
      };
    },
    setLanguageList(state, action) {
      let { languageList } = action.payload;
      return {
        ...state,
        languageList,
      };
    },
    setLanguageType(state, action) {
      let { languageType } = action.payload;
      return {
        ...state,
        languageType,
      };
    },
  },
};
