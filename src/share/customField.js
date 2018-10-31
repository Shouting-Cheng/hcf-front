import React from 'react'
import moment from 'moment'
import config from 'config'
import {deepCopy, deepFullCopy} from 'utils/extend'
import { messages } from "utils/utils"
import {Switch, Input, Select, Row, Col, InputNumber, DatePicker, Table, Popover, TimePicker} from 'antd'
import app from '../index';

const {TextArea} = Input;
const Option = Select.Option;
import 'styles/custom-fields.scss'
import Chooser from 'widget/chooser'
import Selector from 'widget/selector'
import IsVenMaster from 'widget/Template/combination-custom-form/is-ven-master'
import chooserData from 'chooserData'
//import configureStore from 'stores'

import ImageUpload from 'widget/image-upload'
import AddTableCell from 'widget/Template/add-table-cell'
import ExpenseTypeModal from 'containers/request/new-request/expense-type-modal'
import NewVenMaster from 'containers/request/new-request/new-ven-master'
import NewDestination from 'containers/request/new-request/new-destination'
import NewLinkageSwitch from 'containers/request/new-request/new-linkage-switch'
import NewPayee from 'containers/request/new-request/new-payee'
import travelUtil from 'containers/request/travel-request/travelUtil'
import ExpenseAllocateForm from 'containers/request/travel-request/expense-allocate-form';
import SelectDateForm from 'containers/request/travel-request/select-date-form';
import ExternalParticipantName from 'containers/request/custom-field/external-participant-name'
import {Modal, Icon} from "antd/lib/index";
import FileUpload from 'widget/file-upload'

export default {
  /**
   * @description
   * @param fields 表单渲染项
   * @param info 数据源信息 eg 报销单信息
   * @param applicant 申请人信息
   * */
  renderFields(fields, info, applicant) {
    let showFields = deepCopy(fields);
    let rows = [];
    let cols = [];
    let renderImageList = [];
    let renderTableList = [];
    let renderMoney = (value) => {
      let numberString = Number(value || 0).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
      numberString += (numberString.indexOf('.') > -1 ? '' : '.00');
      return numberString
    };
    //加签人,非自定义表单
    if (info.countersignApproverNames) {
      let countersignApproverNames = [];
      info.countersignApproverNames.map(item => {
        countersignApproverNames.push(item.fullName);
      })
      showFields.push({
        fieldName: messages('customField.special.signer')/*"加签人"*/,
        messageKey: "addSign",
        showValue: countersignApproverNames.join(',')
      })
    }
    let filterMoney = React.Component.prototype.filterMoney;
    showFields.map(item => {
      if (item.messageKey === 'average_budget') {
        item.renderValue = item.showValue ? `${info.currencyCode} ${renderMoney(item.showValue)}` : `${info.currencyCode} 0.00`
      }
      if (item.messageKey === 'total_budget') {
        if (info.formType != 2005) {
          item.renderValue = item.showValue ? `${info.currencyCode} ${renderMoney(item.showValue)}` : `${info.currencyCode} 0.00`
        } else {
          item.renderValue = item.showValue ? `${renderMoney(item.showValue)}` : `0.00`
        }
      }
      if (item.messageKey === 'start_date' || item.messageKey === 'end_date' || item.messageKey === 'common.date' || item.messageKey === 'date') {
        item.renderValue = item.showValue ? moment(item.showValue).format('YYYY-MM-DD') : '-'
      }
      if (item.messageKey === 'dateTime') {
        item.renderValue = item.showValue ? moment(item.showValue).format('YYYY-MM-DD HH:mm') : '-'
      }
      if (item.messageKey === 'contact_bank_account') {
        this.dealSpecialFormShow(cols, item, info);
      }
      if (item.messageKey === 'time') {
        item.renderValue = item.showValue ?
          (moment(item.showValue)['_isValid'] ? moment(item.showValue).format('HH:mm') : item.showValue) : '-'
      }
      if (item.messageKey === 'linkage_switch') {
        if (item.showValue === 'true') {
          item.renderValue = (
            <div>
              {JSON.parse(item.fieldContent || '[]').map(item => {
                return <div key={item.id}>{item.fieldName}：{item.name || item.value || '-'}</div>
              })}
            </div>
          )
        } else {
          item.renderValue = messages('customField.no'/*否*/)
        }
      }
      if (item.messageKey === 'venMasterSwitch') {
        if (item.value === 'true') {
          this.dealSpecialFormShow(cols, item, info, 'venMaster');
          let fieldContent = item.fieldContent ? JSON.parse(item.fieldContent) : {};
          let value;
          let name;
          fieldContent.map(item => {
            if (item.messageKey === 'venMaster') {
              name = item.fieldName
              value = item.value
            }
          })
          item.renderValue = <NewVenMaster value={value} onlyShow={true}/>;
          cols.push(
            <Col span={8} key={item.formValueOID} className="field-container">
              <div className="field-name">{item.fieldName}</div>
              <div
                className="field-content">{item.value === 'true' ? messages('common.yes') : messages('common.no')}</div>
            </Col>
          )
          cols.push(
            <Col span={8} className="field-container">
              <div className="field-name">{name}</div>
              <div className="field-content">{item.renderValue || '-'}</div>
            </Col>
          )
        } else {
          this.dealSpecialFormShow(cols, item, info, 'contact_bank_account');
        }
      }
      if (item.messageKey === 'switch' || item.messageKey === 'writeoff_flag') {
        item.renderValue = item.showValue === 'true' ? messages('customField.yes'/*是*/) : messages('customField.no'/*否*/)
      }
      if (item.messageKey === 'select_box') {
        let value = [];
        JSON.parse(item.showValue || '[]').map(item => {
          value.push(item.name)
        });
        item.renderValue = value.join('，') || '-';
      }
      if (item.messageKey === 'select_participant') {
        let value = [];
        JSON.parse(item.showValue || '[]').map(item => {
          value.push(item.fullName)
        });
        item.renderValue = value.join('，') || '-';
      }
      if(item.messageKey === 'external_participant_name' || item.messageKey === 'out_participant_name') { //外部乘机人
        item.renderValue = JSON.parse(item.showValue || '[]').length ? (
          <ExternalParticipantName field={item} value={JSON.parse(item.showValue || '[]')}/>
        ) : '-';
      }
      if (item.messageKey === 'employee_expand') {
        if ((item.attachmentImages || []).length) {
          item.renderValue = (
            <ImageUpload defaultFileList={item.attachmentImages}
                         attachmentType="INVOICE_IMAGES"
                         disabled/>
          );
          renderImageList.push(item)
        }
      }
      if (item.messageKey === 'attachment' || item.messageKey === 'image') { //附件 图片
        item.renderValue = (item.attachmentImages || []).length ? (
          <FileUpload defaultFileList={item.attachmentImages}
                       attachmentType="INVOICE_IMAGES"
                      showFileName = {false}
                       disabled/>
        ) : '-';
        renderImageList.push(item)
      }
      if (item.messageKey === 'budget_detail') { //预算明细
        let columns = [
          {
            title: '',
            dataIndex: 'id',
            width: '5%',
            render: (value, record) => <img src={record.expenseType.iconURL} style={{width: 20}}/>
          },
          {
            title: messages('customField.expense.type'/*费用类型*/), dataIndex: 'expenseType', render: value =>
              <Popover content={value.name}>{value.name}</Popover>
          },
          {title: messages('customField.currency'/*币种*/), dataIndex: 'currencyCode'},
          {title: messages('customField.amount'/*金额*/), dataIndex: 'amount', render: filterMoney},
          {title: messages('customField.rate'/*汇率*/), dataIndex: 'actualCurrencyRate', render: value => filterMoney(value, 4)},
          {
            title: messages('customField.base.amount'/*本币金额*/), dataIndex: 'baseAmount', render: (value, record) =>
              filterMoney((record.amount * record.actualCurrencyRate).toFixed(4))
          },
          {
            title: messages('customField.pay.way'/*支付方式*/), dataIndex: 'paymentType', render: value =>
              value === 1001 ? messages('customField.pay.by.person'/*个人支付*/) : messages('customField.pay.by.company'/*公司支付*/)
          }
        ];
        let data = JSON.parse(item.showValue || '{}').budgetDetail;
        item.value && renderTableList.push(<Table rowKey={(record, index) => index}
                                                  columns={columns}
                                                  dataSource={data}
                                                  pagination={false}
                                                  bordered
                                                  size="middle"/>)
      }
      if (item.messageKey === 'exp_allocate') { //费用分摊
        let columns = [];
        let data = [];
        JSON.parse(item.showValue || '[]').map((record, i) => {
          let record_data = {
            id: i,
            scale: record.scale
          };
          record.costCenterItems.map((item, index) => {
            i === 0 && columns.push({title: item.fieldName, dataIndex: `data_${index}`, render: value => value || '-'});
            record_data[`data_${index}`] = item.name
          });
          data.push(record_data)
        });
        columns.push({title: messages('customField.allocate.scale'/*分摊比例(%)*/), dataIndex: 'scale'});
        item.value && renderTableList.push(<Table rowKey="id"
                                                  columns={columns}
                                                  dataSource={data}
                                                  pagination={false}
                                                  bordered
                                                  size="middle"/>)
      }
      if (item.messageKey === 'venMaster') {
        item.renderValue = <NewVenMaster value={item.value} onlyShow={true}/>
      }
      // 申请人部门与详情部门不一致 显示需要高亮
      if (['budget_detail', 'exp_allocate', 'attachment', 'image', 'contact_bank_account', 'venMasterSwitch'].indexOf(item.messageKey) === -1 &&
        !(item.messageKey === 'employee_expand' && item.attachmentImages && item.attachmentImages.length)) {
        cols.push(
          <Col span={8} key={item.formValueOID} className="field-container">
            <div className="field-name">{item.fieldName}</div>
            {applicant && applicant.departmentOID ? <div className="field-content" style={item.messageKey === 'select_department' && applicant && item.value !== applicant.departmentOID ? {color: '#f50'} : {}}>
              {item.renderValue || item.showValue || '-'}
            </div> : '-'}
          </Col>
        )
      }
    });
    rows.push(
      <Row type="flex" key={0} className="custom-form-row">
        {cols}
      </Row>
    );
    //图片在最下方一行显示
    renderImageList.map((item, index) => {
      rows.push(
        <Row key={index + 1000} className="custom-form-row">
          <div className="field-name">{item.fieldName}</div>
          <div className="field-content">{item.renderValue || '-'}</div>
        </Row>
      )
    });
    //表格显示
    renderTableList.map((item, index) => {
      rows.push(<Row key={index + 1} className="custom-form-row">{item}</Row>)
    });
    return rows;
  },
  //处理特别的控件显示
  dealSpecialFormShow(cols, item, info, messageKey = item.messageKey) {
    if (messageKey === 'contact_bank_account') {
      let isExpenseReport = info.expenseReportOID;
      let showValue = item.showValue && isExpenseReport ? JSON.parse(item.showValue) : isExpenseReport ? {} : {bankAccountNo: item.showValue};
      if (item.messageKey === 'venMasterSwitch' && !isExpenseReport) {
        showValue = JSON.parse(item.showValue);
      }
      let otherFields = [];
      if (item.messageKey === 'venMasterSwitch') {
        let fieldContent = item.fieldContent ? JSON.parse(item.fieldContent) : {};
        otherFields.push({
          fieldName: item.fieldName,
          renderValue: item.value === 'true' ? messages('common.yes') : messages('common.no')
        });
        let fieldName;
        fieldContent.map(item => {
          if (item.messageKey === 'contact_bank_account') {
            fieldName = item.fieldName;
            showValue = item.showValue && isExpenseReport ? JSON.parse(item.showValue) : isExpenseReport ? {} : {bankAccountNo: item.showValue};
          }
        })
        otherFields.push({
          fieldName: fieldName,
          renderValue: showValue.bankAccountNo
        });
      }
      else {
        item.renderValue = showValue.bankAccountNo;
        otherFields.push({
          fieldName: item.fieldName,
          renderValue: showValue.bankAccountNo
        });
      }

      if (isExpenseReport) {
        otherFields.push({
          fieldName: messages('customField.bankAccountName'/*开户支行*/),
          renderValue: showValue.branchName
        });
        otherFields.push({fieldName: messages('customField.bankCode'/*联行号*/), renderValue: showValue.bankCode});
        otherFields.push({
          fieldName: messages('customField.branchName'/*开户名*/),
          renderValue: showValue.bankAccountName
        });
      }
      item.renderValue = (
        <div>
          {otherFields.map((i, index) => {
            cols.push(
              <Col span={8} key={`${item.formValueOID}${index}`} className="field-container">
                <div className="field-name">{i.fieldName}</div>
                <div className="field-content">{i.renderValue || '-'}</div>
              </Col>)
          })}
        </div>
      )
    }
  },
  /**
   * @description form表单项渲染
   * @param field Field 表单项内容
   * @param fieldDefaultValue FieldDefaultValue 表单项默认值
   * @param customFormFields CustomFormFields 部分控件需要用到表单信息 例如 收款单位 (去除 formDetail中含有该对象)
   * @param formDetail FormDetail 数据源对象
   * @param copyValue
   * @param type Number 1:等于申请单 2：报销单
   * @param getPopupContainer 滚动元素相对元素对象
   * */
  renderForm({field, fieldDefaultValue, copyValue, type = 1, formDetail = {}, getPopupContainer = () => document.body}) {
    let chooserItem;
    switch (field.messageKey) {
      case 'title':
        return <Input placeholder={field.promptInfo}/>;
      case 'select_department':
        chooserItem = deepFullCopy(chooserData['department']);
        let leafEnable = React.Component.prototype.checkFunctionProfiles('department.leaf.selection.required', [undefined, false]) ? false : true;
        chooserItem.url += `?leafEnable=${leafEnable}`;
        return <Chooser selectorItem={chooserItem}
                        valueKey="departmentOid"
                        placeholder={field.promptInfo}
                        labelKey={React.Component.prototype.checkFunctionProfiles('department.full.path.disabled', [true]) ? 'name' : 'name'}
                        onlyNeed="departmentOid"
                        onChange={(e, all) => {
                          copyValue && copyValue.checkedChange && copyValue.checkedChange(field, e, all)
                        }}
                        disabled={!!(field.fieldConstraint && JSON.parse(field.fieldConstraint).valueReadonly)}
                        single/>;
      case 'currency_code':
        let params = {
          language: 'chineseName',
          userOID: app.getState().user.currentUser.userOID
        };
        return (
          <Selector type={'currency'} params={params} filter={item => item.enable}
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    showSearch={true}
                    allowClear={false}
                    disabled={type === 1 ?
                      false:
                      React.Component.prototype.checkFunctionProfiles('invoice.header.multi.currency.allowed', [false])
                    }/>
        );
      case 'remark':
        return <TextArea rows={4} placeholder={field.promptInfo} style={{resize: 'none'}}/>;
      case 'select_cost_center':
        chooserItem = deepFullCopy(chooserData['cost_center_item']);
        chooserItem.url = `${config.baseUrl}/api/my/cost/center/items/${field.dataSource && JSON.parse(field.dataSource || '{}').costCenterOID}`;
        return <Chooser selectorItem={chooserItem}
                        placeholder={field.promptInfo}
                        valueKey="costCenterItemOID"
                        labelKey="name"
                        listExtraParams={{applicantOID: app.getState().user.currentUser.userOID}}
                        onlyNeed="costCenterItemOID"
                        onChange={(e, all) => {
                          copyValue && copyValue.checkedChange && copyValue.checkedChange(field, e, all)
                        }}
                        disabled={!!(field.fieldConstraint && JSON.parse(field.fieldConstraint).valueReadonly)}
                        single/>;
      case 'select_corporation_entity':
        return <Chooser type="corporation_entity"
                        valueKey="companyReceiptedOID"
                        placeholder={field.promptInfo}
                        labelKey="companyName"
                        onlyNeed="companyReceiptedOID"
                        disabled={field.isReadOnly}
                        single/>;
      case 'select_participant':
        let fieldContent=field.fieldContent?JSON.parse(field.fieldContent):{editable:true};
        chooserItem = deepFullCopy(chooserData['participants']);
        chooserItem.title = `${messages('configuration.detail.select')}${field.fieldName}`;
        chooserItem.key = 'userOID';
        //参与人安全权限校验
        let departmentValues = this.byMkGetValue(formDetail.customFormFields, 'select_department');
        let departmentOIDSet = '';
        if (departmentValues && departmentValues.length > 0 && departmentValues[0]) {
          departmentOIDSet = `&departmentOID=${departmentValues[0]}`;
        }
        let costCentreValues = this.byMkGetValue(formDetail.customFormFields, 'select_cost_center');
        let costCentreValue = [];
        let costCentreValuesSet = '';
        if (costCentreValues && costCentreValues.length > 0) {
          costCentreValues.map(item => {
            if (item) {
              costCentreValue.push(`costCentreOID=${item}`)
            }
          })
          if (costCentreValue.length > 0) {
            costCentreValuesSet = '&' + costCentreValue.join('&');
          }
        }
        chooserItem.url += `?proposerOID=${app.getState().user.currentUser.userOID}${departmentOIDSet}${costCentreValuesSet}`;
        return <Chooser selectorItem={chooserItem}
                        valueKey="userOID"
                        labelKey="fullName"
                        listExtraParams={{formOID: field.formOID}}
                        disabled={field.isReadOnly || !fieldContent.editable}
                        newline/>;
      case 'select_approver':
        return <Chooser type="user"
                        valueKey="userOID"
                        listExtraParams={{roleType: 'TENANT'}}
                        labelKey="fullName"
                        onlyNeed="userOID"
                        maxNum={JSON.parse(field.fieldConstraint || '{}').maxApprovalChain || -1}
                        newline/>;
      case 'total_budget':
        if (formDetail.formType != 2005) {
          return <InputNumber min={0} precision={2} style={{width: '90%', marginRight: 0, float: 'right'}}/>;
        } else {
          return <InputNumber min={0} precision={2} style={{width: '100%', marginRight: 0, float: 'right'}}/>;
        }
      case 'average_budget':
        return <InputNumber min={0} precision={2} style={{width: '90%', marginRight: 0, float: 'right'}}/>;
      case 'date':
        return <DatePicker disabledDate={date => {
          return date && date.valueOf() < new Date(new Date().format('yyyy-MM-dd 00:00:00')).valueOf()
        }}/>;
      case 'payee':
        return <NewPayee disabled={field.isReadOnly}/>;
      case 'contact_bank_account':
        let userOID=app.getState().user.currentUser.userOID;
        formDetail.customFormFields.map(item => {
          if (item.messageKey === 'payee' && item.value) {
            userOID = item.value;
          }
        })
        return <Chooser type="bank_card"
                        valueKey="contactBankAccountOID"
                        labelKey="bankAccountNo"
                        onlyNeed="contactBankAccountOID"
                        listExtraParams={{userOID: userOID}}
                        single/>;
      case 'linkage_switch':
        return <NewLinkageSwitch/>;
      case 'venMasterSwitch':
        return <IsVenMaster/>;
      case 'image':
        return <ImageUpload attachmentType="INVOICE_IMAGES"
                            showMaxNum
                            defaultFileList={JSON.parse(field.showValue || '[]')}
                            maxNum={field.fieldConstraint ? JSON.parse(field.fieldConstraint).maxNumber : 9}/>;
      case 'select_box':
        return (
          <Select allowClear labelInValue
                  mode={JSON.parse(field.fieldConstraint || '{}').type === '1' ? 'multiple' : '-'}>
            {JSON.parse(field.fieldContent || '[]').map(item => {
              return <Option key={item.id}>{item.name}</Option>
            })}
          </Select>
        );
      case 'cust_list':
        let OID = field.dataSource ? JSON.parse(field.dataSource || '{}').customEnumerationOID : '';
        let selectorItem = {
          url: `${config.baseUrl}/api/custom/enumerations/${OID}/items/v2?&page=0&size=1000`,
          label: record => record.messageKey,
          key: 'value', //报销单和申请单保存时存的都是code，不要再改成OID了～～
          offlineSearchMode: true,
        };
        return (
          <Selector selectorItem={selectorItem} getPopupContainer={getPopupContainer}/>
        );
      case 'number':
        let max = field.fieldConstraint ?
          Math.pow(10, JSON.parse(field.fieldConstraint || '{}').integerMaxLength) - Math.pow(0.1, JSON.parse(field.fieldConstraint || '{}').decimalMaxLength) :
          Infinity;
        //修正整数部分长度
        let fieldCon = field.fieldConstraint ? JSON.parse(field.fieldConstraint) : {decimalMaxLength:2,integerMaxLength:'default'};
        let pre = fieldCon.decimalMaxLength;
        let formatNumber = function (v) {
          let regStr = "^[+-]?([0-9]*\.?[0-9]+|[0-9]+\.?[0-9]*)([eE][+-]?[0-9]+)?$";
          v = v + '';
          let temp = v.match(regStr);
          if(temp){
            v = temp[0];
            let havePoint = v.indexOf('.') >= 0;
            let arr = v.split('.');
            v = arr[0].substr(0,fieldCon.integerMaxLength) + `${havePoint ? '.':''}${arr[1] ? arr[1].substr(0,pre):''}`;
          }
          return v;
        };
        return <InputNumber style={{width: '100%'}}
                            min={0}
                            formatter={value => `${formatNumber(value)}`}
                            parser={val => val}
                            precision={pre}/>;
      case 'input':
        return <Input placeholder={field.promptInfo}/>;
      case 'text_area':
        return <TextArea rows={4} placeholder={field.promptInfo} style={{resize: 'none'}}/>;
      case 'time':
        return <TimePicker format='HH:mm' allowClear/>;
      case 'attachment':
        return <FileUpload maxNum={field.fieldConstraint ? JSON.parse(field.fieldConstraint || '{}').maxNumber : 9}
                            showMaxNum
                            fileSize={10}
                            defaultFileList={JSON.parse(field.showValue || '[]')}
                            attachmentType="INVOICE_IMAGES"/>;
      case 'switch':
        return <Switch/>;
      case 'destination':
        return <NewDestination/>;
      case 'common.date':
        return <DatePicker/>;
      case 'select_air_ticket_supplier':
        return <Selector type="supplier" getPopupContainer={getPopupContainer}/>;
      case 'dateTime':
        return <DatePicker showTime={{format: 'HH:mm'}} format="YYYY-MM-DD HH:mm"/>;
      case 'select_user':
        return <Chooser type="user"
                        valueKey="userOID"
                        placeholder={field.promptInfo}
                        labelKey="fullName"
                        onlyNeed="userOID"
                        listExtraParams={{roleType: 'TENANT'}}
                        single={!JSON.parse(field.fieldConstraint || '{}').selectMode}
                        newline/>;
      case 'employee_expand':
        if (fieldDefaultValue && fieldDefaultValue.code === 'image') {
          return <ImageUpload defaultFileList={fieldDefaultValue.attachmentImages}
                              attachmentType="INVOICE_IMAGES"
                              disabled/>
        } else if ((field.attachmentImages || []).length) {
          return <ImageUpload defaultFileList={field.attachmentImages}
                              attachmentType="INVOICE_IMAGES"
                              disabled/>
        }
        else if (field.fieldContent && (JSON.parse(field.fieldContent) || {}).messageKey === 'cust_list') {
          let OID = '';
          if (field.fieldContent && JSON.parse(field.fieldContent)) {
            let fieldItem = JSON.parse(field.fieldContent);
            OID = fieldItem.dataSource ? JSON.parse(fieldItem.dataSource).customEnumerationOID : '';
          }
          let selectorItem = {
            url: `${config.baseUrl}/api/custom/enumerations/${OID}/items/v2?&page=0&size=1000`,
            label: record => record.messageKey,
            key: 'value',
            offlineSearchMode: true,
          };
          return (
            <Selector selectorItem={selectorItem} disabled={true} getPopupContainer={getPopupContainer}/>
          );
        }
        else {
          return <TextArea autosize disabled style={{resize: 'none'}}/>
        }
      case 'select_special_booking_person':
        return <Chooser type="booker"
                        valueKey="userOID"
                        labelKey="fullName"
                        onlyNeed="userOID"
                        single/>;
      case 'external_participant_name':
        let external_participant_name_columns = [{
          title: messages('customField.name'/*姓名*/),
          dataIndex: 'name',
          editable: true,
          isRequired: true,
          maxLength: 25
        }];
        let external_participant_name_id = {
          title: messages('customField.id.number'/*证件号*/),
          dataIndex: 'certificateNo',
          editable: true,
          isRequired: true,
          maxLength: 20,
          onlyCheck: true
        };
        JSON.parse(field.fieldContent || '{}').isContainCard && external_participant_name_columns.push(external_participant_name_id);
        return <AddTableCell columns={external_participant_name_columns}/>;
      case 'out_participant_name':
        let out_participant_name_columns = [{
          title: messages('customField.name'/*姓名*/),
          dataIndex: 'name',
          editable: true,
          isRequired: true,
          maxLength: 25
        }, {
          title: messages('customField.id.number'/*证件号*/),
          dataIndex: 'certificateNo',
          editable: true,
          isRequired: true,
          maxLength: 20,
          onlyCheck: true
        }];
        return <AddTableCell columns={out_participant_name_columns}/>;
      case 'budget_detail':
        return <ExpenseTypeModal formOID={field.formOID} formDetail={formDetail}/>;
      case 'writeoff_flag':
        return <Switch/>;
      case 'exp_allocate':
        return <ExpenseAllocateForm copyValue={copyValue}/>;
      case 'start_date':
        // return <DatePicker disabledDate={(c)=>travelUtil.disabledDateStart(c,field.endDate)}/>;
        return <SelectDateForm copyValue={copyValue} field={field} callFun={(isSet,date)=>copyValue.expectStopDate(isSet,date)}/>;
      case 'end_date':
        // return <DatePicker  disabledDate={(c)=>travelUtil.disabledDateEnd(c,field.startDate)}/>;
        return <SelectDateForm copyValue={copyValue} field={field} callFun={(isSet,date)=>copyValue.expectStopDate(isSet,date)}/>;
      case 'venMaster':
        formDetail = formDetail || {};
        return <NewVenMaster formDetail={formDetail}/>;
      case 'select_company':
        let showCode = JSON.parse(field.fieldConstraint || '{}').showCode;
        let selectorItemCompany = {
          url: `${config.baseUrl}/api/refactor/companies/user/setOfBooks?userOID=${app.getState().user.currentUser.userOID}&enabled=true&page=0&size=1000`,
          label: record => showCode ? `${record.name} - ${record.companyCode}` : record.name,
          key: 'companyOID'
        };
        return <Selector selectorItem={selectorItemCompany} disabled={field.isReadOnly} getPopupContainer={getPopupContainer}/>;
      case 'applicant':
        let selectorItemApplicant = {
          url: `${config.baseUrl}/api/bill/proxy/my/principals/${field.formOID}`,
          label: record => `${record.fullName} - ${record.employeeID}`,
          key: 'userOID',
          dynamicUrl: true
        };
        // 关联申请单会修改url信息
        field.applicationOID && (selectorItemApplicant.url = `${selectorItemApplicant.url}?applicationOID=${field.applicationOID}`);

        return (
          <Selector disabled={true} selectorItem={selectorItemApplicant} onChange={(e, all) => {
            copyValue && copyValue.checkedChange && copyValue.checkedChange(field, e, all)
          }} getPopupContainer={getPopupContainer}/>
        );
      case 'out_participant_num':
        return <InputNumber disabled={field.isReadOnly} max={9999} min={0} precision={0} placeholder={field.promptInfo} style={{width: '100%'}}/>;
      case 'effectiveNum':
        return <InputNumber min={0} precision={0} placeholder={field.promptInfo} style={{width: '100%'}}/>;
      default:
        return <Input placeholder={field.promptInfo}/>
    }
  },
  getInitialValue(field) {
    let values = [];
    switch (field.messageKey) {
      case 'title':
        return field.showValue;
      case 'select_department':
        return field.value ? [{name: field.showValue, departmentOid: field.value}] : undefined;
      case 'currency_code':
        return field.showValue;
      case 'remark':
        return field.showValue;
      case 'select_cost_center':
        return field.value ? [{name: field.showValue, costCenterItemOID: field.value}] : undefined;
      case 'select_corporation_entity':
        return field.value ? [{companyName: field.showValue, companyReceiptedOID: field.value}] : undefined;
      case 'select_participant':
        let initValue = (field.clearDefault) ? [] : JSON.parse(field.showValue || '[]').map(item => {
          values.push({userOID: item.userOID, fullName: item.fullName})
        });
        field.clearDefault = false;
        return values;
      case 'select_approver':
        field.showValue && field.showValue.split(',').map((name, index) => {
          values.push({fullName: name, userOID: field.value.split(':')[index]})
        });
        return values;
      case 'total_budget':
        return Number(field.showValue);
      case 'average_budget':
        return Number(field.showValue);
      case 'date':
        return field.showValue ? moment(field.showValue) : undefined;
      case 'payee':
        return field.value ? {key: field.value, label: field.showValue} : undefined;
      case 'contact_bank_account':
        return field.value ? [{
          bankAccountNo: field.showValue && this.isJson(field.showValue) ? JSON.parse(field.showValue).bankAccountNo : field.showValue,
          contactBankAccountOID: field.value
        }] : undefined;
      case 'linkage_switch':
        return {
          enabled: field.showValue === 'true',
          fieldContent: field.fieldContent,
          callBackSubmit: false
        };
      case 'venMasterSwitch':
        return {
          enabled: field.showValue === 'true',
          fieldContent: field.fieldContent,
          callBackSubmit: false
        };
      case 'select_box':
        JSON.parse(field.showValue || '[]').map(item => {
          values.push({
            label: item.name,
            key: item.id
          })
        });
        return JSON.parse(field.fieldConstraint || '{}').type === '1' ? values : values[0];
      case 'cust_list':
        return field.value ? {label: field.showValue, key: field.value} : undefined;
      case 'number':
        return Number(field.showValue);
      case 'input':
        return field.showValue;
      case 'text_area':
        return field.showValue;
      case 'time':
        //老中控创建的时间是 01:00 格式，所以与需要年份组合转化为moment格式
        return field.showValue ?
          (moment(field.showValue)['_isValid'] ? moment(field.showValue) : moment(new Date(`2000/01/01 ${field.showValue}`))) :
          undefined;
      case 'switch':
        return field.showValue === 'true';
      case 'destination':
        return field.showValue || '';
      case 'common.date':
        return field.showValue ? moment(field.showValue) : undefined;
      case 'select_air_ticket_supplier':
        return field.value ? {label: field.showValue, key: field.value} : undefined;
      case 'dateTime':
        return field.showValue ? moment(field.showValue) : undefined;
      case 'select_user':
        field.showValue && field.showValue.split(',').map((name, index) => {
          values.push({fullName: name, userOID: field.value.split(':')[index]})
        });
        return field.value ? (JSON.parse(field.fieldConstraint || '{}').selectMode ? values : [values[0]]) : undefined;
      case 'employee_expand':
        if (field && field.fieldContent && (JSON.parse(field.fieldContent) || {}).messageKey === 'cust_list') {
          return field.value ? {label: field.showValue, key: field.value} : undefined;
        }
        return field.showValue;
      case 'select_special_booking_person':
        return field.value ? [{fullName: field.showValue, userOID: field.value}] : undefined;
      case 'external_participant_name':
        return field.showValue ? JSON.parse(field.showValue) : undefined;
      case 'out_participant_name':
        return field.showValue ? JSON.parse(field.showValue) : undefined;
      case 'budget_detail':
        return field.showValue ? JSON.parse(field.showValue) : undefined;
      case 'writeoff_flag':
        return field.showValue === 'true';
      case 'exp_allocate':
        return field.showValue ? JSON.parse(field.showValue) : undefined;
      case 'start_date':
        return field.showValue ? moment(field.showValue) : undefined;
      case 'end_date':
        return field.showValue ? moment(field.showValue) : undefined;
      case 'venMaster':
        return field.value;
      case 'select_company':
        return field.value ? {label: field.showValue, key: field.value} : undefined;
      case 'applicant':
        return field.value ? {label: field.showValue, key: field.value} : undefined;
      case 'image':
        return field.value ? field.value : undefined;
      case 'attachment':
        return field.value ? field.value : undefined;
      case 'out_participant_num':
        return field.showValue;
      case 'effectiveNum':
        return field.showValue;
      case 'attachment':
        return field.showValue;
      case 'image':
        return field.showValue;
      default:
        return undefined
    }
  },
  isJson(str) {
    if (typeof str == 'string') {
      try {
        var obj = JSON.parse(str);
        if (typeof obj == 'object' && obj) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    } else {
      return false;
    }
  },
  byMkGetValue(customFormFields, mk, type = 'arry') {
    let values
    if (type === 'arry') {
      values = [];
    }
    Array.isArray(customFormFields) && customFormFields.map(item => {
      if (item.messageKey === mk) {
        if (type === 'arry') {
          values.push(item.value);
        } else {
          values = item.value;
        }
      }
    })
    return values;
  },
  getDefaultValue(field, fieldDefaultValue) {
    let user = app.getState().user.currentUser;
    let company = app.getState().user.company;
    switch (field.messageKey) {

      /********** 根据接口:/api/custom/form/user/default/values 拿到默认值 Begin ***********/
      case 'select_department':
        if (JSON.parse(field.fieldConstraint || '{}').selectMode && fieldDefaultValue.value) {
          return [{name: fieldDefaultValue.name, departmentOid: fieldDefaultValue.value}]
        }
        return undefined;
      case 'select_approver':
        if (fieldDefaultValue.value) {
          let values = [];
          fieldDefaultValue.value && fieldDefaultValue.value.split(':').map((value, index) => {
            values.push({fullName: fieldDefaultValue.name.split(',')[index], userOID: value})
          });
          return values;
        }
        return undefined;
      case 'remark':
        if (fieldDefaultValue.value) {
          return fieldDefaultValue.value;
        }
        return undefined;
      case 'title':
        if (fieldDefaultValue.value) {
          return fieldDefaultValue.value;
        }
        return undefined;
      case 'cust_list':
        if (fieldDefaultValue.value) {
          return {label: fieldDefaultValue.name, key: fieldDefaultValue.value};
        }
        return undefined;
      case 'switch':
        return false;
      case 'select_cost_center':
        if (fieldDefaultValue.value) {
          return [{name: fieldDefaultValue.name, costCenterItemOID: fieldDefaultValue.value}]
        }
        return undefined;
      case 'select_corporation_entity':
        if (JSON.parse(field.fieldConstraint || '{}').default && fieldDefaultValue.value) {
          return [{companyName: fieldDefaultValue.name, companyReceiptedOID: fieldDefaultValue.value}]
        }
        return undefined;
      case 'select_company':
        if (!JSON.parse(field.fieldConstraint || '{}').noDefault && fieldDefaultValue.value) {
          let showCode = JSON.parse(field.fieldConstraint || '{}').showCode;
          return {
            key: fieldDefaultValue.value,
            label: showCode ? `${fieldDefaultValue.name} - ${fieldDefaultValue.code}` : fieldDefaultValue.name
          }
        }
        return undefined;
      case 'employee_expand':
        if (fieldDefaultValue.code === 'time') {
          return moment(fieldDefaultValue.value)['_isValid'] ? moment(fieldDefaultValue.value).format('HH:mm:ss') : fieldDefaultValue.value;
        }
        if (fieldDefaultValue.code === 'date') {
          return moment(fieldDefaultValue.value)['_isValid'] ? moment(fieldDefaultValue.value).format('YYYY.MM.DD') : fieldDefaultValue.value;
        }
        if (fieldDefaultValue.code === 'cust_list') {
          return {label: fieldDefaultValue.showValue, key: fieldDefaultValue.value};
        }
        return fieldDefaultValue.value || undefined;
      case 'contact_bank_account':
        if (fieldDefaultValue.value) {
          return [{bankAccountNo: fieldDefaultValue.name, contactBankAccountOID: fieldDefaultValue.value}]
        }
        return undefined;
      /********** 根据接口:/api/custom/form/user/default/values 拿到默认值 End ***********/

      case 'applicant':
        return {label: `${user.fullName} - ${user.employeeID}`, key: user.userOID};
      case 'payee':
        return {label: `${user.employeeID} | ${user.fullName} | ${user.departmentName ? user.departmentName: messages('expense.invoice.type.unknown')/*"未知"*/} | ${user.title || messages('expense.invoice.type.unknown')/*"未知"*/}`, key: user.userOID};
      case 'select_participant':
        let initValue = (field.clearDefault) ? [] : [{userOID: user.userOID, fullName: user.fullName}];
        field.clearDefault = false;
        return initValue;
      case 'linkage_switch':
        return {enabled: false, fieldContent: field.fieldContent, callBackSubmit: false};
      case 'venMasterSwitch':
        return {enabled: false, fieldContent: field.fieldContent, callBackSubmit: false};
      case 'date':
        if (JSON.parse(field.fieldConstraint || '{}').defaultDate) {
          let remindDay = JSON.parse(field.fieldConstraint).defaultDate;
          return moment(new Date().getTime() + remindDay * 24 * 60 * 60 * 1000)
        }
        return undefined;
      case 'currency_code':
        return company.baseCurrency;
      case 'external_participant_name':
        return [];
      case 'out_participant_name':
        return [];
      default:
        return undefined
    }
  },
  formatFormValue(field, value) {
    if (field.messageKey === 'select_box') {
      let tempValue = [];
      try {
        (value || []).map(item => {
          tempValue.push({id: item.key, name: item.label});
        })
      } catch (e) {
        tempValue.push({id: value.key, name: value.label})
      }
      value = tempValue
    }
    if (field.messageKey === 'select_participant') {
      value.map(item => {
        item.participantOID = item.userOID
      })
    }
    if (field.messageKey === 'applicant' ||
      field.messageKey === 'select_company' ||
      field.messageKey === 'cust_list' ||
      field.messageKey === 'select_air_ticket_supplier' ||
      field.messageKey === 'payee') {
      if (typeof value === 'object' && value !== null && value.key) {
        value = value.key
      }
    }
    if (field.messageKey === 'employee_expand') {
      if (field.attachmentImages && field.attachmentImages.length) { //个人扩展字段为图片时
        let tempEmployeeExpandValue = [];
        field.attachmentImages.map(item => {
          tempEmployeeExpandValue.push(item.attachmentOID)
        });
        value = tempEmployeeExpandValue.join(',') //保存提交时和老中控统一为 attachmentOID,attachmentOID,... 的格式
      }
      try {
        if (field.fieldContent && (JSON.parse(field.fieldContent) || {}).messageKey === 'cust_list') {
          value = value ? value.key : null
        }
        else {
          if (JSON.parse(value).length) { //个人扩展字段为图片时，用于新建单据时
            value = JSON.parse(value).join(',')
          }
        }
      } catch (e) {}
    }
    if (field.messageKey === 'linkage_switch' || field.messageKey === 'venMasterSwitch') {
      field.fieldContent = value.fieldContent;
      value = JSON.stringify(value.enabled);
    }
    if (field.messageKey === 'select_approver') {
      value = value ? value.join(':') : null;//wjk change value=null 会报错
    }
    if (field.messageKey === 'start_date' && value instanceof moment) {//wjk add 18 04 16
      value = value ? value.utc().format() : "";
    }
    if (field.messageKey === 'end_date' && value instanceof moment) {//wjk add 18 04 16
      value = value ? value.utc().format()  : "";
    }
    if (field.messageKey === 'image' || field.messageKey === 'attachment') {
      value = value || field.showValue
    }
    if (field.messageKey === 'select_user') {
      value = (!value || typeof value === 'string') ? value : value.join(':')
    }
    if (Array.isArray(value) && value.length === 0) {
      value = null;
    }
    if (value === null ||
      typeof value === 'string' ||
      typeof value === 'boolean' ||
      field.messageKey === 'date' ||
      field.messageKey === 'common.date' ||
      field.messageKey === 'time' ||
      field.messageKey === 'dateTime' ||
      field.messageKey === 'start_date' ||
      field.messageKey === 'end_date' ||
      field.messageKey === 'total_budget' ||
      field.messageKey === 'average_budget') {
      field.value = value
    } else {
      field.value = JSON.stringify(value)
    }
    return field;
  },
  instructionsTag(customFormPropertyMap) {
    if (customFormPropertyMap && customFormPropertyMap['form.description'] && JSON.parse(customFormPropertyMap['form.description'])) {
      let instructions = JSON.parse(customFormPropertyMap['form.description']);
      if (instructions.enable) {
        let title = instructions[app.getState().languages.code].title;
        let content = instructions[app.getState().languages.code].content;
        return (
          <a style={{color:'#1890ff'}} onClick={() => {
            Modal.info({
              title: title,
              content: content,
            });
          }}>
            <Icon type="info-circle" style={{color: '#1890ff', marginRight: 8, position: 'relative'}}/>{title}
          </a>
        )
      }
    }
  },
  messageKeys: [
    'applicant',                      //申请人
    'writeoff_flag',                  //是否核销借款
    'total_budget',                   //借款金额
    'title',                          //事由
    'start_date',
    'remark',                         //备注
    'text_area',                      //多行输入框
    'select_participant',             //参与人员
    'end_date',
    'currency_code',                  //币种
    'budget_detail',                  //添加预算类型及金额
    'average_budget',
    'select_cost_center',             //成本中心
    'select_department',              //部门
    'destination',                    //地点
    'out_participant_num',            //外部参与人数
    'select_special_booking_person',  //订票专员
    'select_approver',                //审批人
    'select_air_ticket_supplier',     //供应商
    'select_corporation_entity',      //法人实体
    'linkage_switch',                 //联动开关
    'cust_list',                      //自定义列表
    'select_user',                    //选人
    'select_box',                     //选择框
    'attachment',                     //附件
    'time',                           //时间
    'contact_bank_account',           //银行卡号
    'date',                           //预计还款日期
    'out_participant_name',           //外部参与人员姓名（老单据），和external_participant_name（新单据）作用一样
    'number',                         //数字
    'substitution_invoice',           //替票，费用里的字段，申请单和报销单没有该messageKey
    'exp_allocate',                   //费用分摊
    'venMaster',                      //收款单位/个人
    'venMasterSwitch',                //组合控件，供应商支付控件
    'employee_expand',                //个人信息扩展字段
    'select_company',                 //公司
    'input',
    'LONG',
    'dateTime',                       //日期时间
    'common.date',                    //日期
    'Destination',
    'switch',                         //普通开关
    'payee',                          //收款方
    'image',                          //图片
    'external_participant_name',      //外部乘机人
    'effectiveNum',                   //有效人数
  ],
}
