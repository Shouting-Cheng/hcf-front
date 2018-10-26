/**
 * Created by zhouli on 18/3/27
 * Email li.zhou@huilianyi.com
 */
import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';

export default {
  //获取公司安全设置
  getCompanySecuritySetting(companyOID){
    return new Promise( (resolve, reject) => {
      httpFetch.get(config.baseUrl + '/api/refactor/companies/' + companyOID)
        .then( (res) =>{
          resolve(res)
        })
        .catch( (err) =>{
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  //更新公司安全设置
  updateCompanySecuritySetting(company){
    return new Promise( (resolve, reject) => {
      httpFetch.put(config.baseUrl + '/api/refactor/companies' , company)
        .then( (res) =>{
          resolve(res)
        })
        .catch( (err) =>{
          errorMessage(err.response);
          reject(err);
        })
    })
  },

  //获取企业密钥
  getClientInfo(){
    return new Promise( (resolve, reject) => {
      httpFetch.get(config.baseUrl + '/api/company/my/clientInfo')
        .then( (res) =>{
          resolve(res)
        })
        .catch( (err) =>{
          errorMessage(err.response);
          reject(err);
        })
    })
  },
}
