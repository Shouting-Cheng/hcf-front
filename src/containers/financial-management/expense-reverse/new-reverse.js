/**
 * Created by Allen on 2018/5/7.
 */
import React from 'react'
import { connect } from 'dva';
import { routerRedux } from "dva/router";
import { Form, Card, Input, Row, Col, Affix, Button, DatePicker, Select, InputNumber, message, Spin } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
import Chooser from "components/Widget/chooser";
import reverseService from 'containers/financial-management/expense-reverse/expense-reverse.service'



class NewReverse extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      pageLoading: false,
      setOfBooksId: null,
      showCompanySelector: false,
      showDepartmentSelector: false,
      employeeOptions: [], //员工选项
      employeeIdOptions: [],//申请人
      currencyLoading:false,
      selectorItem: {},
      extraParams: null,
      companySelectedData: [],
      deparmentSelectedData: [],
      currencyOptions: [], //币种
      // reverseHeader: {},
      // documentHeader: {},
      // expenseReverse: menuRoute.getRouteItem('expense-reverse','key'),  //费用反冲页
      // expenseReverseDetail: menuRoute.getRouteItem('expense-reverse-detail','key') //费用反冲单详情页
    }
  }

  componentWillMount() {
    // if (window.location.href.indexOf("href") < 0) {
    if (this.props.match.params.isNew === false) {
      this.getReverseDetail()
    }
  }

  componentDidMount() {
    const { user } = this.props;
    const { reverseHeader, documentHeader } = this.state;
    if (this.props.match.params.isNew) {
      this.setState({
        deparmentSelectedData: [{
          oid: user.departmentOID,
          name: user.departmentName
        }],
        companySelectedData: [{
          companyOID: this.props.user.companyOID,
          name: this.props.user.companyName,
          id: this.props.user.companyId
        }]
      })
    } else {
      if (reverseHeader) {
        this.setState({

        })
      }
    }
    this.setState({ currencyLoading: true });
  !this.state.currencyOptions.length && this.service.getCurrencyList().then((res) => {
    let currencyOptions = res.data;
    this.setState({ currencyOptions, currencyLoading: false })
  })
  }
//获取币种
getCurrencyOptions = () => {
  this.setState({ currencyLoading: true });
  !this.state.currencyOptions.length && this.service.getCurrencyList().then((res) => {
    let currencyOptions = res.data;
    this.setState({ currencyOptions, currencyLoading: false })
  })
};

  filterInputMoney = (money, fixed = 2) => {
    if (typeof fixed !== "number") fixed = 2;
    money = Number(money || 0).toFixed(fixed).toString();
    let numberString = '';
    if (money.indexOf('.') > -1) {
      let integer = money.split('.')[0];
      let decimals = money.split('.')[1];
      numberString = integer.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + '.' + decimals;
    } else {
      numberString = money.replace(/(\d)(?=(\d{3})+(?!\d))\./g, '$1,');
    }
    numberString += (numberString.indexOf('.') > -1 ? '' : '.00');
    return numberString;
  };

  //获取详细信息
  getReverseDetail(){
    console.log(reverseHeader);
    const { id, businessClass } = this.props.match.params;
    this.setState({ pageLoading: true });
    reverseService.getExpenseDetail(this.props.match.params.id).then(resp => {
      if (resp.status === 200){
        this.setState({
          reverseHeader: resp.data.reverseHeader,
          documentHeader: resp.data.documentHeader,
          pageLoading: false,
          deparmentSelectedData: [{
            oid: resp.data.reverseHeader.departmentOid,
            name: resp.data.reverseHeader.departmentName
          }],
          companySelectedData: [{
            name: resp.data.reverseHeader.companyName,
            id: resp.data.reverseHeader.companyId
          }]
        })
      }
    }).catch(e => {
      message.error(e.response.data.message);
        this.setState({ pageLoading: false })
      })
  }

    //控制弹出框的隐藏
  handleListCancel = () => {
      this.setState({
        showCompanySelector: false,
        showDepartmentSelector: false,
      });
    };

      //公司确认按钮
    handleCompanyListOk = (result) => {
      this.setState({
        showCompanySelector: false,
        companySelectedData: [{
          companyOID: result.result[0].companyOID,
          name: result.result[0].name,
          id: result.result[0].id
        }]
      });
    };
    //部门确认按钮
    handleDepartmentListOk = (result) => {
      this.setState({
        showDepartmentSelector: false,
        deparmentSelectedData: [{
          departmentOid: result.result[0].departmentOid,
          departmentName: result.result[0].name
        }]

      });
    };

  //保存
  handleSave = (e) => {
    const { reverseHeader } = this.state;
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      let description = values.description;
      this.setState({ loading: true });
      if (this.props.match.params.isNew) {
        let params = {
          ...this.props.match.params,
          companyId: values.companySelectedData[0].id,
          departmentId: values.deparmentSelectedData[0].oid || values.deparmentSelectedData[0].departmentOid,
          description: values.description
        };
        reverseService.reverseDetail(params).then(resp => {
          if (resp.status === 200) {
            message.success(this.$t('common.save.success',{name:""}));
            this.setState({loading: false});
            this.props.dispatch(
              routerRedux.replace({
                pathname: `/financial-management/expense-reverse/expense-reverse-detail/${resp.data.reverseHeader.id}`,
              })
            );
            // this.context.router.push(this.state.expenseReverseDetail.url.replace(':id',resp.data.reverseHeader.id))
          }
          // else{
          //   message.error(this.$t('common.save.expense.reverse.filed'));
          // }
        })
        .catch(e => {
            message.error(`${e.response.data.message}`);
            this.setState({ loading: false })
          })
      } else {
        let params = {
          id: reverseHeader.id,
          description: values.description,
          departmentId: values.deparmentSelectedData[0].oid,
          companyId: values.companySelectedData[0].id
        };
        reverseService.saveReverse(params).then(resp => {
        if (resp.status === 200){
          this.setState({loading: false});
          message.success(this.$t('common.update.success'));
          this.props.dispatch(
            routerRedux.replace({
              pathname: `/financial-management/expense-reverse/expense-reverse-detail/${reverseHeader.id}`,
            })
          );
          // this.context.router.push(this.state.expenseReverseDetail.url.replace(':id',reverseHeader.id))
        }
      })
      }
    })
  };

  //取消
  onCancel = () => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/financial-management/expense-reverse`,
      })
    );
    // this.context.router.push(this.state.expenseReverse.url);
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    // const { isNew } = this.props.location.state;
    const { loading, pageLoading, documentHeader, reverseHeader, companySelectedData, deparmentSelectedData ,currencyOptions } = this.state;
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 10, offset: 1}
    };
    return (
      <div className="new-contract" style={{ marginBottom: '40px' }}>
        <Spin spinning={pageLoading}>
          <Form onSubmit={this.handleSave}>
            <FormItem {...formItemLayout}
              label={this.$t('common.applicant')}> {/*申请人*/}
              {getFieldDecorator('applyName',{
                rules: [{
                  required: true
                }],
                
                initialValue: reverseHeader ? reverseHeader.employeeName : this.props.user.fullName
              })(
                <Input disabled/>
              )}
            </FormItem>
            <FormItem {...formItemLayout}
              label={this.$t( 'accounting.view.company')}> {/*公司*/}
              {getFieldDecorator('companySelectedData',{
                rules: [{
                  required: true
                }],
                initialValue: companySelectedData
              })(
                <Chooser
                  type="company"
                  labelKey="name"
                  valueKey="id"
                  single={true}
                  listExtraParams={{setOfBooksId: this.props.company.setOfBooksId}}
                />
              )}
            </FormItem>
            <FormItem {...formItemLayout}
              label={this.$t('accounting.view.department')}> {/*部门*/}
              {getFieldDecorator('deparmentSelectedData',{
                rules: [{
                  required: true
                }],
                initialValue: deparmentSelectedData
              })(
                <Chooser
                  type="select_department_contract"
                  labelKey="name"
                  valueKey="oid"
                  single={true}
                />
              )}
            </FormItem>
            <FormItem {...formItemLayout}
              label={this.$t('budget.occupancy.currency')}> {/*币种*/}
              {getFieldDecorator('currency',{
                rules: [{
                  required: true
                }],
                initialValue: reverseHeader ? reverseHeader.currencyCode : this.props.match.params.currency//+"-人民币"
              })(
                // <Select disabled/>
                <Select
                          disabled
                          placeholder={this.$t({ id: 'common.please.select' }/*请选择*/)}
                            onFocus={this.getCurrencyOptions}
                            // notFoundContent={currencyLoading ? <Spin size="small" /> : this.$t({ id: "my.contract.no.result" }/*无匹配结果*/)}
                            >
                      {currencyOptions.map((option) => {
                        return <Option key={option.currency} value={option.currency} >{option.currency}-{option.currency==="CNY" ? "人民币" : "美元"}</Option>
                      })}
                    </Select>
              )}
            </FormItem>
            <FormItem {...formItemLayout}
              label={this.$t('common.remark')}> {/*备注*/}
              {getFieldDecorator('description',{
                initialValue: reverseHeader ? reverseHeader.description : ''
              })(
                <TextArea />
              )}
            </FormItem>
            <Affix offsetBottom={0}
                   style={{
                     position: 'fixed', bottom: 0, marginLeft: '-35px', width: '100%', height: '50px',
                     boxShadow: '0px -5px 5px rgba(0, 0, 0, 0.067)', background: '#fff', lineHeight: '50px'
                   }}>
              <Button type="primary" htmlType="submit" loading={loading} style={{ margin: '0 20px' }}>{this.$t('acp.next')}</Button>
              <Button onClick={this.onCancel}>{this.$t('common.cancel')}</Button>
            </Affix>
          </Form>
        </Spin>
      </div>
    )
  }
}

// NewReverse.contextTypes = {
//   router: React.PropTypes.object
// };

const wrappedNewReverse = Form.create()(NewReverse);


function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company,
    organization: state.user.organization
  }

}

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedNewReverse);


