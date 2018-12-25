import React from 'react'
import config from 'config'
import { messages } from 'utils/utils'

const searcherData = {
  'proxy_form': { //参数customFormType：1001 申请单 1002 报销单
    title: messages('searcher.data.agency.document'), //选择代理单据
    url: `${config.baseUrl}/api/billProxyRule/proxy/forms/audit/search`,
    key: 'formOid'
  },
  'proxy_form_admin': { //参数customFormType：1001 申请单 1002 报销单
    title: messages('searcher.data.agency.document'), //选择代理单据
    url: `${config.baseUrl}/api/custom/forms/proxy`,
    key: 'formOid'
  },
  'corporation_entity': {
    title: messages('searcher.data.corporation.entity'), //选择法人实体
    url: `${config.baseUrl}/api/all/company/receipted/invoices`,
    key: 'companyReceiptedOid'
  },
  'department_role': {
    title: messages('common.please.select'),
    url: `${config.baseUrl}/api/departmentposition`,
    key: 'positionCode'
  },
  'currency': { //参数 companyOid
    title: messages('common.please.select'),
    url: `${config.baseUrl}/api/get/exchange/rate`,
    key: 'currencyCode'
  },
};

export default searcherData;
