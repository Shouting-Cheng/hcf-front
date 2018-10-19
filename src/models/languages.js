export default {
  namespace: 'languages',

  state: {
    languages: {},
    languageType: [],
    local: '',
    languageList: []
  },

  reducers: {
    selectLanguage(state, action) {
      let { local, languages } = action.payload;
      return {
        ...state,
        languages,
        local,
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
