
export default {
  namespace: 'database',

  state: {

  },

  reducers: {
    setData(state, { payload }) {
      // let params = { moduleName: "preview", objName: "searchForm", key: "", value: 4 };
      let params = payload;

      if (!params.moduleName || !params.objName || !params.key) return state;

      if (!state[params.moduleName]) {
        state[params.moduleName] = {};
      }
      if (!state[params.moduleName][params.objName]) {
        state[params.moduleName][params.objName] = {};
      }

      state[params.moduleName][params.objName][params.key] = params.value;

      return {
        ...state
      };
    }
  },
};
