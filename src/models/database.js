import { queryFakeList } from '../services/api';

export default {
  namespace: 'database',

  state: {
    list: [],
  },

  reducers: {
    queryList(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    }
  },
};
