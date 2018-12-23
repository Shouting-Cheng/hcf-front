import httpFetch from '../../utils/fetch';

export default {
  getMenus() {
    return httpFetch.get(`/api/userRole/query/user/menuAndButtonList`);
  },
  getMenusByRoleId(roleId) {
    return httpFetch.get(`/api/roleMenu/query/menuIds/${roleId}`);
  },
  addRole(parmas) {
    return httpFetch.post(`/api/role/create`, parmas);
  },
  updateRole(parmas) {
    return httpFetch.put(`/api/role/update`, parmas);
  },
  assignMenus(params) {
    return httpFetch.post(`/api/roleMenu/assign/menu`, params);
  },
  removeMenu(id) {
    return httpFetch.delete(`/api/menu/delete/` + id);
  },
  disableRole(params) {
    return httpFetch.put(`/api/role/update`, params);
  },
  addLanguage(parmas) {
    return httpFetch.post('/service/modules/addLang', parmas);
  },
  edit(parmas) {
    return httpFetch.post('/service/component/update', parmas);
  },
};
