import httpFetch from '../../utils/fetch';

export default {
  getModules() {
    return httpFetch.get(`/auth/api/module/query`);
  },
  getInterfaceListByModuleId(moduleId) {
    return httpFetch.get(`/auth/api/interface/queryAll?moduleId=` + moduleId);
  },
  getInterfaceById(id) {
    return httpFetch.get('/auth/api/interface/query/' + id);
  },
  getInterfaceByKeyword(keyword) {
    return httpFetch.get('/auth/api/interface/query/keyword?keyword=' + keyword);
  },
  add(parmas) {
    return httpFetch.post('/auth/api/interface/create', parmas);
  },
  update(parmas) {
    return httpFetch.put('/auth/api/interface/update', parmas);
  },
  delete(id) {
     return httpFetch.delete('/auth/api/interface/delete/' + id);
  },
  addRequest(parmas) {
    return httpFetch.post('/auth/api/interfaceRequest/create', parmas);
  },
  updateRequest(parmas) {
    return httpFetch.put('/auth/api/interfaceRequest/update', parmas);
  },
  deleteRequest(id) {
    return httpFetch.delete(`/auth/api/interfaceRequest/delete/${id}`);
  },
  getRequestList(interfaceId) {
    return httpFetch.get(
      '/auth/api/interfaceRequest/query?page=0&size=10&interfaceId=' + interfaceId
    );
  },
  addResponse(parmas) {
    return httpFetch.post('/auth/api/interfaceResponse/create', parmas);
  },
  addResponses(parmas) {
    return httpFetch.post('/auth/api/interfaceResponse/batch/saveOrUpdate', parmas);
  },
  updateResponse(parmas) {
    return httpFetch.put('/auth/api/interfaceResponse/update', parmas);
  },
  deleteResponse(id) {
    return httpFetch.delete(`/auth/api/interfaceResponse/delete/${id}`);
  },
  getResponseList(interfaceId) {
    return httpFetch.get(
      '/auth/api/interfaceResponse/query?isEnabled=true&page=0&size=10&interfaceId=' + interfaceId
    );
  },
};
