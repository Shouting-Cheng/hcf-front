import httpFetch from '../../utils/fetch';

export default {
  getModules() {
    return httpFetch.get(`/auth/api/module/query`);
  },
  addModule(parmas) {
    return httpFetch.post(`/auth/api/module/create`, parmas);
  },
  disableModule(params) {
    return httpFetch.put(`/auth/api/module/update`, params);
  },
  addLanguage(parmas) {
    return httpFetch.post('/service/modules/addLang', parmas);
  },
  updateModule(parmas) {
    return httpFetch.put('/auth/api/module/update', parmas);
  },
};
