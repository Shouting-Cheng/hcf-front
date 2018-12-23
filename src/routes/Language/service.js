import httpFetch from '../../utils/fetch';

export default {
  getModules() {
    return httpFetch.get('/api/modules/query');
  },
  addModule(parmas) {
    return httpFetch.post('/service/modules/add', parmas);
  },
  getLanguages() {
    return httpFetch.get('/api/language/query');
  },
  getFrontKey(lang, moduleId) {
    return httpFetch.get(
      '/api/frontKey/query/module/lang?lang=' + lang + '&moduleId=' + moduleId
    );
  },
  addFrontKeys(parmas) {
    return httpFetch.post('/api/frontKey/batch/create', parmas);
  },
  updateFrontKeys(parmas) {
    return httpFetch.post('/api/frontKey/batch/update', parmas);
  },
  addLanguage(parmas) {
    return httpFetch.post('/api/frontKey/create', parmas);
  },
  edit(parmas) {
    return httpFetch.put('/api/frontKey/update', parmas);
  },
  delete(id) {
    return httpFetch.delete('/api/frontKey/delete/' + id);
  },
};
