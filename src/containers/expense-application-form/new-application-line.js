import React, { Component } from "react"
import { Form, Input, Row, Col, Button, DatePicker, Select, InputNumber, message, Spin, TimePicker } from 'antd';
import { connect } from "dva";
import { routerRedux } from "dva/router"
import Chooser from "widget/chooser"
import SelectApplicationType from "widget/select-application-type"
import CustomAmount from "widget/custom-amount"
import service from "./service"
const FormItem = Form.Item;
import moment from "moment"

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
      typeId: "",
      uploadOIDs: [],
      expenseTypeInfo: {}
    }
  }

  componentDidMount() {
    if (this.props.lineId) {
      this.getEditInfo();
    } else {
      this.getNewInfo();
    }
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

  //获取编辑默认数据
  getEditInfo = () => {
    const { lineId } = this.props;
    service.getNewInfo({ headerId: this.props.headerData.id, lineId: lineId, isNew: false }).then(res => {
      res.data.applicationType = { id: res.data.expenseTypeId, name: res.data.expenseTypeName };
      this.setState({ model: res.data, pageLoading: false, isNew: false });
    }).catch(err => {
      console.log(err);
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

      this.setState({ loading: true });

      let { expenseTypeInfo, model, isNew } = this.state;

      let result = [];

      Object.keys(values).map(key => {
        if (key.indexOf("-") >= 0) {
          let id = key.split("-")[1];
          let record = null;
          if (isNew) {
            record = expenseTypeInfo.fields.find(o => o.id == id);
          } else {
            record = model.fields.find(o => o.id == id);
          }
          if (record.fieldType == "DATE" || record.fieldType == "DATETIME" || record.fieldType == "MONTH") {
            record.value = values[key].format();
          } else {
            record.value = values[key]
          }
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

      if (!this.state.isNew) {
        params = { ...model, ...params };
        service.updateApplicationLine(params).then(res => {
          message.success("操作成功！");
          this.setState({ loading: false });
          this.props.close && this.props.close(true);
        }).catch(err => {
          this.setState({ loading: false });
          message.error(err.response.data.message);
        });
      } else {
        service.addApplicationLine(params).then(res => {
          message.success("操作成功！");
          this.setState({ loading: false });
          this.props.close && this.props.close(true);
        }).catch(err => {
          this.setState({ loading: false });
          message.error(err.response.data.message);
        });
      }
    });
  }

  //选择申请单
  selectApplicationType = (item) => {
    this.setState({ expenseTypeInfo: item }, () => {
      if (item.entryMode) {
        this.props.form.setFieldsValue({ price: 0, quantity: 0 });
      } else {
        this.props.form.setFieldsValue({ amount: 0 });
      }
    });
  }

  //取消
  onCancel = () => {
    this.props.close && this.props.close();
  }

  //渲染动态组件
  renderFields = (field) => {

    const formItemLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 10
      },
    };

    const { isNew } = this.state;
    const { getFieldDecorator } = this.props.form;

    const rowLayout = { type: 'flex', gutter: 24, justify: 'center' };
    switch (field.fieldType) {
      case "TEXT":
        return (
          <Row key={field.id} {...rowLayout}>
            <Col span={24}>
              <FormItem label={field.name} {...formItemLayout}>
                {getFieldDecorator("field-" + field.id, {
                  rules: [{ required: field.required, message: this.$t('common.please.select') }],
                  initialValue: field.value
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
                  rules: [{ required: field.required, message: this.$t('common.please.select') }],
                  initialValue: isNew ? moment() : moment(field.value)
                })(
                  <DatePicker />
                )}
              </FormItem>
            </Col>
          </Row>
        );
      case "DATETIME":
        return (
          <Row key={field.id} {...rowLayout}>
            <Col span={24}>
              <FormItem label={field.name} {...formItemLayout}>
                {getFieldDecorator("field-" + field.id, {
                  rules: [{ required: field.required, message: this.$t('common.please.select') }],
                  initialValue: isNew ? moment() : moment(field.value)
                })(
                  <TimePicker />
                )}
              </FormItem>
            </Col>
          </Row>
        );
      case "MONTH":
        return (
          <Row key={field.id} {...rowLayout}>
            <Col span={24}>
              <FormItem label={field.name} {...formItemLayout}>
                {getFieldDecorator("field-" + field.id, {
                  rules: [{ required: field.required, message: this.$t('common.please.select') }],
                  initialValue: isNew ? moment() : moment(field.value)
                })(
                  <DatePicker.MonthPicker />
                )}
              </FormItem>
            </Col>
          </Row>
        );
      case "CUSTOM_ENUMERATION":
        return (
          <Row key={field.id} {...rowLayout}>
            <Col span={24}>
              <FormItem label={field.name} {...formItemLayout}>
                {getFieldDecorator("field-" + field.id, {
                  rules: [{ required: true, message: this.$t('common.please.select') }],
                  initialValue: field.value
                })(
                  <Select>
                    {field.options && field.options.map(o => {
                      return <Select.Option key={o.value}>{o.label}</Select.Option>
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
        );
    }
  }

  //校验金额
  checkPrice = (rule, value, callback) => {
    if (value > 0) {
      callback();
      return;
    }
    callback('金额不能小于等于0！');
  };

  //校验数量
  checkCount = (rule, value, callback) => {
    if (value > 0) {
      callback();
      return;
    }
    callback('不能小于等于0！');
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const rowLayout = { type: 'flex', gutter: 24, justify: 'center' };
    const { pageLoading, model, isNew, currencyList, dimensionList, loading, expenseTypeInfo } = this.state;
    const { lineId } = this.props;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 10 },
    };
    return (
      <div style={{ marginBottom: 60, marginTop: 10 }}>
        {pageLoading ? <Spin /> :
          <Form onSubmit={this.handleSave}>
            <Row {...rowLayout}>
              <Col span={24}>
                <FormItem label="公司" {...formItemLayout}>
                  {getFieldDecorator('company', {
                    rules: [{ required: true, message: this.$t('common.please.select') }],
                    initialValue: [{ id: model.companyId, name: model.companyName }]
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
                    initialValue: [{
                      departmentId: model.departmentId,
                      path: model.departmentName,
                    }]
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
                    initialValue: lineId ? model.applicationType : {}
                  })(
                    <SelectApplicationType onChange={this.selectApplicationType} applicationTypeId={this.props.headerData.typeId} />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...rowLayout}>
              <Col span={24}>
                <FormItem label="申请日期" {...formItemLayout}>
                  {getFieldDecorator('requisitionDate', {
                    rules: [{ required: true, message: this.$t('common.please.select') }],
                    initialValue: lineId ? moment(model.requisitionDate) : moment()
                  })(
                    <DatePicker />
                  )}
                </FormItem>
              </Col>
            </Row>
            {(expenseTypeInfo.entryMode === false || (lineId && !model.priceUnit)) && (<Row {...rowLayout}>
              <Col span={24}>
                <FormItem label="申请金额" {...formItemLayout}>
                  {getFieldDecorator('amount', {
                    rules: [{ validator: this.checkPrice }],
                    initialValue: model.amount
                  })(
                    <CustomAmount />
                  )}
                </FormItem>
              </Col>
            </Row>)}
            {(expenseTypeInfo.entryMode || (lineId && model.priceUnit)) &&
              (<Row {...rowLayout}>
                <Col span={24}>
                  <FormItem label="单价" {...formItemLayout}>
                    {getFieldDecorator('price', {
                      rules: [{ validator: this.checkPrice }],
                      initialValue: model.price
                    })(
                      <CustomAmount />
                    )}
                  </FormItem>
                </Col>
              </Row>)
            }
            {(expenseTypeInfo.entryMode || (lineId && model.priceUnit)) &&
              (<Row {...rowLayout}>
                <Col span={24}>
                  <FormItem label={priceUnitMap[lineId ? model.priceUnit : expenseTypeInfo.priceUnit]} {...formItemLayout}>
                    {getFieldDecorator('quantity', {
                      rules: [{ validator: this.checkCount }],
                      initialValue: model.quantity
                    })(
                      <InputNumber precision={0} />
                    )}
                  </FormItem>
                </Col>
              </Row>)
            }
            {isNew && expenseTypeInfo.fields && expenseTypeInfo.fields.map(item => {
              return this.renderFields(item)
            })}
            {!isNew && model.fields && model.fields.map(item => {
              return this.renderFields(item)
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
            <Row {...rowLayout}>
              <Col span={24}>
                <FormItem label="备注" {...formItemLayout}>
                  {getFieldDecorator('remarks', {
                    initialValue: model.remarks
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