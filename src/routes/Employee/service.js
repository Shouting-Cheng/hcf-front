import httpFetch from '../../share/httpFetch';

export default {
  // getRoles(params) {
  //   return httpFetch.get(`/api/userRole/query/roles`, params);
  // },
  // assignRoles(params) {
  //   return httpFetch.post('/api/userRole/assign/role', params);
  // },
  // addMenu(parmas) {
  //   return httpFetch.post(`/api/menu/create`, parmas);
  // },
  // removeMenu(id) {
  //   return httpFetch.delete(`/api/menu/delete/` + id);
  // },
  // updateMenu(params) {
  //   return httpFetch.put(`/api/menu/update`, params);
  // },
  // addLanguage(parmas) {
  //   return httpFetch.post('/service/modules/addLang', parmas);
  // },
  // edit(parmas) {
  //   return httpFetch.post('/service/component/update', parmas);
  // },
  /**
   * 获取数据
   * @param {*} params
   */
  getRolesDistribute(params) {
    return httpFetch.get(`api/userRole/query/roles/dataAuthority`, params);
  },
  /**
   * 新增角色权限分配
   * @param {*} params
   */
  saveRolesAuthority(params) {
    return httpFetch.post(`/api/userRole/create`, params);
  },
  /**
   * 批量新增角色权限分配
   * @param {*} params
   */
  batchSaveRolesAuthority(params) {
    return httpFetch.post(`/api/userRole/batch/create`, params);
  },
  /**
   * 修改角色权限分配
   * @param {*} params
   */
  updateRolesAuthority(params) {
    return httpFetch.put(`/api/userRole/update`, params);
  },
  /**
   * 批量修改角色权限分配
   * @param {*} params
   */
  batchUpdateRolesAuthority(params) {
    return httpFetch.put(`/api/userRole/batch/update`, params);
  },
  /**
   * 删除角色权限
   * @param {*} id
   */
  deleteRolesAuthority(id) {
    return httpFetch.delete(`/api/userRole/delete/${id}`);
  },
  /**
   * 获取所有角色
   * @param {*}
   */
  getAllRoles() {
    return httpFetch.get(`/api/userRole/query/all/roles`);
  },
  /**
   * 获取所有数据权限
   * @param {*}
   */
  getDataAuthority() {
    return httpFetch.get(`/api/system/data/authority/query/all/data/authority`);
  },
};
