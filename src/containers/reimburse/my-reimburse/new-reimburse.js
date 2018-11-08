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
import httpFetch from 'share/httpFetch';
import '../../../styles/reimburse/new-reimburse.scss';
// import menuRoute from 'routes/menuRoute';

import ListSelector from 'widget/list-selector';

import reimburseService from 'containers/reimburse/my-reimburse/reimburse.service';


import FormList from './form-list';

const FormItem = Form.Item;
const Option = Select.Option;
const CheckableTag = Tag.CheckableTag;
const {TextArea} = Input;
import {routerRedux} from 'dva/router';


class NewReimburse extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      headerData: {},
      showCompanySelector: false,
      showDepartmentSelector: false,
      showReceiverSelector: false,
      // showCostCenterSelector:false,
      companySelectedData: [],
      deparmentSelectedData: [],
      // costCenterSelectedData:[{
      //   costCenterItemOID:'',
      //   name:'请选择'
      // }],
      principals: true,
      applyer: [],
      currentApplyerOID: '',
      currnetApplyerId: '',
      setOfBooksId: '',
      customFormFields: [],
      formItemLayout: {
        labelCol: {
          span: 6,
        },
        wrapperCol: {
          span: 8,
          offset: 1,
        },
      },
      // costCenterSelectorItem:{},
      // currencyCodeList:[],
      formSetings: {},
      contractSelectedData: [{}],
      receiverSelectedData: [{}],
      receiverExtraParams: {},
      // MyReimburePage: menuRoute.getRouteItem('my-reimburse', 'key'),
      // ReimburseDetail: menuRoute.getRouteItem('reimburse-detail', 'key'),
      formItemLayoutWithOutLabel: {
        wrapperCol: {
          span: 14,
          offset: 6,
        },
      },
      bankData: [{}],
      loading: false,
      isNew: false,
      saveLoading: false,
    };
  }

  //默认字段 公司 部门 事由
  componentDidMount() {
    if (this.props.match.params.id) {
      reimburseService.getReimburseDetailById(this.props.match.params.id).then(res => {
        this.setState({
          headerData: res.data,
          formSetings: res.data,
          isNew: false,
          customFormFields: res.data.customFormValues,
        });
      });
    } else {
      this.setState({isNew: true});
      this.getCustomFormFields();
      this.listInit();
    }

    //加载币种列表
    this.getCurrencyCodeList();
  }

  //加载公司和部门的默认值设置
  listInit = () => {
    const {user, company} = this.props;
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
          id: user.id,
          userOID: user.userOID,
          fullName: user.fullName,
        },
      ],
      currentApplyerOID: user.userOID,
      currnetApplyerId: user.id,
      setOfBooksId: company.setOfBooksId,
      baseCurrency: company.baseCurrency,
    });
    // //获得供应商的列表
    // httpFetch.post(`${config.vendorUrl}/vendor/api/ven/info`, {}).then(res => {  //获取供应商列表
    //   res.status === 200 && this.setState({ venderOptions: res.data.body.body.venInfoBeans })
    // }).catch(err => {
    //   message.error("网络错误，请稍后重试!");
    // });
  };

  //控制弹出框的隐藏
  handleListCancel = () => {
    this.setState({
      showCompanySelector: false,
      showDepartmentSelector: false,
      // showCostCenterSelector:false,
      showReceiverSelector: false,
    });
  };
  //公司确认按钮
  handleCompanyListOk = result => {
    this.setState({
      showCompanySelector: false,
      companySelectedData: [
        {
          companyOID: result.result[0].companyOID,
          name: result.result[0].name,
          id: result.result[0].id,
        },
      ],
    });
  };
  //部门确认按钮
  handleDepartmentListOk = result => {
    this.setState({
      showDepartmentSelector: false,
      deparmentSelectedData: [
        {
          departmentOid: result.result[0].departmentOid,
          departmentName: result.result[0].name,
        },
      ],
    });
  };
  //成本中心确认按钮
  // handleCostCenterListOk = (result) => {
  //   this.setState({
  //     costCenterSelectedData:[{
  //       costCenterItemOID:result.result[0].costCenterItemOID,
  //       name:result.result[0].name
  //     }],
  //     showCostCenterSelector:false
  //   });
  //   this.props.form.setFieldsValue({
  //     select_cost_center: result.result[0].costCenterItemOID,
  //   });
  //   console.log(result);
  // }
  handleReceiverListOk = result => {
    //将反回的结果保存下来
    this.setState({
      showReceiverSelector: false,
      receiverSelectedData: result.result,
      bankData: result.result[0].bankInfos,
    });
    this.props.form.resetFields(['bank', 'bankName']);
  };
  handleFocus = category => {
    this.refs.chooserBlur.focus(); //取消焦点
    switch (category) {
      case 'company':
        this.setState({showCompanySelector: true});
        break;
      case 'department':
        this.setState({showDepartmentSelector: true});
        break;
      // case 'costCenter':
      //   this.setState({showCostCenterSelector:true});
      case 'receiver':
        this.setState({showReceiverSelector: true});
        break;
    }
  };

  //判断当前用户是否有代理的关系
  getPrincipals() {
    httpFetch
      .get(`${config.baseUrl}/api/bill/proxy/principals`)
      .then(res => {
        //存在代理人
        if (res.data.length > 0) {
          let data = this.state.applyer;
          for (var i of res.data) {
            data.push({
              userOID: i.principalOID,
              fullName: i.userName,
            });
          }
          this.setState({principals: false, applyer: data});
        }
      })
      .catch(err => {
        message.error('网络错误！请稍后重试');
      });
  }

  //申请人选择事件的处理
  handleApplyerChange = value => {
    //根据查询到的用户信息 重置用户的部门和公司
    reimburseService
      .getSetOfBooks(value)
      .then(res => {
        //设置新的账套
        this.setState({setOfBooksId: res.data.id});
      })
      .catch(err => {
        message.error(`网络错误，请稍后再重试！`);
      });

    reimburseService
      .getUserInfo(value)
      .then(res => {
        this.setState({
          companySelectedData: [
            {
              companyOID: res.data.companyOID,
              name: res.data.companyName,
            },
          ],
          deparmentSelectedData: [
            {
              departmentOid: res.data.departmentOID,
              departmentName: res.data.departmentName,
            },
          ],
          currentApplyerOID: value,
          currnetApplyerId: res.data.id,
        });
      })
      .catch(err => {
        message.error(`网络错误，请稍后再重试！`);
      });
  };
  //获得最大值
  // getMax=(maxLength)=>{
  //   let max=1;
  //   for(var i=1;i<=maxLength;i++)
  //     max*=10;
  //   return --max;
  // }
  //获得精度
  // getDecima=(decimalLength)=>{
  //   let decimail=1;
  //   for(var i=1;i<=decimalLength;i++)
  //     decimail/=10;
  //   return decimail;
  // }
  //得到币种列表
  getCurrencyCodeList = () => {
    reimburseService
      .getCurrencyCode()
      .then(res => {
        this.setState({
          currencyCodeList: res.data,
        });
      })
      .catch(err => {
        message.error(`网络错误，请稍后再重试！`);
      });
  };
  //币种选择
  // handleCurrencyChange=(value)=>{
  //   this.setState({
  //     baseCurrency:value
  //   });
  // }
  //还款禁止时间
  // disabledDate(current) {
  //   // can not select days before today and today
  //   return current && current.valueOf() < Date.now();
  // }
  //获得自定义列表
  getCustomList = customEnumerationOID => {
    reimburseService
      .getCustomEnumeration(customEnumerationOID)
      .then(res => {
      })
      .catch(err => {
        message.error('网络错误！请稍后重试');
      });
  };

  //获得控件的设置及表单设置
  getCustomFormFields() {
    this.setState({loading: true});
    reimburseService
      .getFormSet(this.props.match.params.formOID)
      .then(res => {
        this.setState({
          customFormFields: res.data.customFormFields,
          formSetings: res.data,
          loading: false,
        });
        // //EMPLOYEE_VENDER EMPLOYEE VENDER
        if (res.data.payeeType === 'EMPLOYEE') {
          this.setState({
            receiverExtraParams: {empFlag: 1001},
          });
        } else if (res.data.payeeType === 'VENDER') {
          this.setState({
            receiverExtraParams: {empFlag: 1002},
          });
        } else {
          this.setState({
            receiverExtraParams: {empFlag: 1003},
          });
        }
      })
      .catch(err => {
        message.error('网络错误，请稍后重试');
      });
  }

  handleBankChange = value => {
    this.props.form.resetFields(['bankName']);
    let bankName = '';
    for (let i of this.state.bankData) {
      if (value === i.number) {
        bankName = i.bankName;
        break;
      }
    }
    this.props.form.setFieldsValue({
      bankName: bankName,
    });
  };

  //新建保存
  handleSubmit = e => {
    e.preventDefault();

    this.refs.formList.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let customFormFields = [...[], ...this.state.customFormFields];

        customFormFields.map(o => {
          if (o.messageKey == 'select_cost_center') {
            o.value = values[o.fieldOID].key;
            o.showValue = '';
          } else {
            o.value = values[o.fieldOID];
            o.showValue = '';
          }
        });

        let data = {
          formOid: this.props.match.params.formOID,
          formId: this.props.match.params.formId,
          applicationId: this.props.user.id,
          type: '801001',
          customFormValues: customFormFields,
          contractHeaderId:
            values.contarct && values.contarct.length ? values.contarct[0].contractHeaderId : '',
        };

        if (!this.state.formSetings.multipleReceivables) {
          data.payeeId = values.payeeId.key.split('_')[0];
          data.payeeCategory = values.payeeId.key.split('_')[1] == 'true' ? 'EMPLOYEE' : 'VENDER';
          data.accountNumber = values.accountNumber;
          data.accountName = values.accountName;
          data.bankLocationCode = '1';
          data.bankLocationName = '1';
        }

        if (!this.state.isNew) {
          data.id = this.state.formSetings.id;
          data.formId = this.state.formSetings.formId;
          data.formOid = this.state.formSetings.formOid;
        }

        this.setState({saveLoading: true});

        reimburseService
          .newReimburse(data)
          .then(res => {
            if (200 === res.status) {
              this.setState({saveLoading: false});
              message.success('操作成功');
              this.props.dispatch(
                routerRedux.push({
                  pathname: `/my-reimburse/reimburse-detail/${res.data.id}`,
                })
              );
            } else {
              message.error('操作失败');
              this.setState({saveLoading: false});
            }
          })
          .catch(err => {
            message.error('操作失败：' + err.response.data.message);
            this.setState({saveLoading: false});
          });
      }
    });
  };
  //返回按钮
  handleReturn = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/my-reimburse`,
      })
    );
  };

  render() {
    const {getFieldDecorator} = this.props.form;
    const {user} = this.props;
    const {
      showCompanySelector,
      companySelectedData,
      showDepartmentSelector,
      costCenterSelectedData,
      deparmentSelectedData,
      applyer,
      formItemLayout,
      costCenterSelectorItem,
      showCostCenterSelector,
    } = this.state;

    return (
      <div className="new-contract " style={{marginBottom: '70px'}}>
        <Spin spinning={false}>
          <Form onSubmit={this.handleSubmit}>
            <FormItem {...formItemLayout} label="申请人">
              {getFieldDecorator('applicationId', {
                rules: [{required: true, message: '请选择申请人'}],
                initialValue: {key: user.id, label: user.fullName},
              })(
                <Select disabled labelInValue placeholder="请选择">
                  {applyer.map(value => {
                    return (
                      <Option key={value.id} value={value.id}>
                        {value.fullName}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
            <Spin spinning={this.state.loading}>
              <FormList
                isNew={this.state.isNew}
                formSetings={this.state.formSetings}
                customFormFields={this.state.customFormFields}
                user={this.props.user}
                company={this.props.company}
                routeParams={this.props.match.params}
                ref="formList"
              />
            </Spin>
            <input ref="chooserBlur" style={{position: 'absolute', top: '-100vh', zIndex: -1}}/>
            <Affix offsetBottom={0} style={{
              position: 'fixed', bottom: 0, marginLeft: '-35px', width: '100%', height: '50px',
              boxShadow: '0px -5px 5px rgba(0, 0, 0, 0.067)', background: '#fff', lineHeight: '50px'
            }}>
              <Button
                style={{marginLeft: 20, marginRight: 20}}
                disabled={this.state.loading}
                loading={this.state.saveLoading}
                type="primary"
                onClick={this.handleSubmit}
              >
                下一步
              </Button>
              <Button onClick={this.handleReturn}>取消</Button>
            </Affix>
          </Form>
        </Spin>

        <ListSelector
          visible={showCompanySelector}
          type="reimburse_company"
          onCancel={this.handleListCancel}
          onOk={this.handleCompanyListOk}
          selectedData={companySelectedData}
          extraParams={{setOfBooksId: this.state.setOfBooksId}}
          single={true}
        />
        <ListSelector
          visible={showDepartmentSelector}
          type="reimburse_department"
          onCancel={this.handleListCancel}
          onOk={this.handleDepartmentListOk}
          selectedData={deparmentSelectedData}
          single={true}
        />
        <ListSelector
          visible={this.state.showReceiverSelector}
          type="select_supplier_employee"
          onCancel={this.handleListCancel}
          onOk={this.handleReceiverListOk}
          extraParams={this.state.receiverExtraParams}
          single={true}
        />
        {/* <ListSelector visible={showCostCenterSelector}
                      type='reimburse_cost_center_item'
                      selectorItem={costCenterSelectorItem}
                      onCancel={this.handleListCancel}
                      onOk={this.handleCostCenterListOk}
                      selectedData={costCenterSelectedData}
                      single={true}/> */}


      </div>
    );
  }
}

// NewReimburse.contextTypes = {
//   router: React.PropTypes.object,
// };

NewReimburse = Form.create()(NewReimburse);

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  {withRef: true}
)(NewReimburse);
