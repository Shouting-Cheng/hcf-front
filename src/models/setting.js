export default {
  namespace: 'setting',

  state: {
    codingRuleObjectId: {},
    expenseTypeSetOfBooks: {},
    standardRulesGroup: '',
    expenseTypeRules: {},
    navTheme: "dark"
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
    setNavTheme(state, action) {
      let { navTheme } = action.payload;
      return {
        ...state,
        navTheme
      };
    }
  },
};
