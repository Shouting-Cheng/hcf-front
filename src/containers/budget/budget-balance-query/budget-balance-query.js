import React from 'react'
import { connect } from 'react-redux'
import { Button, Form, Row, Col, Input, Select, Spin, Icon, Table, Popconfirm, Modal, message, Checkbox } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;

import { messages } from "share/common";

import debounce from 'lodash.debounce';
import Chooser from 'components/chooser'
import SlideFrame from 'components/slide-frame'
import BudgetBalanceCondition from 'containers/budget/budget-balance-query/budget-balance-query-condition'
import menuRoute from 'routes/menuRoute'
import selectorData from 'share/chooserData'

import 'styles/budget/budget-balance/budget-balance.scss'
import httpFetch from 'share/httpFetch'
import config from 'config'
import budgetBalanceQueryService from 'containers/budget/budget-balance-query/budget-balance-query.service.js'
import CustomChooser from 'containers/budget/budget-balance-query/budget-chooser'

class BudgetBalance extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      structureId: null,
      budgetBalanceResult: menuRoute.getRouteItem('budget-balance-query-result', 'key'),
      showSlideFrame: false,
      params: [],
      loading: false,
      queryLineListTypeOptions: [],
      queryLineListParamOptions: {},
      columns: [
        { title: messages('budget.balance.params.type'), dataIndex: 'type', width: '20%', render: (text, record, index) => this.renderColumns(index, 'type') },
        { title: messages('budget.balance.params'), dataIndex: 'params', width: '35%', render: (text, record, index) => this.renderColumns(index, 'params') },
        { title: messages('budget.balance.params.value'), dataIndex: 'value', width: '35%', render: (text, record, index) => this.renderColumns(index, 'value') },
        {
          title: messages('budget.balance.operate'), dataIndex: 'operation', width: '10%', render: (text, record, index) => (
            <span>
              {!record.disabled &&
                <Popconfirm onConfirm={(e) => this.deleteItem(e, index)} title={messages('budget.balance.are.you.sure.to.delete.this.data')}>
                  <a onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>{messages("common.delete")}</a>
                </Popconfirm>
              }
            </span>)
        }
      ],
      searchForm: [],
      organizationId: this.props.organization.id,
      searchParams: {
        periodSummaryFlag: false,
        amountQuarterFlag: '',
        yearLimit: '',
        quarterLowerLimit: '',
        quarterUpperLimit: '',
        periodLowerLimit: '',
        periodUpperLimit: '',
        queryLineList: []
      },
      paramsKey: 0,
      paramTypeMap: {
        'BGT_RULE_PARAMETER_BUDGET': 2015,
        'BGT_RULE_PARAMETER_ORG': 2016,
        'BGT_RULE_PARAMETER_DIM': 2016
      },
      paramValueMap: {},
      showSaveModal: false,
      conditionCode: '',
      conditionName: '',
      condition: null,
      saving: false,
      searching: false,
      saveNewCondition: true,
      solutionHeaderId: "",
      dataSource: [],
      costCenterSelectorItem: {  //成本中心所需要的selectorItem，url需要在params的onChange里手动添加
        listType: 'cost_center_item_by_id',
        labelKey: 'name',
        valueKey: 'id',
        codeKey: 'code',
        listExtraParams: undefined,
        selectorItem: undefined
      },
    };
    this.setOptionsToFormItem = debounce(this.setOptionsToFormItem, 250);
  }

  componentWillMount() {
    let { queryLineListTypeOptions } = this.state;
    this.getSystemValueList(2012).then(res => {
      queryLineListTypeOptions = [];
      res.data.values.map(data => {
        queryLineListTypeOptions.push({ label: data.messageKey, value: data.code })
      });
      this.setState({ queryLineListTypeOptions })
    });


    let nowYear = new Date().getFullYear();
    let yearOptions = [];
    for (let i = nowYear - 20; i <= nowYear + 20; i++)
      yearOptions.push({ label: i, key: i })
    let organizationIdParams = { organizationId: this.state.organizationId };
    let searchForm = [
      {
        type: 'select', id: 'typeId', label: messages('budget.balance.budget.type'), isRequired: true, options: [], method: 'get',
        getUrl: `${config.budgetUrl}/api/budget/solution/header/apply/query`,
        labelKey: 'conditionName', valueKey: 'id', event: "TYPE",
        getParams: { setOfBooksId: this.props.company.setOfBooksId }
      },
      {
        type: 'select', id: 'versionId', label: messages('budget.balance.budget.version'), isRequired: true, options: [], method: 'get',
        getUrl: `${config.budgetUrl}/api/budget/versions/queryAll`, getParams: organizationIdParams,
        labelKey: 'versionName', valueKey: 'id'
      },
      {
        type: 'select', id: 'structureId', label: messages('budget.balance.budget.structure'), isRequired: true, options: [], method: 'get',
        getUrl: `${config.budgetUrl}/api/budget/structures/queryAll`, getParams: organizationIdParams, event: 'STRUCTURE_CHANGE',
        labelKey: 'structureName', valueKey: 'id'
      },
      {
        type: 'select', id: 'scenarioId', label: messages('budget.balance.budget.scenarios'), isRequired: true, options: [], method: 'get',
        getUrl: `${config.budgetUrl}/api/budget/scenarios/queryAll`, getParams: organizationIdParams,
        labelKey: 'scenarioName', valueKey: 'id'
      },
      { type: 'select', id: 'yearLimit', label: messages('budget.balance.year'), options: yearOptions, event: 'YEAR_CHANGE', isRequired: true },
      {
        type: 'items', id: 'dateRange', items: [
          {
            type: 'select', id: 'periodLowerLimit', label: messages('budget.balance.period.from'), options: [], method: 'get', disabled: true,
            getUrl: `${config.baseUrl}/api/company/group/assign/query/budget/periods`, getParams: { setOfBooksId: this.props.company.setOfBooksId },
            labelKey: 'periodName', valueKey: 'periodName'
          },
          {
            type: 'select', id: 'periodUpperLimit', label: messages('budget.balance.period.to'), options: [], method: 'get', disabled: true,
            getUrl: `${config.baseUrl}/api/company/group/assign/query/budget/periods`, getParams: { setOfBooksId: this.props.company.setOfBooksId },
            labelKey: 'periodName', valueKey: 'periodName'
          }
        ]
      },
      {
        type: 'items', id: 'seasonRange', items: [
          { type: 'value_list', id: 'quarterLowerLimit', label: messages('budget.balance.season.from'), options: [], valueListCode: 2021, disabled: true },
          { type: 'value_list', id: 'quarterUpperLimit', label: messages('budget.balance.season.to'), options: [], valueListCode: 2021, disabled: true }
        ]
      },
      { type: 'value_list', id: 'periodSummaryFlag', label: messages('budget.balance.period.summary'), options: [], valueListCode: 2020, disabled: true },
      { type: 'value_list', id: 'amountQuarterFlag', label: messages('budget.balance.money.or.number'), isRequired: true, options: [], valueListCode: 2019 }
    ];

    let itemSelectorItem = selectorData['budget_item'];
    itemSelectorItem.listExtraParams = organizationIdParams;
    itemSelectorItem.searchForm[1].getParams = itemSelectorItem.searchForm[2].getParams = organizationIdParams;

    let userSelectorItem = selectorData['user'];
    userSelectorItem.key = 'id';

    let paramValueMap = {
      'BUDGET_ITEM_TYPE': {
        listType: 'budget_item_type',
        labelKey: 'itemTypeName',
        valueKey: 'id',
        codeKey: 'itemTypeCode',
        listExtraParams: organizationIdParams,
        selectorItem: undefined
      },
      'BUDGET_ITEM_GROUP': {
        listType: 'budget_item_group',
        labelKey: 'itemGroupName',
        valueKey: 'id',
        codeKey: 'itemGroupCode',
        listExtraParams: organizationIdParams,
        selectorItem: undefined
      },
      'BUDGET_ITEM': {
        listType: 'budget_item',
        labelKey: 'itemName',
        valueKey: 'id',
        codeKey: 'itemCode',
        listExtraParams: organizationIdParams,
        selectorItem: itemSelectorItem
      },
      'CURRENCY': {
        listType: 'new_currency',
        labelKey: 'currencyName',
        valueKey: 'currencyCode',
        codeKey: undefined,
        listExtraParams: {
          baseCurrencyCode: this.props.company.baseCurrency
        },
        selectorItem: undefined
      },
      'COMPANY': {
        listType: 'company',
        labelKey: 'name',
        valueKey: 'id',
        codeKey: 'companyCode',
        listExtraParams: { setOfBooksId: this.props.company.setOfBooksId },
        selectorItem: undefined
      },
      'COMPANY_GROUP': {
        listType: 'company_group',
        labelKey: 'companyGroupName',
        valueKey: 'id',
        codeKey: 'companyGroupCode',
        listExtraParams: { enabled: true },
        selectorItem: undefined
      },
      'UNIT': {
        listType: 'department',
        labelKey: 'name',
        valueKey: 'departmentId',
        codeKey: 'custDeptNumber',
        listExtraParams: {},
        selectorItem: undefined
      },
      'UNIT_GROUP': {
        listType: 'department_group',
        labelKey: 'description',
        valueKey: 'id',
        codeKey: 'deptGroupCode',
        listExtraParams: {},
        selectorItem: undefined
      },
      'EMPLOYEE': {
        listType: 'user',
        labelKey: 'fullName',
        valueKey: 'id',
        codeKey: 'id',
        listExtraParams: { roleType: 'TENANT' },
        selectorItem: userSelectorItem
      },
      'EMPLOYEE_GROUP': {
        listType: 'user_group',
        labelKey: 'name',
        valueKey: 'id',
        codeKey: 'id',
        listExtraParams: { roleType: 'TENANT' },
        selectorItem: undefined
      }
    };

    let chooserTypeList = {
      'BUDGET_ITEM_TYPE': {
        listType: 'budget_item_type',
        labelKey: 'itemTypeName',
        valueKey: 'id',
        codeKey: 'itemTypeCode',
        listExtraParams: organizationIdParams,
        selectorItem: undefined
      },
      'BUDGET_ITEM_GROUP': {
        listType: 'budget_item_group',
        labelKey: 'itemGroupName',
        valueKey: 'id',
        codeKey: 'itemGroupCode',
        listExtraParams: organizationIdParams,
        selectorItem: undefined
      },
      'BUDGET_ITEM': {
        listType: 'budget_item_budget',
        labelKey: 'itemName',
        valueKey: 'id',
        codeKey: 'itemCode',
        listExtraParams: organizationIdParams,
        selectorItem: undefined
      },
      'CURRENCY': {
        listType: 'new_currency',
        labelKey: 'currencyName',
        valueKey: 'currencyCode',
        codeKey: undefined,
        listExtraParams: {
          baseCurrencyCode: this.props.company.baseCurrency
        },
        selectorItem: undefined
      },
      'COMPANY': {
        listType: 'company_budget',
        labelKey: 'name',
        valueKey: 'id',
        codeKey: 'companyCode',
        listExtraParams: { setOfBooksId: this.props.company.setOfBooksId },
        selectorItem: undefined
      },
      'COMPANY_GROUP': {
        listType: 'company_group',
        labelKey: 'companyGroupName',
        valueKey: 'id',
        codeKey: 'companyGroupCode',
        listExtraParams: { enabled: true },
        selectorItem: undefined
      },
      'UNIT': {
        listType: 'department_budget',
        labelKey: 'name',
        valueKey: 'departmentId',
        codeKey: 'custDeptNumber',
        listExtraParams: {},
        selectorItem: undefined
      },
      'UNIT_GROUP': {
        listType: 'department_group',
        labelKey: 'description',
        valueKey: 'id',
        codeKey: 'deptGroupCode',
        listExtraParams: {},
        selectorItem: undefined
      },
      'EMPLOYEE': {
        listType: 'user_budget',
        labelKey: 'fullName',
        valueKey: 'id',
        codeKey: 'employeeID',
        listExtraParams: { roleType: 'TENANT' },
        selectorItem: undefined
      },
      'EMPLOYEE_GROUP': {
        listType: 'user_group',
        labelKey: 'name',
        valueKey: 'id',
        codeKey: 'id',
        listExtraParams: { roleType: 'TENANT' },
        selectorItem: undefined
      }
    };

    this.setState({ searchForm, paramValueMap, chooserTypeList });
  }

  //渲染下方表格内的选项框及Chooser
  renderColumns = (index, dataIndex) => {
    const { queryLineListTypeOptions, queryLineListParamOptions, params, paramValueMap, chooserTypeList } = this.state;
    switch (dataIndex) {
      case 'type': {
        return (
          <Select disabled placeholder={messages('common.please.select')}
            onChange={(value) => this.handleChangeType(value, index)}
            value={params[index].type}
            notFoundContent={<Spin size="small" />}>
            {queryLineListTypeOptions.map((option) => {
              return <Option key={option.value}>{option.label}</Option>
            })}
          </Select>
        );
      }
      case 'params': {
        let paramOptions = queryLineListParamOptions[params[index].type];
        return (
          <Select disabled placeholder={messages({ id: 'common.please.select' })}
            onChange={(value) => this.handleChangeParams(value, index)}
            value={params[index].params}
            onFocus={() => this.handleFocusParamSelect(index)}>
            {paramOptions ? paramOptions.map((option) => {
              return <Option key={option.value}>{option.label}</Option>
            }) : null}
          </Select>
        );
      }
      case 'value': {
        //如果为维度相关项目，则为成本中心selectorItem

        let param = null;
        if (params[index].params) {
          if (params[index].type === 'BGT_RULE_PARAMETER_DIM') {
            param = params[index].paramMap;

          } else {
            if (params[index].disabled) {
              param = chooserTypeList[params[index].params];
            } else {
              param = paramValueMap[params[index].params]
            }
          }
        }

        // let param = params[index].params ? (params[index].type === 'BGT_RULE_PARAMETER_DIM' ? params[index].paramMap : params[index].disabled ? chooserTypeList[params[index].params] : paramValueMap[params[index].params]) : null;
        return (
          <Row gutter={20}>
            <Col span={12}>
              <Select value={params[index].allFlag ? "1" : "2"} onChange={(allFlag) => { this.handleChangeIsAll(allFlag, index) }} disabled={param === null || params[index].disabled}>
                <Option value="1">{messages('common.all')}</Option>
                <Option value="2">{messages('budget.balance.select')}</Option>
              </Select>
            </Col>
            <Col span={12}>
              {params[index].disabled ?
                <CustomChooser disabled={param === null || params[index].allFlag}
                  type={param ? param.listType : null}
                  onChange={(value) => this.handleChangeValue(value, index)}
                  labelKey={param ? param.labelKey : null}
                  valueKey={param ? param.valueKey : null}
                  listExtraParams={param ? param.listExtraParams : null}
                  selectorItem={param ? param.selectorItem : null}
                  value={params[index].value}
                  // single={param ? param.listType === 'new_currency' : false}
                  dataSource={params[index].dataSource}
                  showNumber /> :
                <Chooser disabled={param === null || params[index].allFlag}
                  onChange={(value) => this.handleChangeValue(value, index)}
                  type={param ? param.listType : null}
                  labelKey={param ? param.labelKey : null}
                  valueKey={param ? param.valueKey : null}
                  listExtraParams={param ? param.listExtraParams : null}
                  selectorItem={param ? param.selectorItem : null}
                  value={params[index].value}
                  // single={param ? param.listType === 'new_currency' : false}
                  showNumber />
              }
            </Col>
          </Row>
        )
      }
    }
  };

  //修改参数值为全选还是手动选择
  handleChangeIsAll = (allFlag, index) => {
    let { params } = this.state;
    params[index].allFlag = allFlag === "1";
    if (allFlag === "1") {
      params[index].value = [];
    }
    this.setState({ params });
  };

  //修改参数类型，同时清空参数和参数值
  handleChangeType = (value, index) => {
    let { params } = this.state;
    params[index].type = value;
    params[index].params = '';
    params[index].value = [];
    this.setState({ params });
  };

  //修改参数，同时清空参数值
  handleChangeParams = (value, index) => {
    let { params } = this.state;
    params[index].params = value;
    params[index].value = [];
    //手动添加成本中心selectorItem所需要的url
    if (params[index].type === 'BGT_RULE_PARAMETER_DIM') {
      params[index].paramMap = {  //成本中心所需要的selectorItem，url需要在params的onChange里手动添加
        listType: 'cost_center_item_by_id',
        labelKey: 'name',
        valueKey: 'id',
        codeKey: 'code',
        listExtraParams: { costCenterId: value, allFlag: true },
        selectorItem: undefined
      };
    }
    this.setState({ params });
  };

  //修改参数值
  handleChangeValue = (value, index) => {
    let { params } = this.state;
    params[index].value = value;
    this.setState({ params });
  };

  //点击参数选择框时的回调，若没有对应的值列表则获取
  handleFocusParamSelect = (index, typeParam) => {
    let { params, queryLineListParamOptions, paramTypeMap } = this.state;
    let type = typeParam ? typeParam : params[index].type;

    if (type === 'BGT_RULE_PARAMETER_DIM') {
      httpFetch.get(`${config.baseUrl}/api/cost/center/by/setOfBooks?setOfBooksId=${this.props.company.setOfBooksId}`).then(res => {
        let options = [];
        res.data.map(data => {
          options.push({ label: data.name, value: data.id })
        });
        queryLineListParamOptions[type] = options;
        this.setState({ queryLineListParamOptions });
        if (length) {
          this.loadNum++;
          this.setState({ tableLoading: length !== this.loadNum })
        }
      })
    } else {
      if (!queryLineListParamOptions[type] || queryLineListParamOptions[type].length === 0) {
        this.getSystemValueList(paramTypeMap[type]).then(res => {
          let options = [];
          if (type === 'BGT_RULE_PARAMETER_BUDGET') {
            res.data.values.map(data => {
              data.common && options.push({ label: data.messageKey, value: data.code })
            });
          } else {
            res.data.values.map(data => {
              options.push({ label: data.messageKey, value: data.code })
            });
          }
          queryLineListParamOptions[type] = options;
          this.setState({ queryLineListParamOptions });
        });
      }
    }
  };

  //删除下方表格维度项
  deleteItem = (e, index) => {
    let { params } = this.state;
    params.splice(index, 1);
    this.setState({ params });
  };

  //新增维度
  handleNew = () => {
    let { params, paramsKey } = this.state;
    let newParams = { type: '', params: '', value: [], key: paramsKey, allFlag: false };
    params.push(newParams);
    paramsKey++;
    this.setState({ params, paramsKey });
  };

  //查询，统一保存为临时方案后跳转
  search = (e) => {
    e.preventDefault();
    this.setState({ searching: true });
    this.validate((values) => {
      httpFetch.post(`${config.budgetUrl}/api/budget/balance/query/header/user`, values).then(res => {
        this.setState({ searching: false });
        this.context.router.push(this.state.budgetBalanceResult.url.replace(':id', res.data));
      }).catch(e => {
        if (e.response.data) {
          message.error(e.response.data.validationErrors ? e.response.data.validationErrors[0].message : e.response.data.message);
        }
        this.setState({ searching: false });
      })
    });
  };

  //验证并打开方案保存窗口
  showSaveModal = () => {
    this.validate(() => {
      const { condition } = this.state;
      if (this.state.condition)
        this.setState({ conditionName: condition.conditionName, conditionCode: condition.conditionCode, showSaveModal: true });
      else
        this.setState({ conditionName: '', conditionCode: '', showSaveModal: true })
    });
  };

  //保存方案
  handleSaveCondition = () => {
    this.validate((values) => {
      values.conditionCode = this.state.conditionCode;
      values.conditionName = this.state.conditionName;
      values.companyId = this.props.company.id;
      values.solutionHeaderId = this.state.solutionHeaderId;
      this.setState({ saving: true });
      let method;
      if (this.state.saveNewCondition || !this.state.condition)
        method = 'post';
      else {
        method = 'put';
        values.id = this.state.condition.id;
        values.versionNumber = this.state.condition.versionNumber;
      }
      httpFetch[method](`${config.budgetUrl}/api/budget/balance/query/header`, values).then(() => {
        message.success(messages('common.operate.success'));
        this.setState({ showSaveModal: false, saving: false });
      }).catch(e => {
        if (e.response.data) {
          message.error(e.response.data.validationErrors ? e.response.data.validationErrors[0].message : e.response.data.message);
          this.setState({ saving: false })
        }
      })
    });
  };

  //验证通过后将state.params的值包装至values
  validate = (callback) => {
    const { costCenterSelectorItem } = this.state;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { paramValueMap } = this.state;
        values.queryLineList = [];
        values.periodSummaryFlag = values.periodSummaryFlag === 'TRUE';
        let flag = this.state.params.some(param => {
          if (param.type === null) {
            message.error(messages('budget.balance.please.select.params.type'));
            this.setState({ searching: false });
            return true;
          }
          if (param.params === null) {
            message.error(messages('budget.balance.please.select.params'));
            this.setState({ searching: false });
            return true;
          }
          if (param.value.length === 0 && !param.allFlag) {
            message.error(messages('budget.balance.please.select.at.least.one.value'));
            this.setState({ searching: false });
            return true;
          }
          let queryLine = {
            allFlag: param.allFlag,
            parameterType: param.type,
            parameterCode: param.params,
            queryParameterList: []
          };
          !param.allFlag && param.value.map(value => {
            let paramItem = param.type === 'BGT_RULE_PARAMETER_DIM' ? costCenterSelectorItem : paramValueMap[param.params];
            let queryParameter = {
              parameterValueId: paramItem.listType === 'new_currency' ? null : (paramItem.valueKey ? value[paramItem.valueKey] : null),
              parameterValueCode: paramItem.listType === 'new_currency' ? value[paramItem.valueKey] : (paramItem.codeKey ? value[paramItem.codeKey] : null),
              parameterValueName: paramItem.labelKey ? value[paramItem.labelKey] : null
            };
            queryLine.queryParameterList.push(queryParameter)
          });
          values.queryLineList.push(queryLine)
        });
        if (flag) return;
        values.organizationId = this.state.organizationId;
        values.companyId = this.props.company.id;
        callback(values);
      } else {
        this.setState({ searching: false });
      }
    })
  };

  //应用方案后设置表单值
  setValues = (options) => {
    Object.keys(options).map(key => {
      let searchForm = this.state.searchForm;
      searchForm.map((searchItem, index) => {
        if (searchItem.id === key) {
          if (options[key]) {
            if ((searchItem.type === 'select' || searchItem.type === 'value_list') && typeof options[key] === 'object')
              this.onChangeSelect(searchItem, options[key]);
            else {
              let value = {};
              value[key] = options[key] + '';
              this.props.form.setFieldsValue(value)
            }
          } else {
            let value = {};
            value[key] = null;
            this.props.form.setFieldsValue(value)
          }
        } else if (searchItem.type === 'items') {
          searchItem.items.map(subItem => {
            if (subItem.id === key) {
              if (options[key]) {
                if ((subItem.type === 'select' || subItem.type === 'value_list') && typeof options[key] === 'object')
                  this.onChangeSelect(subItem, options[key], index);
                else {
                  let value = {};
                  value[key] = options[key] + '';
                  this.props.form.setFieldsValue(value)
                }
              } else {
                let value = {};
                value[key] = null;
                this.props.form.setFieldsValue(value)
              }
            }
          })
        }
      });

      if (options.yearLimit) {
        searchForm[5].items[0].getParams = searchForm[5].items[1].getParams = { setOfBooksId: this.props.company.setOfBooksId, periodYear: options.yearLimit };
        searchForm[5].items[0].options = searchForm[5].items[1].options = [];
      }


      this.setState({ searchForm })
    });
  };

  //应用方案，将数据填充至界面
  useCondition = (condition) => {
    this.setState({ showSlideFrame: false });

    if (condition) {
      this.setState({ loading: true });

      //设置顶部表单的值
      this.setValues({
        typeId: { label: condition.solutionHeaderConditionName, value: condition.solutionHeaderId },
        versionId: { value: condition.versionId, label: condition.versionName },
        structureId: { value: condition.structureId, label: condition.structureName },
        scenarioId: { value: condition.scenarioId, label: condition.scenarioName },
        yearLimit: condition.yearLimit,
        periodLowerLimit: condition.periodLowerLimit ? { value: condition.periodLowerLimit, label: condition.periodLowerLimit } : null,
        periodUpperLimit: condition.periodUpperLimit ? { value: condition.periodUpperLimit, label: condition.periodUpperLimit } : null,
        periodSummaryFlag: { value: (condition.periodSummaryFlag + '').toUpperCase(), label: condition.periodSummaryFlag ? '汇总' : '不汇总' },
        quarterLowerLimit: condition.quarterLowerLimit ? { value: condition.quarterLowerLimit, label: condition.quarterLowerLimit } : null,
        quarterUpperLimit: condition.quarterUpperLimit ? { value: condition.quarterUpperLimit, label: condition.quarterUpperLimit } : null,
        amountQuarterFlag: { value: condition.amountQuarterFlag, label: condition.amountQuarterFlagName }
      });

      this.setState({ structureId: condition.structureId, solutionHeaderId: condition.solutionHeaderId });

      budgetBalanceQueryService.getBudgetBalanceDetail(condition.solutionHeaderId).then(res => {
        //设置下方列表内的值
        let { paramsKey, paramValueMap, chooserTypeList } = this.state;
        let params = [];

        condition.queryLineList.map((item, index) => {

          let newParams = { type: item.parameterType, params: item.parameterCode, value: [], key: paramsKey, allFlag: item.allFlag, dataSource: [] };

          let data = res.data.queryLineList.find(o => o.parameterType == item.parameterType && o.parameterCode == item.parameterCode);

          if (data) {

            let info = data;
            if (info.allFlag) {
              info = item;
            } else {
              newParams.allFlag = false;
              data.allFlag = false;
            }

            let mapItem = (item.parameterType === 'BGT_RULE_PARAMETER_DIM') ? this.state.costCenterSelectorItem : item.allFlag ? paramValueMap[item.parameterCode] : chooserTypeList[item.parameterCode];

            if (item.parameterType === 'BGT_RULE_PARAMETER_DIM') {
              newParams.paramMap = {  //成本中心所需要的selectorItem，url需要在params的onChange里手动添加
                listType: 'cost_center_item_by_id',
                labelKey: 'name',
                valueKey: 'id',
                codeKey: 'code',
                listExtraParams: { costCenterId: item.parameterCode, allFlag: true },
                selectorItem: undefined
              };
            }


            info.queryParameterList && info.queryParameterList.map(queryParameter => {
              let val = {};


              if (info.parameterCode !== 'CURRENCY')
                val[mapItem.codeKey] = queryParameter.parameterValueCode;

              val[mapItem.valueKey] = info.parameterCode === 'CURRENCY' ? queryParameter.parameterValueCode : queryParameter.parameterValueId;

              val[mapItem.labelKey] = queryParameter.parameterValueName;

              if (item.queryParameterList.findIndex(o => queryParameter.parameterValueId == o.parameterValueId) >= 0) {
                newParams.value.push(val);
              }

              if (item.allFlag && !newParams.allFlag) {
                newParams.value.push(val);
              }

              newParams.dataSource.push(val);


            })
            newParams.disabled = !data.allFlag;
            params.push(newParams);
            paramsKey++;
          }
          //获得参数列的选择项
          this.handleFocusParamSelect(index, item.parameterType)
        });

        this.setState({ params, paramsKey, condition, saveNewCondition: true, loading: false }, () => this.setFieldsByStructureId(true));
      })

    }
  };

  clear = () => {
    this.props.form.resetFields();
    this.setState({ params: [], paramsKey: 0, condition: null, conditionName: '', conditionCode: '', structureId: "" })
  };

  //得到值列表的值增加options
  getValueListOptions = (item) => {
    if (item.options.length === 0 || (item.options.length === 1 && item.options[0].temp)) {
      this.getSystemValueList(item.valueListCode).then(res => {
        let options = [];
        res.data.values.map(data => {
          options.push({ label: data.messageKey, key: data.code, value: data })
        });
        let searchForm = this.state.searchForm;
        searchForm = searchForm.map(searchItem => {
          if (searchItem.id === item.id)
            searchItem.options = options;
          if (searchItem.type === 'items')
            searchItem.items.map(subItem => {
              if (subItem.id === item.id)
                subItem.options = options;
            });
          return searchItem;
        });
        this.setState({ searchForm });
      })
    }
  };

  //根据接口返回数据重新设置options
  setOptionsToFormItem = (item, url, key) => {
    let params = {};
    if (key) {
      params[item.searchKey] = key;
      if (item.method === 'get')
        url += `?${item.searchKey}=${key}`;
    }
    if ((key !== undefined && key !== '') || key === undefined) {
      httpFetch[item.method](url, params).then((res) => {
        let options = [];
        res.data.map(data => {
          options.push({ label: data[item.labelKey], key: data[item.valueKey], value: data })
        });
        let searchForm = this.state.searchForm;
        searchForm = searchForm.map(searchItem => {
          if (searchItem.id === item.id)
            searchItem.options = options;
          return searchItem;
        });
        this.setState({ searchForm });
      })
    }
  };

  //给select增加options
  getOptions = (item) => {
    if (item.options.length === 0 || (item.options.length === 1 && item.options[0].temp)) {
      let url = item.getUrl;
      if (item.method === 'get' && item.getParams) {
        url += '?';
        let keys = Object.keys(item.getParams);
        keys.map(paramName => {
          url += `&${paramName}=${item.getParams[paramName]}`
        })
      }
      httpFetch[item.method](url, item.getParams).then((res) => {
        let options = [];
        res.data.map(data => {
          options.push({ label: data[item.labelKey], key: data[item.valueKey], value: data })
        });
        let searchForm = this.state.searchForm;
        searchForm = searchForm.map(searchItem => {
          if (searchItem.id === item.id)
            searchItem.options = options;
          if (searchItem.type === 'items')
            searchItem.items.map(subItem => {
              if (subItem.id === item.id)
                subItem.options = options;
            });
          return searchItem;
        });
        this.setState({ searchForm });
      })
    }
  };

  setFieldsByStructureId = (fromCondition) => {
    let structureId = this.state.structureId;
    structureId && httpFetch.get(`${config.budgetUrl}/api/budget/structures/${structureId}`).then(res => {
      let periodStrategy = res.data.periodStrategy;
      let searchForm = this.state.searchForm;
      searchForm[5].items[0].isRequired = periodStrategy === 'MONTH';
      searchForm[5].items[0].disabled = searchForm[5].items[1].disabled = periodStrategy !== 'MONTH';
      searchForm[5].items[0].options = searchForm[5].items[1].options = [];
      searchForm[6].items[0].isRequired = searchForm[6].items[1].isRequired = periodStrategy === 'QUARTER';
      searchForm[6].items[0].disabled = searchForm[6].items[1].disabled = periodStrategy !== 'QUARTER';
      searchForm[7].isRequired = periodStrategy !== 'YEAR';
      searchForm[7].disabled = periodStrategy === 'YEAR';
      if (!fromCondition) {
        periodStrategy === 'YEAR' && this.setValues({
          periodLowerLimit: "",
          periodUpperLimit: "",
          quarterLowerLimit: "",
          quarterUpperLimit: "",
          periodSummaryFlag: { value: 'FALSE', label: messages('budget.balance.no.sum') }
        });
        periodStrategy === 'MONTH' && this.setValues({
          quarterLowerLimit: "",
          quarterUpperLimit: "",
          periodSummaryFlag: { value: 'FALSE', label: messages('budget.balance.no.sum') }
        });
        periodStrategy === 'QUARTER' && this.setValues({
          periodLowerLimit: "",
          periodUpperLimit: "",
          periodSummaryFlag: { value: 'FALSE', label: messages('budget.balance.no.sum') }
        });
      }

      this.setState({ searchForm });
    });
  };

  //根据预算表过滤列表
  filterList = () => {
    if (!this.state.dataSource || !this.state.dataSource.length) return;
    httpFetch.get(`${config.budgetUrl}/api/budget/structure/assign/layouts/queryAll?structureId=${this.state.structureId}`).then(res => {
      let params = [];
      this.state.dataSource.map(item => {
        console.log(item);
        if (item.type === "BGT_RULE_PARAMETER_DIM") {
          let index = res.data.findIndex(o => o.dimensionId == item.params);
          if (index >= 0) {
            params.push(item);
          }
        }
        else {
          params.push(item);
        }
      });
      this.setState({ params });
    })
  }

  handleEvent = (value, event) => {
    const { params, queryLineListParamOptions } = this.state;
    switch (event) {
      case 'YEAR_CHANGE':
        let searchForm = this.state.searchForm;
        searchForm[5].items[0].getParams = searchForm[5].items[1].getParams = { setOfBooksId: this.props.company.setOfBooksId, periodYear: value };
        searchForm[5].items[0].options = searchForm[5].items[1].options = [];
        this.props.form.setFieldsValue({
          periodLowerLimit: null,
          periodUpperLimit: null
        });
        this.setState({ searchForm });
        break;
      case 'STRUCTURE_CHANGE':
        this.setState({ tableLoading: true }, () => {
          value && httpFetch.get(`${config.budgetUrl}/api/budget/structure/assign/layouts/queryAll?structureId=${value}`).then(res => {
            let options = [];
            res.data.map(data => {
              options.push({ label: data.dimensionName, value: data.dimensionId, code: data.dimensionCode })
            });
            queryLineListParamOptions['BGT_RULE_PARAMETER_DIM'] = options;

            this.setState({ queryLineListParamOptions }, () => {
              let targetParams = [];

              params.map(item => {
                if (item.type === 'BGT_RULE_PARAMETER_DIM') {
                  let have = false;
                  options.map(option => {
                    have = have || option.value === item.params;
                  });
                  have && targetParams.push(item)
                } else {
                  targetParams.push(item)
                }
              });

              this.setState({ structureId: value, params: targetParams, tableLoading: false }, () => {
                this.setFieldsByStructureId();
              });
            });
          });
        });
        break;
      case "TYPE":
        this.getBudgetBalanceDetail(value)
        break;
    }
  };

  //获取预算余额明细
  getBudgetBalanceDetail = (id) => {

    if (!id) return;

    this.setState({ loading: true });

    budgetBalanceQueryService.getBudgetBalanceDetail(id).then(res => {
      // console.log(res.data);
      let { paramsKey, paramValueMap, chooserTypeList } = this.state;
      let params = [];
      res.data.queryLineList.map((item, index) => {
        let newParams = { type: item.parameterType, params: item.parameterCode, value: [], key: paramsKey, allFlag: item.allFlag, dataSource: [] };

        let mapItem = item.parameterType === 'BGT_RULE_PARAMETER_DIM' ? this.state.costCenterSelectorItem : item.allFlag ? paramValueMap[item.parameterCode] : chooserTypeList[item.parameterCode];

        if (item.parameterType === 'BGT_RULE_PARAMETER_DIM') {
          newParams.paramMap = {  //成本中心所需要的selectorItem，url需要在params的onChange里手动添加
            listType: 'cost_center_item_by_id',
            labelKey: 'name',
            valueKey: 'id',
            codeKey: 'code',
            listExtraParams: { costCenterId: item.parameterCode, allFlag: true },
            selectorItem: undefined
          };
        }

        item.queryParameterList && item.queryParameterList.map(queryParameter => {
          let val = {};

          if (item.parameterCode !== 'CURRENCY')
            val[mapItem.codeKey] = queryParameter.parameterValueCode;
          val[mapItem.valueKey] = item.parameterCode === 'CURRENCY' ? queryParameter.parameterValueCode : queryParameter.parameterValueId;
          val[mapItem.labelKey] = queryParameter.parameterValueName;
          newParams.value.push(val);
          newParams.dataSource.push(val);

        });
        newParams.disabled = !newParams.allFlag;
        params.push(newParams);
        paramsKey++;
        //获得参数列的选择项
        this.handleFocusParamSelect(index, item.parameterType)
      });

      this.setState({ params, paramsKey, dataSource: params, solutionHeaderId: id, loading: false }, () => {
        if (this.state.structureId) {
          this.filterList();
        }
      });
    })
  }

  onChangeSelect = (item, value, index) => {
    let valueWillSet = {};
    let { searchForm } = this.state;
    if (index !== undefined) {
      searchForm[index].items = searchForm[index].items.map(searchItem => {
        if (searchItem.id === item.id) {
          valueWillSet[searchItem.id] = value.value + '';
          if (searchItem.options.length === 0 || (searchItem.options.length === 1 && searchItem.options[0].temp)) {
            let dataOption = {};
            dataOption[item.type === 'value_list' ? 'code' : item.valueKey] = value.value;
            dataOption[item.type === 'value_list' ? 'messageKey' : item.labelKey] = value.label;
            searchItem.options = [{ label: value.label, key: value.value, value: dataOption, temp: true }];
          }
        }
        return searchItem;
      });
    } else {
      searchForm = searchForm.map(searchItem => {
        if (searchItem.id === item.id) {
          valueWillSet[searchItem.id] = value.value + '';
          if (searchItem.options.length === 0 || (searchItem.options.length === 1 && searchItem.options[0].temp)) {
            let dataOption = {};
            dataOption[item.type === 'value_list' ? 'code' : item.valueKey] = value.value;
            dataOption[item.type === 'value_list' ? 'messageKey' : item.labelKey] = value.label;
            searchItem.options = [{ label: value.label, key: value.value, value: dataOption, temp: true }];
          }
        }
        return searchItem;
      });
    }
    this.setState({ searchForm }, () => {
      this.props.form.setFieldsValue(valueWillSet);
    });
    let handle = item.event ? (event) => this.handleEvent(event, item.event) : () => { };
    handle();
  };

  //渲染搜索表单组件
  renderFormItem(item) {
    let handle = item.event ? (event) => this.handleEvent(event, item.event) : () => { };
    switch (item.type) {
      //选择组件
      case 'select': {
        return (
          <Select placeholder={messages('common.please.select')}
            onChange={handle}
            disabled={item.disabled}
            allowClear
            labelInValue={!!item.entity}
            onFocus={item.getUrl ? () => this.getOptions(item) : () => { }}>
            {item.options.map((option) => {
              return <Option key={'' + option.key}>{option.label}</Option>
            })}
          </Select>
        )
      }
      //值列表选择组件
      case 'value_list': {
        return (
          <Select placeholder={messages('common.please.select')}
            onChange={handle}
            disabled={item.disabled}
            allowClear
            labelInValue={!!item.entity}
            onFocus={() => this.getValueListOptions(item)}>
            {item.options.map((option) => {
              return <Option key={'' + option.key}>{option.label}</Option>
            })}
          </Select>
        )
      }
      //同一单元格下多个表单项组件
      case 'items': {
        return (
          <Row gutter={10} key={item.id}>
            {item.items.map(searchItem => {
              return (
                <Col span={parseInt(24 / item.items.length)} key={searchItem.id}>
                  <FormItem label={searchItem.label} colon={false}>
                    {this.props.form.getFieldDecorator(searchItem.id, {
                      initialValue: searchItem.defaultValue,
                      rules: [{
                        required: searchItem.isRequired,
                        message: messages("common.can.not.be.empty", { name: searchItem.label }),  //name 不可为空
                      }]
                    })(
                      this.renderFormItem(searchItem)
                      )}
                  </FormItem>
                </Col>
              )
            }
            )}
          </Row>
        )
      }
    }
  }

  getFields() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {};
    const children = [];
    this.state.searchForm.map((item, i) => {
      children.push(
        <Col span={8} key={item.id}>
          {item.type === 'items' ? this.renderFormItem(item) :
            <FormItem {...formItemLayout} label={item.label} colon={false}>
              {getFieldDecorator(item.id, {
                initialValue: item.defaultValue,
                rules: [{
                  required: item.isRequired,
                  message: messages("common.can.not.be.empty", { name: item.label }),  //name 不可为空
                }]
              })(
                this.renderFormItem(item)
                )}
            </FormItem>
          }
        </Col>
      );
    });
    return children;
  }

  handleChangeConditionCode = (e) => {
    this.setState({ conditionCode: e.target.value })
  };

  render() {
    const { params, columns, showSlideFrame, showSaveModal, saving, condition, conditionCode, conditionName, saveNewCondition, searching, loading } = this.state;
    return (
      <div className="budget-balance">
        <Form
          className="ant-advanced-search-form"
          onSubmit={this.search}
        >
          <div className="base-condition">
            <div className="base-condition-title">{messages('common.baseInfo')}</div>
            <Row gutter={40} className="base-condition-content" type="flex" align="top">{this.getFields()}</Row>
          </div>
          <div className="footer-operate">
            <Button type="primary" htmlType="submit" loading={searching}>{messages('common.search')}</Button>
            <Button style={{ marginLeft: 10, marginRight: 20 }} onClick={this.clear}>{messages('common.reset')}</Button>
            <Button style={{ marginRight: 10 }} onClick={this.showSaveModal}>{messages('budget.balance.save.condition')/* 保存方案 */}</Button>
            <Button onClick={() => { this.setState({ showSlideFrame: true }) }}>{messages('budget.balance.use.condition')/* 使用现有方案 */}</Button>
            {condition ? <div className="condition-name">{messages('budget.balance.using')}{condition.conditionName}</div> : null}
          </div>
          <div className="table-header">
            <div className="table-header-title">{messages('budget.balance.search.dimension')/* 查询维度 */}</div>
          </div>
          <Table columns={columns}
            dataSource={params}
            bordered
            loading={loading}
            pagination={false}
            size="middle" />
        </Form>
        <SlideFrame content={BudgetBalanceCondition}
          title={messages('budget.balance.my.condition')/* 我的方案 */}
          show={showSlideFrame}
          onClose={() => this.setState({ showSlideFrame: false })}
          afterClose={this.useCondition} />
        <Modal title={messages('budget.balance.save.condition')/* 保存方案 */}
          visible={showSaveModal}
          onCancel={() => { this.setState({ showSaveModal: false }) }}
          onOk={this.handleSaveCondition}
          confirmLoading={saving}>
          <div className="save-modal-content">
            <div>{messages('budget.balance.condition.code')/* 方案代码 */}</div>
            <Input onChange={this.handleChangeConditionCode} value={conditionCode} />
            <div>{messages('budget.balance.condition.name')/* 方案名称 */}</div>
            <Input onChange={(e) => this.setState({ conditionName: e.target.value })} value={conditionName} />
            <br />
            {condition ? <Checkbox checked={saveNewCondition} defaultValu={saveNewCondition} onChange={(e) => { this.setState({ saveNewCondition: e.target.checked }) }}>{messages('budget.balance.save.as.new.condition')/* 保存为新方案 */}</Checkbox> : null}
          </div>
        </Modal>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    company: state.login.company,
    organization: state.login.organization
  }
}

BudgetBalance.contextTypes = {
  router: React.PropTypes.object
};


const WrappedBudgetBalance = Form.create()(BudgetBalance);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedBudgetBalance);
