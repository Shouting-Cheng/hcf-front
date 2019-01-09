import React from 'react'
import config from 'config'
import moment from 'moment'
import constants from 'share/constants'
import { messages } from "utils/utils";
import { Badge, Popover, Avatar, Tooltip } from 'antd';

const chooserData = {
  'user': {
    title: messages("chooser.data.selectPerson"),//选择人员
    url: config.baseUrl + '/api/users/v3/search',
    searchForm: [
      {
        type: 'input', id: 'keyword',
        label: messages("chooser.data.employeeID.fullName.mobile.email")//员工工号、姓名、手机号、邮箱
      },
    ],
    columns: [
      {
        title: messages("chooser.data.employeeID"),//工号
        dataIndex: 'employeeId', width: '10%'
      },
      {
        title: messages("chooser.data.fullName"),//姓名
        dataIndex: 'fullName', width: '15%'
      },
      {
        title: messages("chooser.data.mobile"),//手机号
        dataIndex: 'mobile', width: '20%'
      },
      {
        title: messages('chooser.data.email'), //邮箱
        dataIndex: 'email', width: '25%'
      },
      {
        title: messages("chooser.data.dep"),//部门名称
        dataIndex: 'departmentName', width: '15%', render: value => value || '-'
      },
      {
        title: messages("chooser.data.duty"),//职务
        dataIndex: 'title', width: '15%', render: value => value || '-'
      },
    ],
    key: 'userOid'
  },
  'reportUser': {
    title: messages("chooser.data.selectPerson"),//选择人员
    url: config.baseUrl + '/api/users/v3/search',
    searchForm: [
      {
        type: 'input', id: 'keyword',
        label: messages("chooser.data.employeeID.fullName.mobile.email")//员工工号、姓名、手机号、邮箱
      },
    ],
    columns: [
      {
        title: messages("chooser.data.employeeID"),//工号
        dataIndex: 'employeeID', width: '10%'
      },
      {
        title: messages("chooser.data.fullName"),//姓名
        dataIndex: 'fullName', width: '15%'
      },
      {
        title: messages("chooser.data.mobile"),//手机号
        dataIndex: 'mobile', width: '20%'
      },
      {
        title: messages('chooser.data.email'), //邮箱
        dataIndex: 'email', width: '25%'
      },
      {
        title: messages("chooser.data.dep"),//部门名称
        dataIndex: 'departmentName', width: '15%', render: value => value || '-'
      },
      {
        title: messages("chooser.data.duty"),//职务
        dataIndex: 'title', width: '15%', render: value => value || '-'
      },
    ],
    key: 'id'
  },
  'contract_user': {
    title: '选择人员',
    url: `${config.baseUrl}/api/select/user/by/name/or/code/and/company`,
    searchForm: [
      { type: 'input', id: 'keyword', label: '员工工号、姓名' }
    ],
    columns: [
      { title: '工号', dataIndex: 'employeeID', width: '25%' },
      { title: '姓名', dataIndex: 'fullName', width: '25%' },
      { title: '部门名称', dataIndex: 'departmentName', width: '25%' },
      { title: '职务', dataIndex: 'title', width: '25%' },
    ],
    key: 'userOid'
  },
  'user_group': {
    title: '选择人员组',
    // url: `${config.baseUrl}/api/user/groups/company`,/*wjk 注释：该接口不支持搜所 20180712*/
    url: `${config.baseUrl}/api/user/groups/search?enabled=true`,
    searchForm: [
      { type: 'input', id: 'name', label: messages('chooser.data.name') }
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'code', width: '30%' },
      { title: messages('chooser.data.name'), dataIndex: 'name', width: '30%' },
      { title: messages('chooser.data.description'), dataIndex: 'comment', width: '40%' }
    ],
    key: 'id'
  },
  'budget_journal_structure': {
    title: messages('chooser.data.budget_journal_structure'), //选择预算日记账所需的预算表',
    url: `${config.budgetUrl}/api/budget/journal/type/assign/structures/queryStructure`,
    searchForm: [
      { type: 'input', id: 'structureCode', label: messages('chooser.data.code') },
      { type: 'input', id: 'structureName', label: messages('chooser.data.name') },
      {
        type: 'select',
        id: 'structureCodeFrom',
        label: messages('chooser.data.codeFrom'),
        options: [],
        getUrl: `${config.budgetUrl}/api/budget/structures/queryAll`,
        labelKey: 'structureCode',
        valueKey: 'structureCode',
        method: 'get',
        renderOption: (data) => `${data.structureCode}(${data.structureName})`
      },
      {
        type: 'select',
        id: 'structureCodeTo',
        label: messages('chooser.data.codeTo'),
        options: [],
        getUrl: `${config.budgetUrl}/api/budget/structures/queryAll`,
        labelKey: 'structureCode',
        valueKey: 'structureCode',
        method: 'get',
        renderOption: (data) => `${data.structureCode}(${data.structureName})`
      }
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'structureCode', width: '45%' },
      { title: messages('chooser.data.name'), dataIndex: 'structureName', width: '55%' }
    ],
    key: 'structureCode'
  },
  'budget_journal_item': {
    title: '选择预算日记账所需的预算项目',
    url: `${config.budgetUrl}/api/budget/journal/type/assign/items/queryItem`,
    searchForm: [
      { type: 'input', id: 'itemCode', label: messages('chooser.data.code') },
      { type: 'input', id: 'itemName', label: messages('chooser.data.name') },
      {
        type: 'select',
        id: 'itemCodeFrom',
        label: messages('chooser.data.codeFrom'),
        options: [],
        getUrl: `${config.budgetUrl}/api/budget/items/find/all`,
        labelKey: 'itemCode',
        valueKey: 'itemCode',
        method: 'get',
        renderOption: (data) => `${data.itemCode}(${data.itemName})`
      },
      {
        type: 'select',
        id: 'itemCodeTo',
        label: messages('chooser.data.codeTo'),
        options: [],
        getUrl: `${config.budgetUrl}/api/budget/items/find/all`,
        labelKey: 'itemCode',
        valueKey: 'itemCode',
        method: 'get',
        renderOption: (data) => `${data.itemCode}(${data.itemName})`
      }
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'itemCode', width: '45%' },
      { title: messages('chooser.data.name'), dataIndex: 'itemName', width: '55%' }
    ],
    key: 'itemCode'
  },
  'budget_journal_company': {
    title: messages('chooser.data.budget_journal_company'),
    url: `${config.budgetUrl}/api/budget/journal/type/assign/companies/filter`,
    searchForm: [
      { type: 'input', id: 'companyCode', label: messages('chooser.data.companyCode') },
      { type: 'input', id: 'companyName', label: messages('chooser.data.companyName') },
      { type: 'input', id: 'companyCodeFrom', label: messages('chooser.data.companyCode.from') },
      { type: 'input', id: 'companyCodeTo', label: messages('chooser.data.companyCode.to') },
    ],
    columns: [
      { title: messages('chooser.data.companyCode'), dataIndex: 'companyCode' },
      { title: messages('chooser.data.companyName'), dataIndex: 'name' },
      { title: messages('chooser.data.companyType'), dataIndex: 'companyTypeName' }
    ],
    key: 'id'
  },
  'budget_item': {
    title: messages('chooser.data.budget_item'),
    url: `${config.budgetUrl}/api/budget/items/query`,
    searchForm: [
      { type: 'input', id: 'itemCode', label: messages('chooser.data.code') },
      {
        type: 'select',
        id: 'itemCodeFrom',
        label: messages('chooser.data.codeFrom'),
        options: [],
        getUrl: `${config.budgetUrl}/api/budget/items/find/all?enabled=true&organizationId=:organizationId`,
        labelKey: 'itemCode',
        valueKey: 'itemCode',
        method: 'get',
        renderOption: (data) => `${data.itemCode}(${data.itemName})`
      },
      {
        type: 'select',
        id: 'itemCodeTo',
        label: messages('chooser.data.codeTo'),
        options: [],
        getUrl: `${config.budgetUrl}/api/budget/items/find/all?enabled=true&organizationId=:organizationId`,
        labelKey: 'itemCode',
        valueKey: 'itemCode',
        method: 'get',
        renderOption: (data) => `${data.itemCode}(${data.itemName})`
      }
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'itemCode', width: '45%' },
      { title: messages('chooser.data.name'), dataIndex: 'itemName', width: '55%' }
    ],
    key: 'id'
  },
  //账套下公司
  'available_company_setOfBooks': {
    title: messages("chooser.data.company"),//选择公司
    url: `${config.baseUrl}/api/refactor/companies/user/setOfBooks`,
    searchForm: [
      {
        type: 'input',
        id: 'name',
        label: messages("chooser.data.companyName")//公司名称
      }
    ],
    columns: [
      {
        title: messages("chooser.data.companyCode"),//公司代码
        dataIndex: 'companyCode'
      },
      {
        title: messages("chooser.data.companyName"),//公司名称
        dataIndex: 'name'
      },
      {
        title: messages("chooser.data.companyType"),//公司类型
        dataIndex: 'companyTypeName'
      }
    ],
    key: 'id'
  },
  //表单管理中权限设置下选择费用
  'available_expense': {
    title: messages("chooser.data.expense"),//选择费用
    url: `${config.baseUrl}/api/expense/type/by/setOfBooks`,
    searchForm: [
      //这部分搜索先隐藏，等后台接口好了再打开
      // {
      //   type: 'input',
      //   id: 'keyword',
      //   label: messages("chooser.data.expenseName")//费用名称
      // }
    ],
    columns: [
      {
        title: 'Icon',//费用Icon
        dataIndex: 'iconURL',
        render: value => <div><img style={{ width: 30, height: 30 }} src={value} /></div> || '-'
      },
      {
        title: messages("chooser.data.expenseName"),//费用名称
        dataIndex: 'name'
      }
    ],
    key: 'expenseTypeOid'
  },
  'available_company': {
    title: '选择公司',
    url: `${config.baseUrl}/api/company/available`,
    searchForm: [
      { type: 'input', id: 'keyword', label: "公司名称" }
    ],
    columns: [
      { title: "公司代码", dataIndex: 'companyCode' },
      { title: "公司名称", dataIndex: 'name' }
    ],
    key: 'id'
  },
  'budget_item_type': {
    title: messages('chooser.data.budget_item_type'),
    url: `${config.budgetUrl}/api/budget/itemType/query`,
    searchForm: [
      { type: 'input', id: 'itemTypeCode', label: messages('chooser.data.code') },
      { type: 'input', id: 'itemTypeName', label: messages('chooser.data.name') },
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'itemTypeCode' },
      { title: messages('chooser.data.name'), dataIndex: 'itemTypeName' },
    ],
    key: 'id'
  },
  'budget_item_budget': {
    title: messages('chooser.data.budget_item'),
    url: `${config.budgetUrl}/api/budget/items/query`,
    searchForm: [
      { type: 'input', id: 'itemCode', label: messages('chooser.data.code') }
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'itemCode', width: '45%' },
      { title: messages('chooser.data.name'), dataIndex: 'itemName', width: '55%' }
    ],
    key: 'id'
  },
  'budget_item_filter': {
    title: messages('chooser.data.budget_item_filter'),
    searchForm: [
      { type: 'input', id: 'itemCode', label: messages('chooser.data.code') },
      { type: 'input', id: 'itemName', label: messages('chooser.data.name') },
      {
        type: 'select',
        id: 'itemCodeFrom',
        label: messages('chooser.data.codeFrom'),
        options: [],
        renderOption: (data) => `${data.itemCode}(${data.itemName})`
      },
      {
        type: 'select',
        id: 'itemCodeTo',
        label: messages('chooser.data.codeTo'),
        options: [],
        renderOption: (data) => `${data.itemCode}(${data.itemName})`
      }
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'itemCode', width: '25%' },
      { title: messages('chooser.data.name'), dataIndex: 'itemName', width: '40%' },
      { title: messages('chooser.data.type'), dataIndex: 'itemTypeName', width: '35%' }
    ],
    key: 'id'
  },
  'select_dimension': {
    title: messages('chooser.data.select_dimension'),
    url: `${config.baseUrl}/api/cost/center/company`,
    searchForm: [
      { type: 'input', id: 'code', label: messages('chooser.data.code') },
      { type: 'input', id: 'name', label: messages('chooser.data.name') },
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'code', width: '25%' },
      { title: messages('chooser.data.name'), dataIndex: 'name', width: '25%' },
      { title: messages('chooser.data.companyLevel'), dataIndex: 'companyLevel', width: '25%' },
      { title: messages('chooser.data.systemLevel'), dataIndex: 'systemLevel', width: '25%' },
    ],
    key: 'id'
  },
  //核算工单类型定义使用
  'gl_select_dimension': {
    title: '选择维度',
    url: `${config.accountingUrl}/api/general/ledger/work/order/types/queryDimensionByRange`,
    searchForm: [
      { type: 'input', id: 'code', label: '维度代码' },
      { type: 'input', id: 'name', label: '维度名称' },
      {
        type: 'select', id: 'range', label: '查看', defaultValue: 'all',
        options: [
          { value: 'all', label: '全部' },
          { value: 'selected', label: '已选' },
          { value: 'notChoose', label: '未选' }],
        labelKey: 'label', valueKey: 'value'
      }
    ],
    columns: [
      { title: '维度代码', dataIndex: 'code' },
      { title: '维度名称', dataIndex: 'name' }
    ],
    key: 'id',
    listKey: 'records'
  },
  //核算工单行上公司
  'gl_line_company': {
    title: '选择公司',
    url: `${config.accountingUrl}/api/general/ledger/work/order/types/queryCompanyForWorkOrderLine`,
    searchForm: [
      { type: 'input', id: 'companyCode', label: '公司代码' },
      { type: 'input', id: 'companyName', label: '公司名称' },
      { type: 'input', id: 'companyCodeForm', label: '公司代码从' },
      { type: 'input', id: 'companyCodeTo', label: '公司代码至' }
    ],
    columns: [
      { title: '公司代码', dataIndex: 'companyCode' },
      { title: '公司名称', dataIndex: 'name' },
      { title: '公司类型', dataIndex: 'companyTypeName' }
    ],
    key: 'id'
  },
  //核算工单行上科目
  'gl_line_account': {
    title: '选择科目',
    url: `${config.accountingUrl}/api/general/ledger/work/order/types/queryAccountForWorkOrderLine`,
    searchForm: [
      { type: 'input', id: 'code', label: '科目代码' },
      { type: 'input', id: 'name', label: '科目名称' },
      {
        type: 'select', id: 'type', label: '科目类型',
        options: [
          { value: 'ASSET', label: '资产类' },
          { value: 'LIABILITY', label: '负债类' },
          { value: 'OWNERS_EQUITY', label: '所有者权益类' },
          { value: 'PROFIT_AND_LOSS', label: '损益类' },
          { value: 'COST', label: '成本类' }
        ],
        valueKey: 'value', labelKey: 'label'
      },
    ],
    columns: [
      { title: '科目代码', dataIndex: 'accountCode' },
      { title: '科目名称', dataIndex: 'accountName' },
      { title: '科目类型', dataIndex: 'accountTypeName' }
    ],
    key: 'id',
    listKey: 'records'
  },
  //核算工单类型定义使用
  'gl_select_account': {
    title: '可用科目',
    url: `${config.accountingUrl}/api/general/ledger/work/order/types/queryAccountByRange`,
    searchForm: [
      { type: 'input', id: 'code', label: '科目代码' },
      { type: 'input', id: 'name', label: '科目名称' },
      {
        type: 'select', id: 'type', label: '科目类型',
        options: [
          { value: 'ASSET', label: '资产类' },
          { value: 'LIABILITY', label: '负债类' },
          { value: 'OWNERS_EQUITY', label: '所有者权益类' },
          { value: 'PROFIT_AND_LOSS', label: '损益类' },
          { value: 'COST', label: '成本类' }
        ],
        valueKey: 'value', labelKey: 'label'
      },
      {
        type: 'select', id: 'range', label: '查看', defaultValue: 'all',
        options: [
          { value: 'all', label: '全部' },
          { value: 'selected', label: '已选' },
          { value: 'notChoose', label: '未选' }],
        labelKey: 'label', valueKey: 'value'
      }
    ],
    columns: [
      { title: '科目代码', dataIndex: 'accountCode' },
      { title: '科目名称', dataIndex: 'accountName' },
      { title: '科目类型', dataIndex: 'accountTypeName' }
    ],
    key: 'id'
  },
  //核算工单类型定义使用
  'gl_distribution_company': {
    title: '批量分配公司',
    url: `${config.accountingUrl}/api/general/ledger/work/order/type/companies/filter`,
    searchForm: [
      { type: 'input', id: 'companyCode', label: '公司代码' },
      { type: 'input', id: 'companyName', label: '公司名称' },
      { type: 'input', id: 'companyCodeFrom', label: '公司代码从' },
      { type: 'input', id: 'companyCodeTo', label: '公司代码至' }
    ],
    columns: [
      { title: '公司代码', dataIndex: 'companyCode' },
      { title: '公司名称', dataIndex: 'name' },
      { title: '公司类型', dataIndex: 'companyCode' }
    ],
    key: 'id'
  },
  'budget_journal_type': {
    title: messages('budgetJournal.journalTypeId')/*"预算日记账类型"*/,
    url: `${config.budgetUrl}/api/budget/journals/journalType/selectByInput`,
    searchForm: [
      { type: 'input', id: 'journalTypeCode', label: messages('budgetJournal.journalTypeId.code')/*'预算日记账类型代码'*/, },
      { type: 'input', id: 'journalTypeName', label: messages('budgetJournal.journalTypeId.name')/*'预算日记账类型名称'*/, },
    ],
    columns: [
      { title: messages('budgetJournal.journalTypeId.code')/*'预算日记账类型代码'*/, dataIndex: 'journalTypeCode' },
      { title: messages('budgetJournal.journalTypeId.name')/*'预算日记账类型名称'*/, dataIndex: 'journalTypeName' },
    ],
    key: 'id'
  },
  'budget_versions': {
    title: messages('budgetVersion.version')/*"预算版本"*/,
    url: `${config.budgetUrl}/api/budget/versions/query`,
    searchForm: [
      { type: 'input', id: 'versionCode', label: messages('budgetVersion.versionCode')/*'预算版本代码'*/ },
      { type: 'input', id: 'versionName', label: messages('budgetVersion.versionName')/*'预算版本名称'*/ },
    ],
    columns: [
      { title: messages('budgetVersion.versionCode')/*'预算版本代码'*/, dataIndex: 'versionCode' },
      { title: messages('budgetVersion.versionName')/*'预算版本名称'*/, dataIndex: 'versionName' },
    ],
    key: 'id'
  },
  'budget_scenarios': {
    title: messages('budgetJournal.scenarios')/*"预算场景"*/,
    url: `${config.budgetUrl}/api/budget/scenarios/query`,
    searchForm: [
      { type: 'input', id: 'scenarioCode', label: messages('budget.scenarios.code')/*'预算场景代码'*/ },
      { type: 'input', id: 'scenarioName', label: messages('budget.scenarios.name')/*'预算场景名称'*/ },
    ],
    columns: [
      { title: messages('budget.scenarios.code')/*'预算场景代码'*/, dataIndex: 'scenarioCode' },
      { title: messages('budget.scenarios.name')/*'预算场景名称'*/, dataIndex: 'scenarioName' },
    ],
    key: 'id'
  },
  'budget_item_group': {
    title: messages('chooser.data.budget_item_group'),
    url: `${config.budgetUrl}/api/budget/groups/query`,
    searchForm: [
      { type: 'input', id: 'itemGroupCode', label: messages('chooser.data.code') },
      { type: 'input', id: 'itemGroupName', label: messages('chooser.data.name') }
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'itemGroupCode' },
      { title: messages('chooser.data.name'), dataIndex: 'itemGroupName' },
    ],
    key: 'id'
  },
  'currency': {
    title: messages('chooser.data.currency'),
    url: `${config.baseUrl}/api/currency/rate/list`,
    searchForm: [],
    columns: [
      { title: messages('chooser.data.currencyName'), dataIndex: 'currencyName' },
      { title: messages('chooser.data.code'), dataIndex: 'currencyCode' },
      { title: messages('chooser.data.exchangeRate'), dataIndex: 'rate' }
    ],
    key: 'currencyCode',
    listKey: "rows"
  },
  'company_structure': {
    title: messages('chooser.data.company'),
    url: `${config.budgetUrl}/api/budget/structure/assign/companies/filter`,
    searchForm: [
      { type: 'input', id: 'companyCode', label: messages('chooser.data.companyCode') },
      { type: 'input', id: 'companyName', label: messages('chooser.data.companyName') },
      { type: 'input', id: 'companyCodeFrom', label: messages('chooser.data.companyCode.from') },
      { type: 'input', id: 'companyCodeTo', label: messages('chooser.data.companyCode.to') }
    ],
    columns: [
      { title: messages('chooser.data.companyCode'), dataIndex: 'companyCode' },
      { title: messages('chooser.data.companyName'), dataIndex: 'name' },
      { title: messages('chooser.data.companyType'), dataIndex: 'companyTypeName' }
    ],
    key: 'id'
  },
  'auto_audit_add_company': {
    title: '添加公司',
    url: `${config.baseUrl}/api/company/by/term`,
    searchForm: [
      { type: 'input', id: 'companyCode', label: "公司代码" },
      { type: 'input', id: 'name', label: "公司名称" },
      {
        type: 'select',
        options: [],
        id: 'legalEntityId',
        label: messages('value.list.employee.legal.entity'),/*"法人实体"*/
        getUrl: `${config.baseUrl}/api/all/legalentitys`,
        labelKey: 'entityName',
        valueKey: 'id',
        method: 'get',
        renderOption: (option) => `${option.entityName}`,
      },
    ],
    columns: [
      { title: "公司代码", dataIndex: 'companyCode' },
      { title: "公司名称", dataIndex: 'name' },
      { title: "公司类型", dataIndex: 'companyTypeName' }
    ],
    key: 'id'
  },
  'company_item': {
    title: messages('chooser.data.company'),
    url: `${config.budgetUrl}/api/budget/item/companies/query/filter`,
    searchForm: [
      { type: 'input', id: 'companyCode', label: messages('chooser.data.companyCode') },
      { type: 'input', id: 'companyName', label: messages('chooser.data.companyName') },
      { type: 'input', id: 'companyCodeFrom', label: messages('chooser.data.companyCode.from') },
      { type: 'input', id: 'companyCodeTo', label: messages('chooser.data.companyCode.to') }
    ],
    columns: [
      { title: messages('chooser.data.companyCode'), dataIndex: 'companyCode' },
      { title: messages('chooser.data.companyName'), dataIndex: 'name' },
      { title: messages('chooser.data.companyType'), dataIndex: 'companyTypeName' }
    ],
    key: 'id'
  },
  'company_group': {
    title: messages('chooser.data.company_group'),
    url: `${config.baseUrl}/api/company/group/query/section/dto`,
    searchForm: [
      { type: 'input', id: 'companyGroupCode', label: messages('chooser.data.code') },
      { type: 'input', id: 'companyGroupName', label: messages('chooser.data.name') },
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'companyGroupCode' },
      { title: messages('chooser.data.name'), dataIndex: 'companyGroupName' }
    ],
    key: 'id'
  },
  'deptCode': {
    title: messages("chooser.data.dep.title"),//部门
    url: `${config.baseUrl}/api/DepartmentGroup/selectDept/enabled`,
    searchForm: [
      {
        type: 'input',
        id: 'deptCode',
        label: messages("chooser.data.dep.num"),//部门编码
        defaultValue: ''
      },
      {
        type: 'input',
        id: 'name',
        label: messages("chooser.data.dep"),//部门名称
        defaultValue: ''
      },
    ],
    columns: [
      {
        title: messages("chooser.data.dep.num"),//部门编码
        dataIndex: 'departmentCode',
        render: value => {
          return <Popover placement="topLeft" content={value}>{value}</Popover>
        }
      },
      {
        title: messages("chooser.data.dep"),//部门名称
        dataIndex: 'name',
        render: (value, record) => {
          //之前洪阳林这么加了一句：record.name = record.path && React.Component.prototype.checkFunctionProfiles('department.full.path.disabled', [undefined, false]) ? 。。。。。
          //我实在看不懂，我就先去掉 record.name = record.path，解决部门列表选择bug
          return (
            React.Component.prototype.checkFunctionProfiles('department.full.path.disabled', [undefined, false])
              ?
              <Popover
                placement="topLeft" content={record.path}>{record.path}
              </Popover>
              :
              <Popover
                placement="topLeft" content={record.name}>{record.name}
              </Popover>
          )
        }
      }

    ],
    key: 'deptId'
  },
  'department': {
    title: messages("chooser.data.dep.title"),//部门
    url: `${config.baseUrl}/api/DepartmentGroup/selectDept/enabled`,
    searchForm: [
      {
        type: 'input',
        id: 'departmentCode',
        label: messages("chooser.data.dep.num"),//部门编码
        defaultValue: ''
      },
      {
        type: 'input',
        id: 'name',
        label: messages("chooser.data.dep"),//部门名称
        defaultValue: ''
      },
    ],
    columns: [
      {
        title: messages("chooser.data.dep.num"),//部门编码
        dataIndex: 'departmentCode',
        render: value => {
          return <Popover placement="topLeft" content={value}>{value}</Popover>
        }
      },
      {
        title: messages("chooser.data.dep"),//部门名称
        dataIndex: 'name',
        render: (value, record) => {
          //之前洪阳林这么加了一句：record.name = record.path && React.Component.prototype.checkFunctionProfiles('department.full.path.disabled', [undefined, false]) ? 。。。。。
          //我实在看不懂，我就先去掉 record.name = record.path，解决部门列表选择bug
          return (
            React.Component.prototype.checkFunctionProfiles('department.full.path.disabled', [undefined, false])
              ?
              <Popover
                placement="topLeft" content={record.path}>{record.path}
              </Popover>
              :
              <Popover
                placement="topLeft" content={record.name}>{record.name}
              </Popover>
          )
        }
      }

    ],
    key: 'departmentOid'
  },
  'department_group': {
    title: messages('chooser.data.department_group'),
    url: `${config.baseUrl}/api/DepartmentGroup/selectDepartmentGroupByInput`,
    searchForm: [
      { type: 'input', id: 'deptGroupCode', label: messages('chooser.data.code'), defaultValue: '' },
      { type: 'input', id: 'description', label: messages('chooser.data.description'), defaultValue: '' },
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'deptGroupCode' },
      { title: messages('chooser.data.name'), dataIndex: 'description' }
    ],
    key: 'id'
  },
  'version_company': {
    title: messages('chooser.data.company'),
    url: `${config.budgetUrl}/api/budget/version/assign/companies/query/filter`,
    searchForm: [
      { type: 'input', id: 'code', label: messages('chooser.data.companyCode') },
      { type: 'input', id: 'name', label: messages('chooser.data.companyName') },
      { type: 'input', id: 'companyCodeFrom', label: messages('chooser.data.companyCode.form') },
      { type: 'input', id: 'companyCodeTo', label: messages('chooser.data.companyCode.to') }
    ],
    columns: [
      { title: messages('chooser.data.companyCode'), dataIndex: 'code' },
      { title: messages('chooser.data.companyName'), dataIndex: 'name' },
      { title: messages('chooser.data.description'), dataIndex: 'description' }
    ],
    key: 'id'
  },
  'company': {
    title: messages('chooser.data.company'/*选择公司*/),
    url: `${config.baseUrl}/api/company/by/condition`,
    searchForm: [
      { type: 'input', id: 'companyCode', label: messages('chooser.data.companyCode'/*公司代码*/) },
      { type: 'input', id: 'name', label: messages('chooser.data.companyName'/*公司名称*/) },
      { type: 'input', id: 'companyCodeFrom', label: messages('chooser.data.companyCode.from'/*公司代码从*/) },
      { type: 'input', id: 'companyCodeTo', label: messages('chooser.data.companyCode.to'/*公司代码至*/) }
    ],
    columns: [
      { title: messages('chooser.data.companyCode'/*公司代码*/), dataIndex: 'companyCode' },
      { title: messages('chooser.data.companyName'/*公司名称*/), dataIndex: 'name' },
      { title: messages('chooser.data.companyType'/*公司类型*/), dataIndex: 'companyTypeName' }
    ],
    key: 'id'
  },
  'company_budget': {
    title: messages('chooser.data.company'/*选择公司*/),
    url: `${config.baseUrl}/api/company/by/condition`,
    searchForm: [
      { type: 'input', id: 'companyCode', label: messages('chooser.data.companyCode'/*公司代码*/) },
      { type: 'input', id: 'name', label: messages('chooser.data.companyName'/*公司名称*/) }
    ],
    columns: [
      { title: messages('chooser.data.companyCode'/*公司代码*/), dataIndex: 'companyCode' },
      { title: messages('chooser.data.companyName'/*公司名称*/), dataIndex: 'name' }
    ],
    key: 'id'
  },
  'cost_center_item_by_id': {
    title: messages("chooser.data.costCenter"),//成本中心
    url: `${config.baseUrl}/api/costcenter/items`,
    searchForm: [{
      type: 'input',
      id: 'name',
      label: `${messages("chooser.data.costCenter.name")}/${messages("cost.center.detail.manager")}/${messages("chooser.data.costCenter.code")}`
    }],
    columns: [
      {
        title: messages("chooser.data.costCenter.code"),//成本中心代码
        dataIndex: 'code'
      },
      {
        title: messages("chooser.data.costCenter.name"),//成本中心名称
        dataIndex: 'name'
      },
      {
        title: messages("cost.center.detail.manager"),//经理人
        dataIndex: 'managerFullName'
      }
    ],
    key: 'id'
  },
  'cost_center_item': {
    title: messages("chooser.data.costCenter"),//成本中心
    url: `${config.baseUrl}/api/my/cost/center/items/`,
    //成本中心名称"成本中心项名称／经理／编号
    searchForm: [
      {
        type: 'input',
        id: 'name',
        label: `${messages("chooser.data.costCenter.name")}/${messages("cost.center.detail.manager")}/${messages("cost.center.detail.no")}`
      }
    ],
    columns: [
      {
        title: messages("chooser.data.costCenter.code"),//成本中心代码
        dataIndex: 'code'
      },
      {
        title: messages("chooser.data.costCenter.name"),//成本中心名称
        dataIndex: 'name'
      }

    ],
    key: 'costCenterItemOid'
  },
  'expense_cost_center_item': {  //费用分摊用成本中心
    title: messages("chooser.data.costCenter"),//成本中心
    url: `${config.baseUrl}/api/my/cost/center/items`,
    //成本中心名称"成本中心项名称／经理／编号
    searchForm: [
      {
        type: 'input',
        id: 'keyword',
        label: `${messages("chooser.data.costCenter.name")}/${messages("chooser.data.costCenter.code")}`
      }
    ],
    columns: [
      {
        title: messages("chooser.data.costCenter.code"),//成本中心代码
        dataIndex: 'code'
      },
      {
        title: messages("chooser.data.costCenter.name"),//成本中心名称
        dataIndex: 'name'
      }

    ],
    key: 'costCenterItemOid'
  },
  'cost_center': {
    title: messages("chooser.data.costCenter"),//成本中心
    url: `${config.baseUrl}/api/cost/center/items/search`,
    searchForm: [
      { type: 'input', id: 'costCenterItemName', label: messages("chooser.data.costCenter.name"), defaultValue: '' }
    ],
    columns: [
      {
        title: messages("chooser.data.costCenter.code"),//成本中心代码
        dataIndex: 'code'
      },
      {
        title: messages("chooser.data.costCenter.name"),//成本中心名称
        dataIndex: 'name'
      }

    ],
    key: 'id'
  },
  'journal_line_department': {
    title: messages("chooser.data.dep.title"),//选择部门
    url: `${config.budgetUrl}/api/budget/journals/selectDepartmentsByCompanyAndTenant`,
    searchForm: [
      {
        type: 'input',
        id: 'deptCode',
        label: messages("chooser.data.dep.code"),//部门代码
        defaultValue: ''
      },
      {
        type: 'input',
        id: 'deptName',
        label: messages("chooser.data.dep"),//部门名称
        defaultValue: ''
      },
    ],
    columns: [
      {
        title: messages("chooser.data.dep.code"),//部门代码
        dataIndex: 'departmentCode'
      },
      {
        title: messages("chooser.data.dep"),//部门名称
        dataIndex: 'name'
      }
    ],
    key: 'id'
  },
  'department_budget': {
    title: messages("chooser.data.dep.title"), //选择部门
    url: `${config.baseUrl}/api/DepartmentGroup/selectDept/enabled`,
    searchForm: [
      { type: 'input', id: 'departmentCode', label: messages('chooser.data.dep.num'), defaultValue: '' },
      { type: 'input', id: 'name', label: messages('chooser.data.dep'), defaultValue: '' },
    ],
    columns: [
      { title: messages('chooser.data.dep.num'), dataIndex: 'departmentCode' },
      { title: messages('chooser.data.dep'), dataIndex: 'name' }
    ],
    key: 'departmentId'
  },
  'cash_flow_item': {
    title: messages('chooser.data.cash_flow_item'),
    url: `${config.payUrl}/api/cash/flow/items/query`,
    searchForm: [
      { type: 'input', id: 'flowCode', label: messages('chooser.data.code'), defaultValue: '' },
      { type: 'input', id: 'description', label: messages('chooser.data.name'), defaultValue: '' },
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'flowCode' },
      { title: messages('chooser.data.name'), dataIndex: 'description' },
    ],
    key: 'id'
  },
  'cash_flow_item_no_save': {
    title: '现金流量项',
    url: `${config.payUrl}/api/cash/default/flowitems/queryNotSaveFlowItem`,
    searchForm: [
      { type: 'input', id: 'flowCode', label: '	现金流量项代码', defaultValue: '' },
      { type: 'input', id: 'description', label: '现金流量项名称', defaultValue: '' },
    ],
    columns: [
      { title: "现金流量项代码", dataIndex: 'flowCode' },
      { title: "现金流量项名称", dataIndex: 'description' },
    ],
    key: 'id'
  },
  'assign-transaction': {
    title: messages('chooser.data.assign-transaction'),
    url: `${config.payUrl}/api/cash/transaction/classes/query`,
    searchForm: [
      { type: 'input', id: 'setOfBookId', label: messages('chooser.data.setOfBooks'), defaultValue: '' },
      { type: 'input', id: 'classCode', label: messages('chooser.data.transaction.code') },
      { type: 'input', id: 'description', label: messages('chooser.data.cash.flow.item.description') },
    ],
    columns: [
      { title: messages('chooser.data.setOfBooks'), dataIndex: 'setOfBookId' },
      { title: messages('chooser.data.transaction.type'), dataIndex: "typeCode" },
      { title: messages('chooser.data.transaction.code'), dataIndex: "classCode" },
      { title: messages('chooser.data.cash.flow.item.description'), dataIndex: 'description' }
    ],
    key: 'id'
  },
  'journal_item': {
    title: messages('budget.balance.item')/*'预算项目'*/,
    url: `${config.budgetUrl}/api/budget/journals/selectItemsByJournalTypeAndCompany`,
    searchForm: [
      { type: 'input', id: 'itemCode', label: messages('budget.itemCode')/*"预算项目代码",*/, defaultValue: '' },
      { type: 'input', id: 'itemName', label: messages('budget.itemName')/*"预算项目名称"*/, defaultValue: '' },
    ],
    columns: [
      { title: messages('budget.itemCode')/*"预算项目代码",*/, dataIndex: 'itemCode' },
      { title: messages('budget.itemName')/*"预算项目名称"*/, dataIndex: "itemName" },
    ],
    key: 'id'
  },
  'user_budget': {
    title: messages('chooser.data.selectPerson'),
    url: `${config.baseUrl}/api/select/user/by/name/or/code`,
    searchForm: [
      { type: 'input', id: 'employeeID', label: messages('chooser.data.employeeID') },
      { type: 'input', id: 'fullName', label: messages('chooser.data.fullName') }
    ],
    columns: [
      { title: messages('chooser.data.employeeID'), dataIndex: 'employeeID', width: '25%' },
      { title: messages('chooser.data.fullName'), dataIndex: 'fullName', width: '75%' }
    ],
    key: 'id'
  },
  'budget_structure': {
    title: messages('chooser.data.budget_structure'),
    url: `${config.budgetUrl}/api/budget/structures/query`,
    searchForm: [
      { type: 'input', id: 'structureCode', label: messages('chooser.data.code'), defaultValue: '' },
      { type: 'input', id: 'structureName', label: messages('chooser.data.name'), defaultValue: '' },
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'structureCode' },
      { title: messages('chooser.data.name'), dataIndex: "structureName" },
    ],
    key: 'id'
  },
  'pre_payment_type': {
    title: messages('chooser.data.pre_payment_type'),
    url: `${config.prePaymentUrl}/api/cash/pay/requisition/types/query`,
    searchForm: [
      { type: 'input', id: 'typeCode', label: messages('chooser.data.code'), defaultValue: '' },
      { type: 'input', id: 'typeName', label: messages('chooser.data.name'), defaultValue: '' },
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'typeCode' },
      { title: messages('chooser.data.name'), dataIndex: "typeName" },

    ],
    key: 'id'
  },
  'bank_account': {
    title: messages('chooser.data.select.bank'),
    url: `${config.baseUrl}/api/cash/bank/user/defineds/query`,
    searchForm: [
      { type: 'input', id: 'keyword', label: messages('chooser.data.bankName'), defaultValue: '' },
    ],
    columns: [
      { title: messages('chooser.data.bankName'), dataIndex: 'bankName' },
      { title: messages('chooser.data.country'), dataIndex: "countryName" },
      { title: messages('chooser.data.city'), dataIndex: "cityName" },
      { title: messages('chooser.data.bank.address'), dataIndex: "address" },
    ],
    key: 'id'
  },
  'select_authorization_user': {
    title: messages('chooser.data.selectPerson'),
    url: `${config.baseUrl}/api/DepartmentGroup/get/users/by/department/and/company`,
    searchForm: [
      { type: 'input', id: 'companyId', label: messages('chooser.data.companyName'), defaultValue: '' },
      { type: 'input', id: 'departmentId', label: messages('chooser.data.dep'), defaultValue: '' },
      { type: 'input', id: 'userCode', label: messages('chooser.data.userCode'), defaultValue: '' },
      { type: 'input', id: 'userName', label: messages('chooser.data.fullName'), defaultValue: '' }
    ],
    columns: [
      { title: messages('chooser.data.userCode'), dataIndex: 'userCode' },
      { title: messages('chooser.data.fullName'), dataIndex: 'userName' }
    ],
    key: 'userId'
  },
  'year': {
    title: messages('chooser.data.year'),
    url: `${config.baseUrl}/api/periods/select/years/by/setOfBooksId`,
    searchForm: [],
    columns: [
      { title: messages('chooser.data.year'), dataIndex: 'year' },
    ],
    key: 'year',
    isValue: true
  },
  'period': {
    title: messages('chooser.data.period'),
    searchForm: [],
    url: `${config.baseUrl}/api/periods/query/open/periods/by/setOfBook/id`,
    columns: [
      { title: messages('chooser.data.period'), dataIndex: "periodName" },
    ],
    key: 'id'
  },
  'quarter': {
    title: messages('chooser.data.quarter'),
    searchForm: [],
    url: `${config.baseUrl}/api/custom/enumerations/template/by/type`,
    columns: [
      { title: messages('chooser.data.quarter'), dataIndex: 'messageKey' },
    ],
    key: 'id'
  },
  'select_supplier_employee': {
    title: '选择收款方',
    url: `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/getReceivablesByName`,
    searchForm: [{ type: 'input', id: 'name', label: '供应商或员工', defaultValue: '' }],
    columns: [
      { title: '代码', dataIndex: 'code' },
      { title: '名称', dataIndex: 'name' },
      {
        title: "类型", dataIndex: "isEmp", render: (value) => {
          return <span>{value ? "员工" : "供应商"}</span>
        }
      }
    ],
    key: "code"
  },
  'select_vendor': {
    title: '供应商',
    url: `${config.vendorUrl}/api/ven/info`,
    searchForm: [
      { type: 'input', id: 'venderCode', label: '供应商代码', defaultValue: '' },
      { type: 'input', id: 'venNickname', label: '供应商名称', defaultValue: '' }

    ],
    columns: [
      { title: '供应商代码', dataIndex: 'venderCode' },
      { title: '供应商名称', dataIndex: 'venNickname' },
      { title: "供应商类型", dataIndex: "venderTypeName" }
    ],
    key: "code"
  },
  "select_application_reimburse": {
    title: '选择申请单',
    url: `${config.baseUrl}/api/application/search/by/prepayment/type`,
    searchForm: [
      { label: "申请单编号", id: "businessCode", type: "input" },
      { label: '申请单类型', id: 'applicationType', type: 'input' }
    ],
    columns: [
      { title: "申请单号", dataIndex: 'businessCode' },
      { title: '申请单类型', dataIndex: 'applicationType' },
      {
        title: "提交时间", dataIndex: 'submittedDate', render: value => {
          return <span>{moment(value).format("YYYY-MM-DD")}</span>
        }
      },
      { title: "币种", dataIndex: 'currencyCode' },
      { title: "总金额", dataIndex: 'amount' },
      { title: "已关联金额", dataIndex: 'relatedAmount' },
      { title: "可关联金额", dataIndex: 'notAssociatedAmount' },
      { title: "备注", dataIndex: 'title' }
    ],
    key: 'id'
  },
  'section': {
    title: messages('chooser.data.section'),
    url: `${config.accountingUrl}/api/accounting/util/general/ledger/fields/segments/page`,
    searchForm: [
      { type: 'input', id: 'code', label: messages('chooser.data.code') },
      { type: 'input', id: 'description', label: messages('chooser.data.name') }
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'code' },
      { title: messages('chooser.data.name'), dataIndex: 'description' },
    ],
    key: 'code'
  },
  'contract_type': {
    title: messages('chooser.data.contract_type'),
    url: `${config.contractUrl}/api/contract/type/contract/type/by/company`,
    searchForm: [
      { type: 'input', id: 'contractTypeCode', label: messages('chooser.data.code') },
      { type: 'input', id: 'contractTypeName', label: messages('chooser.data.name') },
      { type: 'value_list', id: 'contractCategory', label: messages('chooser.data.contract.category'), options: [], valueListCode: 2202 }
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'contractTypeCode' },
      { title: messages('chooser.data.name'), dataIndex: 'contractTypeName' },
      { title: messages('chooser.data.contract.category'), dataIndex: 'contractCategoryName' },
    ],
    key: 'id'
  },
  'source_transactions_data': {
    title: messages('chooser.data.source_transactions_data'),
    url: `${config.accountingUrl}/api/accounting/util/general/ledger/fields/data/source`,
    searchForm: [],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'code' },
      { title: messages('chooser.data.name'), dataIndex: 'description' },
    ],
    key: 'code'
  },
  'accounting_scenarios': {
    title: '添加核算场景',
    url: `${config.accountingUrl}/api/generalLedgerSceneMapping/select/unassigned/scene`,
    searchForm: [
      { type: 'input', id: 'glSceneCode', label: messages('chooser.data.code') },
      { type: 'input', id: 'glSceneName', label: messages('chooser.data.name') }
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'glSceneCode' },
      { title: messages('chooser.data.name'), dataIndex: 'glSceneName' },
    ],
    key: 'id'
  },
  'requisition_type': {
    title: '关联表单类型',
    url: `${config.baseUrl}/api/custom/forms/company/my/available/all`,
    searchForm: [
      { type: 'input', id: 'formType', label: messages('chooser.data.form.type'), defaultValue: 107 },
      { type: 'input', id: 'sectionName', label: messages('chooser.data.name') }
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'sectionCode' },
      { title: messages('chooser.data.name'), dataIndex: 'sectionName' },
    ],
    key: 'id'
  },
  "select_application": {
    title: messages('chooser.data.select_application'),
    url: `${config.baseUrl}/api/applications/v3/search`,
    searchForm: [],
    columns: [
      { title: messages('chooser.data.submit.date'), dataIndex: 'createdDate' },
      { title: messages('chooser.data.reason'), dataIndex: 'title' },
      { title: messages('chooser.data.business.code'), dataIndex: 'businessCode' },
      { title: messages('chooser.data.total.amount'), dataIndex: 'totalAmount' }
    ],
    key: 'id'
  },
  'add_employee': {
    title: "按条件添加员工",
    url: `${config.baseUrl}/api/users/search/company/term`,
    searchForm: [
      { type: 'input', id: 'keyword', label: '姓名／工号' },
    ],
    columns: [
      { title: '工号', dataIndex: 'employeeID' },
      { title: '姓名', dataIndex: 'fullName' },
      { title: '法人实体', dataIndex: 'corporationName' },
      { title: '部门', dataIndex: 'department', render: value => value.name },
      { title: '职务', dataIndex: 'title', render: value => value || '-' },
      { title: '邮箱', dataIndex: 'email' },
    ],
    key: 'id'
  },
  //账套级来源事务
  'sob_sourceTransaction': {
    title: messages('chooser.data.sob_sourceTransaction'),
    url: `${config.accountingUrl}/api/company/by/condition`,
    searchForm: [
      { type: 'input', id: 'sourceTransactionCode', label: messages('chooser.data.code') },
      { type: 'input', id: 'description', label: messages('chooser.data.name') }
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'sourceTransactionCode' },
      { title: messages('chooser.data.name'), dataIndex: 'description' },
    ],
    key: 'id'
  },

  //系统级来源事务(未添加)
  'sys_sourceTransaction': {
    title: messages('chooser.data.sys_sourceTransaction'),
    url: `${config.accountingUrl}/api/general/source/transactions/all/codeValue`,
    searchForm: [
      { type: 'input', id: 'code', label: messages('chooser.data.code') },
      { type: 'input', id: 'name', label: messages('chooser.data.name') }
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'code' },
      { title: messages('chooser.data.name'), dataIndex: 'name' },
    ],
    key: 'code'
  },
  'sobLineModel': {
    title: messages('chooser.data.sobLineModel'),
    url: `${config.accountingUrl}/api/general/ledger/sob/journal/line/model/query/filter`,
    searchForm: [
      { type: 'input', id: 'journalLineModelCode', label: messages('chooser.data.code') },
      { type: 'input', id: 'description', label: messages('chooser.data.name') }
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'journalLineModelCode' },
      { title: messages('chooser.data.name'), dataIndex: 'description' },
    ],
    key: 'id'
  },
  // 人员类型
  'personTypeModel': {
    title: messages("chooser.data.personType"),//选择人员类型
    url: `${config.baseUrl}/api/custom/enumeration/system/by/type/condition`,
    searchForm: [
      {
        type: 'input',
        id: 'codeFrom',
        label: messages("chooser.data.codeFrom")//编码从
      },
      {
        type: 'input',
        id: 'codeTo',
        label: messages("chooser.data.codeTo")//编码至
      },
      {
        type: 'input',
        id: 'value',
        label: messages("chooser.data.code")//编码
      },
    ],
    columns: [
      {
        title: messages("chooser.data.code"),//编码
        dataIndex: 'value',
        width: '40%'
      },
      {
        title: messages("chooser.data.name"),//名称
        dataIndex: 'messageKey', width: '60%'
      },
    ],
    key: 'value'
  },
  // 人员职务
  'personDutyModel': {
    title: messages("chooser.data.personDuty"),//选择人员职务
    url: `${config.baseUrl}/api/custom/enumeration/system/by/type/condition`,
    searchForm: [
      {
        type: 'input',
        id: 'codeFrom',
        label: messages("chooser.data.codeFrom")//编码从
      },
      {
        type: 'input',
        id: 'codeTo',
        label: messages("chooser.data.codeTo")//编码至
      },
      {
        type: 'input',
        id: 'value',
        label: messages("chooser.data.code")//编码
      },
    ],
    columns: [
      {
        title: messages("chooser.data.code"),//编码
        dataIndex: 'value',
        width: '40%'
      },
      {
        title: messages("chooser.data.name"),//名称
        dataIndex: 'messageKey', width: '60%'
      },
    ],
    key: 'value'
  },
  // 人员级别
  'personRankModel': {
    title: messages("chooser.data.personLevel"),//选择人员级别
    url: `${config.baseUrl}/api/custom/enumeration/system/by/type/condition`,
    searchForm: [
      {
        type: 'input',
        id: 'codeFrom',
        label: messages("chooser.data.codeFrom")//编码从
      },
      {
        type: 'input',
        id: 'codeTo',
        label: messages("chooser.data.codeTo")//编码至
      },
      {
        type: 'input',
        id: 'value',
        label: messages("chooser.data.code")//编码
      },
    ],
    columns: [
      {
        title: messages("chooser.data.code"),//编码
        dataIndex: 'value',
        width: '40%'
      },
      {
        title: messages("chooser.data.name"),//名称
        dataIndex: 'messageKey',
        width: '60%'
      },
    ],
    key: 'value'
  },
  'accounting_elements': {
    title: messages('chooser.data.accounting_elements'),
    url: `${config.accountingUrl}/api/accounting/util/general/ledger/fields/account/elements/page`,
    searchForm: [
      { type: 'input', id: 'code', label: messages('chooser.data.code') },
      { type: 'input', id: 'description', label: messages('chooser.data.description') }
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'code' },
      { title: messages('chooser.data.name'), dataIndex: 'description' },
    ],
    key: 'code'
  },
  'deploy_company': {
    title: messages('chooser.data.distribute.company'/*分配公司*/),
    url: `${config.baseUrl}/api/company/deploy/enumeration`,
    searchForm: [
      { type: 'input', id: 'companyCode', label: messages('chooser.data.companyCode'/*公司代码*/) },
      { type: 'input', id: 'name', label: messages('chooser.data.companyName'/*公司名称*/) }
    ],
    columns: [
      { title: messages('chooser.data.companyCode'/*公司代码*/), dataIndex: 'companyCode' },
      { title: messages('chooser.data.companyName'/*公司名称*/), dataIndex: 'name' },
      { title: messages('chooser.data.companyType'/*公司类型*/), dataIndex: 'companyTypeName', render: value => value || '-' },
    ],
    key: 'companyOid'
  },
  'allotSetOfBookCompany': {
    title: messages('chooser.data.distribute.company'/*分配公司*/),
    url: `${config.baseUrl}/api/company/by/condition`,
    searchForm: [
      { type: 'input', id: 'name', label: messages('chooser.data.companyName'/*公司名称*/) },
      { type: 'input', id: 'companyCode', label: messages('chooser.data.companyCode'/*公司编码*/) }
    ],
    columns: [
      { title: messages('chooser.data.companyName'/*公司名称*/), dataIndex: 'name' },
      { title: messages('chooser.data.companyCode'/*公司代码*/), dataIndex: 'companyCode' },
      {
        title: messages('common.column.status'/*状态*/), dataIndex: 'enabled', render: enable => (
          <Badge status={enable ? 'success' : 'error'}
            text={enable ? messages("common.status.enable") : messages("common.status.disable")} />)
      },
    ],
    key: 'id'
  },
  'selectInvoiceType': {
    title: messages('itemMap.expenseType'),
    url: `${config.baseUrl}/api/company/integration/expense/types/and/name`,
    searchForm: [
      { type: 'input', id: 'name', label: messages('itemMap.expenseTypeName') },
    ],
    columns: [
      {
        title: messages('itemMap.icon'), dataIndex: 'iconURL',
        render: (value) => {
          return <img src={value} height="20" width="20" />
        }
      },
      { title: messages('itemMap.expenseTypeName'), dataIndex: 'name' },
      {
        title: messages('common.column.status'), dataIndex: 'enabled',
        render: isEnabled => (
          <Badge status={isEnabled ? 'success' : 'error'}
            text={isEnabled ? messages('common.status.enable') : messages('common.status.disable')} />
        )
      },
    ],
    key: 'id'
  },
  'accounting_journalField': {
    title: messages('chooser.data.accounting_journalField'),
    url: `${config.accountingUrl}/api/accounting/util/general/ledger/fields/account/page`,
    searchForm: [
      { type: 'input', id: 'code', label: messages('chooser.data.code') },
      { type: 'input', id: 'description', label: messages('chooser.data.name') }
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'code' },
      { title: messages('chooser.data.name'), dataIndex: 'description' },
    ],
    key: 'id'
  },
  'accounting_scene_elements_user': {
    title: messages('chooser.data.accounting_scene_elements_user'),
    url: `${config.accountingUrl}/api/account/general/ledger/scene/elements/query`,
    searchForm: [
      { type: 'input', id: 'input', label: `${messages('chooser.data.code')}/${messages('chooser.data.name')}` },
    ],
    columns: [
      { title: messages('chooser.data.accounting.elements.code'), dataIndex: 'accountElementCode' },
      { title: messages('chooser.data.accounting.elements.name'), dataIndex: 'accountElementName' },
      { title: messages('chooser.data.accounting.elements.property.code'), dataIndex: 'mappingGroupCode' },
      { title: messages('chooser.data.accounting.elements.property.name'), dataIndex: 'mappingGroupName' },
    ],
    key: 'id'
  },
  'accounting_scene_elements': {
    title: messages('chooser.data.accounting_scene_elements'),
    url: `${config.accountingUrl}/api/account/general/ledger/scene/elements/queryAll/page`,
    searchForm: [
      { type: 'input', id: 'code', label: messages('chooser.data.code') },
      { type: 'input', id: 'description', label: messages('chooser.data.name') },
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'code' },
      { title: messages('chooser.data.name'), dataIndex: 'description' },
    ],
    key: 'code'
  },
  'segment_map': {
    title: '选择科目',
    url: `${config.baseUrl}/api/accounts/query/accounts/setOfBooksId`,
    searchForm: [
      { type: 'input', id: 'accountCode', label: messages('chooser.data.code') },
      { type: 'input', id: 'accountName', label: messages('chooser.data.name') },
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'accountCode' },
      { title: messages('chooser.data.name'), dataIndex: 'accountName' },
    ],
    key: 'id'
  },
  'data-source-fields': {
    title: '根据来源事务代码获取来源事务数据结构下的明细字段',
    url: `${config.accountingUrl}/api/accounting/util/general/ledger/fields/data/source/fields`,
    searchForm: [
      { type: 'input', id: 'code', label: messages('chooser.data.code') },
      { type: 'input', id: 'description', label: messages('chooser.data.name') },
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'code' },
      { title: messages('chooser.data.name'), dataIndex: 'description' },
    ],
    key: 'code'
  },
  'data-source-fields_dataRules': {
    title: messages('data-source-fields_dataRules'),
    url: `${config.accountingUrl}/api/accounting/util/general/ledger/fields/data/source/fields`,
    searchForm: [
      { type: 'input', id: 'code', label: messages('chooser.data.code') },
      { type: 'input', id: 'description', label: messages('chooser.data.name') },
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'code' },
      { title: messages('chooser.data.name'), dataIndex: 'description' },
    ],
    key: 'code'
  },
  'vendor_type': {
    title: '供应商类型',
    url: `${config.vendorUrl}/api/ven/type/query`,
    searchForm: [
      { type: 'input', id: 'code', label: "供应商类型代码" },
      { type: 'input', id: 'name', label: "供应商类型名称" },
    ],
    columns: [
      { title: "供应商类型代码", dataIndex: 'vendorTypeCode' },
      { title: "供应商类型名称", dataIndex: 'name' },
    ],
    key: 'id'
  },
  'sqlAPI': {
    title: '取至API',
    url: `${config.accountingUrl}/api/accounting/util/general/ledger/fields/custom/methods`,
    searchForm: [
      { type: 'input', id: 'code', label: "代码" },
      { type: 'input', id: 'description', label: "名称" },
    ],
    columns: [
      { title: messages('chooser.data.code'), dataIndex: 'code' },
      { title: messages('chooser.data.name'), dataIndex: 'name' },
    ],
    key: 'code'
  },
  'participants': {
    title: messages('chooser.data.selectPerson'),
    url: `${config.baseUrl}/api/application/participantsList`,
    searchForm: [
      { type: 'input', id: 'keyword', label: messages('chooser.data.employeeID.fullName') }
    ],
    columns: [
      { title: messages('chooser.data.fullName'), dataIndex: 'fullName' },
      { title: messages('chooser.data.employeeID'), dataIndex: 'employeeID' },
      { title: messages('chooser.data.dep'), dataIndex: 'departmentName', render: value => value || '-' },
      { title: messages('chooser.data.duty'), dataIndex: 'title', render: value => value || '-' },
    ],
    key: 'id'
  },
  // 启用法人
  'corporation_entity': {
    title: messages('chooser.data.select.legal.entity'),
    url: `${config.baseUrl}/api/v2/my/company/receipted/invoices`,
    searchForm: [],
    columns: [
      { title: messages('chooser.data.legal.entity.name'), dataIndex: 'companyName' },
      { title: messages('chooser.data.bank'), dataIndex: 'accountBank' }
    ],
    key: 'companyReceiptedOid'
  },
  // 所有法人实体
  'corporation_entity_all': {
    title: messages('chooser.data.select.legal.entity'),
    url: `${config.baseUrl}/api/v2/all/company/receipted/invoices`,
    searchForm: [],
    columns: [
      {
        title: messages('chooser.data.legal.entity.name'), dataIndex: 'companyName', render: (value, record) => {
          return record.enable ? value : <span>{value}<span style={{ color: '#959595' }}>({messages('common.disabling')})</span></span>
        }
      },
      { title: messages('chooser.data.bank'), dataIndex: 'accountBank' }
    ],
    key: 'companyReceiptedOid'
  },
  'deploy_company_by_carousel': { //公告信息分配公司用
    title: messages('chooser.data.distribute.company'/*分配公司*/),
    url: `${config.baseUrl}/api/company/deploy/carousel`,
    searchForm: [
      { type: 'input', id: 'companyCode', label: messages('chooser.data.companyCode'/*公司代码*/) },
      { type: 'input', id: 'name', label: messages('chooser.data.companyName'/*公司名称*/) }
    ],
    columns: [
      { title: messages('chooser.data.companyCode'/*公司代码*/), dataIndex: 'companyCode' },
      { title: messages('chooser.data.companyName'/*公司名称*/), dataIndex: 'name' },
      { title: messages('chooser.data.companyType'/*公司类型*/), dataIndex: 'companyTypeName', render: value => value || '-' },
    ],
    key: 'companyOid'
  },

  'bank_card': {
    title: messages('chooser.data.bank_card'),
    url: `${config.baseUrl}/api/contact/bank/account/enable`,
    searchForm: [],
    columns: [
      { title: messages('chooser.data.fullName'), dataIndex: 'bankAccountName' },
      { title: messages('chooser.data.bankName'), dataIndex: 'bankName' },
      { title: messages('chooser.data.bank.card.num'), dataIndex: 'bankAccountNo' }
    ],
    key: 'contactBankAccountOid'
  },
  'booker': {
    title: messages('chooser.data.booker'),
    url: `${config.baseUrl}/api/travel/booker/get/bookers`,
    searchForm: [
      { type: 'input', id: 'name', label: messages('chooser.data.fullName') },
    ],
    columns: [
      { title: messages('chooser.data.fullName'), dataIndex: 'fullName' },
      { title: messages('chooser.data.employeeID'), dataIndex: 'employeeID' },
      { title: messages('chooser.data.dep'), dataIndex: 'departmentName', render: value => value || '-' },
      { title: messages('chooser.data.duty'), dataIndex: 'title', render: value => value || '-' },
    ],
    key: 'userOid'
  },
  'my_request': {
    title: messages('chooser.data.my.application')/*'我的申请单'*/,
    url: `${config.baseUrl}/api/applications/passed/search`,
    searchForm: [
      { type: 'input', id: 'keyword', label: messages('common.matter')/*事由*/ },
    ],
    columns: [
      {
        title: messages('my.contract.create.date')/*创建时间*/, dataIndex: 'createdDate', width: '15%',
        render: submittedDate => new Date(submittedDate).format('yyyy-MM-dd')
      },
      { title: messages('common.matter')/*事由*/, dataIndex: 'title', width: '30%' },
      { title: messages('bookingManagement.businessCode')/*'申请单号'*/, dataIndex: 'businessCode', width: '20%' },
      {
        title: messages('customField.base.amount')/*本币金额*/, dataIndex: 'totalAmount', width: '15%',
        render: (value, record) => {
          return `${record.currencyCode}${record.originCurrencyTotalAmount}`;
        }
      },
      {
        title: messages('chooser.data.my.relevantMemeber')/*'相关人员'*/, dataIndex: 'applicantName', width: '20%',
        render: (value, record) => {
          let applicationParticipants = [];
          record.applicationParticipants.map(item => {
            applicationParticipants.push(item.fullName)
          });
          applicationParticipants.indexOf(record.applicantName) && (applicationParticipants.push(record.applicantName));
          return applicationParticipants.join(',');
        }
      }
    ],
    key: 'applicationOid'
  },
  //这个包含新老集团的：老集团是法人实体，新集团是公司，但是后端返回的结构都是一样，前端统一按照公司处理
  //todo
  //后端还在做功能keyword关键字查询公司
  //目前返回的列表每一个对象只有两个字段，companyOid与companyName
  //后端还在重构添加companyCode,companyID等字段，如果法人实体没有这个字段，就返回null
  'all_company_with_legal_entity': {
    title: messages("chooser.data.company"),//选择公司
    url: `${config.baseUrl}/api/company/name/oid/by/tenant`,
    searchForm: [
      {
        type: 'input',
        id: 'keyword',
        label: messages("chooser.data.companyName")//公司名称
      }
    ],
    columns: [
      {
        title: messages("chooser.data.companyName"), //公司名称
        dataIndex: 'companyName'
      },
    ],
    key: 'companyOid'
  },
  //这个尽量使用all_company_with_legal_entity去代替，all_company，不要用这个了
  //如果发现all_company_with_legal_entity列表字段缺少，就叫后端立即开发
  //之后这个接口就删除了
  'all_company': {
    title: messages("chooser.data.tenant.company"),//选择集团下的所有公司
    url: `${config.baseUrl}/api/company/all`,
    searchForm: [],
    columns: [
      {
        title: messages("chooser.data.companyName"), //公司名称
        dataIndex: 'name'
      },
      {
        title: messages("chooser.data.baseCurrency"), //币种
        dataIndex: 'baseCurrency'
      }
    ],
    key: 'companyOid'
  },
  "company_bank_account": {
    title: messages('chooser.data.company_bank_account'),
    url: `${config.baseUrl}/api/companyBankAuth/get/own/info`,
    searchForm: [],
    columns: [
      { title: messages('chooser.data.account.name'), dataIndex: 'bankAccountName' },
      { title: messages('chooser.data.account.num'), dataIndex: 'bankAccountNumber' },
      { title: messages('chooser.data.bankName'), dataIndex: 'bankName' }
    ],
    key: 'companyBank.bankAccountNumber'
  },
  "enabled_company": {
    title: messages("chooser.data.tenant.company"),//选择集团下的所有公司
    url: `${config.baseUrl}/api/company/by/tenant`,
    searchForm: [],
    columns: [
      {
        title: messages("chooser.data.companyName"), //公司名称
        dataIndex: 'name'
      },
      {
        title: messages("chooser.data.baseCurrency"), //币种
        dataIndex: 'baseCurrency'
      }
    ],
    key: 'companyOid'
  },
  "payment_type": {
    title: messages('payment.batch.company.payWay')/*付款方式*/,
    url: `${config.payUrl}/api/cash/payment/method/query/lov`,
    searchForm: [],
    columns: [
      { title: messages('payment.batch.company.payWay')/*'付款方式'*/, dataIndex: 'description' },
      { title: messages('payment.batch.company.payCode')/*'付款代码'*/, dataIndex: 'paymentMethodCode' },
      {
        title: messages('payment.batch.company.payType')/*'付款类别'*/,
        dataIndex: 'paymentMethodCategory',
        render: text => constants.getTextByValue(text, 'paymentMethodCategory')
      },
    ],
    key: 'paymentMethodCode'
  },
  //获取自定义银行以及通用银行
  'select_bank': {
    title: messages("chooser.data.select.bank"),//选择银行
    url: `${config.baseUrl}/api/bank/infos/search`,
    searchForm: [
      {
        type: 'input',
        id: 'bankBranchName',
        label: messages("chooser.data.branchBankName")//支行名称
      },
      {
        type: 'input',
        id: 'bankCode',
        label: messages("chooser.data.bankCode")//银行代码
      },
      {
        type: 'input',
        id: 'openAccount',
        label: messages("chooser.data.bankAddress")//开户地
      },

      {
        type: 'input',
        id: 'countryCode',
        label: messages("chooser.data.countryCode")//国家编码
      },
      {
        type: 'input',
        id: 'cityCode',
        label: messages("chooser.data.cityCode")//城市编码
      },
      {
        type: 'input',
        id: 'swiftCode',
        label: messages("chooser.data.swiftCode")//swift编码
      },

      // 默认查询全部启用的（大多数情况）
      // 还有两个参数可以额外传
      // { type: 'input', id: 'enable', label: '启用状态' },可以查询启用与禁用
      // { type: 'input', id: 'isAll', label: '是否查询所有' },可以返回全部启用与禁用的
    ],
    columns: [
      {
        title: messages("chooser.data.branchBankName"),//支行名称
        dataIndex: 'bankBranchName',
        render: (value, record) => {
          return (<Popover placement="topLeft" content={record.bankBranchName}>{record.bankBranchName}</Popover>)
        }
      },
      {
        title: messages("chooser.data.bankName"),//银行名称
        dataIndex: 'bankName', width: '40%'
      },
      {
        title: messages("chooser.data.bankCode"),//银行代码
        dataIndex: 'bankCode', width: 130
      }
    ],
    key: 'bankCode'
  },
  'select_bank_supplier': {
    title: messages("chooser.data.select.bank"),//选择银行
    url: `${config.baseUrl}/api/bank/infos/search`,
    searchForm: [
      {
        type: 'input',
        id: 'bankBranchName',
        label: messages("chooser.data.branchBankName")//支行名称
      },
      {
        type: 'input',
        id: 'bankCode',
        label: messages("chooser.data.bankCode")//银行代码
      },
      {
        type: 'input',
        id: 'openAccount',
        label: messages("chooser.data.bankAddress")//开户地
      },
      // 默认查询全部启用的（大多数情况）
      // 还有两个参数可以额外传
      // { type: 'input', id: 'enable', label: '启用状态' },可以查询启用与禁用
      // { type: 'input', id: 'isAll', label: '是否查询所有' },可以返回全部启用与禁用的
    ],
    columns: [
      {
        title: messages("chooser.data.branchBankName"),//支行名称
        dataIndex: 'bankBranchName',
        render: (value, record) => {
          return (<Popover placement="topLeft" content={record.bankBranchName}>{record.bankBranchName}</Popover>)
        }
      },
      {
        title: messages("chooser.data.bankName"),//银行名称
        dataIndex: 'bankName', width: '40%'
      },
      {
        title: messages("chooser.data.bankCode"),//银行代码
        dataIndex: 'bankCode', width: 130
      }
    ],
    key: 'bankCode'
  },
  //科目表定义，添加子科目（未被添加到科目下的子科目）
  'subjectSelectorItem': {
    title: messages('subject.sub.subject')/*"子科目"*/,
    url: `${config.baseUrl}/api/accounts/hierarchy/child/query`,
    searchForm: [
      { type: 'input', id: 'accountCode', label: messages('subject.code')/*"科目代码"*/ },
      { type: 'input', id: 'accountName', label: messages('subject.name')/*"科目名称"*/ },
    ],
    columns: [
      { title: messages('subject.code')/*"科目代码"*/, dataIndex: 'accountCode' },
      { title: messages('subject.name')/*"科目名称"*/, dataIndex: 'accountName' },
      { title: messages('subject.type')/*"科目类型"*/, dataIndex: 'accountTypeName' },
    ],
    key: 'id'
  },
  'expense_report_invoice': {
    title: messages('chooser.data.my.select.expense')/*'选择费用'*/,
    url: `${config.baseUrl}/api/v2/invoices/currency`,
    searchForm: [],
    columns: [
      { title: messages('common.expense.type')/*"费用类型"*/, dataIndex: 'expenseTypeName' },
      { title: messages('common.date')/*"日期"*/, dataIndex: 'createdDate', render: createdDate => new Date(createdDate).format('yyyy-MM-dd') },
      { title: messages('common.currency')/*"币种"*/, dataIndex: 'invoiceCurrencyCode' },
      { title: messages('common.amount')/*"金额"*/, dataIndex: 'amount' },
      { title: messages('common.currency.rate')/*"汇率"*/, dataIndex: 'actualCurrencyRate' },
      { title: messages('common.base.currency.amount')/*"本位币金额"*/, dataIndex: 'baseAmount', render: React.Component.prototype.filterMoney },
      { title: messages('common.comment')/*"备注"*/, dataIndex: 'comment' }
    ],
    key: 'invoiceOid'
  },
  //预算用的新版货币接口
  'new_currency': {
    title: messages('chooser.data.currency'),
    url: `${config.baseUrl}/api/currency/rate/list`,
    searchForm: [],
    columns: [
      { title: messages('chooser.data.currencyName'), dataIndex: 'currencyName' },
      { title: messages('chooser.data.code'), dataIndex: 'currencyCode' },
      { title: messages('chooser.data.exchangeRate'), dataIndex: 'rate' }
    ],
    key: 'currencyRateOid',
    listKey: 'rows'
  },
  //预算余额方案用的货币接口
  'currency_budget': {
    title: messages('chooser.data.currency'),
    url: `${config.baseUrl}/api/currency/rate/list`,
    searchForm: [],
    columns: [
      { title: messages('chooser.data.currencyName'), dataIndex: 'currencyName' },
      { title: messages('chooser.data.code'), dataIndex: 'currencyCode' }
    ],
    key: 'currencyCode',
    listKey: 'rows'
  },
  //预算余额方案定义用的货币接口
  'base_currency': {
    title: messages('chooser.data.currency'),
    url: `${config.baseUrl}/api/currency/rate/list`,
    searchForm: [],
    columns: [
      { title: messages('chooser.data.currencyName'), dataIndex: 'currencyName' },
      { title: messages('chooser.data.code'), dataIndex: 'currencyCode' },
      { title: messages('chooser.data.exchangeRate'), dataIndex: 'rate' }
    ],
    key: 'currencyCode',
    listKey: 'rows'
  },
  /*"批量分配公司"*/
  'batch-allot-company': {
    title: messages('budget.item.batchCompany'),
    url: `${config.baseUrl}/api/company/deploy/levels`,
    searchForm: [
      {
        type: 'select',
        options: [],
        id: 'companyLevelId',
        label: messages('company.maintain.company.companyLevelName'),/*"公司级别"*/
        getUrl: `${config.baseUrl}/api/companyLevel/selectByTenantId`,
        labelKey: 'description',
        valueKey: 'id',
        method: 'get',
        renderOption: (option) => `${option.description}`,
      },
      {
        type: 'select',
        options: [],
        id: 'legalEntityId',
        label: messages('value.list.employee.legal.entity'),/*"法人实体"*/
        getUrl: `${config.baseUrl}/api/all/legalentitys`,
        labelKey: 'entityName',
        valueKey: 'id',
        method: 'get',
        renderOption: (option) => `${option.entityName}`,
      },
      { type: 'input', id: 'companyCode', label: messages('value.list.company.code')/*"公司代码"*/ },
      { type: 'input', id: 'name', label: messages('value.list.company.name')/*"公司名称"*/ },
      { type: 'input', id: 'companyCodeFrom', label: messages('structure.companyCodeFrom')/*"公司代码从"*/ },
      { type: 'input', id: 'companyCodeTo', label: messages('structure.companyCodeTo')/*"公司代码至"*/ },
    ],
    columns: [
      {
        title: messages('value.list.company.code')/*"公司代码"*/,
        dataIndex: 'companyCode',
        render: (text) => {
          return <Tooltip title={text}
            style={{ width: '100%' }}
            placement={'topLeft'}
            getPopupContainer={triggerNode => triggerNode.parentNode}>
            {text}
          </Tooltip>
        }
      },
      {
        title: messages('value.list.company.name')/*"公司名称"*/,
        dataIndex: 'name',
        render: (text) => {
          return <Tooltip title={text}
            style={{ width: '100%' }}
            placement={'topLeft'}
            getPopupContainer={triggerNode => triggerNode.parentNode}>
            {text}
          </Tooltip>
        }
      },
      {
        title: messages('chooser.data.companyType')/*"公司类型"*/,
        dataIndex: 'companyTypeName',
        render: (text) => {
          return <Tooltip title={text}
            style={{ width: '100%' }}
            placement={'topLeft'}
            getPopupContainer={triggerNode => triggerNode.parentNode}>
            {text}
          </Tooltip>
        }
      },
    ],
    key: 'id'
  },
  /*  'bgtUser': {
      title: '选择人员',
    // /*"添加成本中心组"*/
  'add-cost-center-group': {
    title: messages('cost.center.group.connect.item')/*"关联成本中心项"*/,
    url: `${config.baseUrl}/api/cost/center/group/assign/items/list?size=10`,
    searchForm: [
      {
        type: 'select',
        options: [],
        id: 'costCenterId',
        label: messages("chooser.data.costCenter"),//成本中心
        getUrl: `${config.baseUrl}/api/cost/center/company?enable=true`,
        labelKey: 'name',
        valueKey: 'id',
        method: 'get',
        renderOption: (option) => `${option.name}`,
      },
      { type: 'input', id: 'costCenterItemCodeStart', label: messages('cost.center.group.code.from')/*"成本中心项代码从"*/ },
      { type: 'input', id: 'costCenterItemCodeEnd', label: messages('cost.center.group.code.to')/*"成本中心项代码至"*/ },
      { type: 'input', id: 'costCenterItemNameOrCode', label: messages('cost.center.group.item.code.name')/*"成本中心名称/代码"*/ },
    ],
    columns: [
      {
        title: messages("chooser.data.costCenter.name"),
        dataIndex: 'costCenterName',
        render: (text) => {
          return <Tooltip title={text}
            style={{ width: '100%' }}
            placement={'topLeft'}
            overlayStyle={{ maxWidth: 200, whiteSpace: 'pre-wrap' }}>
            {text}
          </Tooltip>
        }
      },//成本中心名称
      {
        title: messages("new.cost.center.item.code"),
        dataIndex: 'costCenterItemCode',
        render: (text) => {
          return <Tooltip title={text}
            style={{ width: '100%' }}
            placement={'topLeft'}
            overlayStyle={{ maxWidth: 200, whiteSpace: 'pre-wrap' }}>
            {text}
          </Tooltip>
        }
      },//成本中心项代码
      {
        title: messages("cost.center.detail.name"),
        dataIndex: 'costCenterItemName',
        render: (text) => {
          return <Tooltip title={text}
            style={{ width: '100%' }}
            placement={'topLeft'}
            overlayStyle={{ maxWidth: 200, whiteSpace: 'pre-wrap' }}>
            {text}
          </Tooltip>
        }
      },//成本中心项名称
    ],
    key: 'costCenterItemId'
  },
  'bgtUserOid': {
    title: messages('chooser.data.selectPerson'),
    url: `${config.baseUrl}/api/select/user/by/name/or/code`,
    searchForm: [
      { type: 'input', id: 'keyword', label: messages('chooser.data.employeeID.fullName') }
    ],
    columns: [
      { title: messages('chooser.data.employeeID'), dataIndex: 'employeeID', width: '25%' },
      { title: messages('chooser.data.fullName'), dataIndex: 'fullName', width: '25%' },
      { title: messages('chooser.data.dep'), dataIndex: 'departmentName', width: '25%'},
      // { title: '职务', dataIndex: 'title', width: '25%' },
    ],
    key: 'userOid'
  },
  'bgtUser': {
    title: messages('chooser.data.selectPerson'),
    url: `${config.baseUrl}/api/select/user/by/name/or/code`,
    searchForm: [
      { type: 'input', id: 'keyword', label: messages('chooser.data.employeeID.fullName') }
    ],
    columns: [
      { title: messages('chooser.data.employeeID'), dataIndex: 'employeeID', width: '25%' },
      { title: messages('chooser.data.fullName'), dataIndex: 'fullName', width: '25%' },
      { title: messages('chooser.data.dep'), dataIndex: 'departmentName', width: '25%'},
      // { title: '职务', dataIndex: 'title', width: '25%' },
    ],
    key: 'id'
  },
  //预算余额方案类型定义选择部门
  'budget_department': {
    title: messages("chooser.data.dep.title"),//部门
    url: `${config.baseUrl}/api/DepartmentGroup/selectDept/enabled`,
    searchForm: [
      {
        type: 'input',
        id: 'deptCode',
        label: messages("chooser.data.dep.num"),//部门编码
        defaultValue: ''
      },
      {
        type: 'input',
        id: 'name',
        label: messages("chooser.data.dep"),//部门名称
        defaultValue: ''
      },
    ],
    columns: [
      {
        title: messages("chooser.data.dep.num"),//部门编码
        dataIndex: 'departmentCode'
      },
      {
        title: messages("chooser.data.dep"),//部门名称
        dataIndex: 'name',
        render: (value, record) => (record.name = record.path && React.Component.prototype.checkFunctionProfiles('department.full.path.disabled', [undefined, false]) ? record.path : record.name)
      }

    ],
    key: 'departmentId'
  },
  //预算余额方案类型定义选择部门
  'contract_department': {
    title: messages("chooser.data.dep.title"),//部门
    url: `${config.baseUrl}/api/DepartmentGroup/selectDept/enabled`,
    searchForm: [
      {
        type: 'input',
        id: 'deptCode',
        label: messages("chooser.data.dep.num"),//部门编码
        defaultValue: ''
      },
      {
        type: 'input',
        id: 'name',
        label: messages("chooser.data.dep"),//部门名称
        defaultValue: ''
      },
    ],
    columns: [
      {
        title: messages("chooser.data.dep.num"),//部门编码
        dataIndex: 'departmentCode'
      },
      {
        title: messages("chooser.data.dep"),//部门名称
        dataIndex: 'name',
        render: (value, record) => record.path !== value ? record.path : value
      }

    ],
    key: 'departmentId'
  },
  //供应商下未分配的公司
  'vendor_company': {
    title: messages("chooser.data.company"),
    url: `${config.baseUrl}/api/company/dto/by/tenant`,
    searchForm: [
      {
        type: 'select', id: 'setOfBooksId', label: messages("supplier.company.setOfBook"), options: [],
        getUrl: `${config.baseUrl}/api/setOfBooks/by/tenant`,
        getParams: { roleType: 'TENANT' },
        method: 'get', labelKey: 'setOfBooksName', valueKey: 'id'
      },
      { type: 'input', id: 'companyCode', label: messages('value.list.company.code')/*"公司代码"*/ },
      { type: 'input', id: 'name', label: messages('value.list.company.name')/*"公司名称"*/ },
    ],
    columns: [
      { title: messages('value.list.company.code')/*"公司代码"*/, dataIndex: 'companyCode' },
      { title: messages('value.list.company.name')/*"公司名称"*/, dataIndex: 'name' },
      { title: messages('chooser.data.companyType')/*"公司类型"*/, dataIndex: 'companyTypeName' },
    ],
    key: 'id'
  },
  //选择合同
  'select_contract': {
    title: '选择合同',
    url: `${config.contractUrl}/api/contract/document/relations/associate/header/query`,
    searchForm: [
    ],
    columns: [
      { title: "合同编号", dataIndex: 'contractNumber' },
      { title: "合同类型", dataIndex: 'contractTypeName' },
      { title: "合同名称", dataIndex: 'contractName' }
    ],
    key: 'contractHeaderId'
  },
  'expense-adjust-type': {
    title: '费用维护类型',
    url: `${config.baseUrl}/api/expense/adjust/types/queryExpenseAdjustType`,
    searchForm: [
      { type: 'input', id: 'expAdjustTypeCode', label: '代码' },
      { type: 'input', id: 'expAdjustTypeName', label: '名称' },
    ],
    columns: [
      { title: '代码', dataIndex: 'expAdjustTypeCode' },
      { title: '名称', dataIndex: 'expAdjustTypeName' }
    ],
    key: 'id'
  },
  //供应商下未分配的公司
  'select_company_reimburse': {
    title: '选择公司',
    url: `${config.baseUrl}/api/company/dto/by/tenant`,
    searchForm: [
      { type: 'input', id: 'companyCode', label: "公司代码" },
      { type: 'input', id: 'name', label: "公司名称" },
    ],
    columns: [
      { title: "公司代码", dataIndex: 'companyCode' },
      { title: "公司名称", dataIndex: 'name' }
    ],
    key: 'id'
  },
  'select_department_reimburse': {
    title: "部门",
    url: `${config.baseUrl}/api/DepartmentGroup/selectDept/enabled`,
    searchForm: [
      { type: 'input', id: 'deptCode', label: '部门号', defaultValue: '' },
      { type: 'input', id: 'name', label: '部门名称', defaultValue: '' },
    ],
    columns: [
      { title: '部门号', dataIndex: 'departmentCode' },
      { title: '部门名称', dataIndex: 'name' }
    ],
    key: 'departmentOid'
  },
  'select_invoices': {
    title: '选择账本',
    url: `${config.baseUrl}/api/expReportLine/import/query`,
    searchForm: [
      { type: 'input', id: 'expenseTypeName', label: '费用类型' },
      { type: 'input', id: 'amountFrom', label: '金额从' },
      { type: 'input', id: 'amountTo', label: '金额至' },
    ],
    columns: [
      { title: '费用类型', dataIndex: 'expenseTypeName' },
      { title: '币种', dataIndex: 'invoiceCurrencyCode' },
      {
        title: '金额', dataIndex: 'amount', render: (money) => {
          money = Number(money || 0).toFixed(2).toString();
          let numberString = '';
          if (money.indexOf('.') > -1) {
            let integer = money.split('.')[0];
            let decimals = money.split('.')[1];
            numberString = integer.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + '.' + decimals;
          } else {
            numberString = money.replace(/(\d)(?=(\d{3})+(?!\d))\./g, '$1,');
          }
          numberString += (numberString.indexOf('.') > -1 ? '' : '.00');
          return <span className="money-cell">{numberString}</span>;
        }
      }
    ],
    key: 'invoiceOid'
  },
  'select_payee': {
    title: '选择收款方',
    url: `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/getReceivablesByName`,
    searchForm: [
      { type: 'input', id: 'name', label: "名称", defaultValue: "" }
    ],
    columns: [
      { title: "代码", dataIndex: 'code' },
      { title: "名称", dataIndex: 'name' },
    ],
    key: 'id'
  },
  'select_returnee': {
    title: '选择退款方',
    url: `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/getReceivablesByName`,
    searchForm: [
      { type: 'input', id: 'code', label: "代码" },
      { type: 'input', id: 'name', label: "名称" }
    ],
    columns: [
      { title: "代码", dataIndex: 'code' },
      { title: "名称", dataIndex: 'name' },
    ],
    key: 'id'
  },
  'select_department_contract': {
    title: "部门",
    url: `${config.baseUrl}/api/DepartmentGroup/selectDept/enabled`,
    searchForm: [
      { type: 'input', id: 'deptCode', label: '部门号', defaultValue: '' },
      { type: 'input', id: 'name', label: '部门名称', defaultValue: '' },
    ],
    columns: [
      { title: '部门号', dataIndex: 'departmentCode' },
      { title: '部门名称', dataIndex: 'name' }
    ],
    key: 'departmentId'
  },
  'accounting_scene_data_elements': {
    title: '核算要素',
    url: `${config.accountingUrl}/api/general/ledger/journal/line/model/data/rules/query/fitler/element`,
    searchForm: [
      { type: 'input', id: 'accountElementCode', label: "核算要素代码" },
      { type: 'input', id: 'elementNature', label: "核算要素名称" },
    ],
    columns: [
      { title: "核算要素代码", dataIndex: 'code' },
      { title: "核算要素名称", dataIndex: 'description' },
    ],
    key: 'code'
  },
  'accounting_journalField_system': {
    title: '未选择过的核算分录段',
    url: `${config.accountingUrl}/api/accounting/util/general/ledger/fields/account/system/page`,
    searchForm: [
      { type: 'input', id: 'code', label: "分录段代码" },
      { type: 'input', id: 'description', label: "分录段名称" }
    ],
    columns: [
      { title: "分录段代码", dataIndex: 'code' },
      { title: "分录段名称", dataIndex: 'description' },
    ],
    key: 'code'
  },
  'accounting_scene_data_elements_system': {
    title: '核算要素',
    url: `${config.accountingUrl}/api/general/ledger/journal/line/model/system/data/rules/query/fitler/element`,
    searchForm: [
      { type: 'input', id: 'accountElementCode', label: "核算要素代码" },
      { type: 'input', id: 'elementNature', label: "核算要素名称" },
    ],
    columns: [
      { title: "核算要素代码", dataIndex: 'code' },
      { title: "核算要素名称", dataIndex: 'description' },
    ],
    key: 'code'
  },
  'adjust_expense_type': {
    title: messages("itemMap.expenseType"),
    url: `${config.expenseUrl}/api/expense/adjust/types/getExpenseType`,
    searchForm: [
      { type: 'input', id: 'name', label: messages("itemMap.expenseTypeName") },
    ],
    columns: [
      {
        title: messages("itemMap.icon"), dataIndex: 'iconUrl',
        render: (value) => {
          return <img src={value} height="20" width="20" />
        }
      },
      { title: messages("itemMap.expenseTypeName"), dataIndex: 'name' },
      {
        title: messages("common.column.status"), dataIndex: 'enabled',
        render: isEnabled => (
          <Badge status={isEnabled ? 'success' : 'error'}
            text={isEnabled ? messages("common.status.enable") : messages("common.status.disable")} />
        )
      },
    ],
    key: 'id'
  },
  'dimension_value': {
    title: '选择维值',
    url: `${config.baseUrl}/api/get/costcenter/items/by/costcenter/id`,
    searchForm: [
      { type: 'input', id: 'code', label: '维值代码' },
      { type: 'input', id: 'name', label: '维值名称' }
    ],
    columns: [
      { title: '代码', dataIndex: 'code' },
      { title: '名称', dataIndex: 'name' },
      { title: '经理', dataIndex: 'managerFullName' }
    ],
    key: 'id'
  },
  //乘机人
  'passenger': {
    title: messages("bookingManagement.bookingDetails.passenger"),
    url: `${config.baseUrl}/api/users/oids`,
    searchForm: [
      { type: 'input', id: 'fullName', label: messages('bookingManagement.bookingDetails.maintain.chooser.tips')/*"乘机人姓名，部门，职位"*/ },
    ],
    columns: [
      { title: messages('bookingManagement.bookingDetails.maintain.chooser.avatar')/*"头像"*/, dataIndex: 'avatar', render: (value) => <Avatar src={value} />, width: '10%' },
      { title: messages('bookingManagement.bookingDetails.maintain.chooser.name')/*"姓名"*/, dataIndex: 'fullName' },
      { title: messages('bookingManagement.bookingDetails.maintain.chooser.dep')/*"部门"*/, dataIndex: 'departmentName' },
      { title: messages('bookingManagement.bookingDetails.maintain.chooser.title')/*"职位"*/, dataIndex: 'title' }
    ],
    key: 'userOid'
  },
  'select_setOfBooks_accounts': {
    title: '选择科目',
    url: `${config.baseUrl}/api/accounts/query/accounts/setOfBooksId`,
    searchForm: [
      { type: 'input', id: 'accountCode', label: "科目代码" },
      { type: 'input', id: 'accountName', label: "科目名称" },
    ],
    columns: [
      { title: "科目代码", dataIndex: 'accountCode' },
      { title: "科目名称", dataIndex: 'accountName' },
    ],
    key: 'id'
  },
};

export default chooserData

















