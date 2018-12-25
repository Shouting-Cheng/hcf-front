import React from 'react';
import config from 'config';
import app from '../index';
//import configureStore from 'stores'

const selectorData = {
  currency: {
    url: `${config.baseUrl}/api/company/standard/currency/getAll`,
    label: record =>
      `${record.currency}${
      app.getState().languages.local === 'zh_cn'
          ? `-${record.currencyName}`
          : ''
      }`,
    key: 'currency',
    offlineSearchMode: true,
  },
  supplier: {
    url: `${config.baseUrl}/api/suppliers`,
    label: record => record.name,
    key: 'supplierOid',
  },
  agent: {
    label: record => `${record.fullName}-${record.employeeID}`,
    key: 'userOid',
    offlineSearchMode: true,
    url: `${config.baseUrl}/api/bill/proxy/query/my/principals`,
  },
  proxyForm: {
    url: `${config.baseUrl}/api/custom/forms/my/available`,
    label: record => record.formName,
    key: 'formOid',
    offlineSearchMode: true,
    dynamicUrl: true,
  },
  city: {
    url: `${config.baseUrl}/location-service/api/location/search`,
    label: record => {
      let result = record.description;
      return result;
    },
    key: 'code',
    searchKey: 'keyWord',
  },
  externalExpense: {
    url: `${config.baseUrl}/api/expense/search/types`,
    label: 'name',
    key: 'id',
    offlineSearchMode: true,
    listKey: 'expenseTypes',
  },
  expense_type_category: {
    url: `${config.baseUrl}/api/expense/types/category`,
    label: 'name',
    key: 'expenseTypeCategoryOid',
  },
  setOfBooksByTenant: {
    url: `${config.baseUrl}/api/setOfBooks/by/tenant`,
    label: 'setOfBooksName',
    key: 'id',
  },
};

export default selectorData;
