/**
 *  created by zk on 2017/11/27
 */
import React from 'react';
import { connect } from 'dva';
import {
  Button,
  Form,
  Select,
  Input,
  Col,
  Row,
  Switch,
  message,
  Icon,
  DatePicker,
  InputNumber,
} from 'antd';

import { routerRedux } from 'dva/router';
import debounce from 'lodash.debounce';
import cashTransactionClassService from './cash-transaction-class.service';
import baseService from 'share/base.service';
const FormItem = Form.Item;
const Option = Select.Option;

class NewCashTransactionClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      // setOfBooks:[],
      // enabled: true,
      typeCodes: [],
      cashTransactionClassDetail:
        '/pay-setting/cash-transaction-class/cash-transaction-class-detail/:id',
      cashTransactionClass: '/pay-setting/cash-transaction-class',
      setOfBooksOption: [],
    };
    this.validateCashTransactionClassCode = debounce(this.validateCashTransactionClassCode, 1000);
  }

  componentWillMount() {
    this.getSetOfBooks();
    this.getSystemValueList(2104).then(res => {
      //事务类型
      let typeCodes = res.data.values;
      this.setState({ typeCodes });
    });
  }

  //获取账套
  getSetOfBooks() {
    let setOfBooksOption = [];
    baseService.getSetOfBooksByTenant().then(res => {
      res.data.map(data => {
        setOfBooksOption.push({
          label: data.setOfBooksCode + ' - ' + data.setOfBooksName,
          value: String(data.id),
        });
      });
      this.setState({
        setOfBooksOption,
      });
    });
  }

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  };

  handleDisabledEndDate = endValue => {
    if (!this.state.startValue || !endValue) {
      return false;
    }
    return endValue.valueOf() <= this.state.startValue.valueOf();
  };

  //新建现金事务
  handleSave = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        // values.setOfBookId = this.props.company.setOfBooksId;
        cashTransactionClassService
          .addCashTransactionClass(values)
          .then(response => {
            message.success(`${response.data.description}保存成功!`); /*保存成功！*/
            this.props.dispatch(
              routerRedux.push({
                pathname: this.state.cashTransactionClassDetail.replace(':id', response.data.id),
              })
            );
          })
          .catch(e => {
            this.setState({ loading: false });
            if (e.response) {
              message.error(this.$t({ id: 'common.save.filed' }) + `,${e.response.data.message}`);
            }
          });
      }
    });
  };

  handleCancel = e => {
    e.preventDefault();
    this.props.dispatch(
      routerRedux.push({
        pathname: this.state.cashTransactionClass,
      })
    );
  };

  validateCashTransactionClassCode = (item, value, callback) => {
    if (item.field === 'classCode') {
      // let re = /^[a-z || A-Z]+$/;
      let re = /[^\u4e00-\u9fa5]+$/;
      if (!re.test(value)) {
        this.props.form.setFieldsValue({ classCode: '' });
      }
    }
    callback();
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { /*setOfBooks, */ enabled, typeCodes, setOfBooksOption } = this.state;
    return (
      <div className="new-cash-transaction-class">
        <div className="cash-transaction-class-form">
          <Form onSubmit={this.handleSave} className="cash-transaction-class-form">
            <Row gutter={60}>
              <Col span={8}>
                <FormItem
                  label={this.$t({ id: 'cash.transaction.class.setOfBooksName' }) /*账套*/}
                  colon={true}
                >
                  {getFieldDecorator('setOfBookId', {
                    rules: [
                      {
                        required: true,
                      },
                    ],
                    initialValue: this.props.match.params.setOfBooksId,
                  })(
                    <Select
                      placeholder={this.$t({ id: 'common.please.select' }) /* 请选择 */}
                      disabled /*={!this.props.tenantMode}*/
                    >
                      {setOfBooksOption.map(option => {
                        return <Option key={option.value}>{option.label}</Option>;
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={this.$t({ id: 'cash.transaction.class.type' })} /*现金事务类型代码*/
                  colon={true}
                >
                  {getFieldDecorator('typeCode', {
                    rules: [{ required: true, message: this.$t({ id: 'common.please.select' }) }],
                  })(
                    <Select
                      onChange={value => {
                        this.setState({ mannerValue: value });
                      }}
                      placeholder={this.$t({ id: 'common.please.select' })}
                    >
                      {typeCodes.map(option => {
                        return <Option key={option.value}>{option.messageKey}</Option>;
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={this.$t({ id: 'cash.transaction.class.code' })} /*现金事务分类代码*/
                  colon={true}
                >
                  {getFieldDecorator('classCode', {
                    rules: [
                      { required: true, message: this.$t({ id: 'common.please.enter' }) },
                      {
                        validator: (item, value, callback) =>
                          this.validateCashTransactionClassCode(item, value, callback),
                      },
                    ],
                  })(<Input placeholder={this.$t({ id: 'common.please.enter' })} />)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={60}>
              <Col span={8}>
                <FormItem
                  label={this.$t({ id: 'cash.transaction.class.description' }) /*现金事务分类名称*/}
                  colon={true}
                >
                  {getFieldDecorator('description', {
                    rules: [{ required: true, message: this.$t({ id: 'common.please.enter' }) }],
                  })(<Input placeholder={this.$t({ id: 'common.please.enter' })} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={this.$t({ id: 'common.column.status' }) /* 状态 */}>
                  {getFieldDecorator('enabled', {
                    initialValue: true,
                  })(
                    <Switch
                      defaultChecked={true}
                      checkedChildren={<Icon type="check" />}
                      unCheckedChildren={<Icon type="cross" />}
                    />
                  )}&nbsp;&nbsp;&nbsp;&nbsp;{this.props.form.getFieldValue('enabled')
                    ? this.$t({ id: 'common.status.enable' })
                    : this.$t({ id: 'common.status.disable' })}
                </FormItem>
              </Col>
            </Row>
            <Button type="primary" htmlType="submit">
              {this.$t({ id: 'common.save' }) /*保存*/}
            </Button>
            <Button onClick={this.handleCancel} style={{ marginLeft: 8 }}>
              {' '}
              {this.$t({ id: 'common.cancel' }) /*取消*/}
            </Button>
          </Form>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    company: state.user.company,
  };
}

const WrappedNewCashTransactionClass = Form.create()(NewCashTransactionClass);
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedNewCashTransactionClass);
