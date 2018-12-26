import React, { Component } from "react"
import { Form, Card, Input, Row, Col, Affix, Button, DatePicker, Select, InputNumber, message, Spin, } from 'antd';
import { connect } from "dva";
import { routerRedux } from "dva/router"
import Chooser from "widget/chooser"
import SelectApplicationType from "widget/select-application-type"
import Upload from 'widget/upload';


import service from "./service"
import config from "config"

const FormItem = Form.Item;

import moment from "moment"


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
      applicationTypeInfo: {},
      typeId: "",
      uploadOIDs: []
    }
  }

  componentDidMount() {

  }

  getApplicationTypeInfo = (typeId) => {

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
  handleSave = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return;

      let { typeId, uploadOIDs } = this.state;

      values = {
        typeId,
        employeeId: this.props.user.id,
        remarks: values.remarks,
        currencyCode: values.currencyCode,
        companyId: values.company[0].id,
        departmentId: values.department[0].departmentId,
        dimensions: [],
        attachmentOid: uploadOIDs.length ? uploadOIDs[0] : null,
        requisitionDate: moment().format()
      };

      service.addExpenseApplictionForm(values).then(res => {
        message.success("新增成功！");
        this.onBack();
      }).catch(err => {
        message.error(err.response.data.message);
      });

    });
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

    const { pageLoading, loading, isNew, currencyList, dimensionList, applicationTypeInfo, fileList } = this.state;

    return (
      <div style={{ marginBottom: 60, marginTop: 10 }}>
        <Spin spinning={pageLoading}>
          <Form onSubmit={this.handleSave}>
            <Row {...rowLayout}>
              <Col span={24}>
                <FormItem label="公司" {...formItemLayout}>
                  {getFieldDecorator('company', {
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
              <Col span={24}>
                <FormItem label="部门" {...formItemLayout}>
                  {getFieldDecorator('department', {
                    rules: [{ required: true, message: this.$t('common.please.select') }],
                    initialValue: isNew ? [{
                      departmentId: this.props.user.departmentID,
                      path: this.props.user.departmentName,
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
                  {getFieldDecorator('currencyCode', {
                    rules: [{ required: true, message: this.$t('common.please.select') }],
                    initialValue: isNew ? this.props.company.baseCurrency : model.currency
                  })(
                    <SelectApplicationType>
                    </SelectApplicationType>
                  )}
                </FormItem>
              </Col>
            </Row>
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
                    initialValue: isNew ? "" : model.remarks
                  })(
                    <Input.TextArea autosize={{ minRows: 3 }} />
                  )}
                </FormItem>
              </Col>
            </Row>
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