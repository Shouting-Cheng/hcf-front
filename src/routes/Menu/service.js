import httpFetch from '../../utils/fetch';

export default {
  getMenus() {
    return httpFetch.get(`/api/menu/query?size=10000`);
  },
  addMenu(parmas) {
    return httpFetch.post(`/api/menu/create`, parmas);
  },
  removeMenu(id) {
    return httpFetch.delete(`/api/menu/delete/` + id);
  },
  updateMenu(params) {
    return httpFetch.put(`/api/menu/update`, params);
  },
  getLanguageKeys(local) {
    return httpFetch.get('/api/frontKey/query/keyword?lang=' + local, { page: 0, size: 99999 });
  },
  addLanguage(parmas) {
    return httpFetch.post('/service/modules/addLang', parmas);
  },
  edit(parmas) {
    return httpFetch.post('/service/component/update', parmas);
  },
};
