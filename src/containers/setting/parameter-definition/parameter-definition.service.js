import config from 'config';
import httpFetch from 'share/httpFetch';

export default {

  //条件查询参数数据
  getParamsByOptions(params){
    return httpFetch.get(`${config.baseUrl}/api/parameter/by/moduleCode`,params)
  }
}
