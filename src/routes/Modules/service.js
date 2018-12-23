import httpFetch from '../../utils/fetch';

export default {
  getModules() {
    return httpFetch.get(`/api/module/query`);
  },
  addModule(parmas) {
    return httpFetch.post(`/api/module/create`, parmas);
  },
  disableModule(params) {
    return httpFetch.put(`/api/module/update`, params);
  },
  addLanguage(parmas) {
    return httpFetch.post('/service/modules/addLang', parmas);
  },
  updateModule(parmas) {
    return httpFetch.put('/api/module/update', parmas);
  },
};
