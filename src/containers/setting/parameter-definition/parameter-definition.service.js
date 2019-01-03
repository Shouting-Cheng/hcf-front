import config from 'config';
import httpFetch from 'share/httpFetch';

export default {

  //条件查询参数数据
  getParamByModuleCode(params){
    return httpFetch.get(`${config.baseUrl}/api/parameter/by/moduleCode`,params)
  },

  //获取租户下启用的·模块
  getModule(){
    return httpFetch.get(`${config.baseUrl}/api/parameter/module`)
  },

  //获取模块代码下参数值
  getParamValues(params){
    return httpFetch.get(`${config.baseUrl}/api/parameter/values/by/parameterValueType`,params)
  },

  //新建参数
  newParameter(params){
    return httpFetch.post(`${config.baseUrl}/api/parameter/setting`,params)
  }
}
