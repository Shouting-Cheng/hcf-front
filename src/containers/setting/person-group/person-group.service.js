/**
 * Created by zhouli on 18/1/17
 * Email li.zhou@huilianyi.com
 * 人员规则组系列接口
 */
import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';

export default {
  //查询人员组列表
  getPersonGroupList(params) {
    // 参数对象
    // let params = {
    //   name:"page",
    //   page:"page",
    //   size:"page",
    // }
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.baseUrl + '/api/user/groups/search?', params)
        .then(function (res) {
          resolve({
            data: res.data,
            total: Number.parseInt(res.headers['x-total-count'])
          })
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //新增人员组信息
  createPersonGroup(params) {
    return new Promise(function (resolve, reject) {
      httpFetch.post(config.baseUrl + '/api/user/groups', params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },

  //修改人员组信息
  UpdatePersonGroup(params) {
    return new Promise(function (resolve, reject) {
      httpFetch.put(config.baseUrl + '/api/user/groups', params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //查询人员组详情与规则
  getPersonGroupDetail(oid) {
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.baseUrl + '/api/user/groups/' + oid + '?showDetail=true')
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //查询人员组下面的人员
  getPersonGroupPersons(userGroupOid,params) {
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.baseUrl + '/api/user/groups/user/' + userGroupOid ,params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err);
          reject(err);
        })
    })
  },
  //删除人员组的人
  deletePersonGroupPerson(params) {
    return new Promise(function (resolve, reject) {
      httpFetch.delete(config.baseUrl + '/api/user/groups/user/delete',params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //添加人员组的人
  addPersonGroupPerson(params) {
    return new Promise(function (resolve, reject) {
      httpFetch.post(config.baseUrl + '/api/user/groups/user/insert',params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },

  //删除人员组的规则
  deletePersonGroupRule(id,conditionSeq) {
    return new Promise(function (resolve, reject) {
      httpFetch.delete(config.baseUrl + '/api/user/groups/conditions/'+id +'?seq='+conditionSeq)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //新增人员组的规则
  createPersonGroupRule(id,pureCondition) {
    return new Promise(function (resolve, reject) {
      httpFetch.post(config.baseUrl + '/api/user/groups/conditions/'+id, pureCondition)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },

  //修改人员组的规则
  UpdatePersonGroupRule(id,pureCondition) {
    return new Promise(function (resolve, reject) {
      httpFetch.put(config.baseUrl + '/api/user/groups/conditions/'+id, pureCondition)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
}
