import React from 'react'
import { Form, Button, Input, Card,Affix, Row, Col, Select, InputNumber, DatePicker, message, Tag, Modal } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
import backlashService from './pay-backlash-recheck.service'
import config from 'config'
import ApproveHistory from "containers/pay/payment-backlash/approve-history-work-flow"
import { Alert } from 'antd';
import PayDetail from 'containers/pay/pay-workbench/payment-detail' //支付详情
import PrepaymentDetail from 'containers/pre-payment/my-pre-payment/pre-payment-detail' //预付款详情
import Upload from 'widget/upload-button';
import { connect } from 'dva'
import { routerRedux } from 'dva/router';


class PayResverCheckDetail extends React.Component {
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
            showChild:false,
            rejectLoading: false,
            historyLoading:true,
            modalVisible:false,
            passModalVisible:false,
            rejectRemark:{},
            uploadOids: [], //上传附件的Oids
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
                   fileShow:true,
                   uploadOids:backlashDetail.backlashAttachmentOid,
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
                   uploadOids:backlashDetail.backlashAttachmentOid,
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

  //上传附件
  handleUpload = (Oids) => {
    this.setState({ uploadOids: Oids })
  };

  //通过
  handleApprovePass = (remark) => {

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { id } = this.state.backlashDetail;
        this.setState({ loading: true });
        let remark = values['backlashRemarks']
        let  params = values['passDesc'];
        if(params === null){
          params = "";
        }
        if (remark === undefined || remark === null){
          remark = "";
        }
        // params = params == 'undefined'?' ':params;
        backlashService.updateBacklashStatusByDetailId(id, params, "S",remark).then(res => {
          if (res.status === 200) {
            message.success(this.$t({id: 'pay.backlash.passSuccess'}));
            this.setState({
              loading: false,
              passModalVisible:false
            });
            this.onCancel(true)
          }
        }).catch(e => {
          this.setState({
            loading: false,
            passModalVisible:false
          });
          message.error(`${e.response.data.message}`)
        })
      }
    });

  };


  //不通过
  handleApproveReject = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { id } = this.state.backlashDetail;
        let params = {...this.state.rejectRemark};
        params = values['desc']
        let remark = values['backlashRemarks']
        if(params === null){
          params = "";
        }
        if (remark === undefined || remark === null ){
          remark = "";
        }
        backlashService.updateBacklashStatusByDetailId(id,params, "F",remark).then(res => {
          if (res.status === 200) {
            this.onCancel(true);
            message.success(this.$t({id: 'pay.backlash.rejectSuccess'}));
            this.setState({
              loading: false,
              modalVisible:false
            });

          }
        }).catch(e => {
          this.setState({
            loading: false ,
            modalVisible:false
          });
          message.error(`${e.response.data.message}`)
        })
      }
    });

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
                            message.success(a.$t({id: 'pay.backlash.submitSuccess'}));
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
        this.setState({ approveHistory: res.data })
      })
    }).catch(error => {
      message.error(this.$t({id: 'pay.backlash.getHistoryError'}));
      this.setState({ historyLoading: false });
    })

  }

  //驳回
  onReject = () => {
    this.setState({
      modalVisible:true
    });
  };

  //通过
  onPass = ()=>{
    this.setState({
      passModalVisible:true
    });
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
                                        this.setState({
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
        const formItemLayout = {
          labelCol: { span: 6 },
          wrapperCol: { span: 14, offset: 1 },
        };
        const {  documentInfo, sourceDetail, fileList,detailFlag ,showChild,backlashDetail, showDetail,  passLoading, rejectLoading,modalVisible,passModalVisible } = this.state;
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
            <div  className="new-payment-requisition-line">
              <Alert
                message={this.$t({id: 'pay.backlash.checking'})}
                description={this.$t({id: 'pay.backlash.writeOk'})}
                type="warning"
                showIcon
              />
                <Form>
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
                              <Col span={10} offset={1}>
                                <FormItem label={this.$t({id: 'pay.backlash.backlashRemark'})}>
                                  {getFieldDecorator('backlashRemarks',{
                                    initialValue: backlashDetail.remark
                                  })(
                                    <TextArea autosize={{ minRows: 2 }} style={{ minWidth: '100%' }} placeholder={this.$t({id: 'pay.backlash.pleaseInput'})} />
                                  )}
                                </FormItem>
                              </Col>
                              <Col span={12} offset={0}>
                                 <Upload attachmentType="PAYMENT"
                                                                noDelete={true}
                                                                fileNum={99}
                                                                multiple={true}
                                                                disabled={true}
                                                                defaultOids={this.state.uploadOids}
                                                                uploadHandle={this.handleUpload}
                                                                defaultFileList={fileList}
                                />
                              </Col>
                            </Row>
                        </div>}

                  <div style={{ padding: 20, paddingBottom: 70 }}>
                    <ApproveHistory loading={this.state.historyLoading} infoData={this.state.approveHistory}></ApproveHistory>
                  </div>
                  <div className="slide-footer">
                    <Button onClick={this.onPass} type="primary" >{this.$t({id: 'pay.backlash.S'})}</Button>
                    <Button onClick={this.onReject} style={{color:'#fff',background: '#f04134'}}>{this.$t({id: 'pay.backlash.F'})}</Button>
                    <Button onClick={()=>{this.onCancel(false)}}>{this.$t({id: 'pay.backlash.goback'})}</Button>
                  </div>
                  </Form>
                  <Modal title={this.$t({id: 'pay.backlash.pleaseInputRejectReason'})}
                         visible={modalVisible}
                         okText={this.$t({id: 'pay.backlash.F'})}
                         bodyStyle={{maxHeight:'70vh', overflow:'auto'}}
                         onOk={this.handleApproveReject}
                         onCancel={() => this.setState({ modalVisible: false })}>
                    <Form>
                      <div style={{marginBottom:15}}>{this.$t({id: 'pay.backlash.pleaseInputRejectReason'})}</div>
                      <FormItem {...formItemLayout} lable = {this.$t({id: 'pay.backlash.reason'})}>
                        {getFieldDecorator('desc',{
                          rules:[{
                            required: modalVisible?true:false,
                            message:this.$t({id: 'pay.backlash.pleaseInputRejectReason'})
                          }]
                        })(
                          <TextArea autosize={{minRows: 2}} style={{minWidth:'100%'}} placeholder={this.$t({id: 'pay.backlash.pleaseInput'})}/>
                        )}
                      </FormItem>
                    </Form>
                  </Modal>
              <Modal title={this.$t({id: 'pay.backlash.pleaseInputReason'})}
                     visible={passModalVisible}
                     okText={this.$t({id: 'pay.backlash.S'})}
                     bodyStyle={{maxHeight:'70vh', overflow:'auto'}}
                     onOk={this.handleApprovePass}
                     onCancel={() => this.setState({ passModalVisible: false })}>
                <Form>
                  <div style={{marginBottom:15}}>{this.$t({id: 'pay.backlash.pleaseInputReason'})}</div>
                  <FormItem {...formItemLayout} label={this.$t({id: 'pay.backlash.reason'})}>
                    {getFieldDecorator('passDesc',{
                      // rules:[{
                      //   required: passModalVisible?true:false,
                      //   message:'请输入原因'
                      // }]
                    })(
                      <TextArea autosize={{minRows: 2}} style={{minWidth:'100%'}} placeholder={this.$t({id: 'pay.backlash.pleaseInput'})}/>
                    )}
                  </FormItem>
                </Form>
              </Modal>
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
            </div>

        )
    }
}



const wrappedPayResverCheckDetail = Form.create()(PayResverCheckDetail);

export default wrappedPayResverCheckDetail;
