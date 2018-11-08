import React from 'react';
import { connect } from 'dva';
import { deepCopy } from 'utils/extend';
import constants from 'share/constants';
import TagSelect from 'components/TagSelect';
import config from 'config';
import moment from 'moment';
import chooserData from 'share/chooserData';
import {
  Form,
  Button,
  Icon,
  Select,
  InputNumber,
  DatePicker,
  Input,
  message,
  Row,
  Col,
  Modal,
} from 'antd';
const Option = Select.Option;
import PropTypes from 'prop-types';

import { SelectDepOrPerson } from 'widget/index';
import Selector from 'widget/selector';
import ListSearcher from 'widget/list-searcher';
import ListSelector from 'widget/list-selector';
import ExpenseTypeSelector from 'widget/Template/expense-type-selector';
import workflowService from 'containers/setting/workflow/workflow.service';

class ConditionForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      condition: deepCopy(this.props.condition),
      containRuleList: [], //包含 不包含 条件数组
      inRuleList: [], //包含 不包含 为空 不为空 条件数组
      moreThanRuleList: [], //大于 大于等于 条件数组
      lessThanAndEqualRuleList: [], //小于 小于等于 等于 条件数组
      booleanRuleList: [], //是 否 条件数组
      depRoleVisible: false, //选择部门角色弹框是否显示
      depLevelVisible: false, //选择部门层级弹框是否显示
      expenseTypeVisible: false, //选择费用类型弹框是否显示
      costCenterVisible: false, //选择成本中心弹框是否显示
      entityVisible: false, //选择法人实体弹框是否显示
      currencyVisible: false, //选择币种弹框是否显示
      companyVisible: false, //选择公司弹框是否显示
      depLevelValue: [], //已选的部门层级值
      depRoleValue: [], //已选的部门角色值
      expenseTypeValue: [], //已选的费用类型值
      companyValue: [], //已选的公司值
      entityValue: [], //已选的法人实体
      costCenterValue: [], //已选的成本中心
      currencyValue: [], //已选的币种
      costCenterSelectorItem: null, //成本中心的selectorItem
      currCostCenter: null, //当前成本中心
      depLevel: [
        //部门层级
        { id: 1, name: this.$t('workflow.detail.level1') }, //一级
        { id: 2, name: this.$t('workflow.detail.level2') }, //二级
        { id: 3, name: this.$t('workflow.detail.level3') }, //三级
        { id: 4, name: this.$t('workflow.detail.level4') }, //四级
        { id: 5, name: this.$t('workflow.detail.level5') }, //五级
        { id: 6, name: this.$t('workflow.detail.level6') }, //六级
        { id: 7, name: this.$t('workflow.detail.level7') }, //七级
        { id: 8, name: this.$t('workflow.detail.level8') }, //八级
        { id: 9, name: this.$t('workflow.detail.level9') }, //九级
        { id: 10, name: this.$t('workflow.detail.level10') }, //十级
      ],
      deleteConditionOID: [], //删除的条件OID
      custListRemark: '', //选择值列表的remark
    };
  }

  componentDidMount() {
    this.renderSymbolsType();
    this.getDefaultValues();
  }

  componentWillReceiveProps(nextProps) {
    //条件在编辑状态下，添加审批条件，remark为cust_list时需要field和refCostCenterOID同时区分
    //条件在编辑状态下，添加审批条件，remark为judge_cost_center时需要field和remark同时区分
    let condition = this.state.condition;
    let currConditionField = [];
    let nextConditionField = [];
    let deleteConditionOID = this.state.deleteConditionOID;
    condition.map(item => {
      if (item.remark === 'cust_list') {
        currConditionField.push(`${item.field}_${item.refCostCenterOID}`);
      } else if (item.remark === 'judge_cost_center') {
        currConditionField.push(`${item.field}_${item.remark}`);
      } else {
        currConditionField.push(item.field);
      }
    });
    nextProps.condition.map(item => {
      if (item.remark === 'cust_list') {
        nextConditionField.push(`${item.field}_${item.refCostCenterOID}`);
      } else if (item.remark === 'judge_cost_center') {
        nextConditionField.push(`${item.field}_${item.remark}`);
      } else {
        nextConditionField.push(item.field);
      }
    });
    for (let i = 0; i < currConditionField.length; i++) {
      if (nextConditionField.indexOf(currConditionField[i]) === -1) {
        condition[i].ruleConditionOID && deleteConditionOID.push(condition[i].ruleConditionOID);
        currConditionField.delete(currConditionField[i]);
        condition.splice(i, 1);
        i--;
      }
    }
    nextConditionField.map((field, index) => {
      currConditionField.indexOf(field) === -1 && condition.push(nextProps.condition[index]);
    });
    this.setState({ condition, deleteConditionOID });
    //删除值列表的值
    if (
      nextProps.deleteTagValue.value &&
      nextProps.deleteTagValue.value !== this.props.deleteTagValue.value
    ) {
      this.handleDeleteValueDetail(nextProps.deleteTagValue.remark, nextProps.deleteTagValue.value);
    }
  }

  //获取默认值
  getDefaultValues = ruleItem => {
    let condition = this.state.condition;
    let depLevelValue = [];
    let depRoleValue = [];
    let expenseTypeValue = [];
    let companyValue = [];
    let entityValue = [];
    let costCenterValue = [];
    let currencyValue = [];
    condition.map(item => {
      if (
        ruleItem &&
        (ruleItem.ruleConditionOID
          ? item.ruleConditionOID === ruleItem.ruleConditionOID
          : item.field === ruleItem.field)
      ) {
        switch (item.remark) {
          case 'default_department_level':
            if (item.valueDetail && JSON.parse(item.valueDetail)) {
              (JSON.parse(item.valueDetail).value || []).map(id => {
                depLevelValue.push(Number(id));
              });
            }
            break;
          case 'default_department_role':
            if (item.valueDetail && JSON.parse(item.valueDetail)) {
              (JSON.parse(item.valueDetail).value || []).map(code => {
                JSON.parse(item.fieldContent || '[]').map(field => {
                  if (field.id === code)
                    depRoleValue.push({ positionCode: code, positionName: field.name });
                });
              });
            }
            break;
          case 'default_expense_type':
            if (item.valueDetail && JSON.parse(item.valueDetail)) {
              (JSON.parse(item.valueDetail).value || []).map(oid => {
                (item.showValue || []).map(showItem => {
                  if (showItem.expenseTypeOID === oid)
                    expenseTypeValue.push({
                      expenseTypeOID: oid,
                      name: showItem.name,
                      enable: showItem.enable,
                    });
                });
              });
            }
            break;
          case 'select_cost_center':
            if (item.valueDetail && JSON.parse(item.valueDetail)) {
              (JSON.parse(item.valueDetail).value || []).map(oid => {
                costCenterValue.push({ costCenterItemOID: oid, name: item.showValue[oid] });
              });
            }
            break;
          case 'currency_code':
            if (item.valueDetail && JSON.parse(item.valueDetail)) {
              (JSON.parse(item.valueDetail).value || []).map(code => {
                currencyValue.push({
                  currencyCode: code,
                  fullName: constants.getTextByValue(code, 'cashName'),
                });
              });
            }
            break;
          case 'select_company':
          case 'default_applicant_company':
            if (item.valueDetail && JSON.parse(item.valueDetail)) {
              (JSON.parse(item.valueDetail).value || []).map(oid => {
                companyValue.push({ companyOID: oid, name: item.showValue[oid] });
              });
            }
            break;
          case 'select_corporation_entity':
          case 'default_corporation_entity':
            if (item.valueDetail && JSON.parse(item.valueDetail)) {
              (JSON.parse(item.valueDetail).value || []).map(oid => {
                entityValue.push({ companyReceiptedOID: oid });
              });
            }
            break;
          default:
            return;
        }
      }
    });
    this.setState({
      condition,
      depLevelValue,
      depRoleValue,
      expenseTypeValue,
      companyValue,
      entityValue,
      costCenterValue,
      currencyValue,
    });
  };

  //条件数组分类
  renderSymbolsType = () => {
    let symbolsType = this.props.symbolsType;
    let containRuleList = [];
    let inRuleList = [];
    let moreThanRuleList = [{ name: this.$t('workflow.detail.symbol.none' /*无*/), key: '0' }];
    let lessThanAndEqualRuleList = [
      { name: this.$t('workflow.detail.symbol.none' /*无*/), key: '0' },
    ];
    let booleanRuleList = [];
    symbolsType.map(item => {
      if (item.key === 9001 || item.key === 9002) {
        moreThanRuleList.push({
          name: constants.getTextByValue(item.key, 'symbolFilter'),
          key: item.key + '',
        });
      }
      if (item.key === 9003 || item.key === 9004 || item.key === 9005) {
        lessThanAndEqualRuleList.push({
          name: constants.getTextByValue(item.key, 'symbolFilter'),
          key: item.key + '',
        });
      }
      if (item.key === 9007 || item.key === 9008) {
        containRuleList.push({
          name: constants.getTextByValue(item.key, 'symbolFilter'),
          key: item.key + '',
        });
      }
      if (item.key === 9009 || item.key === 9010 || item.key === 9015 || item.key === 9016) {
        inRuleList.push({
          name: constants.getTextByValue(item.key, 'symbolFilter'),
          key: item.key + '',
        });
      }
      if (item.key === 9012 || item.key === 9013) {
        booleanRuleList.push({
          name: constants.getTextByValue(item.key, 'symbolFilter'),
          key: item.key + '',
        });
      }
    });
    this.setState({
      containRuleList,
      inRuleList,
      moreThanRuleList,
      lessThanAndEqualRuleList,
      booleanRuleList,
    });
  };

  //判断条件类型
  checkConditionType = remark => {
    if (remark === 'out_participant_num') {
      return 'long'; //整数类型
    }
    if (
      remark === 'total_budget' ||
      remark === 'average_budget' ||
      remark === 'default_total_amount' ||
      remark === 'amount' ||
      remark === 'default_amount' ||
      remark === 'number'
    ) {
      return 'double'; //浮点类型
    }
    if (
      remark === 'start_date' ||
      remark === 'end_date' ||
      remark === 'date' ||
      remark === 'common.date'
    ) {
      return 'date'; //日期类型
    }
    if (
      remark === 'title' ||
      remark === 'input' ||
      remark === 'remark' ||
      remark === 'out_participant_name' ||
      remark === 'text_area' ||
      remark === 'select_box'
    ) {
      return 'text'; //文本类型
    }
    if (
      remark === 'boolean' ||
      remark === 'writeoff_flag' ||
      remark === 'substitution_invoice' ||
      remark === 'control_beyound_application' ||
      remark === 'control_beyound_position' ||
      remark === 'judge_cost_center' ||
      remark === 'control_beyound_budget' ||
      remark === 'control_beyound_travel_standard' ||
      remark === 'switch' ||
      remark === 'linkage_switch'
    ) {
      return 'boolean'; //布尔类型
    }
    if (
      remark === 'select_participant' ||
      remark === 'select_approver' ||
      remark === 'applicant' ||
      remark === 'select_user' ||
      remark === 'cust_list' ||
      remark === 'select_cost_center' ||
      remark === 'select_department' ||
      remark === 'select_special_booking_person' ||
      remark === 'select_corporation_entity' ||
      remark === 'default_corporation_entity' ||
      remark === 'default_expense_type' ||
      remark === 'default_department' ||
      remark === 'currency_code' ||
      remark === 'select_air_ticket_supplier' ||
      remark === 'default_department_level' ||
      remark === 'default_department_path' ||
      remark === 'default_department_role' ||
      remark === 'select_company' ||
      remark === 'default_applicant_company'
    ) {
      return 'custList'; //值列表类型
    }
  };

  //选择值列表的值
  handleSelectValueDetail = item => {
    this.getDefaultValues(item);
    this.setState({ custListRemark: item.remark });
    switch (item.remark) {
      case 'default_department_level': //部门层级
        this.setState({ depLevelVisible: true });
        break;
      case 'default_department_role': //部门角色
        this.setState({ depRoleVisible: true });
        break;
      case 'default_expense_type': //费用类型
        this.setState({ expenseTypeVisible: true });
        break;
      case 'select_cost_center':
        let costCenterSelectorItem = JSON.parse(JSON.stringify(chooserData['cost_center_item']));
        costCenterSelectorItem.url = `${config.baseUrl}/api/cost/center/items/${
          item.customEnumerationOID
          }/all`;
        this.setState(
          {
            costCenterSelectorItem,
            currCostCenter: {
              field: item.field,
              refCostCenterOID: item.refCostCenterOID,
            },
          },
          () => {
            this.setState({ costCenterVisible: true });
          }
        );
        break;
      case 'currency_code':
        this.setState({ currencyVisible: true });
        break;
      case 'select_company':
      case 'default_applicant_company':
        this.setState({ companyVisible: true });
        break;
      case 'select_corporation_entity':
      case 'default_corporation_entity':
        this.setState({ entityVisible: true });
        break;
      default:
        message.error(this.$t('common.error1'));
    }
  };

  //添加部门层级
  handleAddDepLevel = () => {
    let condition = this.state.condition;
    condition.map((item, index) => {
      if (item.remark === 'default_department_level') {
        let valueDetail = JSON.parse(condition[index].valueDetail || '{}');
        valueDetail.value = this.state.depLevelValue;
        condition[index].valueDetail = JSON.stringify(valueDetail);
      }
    });
    this.setState({
      condition,
      depLevelVisible: false,
    });
  };

  //添加部门角色
  handleAddDepRole = value => {
    let condition = this.state.condition;
    let code = [];
    value.result.map(item => {
      code.push(item.positionCode);
    });
    condition.map((item, index) => {
      if (item.remark === 'default_department_role') {
        let valueDetail = JSON.parse(condition[index].valueDetail || '{}');
        valueDetail.value = code;
        condition[index].valueDetail = JSON.stringify(valueDetail);
      }
    });
    this.setState({
      condition,
      depRoleValue: value.result,
      depRoleVisible: false,
    });
  };

  //添加部门路径/部门
  handleAddDepPath = (values, remark) => {
    let condition = this.state.condition;
    let valueOIDs = [];
    let value = [];
    let showValue = {}; //用于编辑状态下显示部门，避免请求接口去获取显示值
    condition.map(item => {
      if (remark === 'select_department') showValue = item.showValue || {};
    });
    values.map(item => {
      valueOIDs.push(item.departmentOID);
      value.push(item.path);
      remark === 'select_department' && (showValue[item.departmentOID] = item.name);
    });
    condition.map((item, index) => {
      if (item.remark === remark) {
        let valueDetail = JSON.parse(condition[index].valueDetail || '{}');
        if (valueDetail.value && valueDetail.value.length) {
          valueOIDs.map((oid, oidIndex) => {
            if (remark === 'default_department_path' && valueDetail.valueOIDs.indexOf(oid) === -1) {
              valueDetail.valueOIDs.push(oid);
              valueDetail.value.push(value[oidIndex]);
            } else if (remark === 'select_department' && valueDetail.value.indexOf(oid) === -1) {
              valueDetail.value.push(oid);
            }
          });
        } else {
          valueDetail =
            remark === 'default_department_path' ? { value, valueOIDs } : { value: valueOIDs };
        }
        remark === 'select_department' && (condition[index].showValue = showValue);
        condition[index].valueDetail = JSON.stringify(valueDetail);
      }
    });
    this.setState({ condition });
  };

  //添加费用类型
  handleAddExpenseType = () => {
    let condition = this.state.condition;
    let oid = [];
    let showValue = []; //用于编辑状态下显示成本中心值，避免请求接口去获取显示值
    this.state.expenseTypeValue.map(item => {
      oid.push(item.expenseTypeOID);
      showValue.push({
        expenseTypeOID: item.expenseTypeOID,
        name: item.name,
        enable: item.enable || item.enabled,
      });
    });
    condition.map((item, index) => {
      if (item.remark === 'default_expense_type') {
        let valueDetail = JSON.parse(condition[index].valueDetail || '{}');
        valueDetail.value = oid;
        condition[index].valueDetail = JSON.stringify(valueDetail);
        condition[index].showValue = showValue;
      }
    });
    this.setState({ condition, expenseTypeVisible: false });
  };

  //添加成本中心
  handleAddCostCenter = values => {
    let condition = this.state.condition;
    let currCostCenter = this.state.currCostCenter;
    let oid = [];
    let costCenterValue = [];
    let showValue = {}; //用于编辑状态下显示成本中心值，避免请求接口去获取显示值
    values.result.map(item => {
      oid.push(item.costCenterItemOID);
      costCenterValue.push({ costCenterItemOID: item.costCenterItemOID });
      showValue[item.costCenterItemOID] = item.name;
    });
    condition.map((item, index) => {
      if (
        item.remark === 'select_cost_center' &&
        item.field === currCostCenter.field &&
        item.refCostCenterOID === currCostCenter.refCostCenterOID
      ) {
        let valueDetail = JSON.parse(condition[index].valueDetail || '{}');
        valueDetail.value = oid;
        condition[index].showValue = showValue;
        condition[index].valueDetail = JSON.stringify(valueDetail);
      }
    });
    this.setState({ condition, costCenterValue, costCenterVisible: false });
  };

  //添加法人实体
  handleAddEntity = values => {
    let condition = this.state.condition;
    let oid = [];
    let entityValue = [];
    let showValue = {}; //用于编辑状态下显示成本中心值，避免请求接口去获取显示值
    values.result.map(item => {
      oid.push(item.companyReceiptedOID);
      entityValue.push({ companyReceiptedOID: item.companyReceiptedOID });
      showValue[item.companyReceiptedOID] = item.companyName;
    });
    condition.map((item, index) => {
      if (
        (item.remark === 'select_corporation_entity' ||
          item.remark === 'default_corporation_entity') &&
        item.remark === this.state.custListRemark
      ) {
        let valueDetail = JSON.parse(condition[index].valueDetail || '{}');
        valueDetail.value = oid;
        condition[index].showValue = showValue;
        condition[index].valueDetail = JSON.stringify(valueDetail);
      }
    });
    this.setState({ condition, entityValue, entityVisible: false });
  };

  //添加币种
  handleAddCurrency = value => {
    let condition = this.state.condition;
    let code = [];
    value.result.map(item => {
      code.push(item.currencyCode);
    });
    condition.map((item, index) => {
      if (item.remark === 'currency_code') {
        let valueDetail = JSON.parse(condition[index].valueDetail || '{}');
        valueDetail.value = code;
        condition[index].valueDetail = JSON.stringify(valueDetail);
      }
    });
    this.setState({ condition, currencyValue: value.result, currencyVisible: false });
  };

  //添加公司
  handleAddCompany = values => {
    let condition = this.state.condition;
    let oid = [];
    let companyValue = [];
    let showValue = {}; //用于编辑状态下显示成本中心值，避免请求接口去获取显示值
    values.result.map(item => {
      oid.push(item.companyOID);
      companyValue.push({ companyOID: item.companyOID });
      showValue[item.companyOID] = item.name;
    });
    condition.map((item, index) => {
      if (
        (item.remark === 'select_company' || item.remark === 'default_applicant_company') &&
        item.remark === this.state.custListRemark
      ) {
        let valueDetail = JSON.parse(condition[index].valueDetail || '{}');
        valueDetail.value = oid;
        condition[index].showValue = showValue;
        condition[index].valueDetail = JSON.stringify(valueDetail);
      }
    });
    this.setState({ condition, companyValue, companyVisible: false });
  };

  //修改值列表的值
  handleCustListValueChange = (value, customEnumerationOID, refCostCenterOID) => {
    let condition = this.state.condition;
    condition.map((item, index) => {
      if (
        item.remark === 'cust_list' &&
        item.customEnumerationOID === customEnumerationOID &&
        (!refCostCenterOID || item.refCostCenterOID === refCostCenterOID)
      ) {
        if (!refCostCenterOID) {
          //普通值列表
          let valueDetail = item.valueDetail ? JSON.parse(item.valueDetail) : {};
          valueDetail.value = [value.code];
          valueDetail.valueOIDs = [value.customEnumerationItemOID];
          condition[index].valueDetail = JSON.stringify(valueDetail);
          condition[index].showValue = value.messageKey;
        }
        if (refCostCenterOID && item.refCostCenterOID === refCostCenterOID) {
          //成本中心值列表
          condition[index].value = value.messageKey;
        }
      }
    });
    this.setState({ condition });
  };

  //删除值列表的值
  handleDeleteValueDetail = (remark, value) => {
    let condition = this.state.condition;
    condition.map((item, index) => {
      if (item.remark === remark && remark === 'default_department_level') {
        let depLevelValue = this.state.depLevelValue;
        depLevelValue.delete(Number(value));
        this.setState({ depLevelValue });
        this.updateConditionByDeleteValue(value, index);
      }
      if (item.remark === remark && remark === 'default_department_path') {
        let valueDetail = JSON.parse(item.valueDetail);
        valueDetail.valueOIDs.map((oid, oidIndex) => {
          if (oid === value) {
            valueDetail.value.splice(oidIndex, 1);
            valueDetail.valueOIDs.splice(oidIndex, 1);
          }
        });
        condition[index].valueDetail = JSON.stringify(valueDetail);
      }
      if (item.remark === remark && remark === 'default_department_role') {
        let depRoleValue = this.state.depRoleValue;
        depRoleValue.map((roleItem, roleIndex) => {
          roleItem.positionCode === value && depRoleValue.splice(roleIndex, 1);
        });
        this.setState({ depRoleValue });
        this.updateConditionByDeleteValue(value, index);
      }
      if (item.remark === remark && remark === 'default_expense_type') {
        let expenseTypeValue = this.state.expenseTypeValue;
        expenseTypeValue.map((expenseItem, expenseIndex) => {
          expenseItem.expenseTypeOID === value && expenseTypeValue.splice(expenseIndex, 1);
        });
        this.setState({ expenseTypeValue });
        this.updateConditionByDeleteValue(value, index);
      }
      if (item.remark === remark && remark === 'select_department') {
        this.updateConditionByDeleteValue(value, index);
      }
      if (item.remark === remark && remark === 'currency_code') {
        let currencyValue = this.state.currencyValue;
        currencyValue.map((currencyItem, currencyIndex) => {
          currencyItem.currencyCode === value && currencyValue.splice(currencyIndex, 1);
        });
        this.setState({ currencyValue });
        this.updateConditionByDeleteValue(value, index, 'currencyCode');
      }
      if (item.remark === remark && remark === 'select_cost_center') {
        let costCenterValue = this.state.costCenterValue;
        costCenterValue.map((costCenterItem, costCenterIndex) => {
          costCenterItem.costCenterItemOID === value && costCenterValue.splice(costCenterIndex, 1);
        });
        this.setState({ costCenterValue });
        this.updateConditionByDeleteValue(value, index, 'costCenterItemOID');
      }
      if (
        item.remark === remark &&
        (remark === 'select_company' || remark === 'default_applicant_company')
      ) {
        let companyValue = this.state.companyValue;
        companyValue.map((companyItem, companyIndex) => {
          companyItem.companyOID === value && companyValue.splice(companyIndex, 1);
        });
        this.setState({ companyValue });
        this.updateConditionByDeleteValue(value, index);
      }
      if (
        item.remark === remark &&
        (remark === 'select_corporation_entity' || remark === 'default_corporation_entity')
      ) {
        let entityValue = this.state.entityValue;
        entityValue.map((entityItem, entityIndex) => {
          entityItem.companyReceiptedOID === value && entityValue.splice(entityIndex, 1);
        });
        this.setState({ entityValue });
        this.updateConditionByDeleteValue(value, index);
      }
    });
    this.setState({ condition }, () => {
      this.props.afterDeleteTagValue();
    });
  };

  //通过删除值列表的值更新条件
  updateConditionByDeleteValue = (value, index, key) => {
    let condition = this.state.condition;
    let valueDetail = JSON.parse(condition[index].valueDetail);
    valueDetail.value.delete(value);
    condition[index].valueDetail = JSON.stringify(valueDetail);
    if (key) {
      let defaultValue = condition[index].defaultValue || [];
      for (let i = 0; i < defaultValue.length; i++) {
        if (defaultValue[i][key] === value) {
          defaultValue.splice(i, 1);
          i--;
        }
      }
      condition[index].defaultValue = defaultValue;
    }
    this.setState({ condition });
  };

  //修改运算符
  handleSymbolChange = (item, symbol, customEnumerationOID, refCostCenterOID) => {
    let condition = this.state.condition;
    condition.map((conditionItem, index) => {
      if (
        conditionItem.remark === item.remark &&
        conditionItem.field === item.field &&
        (item.remark !== 'cust_list' ||
          (conditionItem.customEnumerationOID === customEnumerationOID &&
            (!refCostCenterOID || conditionItem.refCostCenterOID === refCostCenterOID)))
      ) {
        condition[index].symbol = symbol;
        if (String(symbol) === '9015' || String(symbol) === '9016') {
          condition[index].value = null;
          condition[index].valueDetail = null;
          condition[index].defaultValue = null;
          item.remark === 'default_department_level' && this.setState({ depLevelValue: [] });
          item.remark === 'default_department_role' && this.setState({ depRoleValue: [] });
          item.remark === 'default_expense_type' && this.setState({ expenseTypeValue: [] });
          (item.remark === 'select_company' || item.remark === 'default_applicant_company') &&
            this.setState({ companyValue: [] });
          (item.remark === 'select_corporation_entity' ||
            item.remark === 'default_corporation_entity') &&
            this.setState({ entityValue: [] });
          item.remark === 'select_cost_center' && this.setState({ costCenterValue: [] });
          item.remark === 'currency_code' && this.setState({ currencyValue: [] });
        }
      }
    });
    this.setState({ condition });
  };

  //修改范围值的运算符
  handleRangeSymbolChange = (item, symbol, isLeftValue) => {
    let condition = this.state.condition;
    condition.map((conditionItem, index) => {
      if (conditionItem.remark === item.remark) {
        let valueDetail = JSON.parse(conditionItem.valueDetail || '{}');
        let list = valueDetail.list || [{}, {}];
        list[isLeftValue ? 0 : 1].symbol = symbol;
        list &&
          list.map((listItem, listIndex) => {
            if (!listItem.value && !Number(listItem.symbol)) {
              list[listIndex].value = null;
              list[listIndex].symbol = null;
            }
          });
        valueDetail.list = list;
        condition[index].valueDetail = JSON.stringify(valueDetail);
      }
    });
    this.setState({ condition });
  };

  //type === 'text'时，修改值
  handleTextValueChange = (e, item) => {
    let condition = this.state.condition;
    condition.map((conditionItem, index) => {
      if (conditionItem.remark === item.remark) {
        condition[index].value = e.target.value;
      }
    });
    this.setState({ condition });
  };

  //type === 'long' || type === 'double' || type === 'date'时，修改值
  handleRangeChange = (value, item, isLeftValue) => {
    let condition = this.state.condition;
    condition.map((conditionItem, index) => {
      if (conditionItem.remark === item.remark) {
        let valueDetail = JSON.parse(conditionItem.valueDetail || '{}');
        valueDetail.list &&
          valueDetail.list.map((listItem, listIndex) => {
            if (!listItem.value && !Number(listItem.symbol)) {
              valueDetail.list[listIndex].value = null;
              valueDetail.list[listIndex].symbol = null;
            }
          });
        let list = valueDetail.list || [{}, {}];
        list[isLeftValue ? 0 : 1].value = value;
        valueDetail.list = list;
        condition[index].valueDetail = JSON.stringify(valueDetail);
      }
    });
    this.setState({ condition });
  };

  //保存
  handleSave = () => {
    let condition = deepCopy(this.state.condition);
    let saveAble = true; //是否可以保存
    condition.map(item => {
      let type = this.checkConditionType(item.remark);
      if (
        saveAble &&
        type === 'custList' &&
        item.remark !== 'cust_list' &&
        (String(item.symbol) !== '9015' && String(item.symbol) !== '9016') &&
        (!item.valueDetail ||
          (!JSON.parse(item.valueDetail).value || !JSON.parse(item.valueDetail).value.length))
      ) {
        message.error(
          this.$t('workflow.detail.tip.select.value', { name: item.name } /*请选择{name}的条件值*/)
        );
        saveAble = false;
      }
      if (
        saveAble &&
        item.remark === 'cust_list' &&
        (String(item.symbol) !== '9015' && String(item.symbol) !== '9016') &&
        !item.value &&
        !item.valueDetail
      ) {
        message.error(
          this.$t('workflow.detail.tip.select.value', { name: item.name } /*请选择{name}的条件值*/)
        );
        saveAble = false;
      }
      if (saveAble && type === 'text' && !item.value) {
        message.error(
          this.$t('workflow.detail.tip.input.value', { name: item.name } /*请输入{name}的条件值*/)
        );
        saveAble = false;
      }
      if (saveAble && (type === 'long' || type === 'double' || type === 'date')) {
        if (!item.valueDetail) {
          message.error(
            this.$t(
              'workflow.detail.tip.select.symbol.and.value',
              { name: item.name } /*请选择{name}的条件符，条件值*/
            )
          );
          saveAble = false;
        } else {
          let list = JSON.parse(item.valueDetail).list || [{}, {}];
          if (
            saveAble &&
            !(list[0].value || list[0].value === 0) &&
            !Number(list[0].symbol || 0) &&
            !(list[1].value || list[1].value === 0) &&
            !Number(list[1].symbol || 0)
          ) {
            message.error(
              this.$t(
                'workflow.detail.tip.select.symbol.and.value',
                { name: item.name } /*请选择{name}的条件符，条件值*/
              )
            );
            saveAble = false;
          }
          list.map((listItem, listIndex) => {
            let listItemSymbol = Number(listItem.symbol || 0);
            if (saveAble && (listItem.value || listItem.value === 0) && !listItemSymbol) {
              message.error(
                this.$t(
                  'workflow.detail.tip.input.index.symbol',
                  {
                    name: item.name,
                    index:
                      this.props.language.local === 'zh_CN'
                        ? listIndex + 1
                        : listIndex
                          ? '2nd'
                          : '1st',
                  } /*请输入{name}的第{index}个条件符*/
                )
              );
              saveAble = false;
            }
            if (saveAble && !(listItem.value || listItem.value === 0) && listItemSymbol) {
              message.error(
                this.$t(
                  'workflow.detail.tip.input.index.value',
                  {
                    name: item.name,
                    index:
                      this.props.language.local === 'zh_CN'
                        ? listIndex + 1
                        : listIndex
                          ? '2nd'
                          : '1st',
                  } /*请输入{name}的第{index}个条件值*/
                )
              );
              saveAble = false;
            }
          });
          let leftValue = list[0].value;
          let rightValue = list[1].value;
          let leftSymbol = Number(list[0].symbol || 0);
          let rightSymbol = Number(list[1].symbol || 0);
          if (type === 'date') {
            if (new Date(leftValue).getTime() > new Date(rightValue).getTime()) {
              message.error(
                this.$t('workflow.detail.tip.input.date.error', {
                  name: item.name,
                }) /*请输入合法的{name}条件值，第一个时间不能比第二个时间晚*/
              );
              saveAble = false;
            }
          } else {
            if (
              saveAble &&
              leftValue &&
              rightValue &&
              (leftValue > rightValue ||
                (leftValue === rightValue && (leftSymbol === 9001 || rightSymbol === 9003)))
            ) {
              message.error(
                this.$t('workflow.detail.tip.input.value.error', {
                  name: item.name,
                }) /*请输入合法的{name}条件值，表达式不合法*/
              );
              saveAble = false;
            }
          }
        }
      }
    });
    if (saveAble) {
      let newParams = [];
      let updateParams = [];
      condition.map(item => {
        //保存时将isEdit,defaultValue和showValue删除，这几个字段只用于前端的显示，接口请求参数不需要
        item.isEdit && delete item.isEdit;
        item.defaultValue && delete item.defaultValue;
        item.showValue && delete item.showValue;
        item.valueDetail = item.valueDetail ? JSON.parse(item.valueDetail) : null;
        item.ruleConditionOID ? updateParams.push(item) : newParams.push(item);
      });
      newParams.length && this.handelSaveNewParams(newParams);
      updateParams.length && this.handelSaveUpdateParams(updateParams);
      this.state.deleteConditionOID.length &&
        workflowService.deleteRuleCondition(this.state.deleteConditionOID);
    }
  };

  //保存新增的条件
  handelSaveNewParams = params => {
    params.map((item, index) => {
      let fieldTypeId;
      switch (this.checkConditionType(item.remark)) {
        case 'text':
          fieldTypeId = 101;
          break;
        case 'long':
          fieldTypeId = 102;
          break;
        case 'double':
          fieldTypeId = 104;
          break;
        case 'date':
          fieldTypeId = 105;
          break;
        case 'custList':
          fieldTypeId = 106;
          break;
        case 'boolean':
          fieldTypeId = 108;
          break;
        default:
          fieldTypeId = null;
      }
      item.refCostCenterOID && (fieldTypeId = 101);
      params[index].entityType = 7002; //场景关联类型, 固定值
      params[index].batchCode = this.props.batchCode;
      params[index].fieldTypeId = fieldTypeId;
      params[index].value = params[index].value || null;
      if (
        this.checkConditionType(item.remark) !== 'long' &&
        this.checkConditionType(item.remark) !== 'double' &&
        this.checkConditionType(item.remark) !== 'date' &&
        params[index].valueDetail
      ) {
        params[index].valueDetail.fieldType = fieldTypeId;
      }
    });
    this.setState({ loading: true });
    workflowService
      .createRuleCondition(params)
      .then(res => {
        let condition = res.data;
        condition.map((item, index) => {
          this.state.condition.map(conditionItem => {
            if (
              conditionItem.remark === item.remark &&
              conditionItem.field === item.field &&
              (item.remark !== 'cust_list' ||
                conditionItem.customEnumerationOID === item.customEnumerationOID)
            ) {
              condition[index].showValue = conditionItem.showValue; //用于非编辑状态下显示成本中心值，避免请求接口去获取显示值
            }
          });
        });
        this.setState({ loading: false }, () => {
          this.props.saveNewHandle(condition);
        });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  //保存修改的条件
  handelSaveUpdateParams = params => {
    params.map((item, index) => {
      params[index].approverIndex = this.props.approverIndex;
      if (
        this.checkConditionType(item.remark) === 'long' ||
        this.checkConditionType(item.remark) === 'double' ||
        this.checkConditionType(item.remark) === 'date'
      ) {
        params[index].valueDetailList = params[index].valueDetail.list;
      }
    });
    this.setState({ loading: true });
    workflowService
      .updateRuleCondition(params)
      .then(res => {
        let condition = res.data;
        condition.map((item, index) => {
          this.state.condition.map(conditionItem => {
            if (item.ruleConditionOID === conditionItem.ruleConditionOID)
              condition[index].showValue = conditionItem.showValue; //用于非编辑状态下显示成本中心值，避免请求接口去获取显示值
          });
        });
        this.setState({ loading: false }, () => {
          this.props.saveUpdateHandle(condition);
        });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  render() {
    const { language, company } = this.props;
    const {
      loading,
      condition,
      containRuleList,
      inRuleList,
      moreThanRuleList,
      lessThanAndEqualRuleList,
      booleanRuleList,
      depRoleVisible,
      depRoleValue,
      depLevelVisible,
      depLevel,
      depLevelValue,
      expenseTypeVisible,
      expenseTypeValue,
      costCenterVisible,
      entityVisible,
      costCenterSelectorItem,
      currencyVisible,
      companyVisible,
      companyValue,
      entityValue,
      currencyValue,
      costCenterValue,
    } = this.state;
    return (
      <div className="condition-form">
        {/*div.form-container-cover 是为了点击保存按钮的时候不可再编辑表单*/}
        <div className={`form-container-cover ${loading ? 'show' : ''}`} />
        <div className="form-container">
          {containRuleList.length &&
            inRuleList.length &&
            moreThanRuleList.length &&
            lessThanAndEqualRuleList.length &&
            booleanRuleList.length &&
            condition.map((item, index) => {
              let type = this.checkConditionType(item.remark);
              if (type === 'long' || type === 'double' || type === 'date') {
                let leftCondition = item.valueDetail
                  ? (JSON.parse(item.valueDetail).list || [])[0] || {}
                  : {};
                let rightCondition = item.valueDetail
                  ? (JSON.parse(item.valueDetail).list || [])[1] || {}
                  : {};
                return (
                  <Row key={index} className="type-long-double-date">
                    {type === 'date' ? (
                      <Col span={4}>
                        <DatePicker
                          size="small"
                          format="YYYY-MM-DD"
                          defaultValue={
                            leftCondition.value ? moment(leftCondition.value) : undefined
                          }
                          onChange={e =>
                            this.handleRangeChange(moment(e).format('YYYY-MM-DD'), item, true)
                          }
                        />
                      </Col>
                    ) : (
                        <Col span={4}>
                          <InputNumber
                            precision={type === 'long' ? 0 : 2}
                            min={0}
                            size="small"
                            defaultValue={leftCondition.value}
                            onChange={value => this.handleRangeChange(value, item, true)}
                          />
                        </Col>
                      )}
                    <Col span={language.local === 'zh_CN' ? 3 : 4}>
                      <Select
                        size="small"
                        value={leftCondition.symbol || moreThanRuleList[0].key}
                        onChange={symbol => {
                          this.handleRangeSymbolChange(item, symbol, true);
                        }}
                      >
                        {moreThanRuleList.map(symbolsItem => {
                          return <Option key={symbolsItem.key}>{symbolsItem.name}</Option>;
                        })}
                      </Select>
                    </Col>
                    <span style={{ float: 'left' }}>{item.name}</span>
                    <Col span={language.local === 'zh_CN' ? 3 : 4}>
                      <Select
                        size="small"
                        value={rightCondition.symbol || lessThanAndEqualRuleList[0].key}
                        onChange={symbol => {
                          this.handleRangeSymbolChange(item, symbol);
                        }}
                      >
                        {lessThanAndEqualRuleList.map(symbolsItem => {
                          return <Option key={symbolsItem.key}>{symbolsItem.name}</Option>;
                        })}
                      </Select>
                    </Col>
                    {type === 'date' ? (
                      <Col span={4}>
                        <DatePicker
                          size="small"
                          format="YYYY-MM-DD"
                          defaultValue={
                            rightCondition.value ? moment(rightCondition.value) : undefined
                          }
                          onChange={e =>
                            this.handleRangeChange(moment(e).format('YYYY-MM-DD'), item, false)
                          }
                        />
                      </Col>
                    ) : (
                        <Col span={4}>
                          <InputNumber
                            precision={type === 'long' ? 0 : 2}
                            min={0}
                            size="small"
                            defaultValue={rightCondition.value}
                            onChange={value => this.handleRangeChange(value, item, false)}
                          />
                        </Col>
                      )}
                  </Row>
                );
              }
              if (type === 'text') {
                return (
                  <Row className="type-text" key={index}>
                    <Col span={2}>{item.name}</Col>
                    <Col span={language.local === 'zh_CN' ? 3 : 4}>
                      <Select
                        size="small"
                        value={String(item.symbol)}
                        onChange={symbol => {
                          this.handleSymbolChange(item, symbol);
                        }}
                      >
                        {containRuleList.map(symbolsItem => {
                          return <Option key={symbolsItem.key}>{symbolsItem.name}</Option>;
                        })}
                      </Select>
                    </Col>
                    <Col span={6}>
                      <Input
                        size="small"
                        defaultValue={item.value}
                        onChange={e => this.handleTextValueChange(e, item)}
                      />
                    </Col>
                  </Row>
                );
              }
              if (type === 'boolean') {
                return (
                  <Row className="type-boolean" key={index}>
                    <Col span={2}>
                      {item.remark === 'judge_cost_center' ? (
                        <span>
                          {this.$t('workflow.detail.applicant') /*申请人*/} = {item.name}
                          {this.$t('workflow.detail.manager') /*经理*/}
                        </span>
                      ) : (
                          <span>{item.name}</span>
                        )}
                    </Col>
                    <Col span={language.local === 'zh_CN' ? 3 : 4}>
                      <Select
                        size="small"
                        value={String(item.symbol)}
                        onChange={symbol => {
                          this.handleSymbolChange(item, symbol);
                        }}
                      >
                        {booleanRuleList.map(symbolsItem => {
                          return <Option key={symbolsItem.key}>{symbolsItem.name}</Option>;
                        })}
                      </Select>
                    </Col>
                  </Row>
                );
              }
              if (type === 'custList') {
                let custListSelectorItem = {
                  url: `${config.baseUrl}/api/custom/enumerations/${item.customEnumerationOID}`,
                  label: 'messageKey',
                  key: 'messageKey',
                  listKey: 'values',
                };
                return (
                  <Row className="type-cust-list" key={index}>
                    <Col span={2}>{item.name}</Col>
                    <Col span={language.local === 'zh_CN' ? 3 : 4}>
                      <Select
                        size="small"
                        value={String(item.symbol)}
                        onChange={symbol => {
                          this.handleSymbolChange(
                            item,
                            symbol,
                            item.customEnumerationOID,
                            item.refCostCenterOID
                          );
                        }}
                      >
                        {(item.remark === 'default_department_path'
                          ? containRuleList
                          : inRuleList
                        ).map(symbolsItem => {
                          return <Option key={symbolsItem.key}>{symbolsItem.name}</Option>;
                        })}
                      </Select>
                    </Col>
                    <Col span={item.remark === 'cust_list' ? 4 : 17}>
                      {item.remark !== 'cust_list' && this.props.itemValueRender(item, true)}
                      {String(item.symbol) === '9015' || String(item.symbol) === '9016' ? (
                        ''
                      ) : item.remark === 'default_department_path' ||
                        item.remark === 'select_department' ? (
                            <a style={{ whiteSpace: 'nowrap' }}>
                              {'+ '}
                              <SelectDepOrPerson
                                renderButton={false}
                                title={this.$t('common.add')}
                                onlyDep={true}
                                onConfirm={values => this.handleAddDepPath(values, item.remark)}
                              />
                            </a>
                          ) : item.remark === 'cust_list' ? (
                            <div className="selector-container">
                              <Selector
                                selectorItem={custListSelectorItem}
                                allowClear={false}
                                value={
                                  item.value ||
                                  item.showValue ||
                                  (this.props.itemValueRender(item, true) &&
                                    this.props.itemValueRender(item, true)[0])
                                }
                                placeholder={this.$t('common.please.select')}
                                entity
                                onChange={value =>
                                  this.handleCustListValueChange(
                                    value,
                                    item.customEnumerationOID,
                                    item.refCostCenterOID
                                  )
                                }
                              />
                            </div>
                          ) : (
                              <a
                                style={{ whiteSpace: 'nowrap' }}
                                onClick={() => this.handleSelectValueDetail(item)}
                              >
                                + {this.$t('common.add')}
                              </a>
                            )}
                    </Col>
                  </Row>
                );
              }
            })}
          <a onClick={this.props.addCondition}>
            <Icon type="plus-circle-o" className="add-icon" />
            {this.$t('workflow.add.approve.condition') /*添加审批条件*/}
          </a>
        </div>
        <div className="buttons">
          <Button
            type="primary"
            className="save-condition-btn"
            loading={loading}
            onClick={this.handleSave}
          >
            {this.$t('common.save')}
          </Button>
          <Button onClick={this.props.cancelHandle}>{this.$t('common.cancel')}</Button>
        </div>

        <div className="select-depLevel-modal-container" />
        <div className="select-expenseType-modal-container" />
        <Modal
          title={this.$t('common.please.select')}
          visible={depLevelVisible}
          getContainer={() => document.getElementsByClassName('select-depLevel-modal-container')[0]}
          onOk={this.handleAddDepLevel}
          onCancel={() => {
            this.setState({ depLevelVisible: false });
          }}
        >
          <TagSelect
            value={depLevelValue}
            onChange={value => {
              this.setState({ depLevelValue: value });
            }}
          >
            {depLevel.map(item => {
              return (
                <TagSelect.Option value={item.id} key={item.id}>
                  {item.name}
                </TagSelect.Option>
              );
            })}
          </TagSelect>
        </Modal>
        <ListSearcher
          visible={depRoleVisible}
          type="department_role"
          labelKey="positionName"
          showDetail
          selectedData={depRoleValue}
          filterRule={item => item.enabled}
          onOk={this.handleAddDepRole}
          onCancel={() => {
            this.setState({ depRoleVisible: false });
          }}
        />
        <Modal
          title={this.$t('workflow.select.expense.type') /*选择费用类型*/}
          visible={expenseTypeVisible}
          width={620}
          bodyStyle={{ maxHeight: 'calc(100vh - 150px)', overflow: 'auto' }}
          getContainer={() =>
            document.getElementsByClassName('select-expenseType-modal-container')[0]
          }
          onOk={this.handleAddExpenseType}
          onCancel={() => {
            this.setState({ expenseTypeVisible: false });
          }}
        >
          <ExpenseTypeSelector
            source="formV2"
            single={false}
            value={expenseTypeValue}
            param={{ formOID: this.props.formOID, isALL: true, setOfBooksId: company.setOfBooksId }}
            onSelect={values => this.setState({ expenseTypeValue: values })}
          />
        </Modal>
        <ListSelector
          type="available_company"
          visible={companyVisible}
          valueKey="companyOID"
          selectedData={companyValue}
          onOk={this.handleAddCompany}
          onCancel={() => this.setState({ companyVisible: false })}
        />
        <ListSelector
          type="corporation_entity_all"
          visible={entityVisible}
          valueKey="companyReceiptedOID"
          labelKey="companyName"
          selectedData={entityValue}
          onOk={this.handleAddEntity}
          onCancel={() => this.setState({ entityVisible: false })}
        />
        <ListSelector
          selectorItem={costCenterSelectorItem}
          visible={costCenterVisible}
          valueKey="costCenterItemOID"
          labelKey="name"
          selectedData={costCenterValue}
          onOk={this.handleAddCostCenter}
          onCancel={() => this.setState({ costCenterVisible: false })}
        />
        <ListSearcher
          visible={currencyVisible}
          type="currency"
          labelKey="fullName"
          showDetail
          selectedData={currencyValue}
          extraParams={{ companyOID: company.companyOID }}
          onOk={this.handleAddCurrency}
          onCancel={() => {
            this.setState({ currencyVisible: false });
          }}
        />
      </div>
    );
  }
}

ConditionForm.propTypes = {
  batchCode: PropTypes.number,
  approverIndex: PropTypes.number,
  formOID: PropTypes.string,
  condition: PropTypes.array,
  symbolsType: PropTypes.array,
  deleteTagValue: PropTypes.object, //审批条件中删除的值列表的值 {remark: '', value: ''}
  afterDeleteTagValue: PropTypes.func, //删除的值列表的值后的方法
  addCondition: PropTypes.func,
  saveNewHandle: PropTypes.func,
  saveUpdateHandle: PropTypes.func,
  cancelHandle: PropTypes.func,
  itemValueRender: PropTypes.func,
};

ConditionForm.contextTypes = {
  router: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    company: state.user.company,
    language: state.languages,
  };
}

const wrappedConditionForm = Form.create()(ConditionForm);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedConditionForm);
