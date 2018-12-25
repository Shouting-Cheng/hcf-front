import React from 'react'
import {connect} from 'dva'
import {Row, Col, Spin, Modal, Button, message,Affix} from 'antd'

const confirm = Modal.confirm;
import HTML5Backend from 'react-dnd-html5-backend';
import {DragDropContext} from 'react-dnd';
import 'styles/components/template/drag-widget-page/drag-widget-page.scss'
import formService from 'containers/setting/form/form.service'
import DragWidgetItem from 'containers/setting/form/form-detail/form-detail-custom/drag-source/drag-widget-item'
import FakeDropLayout from 'containers/setting/form/form-detail/form-detail-custom/drop-source/fake-drop-layout'
import PhoneContent from 'containers/setting/form/form-detail/form-detail-custom/drop-source/phone-content'
import WidgetSetting from 'widget/Template/widget/widget-setting'
import PropTypes from 'prop-types'
import { routerRedux } from 'dva/router';

class FormDetailCustom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      normalWidget: [],
      combineWidget: [],
      nowWidget: [],
      nowSelectedIndex: -1,
      counter: 0,
      loading: false,
      saving: false,
      formDescriptionWidget: {},
      reportScopeList: [] //报表属性可选范围
    }
  }

  componentWillMount() {
    const {form, propertyList} = this.context;
    let nowWidget = form.customFormFields;
    let participantsIndex = -1;
    let outIndex = -1;
    let payeeIndex = -1; //收款方
    let bankAccountIndex = -1; //银行卡账号
    //counterFlag为内部组件排序所需key值，在此处初始化
    nowWidget.map((widget, index) => {
      //widget.counterFlag = index;
      //内部参与人控件需要检测out_participant_num/out_participant_name控件，
      //因为内部参与人控件包含了两个组件
      //所以为了符合widget控件的设计思路，现在数组里删除，保存的时候再进行添加
      if (widget.messageKey === 'out_participant_num' || widget.messageKey === 'out_participant_name') {
        outIndex = index;
      }
      if (widget.messageKey === 'select_participant') {
        participantsIndex = index;
      }
      if (widget.messageKey === 'linkage_switch') {
        widget.customFormFieldI18nDTOS && widget.customFormFieldI18nDTOS.map(i18nDTO => {
          if (i18nDTO.fieldContent) {
            if (i18nDTO.language.toLowerCase() === this.props.language.code) {
              widget.fieldContent = i18nDTO.fieldContent;
            }
          }
        });
      }
      if (!widget.customFormFieldI18nDTOS || widget.customFormFieldI18nDTOS.length === 0) {
        widget.customFormFieldI18nDTOS = [];
        this.props.languageList.map(language => {
          let i18nDTO = {
            fieldName: widget.fieldName,
            promptInfo: widget.promptInfo,
            language: language.code
          };
          widget.customFormFieldI18nDTOS.push(i18nDTO);
        });
      }
      return widget;
    });
    if (outIndex > -1 && participantsIndex > -1) {
      let participantsWidget = nowWidget[participantsIndex];
      let outWidget = nowWidget[outIndex];
      participantsWidget.outFieldName = outWidget.fieldName;
      participantsWidget.outPromptInfo = outWidget.promptInfo;
      participantsWidget.outRequired = outWidget.required;
      participantsWidget.outFieldOid = outWidget.fieldOid;
      participantsWidget.outID = outWidget.id;
      participantsWidget.outMessageKey = outWidget.messageKey;
      participantsWidget.outCustomFormFieldI18nDTOS = outWidget.customFormFieldI18nDTOS;
      nowWidget.splice(outIndex, 1);
    }
    //splice out_participant_num这个控件后index会发生变化，此处收款方和参与人要分开处理
    nowWidget.map((widget, index) => {
      //收款方控件需要检测contact_bank_account控件，
      //因为收款方控件包含了两个组件
      //所以为了符合widget控件的设计思路，现在数组里删除，保存的时候再进行添加
      if (widget.messageKey === 'payee') {
        payeeIndex = index;
      }
      if (widget.messageKey === 'contact_bank_account') {
        bankAccountIndex = index;
      }
    });
    if (payeeIndex > -1 && bankAccountIndex > -1) {
      let payeeWidget = nowWidget[payeeIndex];
      let bankAccountWidget = nowWidget[bankAccountIndex];
      payeeWidget.bankFieldName = bankAccountWidget.fieldName;
      payeeWidget.bankPromptInfo = bankAccountWidget.promptInfo;
      payeeWidget.bankFieldOid = bankAccountWidget.fieldOid;
      payeeWidget.bankID = bankAccountWidget.id;
      payeeWidget.bankCustomFormFieldI18nDTOS = bankAccountWidget.customFormFieldI18nDTOS;
      nowWidget.splice(bankAccountIndex, 1);
    }
    //counterFlag为内部组件排序所需key值，在此处初始化
    //要等前面参与人，收款方控件处理完毕后初始化
    nowWidget.map((widget, index) => {
      widget.counterFlag = index;
    });
    //表单内description控件，不可删除不可拖拽
    let formDescriptionWidget = {
      messageKey: 'form.description',
      title: '',
      content: ''
    };
    this.props.languageList.map(language => {
      formDescriptionWidget[language.code.toLowerCase()] = {
        title: '',
        content: ''
      }
    });
    propertyList && propertyList.map(property => {
      if (property.propertyName === 'form.description') {
        if (property.propertyValue) {
          formDescriptionWidget = JSON.parse(property.propertyValue);
          formDescriptionWidget.messageKey = 'form.description';
          if (formDescriptionWidget[this.props.user.language.toLowerCase()]) {
            let nowInfo = formDescriptionWidget[this.props.user.language.toLowerCase()];
            formDescriptionWidget.title = nowInfo.title;
            formDescriptionWidget.content = nowInfo.content;
          } else {
            formDescriptionWidget.title = '';
            formDescriptionWidget.content = '';
          }
        }
      }
      if (property.propertyName === 'application.participants.import.scope') {
        nowWidget.map(widget => {
          if (widget.messageKey === 'select_participant') {
            widget.participantsImportScope = property.propertyValue;
            return widget;
          }
        })
      }
    });
    this.setState({nowWidget, counter: nowWidget.length, formDescriptionWidget}, () => {
      this.getWidgetList();
    });
    this.getReportScope();
  }

  getWidgetList = () => {
    const {formType} = this.context;
    if (formType) {
      this.setState({loading: true});
      Promise.all([formService.getWidgetList(formType, 1001), formService.getWidgetList(formType, 1002)]).then(res => {
        res[0].data.map(item => {
          item.fieldConstraint = item.constraintRule;
          //item.readonly = !item.deleted;
        });
        res[1].data.map(item => {
          item.fieldConstraint = item.constraintRule;
          //item.readonly = !item.deleted;
        });
        let normalWidget = [];
        res[0].data.map(item => {
          //老公司只显示法人控件新公司显示公司控件
          if (this.props.isOldCompany) {
            if (item.messageKey != 'select_company') {
              normalWidget.push(item)
            }
          } else {
            if (item.messageKey != 'select_corporation_entity')
              normalWidget.push(item)
          }
        });
        this.setState({normalWidget: normalWidget, combineWidget: res[1].data, loading: false}, () => {
          this.processWidget();
        });
      });
    }
  };

  //处理控件是否可删除
  processWidget = () => {
    const {normalWidget, combineWidget, nowWidget} = this.state;
    nowWidget.map(widget => {
      normalWidget.map(norWidget => {
        if (widget.messageKey === norWidget.messageKey) {
          widget.readonly = norWidget.readonly;
        }
      });
      combineWidget.map(combWidget => {
        if (widget.messageKey === combWidget.messageKey) {
          widget.readonly = combWidget.readonly;
        }
      });
    });
    this.setState({nowWidget: nowWidget});
  };

  getReportScope = () => {
    formService.getExpenseReportScope(4003).then(resp => {
      let reportScopeList = [];
      if (resp.data && resp.data.values && resp.data.values.length) {
        resp.data.values.map(item => {
          if (item.enabled) {
            reportScopeList.push(item);
          }
        });
      }
      this.setState({
        reportScopeList: reportScopeList
      });
    }).catch(error => {
      message.error(this.$t('common.error'));
    });
  };

  /**
   * 从列表中把widget拖拽入phone-content时的事件
   * @param widget 拖入的widget
   * @param index 拖入后的index
   */
  handleDrop = (widget, index) => {
    let {nowWidget, counter} = this.state;
    if (widget.maxAmount === 0) {
      message.error(this.$t('form.setting.max.add', {num: widget.maxAmount}));//该控件只能有${widget.maxAmount}个
      return;
    }
    if (widget.maxAmount) {
      let count = 0;
      nowWidget.map(item => {
        item.messageKey === widget.messageKey && count++;
      });
      if (count >= widget.maxAmount) {
        message.error(this.$t('form.setting.max.add', {num: widget.maxAmount}));//该控件只能有${widget.maxAmount}个
        return;
      }
    }
    //收款方控件和银行卡号控件不能同时存在于一个表单上
    let payeeIndex = -1;
    let bankAccountIndex = -1;
    nowWidget.map((singleWidget, index) => {
      if (singleWidget.messageKey === 'payee') {
        payeeIndex = index;
      }
      if (singleWidget.messageKey === 'contact_bank_account') {
        bankAccountIndex = index;
      }
    });
    if (payeeIndex > -1 && widget.messageKey === 'contact_bank_account') {
      message.error(this.$t('form.setting.bank.account.disabled'));//银行卡号控件已禁用
      return;
    }
    if (bankAccountIndex > -1 && widget.messageKey === 'payee') {
      message.error(this.$t('form.setting.payee.disabled'));//收款方控件已禁用
      return;
    }
    let tempWidget = JSON.parse(JSON.stringify(widget));
    //因为ListSort根据key值排序，key值不能改变和重复，所以此处给每一个拖拽进入的组件一个counter计数为counterFlag
    tempWidget.counterFlag = counter++;
    tempWidget.fieldName = tempWidget.name;
    nowWidget.splice(index, 0, tempWidget);
    this.setState({nowWidget, counter, nowSelectedIndex: index});
  };

  /**
   * 选择某一组件时的回调
   * @param nowSelectedIndex  列表中的第几个
   * @param widget  对应widget对象
   */
  handleSelectWidget = (nowSelectedIndex, widget) => {
    this.setState({nowSelectedIndex})
  };

  /**
   * phone-content内部排序后的事件
   * @param result 返回的ReactDom，key值为拖拽进入时定义的counterFlag
   */
  handleSort = (result) => {
    let {nowWidget, nowSelectedIndex} = this.state;
    //记录当前选择的counterFlag
    let nowSelectWidgetCounter = nowWidget[nowSelectedIndex].counterFlag;
    let targetIndex = -1;
    let tempWidget = [];
    //根据排序后的key值排序
    result.map(item => {
      nowWidget.map(widget => {
        (widget.counterFlag + '') === item.key && tempWidget.push(widget);
      });
    });
    //寻找之前选择的index
    tempWidget.map((item, index) => {
      if (item.counterFlag === nowSelectWidgetCounter)
        targetIndex = index;
    });
    this.setState({nowWidget: tempWidget, nowSelectedIndex: targetIndex})
  };

  /**
   * phone-content内部删除后的事件
   * @param index 待删除的索引
   */
  handleDelete = (index) => {
    let {nowWidget, nowSelectedIndex} = this.state;
    confirm({
      title: this.$t('form.setting.delete.toast1'),//你确定要删除这个组件吗?
      content: this.$t('form.setting.delete.toast2'),//配置项将不会保存
      okType: 'danger',
      okText: this.$t('common.delete'),//删除
      cancelText: this.$t('common.cancel'),//取消
      onOk: () => {
        nowWidget.splice(index, 1);
        nowSelectedIndex = -1;
        this.setState({nowWidget, nowSelectedIndex})
      }
    });
  };

  /**
   * 更改widget属性的回调
   * @param widget
   */
  handleChangeWidget = (widget) => {
    if (widget.messageKey === 'form.description') {
      let formDescriptionWidget = {};
      widget.titleI18n.map(i18n => {
        if (!formDescriptionWidget[i18n.language])
          formDescriptionWidget[i18n.language] = {};
        formDescriptionWidget[i18n.language].title = i18n.value;
      });
      widget.contentI18n.map(i18n => {
        formDescriptionWidget[i18n.language].content = i18n.value;
      });
      formDescriptionWidget.enable = widget.enable;
      formDescriptionWidget.messageKey = 'form.description';
      let nowInfo = {};
      if (formDescriptionWidget[this.props.user.language.toLowerCase()]) {
        nowInfo = formDescriptionWidget[this.props.user.language.toLowerCase()];
      } else {
        nowInfo = {title: '', content: ''};
      }
      formDescriptionWidget.title = nowInfo.title;
      formDescriptionWidget.content = nowInfo.content;
      this.setState({formDescriptionWidget})
    } else {
      const {nowWidget, nowSelectedIndex} = this.state;
      nowWidget[nowSelectedIndex] = widget;
      this.setState({nowWidget});
    }
  };

  //保存表单
  handleSave = () => {
    const {formDescriptionWidget, nowWidget} = this.state;
    const {form} = this.context;
    const macthFormData = this.props.matchFormData;
    //组装说明文字
    let formDescriptionData = {};
    formDescriptionData.formOid = form.formOid;
    formDescriptionData.propertyName = 'form.description';
    let descriptionValue = {};
    descriptionValue.enable = formDescriptionWidget.enable;
    Object.keys(formDescriptionWidget).map(key => {
      this.props.languageList.map(language => {
        if (key === language.code.toLowerCase()) {
          descriptionValue[key] = formDescriptionWidget[key];
        }
      });
    });
    formDescriptionData.propertyValue = JSON.stringify(descriptionValue);
    let targetWidgets = [].concat(nowWidget);
    targetWidgets.map((widget, index) => {
      if (widget.messageKey === 'select_participant' && widget.fieldContent &&
        JSON.parse(widget.fieldContent).out) {
        let newWidget = {};
        newWidget.messageKey = widget.outMessageKey ? widget.outMessageKey : 'out_participant_num';
        newWidget.fieldName = widget.outFieldName;
        newWidget.promptInfo = widget.outPromptInfo;
        newWidget.required = widget.outRequired;
        newWidget.isReadOnly = widget.outIsReadOnly;
        newWidget.isPDFShow = widget.outIsPDFShow;
        newWidget.id = widget.outID;
        newWidget.fieldOid = widget.outFieldOid;
        newWidget.fieldConstraint = "";
        newWidget.i18n = {};
        newWidget.valid = true;
        newWidget.dataSource = "";
        newWidget.fieldType = "LONG";
        newWidget.customFormFieldI18nDTOS = widget.outCustomFormFieldI18nDTOS;
        targetWidgets.splice(index + 1, 0, newWidget);
      }
    });
    targetWidgets.map((widget, index) => {
      if (widget.messageKey === 'payee') {
        let newWidget = {};
        newWidget.messageKey = 'contact_bank_account';
        newWidget.fieldName = widget.bankFieldName;
        newWidget.promptInfo = widget.bankPromptInfo;
        newWidget.required = widget.required;
        newWidget.isReadOnly = widget.isReadOnly;
        newWidget.isPDFShow = widget.isPDFShow;
        newWidget.id = widget.bankID;
        newWidget.fieldOid = widget.bankFieldOid;
        newWidget.fieldConstraint = "";
        newWidget.i18n = {};
        newWidget.valid = true;
        newWidget.dataSource = "";
        newWidget.fieldType = "TEXT";
        newWidget.customFormFieldI18nDTOS = widget.bankCustomFormFieldI18nDTOS;
        targetWidgets.splice(index + 1, 0, newWidget);
      }
    });
    //组装表单控件
    let participantsImportScopeData = null;
    targetWidgets.map((widget, index) => {
      if (widget.messageKey === 'select_participant') {
        participantsImportScopeData = {
          formOid: form.formOid,
          propertyName: 'application.participants.import.scope',
          propertyOther: null,
          propertyValue: widget.participantsImportScope
        }
        if (widget.participantsImportScope) {
          participantsImportScopeData.propertyValue = widget.participantsImportScope;
        } else {
          participantsImportScopeData.propertyValue = '1';
        }
      }
      widget.i18n = {
        fieldName: [],
        promptInfo: []
      };
      widget.customFormFieldI18nDTOS.map(i18nDTO => {
        widget.i18n.fieldName.push({language: i18nDTO.language, value: i18nDTO.fieldName});
        widget.i18n.promptInfo.push({language: i18nDTO.language, value: i18nDTO.promptInfo});
      });
      widget.sequence = index;

      if (widget.messageKey === 'linkage_switch') {
        widget.i18n.fieldContent = [];
        widget.customFormFieldI18nDTOS.map(i18nDTO => {
          widget.i18n.fieldContent.push({
            language: i18nDTO.language,
            value: i18nDTO.fieldContent
          })
        })
      }
      return widget;
    });

    targetWidgets.map(item => {
      item.i18n.promptInfo.map(i18n => {
        if (i18n.value == null || i18n.value == 'null') {
          i18n.value = this.$t({ id: 'common.please.enter' });
        }
      });
    });
    form.customFormFields = targetWidgets;

    if (!this.validateData(form)) {
      return;
    }

    const formVal = {
      ...form,
      ...macthFormData
    }
    this.setState({saving: true});
    let serviceArray = [
      formService.saveFormProperty([formDescriptionData]),
      formService.saveFormDetail(formVal)
    ];
    participantsImportScopeData && serviceArray.unshift(formService.saveFormProperty([participantsImportScopeData]));
    Promise.all(serviceArray).then(res => {
      message.success(this.$t('common.save.success', {name: form.formName}));
      this.setState({saving: false});
    }).catch(e => {
      let error = e.response.data;
      if (error.validationErrors && error.validationErrors.length) {
        message.error(`${this.$t('common.save.filed')}，${error.validationErrors[0].message}`)
      } else {
        message.error(`${this.$t('common.save.filed')}，${error.message}`)
      }
      this.setState({saving: false});
    });
  };

  //是否包含某种类型的控件
  isHasSpecialField = (messageKey) => {
    const {nowWidget} = this.state;
    let isHas = false;
    nowWidget.map(widget => {
      if (messageKey === widget.messageKey) {
        isHas = true;
      }
    });
    return isHas;
  };


  //定位到报错的控件
  handleErrorIndex = (messageKey) => {
    const {nowWidget} = this.state;
    let errorIndex = -1;
    if (messageKey === 'out_participant_num') {
      errorIndex = this.handleErrorIndex('select_participant');
    } else if (messageKey === 'contact_bank_account' && this.isHasSpecialField('payee')) {
      errorIndex = this.handleErrorIndex('payee');
    } else {
      nowWidget.map((widget, index) => {
        if (messageKey === widget.messageKey) {
          errorIndex = index;
        }
      });
    }
    return errorIndex;
  };

  //保存，提交前数据校验
  validateData = (form) => {
    let isOk = true;
    let errorMsg = '';
    let errorMessageKey = '';
    let errorIndex = -1;
    form.customFormFields.map((customFormField) => {
      if (!customFormField.fieldName) {
        errorMsg = this.$t('form.setting.error01');//标题不能为空
        errorMessageKey = customFormField.messageKey;
        isOk = false;
      }
      if (customFormField.reportShow && !customFormField.reportOrmKey) {
        errorMsg = this.$t('form.setting.error02', {fieldName: customFormField.fieldName});//请选择${customFormField.fieldName}代入报表的属性
        errorMessageKey = customFormField.messageKey;
        isOk = false;
      }
      if (customFormField.messageKey === 'employee_expand' && customFormField.dataSource === '') {
        errorMsg = this.$t('form.setting.error03', {fieldName: customFormField.fieldName});//请选择${customFormField.fieldName}扩展字段选项
        errorMessageKey = customFormField.messageKey;
        isOk = false;
      }
      if (customFormField.messageKey === 'cust_list' && customFormField.dataSource === '') {
        errorMsg = `${customFormField.fieldName}${this.$t('extend.field.list.no.empty')}`;
        errorMessageKey = customFormField.messageKey;
        isOk = false;
      }
      if (customFormField.messageKey === 'select_cost_center' && customFormField.dataSource === '') {
        errorMsg = this.$t('form.setting.error04', {fieldName: customFormField.fieldName});//${customFormField.fieldName}成本中心列表不可为空
        errorMessageKey = customFormField.messageKey;
        isOk = false;
      }
      if (customFormField.messageKey === 'select_box') {
        JSON.parse(customFormField.fieldContent.replace(/\\/g,'')).map(item => {
          if (!item.name || item.name === '') {
            errorMsg = this.$t('form.setting.error05', {fieldName: customFormField.fieldName});//${customFormField.fieldName}选项名称不能为空
            errorMessageKey = customFormField.messageKey;
            isOk = false;
          }
        })
      }
      if (customFormField.messageKey === 'select_participant' && customFormField.fieldContent) {
        let fieldContent = JSON.parse(customFormField.fieldContent);
        if (!fieldContent.out && !fieldContent.isUse) {
          errorMsg = this.$t('form.setting.error06');//参与人控件需必选一项
          errorMessageKey = customFormField.messageKey;
          isOk = false;
        }
      }
    });

    if (!isOk) {
      message.error(errorMsg);
      errorIndex = this.handleErrorIndex(errorMessageKey);
      if (errorIndex !== -1) {
        this.setState({
          nowSelectedIndex: errorIndex
        });
      }
    }
    return isOk;
  };

  //必填，只读，打印，代入报表
  //true默认打印，代入;false默认不打印，不代入;null不允许配置打印，代入报表
  renderShowConfig = (widget) => {
    let showConfig = {required: true, isReadOnly: true};
    if (widget.isPDFShow !== null && widget.isPDFShow !== undefined) {
      showConfig.isPDFShow = true;
    }
    if (widget.reportShow !== null && widget.reportShow !== undefined) {
      showConfig.reportShow = true;
      widget.reportScopeList = this.renderReportScopeList(widget.reportOrmKey);
    }
    return showConfig;
  };

  //渲染每个控件可关联的报表属性
  renderReportScopeList = (reportOrmKey) => {
    const {nowWidget} = this.state;
    let reportScopeList = [];
    let selectedReportScopeList = [];
    nowWidget.map((widget) => {
      if (widget.reportShow && widget.reportOrmKey) {
        selectedReportScopeList.push(widget.reportOrmKey);
      }
    });
    this.state.reportScopeList.map(item => {
      if (selectedReportScopeList.indexOf(item.code) == -1 || item.code === reportOrmKey) {
        reportScopeList.push(item);
      }
    });
    return reportScopeList;
  };

  renderWidgetArea = () => {
    //账套级表单要隐藏这边
    const {normalWidget, combineWidget} = this.state;
    if (!this.props.tenantMode && this.context.form.fromType === 2) {
      return (
        <Col span={4}>
          <div>
          </div>
        </Col>
      )
    } else {
      return (
        <Col span={8}>
          <div className="widget-area">
            <div className="widget-category">{this.$t('form.setting.normal.widget')/*普通控件*/}</div>
            <div className="widget-list">
              {normalWidget.map(widget => <DragWidgetItem widget={widget}
                                                          key={widget.messageKey}/>)}
            </div>
            <div className="widget-category">{this.$t('form.setting.combo.widget')/*组合控件*/}</div>
            <div className="widget-list">
              {combineWidget.map(widget => <DragWidgetItem widget={widget}
                                                           key={widget.messageKey}/>)}
            </div>
          </div>
        </Col>
      )
    }

  }
  goBack=()=>{
    this.props.dispatch(
        routerRedux.push({
          pathname: `/admin-setting/form-list`,
        })
      );
  }

  render() {
    const {normalWidget, combineWidget, nowWidget, nowSelectedIndex, loading, formDescriptionWidget, saving} = this.state;
    const selectedWidget = nowSelectedIndex === -1 ? formDescriptionWidget : nowWidget[nowSelectedIndex];
    return (
      <div className="drag-widget-page form-detail-custom" style={{paddingBottom:'40px'}}>
        {loading ? <Spin/> : (
          <div>
            <FakeDropLayout/>
            <Row gutter={40}>
              {
                this.renderWidgetArea()
              }
              <Col span={8}>
                <div className="fake-phone">
                  <div className="phone-buttons">
                    <div className="phone-camera"/>
                    <div className="phone-button phone-button-power"/>
                    <div className="phone-button phone-button-volume-up"/>
                    <div className="phone-button phone-button-volume-down"/>
                    <div className="phone-flash"/>
                  </div>
                  <PhoneContent widgetList={nowWidget}
                                formDescriptionWidget={formDescriptionWidget}
                                onSort={this.handleSort}
                                deleteEnabled={this.context.form.fromType != 2 || this.props.tenantMode}
                                dragEnabled={this.context.form.fromType != 2 || this.props.tenantMode}
                                nowSelectedIndex={nowSelectedIndex}
                                onDelete={this.handleDelete}
                                onSelect={this.handleSelectWidget}
                                onDrop={this.handleDrop}/>
                </div>
              </Col>
              <Col span={8} className="form-detail-custom-setting">
                <WidgetSetting widget={selectedWidget}
                               isFormDesign={true}
                               formType={this.context.formType}
                               formOid={this.context.formOid}
                               booksID={this.context.booksID}
                               needType
                               nowWidgetList={nowWidget}
                               showConfig={this.renderShowConfig(selectedWidget)}
                               disabled={!this.props.tenantMode && this.context.form.fromType === 2}
                               valueKey="counterFlag"
                               widgetList={normalWidget.concat(combineWidget)}
                               onChange={this.handleChangeWidget}/>
                <div className="operate-area">
                  <Button type="primary" loading={saving}
                          onClick={this.handleSave}>{this.$t('common.save')/*保存*/}</Button>
                </div>
              </Col>
            </Row>
          </div>
        )}
        <div style={{paddingLeft:'20px'}}>
                <Affix offsetBottom={0} style={{
                 position: 'fixed', bottom: 0, marginLeft: '-35px', width: '100%', height: '50px',
                 boxShadow: '0px -5px 5px rgba(0, 0, 0, 0.067)', background: '#fff', lineHeight: '50px', zIndex: 1
                 }}>
                    <Button
                    type="primary"
                    onClick={this.goBack}
                    style={{ margin: '0 20px' }}
                    >
                {this.$t('common.back' /*提 交*/)}
                </Button>
                </Affix>

                </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    language: state.languages.languages,
    languageList: state.languages.languageList,
    isOldCompany: state.user.isOldCompany,
    user: state.user.currentUser,
    tenantMode: true
  }
}

FormDetailCustom.contextTypes = {
  formType: PropTypes.any,
  formOid: PropTypes.string,
  booksID: PropTypes.string,
  form: PropTypes.object,
  propertyList: PropTypes.array
};

export default connect(mapStateToProps, null, null, {withRef: true})(DragDropContext(HTML5Backend)(FormDetailCustom))
