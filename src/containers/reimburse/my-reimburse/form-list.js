import React from 'react';
import {connect} from 'react-redux';
import {
  Form,
  Input,
  Select,
  Affix,
  Button,
  message,
  Col,
  DatePicker,
  TimePicker,
  InputNumber,
  Tag,
  Spin,
} from 'antd';
import config from 'config';
import Upload from 'widget/upload';

import 'styles/reimburse/reimburse.scss';

import reimburseService from 'containers/reimburse/my-reimburse/reimburse.service';

const FormItem = Form.Item;
const Option = Select.Option;
const CheckableTag = Tag.CheckableTag;
const {TextArea} = Input;

import Chooser from 'containers/reimburse/my-reimburse/chooser';
import moment from 'moment';


class FormList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      customFormFields: [],
      formSetings: {},
      receiverExtraParams: {},
      contractSelectedData: [{}],
      companySelectedData: [],
      deparmentSelectedData: [],
      costList: [],
      costData: {},
      approverList: [],
      currencyCodeList: [],
      contarctList: [],
      currencyCode: '',
      currencyName: '',
      companyId: '',
      value: '',
      receivables: [],
      accountList: [],
      bankLocationCode: '',
      bankLocationName: '',
      isNew: true,
      model: {},
      flag: true,
      companyList: [],
      departmentList: [],
      show: false,
      fetching: false,
      payeeId: {key: '', label: ''},
      formItemLayout: {
        labelCol: {
          span: 6,
        },
        wrapperCol: {
          span: 8,
          offset: 1,
        },
      },
    };
  }

  componentDidMount() {
    this.listInit();
  }

  componentWillReceiveProps(nextProps) {
    if (
      JSON.stringify(nextProps.formSetings) != '{}' &&
      JSON.stringify(this.props.formSetings) == '{}'
    ) {
      // this.getReceivables("");
      if (!nextProps.isNew) {
        let sign = nextProps.formSetings.payeeId
          ? `${nextProps.formSetings.payeeId}_${
            nextProps.formSetings.payeeCategory == 'EMPLOYEE' ? 'true' : 'false'
            }`
          : '';
        this.setState(
          {
            show: true,
            formSetings: nextProps.formSetings,
            payeeId: {key: sign, label: nextProps.formSetings.defaultPaymentInfo.partnerName},
            currencyCode: nextProps.formSetings.currencyCode,
            currencyName: nextProps.formSetings.currencyName,
          },
          () => {
            this.getReceivables('', sign);
          }
        );
      } else {
        this.setState({show: true, formSetings: nextProps.formSetings, currencyCode: this.props.company.baseCurrency});
      }
    }
  }

  //加载公司和部门的默认值设置
  listInit = () => {
    const {user, company} = this.props;
    this.getCurrencyList();
    this.setState({
      companySelectedData: [
        {
          companyOID: company.companyOID,
          name: company.name,
          id: company.id,
        },
      ],
      deparmentSelectedData: [
        {
          departmentOid: user.departmentOID,
          departmentName: user.departmentName,
        },
      ],
      applyer: [
        {
          userOID: user.userOID,
          fullName: user.fullName,
        },
      ],
      currentApplyerOID: user.userOID,
      currnetApplyerId: user.id,
      setOfBooksId: company.setOfBooksId,
      baseCurrency: company.baseCurrency,
      companyId: user.companyId,
    });
  };

  //公司改变
  companyChange = value => {
    this.setState({companyId: value.id});
    this.props.form.setFieldsValue({contarct: []});
  };

  //搜索
  receivablesSerarch = value => {
    if (!value) {
      this.setState({receivables: []});
      return;
    }

    let type = 1003;

    if (this.state.formSetings.payeeCategory == 'EMPLOYEE') {
      type = 1001;
    } else if (this.state.formSetings.payeeCategory == 'VENDER') {
      type = 1002;
    }

    this.setState({fetching: true});

    reimburseService.getReceivables(value, type).then(res => {
      this.setState({receivables: res.data, value, accountList: [], fetching: false});
    });
  };

  //根据表单设置加载对应的控件
  getReimburseItem = () => {
    let forms = [];
    const {contractSelectedData, formItemLayout} = this.state;
    const {getFieldDecorator} = this.props.form;
    const {formSetings, isNew} = this.props;

    //未选择多收款方时 multipleReceivables
    if (formSetings.multipleReceivables === false) {
      forms.push(
        <div key="receivables">
          <FormItem {...formItemLayout} label="收款方">
            {getFieldDecorator('payeeId', {
              initialValue: this.state.payeeId,
              rules: [{message: '请输入', required: true}],
            })(
              <Select
                showSearch
                onSearch={this.receivablesSerarch}
                onChange={this.onSelect}
                filterOption={false}
                labelInValue
                allowClear
                defaultActiveFirstOption={false}
                notFoundContent={this.state.fetching ? <Spin size="small"/> : null}
              >
                {this.state.receivables.map(o => {
                  return <Option key={o.sign}>{o.name}</Option>;
                })}
              </Select>
            )}
          </FormItem>

          <FormItem {...formItemLayout} key="accountNumber" label="收款方银行账号">
            {getFieldDecorator('accountNumber', {
              initialValue: '',
              rules: [{message: '请输入', required: true}],
            })(
              <Select onChange={this.accountNumberChange}>
                {this.state.accountList.map(o => {
                  return (
                    <Select.Option key={o.number} value={o.number}>
                      {o.number}
                    </Select.Option>
                  );
                })}
              </Select>
            )}
          </FormItem>

          <FormItem {...formItemLayout} key="accountName" label="收款方户名">
            {getFieldDecorator('accountName', {
              initialValue: '',
              rules: [{message: '请输入', required: true}],
            })(<Input disabled/>)}
          </FormItem>
        </div>
      );
    }
    //合同处理
    // relatedContract 是否关联合同
    // contractPosition 合同布局位置
    //若关联合同 且 关联的位置在合同头 DOCUMENTS_HEAD DOCUMENTS_LINE
    if (
      this.props.isNew &&
      formSetings.relatedContract &&
      formSetings.contractPosition === 'DOCUMENTS_HEAD'
    ) {
      forms.push(
        <FormItem {...formItemLayout} label="关联合同" key="contarct">
          {getFieldDecorator('contarct', {
            rules: [{required: true, message: '请关联合同'}],
            initialValue: [],
          })(
            <Chooser
              placeholder={this.$t({id: 'common.please.select'})}
              type="select_contract"
              labelKey="contractName"
              valueKey="contractHeaderId"
              single={true}
              disabled={
                !this.state.companyId ||
                !this.state.currencyCode ||
                (!formSetings.multipleReceivables && !this.state.payeeId.key)
              }
              listExtraParams={{
                documentType: 'PREPAYMENT_REQUISITION',
                companyId: this.state.companyId,
                currency: this.state.currencyCode,
                partnerId: this.state.payeeId.key ? this.state.payeeId.key.split('_')[0] : '',
              }}
            />
          )}
        </FormItem>
      );
    }

    if (!this.props.isNew && formSetings.relatedContract) {
      forms.push(
        <FormItem {...formItemLayout} label="关联合同" key="contarct">
          {getFieldDecorator('contarct', {
            rules: [{required: true, message: '请关联合同'}],
            initialValue: [
              {
                contractHeaderId: formSetings.contractHeaderId,
                contractName: formSetings.contractHeaderLineDTO.contractName,
              },
            ],
          })(
            <Chooser
              placeholder={this.$t({id: 'common.please.select'})}
              type="select_contract"
              labelKey="contractName"
              valueKey="contractHeaderId"
              single={true}
              disabled={
                !this.state.companyId ||
                !this.state.currencyCode ||
                (!formSetings.multipleReceivables && !this.state.payeeId.key)
              }
              listExtraParams={{
                documentType: 'PREPAYMENT_REQUISITION',
                companyId: this.state.companyId,
                currency: this.state.currencyCode,
                partnerId: this.state.payeeId.key ? this.state.payeeId.key.split('_')[0] : '',
              }}
            />
          )}
        </FormItem>
      );
    }

    return forms;
  };

  formDesign = () => {
    const {getFieldDecorator} = this.props.form;
    const {user, customFormFields, isNew, formSetings} = this.props;
    const {
      showCompanySelector,
      companySelectedData,
      showDepartmentSelector,
      deparmentSelectedData,
      applyer,
      formItemLayout,
      costCenterSelectedData,
    } = this.state;
    const form = [];
    for (let i of customFormFields) {
      switch (i.messageKey) {
        case 'select_company':
          form.push(
            <FormItem {...formItemLayout} label={i.fieldName} key={i.fieldOID}>
              {getFieldDecorator(i.fieldOID, {
                rules: [{required: i.required, message: i.promptInfo}],
                initialValue: isNew
                  ? [
                    {
                      companyOID: this.props.user.companyOID,
                      name: this.props.user.companyName,
                      id: this.state.companyId,
                    },
                  ]
                  : [
                    {
                      companyOID: formSetings.companyOid,
                      name: formSetings.companyName,
                      id: formSetings.companyId,
                    },
                  ],
              })(
                <Chooser
                  placeholder={this.$t({id: 'common.please.select'})}
                  type="select_company_reimburse"
                  labelKey="name"
                  valueKey="companyOID"
                  onlyNeed="companyOID"
                  handleOk={this.companyChange}
                  listExtraParams={{
                    tenantId: this.props.user.tenantId,
                    setOfBooksId: this.props.company.setOfBooksId,
                  }}
                  disabled={!isNew}
                  single={true}
                />
              )}
            </FormItem>
          );
          break;
        case 'select_department':
          form.push(
            <FormItem {...formItemLayout} label={i.fieldName} key={i.fieldOID}>
              {getFieldDecorator(i.fieldOID, {
                rules: [{required: i.required, message: i.promptInfo}],
                initialValue: isNew
                  ? [{departmentOid: user.departmentOID, path: user.departmentName}]
                  : [{departmentOid: i.value, path: i.showValue}],
              })(
                <Chooser
                  placeholder={this.$t({id: 'common.please.select'})}
                  type="department_document"
                  labelKey="path"
                  valueKey="departmentOid"
                  single={true}
                  onlyNeed="departmentOid"
                />
              )}
            </FormItem>
          );
          break;
        // case "title":
        // case "text_area":
        case 'select_cost_center':
          form.push(
            <FormItem {...formItemLayout} label={i.fieldName} key={i.fieldOID}>
              {getFieldDecorator(i.fieldOID, {
                rules: [{required: i.required, message: i.promptInfo}],
                initialValue: {key: i.value, label: i.showValue} || '',
              })(
                <Select
                  labelInValue
                  placeholder={i.promptInfo ? i.promptInfo : '请选择'}
                  disabled={i.readonly}
                  onDropdownVisibleChange={() => this.handleFocus(i, 'costCenterOID', i.fieldOID)}
                >
                  {this.state.costData[i.fieldOID] &&
                  this.state.costData[i.fieldOID].map(o => {
                    return (
                      <Option key={o.costCenterItemOID} value={o.costCenterItemOID}>
                        {o.name}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          );
          break;
        case 'destination':
          form.push(
            <FormItem {...formItemLayout} label={i.fieldName} key={i.fieldOID}>
              {getFieldDecorator(i.fieldOID, {
                rules: [{required: i.required, message: i.promptInfo}],
                initialValue: i.value || '',
              })(<Input placeholder={i.promptInfo ? i.promptInfo : '请输入'}/>)}
            </FormItem>
          );
          break;
        case 'select_box':
          var options = JSON.parse(i.fieldContent);
          var multiple = JSON.stringify(JSON.parse(i.fieldConstraint.replace(/\\/g,"")));
          form.push(
            <FormItem {...formItemLayout} label={i.fieldName} key={i.fieldOID}>
              {getFieldDecorator(i.fieldOID, {
                rules: [{required: i.required, message: i.promptInfo}],
                initialValue: i.value || '',
              })(
                <Select
                  mode={multiple.type === '1' ? 'multiple' : ''}
                  placeholder={i.promptInfo ? i.promptInfo : '请选择'}
                >
                  {options.map(value => {
                    return (
                      <Option key={value.id} value={value.id}>
                        {value.name}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          );
          break;
        case 'dateTime':
          form.push(
            <FormItem {...formItemLayout} label={i.fieldName} key={i.fieldOID}>
              {getFieldDecorator(i.fieldOID, {
                rules: [{required: i.required, message: i.promptInfo}],
                initialValue: moment(i.value) || moment(),
              })(<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" placeholder="选择日期和时间"/>)}
            </FormItem>
          );
          break;
        case 'currency_code':
          //获取当前用户可选择的货币的列表 只有一个 设置为disabled
          //若有多个 加载select 并默认设置为当前用户的币种
          var {currencyCodeList} = this.state;
          form.push(
            <FormItem {...formItemLayout} label={i.fieldName} key={i.fieldOID}>
              {getFieldDecorator(i.fieldOID, {
                rules: [{required: i.required, message: i.promptInfo}],
                initialValue: i.value || "CNY",
              })(
                <Select
                  disabled={!isNew}
                  onDropdownVisibleChange={this.getCurrencyList}
                  onChange={this.handleCurrencyChange}
                >
                  {currencyCodeList.map(value => {
                    return (
                      <Option key={value.currency} value={value.currency}>
                        {value.currency} - {value.currencyName}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          );
          break;
        case 'cust_list':
          form.push(
            <FormItem {...formItemLayout} label={i.fieldName} key={i.fieldOID}>
              {getFieldDecorator(i.fieldOID, {
                rules: [{required: i.required, message: i.promptInfo}],
                initialValue: i.value || '',
              })(<Input placeholder={i.promptInfo ? i.promptInfo : '请输入'}/>)}
            </FormItem>
          );
          break;
        case 'contact_bank_account':
          form.push(
            <FormItem {...formItemLayout} label={i.fieldName} key={i.fieldOID}>
              {getFieldDecorator(i.fieldOID, {
                rules: [{required: i.required, message: i.promptInfo}],
                initialValue: i.value || '',
              })(<Input placeholder={i.promptInfo ? i.promptInfo : '请输入'}/>)}
            </FormItem>
          );
          break;
        case 'select_approver':
          form.push(
            <FormItem {...formItemLayout} label={i.fieldName} key={i.fieldOID}>
              {getFieldDecorator(i.fieldOID, {
                rules: [{required: i.required, message: i.promptInfo}],
                initialValue: i.value || '',
              })(
                <Select onDropdownVisibleChange={this.selectApprover}>
                  {this.state.approverList.map(o => {
                    return (
                      <Option key={o.userId} value={o.userId}>
                        {o.userName}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          );
          break;
        case 'attachment':
          form.push(
            <FormItem {...formItemLayout} label={i.fieldName} key={i.fieldOID}>
              {getFieldDecorator(i.fieldOID, {
                rules: [{required: i.required, message: i.promptInfo}],
              })(
                <Upload
                  attachmentType="PREPAYMENT"
                  uploadUrl={`${config.prePaymentUrl}/api/attachment/upload/batch`}
                  fileNum={9}
                  uploadHandle={this.handleUpload}
                  defaultFileList={[]}
                  defaultOIDs={[]}
                />
              )}
            </FormItem>
          );
          break;
        case 'remark':
          form.push(
            <FormItem {...formItemLayout} label={i.fieldName} key={i.fieldOID}>
              {getFieldDecorator(i.fieldOID, {
                rules: [{required: i.required, message: i.promptInfo}],
                initialValue: i.value || '',
              })(
                <TextArea
                  disabled={i.readonly}
                  placeholder={i.promptInfo ? i.promptInfo : '请输入'}
                  rows="4"
                />
              )}
            </FormItem>
          );
          break;
      }
    }
    return form;
  };

  //获取收款方
  getReceivables = (value, payeeId) => {
    let type = 1003;

    if (this.state.formSetings.payeeCategory == 'EMPLOYEE') {
      type = 1001;
    } else if (this.state.formSetings.payeeCategory == 'VENDER') {
      type = 1002;
    }

    if (!value) {
      value = this.state.payeeId.label;
    }

    if (this.state.payeeId.key) {
      this.setState(
        {receivables: [{sign: this.state.payeeId.key, name: this.state.payeeId.label}]},
        () => {
          reimburseService.getReceivables(value, type).then(res => {
            this.setState({receivables: [], value, fetching: false}, () => {
              if (payeeId) {
                this.onSelect(payeeId);
              }
            });
          });
        }
      );
    } else {
      this.setState({fetching: true});
      reimburseService.getReceivables(value, type).then(res => {
        this.setState({receivables: [], value, fetching: false}, () => {
          if (payeeId) {
            this.onSelect(payeeId);
          }
        });
      });
    }
  };

  onSelect = value => {
    if (!value) {
      this.props.form.setFieldsValue({accountNumber: ''});
      this.props.form.setFieldsValue({accountName: ''});
      if (this.state.formSetings.relatedContract) {
        this.props.form.setFieldsValue({contarct: []});
      }
      this.setState({value: '', accountList: [], payeeId: {}});
      return;
    }

    let sign = '';

    if (value.key) {
      sign = value.key;
    } else {
      sign = value;
    }

    let data = this.state.receivables.find(o => o.sign == sign);

    if (data) {
      this.props.form.setFieldsValue({accountNumber: ''});
      this.props.form.setFieldsValue({accountName: ''});
      if (this.state.formSetings.relatedContract) {
        this.props.form.setFieldsValue({contarct: []});
      }
      data.bankInfos &&
      data.bankInfos.map(o => {
        if (o.primary) {
          this.props.form.setFieldsValue({accountNumber: o.number});
          this.props.form.setFieldsValue({accountName: o.bankNumberName});
          this.setState({bankLocationName: o.bankName, bankLocationCode: o.bankCode});
        }
      });

      this.setState({
        value: data.name,
        accountList: data.bankInfos,
        payeeId: value.key ? value : this.state.payeeId,
      });
    }
  };

  getCurrencyList = () => {
    !this.state.currencyCodeList.length && reimburseService.getCurrencyCode().then(res => {
      let currencyName = '';
      res.data.map(item => {
        if (item.currency === this.state.currencyCode) {
          currencyName = item.currencyName;
        }
      })
      this.setState({currencyCodeList: res.data, currencyName});
    })
      .catch(err => {
        message.error('获取币种失败！');
      });
  };

  handleCurrencyChange = value => {
    this.setState({currencyCode: value});
    this.props.form.setFieldsValue({contarct: []});
  };

  handleUpload = () => {
  };

  getContractList = () => {
  };

  selectApprover = () => {
    reimburseService.getApproverList().then(res => {
      this.setState({approverList: res.data});
    });
  };

  handleFocus = (value, key, fieldOID) => {
    let costData = this.state.costData;

    if (costData[fieldOID] && costData[fieldOID].length) return;
    if (value.dataSource) {
      let dataSource = JSON.parse(value.dataSource);
      reimburseService.getCostList(dataSource[key]).then(res => {
        costData[fieldOID] = res.data;
        this.setState({costData}, () => {
          if (value.value) {
            this.props.form.setFieldsValue({[fieldOID]: value.value});
          }
        });
      });
    }
  };

  render() {
    const reimburseItems = this.getReimburseItem();
    const formItem = this.formDesign();
    return (
      <div>
        {this.state.show && formItem}
        {this.state.show && reimburseItems}
      </div>
    );
  }
}

// FormList.contextTypes = {
//   router: React.PropTypes.object,
// };
function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company,
  };
}

//FormList = Form.create()(FormList);

export default Form.create()(FormList);

//export default connect(mapStateToProps, null, null, { withRef: true })(injectIntl(FormList));
