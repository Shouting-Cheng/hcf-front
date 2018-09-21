import httpFetch from '../../utils/fetch';

export default {
  getModules() {
    return httpFetch.get('/auth/api/modules/query');
  },
  addModule(parmas) {
    return httpFetch.post('/service/modules/add', parmas);
  },
  getLanguages() {
    return httpFetch.get('/auth/api/language/query');
  },
  getFrontKey(lang, moduleId) {
    return httpFetch.get(
      '/auth/api/frontKey/query/module/lang?lang=' + lang + '&moduleId=' + moduleId
    );
  },
  addFrontKeys(parmas) {
    return httpFetch.post('/auth/api/frontKey/batch/create', parmas);
  },
  updateFrontKeys(parmas) {
    return httpFetch.post('/auth/api/frontKey/batch/update', parmas);
  },
  addLanguage(parmas) {
    return httpFetch.post('/auth/api/frontKey/create', parmas);
  },
  edit(parmas) {
    return httpFetch.post('/service/component/update', parmas);
  },
  delete(id) {
    return httpFetch.delete('/auth/api/frontKey/delete/' + id);
  },
};
