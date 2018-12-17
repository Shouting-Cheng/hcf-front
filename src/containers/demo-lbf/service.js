
import httpFetch from 'share/httpFetch'
import config from 'config'

export default {
  //获取数据
  getParamsDataList(params) {
     const url = `${config.authUrl}/api/data/auth/table/properties/query`;
     return httpFetch.get(url,params);
  },

  //删除数据
  delParamsData(curId) {
     const url = `${config.authUrl}/api/data/auth/table/properties/${curId}`;
     return httpFetch.delete(url);
  },

  //新增数据
  addParamsData(params) {
     const url = `${config.authUrl}/api/data/auth/table/properties`;
     return httpFetch.post(url,params);
  },

  //编辑数据
  editParamsData(params) {
     const url = `${config.authUrl}/api/data/auth/table/properties`;
     return httpFetch.put(url,params);
  }
}
