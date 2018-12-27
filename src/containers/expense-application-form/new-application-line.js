import React, { Component } from "react"
import { Form, Card, Input, Row, Col, Affix, Button, DatePicker, Select, InputNumber, message, Spin } from 'antd';
import { connect } from "dva";
import { routerRedux } from "dva/router"
import Chooser from "widget/chooser"
import SelectApplicationType from "widget/select-application-type"
import Upload from 'widget/upload';
import CustomAmount from "widget/custom-amount"

import service from "./service"
import config from "config"

const FormItem = Form.Item;

import moment from "moment"

// <Option value="day">天</Option>
//   <Option value="week">周</Option>
//   <Option value="month">月</Option>
//   <Option value="month">人</Option>
//   <Option value="ge">个</Option>
//   <Option value="time">次</Option>

const priceUnitMap = {
  day: "天",
  week: "周",
  month: "周",
  person: "人",
  ge: "个",
  time: "次",
}

class NewExpenseApplicationFromLine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      pageLoading: true,
      isNew: true,
      model: {},
      currencyList: [],
      dimensionList: [],
      applicationTypeInfo: {},
      typeId: "",
      uploadOIDs: [],
      expenseTypeInfo: {}
    }
  }

  componentDidMount() {
    this.getNewInfo();
  }

  getApplicationTypeInfo = (typeId) => {

  }

  //获取默认数据
  getNewInfo = () => {
    service.getNewInfo({ headerId: this.props.headerData.id, lineId: "", isNew: true }).then(res => {
      this.setState({ model: res.data, pageLoading: false });
    }).catch(err => {
      message.error(err.response.data.message);
      this.setState({ pageLoading: false });
    })
  }

  //返回
  onBack = () => {
    this.props.dispatch(routerRedux.push({
      pathname: "/expense-application"
    }));
  }

  //上传附件
  handleUpload = OIDs => {
    this.setState({
      uploadOIDs: OIDs,
    });
  };

  //表单提交
  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;

      let { expenseTypeInfo } = this.state;

      let result = [];

      Object.keys(values).map(key => {
        if (key.indexOf("-") >= 0) {
          let id = key.split("-")[1];
          let record = expenseTypeInfo.fields.find(o => o.id == id);
          record.value = values[key];
          result.push(record);
        }
      })

      let params = {
        headerId: this.props.headerData.id,
        requisitionDate: values.requisitionDate.format(),
        remarks: values.remarks,
        expenseTypeId: values.applicationType.id,
        companyId: values.company[0].id,
        departmentId: values.department[0].departmentId,
        dimensions: [],
        fields: result,
        amount: values.amount
      };

      if (expenseTypeInfo.entryMode) {
        params.price = values.price;
        params.quantity = values.quantity;
      }

      service.addApplicationLine(params).then(res => {
        message.success("新增成功！");
        this.props.close && this.props.close(true);
      }).catch(err => {
        message.error(err.response.data.message);
      });

    });
  }

  //选择申请单
  selectApplicationType = (item) => {
    this.setState({ expenseTypeInfo: item });
  }

  //取消
  onCancel = () => {
    this.props.close && this.props.close();
  }


  renderFields = (field) => {

    const formItemLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 10
      },
    };

    const rowLayout = { type: 'flex', gutter: 24, justify: 'center' };

    switch (field.fieldType) {
      case "TEXT":
        return (
          <Row key={field.id} {...rowLayout}>
            <Col span={24}>
              <FormItem label={field.name} {...formItemLayout}>
                {getFieldDecorator("field-" + field.id, {
                  rules: [{ required: true, message: this.$t('common.please.select') }],
                  initialValue: isNew ? field.value : model.defaultValue
                })(
                  <Input />
                )}
              </FormItem>
            </Col>
          </Row>
        );
      case "DATE":
        return (
          <Row key={field.id} {...rowLayout}>
            <Col span={24}>
              <FormItem label={field.name} {...formItemLayout}>
                {getFieldDecorator("field-" + field.id, {
                  rules: [{ required: true, message: this.$t('common.please.select') }],
                  initialValue: isNew ? field.value : model.defaultValue
                })(
                  <DatePicker />
                )}
              </FormItem>
            </Col>
          </Row>
        );
    }
  }


  render() {

    const { getFieldDecorator } = this.props.form;

    const rowLayout = { type: 'flex', gutter: 24, justify: 'center' };

    const formItemLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 10
      },
    };

    const { pageLoading, model, isNew, currencyList, dimensionList, applicationTypeInfo, loading, expenseTypeInfo } = this.state;

    return (
      <div style={{ marginBottom: 60, marginTop: 10 }}>
        {pageLoading ? <Spin /> :
          <Form onSubmit={this.handleSave}>
            <Row {...rowLayout}>
              <Col span={24}>
                <FormItem label="公司" {...formItemLayout}>
                  {getFieldDecorator('company', {
                    rules: [{ required: true, message: this.$t('common.please.select') }],
                    initialValue: isNew
                      ? [{ id: model.companyId, name: model.companyName }]
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
              <Col span={24}>
                <FormItem label="部门" {...formItemLayout}>
                  {getFieldDecorator('department', {
                    rules: [{ required: true, message: this.$t('common.please.select') }],
                    initialValue: isNew ? [{
                      departmentId: model.departmentId,
                      path: model.departmentName,
                    }]
                      : model.id ? [{
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
              <Col span={24}>
                <FormItem label="申请类型" {...formItemLayout}>
                  {getFieldDecorator('applicationType', {
                    rules: [{ required: true, message: this.$t('common.please.select') }],
                    initialValue: isNew ? this.props.company.baseCurrency : model.currency
                  })(
                    <SelectApplicationType onChange={this.selectApplicationType} applicationTypeId={this.props.headerData.typeId} />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...rowLayout}>
              <Col span={24}>
                <FormItem label="申请时间" {...formItemLayout}>
                  {getFieldDecorator('requisitionDate', {
                    rules: [{ required: true, message: this.$t('common.please.select') }],
                    initialValue: isNew ? moment() : model.currency
                  })(
                    <DatePicker />
                  )}
                </FormItem>
              </Col>
            </Row>
            {!expenseTypeInfo.entryMode && (<Row {...rowLayout}>
              <Col span={24}>
                <FormItem label="申请金额" {...formItemLayout}>
                  {getFieldDecorator('amount', {
                    rules: [{ required: true, message: this.$t('common.please.select') }],
                    initialValue: isNew ? 0 : model.currency
                  })(
                    <CustomAmount />
                  )}
                </FormItem>
              </Col>
            </Row>)}
            {expenseTypeInfo.entryMode &&
              (<Row {...rowLayout}>
                <Col span={24}>
                  <FormItem label="单价" {...formItemLayout}>
                    {getFieldDecorator('price', {
                      rules: [{ required: true, message: this.$t('common.please.select') }],
                      initialValue: isNew ? 0 : model.currency
                    })(
                      <CustomAmount />
                    )}
                  </FormItem>
                </Col>
              </Row>)
            }
            {expenseTypeInfo.entryMode &&
              (<Row {...rowLayout}>
                <Col span={24}>
                  <FormItem label={priceUnitMap[expenseTypeInfo.priceUnit]} {...formItemLayout}>
                    {getFieldDecorator('quantity', {
                      rules: [{ required: true, message: this.$t('common.please.select') }],
                      initialValue: isNew ? 0 : model.currency
                    })(
                      <InputNumber precision={0} />
                    )}
                  </FormItem>
                </Col>
              </Row>)
            }
            {expenseTypeInfo.fields && expenseTypeInfo.fields.map(item => {
              return (<Row key={item.id} {...rowLayout}>
                <Col span={24}>
                  <FormItem label={item.name} {...formItemLayout}>
                    {getFieldDecorator("field-" + item.id, {
                      rules: [{ required: true, message: this.$t('common.please.select') }],
                      initialValue: isNew ? item.value : model.defaultValue
                    })(
                      <Input />
                    )}
                  </FormItem>
                </Col>
              </Row>)
            })}
            {dimensionList.map(item => {
              return (<Row key={item.id} {...rowLayout}>
                <Col span={24}>
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
              <Col span={24}>
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
            <Row {...rowLayout}>
              <Col span={24}>
                <FormItem label="备注" {...formItemLayout}>
                  {getFieldDecorator('remarks', {
                    initialValue: isNew ? model.remarks : model.remarks
                  })(
                    <Input.TextArea autosize={{ minRows: 3 }} />
                  )}
                </FormItem>
              </Col>
            </Row>
            <div className="slide-footer">
              <Button type="primary" htmlType="submit" loading={loading}>
                {this.$t({ id: 'common.save' }) /* 保存 */}
              </Button>
              <Button onClick={this.onCancel}>{this.$t({ id: 'common.cancel' }) /* 取消 */}</Button>
            </div>
          </Form>}
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

export default connect(map)(Form.create()(NewExpenseApplicationFromLine))