/**
 * Created by zhouli on 18/2/7
 * Email li.zhou@huilianyi.com
 */
import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';
import OrgService from 'containers/enterprise-manage/org-structure/org-structure.service';

export default {
  getSomething(params) {
    return new Promise((resolve, reject) => {
      httpFetch
        .get(config.baseUrl + 'url', params)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  //创建法人实体
  createLegalPerson(object) {
    // let object = {
    //   accountBank: "",//开户行
    //   address: "",//地址
    //   companyName: "",//名称
    //
    //   cardNumber: "",//银行卡号
    //   enable: "",//状态
    //   i18n: {},//包含开户行，地址，名称
    //
    //   setOfBooksId: "",//账套
    //   telephone: "",//电话
    //   taxpayerNumber: "",//税号
    //
    //   parentLegalEntityId: "",//上级法人
    //
    //   attachmentId: "",//发票二维码上传图片后的id
    // }
    return new Promise((resolve, reject) => {
      httpFetch
        .post(config.baseUrl + '/api/company/receipted/invoice', object)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },
  //更新法人实体
  updateLegalPerson(object) {
    return new Promise((resolve, reject) => {
      httpFetch
        .put(config.baseUrl + '/api/company/receipted/invoice', object)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },
  //只是查询法人实体详情，不应该包括法人下面的人的oid
  //陈良钦重构：去掉法人实体接口关联的人，已经有v3接口
  getLegalPersonDetail(oid) {
    return new Promise((resolve, reject) => {
      httpFetch
        .get(config.baseUrl + '/api/company/receipted/invoices/users/' + oid)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },
  //针对新集团是，查询法人下面的公司
  getLegalPersonCompanys(params) {
    // let params = {
    //   keyword:"",
    //   legalEntityId:"",
    //   page:"",
    //   size:"",
    // }
    return new Promise((resolve, reject) => {
      httpFetch
        .get(config.baseUrl + '/api/company/by/legalentity', params)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  //针对老集团，查询法人下面的人
  getLegalPersonPersons(params) {
    // let _params = {
    //   corporationOid:  params.corporationOid,
    //   page: params.page,
    //   size: params.size,
    // }
    return new Promise((resolve, reject) => {
      OrgService.searchPersonInDep(params)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  //导入员工到法人实体
  importPersonsToLegalPerson(companyReceiptedOid, userOids) {
    return new Promise((resolve, reject) => {
      httpFetch
        .post(
          config.baseUrl + '/api/company/receipted/invoice/associate/' + companyReceiptedOid,
          userOids
        )
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },
  //陈良钦接口重构了：参数直接放body里面
  //移动员工到法人实体
  movePersonsToLegalPerson(params) {
    // let params = {
    //   companyReceiptedOidFrom:"",
    //   companyReceiptedOidTo:"",
    //   userOids:"",
    //   selectMode:"",
    // }
    return new Promise((resolve, reject) => {
      httpFetch
        .put(config.baseUrl + '/api/company/receipted/invoice/move', params)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  // 获取法人实体列表
  // 陈良钦：重构关键字查询完成
  getLegalList(params) {
    return new Promise((resolve, reject) => {
      httpFetch
        .get(config.baseUrl + '/api/v2/my/company/receipted/invoices?isAll=true', params)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },
};
