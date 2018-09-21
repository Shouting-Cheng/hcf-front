import httpFetch from '../../utils/fetch';

export default {
  getRoles(params) {
    return httpFetch.get(`/auth/api/userRole/query/roles`, params);
  },
  assignRoles(params) {
    return httpFetch.post('/auth/api/userRole/assign/role', params);
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
  addLanguage(parmas) {
    return httpFetch.post('/service/modules/addLang', parmas);
  },
  edit(parmas) {
    return httpFetch.post('/service/component/update', parmas);
  },
};
