/**
 * Created by seripin on 2018/1/25.
 */
import React from 'react';
import { connect } from 'dva';
import {
  Form,
  Card,
  Input,
  Row,
  Col,
  Affix,
  Button,
  DatePicker,
  Select,
  InputNumber,
  message,
  Spin,
} from 'antd';
import paymentRequisitionService from './paymentRequisitionService.service';
import moment from 'moment';
const FormItem = Form.Item;
const Option = Select.Option;
import config from 'config';
import httpFetch from 'share/httpFetch';
import Upload from 'widget/upload';
import Chooser from 'containers/pre-payment/my-pre-payment/chooser';
import { routerRedux } from 'dva/router';

class NewPaymentRequisition extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageLoading: false,
      user: {},
      unitId: '', //部门ID
      acpReqTypeId: '',
      loading: false,
      myPaymentRequisition: '/payment-requisition/my-payment-requisition', //我的付款申请单
      isNew: true,
      headerData: {},
      myPaymentRequisitionDetail:
        '/payment-requisition/my-payment-requisition/payment-requisition-detail/:id', //付款申请单详情
      uploadOIDs: [], //上传附件的OIDs
      fileList: [],
    };
  }

  componentWillMount() {
    console.log(this.props.user.departmentOID)
    if (this.props.match.params.id === '0') {
      this.setState({ pageLoading: true });
      httpFetch
        .get(`${config.baseUrl}/api/departments/${this.props.user.departmentOID}`)
        .then(res => {
          this.setState({
            unitId: res.data.id,
            user: this.props.user,
            pageLoading: false,
            acpReqTypeId: this.props.match.params.typeId,
          });
        })
        .catch(() => {
          this.setState({ pageLoading: false });
          message.error(
            this.$t( 'common.error'  /*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*/)
          );
        });
    } else {
      this.setState({ pageLoading: true });
      paymentRequisitionService
        .quertHeaderById(this.props.match.params.id)
        .then(res => {
          if (res.status === 200) {
            let fileList = [];
            if (res.data.attachments) {
              res.data.attachments.map(item => {
                fileList.push({
                  ...item,
                  uid: item.id,
                  name: item.fileName,
                  status: 'done',
                });
              });
            }
            this.setState({
              headerData: res.data,
              pageLoading: false,
              isNew: false,
              fileList,
            });
          }
        })
        .catch(() => {
          this.setState({
            pageLoading: false,
          });
          message.error(
            this.$t( 'common.error'  /*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*/)
          );
        });
    }
  }

  // 取消
  onCancel = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: this.state.myPaymentRequisition,
      })
    );
  };
  // 跳转到我的付款申请单详情
  onSuccess = () => {
    let headerData = this.state.headerData;
    let url = this.state.myPaymentRequisitionDetail.replace(':id', headerData.id);
    this.props.dispatch(
      routerRedux.push({
        pathname: url,
      })
    );
  };
  //上传附件
  handleUpload = OIDs => {
    this.setState({
      uploadOIDs: OIDs.join(','),
    });
  };
  // 确定
  handleSave = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        let http;
        if (this.state.isNew) {
          let params = {
            ...values,
            unitId: values.unitId[0].departmentId,
            acpReqTypeId: this.state.acpReqTypeId,
            employeeId: this.state.user.id,
            companyId: values.companyId[0].id,
            requisitionDate: moment(new Date()),
            description: values.description,
            functionAmount: 0,
            attachmentOid: this.state.uploadOIDs.length > 0 ? this.state.uploadOIDs : '',
          };
          http = paymentRequisitionService.createHeader(params);
        } else {
          let params = this.state.headerData;
          params['requisitionDate'] = moment(new Date());
          params['description'] = values.description;
          params['unitId'] = values.unitId[0].departmentId;
          params['unitOid'] = values.unitId[0].departmentOid;
          params['companyId'] = values.companyId[0].id;
          params['attachmentOid'] = this.state.uploadOIDs.length > 0 ? this.state.uploadOIDs : '';
          http = paymentRequisitionService.saveFunc(params);
        }
        http
          .then(res => {
            this.setState({ loading: false, headerData: res.data }, () => {
              this.onSuccess();
            });
            message.success(this.$t({ id: 'common.save.success' }, { name: '' }));
          })
          .catch(e => {
            message.error(
              this.$t('common.save.filed'  /*保存失败*/) + e.response.data.message
            );
            this.setState({ loading: false });
          });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { user, pageLoading, loading, isNew, headerData, fileList, unitId } = this.state;
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
      <div className="new-contract" style={{ marginBottom: '10px' }}>
        <Spin spinning={pageLoading}>
          <Form onSubmit={this.handleSave}>
            <Row {...rowLayout}>
              <Col span={10}>
                <FormItem
                  label={this.$t( 'acp.employeeName'  /*申请人*/)}
                  {...formItemLayout}
                >
                  {getFieldDecorator('employeeId', {
                    rules: [
                      {
                        required: true,
                        message: this.$t(
                           'common.can.not.be.empty' ,
                          { name: this.$t( 'acp.employeeName'  /*申请人*/) } /*不能为空*/
                        ),
                      },
                    ],
                    initialValue: isNew ? this.props.user.fullName : headerData.employeeName,
                  })(<Input disabled={true} />)}
                </FormItem>
              </Col>
            </Row>
            <Row {...rowLayout}>
              <Col span={10}>
                <FormItem label={this.$t( 'acp.company' /*公司*/)} {...formItemLayout}>
                  {getFieldDecorator('companyId', {
                    rules: [
                      {
                        required: true,
                        message: this.$t(
                           'common.can.not.be.empty' ,
                          { name: this.$t('acp.company'  /*公司*/) } /*不能为空*/
                        ),
                      },
                    ],
                    initialValue: isNew
                      ? [{ id: this.props.user.companyId, name: this.props.user.companyName }]
                      : [{ id: headerData.companyId, name: headerData.companyName }],
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
                <FormItem label={this.$t( 'acp.unitName'  /*部门*/)} {...formItemLayout}>
                  {getFieldDecorator('unitId', {
                    rules: [
                      {
                        required: true,
                        message: this.$t(
                          'common.can.not.be.empty' ,
                          { name: this.$t( 'acp.unitName'  /*部门*/) } /*不能为空*/
                        ),
                      },
                    ],
                    initialValue: isNew
                      ? [
                          {
                            departmentOid: this.props.user.departmentOID,
                            departmentId: unitId,
                            name: this.props.user.departmentName,
                          },
                        ]
                      : [
                          {
                            departmentOid: headerData.unitOid,
                            departmentId: headerData.unitId,
                            name: headerData.unitName,
                          },
                        ],
                  })(
                    <Chooser
                      type="department_document"
                      labelKey="name"
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
                <FormItem label={this.$t('acp.remark'  /*备注*/)} {...formItemLayout}>
                  {getFieldDecorator('description', {
                    rules: [
                      {
                        required: true,
                        message: this.$t(
                          'common.can.not.be.empty' ,
                          { name: this.$t('acp.description'  /*事由说明*/) } /*不能为空*/
                        ),
                      },
                    ],
                    initialValue: isNew ? '' : headerData.description,
                  })(<Input.TextArea />)}
                </FormItem>
              </Col>
            </Row>
            {/* 附件信息 */}
            <Row {...rowLayout}>
              <Col span={10}>
                <FormItem label={this.$t( 'acp.fileInfo'  /*附件信息*/)} {...formItemLayout}>
                  {getFieldDecorator('attachmentOID')(
                    <Upload
                      attachmentType="PAYMENT"
                      fileNum={9}
                      uploadHandle={this.handleUpload}
                      defaultFileList={fileList}
                      defaultOIDs={headerData.attachmentOids}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
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
                {isNew
                  ? this.$t( 'acp.next' /*下一步*/)
                  : this.$t( 'common.ok'  /*确定*/)}
              </Button>
              <Button onClick={this.onCancel} loading={loading}>
                {this.$t( 'common.cancel'  /*取消*/)}
              </Button>
            </Affix>
          </Form>
        </Spin>
      </div>
    );
  }
}

//金额过滤
// React.Component.prototype.filterMoney = (money, fixed = 2) => {
//     let numberString = Number(money || 0).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
//     numberString += (numberString.indexOf('.') > -1 ? '' : '.00');
//     return <span className="money-cell">{numberString}</span>;
// };


const wrappedNewPaymentRequisition = Form.create()(NewPaymentRequisition);

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company,
    languages: state.languages,
  };
}
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedNewPaymentRequisition);
