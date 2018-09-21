export default {
  namespace: 'languages',

  state: {
    languages: {},
    languageType: [],
    local: '',
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
    setLanguageType(state, action) {
      let { languageType } = action.payload;
      return {
        ...state,
        languageType,
      };
    },
  },
};
