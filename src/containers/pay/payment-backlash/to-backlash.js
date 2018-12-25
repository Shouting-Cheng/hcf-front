import React from 'react'
import { Form, Button, Input, Card,Affix, Row, Col, Select, InputNumber, DatePicker, message, Tag, Modal } from 'antd'
const FormItem = Form.Item;
const { TextArea } = Input;
import backlashService from './pay-backlash.service'
import { connect } from 'dva'
import { routerRedux } from 'dva/router';
import httpFetch from "share/httpFetch";
import config from 'config'
import PayDetail from 'containers/pay/pay-workbench/payment-detail' //支付详情
import PrepaymentDetail from 'containers/pre-payment/my-pre-payment/pre-payment-detail' //预付款详情
import ApproveHistory from "./approve-history-work-flow"
import { Alert } from 'antd';
import Upload from 'widget/upload-button';
import PropTypes from 'prop-types';
class ToBacklash extends React.Component {
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
            showChild:false,
            detailId: undefined,
            saveData: {},//保存后返回新的支付数据
            saveFlag: false,//是否已经保存
            btnLoading: false,//按钮加载
            showButtonFlag:true,
            historyLoading:false,
            uploadOids: [], //上传附件的Oids
            fileList: [],
            fileShow:false,
            backlashDetailRemark:true,
            alert_message: {},
            alert_des:{},
            alert_type:{},
            alert_warning:false,
            alert_seccuss:false

        }
    }

    componentWillMount() {

    }



  componentDidMount () {
    const record = this.props.params.record;
      let flashFlag = record.flashFlag;
      this.setState({ formLoading: true });

      if(record.backDetail){
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

              if(backlashDetail && !flashFlag){
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
                if(backlashDetail.paymentStatus === "N" || backlashDetail.paymentStatus === "F"){//如果是编辑中或者驳回，则可以发起反冲

                  this.setState({
                    queryFlag: false,
                    data: data,
                    documentInfo: documentInfo,
                    sourceDetail: sourceDetail,
                    backlashDetail: backlashDetail,
                    showDetail:true,
                    backlashDetailRemark:true,
                    fileList:fileList,

                    alert_warning:false,
                    alert_seccuss:false,
                    fileShow:true,
                    uploadOids:backlashDetail.backlashAttachmentOid
                  });

                  this.getApproveHistory();
                }else if(backlashDetail.paymentStatus === "P"){//其他状态则隐藏下部4个按钮，且描述不是输入框
                  this.setState({
                    queryFlag: false,
                    data: data,
                    documentInfo: documentInfo,
                    sourceDetail: sourceDetail,
                    backlashDetail:backlashDetail,
                    showDetail:true,
                    showButtonFlag:false,
                    historyLoading:true,
                    backlashDetailRemark:false,
                    fileList:fileList,
                    alert_warning:true,
                    alert_seccuss:false,
                    fileShow:true,
                    uploadOids:backlashDetail.backlashAttachmentOid
                  });

                  this.getApproveHistory();

                }else if(backlashDetail.paymentStatus === "S"){
                  this.setState({
                    queryFlag: false,
                    data: data,
                    documentInfo: documentInfo,
                    sourceDetail: sourceDetail,
                    backlashDetail:backlashDetail,
                    showDetail:true,
                    showButtonFlag:false,
                    historyLoading:true,
                    backlashDetailRemark:false,
                    fileList:fileList,
                    alert_seccuss:true,
                    alert_warning:false,
                    fileShow:true,
                    uploadOids:backlashDetail.backlashAttachmentOid
                  });

                  this.getApproveHistory();
                }
              }else{
                this.setState({
                  queryFlag: false,
                  data: data,
                  documentInfo: documentInfo,
                  sourceDetail: sourceDetail,
                });
              }

            }
          }
        ).catch(e => {
          this.setState({
            queryFlag: false,
          });
          message.error(this.$t({id: 'pay.backlash.getPayDetailError'}));
        });
      }else {

        this.setState({
          queryFlag: false,
          data: record || {},
          documentInfo: record.payDocumentDTO,
          sourceDetail: record.detail,
        });
      }
  }

  getApproveHistory = () => {

    this.setState({
      historyLoading: true
    });

    let id = this.state.backlashDetail.id;

    backlashService.getBacklashHistory(id).then(res => {
      this.setState({ historyLoading: false }, () => {
        this.setState({ approveHistory: res.data })
      })
    }).catch(error => {
      message.error(this.$t({id: 'pay.backlash.getHistoryError'}));
      this.setState({ historyLoading: false });
    })

  }


    onCancel = (flag) => {
        this.props.onClose(flag);
        this.setState({
            showButtonFlag:true,
            showDetail:false
        })

    };

    //弹出框关闭
    onClose = () => {
        this.setState({
          showChild: false
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

  doBacklash = (e) => {
      e.preventDefault()

      //发起反冲，生成反冲数据
      let detailId = this.state.data.detail.id;
      let data = this.state.data;
      let remarks = this.props.form.getFieldValue("remarks");
      loading:true;

      if (this.state.showDetail) {//添加备注，附件
          let updateParam = {
              "id": data.backDetail.id,
              "remarks": remarks || "",
              "attachmentOidS": this.state.uploadOids
          }

          backlashService.updateByDetailId(updateParam).then(
              res => {
                  if (res.status === 200) {
                      loading:false;
                      message.success(this.$t({id: 'pay.backlash.saveSuccess'}))
                      let data = {};
                      let documentInfo = {};
                      let sourceDetail = {};
                      let backlashDetail = {};
                      data = res.data || {};
                      documentInfo = data.payDocumentDTO;
                      sourceDetail = data.detail;
                      backlashDetail = data.backDetail;
                      this.setState({
                          data: data,
                          documentInfo: documentInfo,
                          sourceDetail: sourceDetail,
                          backlashDetail: backlashDetail,
                          backlashFlag: true,
                          showDetail: true,
                          backlashDetailRemark:true
                      });
                  }
              }
          )

      } else {//发起反冲
          backlashService.getBacklashByDetailId(detailId).then(
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
                      this.setState({
                          data: data,
                          documentInfo: documentInfo,
                          sourceDetail: sourceDetail,
                          backlashDetail: backlashDetail,
                          backlashFlag: true,
                          showDetail: true,
                          backlashDetailRemark:true,
                          fileList:fileList,
                          fileShow:true,

                      });
                  }
              }
          );
      }




  };

  //上传附件
  handleUpload = (Oids) => {
    this.setState({ uploadOids: Oids })
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
                 let backDetail = a.state.backlashDetail;
              let backDetailId = backDetail.id;
                 backlashService.submitBacklash(backDetailId).then(
                    res => {
                        if (res.status === 200) {
                            //提交成功后进入反冲查询页面，暂时不跳
                            message.success(a.$t({id: 'pay.backlash.submitSuccess'}))
                            a.onCancel(true)
                        }
                    }
                 ).catch(e => {
                   a.setState({
                     queryFlag: false,
                   });
                   message.error(e.response.data.message)
                   a.onCancel(true)
                 });
            },
            onCancel() {},
        });
    };

  //查看支付流水详情
  viewPayDetail = (id) => {
    this.setState({
      showChild:true,
      detailId:id,

      detailFlag:'PAYDETAIL'
    })
  };

  //查看单据详情
  viewDocumentDetail = (id,documentCategory) => {
    this.setState({
      showChild:  true,
      detailId:id,

      detailFlag:'DECUMENT'
    })
  };
  // 上传附件成功回调
  handleUpload = (Oids) => {
    this.setState({ uploadOids: Oids });
  };

    //点击删除
    onDelete = () => {
        const e = this;
        Modal.confirm({
            title: e.$t({id: 'pay.backlash.sureDelete'}),
            content: e.$t({id: 'pay.backlash.afterDeleteDesc'}),
            okText: e.$t({id: 'pay.backlash.ok'}),
            cancelText: e.$t({id: 'pay.backlash.cancel'}),
            onOk:()=> {
                let backDetail = e.state.backlashDetail;
                loading:true
                let backDetailId = backDetail.id;
                backlashService.deleteBacklashDetailById(backDetailId).then(
                    response=>{
                        if(response.status ===200){
                            message.success(this.$t({id: 'pay.backlash.deleteSuccess'}))
                          e.onCancel(true);
                        }
                    }
                );
            },
            onCancel() { },
        });

    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const { showButtonFlag, documentInfo,fileList, sourceDetail, backlashDetail,alert_warning,alert_seccuss,  showDetail,showChild,backlashDetailRemark,  btnLoading,detailFlag } = this.state;
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

        let newButton = showButtonFlag? (
            <div className="slide-footer">
                <Button onClick={this.onSubmit} type="primary">{this.$t({id: 'pay.backlash.submit'})}</Button>
                <Button type="primary" htmlType="submit" loading={btnLoading} >{this.$t({id: 'pay.backlash.save'})}</Button>
                <Button onClick={()=>{this.onCancel(false)}}>{this.$t({id: 'pay.backlash.goback'})}</Button>
                <Button onClick={()=>{this.onDelete()}} style={{ color: '#fff', background: '#f04134', 'borderColor': '#f04134' }}>{this.$t({id: 'pay.backlash.delete'})}</Button>
            </div>

        ) : (
        <div  className="slide-footer">
           <Button onClick={()=>{this.onCancel(false)}}>{this.$t({id: 'pay.backlash.goback'})}</Button>
        </div>

        )



        let approveButton = (<Affix offsetBottom={0}
              style={{
                position: 'fixed', bottom: 0, marginLeft: '-10px', width: '100%', height: '50px',
                boxShadow: '0px -5px 5px rgba(0, 0, 0, 0.067)', background: '#fff', lineHeight: '50px'
              }}>
              <Button type="primary" htmlType="submit" loading={false} style={{ margin: '0 20px' }}>{this.$t({id: 'pay.backlash.gotoBacklash'})}</Button>
              <Button onClick={()=>{this.onCancel(false)}}>{this.$t({id: 'pay.backlash.cancel'})}</Button>
            </Affix>)
        return (

            <div className="new-payment-requisition-line">
              {
                alert_warning && <Alert
                message={this.$t({id: 'pay.backlash.checking'})}
                description={this.$t({id: 'pay.backlash.writeOk'})}
                type="warning"
                showIcon
              />
              }

              {
                alert_seccuss && <Alert
                  message={this.$t({id: 'pay.backlash.backlashAmount'})+" : "+backlashDetail.currency + backlashDetail.amount }
                  description={this.$t({id: 'pay.backlash.pass'})}
                  type="success"
                  showIcon
                />
              }


                <Form onSubmit={this.doBacklash}>
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

                            {
                              backlashDetailRemark
                              &&
                              <Col span={10} offset={1}>
                                    <FormItem label={this.$t({id: 'pay.backlash.backlashRemark'})}>
                                      {getFieldDecorator('remarks',{
                                        initialValue: backlashDetail.remark
                                      })(
                                        <TextArea autosize={{ minRows: 2 }} style={{ minWidth: '100%' }} placeholder={this.$t({id: 'pay.backlash.pleaseInput'})}  id="remarks"/>
                                      )}
                                    </FormItem>
                              </Col>
                            }
                              {
                                !backlashDetailRemark
                                &&
                                <Col span={10} offset={1}>
                                  <FormItem label={this.$t({id: 'pay.backlash.backlashRemark'})}>
                                    <span className="ant-form-text">{backlashDetail.remark}</span>
                                  </FormItem>
                                </Col>
                              }
                              <Col span={12} offset={0}>
                                { this.state.fileShow &&<Upload attachmentType="PAYMENT"
                                                                fileNum={99}
                                                                noDelete={this.props.type}
                                                                multiple={true}
                                                                disabled={!backlashDetailRemark}
                                                                defaultOids={this.state.uploadOids}
                                                                uploadHandle={this.handleUpload}
                                                                defaultFileList={fileList}
                                />}
                              </Col>

                            </Row>



                        </div>}


                    <div style={{ padding: 20, paddingBottom: 70 }}>
                      <ApproveHistory loading={this.state.historyLoading} infoData={this.state.approveHistory}></ApproveHistory>
                    </div>

                  <Modal visible={showChild}
                         footer={[
                           <Button key="back" size="large" onClick={this.onClose}>{this.$t({id: 'pay.backlash.goback'})}</Button>
                         ]}
                         width={1200}
                         closable={false}
                         onCancel={this.onClose}>
                    <div >
                      { detailFlag === 'PAYDETAIL'? this.wrapClose(PayDetail):this.wrapClose(PrepaymentDetail) }
                    </div>
                  </Modal>


                    {showDetail ? newButton : approveButton}
                </Form>
            </div>

        )
    }
}


const wrappedToBacklash = Form.create()(ToBacklash);

export default wrappedToBacklash;
