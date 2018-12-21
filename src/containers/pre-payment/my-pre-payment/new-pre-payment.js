/**
 * Created by 13576 on 2017/12/4.
 */
import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import {Form,Card,Input,Row,Col,Affix,Button,DatePicker,Select,InputNumber,message,Spin,} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
// import menuRoute from 'routes/menuRoute'
import config from 'config';
import httpFetch from 'share/httpFetch';
import moment from 'moment';
import Upload from 'widget/upload';
import Chooser from './chooser';
import prePaymentService from 'containers/pre-payment/my-pre-payment/me-pre-payment.service';

class MyNewPrePayment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      pageLoading: false,
      user: {},
      contractTypeDisabled: true,
      setOfBooksId: null,
      isNew: true, //新建 or 编辑
      data: [], //编辑的合同信息
      partnerCategoryOptions: [], //合同方类型选项
      currencyOptions: [], //币种
      companyIdOptions: [], //公司
      contractCategoryOptions: [], //合同大类选项
      uploadOIDs: [], //上传附件的OIDs
      employeeOptions: [], //员工选项
      venderOptions: [], //供应商选项
      employeeIdOptions: [], //申请人
      unitIdOptions: [], //部门
      selectorItem: {},
      extraParams: null,
      departmentId: '',
      // PayRequisitionDetail: menuRoute.getRouteItem('pre-payment-detail', 'key'), //预付款详情
      // PrepaymentList: menuRoute.getRouteItem('me-pre-payment', 'key'),    //预付款列表页面
      model: {},
      fileList: [],
    };
  }
  componentDidMount() {
    if (this.props.match.params.id != 0) {
      prePaymentService.getHeadById(this.props.match.params.id).then(res => {
        let fileList = [];
        if (res.data.attachments) {
          res.data.attachments.map(item => {
            fileList.push({
              ...item,
              uid: item.attachmentOID,
              name: item.fileName,
              status: 'done',
            });
          });
        }
        this.setState({
          model: res.data,
          isNew: false,
          fileList,
        });
      });
    } else {
      httpFetch
        .get(`${config.baseUrl}/api/departments/${this.props.user.departmentOID}`)
        .then(res => {
          this.setState({
            departmentId: res.data.id,
          });
        });
    }
  }
  //上传附件
  handleUpload = OIDs => {
    console.log(OIDs);
    this.setState({
      uploadOIDs: OIDs,
    });
  };
  //保存
  handleSave = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let dataValue;

        this.setState({ loading: true });

        if (this.state.isNew) {
          dataValue = {
            ...values,
            paymentReqTypeId: this.props.match.params.prePaymentTypeId,
            tenant_id: this.props.user.tenantId,
            employeeId: this.props.user.id,
            // companyId: this.props.user.companyId,
            // unitId: this.state.departmentId,
            formOid: this.props.match.params.formOid != 0 ? this.props.match.params.formOid : '',
            ifWorkflow: this.props.match.params.formOid != 0,
            advancePaymentAmount: 0,
            companyId: values.companyId[0].id,
            unitId: values.unitId[0].departmentId,
          };
        } else {
          dataValue = {
            ...this.state.model,
            ...values,
            tenant_id: this.props.user.tenantId,
            employeeId: this.props.user.id,
            // companyId: this.props.user.companyId,
            // unitId: this.state.departmentId,
            formOid: this.props.match.params.formOid != 0 ? this.props.match.params.formOid : '',
            ifWorkflow: this.props.match.params.formOid != 0,
            companyId: values.companyId[0].id,
            unitId: values.unitId[0].departmentId,
          };
        }

        //ådataValue.attachmentOid = this.state.uploadOIDs.toString();
        dataValue.attachmentOids = this.state.uploadOIDs;
        prePaymentService
          .addPrepaymentHead(dataValue)
          .then(res => {
            this.setState({
              loading: false,
            });
            // this.context.router.push(this.state.PayRequisitionDetail.url.replace(':id', res.data.id));
            this.props.dispatch(
              routerRedux.push({
                pathname: `/pre-payment/me-pre-payment/pre-payment-detail/${res.data.id}/:flag`,
              })
            );
          })
          .catch(e => {
            console.log(e);
            message.error(`保存失败，${e.response.data.message}`);
            this.setState({
              loading: false,
            });
          });
      }
    });
  };
  //取消
  onCancel = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/pre-payment/my-pre-payment`,
      })
    );
  };

  onBack = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/pre-payment/me-pre-payment/pre-payment-detail/${this.props.match.params.id}/prePayment`,
      })
    );
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      model,
      loading,
      fileList,
      departmentId,
      pageLoading,
      user,
      contractTypeDisabled,
      isNew,
      data,
      unitIdOptions,
      partnerCategoryOptions,
      currencyOptions,
      companyIdOptions,
      contractCategoryOptions,
      selectorItem,
      extraParams,
    } = this.state;
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
    return (
      <div className="new-contract " style={{ marginBottom: '10px' }}>
        <Spin spinning={pageLoading}>
          <Form onSubmit={this.handleSave}>
            <Row {...rowLayout}>
              <Col span={10}>
                <FormItem label="申请人" {...formItemLayout}>
                  {getFieldDecorator('employeeId', {
                    rules: [
                      {
                        required: true,
                        message: '请选择',
                      },
                    ],
                    initialValue: this.props.user.fullName,
                  })(<Input disabled={true} />)}
                </FormItem>
              </Col>
            </Row>
            <Row {...rowLayout}>
              <Col span={10}>
                <FormItem label="公司" {...formItemLayout}>
                  {getFieldDecorator('companyId', {
                    rules: [
                      {
                        required: true,
                        message: this.$t('common.please.select'),
                      },
                    ],
                    
                    initialValue: isNew
                      ? [{ id: this.props.user.companyId, name: this.props.user.companyName }]
                      : model.id?[{ id: model.companyId, name: model.companyName }]:[],
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
                    rules: [
                      {
                        required: true,
                        message: this.$t('common.please.select'),
                      },
                    ],
                    initialValue:isNew
                      ? [
                          {
                            departmentOid: this.props.user.departmentOID,
                            departmentId: departmentId,
                            path: this.props.user.departmentName,
                          },
                        ]
                      : model.id?[
                          {
                            departmentOid: model.unitOid,
                            departmentId: model.unitId,
                            path: model.path,
                          },
                        ]:[],
                  })(
                    <Chooser
                      type="department_document"
                      labelKey="path"
                      valueKey="departmentOid"
                      single={true}
                      listExtraParams={{ tenantId: this.props.user.tenantId }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...rowLayout}>
              <Col span={10}>
                <FormItem label="备注" {...formItemLayout}>
                  {getFieldDecorator('description', {
                    rules: [
                      {
                        required: true,
                        message: '请输入',
                      },
                    ],
                    initialValue: isNew ? '' : model.description,
                  })(<Input.TextArea placeholder="请输入" />)}
                </FormItem>
              </Col>
            </Row>
            {/* //附件信息 */}
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
                      defaultOIDs={model.attachmentOids}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>

            {/* <div style={{textAlign: "center"}}>
              <Button type="primary" htmlType="submit" loading={loading} style={{ margin: '0 20px' }}>{isNew ? "下一步" : "确定"}</Button>
              <Button onClick={this.onCancel}>取消</Button>
            </div> */}
            <Affix
              offsetBottom={0}
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
                {this.props.match.params.id === '0'? '下一步' : '确定'}
              </Button>
              {this.props.match.params.id === '0' ? <Button onClick={this.onCancel}>取消</Button>:<Button onClick={this.onBack}>返回</Button>}
            </Affix>
          </Form>
        </Spin>
      </div>
    );
  }
}
// MyNewPrePayment.contextTypes = {
//   router: React.PropTypes.object
// }
const wrappedMyNewPrePayment = Form.create()(MyNewPrePayment);

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
  { withRef: true }
)(wrappedMyNewPrePayment);
