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
      pageLoading: true,
      isNew: true,
      model: {},
      currencyList: [],
      dimensionList: [],
      applicationTypeInfo: {},
      typeId: "",
      uploadOIDs: [],
      contractParams: { companyId: props.user.companyId, currency: props.company.baseCurrency, documentType: "PREPAYMENT_REQUISITION" }
    }
  }

  componentDidMount() {

    if (this.props.match.params.id) {
      service.getEditInfo(this.props.match.params.id).then(res => {

        let fileList = res.data.attachments ? res.data.attachments.map(o => ({
          ...o,
          uid: o.attachmentOID,
          name: o.fileName,
          status: 'done'
        })) : [];

        this.setState({
          isNew: false,
          model: res.data,
          fileList,
          pageLoading: false,
          contractParams: {
            companyId: res.data.companyId,
            currency: res.data.currencyCode,
            documentType: "PREPAYMENT_REQUISITION"
          }
        });
      }).catch(err => {
        message.error(err.response.data.message);
      });
    }

    //获取币种列表
    service.getCurrencyList().then(res => {
      this.setState({ currencyList: res.data });
    });

    if (this.props.match.params.typeId) {
      this.getApplicationTypeInfo(this.props.match.params.typeId);
    }

  }

  getApplicationTypeInfo = (typeId) => {
    //获取申请单类型
    const getApplicationTypeById = service.getApplicationTypeById(typeId);
    //获取维度
    const getDimension = service.getDimension(this.props.match.params.typeId);
    Promise.all([getApplicationTypeById, getDimension]).then(res => {
      this.setState({ applicationTypeInfo: res[0].data.applicationType, dimensionList: res[1].data, pageLoading: false });
    }).catch(err => {
      message.error("请求失败，请稍后重试...");
    })

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
  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.setState({ loading: true });
      let { typeId, uploadOIDs, isNew, model } = this.state;
      if (isNew) {
        values = {
          typeId,
          employeeId: this.props.user.id,
          remarks: values.remarks,
          currencyCode: values.currencyCode,
          companyId: values.company[0].id,
          departmentId: values.department[0].departmentId,
          dimensions: [],
          attachmentOid: uploadOIDs.length ? uploadOIDs.join(",") : null,
          requisitionDate: moment().format(),
          contractHeaderId: (values.contract && values.contract.length) ? values.contract[0].contractHeaderId : ""
        };
      } else {
        values = {
          ...model,
          id: model.id,
          typeId: model.typeId,
          employeeId: this.props.user.id,
          remarks: values.remarks,
          currencyCode: values.currencyCode,
          companyId: values.company[0].id,
          departmentId: values.department[0].departmentId,
          dimensions: [],
          attachmentOid: uploadOIDs.length ? uploadOIDs.join(",") : null,
          requisitionDate: model.requisitionDate,
          versionNumber: model.versionNumber,
          contractHeaderId: (values.contract && values.contract.length) ? values.contract[0].contractHeaderId : ""
        };
      }
      let method = service.addExpenseApplictionForm;
      if (!isNew) {
        method = service.updateHeaderData;
      }
      method(values).then(res => {
        message.success(isNew ? "新增成功！" : "编辑成功！");
        this.setState({ loading: false });
        this.onBack();
      }).catch(err => {
        message.error(err.response.data.message);
        this.setState({ loading: false });
      });
    });
  }

  currencyChange = (value) => {
    this.props.form.setFieldsValue({ contract: [] });
    this.setState({ contractParams: { ...this.state.contractParams, currency: value } });
  }

  companyChange = (value) => {
    this.props.form.setFieldsValue({ contract: [] });
    this.setState({ contractParams: { ...this.state.contractParams, companyId: value[0].id } });
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

    const { pageLoading, loading, isNew, currencyList, contractParams, dimensionList, applicationTypeInfo, fileList, model } = this.state;

    return (
      <div className="new-contract" style={{ marginBottom: 60, marginTop: 10 }}>
        <Spin spinning={pageLoading}>
          {!pageLoading && <Form onSubmit={this.handleSave}>
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
                    initialValue: isNew ? [{ id: this.props.user.companyId, name: this.props.user.companyName }]
                      : [{ id: model.companyId, name: model.companyName }],
                  })(
                    <Chooser
                      type="company"
                      labelKey="name"
                      valueKey="id"
                      single={true}
                      listExtraParams={{ setOfBooksId: this.props.company.setOfBooksId }}
                      onChange={this.companyChange}
                      showClear={false}
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
                    }] : [{
                      departmentId: model.departmentId,
                      path: model.departmentName,
                    }]
                  })(
                    <Chooser
                      type="department_document"
                      labelKey="path"
                      valueKey="departmentId"
                      single={true}
                      showClear={false}
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
                    initialValue: isNew ? this.props.company.baseCurrency : model.currencyCode
                  })(
                    <Select onChange={this.currencyChange}>
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
            {(applicationTypeInfo.associateContract || (!isNew && model.associateContract)) && <Row {...rowLayout}>
              <Col span={10}>
                <FormItem label="关联合同" {...formItemLayout}>
                  {getFieldDecorator('contract', {
                    rules: [{ required: isNew ? applicationTypeInfo.requireInput : model.requireInput, message: this.$t('common.please.select') }],
                    initialValue: isNew ? [] : [{ contractNumber: model.contractNumber, contractHeaderId: model.contractHeaderId }]
                  })(
                    <Chooser
                      type="select_contract"
                      labelKey="contractNumber"
                      valueKey="contractHeaderId"
                      single={true}
                      listExtraParams={contractParams}
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
                      defaultOIDs={isNew ? [] : model.attachmentOidList}
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
                {isNew ? '下一步' : '确定'}
              </Button>
              {isNew ? <Button onClick={this.onBack}>取消</Button> : <Button onClick={this.onBack}>返回</Button>}
            </div>
          </Form>}
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