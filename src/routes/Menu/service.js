import httpFetch from '../../utils/fetch';

export default {
  getMenus() {
    return httpFetch.get(`/auth/api/menu/query`);
  },
  addMenu(parmas) {
    return httpFetch.post(`/auth/api/menu/create`, parmas);
  },
  removeMenu(id) {
    return httpFetch.delete(`/auth/api/menu/delete/` + id);
  },
  updateMenu(params) {
    return httpFetch.put(`/auth/api/menu/update`, params);
  },
  getLanguageKeys(local) {
    return httpFetch.get('/auth/api/frontKey/query/keyword?lang=' + local, {page: 0, size: 99999});
  },
  addLanguage(parmas) {
    return httpFetch.post('/service/modules/addLang', parmas);
  },
  edit(parmas) {
    return httpFetch.post('/service/component/update', parmas);
  },
};
