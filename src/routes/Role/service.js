import httpFetch from '../../utils/fetch';

export default {
  getMenus() {
    return httpFetch.get(`/auth/api/userRole/query/user/menuAndButtonList`);
  },
  getMenusByRoleId(roleId) {
    return httpFetch.get(`/auth/api/roleMenu/query/menuIds/${roleId}`);
  },
  addRole(parmas) {
    return httpFetch.post(`/auth/api/role/create`, parmas);
  },
  updateRole(parmas) {
    return httpFetch.put(`/auth/api/role/update`, parmas);
  },
  assignMenus(params) {
    return httpFetch.post(`/auth/api/roleMenu/assign/menu`, params);
  },
  removeMenu(id) {
    return httpFetch.delete(`/auth/api/menu/delete/` + id);
  },
  disableRole(params) {
    return httpFetch.put(`/auth/api/role/update`, params);
  },
  addLanguage(parmas) {
    return httpFetch.post('/service/modules/addLang', parmas);
  },
  edit(parmas) {
    return httpFetch.post('/service/component/update', parmas);
  },
};
