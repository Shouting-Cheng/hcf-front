import httpFetch from '../../utils/fetch';

export default {
  getModules() {
    return httpFetch.get(`/api/module/query`);
  },
  getInterfaceListByModuleId(moduleId) {
    return httpFetch.get(`/api/interface/queryAll?moduleId=` + moduleId);
  },
  getInterfaceById(id) {
    return httpFetch.get('/api/interface/query/' + id);
  },
  getInterfaceByKeyword(keyword) {
    return httpFetch.get('/api/interface/query/keyword?keyword=' + keyword);
  },
  add(parmas) {
    return httpFetch.post('/api/interface/create', parmas);
  },
  update(parmas) {
    return httpFetch.put('/api/interface/update', parmas);
  },
  delete(id) {
    return httpFetch.delete('/api/interface/delete/' + id);
  },
  addRequest(parmas) {
    return httpFetch.post('/api/interfaceRequest/create', parmas);
  },
  updateRequest(parmas) {
    return httpFetch.put('/api/interfaceRequest/update', parmas);
  },
  deleteRequest(id) {
    return httpFetch.delete(`/api/interfaceRequest/delete/${id}`);
  },
  getRequestList(interfaceId) {
    return httpFetch.get(
      '/api/interfaceRequest/query?page=0&size=999&interfaceId=' + interfaceId
    );
  },
  addResponse(parmas) {
    return httpFetch.post('/api/interfaceResponse/create', parmas);
  },
  addResponses(parmas) {
    return httpFetch.post('/api/interfaceResponse/batch/saveOrUpdate', parmas);
  },
  updateResponse(parmas) {
    return httpFetch.put('/api/interfaceResponse/update', parmas);
  },
  deleteResponse(id) {
    return httpFetch.delete(`/api/interfaceResponse/delete/${id}`);
  },
  getResponseList(interfaceId) {
    return httpFetch.get(
      '/api/interfaceResponse/query?isEnabled=true&page=0&size=9999&interfaceId=' + interfaceId
    );
  },
};
