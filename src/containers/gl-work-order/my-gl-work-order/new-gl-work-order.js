import React, { Component } from 'react';
import { connect } from 'dva';
import config from 'config';
import { Form, Button, message, Badge, Select, Row, Col, Icon, Input, Affix } from 'antd';
const Search = Input.Search;
const FormItem = Form.Item;
const Option = Select.Option;
const TextArea = Input.TextArea;
import myGLWorkOrderService from 'containers/gl-work-order/my-gl-work-order/my-gl-work-order.service';
import moment from 'moment';
import Chooser from 'widget/chooser';
import Upload from 'widget/upload';
import { routerRedux } from 'dva/router';

class NewGLWorkOrder extends Component {
  /**
   * 构造函数
   */
  constructor(props) {
    super(props);
    this.state = {
      //当前头数据
      orderData: {},
      //币种集合
      currencyList: [],
      //加载状态
      loading: false,
      /**
       * 附件信息
       */
      defaultFileList: [],
      uploadOIDs: [],
      //是否新建
      isNew : true,
    };
  }
  /**
   * 生命周期函数
   */
  componentWillMount = () => {
    this.getDepartmentId();
    this.getCurrency();
    this.getHeaderData();
  };
  /**
   * 获取单据头信息根据头id
   */
  getHeaderData = () => {
    //编辑时
    if (this.props.match.params.id && this.props.match.params.id != ':id') {
      myGLWorkOrderService
        .getHeaderData(this.props.match.params.id)
        .then(res => {
          if (res.status === 200) {
            let defaultFileList = [];
            res.data.head.attachments.map(item => {
              if (!item.uid) {
                item.uid = item.attachmentOID;
                item.name = item.fileName;
                item.status = 'done';
                item.type = item.fileType;
                item.thumbUrl = item.thumbnailUrl;
                defaultFileList.push(item);
              } else {
                defaultFileList.push(item);
              }
            });
            let orderData = res.data.head;
            this.setState({
              orderData,
              defaultFileList,
              uploadOIDs: res.data.head.attachmentOids,
              isNew : false,
            });
            //由于initialValue只处理一次，它可能比接口处理的快，所以针对这种情况要单独处理一下
            this.props.form.setFieldsValue({
              companyId: [{ id: orderData.companyId, name: orderData.companyName }],
              unitId: [
                {
                  departmentOid: orderData.unitOid,
                  departmentId: orderData.unitId,
                  path: orderData.unitName,
                },
              ],
            });
          }
        })
        .catch(e => {
          console.log(`获取核算工单头信息失败：${e}`);
        });
    }
  };
  /**
   * 根据departmentOID获取departmentId
   */
  getDepartmentId = () => {
    myGLWorkOrderService
      .getDepartmentId(this.props.user.departmentOID)
      .then(res => {
        if (res.status === 200) {
          let departmentId = res.data.id;
          this.props.form.setFieldsValue({
            unitId: [
              {
                departmentOid: this.props.user.departmentOID,
                departmentId: departmentId,
                path: this.props.user.departmentName,
              },
            ],
          });
        }
      })
      .catch(e => {
        console.log(`获取部门id失败：${e}`);
      });
  };
  /**
   * 获取币种
   */
  getCurrency = () => {
    let setOfBooksId = this.props.company.setOfBooksId;
    let tenantId = this.props.company.tenantId;
    myGLWorkOrderService
      .getCurrency(setOfBooksId, tenantId)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            currencyList: res.data.rows,
          });
        }
      })
      .catch(e => {
        console.log(`获取币种集合失败：${e}`);
      });
  };
  /**
   * 上传附件
   */
  handleUpload = OIDs => {
    console.log(OIDs);
    this.setState({
      uploadOIDs: OIDs,
    });
  };
  /**
   * 保存
   */
  handleSave = e => {
    e.preventDefault();
    this.setState({ loading: true });
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let { currencyList, uploadOIDs, orderData } = this.state;
        let nowCurrencyObj = currencyList.find(item => item.currencyCode === values.currency.key);
        let params = {
          ...orderData,
          id: orderData.id ? orderData.id : null,
          tenantId: this.props.company.tenantId,
          workOrderTypeId: orderData.id
            ? orderData.workOrderTypeId
            : this.props.match.params.typeId,
          ifWorkflow:
            (orderData.id ? orderData.formOid : this.props.match.params.formOid) === 0
              ? false
              : true,
          formOid: orderData.id ? orderData.formOid : this.props.match.params.formOid,
          attachmentOids: uploadOIDs,
          companyId: values.companyId[0].id,
          unitId: values.unitId[0].departmentId,
          employeeId: this.props.user.id,
          remark: values.remark,
          currency: values.currency && values.currency.key,
          exchangeRate: nowCurrencyObj.rate,
        };
        if (orderData.id) {
          params.versionNumber = orderData.versionNumber;
          params.status = orderData.status;
          params.documentOid = orderData.documentOid;
        }
        myGLWorkOrderService
          .orderInsert(params)
          .then(res => {
            if (res.status === 200) {
              this.setState({ loading: false });
              message.success('保存成功');
              //跳转到详情界面
              // this.context.router.push(menuRoute.getRouteItem('my-gl-work-order-detail', 'key').url.replace(':id', res.data.id).replace(':oid', res.data.documentOid));
              this.props.dispatch(
                routerRedux.push({
                  pathname: `/gl-work-order/my-gl-work-order/my-gl-work-order-detail/${
                    res.data.id
                  }/${res.data.documentOid}`,
                })
              );
            }
          })
          .catch(e => {
            console.log(`保存失败：${e}`);
            if (e.response) {
              message.error(`保存失败：${e.response.data.message}`);
            }
            this.setState({ loading: false });
          });
      } else {
        this.setState({ loading: false });
      }
    });
  };
  /**
   * 取消
   */
  onCancel = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/gl-work-order/my-gl-work-order`,
      })
    );
  };

  onBack = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/gl-work-order/my-gl-work-order/my-gl-work-order-detail/${this.props.match.params.id}/${this.props.match.params.formOid}`,
      })
    );
  };
  /**
   * 渲染函数
   */
  render() {
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
    const { getFieldDecorator } = this.props.form;
    //当前的头数据
    const { orderData } = this.state;
    //币种集合
    const { currencyList } = this.state;
    //附件信息
    const { defaultFileList } = this.state;
    //加载状态
    const { loading } = this.state;
    //是否新建
    const { isNew } = this.state;
    return (
      <div>
        <Form onSubmit={this.handleSave}>
          <Row {...rowLayout}>
            <Col span={10}>
              <FormItem {...formItemLayout} label="申请人">
                {getFieldDecorator('employeeId', {
                  rules: [
                    {
                      required: true,
                    },
                  ],
                  initialValue: this.props.user.fullName,
                })(<Input disabled />)}
              </FormItem>
            </Col>
          </Row>
          <Row {...rowLayout}>
            <Col span={10}>
              <FormItem {...formItemLayout} label="公司">
                {getFieldDecorator('companyId', {
                  rules: [
                    {
                      required: true,
                      message: this.$t({ id: 'common.please.select' }),
                    },
                  ],
                  initialValue: orderData.id
                    ? [{ id: orderData.companyId, name: orderData.companyName }]
                    : [{ id: this.props.user.companyId, name: this.props.user.companyName }],
                })(
                  <Chooser
                    type="accounting_company"
                    labelKey="name"
                    valueKey="id"
                    single={true}
                    listExtraParams={{ 
                      setOfBooksId: this.props.company.setOfBooksId,
                      workOrderTypeId: this.props.match.params.typeId
                     }}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row {...rowLayout}>
            <Col span={10}>
              <FormItem {...formItemLayout} label="部门">
                {getFieldDecorator('unitId', {
                  rules: [
                    {
                      required: true,
                      message: this.$t({ id: 'common.please.select' }),
                    },
                  ],
                  initialValue: orderData.id
                    ? [
                        {
                          departmentOid: orderData.unitOid,
                          departmentId: orderData.unitId,
                          path: orderData.unitName,
                        },
                      ]
                    : [],
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
              <FormItem {...formItemLayout} label="币种">
                {getFieldDecorator('currency', {
                  rules: [
                    {
                      required: true,
                      message: this.$t({ id: 'common.please.select' }),
                    },
                  ],
                  initialValue: {key:orderData.id ? orderData.currency : this.props.company.baseCurrency,label:orderData.id ? orderData.currency-orderData.currencyName : this.props.company.baseCurrency-this.props.company.baseCurrencyName},
                })(
                  <Select placeholder="请选择" disabled={Boolean(orderData.id)} labelInValue>
                    {currencyList.map(item => {
                      return <Option value={item.currencyCode}>{item.currencyCode}-{item.currencyName}</Option>;
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row {...rowLayout}>
            <Col span={10}>
              <FormItem {...formItemLayout} label="备注">
                {getFieldDecorator('remark', {
                  rules: [
                    {
                      required: true,
                      message: '请输入',
                    },
                  ],
                  initialValue: orderData.id ? orderData.remark : '',
                })(<TextArea placeholder="请输入" />)}
              </FormItem>
            </Col>
          </Row>
          <Row {...rowLayout} style={{ marginBottom: '40px' }}>
            <Col span={10}>
              <FormItem {...formItemLayout} label="附件信息">
                {getFieldDecorator('attachmentOID')(
                  <Upload
                    attachmentType="GL_WORK_ORDER"
                    uploadUrl={`${config.baseUrl}/api/upload/static/attachment`}
                    fileNum={9}
                    uploadHandle={this.handleUpload}
                    defaultFileList={defaultFileList}
                    defaultOIDs={orderData.attachmentOids}
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
            <Button type="primary" htmlType="submit" loading={loading} style={{ margin: '0 20px' }}>
              {isNew ? '下一步' : '确定'}
            </Button>
            {isNew ? <Button onClick={this.onCancel}>取消</Button> : <Button onClick={this.onBack}>返回</Button>}
          </Affix>
        </Form>
      </div>
    );
  }
}
// NewGLWorkOrder.contextTypes = {
//     router: React.PropTypes.object
// };
function mapStateToProps(state) {
  return {
    company: state.user.company,
    user: state.user.currentUser,
  };
}
const wrappedNewGLWorkOrder = Form.create()(NewGLWorkOrder);
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedNewGLWorkOrder);
