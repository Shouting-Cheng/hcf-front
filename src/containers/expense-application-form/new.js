import React, { Component } from "react"
import { Form, Card, Input, Row, Col, Affix, Button, DatePicker, Select, InputNumber, message, Spin, } from 'antd';
import { connect } from "dva";
import { routerRedux } from "dva/router"
import Chooser from "widget/chooser"
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


    this.setState({ typeId });
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
        xs: { span: 12 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };

    const { pageLoading, loading, isNew, currencyList, dimensionList, applicationTypeInfo, fileList } = this.state;

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
                  })(<Input disabled />)}
                </FormItem>
              </Col>
            </Row>
            <Row {...rowLayout}>
              <Col span={10}>
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
              <Col span={10}>
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
              <Col span={10}>
                <FormItem label="币种" {...formItemLayout}>
                  {getFieldDecorator('currencyCode', {
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
            <Row {...rowLayout}>
              <Col span={10}>
                <FormItem label="备注" {...formItemLayout}>
                  {getFieldDecorator('remarks', {
                    initialValue: isNew ? "" : model.remarks
                  })(
                    <Input.TextArea autosize={{ minRows: 3 }} />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...rowLayout} style={{ marginBottom: 40 }}>
              <Col span={10}>
                <FormItem label="附件信息" {...formItemLayout}>
                  {getFieldDecorator('attachmentOID')(
                    <Upload
                      attachmentType="BUDGET_JOURNAL"
                      uploadUrl={`${config.baseUrl}/api/upload/static/attachment`}
                      fileNum={9}
                      uploadHandle={this.handleUpload}
                      defaultFileList={fileList}
                      defaultOIDs={isNew ? [] : model.attachmentOids}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <div style={{
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