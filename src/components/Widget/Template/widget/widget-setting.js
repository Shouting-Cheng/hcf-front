import React from 'react';
import { connect } from 'dva';
import {
  Button,
  Checkbox,
  Switch,
  Icon,
  Spin,
  Select,
  InputNumber,
  Input,
  Radio,
  Modal,
  Row,
  Col,
  TimePicker,
} from 'antd';
const RadioGroup = Radio.Group;
const Option = Select.Option;
import PropTypes from 'prop-types';

import LanguageInput from 'widget/Template/language-input/language-input';
import formService from 'containers/setting/form/form.service';
import baseService from 'share/base.service';
import 'styles/components/template/widget/widget-setting.scss';
//import { this.$t, randomString } from 'share/common'
import LinkageSwitchItem from 'widget/Template/widget/linkage-switch-item';
import moment from 'moment';

class WidgetSetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      widget: {},
      baseWidget: null,
      enumerations: {
        fetched: false,
        data: [],
        service: formService.getCustomEnumeration(
          0,
          100,
          this.props.isExtendField || this.props.tenantMode || this.props.disabled
        ),
      },
      costCenters: {},
      companyFields: {},
      loading: false,
    };
  }

  componentWillMount() {
    const { widget, widgetList } = this.props;
    this.updateWidget(widget, widgetList);

    if (this.props.isFormDesign) {
      let formOID = this.props.formOID;
      if (this.props.profile['company.contact.custom.form']) {
        formOID = this.props.profile['company.contact.custom.form'];
      }
      let companyFields = {
        fetched: false,
        data: [],
        service: formService.getFormDetail(formOID),
        listKey: 'customFormFields',
      };
      let booksID = '';
      if (this.props.tenantMode) {
        booksID = this.props.booksID;
      } else {
        booksID = this.props.company.setOfBooksId;
      }
      let costCenters = {
        fetched: false,
        data: [],
        service: baseService.getCostCenter(booksID),
      };
      this.setState({
        companyFields: companyFields,
        costCenters: costCenters,
      });
    } else {
      let companyFields = {
        fetched: false,
        data: [],
        service: formService.getFormDetail(this.props.profile['company.contact.custom.form']),
        listKey: 'customFormFields',
      };
      let costCenters = {
        fetched: false,
        data: [],
        service: baseService.getCostCenter(),
      };
      this.setState({
        companyFields: companyFields,
        costCenters: costCenters,
      });
    }
  }

  getDataBeforeRender = type => {
    const target = this.state[type];
    !target.fetched &&
      this.setState({ loading: true }, () => {
        target.service.then(res => {
          let result = {
            data: target.listKey ? res.data[target.listKey] : res.data,
            fetched: true,
            service: target.service,
          };
          this.setState({ [type]: result, loading: false });
        });
      });
  };

  //有些控件上选过的字段就不能再被选中了
  renderEmployeeExpand = () => {
    const { widget, companyFields } = this.state;
    const { nowWidgetList } = this.props;
    //处理个人扩展字段
    let selectedOIDList = [];
    let currentOID = this.getInitialValue('dataSource', 'fieldOID');
    nowWidgetList.map(singleWidget => {
      if (singleWidget.messageKey === 'employee_expand' && singleWidget.dataSource) {
        selectedOIDList.push(JSON.parse(singleWidget.dataSource).fieldOID);
      }
    });
    let companyFieldData = [];
    let isHasCurrentOID = false; //之前选择的扩展字段是否还存在，如果不存在了，则要清除
    companyFields.data &&
      companyFields.data.map(singleCompanyField => {
        if (
          selectedOIDList.indexOf(singleCompanyField.fieldOID) == -1 ||
          singleCompanyField.fieldOID === currentOID
        ) {
          companyFieldData.push(singleCompanyField);
        }
      });
    return (
      <div>
        <div className="form-title">{this.$t('widget.field.expend.field') /*选择扩展字段*/}</div>
        <Select
          disabled={this.props.disabled}
          onChange={value =>
            this.handleChangeAttr(value, 'dataSource', 'fieldOID', 'employee_expand')
          }
          getPopupContainer={triggerNode => triggerNode.parentNode}
          value={this.getInitialValue('dataSource', 'fieldOID')}
        >
          {companyFieldData.map(item => <Option key={item.fieldOID}>{item.fieldName}</Option>)}
        </Select>
      </div>
    );
  };

  renderCostCenter = () => {
    const { widget, costCenters } = this.state;
    const { nowWidgetList } = this.props;
    //处理成本中心
    let selectedOIDList = [];
    let currentOID = this.getInitialValue('dataSource', 'costCenterOID');
    nowWidgetList.map(singleWidget => {
      if (singleWidget.messageKey === 'select_cost_center' && singleWidget.dataSource) {
        selectedOIDList.push(JSON.parse(singleWidget.dataSource).costCenterOID);
      }
    });
    let costCenterData = [];
    costCenters.data.map(singleCostCenterField => {
      if (
        selectedOIDList.indexOf(singleCostCenterField.costCenterOID) == -1 ||
        singleCostCenterField.costCenterOID === currentOID
      ) {
        costCenterData.push(singleCostCenterField);
      }
    });
    return (
      <div>
        <div className="form-title">{this.$t('widget.field.cost.center') /*选择成本中心*/}</div>
        <Select
          disabled={this.props.disabled}
          onChange={value => this.handleChangeAttr(value, 'dataSource', 'costCenterOID')}
          getPopupContainer={triggerNode => triggerNode.parentNode}
          value={this.getInitialValue('dataSource', 'costCenterOID')}
        >
          {costCenterData.map(item => <Option key={item.costCenterOID}>{item.name}</Option>)}
        </Select>
      </div>
    );
  };

  updateWidget(widget, widgetList) {
    if (
      widget.messageKey === 'form.description' &&
      this.state.widget.messageKey !== 'form.description'
    ) {
      //拼装description控件的i18n数组
      let titleI18n = [],
        contentI18n = [];
      Object.keys(widget).map(key => {
        this.props.languageList.map(language => {
          if (key === language.code.toLowerCase()) {
            titleI18n.push({ language: key, value: widget[key].title });
            contentI18n.push({ language: key, value: widget[key].content });
          }
        });
      });
      widget.titleI18n = titleI18n;
      widget.contentI18n = contentI18n;
      this.props.onChange(widget);
      this.setState({ widget, baseWidget: null });
    } else if (widget) {
      let baseWidget = null;
      this.props.needType &&
        widgetList &&
        widgetList.map(item => {
          if (item.messageKey === widget.messageKey) baseWidget = item;
        });
      if (widget.messageKey === 'select_participant') {
        if (!widget.participantsImportScope) {
          widget.participantsImportScope = '1';
        }
        if (!widget.fieldContent) {
          widget.fieldContent =
            '{"isUse":true,"out":false,"outParticipant":1,"innerParticipant":"1","editable":true}';
        }
      }
      //新加入的组件，组装成需要的结构
      const { valueKey } = this.props;
      if (!widget.customFormFieldI18nDTOS || widget.customFormFieldI18nDTOS.length === 0) {
        widget.fieldName = widget.name;
        widget.promptInfo = '';
        widget.fieldConstraint = widget.constraintRule;
        widget.i18n = {};
        widget.valid = true;
        if (widget.messageKey === 'cust_list') {
          widget.type = '0';
        } else {
          widget.type = null;
        }
        widget.dataSource = '';
        widget.customFormFieldI18nDTOS = [];
        this.props.languageList.map(language => {
          let i18nDTO = {
            fieldName: widget.name,
            promptInfo: '',
            language: language.code,
          };
          widget.customFormFieldI18nDTOS.push(i18nDTO);
        });
      }
      if (this.state.widget[valueKey] !== widget[valueKey]) {
        switch (widget.messageKey) {
          case 'cust_list':
          case 'linkage_switch':
            this.getDataBeforeRender('enumerations');
            break;
          case 'select_cost_center':
            this.getDataBeforeRender('costCenters');
            break;
          case 'employee_expand':
            this.getDataBeforeRender('companyFields');
            break;
        }
        //拼装表单名称、备注的i18n数组
        let fieldNameI18n = [],
          promptInfoI18n = [];
        widget.customFormFieldI18nDTOS.map(i18nDTO => {
          fieldNameI18n.push({ language: i18nDTO.language, value: i18nDTO.fieldName });
          promptInfoI18n.push({ language: i18nDTO.language, value: i18nDTO.promptInfo });
        });
        widget.fieldNameI18n = fieldNameI18n;
        widget.promptInfoI18n = promptInfoI18n;

        let outFieldNameI18n = [],
          outPromptInfoI18n = [];
        if (widget.messageKey === 'select_participant') {
          if (
            !widget.outCustomFormFieldI18nDTOS ||
            widget.outCustomFormFieldI18nDTOS.length === 0
          ) {
            widget.outCustomFormFieldI18nDTOS = [];
            this.props.languageList.map(language => {
              let i18nDTO = {
                fieldName: this.$t('widget.field.out.participant'), //外部参与人
                promptInfo: '',
                language: language.code,
              };
              widget.outCustomFormFieldI18nDTOS.push(i18nDTO);
            });
            if (!widget.outFieldName) {
              widget.outFieldName = this.$t('widget.field.out.participant'); //外部参与人
            }
          }
          widget.outCustomFormFieldI18nDTOS.map(i18nDTO => {
            //外部参与人数量
            outFieldNameI18n.push({ language: i18nDTO.language, value: i18nDTO.fieldName });
            outPromptInfoI18n.push({ language: i18nDTO.language, value: i18nDTO.promptInfo });
          });
          widget.outFieldNameI18n = outFieldNameI18n;
          widget.outPromptInfoI18n = outPromptInfoI18n;
        }

        let bankFieldNameI18n = [],
          bankPromptInfoI18n = [];
        if (widget.messageKey === 'payee') {
          if (
            !widget.bankCustomFormFieldI18nDTOS ||
            widget.bankCustomFormFieldI18nDTOS.length === 0
          ) {
            widget.bankCustomFormFieldI18nDTOS = [];
            this.props.languageList.map(language => {
              let i18nDTO = {
                fieldName: this.$t('widget.field.bank.card.account'), //银行卡号
                promptInfo: '',
                language: language.code,
              };
              widget.bankCustomFormFieldI18nDTOS.push(i18nDTO);
            });
            if (!widget.bankFieldName) {
              widget.bankFieldName = this.$t('widget.field.bank.card.account'); //银行卡号
            }
          }
          widget.bankCustomFormFieldI18nDTOS.map(i18nDTO => {
            bankFieldNameI18n.push({ language: i18nDTO.language, value: i18nDTO.fieldName });
            bankPromptInfoI18n.push({ language: i18nDTO.language, value: i18nDTO.promptInfo });
          });
          widget.bankFieldNameI18n = bankFieldNameI18n;
          widget.bankPromptInfoI18n = bankPromptInfoI18n;
        }

        if (widget.messageKey === 'linkage_switch') {
          widget.maxChildNum = widget.fieldConstraint
            ? JSON.parse(widget.fieldConstraint).maxChildNum
            : -1;
          widget.linkageSwitchItems = widget.fieldContent ? JSON.parse(widget.fieldContent) : [];
          widget.linkageSwitchItems.map(linkageSwitchItem => {
            linkageSwitchItem.fieldNameI18n = [];
            linkageSwitchItem.promptInfoI18n = [];
          });
          widget.customFormFieldI18nDTOS.map(i18nDTO => {
            if (i18nDTO.fieldContent) {
              let i18ns = JSON.parse(i18nDTO.fieldContent);
              i18ns &&
                i18ns.map((i18n, index) => {
                  widget.linkageSwitchItems[index].fieldNameI18n.push({
                    language: i18nDTO.language,
                    value: i18n.fieldName,
                  });
                  widget.linkageSwitchItems[index].promptInfoI18n.push({
                    language: i18nDTO.language,
                    value: i18n.promptInfo,
                  });
                  if (i18nDTO.language.toLowerCase() === this.props.language.code) {
                    widget.fieldContent = i18nDTO.fieldContent;
                    widget.linkageSwitchItems[index].fieldName = i18n.fieldName;
                    widget.linkageSwitchItems[index].promptInfo = i18n.promptInfo;
                  }
                });
            }
          });
        }

        // 选择框控件默认封装三个对象
        if (widget.messageKey === 'select_box') {
          let optionList = [];
          for (let i = 0; i < 3; i++) {
            optionList.push({
              id: randomString(8),
              name: null,
              promoptInfo: null,
            });
          }
          widget.fieldConstraint =
            widget.fieldConstraint && widget.fieldConstraint !== ''
              ? widget.fieldConstraint
              : JSON.stringify({ type: '0' });
          widget.optionList =
            widget.fieldContent && JSON.parse(widget.fieldContent)[0].id === ''
              ? optionList
              : JSON.parse(widget.fieldContent);
        }
        //开始结束日期默认值
        if (widget.messageKey === 'start_date' || widget.messageKey === 'end_date') {
          widget.fieldConstraint =
            widget.fieldConstraint && widget.fieldConstraint !== ''
              ? widget.fieldConstraint
              : JSON.stringify({ enableTime: false, defaultTime: null });
        }
        this.props.onChange(widget);
        this.setState({ widget, baseWidget });
      }
    } else if (!widget) {
      this.setState({ widget: {}, baseWidget: null });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { widget, widgetList } = nextProps;
    this.updateWidget(widget, widgetList);
  }

  handleLanguageInput = (value, i18n, attr) => {
    const { widget } = this.state;
    widget[attr] = value;
    widget[attr + 'I18n'] = i18n;
    if (widget.messageKey !== 'form.description') {
      widget.customFormFieldI18nDTOS.map(i18nDTO => {
        let language = i18nDTO.language;
        widget[attr + 'I18n'].map(i18n => {
          if (i18n.language === language) i18nDTO[attr] = i18n.value;
        });
      });
    }
    this.props.onChange(widget);
  };

  handleChange = (value, attr) => {
    const { widget } = this.state;
    widget[attr] = value;
    if (attr === 'reportShow' && !value) {
      widget.reportOrmKey = '';
    }
    if (
      attr === 'isReadOnly' &&
      (widget.messageKey === 'select_department' || widget.messageKey === 'select_cost_center')
    ) {
      this.handleChangeAttr(value, 'fieldConstraint', 'valueReadonly');
    }
    this.props.onChange(widget);
  };

  renderCustomWidget = () => {
    const { widget, enumerations, costCenters, companyFields } = this.state;
    switch (widget.messageKey) {
      case 'cust_list': {
        return (
          <div>
            <div className="form-title">{this.$t('widget.select.list')}</div>
            <Select
              disabled={this.props.disabled}
              onChange={value => this.handleChangeAttr(value, 'dataSource', 'customEnumerationOID')}
              value={this.getInitialValue('dataSource', 'customEnumerationOID')}
            >
              {enumerations.data.map(item => (
                <Option key={item.customEnumerationOID}>{item.name}</Option>
              ))}
            </Select>
          </div>
        );
      }
      case 'number': {
        return (
          <div>
            <div className="form-title">{this.$t('widget.integer.length')}</div>
            <InputNumber
              disabled={this.props.disabled}
              max={100}
              min={1}
              precision={0}
              value={this.getInitialValue('fieldConstraint', 'integerMaxLength')}
              onChange={value =>
                this.handleChangeAttr(value, 'fieldConstraint', 'integerMaxLength')
              }
            />
            <div className="form-title">{this.$t('widget.decimal.length')}</div>
            <InputNumber
              disabled={this.props.disabled}
              max={100}
              min={0}
              precision={0}
              value={this.getInitialValue('fieldConstraint', 'decimalMaxLength')}
              onChange={value =>
                this.handleChangeAttr(value, 'fieldConstraint', 'decimalMaxLength')
              }
            />
            <div className="form-title">{this.$t('widget.unit')}</div>
            <Input
              disabled={this.props.disabled}
              value={this.getInitialValue('fieldContent', 'unit')}
              onChange={e => this.handleChangeAttr(e.target.value, 'fieldContent', 'unit')}
            />
          </div>
        );
      }
      case 'attachment':
      case 'image': {
        return (
          <div>
            <div className="form-title">{this.$t('widget.max.upload.number')}</div>
            <InputNumber
              disabled={this.props.disabled}
              max={10}
              min={1}
              precision={0}
              value={this.getInitialValue('fieldConstraint', 'maxNumber')}
              onChange={value => this.handleChangeAttr(value, 'fieldConstraint', 'maxNumber')}
            />
          </div>
        );
      }
      case 'select_department': {
        return (
          <div className="check-box-area">
            <Checkbox
              disabled={this.props.disabled}
              onChange={e =>
                this.handleChangeAttr(
                  e.target.checked ? 101 : false,
                  'fieldConstraint',
                  'selectMode'
                )
              }
              checked={Boolean(this.getInitialValue('fieldConstraint', 'selectMode'))}
            >
              {this.$t('widget.field.default.department') /*默认自己所在部门*/}
            </Checkbox>
            {this.props.isFormDesign &&
              this.props.formType &&
              this.props.formType % 3000 < 10 && (
                <Checkbox
                  disabled={this.props.disabled}
                  onChange={e =>
                    this.handleChangeAttr(e.target.checked, 'fieldConstraint', 'isApportionItem')
                  }
                  checked={this.getInitialValue('fieldConstraint', 'isApportionItem')}
                >
                  {this.$t('widget.field.get.in.apportion') /*参与费用分摊*/}
                </Checkbox>
              )}
            {!this.props.isFormDesign && (
              <Checkbox
                disabled={this.props.disabled}
                onChange={e =>
                  this.handleChangeAttr(e.target.checked, 'fieldConstraint', 'isApportionItem')
                }
                checked={this.getInitialValue('fieldConstraint', 'isApportionItem')}
              >
                {this.$t('widget.field.get.in.apportion') /*参与费用分摊*/}
              </Checkbox>
            )}
          </div>
        );
      }
      case 'currency_code': {
        return (
          <div className="form-title">
            <div className="form-title-description">
              {this.$t(
                'widget.field.currency.code.tip'
              ) /*可选币种来源：【设置- 货币】中的设置，默认为本位币*/}
            </div>
          </div>
        );
      }
      case 'select_cost_center': {
        return this.renderCostCenter();
      }
      case 'employee_expand': {
        return this.renderEmployeeExpand();
      }
      case 'select_user': {
        return (
          <div className="radio-area">
            <RadioGroup
              disabled={this.props.disabled}
              onChange={e => this.handleChangeAttr(e.target.value, 'fieldConstraint', 'selectMode')}
              value={Number(Boolean(this.getInitialValue('fieldConstraint', 'selectMode')))}
            >
              <Radio value={0}>{this.$t('widget.field.select.single') /*单选*/}</Radio>
              <Radio value={1}>{this.$t('widget.field.select.multiple') /*多选*/}</Radio>
            </RadioGroup>
          </div>
        );
      }
      case 'external_participant_name': {
        return (
          <div className="radio-area">
            <RadioGroup
              disabled={this.props.disabled}
              onChange={e => this.handleChangeAttr(e.target.value, 'fieldContent', 'isContainCard')}
              value={Boolean(this.getInitialValue('fieldContent', 'isContainCard'))}
            >
              <Radio value={false}>{this.$t('widget.field.out.name') /*姓名*/}</Radio>
              <Radio value={true}>{this.$t('widget.field.out.name.field') /*姓名+证件*/}</Radio>
            </RadioGroup>
          </div>
        );
      }
      case 'select_corporation_entity': {
        return (
          <div className="check-box-area">
            <Checkbox
              disabled={this.props.disabled}
              onChange={e => this.handleChangeAttr(e.target.checked, 'fieldConstraint', 'default')}
              checked={this.getInitialValue('fieldConstraint', 'default')}
            >
              {this.$t('widget.field.default.entity') /*默认申请人所在法人*/}
            </Checkbox>
          </div>
        );
      }
      case 'select_company': {
        return (
          <div className="check-box-area">
            <Checkbox
              disabled={this.props.disabled}
              onChange={e => this.handleChangeAttr(e.target.checked, 'fieldConstraint', 'showCode')}
              checked={this.getInitialValue('fieldConstraint', 'showCode')}
            >
              {this.$t('widget.field.show.company.code') /*显示公司代码*/}
            </Checkbox>
            <Checkbox
              disabled={this.props.disabled}
              onChange={e =>
                this.handleChangeAttr(!e.target.checked, 'fieldConstraint', 'noDefault')
              }
              checked={!this.getInitialValue('fieldConstraint', 'noDefault')}
            >
              {this.$t('widget.field.show.applicant.company') /*默认申请人所在公司*/}
            </Checkbox>
          </div>
        );
      }
      case 'payee': {
        return (
          <div>
            <div className="form-title">
              {this.$t('widget.field.bank.account') /*银行卡号标题*/}
            </div>
            <LanguageInput
              nameChange={(value, i18n) =>
                this.handleBankLanguageInput(value, i18n, 'bankFieldName', 'fieldName')
              }
              width={'100%'}
              name={widget.bankFieldName}
              isEdit
              inpRule={[
                {
                  length: 100,
                  language: 'zh_cn',
                },
                {
                  length: 100,
                  language: 'en',
                },
              ]}
              mainLanguageIsRequired={false}
              disabled={this.props.disabled}
              i18nName={widget.bankFieldNameI18n}
            />
            <div className="form-title">
              {this.$t('widget.field.bank.account.content') /*银行卡号文字*/}
            </div>
            <LanguageInput
              nameChange={(value, i18n) =>
                this.handleBankLanguageInput(value, i18n, 'bankPromptInfo', 'promptInfo')
              }
              width={'100%'}
              name={widget.bankPromptInfo}
              isEdit
              inpRule={[
                {
                  length: 100,
                  language: 'zh_cn',
                },
                {
                  length: 100,
                  language: 'en',
                },
              ]}
              mainLanguageIsRequired={false}
              disabled={this.props.disabled}
              i18nName={widget.bankPromptInfoI18n}
            />
          </div>
        );
      }
      case 'select_participant': {
        return (
          <div>
            <div className="form-title">
              {this.$t('widget.field.participant.setting') /*参与人控件模式设置*/}
            </div>
            <div className="checkbox-radio-area">
              <Checkbox
                disabled={this.props.disabled}
                onChange={e => this.handleChangeAttr(e.target.checked, 'fieldContent', 'isUse')}
                checked={this.getInitialValue('fieldContent', 'isUse')}
              >
                {this.$t('widget.field.participant.enable.inner') /*启用【内部】参与人控件*/}
              </Checkbox>
              <RadioGroup
                disabled={this.props.disabled}
                onChange={e => {
                  this.handleChangeAttr(e.target.value, 'fieldContent', 'editable');
                  this.handleChangeAttr(
                    Number(Boolean(e.target.value)) + 1,
                    'fieldContent',
                    'innerParticipant'
                  );
                }}
                value={this.getInitialValue('fieldContent', 'editable')}
              >
                <Radio value={false}>
                  {this.$t('widget.field.participant.as.applicant') /*内部参与人同申请人*/}
                </Radio>
                <Radio value={true}>
                  {this.$t('widget.field.participant.random') /*任意选择*/}
                </Radio>
              </RadioGroup>
              {this.getInitialValue('fieldContent', 'editable') && (
                <div>
                  <div className="form-title">
                    {this.$t('widget.field.participant.setting.safe') /*参与人控件安全性设置*/}
                  </div>
                  <RadioGroup
                    disabled={this.props.disabled}
                    value={widget.participantsImportScope}
                    onChange={this.handleChangeParticipantsImportScope}
                  >
                    <Radio value={'1'}>{this.$t('widget.field.participant.safe01') /*全体*/}</Radio>
                    <Radio value={'2'}>
                      {this.$t('widget.field.participant.safe02') /*同申请人部门*/}
                    </Radio>
                    <Radio value={'3'}>
                      {this.$t('widget.field.participant.safe03') /*同申请人部门(含子部门)*/}
                    </Radio>
                    <Radio value={'4'}>
                      {this.$t('widget.field.participant.safe04') /*同单据部门*/}
                    </Radio>
                    <Radio value={'5'}>
                      {this.$t('widget.field.participant.safe05') /*同单据部门(含子部门)*/}
                    </Radio>
                    <Radio value={'6'}>
                      {this.$t('widget.field.participant.safe06') /*同单据成本中心*/}
                    </Radio>
                  </RadioGroup>
                </div>
              )}

              <Checkbox
                disabled={this.props.disabled}
                onChange={e => this.handleChangeAttr(e.target.checked, 'fieldContent', 'out')}
                checked={this.getInitialValue('fieldContent', 'out')}
              >
                {this.$t('widget.field.participant.enable.out') /*启用【外部】参与人控件*/}
              </Checkbox>
              <RadioGroup
                disabled={this.props.disabled}
                value={this.getInitialValue('fieldContent', 'outParticipant')}
              >
                <Radio value={1}>{this.$t('widget.field.participant.amount') /*数量*/}</Radio>
              </RadioGroup>
              {this.getInitialValue('fieldContent', 'out') && (
                <div>
                  <div className="form-title">
                    {this.$t('widget.field.participant.out.title') /*外部标题*/}
                  </div>
                  <LanguageInput
                    nameChange={(value, i18n) =>
                      this.handleOutLanguageInput(value, i18n, 'outFieldName', 'fieldName')
                    }
                    width={'100%'}
                    name={widget.outFieldName}
                    isEdit
                    inpRule={[
                      {
                        length: 100,
                        language: 'zh_cn',
                      },
                      {
                        length: 100,
                        language: 'en',
                      },
                    ]}
                    mainLanguageIsRequired={false}
                    disabled={this.props.disabled}
                    i18nName={widget.outFieldNameI18n}
                  />
                  <div className="form-title">
                    {this.$t('widget.field.participant.out.prompt') /*外部提示文字*/}
                  </div>
                  <LanguageInput
                    nameChange={(value, i18n) =>
                      this.handleOutLanguageInput(value, i18n, 'outPromptInfo', 'promptInfo')
                    }
                    width={'100%'}
                    name={widget.outPromptInfo}
                    isEdit
                    inpRule={[
                      {
                        length: 100,
                        language: 'zh_cn',
                      },
                      {
                        length: 100,
                        language: 'en',
                      },
                    ]}
                    mainLanguageIsRequired={false}
                    disabled={this.props.disabled}
                    i18nName={widget.outPromptInfoI18n}
                  />
                  <div className="check-box-area">
                    <Checkbox
                      disabled={this.props.disabled}
                      onChange={e => this.handleChange(e.target.checked, 'outRequired')}
                      checked={widget.outRequired}
                    >
                      {this.$t('widget.field.required')}
                    </Checkbox>
                    <Checkbox
                      disabled={this.props.disabled}
                      onChange={e => this.handleChange(e.target.checked, 'outIsPDFShow')}
                      checked={widget.outIsPDFShow}
                    >
                      {this.$t('widget.field.print')}
                    </Checkbox>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }
      case 'linkage_switch': {
        return (
          <div className="linkage-switch-area">
            {widget.linkageSwitchItems.map((item, index) => (
              <LinkageSwitchItem
                enumerations={enumerations}
                item={item}
                key={index}
                onDelete={() => this.handleDeleteLinkageSwitchItem(index)}
                onChange={linkageSwitchItem =>
                  this.handleChangeLinkageSwitchItem(linkageSwitchItem, index)
                }
              />
            ))}
            <div className="new-linkage-switch-area" onClick={this.handleNewLinkageSwitchItem}>
              <Icon type="plus" />
              {this.$t('widget.field.add.linkage') /*新增联动内容*/}
            </div>
          </div>
        );
      }
      //选择框组件功能完善
      case 'select_box': {
        let selectNum =
          widget.fieldConstraint && widget.fieldConstraint !== ''
            ? JSON.parse(widget.fieldConstraint).type
            : '0';
        return (
          <div>
            <div className="radio-area">
              <RadioGroup
                disabled={this.props.disabled}
                onChange={e => this.handleChangeAttr(e.target.value, 'fieldConstraint', 'type')}
                value={selectNum}
              >
                <Radio value={'0'}>{this.$t('widget.field.select.single') /*单选*/}</Radio>
                <Radio value={'1'}>{this.$t('widget.field.select.multiple') /*多选*/}</Radio>
              </RadioGroup>
            </div>
            <div>
              {widget.optionList.map((item, index) => (
                <Row key={item.id} type="flex" justify="center" align="middle">
                  <Col span={20} style={{ marginTop: '5px' }}>
                    <Input
                      placeholder={`${this.$t('widget.field.placeholder.option')}${index + 1}`}
                      defaultValue={item.name}
                      onChange={e => this.handleInputListValue(e.target.value, index)}
                    />
                  </Col>
                  <Col span={2} style={{ textAlign: 'center' }}>
                    <Icon
                      className="dynamic-delete-button"
                      type="minus-circle-o"
                      style={{ fontSize: 16 }}
                      disabled={widget.optionList.length === 2}
                      onClick={() => this.handleInputListOperation('delete', index)}
                    />
                  </Col>
                  <Col span={2} style={{ textAlign: 'center' }}>
                    <Icon
                      type="plus-circle"
                      onClick={() => this.handleInputListOperation('add')}
                      style={{ fontSize: 16, color: '#1890ff' }}
                    />
                  </Col>
                </Row>
              ))}
            </div>
          </div>
        );
      }
      //开始日期结束日期完善
      case 'start_date':
      case 'end_date':
        const format = 'HH:mm';
        let isShowTime =
          widget.fieldConstraint && widget.fieldConstraint !== ''
            ? JSON.parse(widget.fieldConstraint).enableTime
            : false;
        return (
          <div>
            <Row className="check-box-area">
              <Col span={8}>
                <Checkbox
                  onChange={e =>
                    this.handleChangeAttr(
                      e.target.checked,
                      'fieldConstraint',
                      'enableTime',
                      'start_end_date'
                    )
                  }
                  checked={isShowTime}
                >
                  {this.$t('widget.field.enable.time') /*启用时间*/}
                </Checkbox>
              </Col>
              <Col>
                {isShowTime && (
                  <TimePicker
                    value={
                      this.getInitialValue('fieldConstraint', 'defaultTime')
                        ? moment(this.getInitialValue('fieldConstraint', 'defaultTime'))
                        : null
                    }
                    allowEmpty={false}
                    format={format}
                    onChange={time =>
                      this.handleChangeAttr(
                        moment(time)
                          .second(0)
                          .utc()
                          .format(),
                        'fieldConstraint',
                        'defaultTime'
                      )
                    }
                  />
                )}
              </Col>
            </Row>
          </div>
        );
    }
    return null;
  };

  //增减操作选择输入框
  handleInputListOperation = (type, index) => {
    const { widget } = this.state;
    if (type === 'add') {
      widget.optionList.push({
        id: randomString(8),
        name: null,
        promoptInfo: null,
      });
    } else {
      if (widget.optionList.length === 2) return;
      widget.optionList.splice(index, 1);
    }
    widget.fieldContent = JSON.stringify(widget.optionList);
    this.props.onChange(widget);
  };

  //选择框控件输入名称时的handle
  handleInputListValue = (value, index) => {
    const { widget } = this.state;
    widget.optionList[index].name = value;
    widget.fieldContent = JSON.stringify(widget.optionList);
    this.props.onChange(widget);
  };

  handleChangeLinkageSwitchItem = (linkageSwitchItem, index) => {
    const { widget } = this.state;
    widget.linkageSwitchItems.splice(index, 1, linkageSwitchItem);
    let customFormFieldI18nDTOS = widget.customFormFieldI18nDTOS || [];
    customFormFieldI18nDTOS.map(i18nDTO => {
      let fieldContent = i18nDTO.fieldContent ? JSON.parse(i18nDTO.fieldContent) : [];
      let newItem = JSON.parse(JSON.stringify(linkageSwitchItem));
      let language = i18nDTO.language;
      newItem.fieldNameI18n.map(i18n => {
        if (i18n.language === language) newItem.fieldName = i18n.value;
      });
      newItem.promptInfoI18n.map(i18n => {
        if (i18n.language === language) newItem.promptInfo = i18n.value;
      });
      fieldContent.splice(index, 1, newItem);
      i18nDTO.fieldContent = JSON.stringify(fieldContent);
      if (i18nDTO.language.toLowerCase() === this.props.language.code)
        widget.fieldContent = JSON.stringify(fieldContent);
    });
    widget.customFormFieldI18nDTOS = customFormFieldI18nDTOS;
    this.props.onChange(widget);
  };

  handleDeleteLinkageSwitchItem = index => {
    const { widget } = this.state;
    let customFormFieldI18nDTOS = widget.customFormFieldI18nDTOS || [];
    customFormFieldI18nDTOS.map(i18nDTO => {
      let fieldContent = JSON.parse(i18nDTO.fieldContent);
      fieldContent.splice(index, 1);
      i18nDTO.fieldContent = JSON.stringify(fieldContent);
      if (i18nDTO.language.toLowerCase() === this.props.language.code)
        widget.fieldContent = JSON.stringify(fieldContent);
    });
    widget.customFormFieldI18nDTOS = customFormFieldI18nDTOS;
    widget.linkageSwitchItems.splice(index, 1);
    this.props.onChange(widget);
  };

  handleNewLinkageSwitchItem = () => {
    const { widget } = this.state;
    if (widget.linkageSwitchItems.length === parseInt(widget.maxChildNum)) {
      Modal.error({
        title: this.$t('widget.field.max.add', { num: widget.maxChildNum }), //最多可添加num个
      });
    } else {
      let linkageSwitchItems = widget.fieldContent ? JSON.parse(widget.fieldContent) : [];
      let newLinkageSwitchItems = {
        fieldName: '',
        promptInfo: '',
        fieldType: 'TEXT',
        messageKey: null,
        fieldConstraint: '',
        required: false,
        value: null,
        fieldNameI18n: [],
        promptInfoI18n: [],
        dataSource: '',
        id: randomString(8),
      };
      linkageSwitchItems.push(newLinkageSwitchItems);
      widget.linkageSwitchItems = linkageSwitchItems;
      let customFormFieldI18nDTOS = widget.customFormFieldI18nDTOS || [];
      customFormFieldI18nDTOS.map(i18nDTO => {
        let fieldContent = i18nDTO.fieldContent ? JSON.parse(i18nDTO.fieldContent) : [];
        fieldContent.push(newLinkageSwitchItems);
        i18nDTO.fieldContent = JSON.stringify(fieldContent);
        if (i18nDTO.language.toLowerCase() === this.props.language.code)
          widget.fieldContent = JSON.stringify(fieldContent);
        newLinkageSwitchItems.fieldNameI18n.push({
          language: i18nDTO.language,
          value: '',
        });
        newLinkageSwitchItems.promptInfoI18n.push({
          language: i18nDTO.language,
          value: '',
        });
      });
      widget.customFormFieldI18nDTOS = customFormFieldI18nDTOS;
      this.props.onChange(widget);
    }
  };

  handleOutLanguageInput = (value, i18n, outAttr, attr) => {
    const { widget } = this.state;
    widget[outAttr] = value;
    widget[outAttr + 'I18n'] = i18n;
    widget.outCustomFormFieldI18nDTOS.map(i18nDTO => {
      let language = i18nDTO.language;
      widget[outAttr + 'I18n'].map(i18n => {
        if (i18n.language === language) i18nDTO[attr] = i18n.value;
      });
    });
    this.props.onChange(widget);
  };

  handleBankLanguageInput = (value, i18n, bankAttr, attr) => {
    const { widget } = this.state;
    widget[bankAttr] = value;
    widget[bankAttr + 'I18n'] = i18n;
    widget.bankCustomFormFieldI18nDTOS.map(i18nDTO => {
      let language = i18nDTO.language;
      widget[bankAttr + 'I18n'].map(i18n => {
        if (i18n.language === language) i18nDTO[attr] = i18n.value;
      });
    });
    this.props.onChange(widget);
  };

  //参与人控件安全性设置
  handleChangeParticipantsImportScope = e => {
    const { widget } = this.state;
    widget.participantsImportScope = e.target.value;
    this.props.onChange(widget);
  };

  //messageKey用来处理特殊控件的变化需求
  handleChangeAttr = (value, jsonName, attrName, messageKey) => {
    const { widget, companyFields } = this.state;
    if (widget[jsonName]) {
      let temp = JSON.parse(widget[jsonName]);
      temp[attrName] = value;
      widget[jsonName] = JSON.stringify(temp);
    } else {
      widget[jsonName] = JSON.stringify({ [attrName]: value });
    }
    if (messageKey === 'employee_expand') {
      let valueMessageKey = '';
      let valueDataSource = '';
      companyFields.data.map(companyField => {
        if (companyField.fieldOID === value) {
          valueMessageKey = companyField.messageKey;
          if (companyField.dataSource) {
            valueDataSource = companyField.dataSource;
          }
        }
      });
      widget.fieldContent = JSON.stringify({
        messageKey: valueMessageKey,
        dataSource: valueDataSource,
      });
    }
    if (attrName === 'customEnumerationOID') widget.customEnumerationOID = value;
    if (attrName === 'out') {
      if (value && !widget.outCustomFormFieldI18nDTOS) {
        widget.outFieldName = widget.fieldName + '1';
        widget.outPromptInfo = '';
        widget.outRequired = false;
        widget.outIsReadOnly = false;
        widget.outIsPDFShow = false;
        widget.outCustomFormFieldI18nDTOS = [];
        this.props.languageList.map(language => {
          let i18nDTO = {
            fieldName: widget.name,
            promptInfo: '',
            language: language.code,
          };
          widget.outCustomFormFieldI18nDTOS.push(i18nDTO);
        });
      }
    }
    this.props.onChange(widget);
  };

  //是否不需要提示文字
  isHidePrompt = widget => {
    if (widget.messageKey === 'linkage_switch' || widget.messageKey === 'employee_expand') {
      return true;
    } else {
      return false;
    }
  };

  //是否需要配置是否只读
  isShowReadOnly = widget => {
    if (
      widget.messageKey === 'select_department' ||
      widget.messageKey === 'select_cost_center' ||
      widget.messageKey === 'select_corporation_entity' ||
      widget.messageKey === 'select_company' ||
      widget.messageKey === 'payee'
    ) {
      return true;
    } else {
      return false;
    }
  };

  getInitialValue = (jsonName, attrName) => {
    const { widget } = this.state;
    return widget[jsonName] ? JSON.parse(widget[jsonName])[attrName] : null;
  };

  render() {
    const { widget, baseWidget, loading } = this.state;
    const { showConfig } = this.props;
    return (
      <div>
        {baseWidget ? (
          <div className="widget-setting">
            {this.props.needType && (
              <div className="form-title">
                {this.$t('widget.field.type')}：{baseWidget.name}
                {widget.messageKey === 'select_cost_center' && (
                  <div className="form-title-description">
                    {this.$t('widget.field.description.costCenter')}
                  </div>
                )}
              </div>
            )}
            <div className="form-title">{this.$t('widget.field.name')}</div>
            <LanguageInput
              nameChange={(value, i18n) => this.handleLanguageInput(value, i18n, 'fieldName')}
              width={'100%'}
              name={widget.fieldName}
              disabled={this.props.disabled}
              isEdit
              inpRule={[
                {
                  length: 100,
                  language: 'zh_cn',
                },
                {
                  length: 100,
                  language: 'en',
                },
              ]}
              mainLanguageIsRequired={false}
              i18nName={widget.fieldNameI18n}
            />
            {!this.isHidePrompt(widget) && (
              <div>
                <div className="form-title">{this.$t('widget.field.prompt')}</div>
                <LanguageInput
                  nameChange={(value, i18n) => this.handleLanguageInput(value, i18n, 'promptInfo')}
                  width={'100%'}
                  name={widget.promptInfo}
                  disabled={this.props.disabled}
                  isEdit
                  inpRule={[
                    {
                      length: 100,
                      language: 'zh_cn',
                    },
                    {
                      length: 100,
                      language: 'en',
                    },
                  ]}
                  mainLanguageIsRequired={false}
                  i18nName={widget.promptInfoI18n}
                />
              </div>
            )}
            <div className="check-box-area">
              {showConfig.required && (
                <Checkbox
                  disabled={this.props.disabled}
                  onChange={e => this.handleChange(e.target.checked, 'required')}
                  checked={widget.required}
                >
                  {this.$t('widget.field.required')}
                </Checkbox>
              )}
              {this.isShowReadOnly(widget) &&
                showConfig.isReadOnly && (
                  <Checkbox
                    disabled={this.props.disabled}
                    onChange={e => this.handleChange(e.target.checked, 'isReadOnly')}
                    checked={widget.isReadOnly}
                  >
                    {this.$t('widget.field.readonly')}
                    <span className="default-span">
                      {this.$t(
                        'widget.field.cost.center.only'
                      ) /*适用于有默认值带入且不允许修改，谨慎勾选使用*/}
                    </span>
                  </Checkbox>
                )}
              {showConfig.isPDFShow && (
                <Checkbox
                  disabled={this.props.disabled}
                  onChange={e => this.handleChange(e.target.checked, 'isPDFShow')}
                  checked={widget.isPDFShow}
                >
                  {this.$t('widget.field.print')}
                </Checkbox>
              )}
              {showConfig.reportShow && (
                <Checkbox
                  disabled={this.props.disabled}
                  onChange={e => this.handleChange(e.target.checked, 'reportShow')}
                  checked={widget.reportShow}
                >
                  {this.$t('widget.field.in.report') /*将该字段加入报表*/}
                  <span className="default-span">
                    {this.$t(
                      'widget.field.in.report.prompt'
                    ) /*可以在报表下载页面，样表中设置别名*/}
                  </span>
                </Checkbox>
              )}
              {widget.reportShow && (
                <Select
                  disabled={this.props.disabled}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  onChange={value => this.handleChange(value, 'reportOrmKey')}
                  value={widget.reportOrmKey ? widget.reportOrmKey : undefined}
                  placeholder={this.$t('common.please.select') /*请选择*/}
                >
                  {widget.reportScopeList.map(item => (
                    <Option key={item.code}>{item.messageKey}</Option>
                  ))}
                </Select>
              )}
            </div>
            <div className="widget-custom-area">
              {loading ? <Spin /> : this.renderCustomWidget()}
            </div>
          </div>
        ) : (
          <div className="widget-setting">
            {widget.messageKey === 'form.description' && (
              <div className="form-title">
                {this.$t('widget.field.description')}：
                <Switch
                  onChange={checked => this.handleChange(checked, 'enable')}
                  defaultChecked={widget.enable}
                  disabled={this.props.disabled}
                  checkedChildren={<Icon type="check" />}
                  unCheckedChildren={<Icon type="cross" />}
                />
                <div className="form-title-description">
                  {this.$t('widget.field.description.info')}
                </div>
              </div>
            )}
            {widget.enable &&
              widget.messageKey === 'form.description' && (
                <div>
                  <div className="form-title">{this.$t('widget.field.name')}</div>
                  <LanguageInput
                    nameChange={(value, i18n) => this.handleLanguageInput(value, i18n, 'title')}
                    width={'100%'}
                    name={widget.title}
                    disabled={this.props.disabled}
                    isEdit
                    inpRule={[
                      {
                        length: 100,
                        language: 'zh_cn',
                      },
                      {
                        length: 100,
                        language: 'en',
                      },
                    ]}
                    mainLanguageIsRequired={false}
                    i18nName={widget.titleI18n}
                  />
                  <div className="form-title">{this.$t('widget.field.description.content')}</div>
                  <LanguageInput
                    nameChange={(value, i18n) => this.handleLanguageInput(value, i18n, 'content')}
                    width={'100%'}
                    disabled={this.props.disabled}
                    name={widget.content}
                    isEdit
                    inpRule={[
                      {
                        length: 100,
                        language: 'zh_cn',
                      },
                      {
                        length: 100,
                        language: 'en',
                      },
                    ]}
                    mainLanguageIsRequired={false}
                    i18nName={widget.contentI18n}
                  />
                </div>
              )}
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    company: state.user.company,
    tenantMode: true,
    language: state.languages.languages,
    languageList: state.languages.languageList,
    profile: "01ffe44c-2f0a-453e-b4e2-33ee6664624a",
  };
}

WidgetSetting.propTypes = {
  valueKey: PropTypes.string, //key值属性，用于检查不同组件切换的flag
  showConfig: PropTypes.object, //是否显示配置项，如果不配置则都显示 required必填 isReadOnly只读 isPDFShow打印
  needType: PropTypes.bool, //是否需要显示控件类型
  disabled: PropTypes.bool, //是否可以编辑
  isExtendField: PropTypes.bool, //自定义值列表，是否加载租户级别的
  isFormDesign: PropTypes.bool, //是否是表单管理处的渲染
  formType: PropTypes.number,
  booksID: PropTypes.string, //集团模式下，当前账套id
  nowWidgetList: PropTypes.array, //当前所选的所有控件
  formOID: PropTypes.string, //表单管理处对应的表单
  widget: PropTypes.object, //控件对象
  onChange: PropTypes.func, //更改属性时的回调
  widgetList: PropTypes.array, //控件列表，如果需要显示控件类型则必填
};

WidgetSetting.defaultProps = {
  isExtendField: false,
  disabled: false, //是否可以编辑
  isFormDesign: false,
  formType: 0,
  booksID: '',
  nowWidgetList: [],
  showConfig: { required: true, isReadOnly: true, isPDFShow: true },
};

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WidgetSetting);
