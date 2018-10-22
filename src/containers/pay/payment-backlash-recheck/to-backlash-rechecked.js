import React from 'react'
import { Form, Button, Input, Card,Affix, Row, Col, Select, InputNumber, DatePicker, message, Tag, Modal } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
import backlashService from './pay-backlash-recheck.service'
import config from 'config'
import { connect } from 'dva'
import { routerRedux } from 'dva/router';
import ApproveHistory from "containers/pay/payment-backlash/approve-history-work-flow"
import { Alert } from 'antd';
import PayDetail from 'containers/pay/pay-workbench/payment-detail' //支付详情
import PrepaymentDetail from 'containers/pre-payment/my-pre-payment/pre-payment-detail' //预付款详情
import Upload from 'widget/upload-button';

class ToRechecked extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            queryFlag: true,
            draweeAccountNumber: [],
            payeeAccountNumber: [],
            currencyList: [],//币种
            data: {},
            abledRefundAmount: 0,
            showDetail: false,
            detailFlag: '',
            documentInfo: {},
            sourceDetail: {},
            backlashDetail: {},
            backlashFlag: false,
            detailId: undefined,
            saveData: {},//保存后返回新的支付数据
            saveFlag: false,//是否已经保存
            btnLoading: false,//按钮加载
            showButtonFlag:true,
            passLoading: false,
            rejectLoading: false,
            approveHistory:[],
            approvedBy:{},
            operationDetail:{},
            showChild:false,
            uploadOIDs: [], //上传附件的OIDs
            fileList: [],
            fileShow:false,
        }
    }

    componentWillMount() {
    }

    componentDidMount () {
      const record = this.props.params.record;
        this.setState({ formLoading: true });

        backlashService.getBacklashDTOBybacklashDetailId(record.backDetail.id).then(
          res => {
            if (res.status === 200) {
              let data = {};
              let documentInfo = {};
              let sourceDetail = {};
              let backlashDetail = {};
              data = res.data || {};
              documentInfo = data.payDocumentDTO;
              sourceDetail = data.detail;
              backlashDetail = data.backDetail;
              let fileList = [];
              if (backlashDetail.backlashAttachments) {
                backlashDetail.backlashAttachments.map(item => {
                  fileList.push({
                    ...item,
                    uid: item.id,
                    name: item.fileName,
                    status:"done"
                  })
                })
              }
              if(backlashDetail){
                if(backlashDetail.paymentStatus === "N"){//如果是编辑中，则可以发起反冲

                  this.setState({
                    queryFlag: false,
                    data: data,
                    documentInfo: documentInfo,
                    sourceDetail: sourceDetail,
                    backDetail: backlashDetail,
                    showDetail:true,
                    uploadOIDs:backlashDetail.backlashAttachmentOID,
                    fileList:fileList,
                  });
                }else{//其他状态则隐藏下部4个按钮

                  this.setState({
                    queryFlag: false,
                    data: data,
                    documentInfo: documentInfo,
                    sourceDetail: sourceDetail,
                    backlashDetail:backlashDetail,
                    showDetail:true,
                    showButtonFlag:false,
                    uploadOIDs:backlashDetail.backlashAttachmentOID,
                    fileList:fileList,
                  });

                }
              }else{

                this.setState({
                  queryFlag: false,
                  data: data,
                  documentInfo: documentInfo,
                  sourceDetail: sourceDetail,
                });
              }
              this.getApproveHistory();
            }
          }
        ).catch(e => {
          this.setState({
            queryFlag: false,
          });
          message.error(this.$t({id: 'pay.backlash.getPayDetailError'}));
        });

    }

  //通过
  handleApprovePass = (remark) => {

    const { id } = this.state.backlashDetail;

    this.setState({ loading: true });

    if(!remark){
      remark = "";
    }
    // remark = remark == 'undefined'?'':remark;
    return;
    backlashService.updateBacklashStatusByDetailId(id, remark, "S").then(res => {
      if (res.status === 200) {
          message.success(this.$t({id: 'pay.backlash.passSuccess'}));
          this.setState({ loading: false });
          this.onCancel(true)
      }
    }).catch(e => {
      this.setState({ loading: false });
      message.error(`${e.response.data.message}`)
    })
  };

  //上传附件
  handleUpload = (OIDs) => {
    this.setState({ uploadOIDs: OIDs })
  };

  //不通过
  handleApproveReject = (remark) => {

    const { id } = this.state.backlashDetail;

    this.setState({ loading: true });
    // remark = remark=='undefined'?'':remark;
    if(!remark){
      remark=" ";
    }
    backlashService.updateBacklashStatusByDetailId(id, remark, "F").then(res => {
      if (res.status === 200) {
        message.success(this.$t({id: 'pay.backlash.rejectSuccess'}));
        this.setState({ loading: false });
        this.onCancel(true)
      }
    }).catch(e => {
      this.setState({ loading: false });
      message.error(`${e.response.data.message}`)
    })
  };

    onCancel = (flag) => {
        this.props.onClose(flag);
        this.setState({
            showButtonFlag:true,
            showDetail:false
        })

    };


    //查看支付流水详情
    viewPayDetail = (id) => {
        this.setState({
            showChild: true,
            detailId: id,
            detailFlag: 'PAYDETAIL'
        })
    };

    //查看单据详情
    viewDocumentDetail = (id, documentCategory) => {
        this.setState({
            showChild: true,
            detailId: id,
            detailFlag: 'DECUMENT'
        })
    };

    //弹出框关闭
    onClose = () => {
        this.setState({
            showChild: false
        })
    };


    //点击提交
    onSubmit = () => {
        const a = this;
        Modal.confirm({
          title: a.$t({id: 'pay.backlash.sureBacklash'}),
          content: a.$t({id: 'pay.backlash.needChecked'}),
          okText: a.$t({id: 'pay.backlash.ok'}),
          cancelText: a.$t({id: 'pay.backlash.cancel'}),
            onOk:()=> {
                 let backDetail = a.state.backDetail;
                 let backDetailId = backDetail.id;

                 backlashService.submitBacklash(backDetailId).then(
                    res => {
                        if (res.status === 200) {
                            //提交成功后进入反冲查询页面，暂时不跳
                          message.success(a.$t({id: 'pay.backlash.submitSuccess'}))
                          a.onCancel(true);
                        }
                    }
                 )


            },
            onCancel() { },
        });
    };


  getApproveHistory = () => {

    this.setState({
      historyLoading: true
    });

    let id = this.state.backlashDetail.id;

    backlashService.getBacklashHistory(id).then(res => {


      this.setState({ historyLoading: false }, () => {
        let approvedBy = "";
        let operationDetail="";

          for(let i=0;i<res.data.length;i++){


            if(res.data[i].operation === 1004) {


              approvedBy = res.data[i].employeeName
              operationDetail =res.data[i].operationDetail


              }
          }

        this.setState({
          approveHistory: res.data,
          approvedBy:approvedBy,
          operationDetail:operationDetail
        })
      })
    }).catch(error => {
      message.error(this.$t({id: 'pay.backlash.getHistoryError'}));
      this.setState({ historyLoading: false });
    })

  };
  /**
   * 组装方法
   * @param content 内部组件
   * @return {*} 给组件添加this.props.close(params)方法,params为返回到最外层的值
   *             同时添加外部传入的props为内部组件可用
   */
  wrapClose = (content) =>{
    let id = this.state.detailId;
    const newProps = {
      params: {id : id, refund : true}
    };
    return React.createElement(content, Object.assign({}, newProps.params, newProps));
  };

    //点击删除
    onDelete = () => {
        const a = this;
        Modal.confirm({
          title: a.$t({id: 'pay.backlash.sureDelete'}),
          content: a.$t({id: 'pay.backlash.afterDeleteDesc'}),
          okText: a.$t({id: 'pay.backlash.ok'}),
          cancelText: a.$t({id: 'pay.backlash.cancel'}),
            onOk:()=> {
                let backDetail = a.state.backDetail;
                loading:true

                let backDetailId = backDetail.id;
                backlashService.deleteBacklashDetailById(backDetailId).then(
                    response=>{
                        if(response.status ===200){
                          message.success(a.$t({id: 'pay.backlash.deleteSuccess'}))

                            //删除成功以后回到发起反冲页面
                            a.setState({
                                showDetail:false
                            }).catch(() => {
                                a.setState({
                                    loading: false,
                                });
                              message.error(a.$t({id: 'pay.backlash.deleteError'}));

                            });
                            let detail = a.state.detail;
                            let detailId = detail.id;
                            backlashService.getReadyByDetailId(detailId).then(
                                res => {
                                    if (res.status === 200) {
                                        loading:false
                                        let data = {};
                                        let documentInfo = {};
                                        let sourceDetail = {};
                                        data = res.data || {};
                                        documentInfo = data.payDocumentDTO;
                                        sourceDetail = data.detail;
                                        a.setState({
                                            queryFlag: false,
                                            data: data,
                                            documentInfo: documentInfo,
                                            sourceDetail: sourceDetail
                                        });
                                    }
                                }
                            ).catch(e => {
                                a.setState({
                                    queryFlag: false,
                                });
                              message.error(a.$t({id: 'pay.backlash.getPayDetailError'}));
                            });


                        }
                    }
                );
            },
            onCancel() { },
        });

    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const { documentInfo, sourceDetail,fileList,showChild, backlashDetail,detailFlag ,  showDetail,approveHistory,approvedBy,operationDetail } = this.state;
        const limitDecimals = (value) => {
            const reg = /^(\-)*(\d+)\.(\d\d).*$/;
            if (typeof value === 'string') {
                return !isNaN(Number(value)) ? value.replace(reg, '$1$2.$3') : ''
            } else if (typeof value === 'number') {
                return !isNaN(value) ? String(value).replace(reg, '$1$2.$3') : ''
            } else {
                return ''
            }
        };



        return (


            <div className="new-payment-requisition-line">
              <Alert
                message={this.$t({id: 'pay.backlash.backlashAmount'})+backlashDetail.currency + backlashDetail.amount }
                description={this.$t({id: 'pay.backlash.pass'})}
                type="success"
                showIcon
              />
                <Form >
                    <div className="common-item-title">{this.$t({id: 'pay.backlash.documentDetail'})}</div>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id: 'pay.backlash.documentNumber'})}>
                                <span className="ant-form-text"><a onClick={() => {this.viewDocumentDetail(documentInfo.documentId,documentInfo.documentCategory)}}>{documentInfo.documentCode}</a></span>
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id: 'pay.backlash.documentTypeId'})}>
                                <span className="ant-form-text">{documentInfo.documentTypeName}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id: 'pay.backlash.submitDate'})}>
                                <span className="ant-form-text">{(String)(documentInfo.documentDate).substr(0, 10)}</span>
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id: 'pay.backlash.employeeName'})}>
                                <span className="ant-form-text">{documentInfo.documentApplicant}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    <div className="common-item-title">{this.$t({id: 'pay.backlash.sourcePay'})}</div>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id: 'pay.backlash.sourceBacklashCode'})}>
                                <span className="ant-form-text"><a onClick={() => {this.viewPayDetail(sourceDetail.id)}}>{sourceDetail.billcode}</a>
                                </span>
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id: 'pay.backlash.payDate'})}>
                                <span className="ant-form-text">{(String)(sourceDetail.payDate).substr(0, 10)}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id: 'pay.backlash.amount'})}>
                                <span className="ant-form-text">{sourceDetail.currency} {sourceDetail.amount}</span>
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id: 'pay.backlash.rate'})}>
                                <span className="ant-form-text">{sourceDetail.exchangeRate}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id: 'pay.backlash.sign'})}>
                                <span className="ant-form-text">{sourceDetail.partnerName}</span>
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id: 'pay.backlash.signAccount'})}>
                                <span className="ant-form-text">{sourceDetail.payeeAccountNumber}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id: 'pay.backlash.signAccountName'})}>
                                <span className="ant-form-text">{sourceDetail.payeeAccountName}</span>
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id: 'pay.backlash.payAccount'})}>
                                <span className="ant-form-text">{sourceDetail.draweeAccountNumber}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id: 'pay.backlash.payAccountName'})}>
                                <span className="ant-form-text">{sourceDetail.draweeAccountName}</span>
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id: 'pay.backlash.paymentMethod'})}>
                                <span className="ant-form-text">{sourceDetail.paymentTypeName}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={20} offset={1}>
                            <FormItem label={this.$t({id: 'pay.backlash.backlashRemark'})}>
                                <span className="ant-form-text">{sourceDetail.remark}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    {
                        showDetail && <div>
                            <div className="common-item-title">{this.$t({id: 'pay.backlash.backlashinfo'})}</div>
                            <Row>
                                <Col span={10} offset={1}>
                                    <FormItem label={this.$t({id: 'pay.backlash.backlashCode'})}>
                                        <span className="ant-form-text"><a onClick={() => {this.viewPayDetail(backlashDetail.id)}}>{backlashDetail.billcode}</a>
                                        </span>
                                    </FormItem>
                                </Col>
                                <Col span={10} offset={1}>
                                    <FormItem label={this.$t({id: 'pay.backlash.payDate'})}>
                                        <span className="ant-form-text">{(String)(backlashDetail.payDate).substr(0, 10)}</span>
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={10} offset={1}>
                                    <FormItem label={this.$t({id: 'pay.backlash.amountOnly'})}>
                                        <span className="ant-form-text">{backlashDetail.currency} {backlashDetail.amount}</span>
                                    </FormItem>
                                </Col>
                                <Col span={10} offset={1}>
                                    <FormItem label={this.$t({id: 'pay.backlash.rate'})}>
                                        <span className="ant-form-text">{backlashDetail.exchangeRate}</span>
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={10} offset={1}>
                                    <FormItem label={this.$t({id: 'pay.backlash.sign'})}>
                                        <span className="ant-form-text">{backlashDetail.partnerName}</span>
                                    </FormItem>
                                </Col>
                                <Col span={10} offset={1}>
                                    <FormItem label={this.$t({id: 'pay.backlash.signAccount'})}>
                                        <span className="ant-form-text">{backlashDetail.payeeAccountNumber}</span>
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={10} offset={1}>
                                    <FormItem label={this.$t({id: 'pay.backlash.signAccountName'})}>
                                        <span className="ant-form-text">{backlashDetail.payeeAccountName}</span>
                                    </FormItem>
                                </Col>
                                <Col span={10} offset={1}>
                                    <FormItem label={this.$t({id: 'pay.backlash.payAccount'})}>
                                        <span className="ant-form-text">{backlashDetail.draweeAccountNumber}</span>
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={10} offset={1}>
                                    <FormItem label={this.$t({id: 'pay.backlash.payAccountName'})}>
                                        <span className="ant-form-text">{backlashDetail.draweeAccountName}</span>
                                    </FormItem>
                                </Col>
                                <Col span={10} offset={1}>
                                    <FormItem label={this.$t({id: 'pay.backlash.paymentMethod'})}>
                                        <span className="ant-form-text">{backlashDetail.paymentTypeName}</span>
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row>
                              <Col span={20} offset={1}>
                                <FormItem label={this.$t({id: 'pay.backlash.backlashRemark'})}>
                                  <span className="ant-form-text">{backlashDetail.remark}</span>
                                </FormItem>
                              </Col>
                              <Col span={12} offset={0}>
                                <Upload attachmentType="PAYMENT"
                                        noDelete={true}
                                        fileNum={99}
                                        multiple={true}
                                        disabled={true}
                                        defaultOIDs={this.state.uploadOIDs}
                                        uploadHandle={this.handleUpload}
                                        defaultFileList={fileList}
                                />
                              </Col>
                            </Row>
                        </div>}

                  <div style={{ padding: 20, paddingBottom: 70 }}>
                    <ApproveHistory loading={this.state.historyLoading} infoData={this.state.approveHistory}></ApproveHistory>
                  </div>

                  <Affix offsetBottom={0} className="bottom-bar bottom-bar-approve"
                         style={{
                           position: 'fixed', bottom: 0, marginLeft: '-10px', width: '100%', height: '50px',
                         }}
                  >

                    <Row>

                      <Col span={4}>
                        <Button onClick={()=>{this.onCancel(false)}} >{this.$t({ id: "common.back" }/*返回*/)}</Button>
                      </Col>
                    </Row>
                  </Affix>

                  <Modal visible={showChild}
                         footer={[
                           <Button key="back" size="large" onClick={()=>{this.onClose(false)}}>{this.$t({id: 'pay.backlash.goback'})}</Button>
                         ]}
                         width={1200}
                         closable={false}
                         onCancel={()=>{this.onClose(false)}}>
                    <div >
                      { detailFlag === 'PAYDETAIL'? this.wrapClose(PayDetail):this.wrapClose(PrepaymentDetail) }
                    </div>
                  </Modal>

                </Form>
            </div>

        )
    }
}

const wrappedNewPayRefund = Form.create()(ToRechecked);

export default wrappedNewPayRefund;
