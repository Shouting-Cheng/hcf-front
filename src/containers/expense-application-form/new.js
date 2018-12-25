import React, { Component } from "react"
import { Form, Card, Input, Row, Col, Affix, Button, DatePicker, Select, InputNumber, message, Spin, } from 'antd';
import { connect } from "dva";
import Chooser from "widget/chooser"
import service from "./service"

const FormItem = Form.Item;


class NewExpenseApplicationFrom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      pageLoading: false,
      isNew: true,
      model: {},
      currencyList: [],
      dimensionList: [],
      applicationTypeInfo: {}
    }
  }

  componentDidMount() {
    if (this.props.match.params.id) {
      this.setState({ isNew: false });
    }

    //获取币种列表
    service.getCurrencyList().then(res => {
      this.setState({ currencyList: res.data });
    })

    if (this.props.match.params.typeId) {
      this.getApplicationTypeInfo(this.props.match.params.typeId);
    }

  }

  getApplicationTypeInfo = (typeId) => {

    //获取申请单类型
    service.getApplicationTypeById(typeId).then(res => {
      this.setState({ applicationTypeInfo: res.data.applicationType });
    }).catch(err => {
      message.error(err.response.data.message);
    });

    //获取维度
    service.getDimension(this.props.match.params.typeId).then(res => {
      this.setState({ dimensionList: res.data });
    }).catch(err => {
      message.error(err.response.data.message);
    });
  }

  render() {

    const { getFieldDecorator } = this.props.form;

    const rowLayout = { type: 'flex', gutter: 24, justify: 'center' };
    const formItemLayout = {
      labelCol: {
        xs: { span: 12 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };

    const { pageLoading, loading, isNew, currencyList, dimensionList, applicationTypeInfo } = this.state;

    return (
      <div className="new-contract" style={{ marginBottom: 60, marginTop: 10 }}>
        <Spin spinning={pageLoading}>
          <Form onSubmit={this.handleSave}>
            <Row {...rowLayout}>
              <Col span={10}>
                <FormItem label="申请人" {...formItemLayout}>
                  {getFieldDecorator('employeeId', {
                    rules: [{ required: true, message: '请选择' }],
                    initialValue: this.props.user.fullName,
                  })(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row {...rowLayout}>
              <Col span={10}>
                <FormItem label="公司" {...formItemLayout}>
                  {getFieldDecorator('companyId', {
                    rules: [{ required: true, message: this.$t('common.please.select') }],
                    initialValue: isNew
                      ? [{ id: this.props.user.companyId, name: this.props.user.companyName }]
                      : model.id ? [{ id: model.companyId, name: model.companyName }] : [],
                  })(
                    <Chooser
                      type="company"
                      labelKey="name"
                      valueKey="id"
                      single={true}
                      listExtraParams={{ setOfBooksId: this.props.company.setOfBooksId }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...rowLayout}>
              <Col span={10}>
                <FormItem label="部门" {...formItemLayout}>
                  {getFieldDecorator('unitId', {
                    rules: [{ required: true, message: this.$t('common.please.select') }],
                    initialValue: isNew ? []
                      : model.id ? [{
                        departmentOid: model.unitOid,
                        departmentId: model.unitId,
                        path: model.path,
                      }] : []
                  })(
                    <Chooser
                      type="department_document"
                      labelKey="path"
                      valueKey="departmentId"
                      single={true}
                      listExtraParams={{ tenantId: this.props.user.tenantId }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...rowLayout}>
              <Col span={10}>
                <FormItem label="币种" {...formItemLayout}>
                  {getFieldDecorator('unitId', {
                    rules: [{ required: true, message: this.$t('common.please.select') }],
                    initialValue: isNew ? this.props.company.baseCurrency : model.currency
                  })(
                    <Select>
                      {currencyList.map(item => {
                        return <Select.Option key={item.currency} value={item.currency}>{item.currency}-{item.currencyName}</Select.Option>
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            {dimensionList.map(item => {
              return (<Row key={item.id} {...rowLayout}>
                <Col span={10}>
                  <FormItem label={item.dimensionName} {...formItemLayout}>
                    {getFieldDecorator(item.id, {
                      rules: [{ required: true, message: this.$t('common.please.select') }],
                      initialValue: isNew ? item.defaultValue : model.defaultValue
                    })(
                      <Select>
                        {currencyList.map(item => {
                          return <Select.Option key={item.currency} value={item.currency}>{item.currency}-{item.currencyName}</Select.Option>
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>)
            })}
            {applicationTypeInfo.associateContract && <Row {...rowLayout}>
              <Col span={10}>
                <FormItem label="关联合同" {...formItemLayout}>
                  {getFieldDecorator('unitId', {
                    rules: [{ required: applicationTypeInfo.requireInput, message: this.$t('common.please.select') }],
                    initialValue: isNew ? this.props.company.baseCurrency : model.currency
                  })(
                    <Chooser
                      type="select_contract"
                      labelKey="name"
                      valueKey="contractHeaderId"
                      single={true}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>}
            <div
              style={{
                position: 'fixed',
                bottom: 0,
                marginLeft: '-35px',
                width: '100%',
                height: '50px',
                boxShadow: '0px -5px 5px rgba(0, 0, 0, 0.067)',
                background: '#fff',
                lineHeight: '50px',
              }}
            >
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ margin: '0 20px' }}
              >
                {this.props.match.params.id === '0' ? '下一步' : '确定'}
              </Button>
              {this.props.match.params.id === '0' ? <Button onClick={this.onCancel}>取消</Button> : <Button onClick={this.onBack}>返回</Button>}
            </div>
          </Form>
        </Spin>
      </div>
    )
  }
}

function map(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company
  }
}

export default connect(map)(Form.create()(NewExpenseApplicationFrom))