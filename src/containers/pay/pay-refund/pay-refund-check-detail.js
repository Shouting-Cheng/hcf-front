import React from 'react'
import { Form, Button, Input,Card, Row, Col, Select, InputNumber, DatePicker, message,Alert,Modal} from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
import moment from 'moment'
import payRefundService from './pay-refund.service'
import config from 'config'
import httpFetch from 'share/httpFetch'

import Upload from 'widget/upload-button'
import PayDetail from 'containers/pay/pay-workbench/payment-detail' //支付详情
import PrepaymentDetail from 'containers/pre-payment/my-pre-payment/pre-payment-detail' //预付款详情
import ApproveHistory from "./approve-history-work-flow"
import PaymentRequisitionDetail from 'containers/payment-requisition/new-payment-requisition-detail' //付款申请单
import PublicReport from 'containers/reimburse/my-reimburse/reimburse-detail' // 对公报账单

class PayRefundCheckDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            queryFlag: true,
            draweeAccountNumber:[],
            payeeAccountNumber:[],
            currencyList: [],//币种
            newCashTransactionDetail:{},//退款支付明细
            oldCashTransactionDetail:{},//原支付明细
            showDetail:false,
            detailFlag:'',
            detailId:undefined,
            saveData:{},//保存后返回新的支付数据
            btnLoading:false,//按钮加载
            abledRefundAmount:0,
            modalVisible:false,
            modalLoading:false,
            okModalVisible:false,
            fileList:[], // 附件
            uploadOids:[],//附件OidS
            fileShow:false
        }
    }

    componentWillMount() {
        this.getCurrencyList();
    }
    //获取币种列表
    getCurrencyList = () => {
        if (this.state.currencyList.length === 0) {
            httpFetch.get(`${config.baseUrl}/api/company/standard/currency/getAll`).then(res => {
                this.setState({currencyList: res.data});
            })
        }
    };

    //获取收款账户 即原付款公司
    getPayAccount = (paymentCompanyId,currency) => {
        if (this.state.draweeAccountNumber.length > 0) return;
        let url = `${config.baseUrl}/api/CompanyBank/selectByCompanyId?companyId=${paymentCompanyId}&currency=${currency}`;
        httpFetch.get(url).then(res => {
            res.status === 200 && this.setState({ draweeAccountNumber: res.data || []})
        }).catch(() => {
            message.error(this.$t({id: "pay.refund.getDraweeAccountNumberError"}/*获取收款方银行账户信息失败*/));
        })
    };

    getHistory = (id) => {
        payRefundService.getHistory(id).then(res => {
            this.setState({ historyLoading: false }, () => {
                this.setState({ approveHistory: res.data })
            })
        }).catch(error => {
            message.error(this.$t({id: "pay.refund.historyError"}/*审批历史加载失败，请重试!*/));
            this.setState({ historyLoading: false });
        })
    };

    componentDidMount () {
       const record = this.props.params.record;
       this.setState({formLoading : true});
        payRefundService.queryMyRefundById(record.id).then(res => {
          if(res.status === 200){
            if (this.props.params.approveStatus === 'submitted') {
              this.getPayAccount(res.data.newCashTransactionDetail.paymentCompanyId, res.data.newCashTransactionDetail.currency);//获取收款方银行账户
            }
            this.getHistory(record.id);//获取历史
            let data = {};
            data = res.data.newCashTransactionDetail || {};
            let fileList = [];
            if (data.backlashAttachments) {
              data.backlashAttachments.map(item => {
                fileList.push({
                  ...item,
                  uid: item.id,
                  name: item.fileName,
                  status:"done"
                })
              })
            }
            this.setState({
              queryFlag:false,
              newCashTransactionDetail: data,
              oldCashTransactionDetail:res.data.oldCashTransactionDetail,
              abledRefundAmount:res.data.oldCashTransactionDetail.abledRefundAmount,
              fileList:fileList,
              uploadOids:data.backlashAttachmentOid,
              fileShow:true
            });
            let values = this.props.form.getFieldsValue();
            for(let name in values){
              let result = {};
              if (name === 'payDate') {
                result[name] = moment(data[name]);
              }else{
                result[name] = data[name];
              }
              this.props.form.setFieldsValue(result);
            }
          }

        }).catch(e => {
          this.setState({
            queryFlag:false,
          });
          message.error(this.$t({id: "pay.refund.getPayDetailError"}/*获取支付明细数据失败*/));
        });
    }




    onCancel = () => {
        this.props.onClose();
    };
    //校验可退款金额
    checkAmount = (rule, value, callback) => {
        if (value && value > this.state.abledRefundAmount) {
            callback(this.$t({id: "pay.refund.amountGTabledAmount"}/*输入金额大于可退款金额*/) + this.state.abledRefundAmount);
        } else if (value <= 0 ) {
            callback(this.$t({id: "pay.refund.amountLTZero"}/*可退款金额必须大于0*/));
        }else {
            callback();
        }
    };

    //查看支付流水详情
    viewPayDetail = (id) => {
        this.setState({
            showDetail:true,
            detailId:id,
            detailFlag:'PAYDETAIL'
        })
    };

    //查看单据详情
    viewDocumentDetail = (id,documentCategory) => {
        this.setState({
            showDetail:true,
            detailId:id,
            detailFlag:documentCategory
        })
    };

    //弹出框关闭
    onClose =() =>{
        this.setState({
            showDetail:false
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
    //审批通过
    saveFunction = () => {
        this.setState({
            okModalVisible:true
        });
    };

    handleModalOkApproved = () => {
        let fieldNames = ["payDate","draweeAccountNumber","approvedMsg","remark"];
        this.props.form.validateFieldsAndScroll(fieldNames,(err, values) => {
            if (!err) {
                this.setState({btnLoading:true,modalLoading:true});
                let params = {...this.state.newCashTransactionDetail, ...values};
                params['paymentStatus'] = "S";
                params['approvedMsg'] = values['approvedMsg'];
                payRefundService.approvedFunction(params).then(res => {
                    if (res.status === 200) {
                        this.setState({
                            queryFlag: false,
                            btnLoading:false,
                            okModalVisible:false,
                            modalLoading:false,
                            newCashTransactionDetail:res.data ||{}
                        });
                        message.success(this.$t({id:"common.operate.success"}/*操作成功*/) + '!');
                        this.onCancel();
                    }
                }).catch((e)=>{
                    this.setState({
                        btnLoading:false,
                        modalLoading:false,
                    });
                    message.error(this.$t({id:"common.operate.filed"}/*操作失败*/) + "!" + err.response.data.message);
                })
            }

        });
    };
    //驳回
    onReject = () => {
        this.setState({
            modalVisible:true
        });
    };
    handleModalOk = () => {
        let fieldNames = ["desc"];
        this.props.form.validateFieldsAndScroll(fieldNames,(err, values) => {
            if (!err) {
                this.setState({modalLoading:true});
                let params = {...this.state.newCashTransactionDetail};
                params['paymentStatus'] = "F";
                params['approvedMsg'] = values['desc'];
                payRefundService.rejectFunction(params).then(res => {
                    if (res.status === 200) {
                        this.setState({
                            queryFlag: false,
                            modalLoading:false,
                            modalVisible:false,
                            newCashTransactionDetail:res.data ||{}
                        });
                        message.success(this.$t({id:"common.operate.success"}/*操作成功*/) + '!');
                        this.onCancel();
                    }
                }).catch((e)=>{
                    this.setState({
                        modalLoading:false
                    });
                    message.error(this.$t({id:"common.operate.filed"}/*操作失败*/) + "!" + e.response.data.message);
                })
            }

        });
    };
    //收款账号改变修改名称
    payeeAccountNumberChange = (value) => {
        const {draweeAccountNumber} = this.state;
        draweeAccountNumber.map(item =>{
            if (item.bankAccountNumber === value){
                this.props.form.setFieldsValue({draweeAccountName:item.bankAccountName});
            }
        });
    };
    //日期限制
    disabledDate = (current) => {
        const { payDate } = this.state.oldCashTransactionDetail;
        return current && current.valueOf() <= moment(payDate).valueOf();
    };
    render() {
        const { getFieldDecorator } = this.props.form;
        const {payeeAccountNumber, currencyList,newCashTransactionDetail,oldCashTransactionDetail, draweeAccountNumber,showDetail,detailFlag,btnLoading,
            modalVisible, modalLoading} = this.state;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14, offset: 1 },
        };
        const limitDecimals = (value) => {
            const reg = /^(\-)*(\d+)\.(\d\d).*$/;
            if(typeof value === 'string') {
                return !isNaN(Number(value)) ? value.replace(reg, '$1$2.$3') : ''
            } else if (typeof value === 'number') {
                return !isNaN(value) ? String(value).replace(reg, '$1$2.$3') : ''
            } else {
                return ''
            }
        };
        let submit = (
                <div>
                    {this.$t({id:"pay.refund.waitSubmit"}/*等待财务确认*/)}
                    <br/>
                    {this.$t({id:"pay.refund.currentState"}/*当前状态:*/)}<span style={{fontWeight:'bold',fontSize:'15px'}}>{this.$t({id:"pay.refund.approving"}/*复核中*/)}</span>
                </div>
        );
        let approved = (
                <div>
                    {moment(newCashTransactionDetail.lastUpdatedDate).format("YYYY-MM-DD HH:mm:ss")}
                    <br/>
                    {this.$t({id:"pay.refund.currentState"}/*当前状态:*/)}<span style={{fontWeight:'bold',fontSize:'15px'}}>{this.$t({id:"pay.refund.approved"}/*复核通过*/)}</span>
                </div>
        );
        const status = this.props.params.approveStatus;
        let msg = (
                <div>
                    {this.$t({id:"pay.refund.refundAmount"}/*退款金额:*/)} {newCashTransactionDetail.currency}
                    <span style={{fontWeight:'bold',fontSize:'15px'}}> {this.filterMoney(newCashTransactionDetail.amount)} </span>
                </div>
        );
        let title = status === 'submitted' ?
                        (<Alert message={this.$t({id:"pay.refund.approving"}/*复核中*/)}
                               description={submit}
                               type="warning"
                               style={{margin:'-10px 0 20px'}}
                               showIcon />) :
                        (<Alert message={msg}
                                description={approved}
                                type="success"
                                style={{margin:'-10px 0 20px'}}
                                showIcon />);
        let uncheckButton = (
                <div className="slide-footer">
                    <Button type="primary" onClick={this.saveFunction} loading={btnLoading} >{this.$t({id:"pay.refund.approved"}/*复核通过*/)}</Button>
                    <Button onClick={this.onReject} style={{color:'#fff',background: '#f04134'}}>{this.$t({id:"pay.refund.reject"}/*驳回*/)}</Button>
                    <Button onClick={this.onCancel}>{this.$t({id:"common.back"}/*返回*/)}</Button>
                </div>
        );
        let approveButton = (
                <div className="slide-footer">
                    <Button onClick={this.onCancel}>{this.$t({id:"common.back"}/*返回*/)}</Button>
                </div>
        );
        return (
            <div className="new-payment-requisition-line">
                {title}
                <Form>
                    <div className="common-item-title">{this.$t({id:"pay.refund.refundInfo"}/*退款信息*/)}</div>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.returnDate"}/*退款日期*/)}>
                                {status === 'submitted'?getFieldDecorator('payDate', {
                                    rules: [{
                                        required: true,
                                        message: this.$t({id:"common.please.select"}/*请选择*/)
                                    }]
                                })(
                                        <DatePicker style={{ width: '100%' }} disabledDate={this.disabledDate}/>
                                ):moment(newCashTransactionDetail.payDate).format("YYYY-MM-DD")}
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.billCode"}/*付款流水号*/)}>
                                {status === 'new'?getFieldDecorator('billcode', {
                                })(
                                        <Input disabled={true} />
                                ):newCashTransactionDetail.billcode}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.payeeAccountNumber"}/*退款方账号*/)}>
                                {status === 'new'?getFieldDecorator('payeeAccountNumber', {
                                    rules: [{
                                        required: true,
                                        message: this.$t({id:"common.please.select"}/*请选择*/)
                                    }],
                                })(
                                        <Select placeholder={this.$t({ id: 'common.please.select' })/* 请选择 */} notFoundContent={this.$t({id:"pay.refund.notFoundContent"}/*无匹配结果*/)}>
                                            {payeeAccountNumber.map((option) => {
                                                return <Option key={option.number}>{option.number}</Option>
                                            })}
                                        </Select>
                                ):newCashTransactionDetail.payeeAccountNumber}
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.partnerCategoryName"}/*退款方*/)}>
                                {status === 'new'?getFieldDecorator('partnerName', {
                                })(
                                        <Input disabled={true} />
                                ):newCashTransactionDetail.partnerName}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.draweeAccountNumber"}/*收款方账号*/)}>
                                {status === 'submitted'?getFieldDecorator('draweeAccountNumber', {
                                    rules: [{
                                        required: true,
                                        message: this.$t({id:"common.please.select"}/*请选择*/)
                                    }],
                                })(
                                        <Select placeholder={this.$t({ id: 'common.please.select' })/* 请选择 */} onChange={this.payeeAccountNumberChange}
                                                notFoundContent={this.$t({id:"pay.refund.notFoundContent"}/*无匹配结果*/)}>
                                            {draweeAccountNumber.map((option) => {
                                                return <Option key={option.bankAccountNumber}>{option.bankAccountNumber}</Option>
                                            })}
                                        </Select>
                                ):newCashTransactionDetail.draweeAccountNumber}
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.draweeAccountName"}/*收款方户名*/)}>
                                {status === 'new'?getFieldDecorator('draweeAccountName', {
                                })(
                                        <Input disabled={true} />
                                ):newCashTransactionDetail.draweeAccountName}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.currency"}/*币种*/)}>
                                {status === 'new'?getFieldDecorator('currency', {
                                    rules: [{
                                        required: true,
                                        message: this.$t({id:"pay.refund.selectCurrency"}/*请选择币种*/)
                                    }],
                                })(
                                        <Select disabled={true}>
                                            {
                                                currencyList.map(item => {
                                                    return <Option key={item.currency}>{item.currencyName}</Option>
                                                })
                                            }
                                        </Select>
                                ):newCashTransactionDetail.currency}
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.refundAmount"}/*退款金额*/)} >
                                {status === 'new'?getFieldDecorator('amount', {
                                    rules: [
                                            {
                                                required: true,
                                                message: this.$t({id:"pay.refund.enterAmount"}/*请输入金额*/)
                                            },
                                        {  validator: this.checkAmount}
                                    ]

                                })(
                                        <InputNumber step={0.01} placeholder={this.$t({id:"common.please.enter"}/*请输入*/)} style={{ width: '100%' }} parser={limitDecimals}/>
                                ): <span style={{fontWeight:'bold',fontSize:'15px'}}> {this.filterMoney(newCashTransactionDetail.amount)} </span>}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.remark"}/*备注*/)}>
                                {status === 'submitted'?getFieldDecorator('remark', {
                                })(
                                        <TextArea autosize={{ minRows: 2 }} style={{ minWidth: '100%' }} placeholder={this.$t({id:"common.please.enter"}/*请输入*/)}  />
                                ):newCashTransactionDetail.remark}
                            </FormItem>
                        </Col>
                        <Col span={12} offset={0}>
                                {this.state.fileShow &&<Upload attachmentType="PAYMENT"
                                        fileNum={99}
                                        multiple={true}
                                        disabled={status !== "new"}
                                        uploadHandle={this.handleUpload}
                                        defaultOids={this.state.uploadOids}
                                        defaultFileList={this.state.fileList}
                                />}
                        </Col>
                    </Row>
                    <div className="common-item-title">{this.$t({id:"pay.refund.documentInfo"}/*业务单据信息*/)}</div>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.documentNumber"}/*单据编号*/)}>
                                <span className="ant-form-text"><a onClick={() => {this.viewDocumentDetail(oldCashTransactionDetail.documentId,oldCashTransactionDetail.documentCategory)}}>{oldCashTransactionDetail.documentNumber}</a></span>
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.documentTypeName"}/*单据类型*/)}>
                                <span className="ant-form-text">{oldCashTransactionDetail.documentTypeName}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.submitDate"}/*提交日期*/)}>
                                <span className="ant-form-text">{moment(oldCashTransactionDetail.requisitionDate).format("YYYY-MM-DD")}</span>
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.employeeName"}/*申请人*/)}>
                                <span className="ant-form-text">{oldCashTransactionDetail.employeeCode} - {oldCashTransactionDetail.employeeName}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    <div className="common-item-title">{this.$t({id:"pay.refund.oldPaymentInfo"}/*原支付信息*/)}</div>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.billCode"}/*付款流水号*/)}>
                                <span className="ant-form-text"><a onClick={() => {this.viewPayDetail(oldCashTransactionDetail.id)}}>{oldCashTransactionDetail.billcode}</a>
                                </span>
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.payDate"}/*付款日期*/)}>
                                <span className="ant-form-text">{moment(oldCashTransactionDetail.payDate).format("YYYY-MM-DD")}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.amount"}/*金额*/)}>
                                <span className="ant-form-text">{oldCashTransactionDetail.currency}&nbsp;&nbsp;&nbsp;&nbsp;{this.filterMoney(oldCashTransactionDetail.amount)} </span>
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.exchangeRate"}/*汇率*/)}>
                                <span className="ant-form-text">{oldCashTransactionDetail.exchangeRate}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.partnerName"}/*收款方*/)}>
                                <span className="ant-form-text">{oldCashTransactionDetail.partnerName}</span>
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.draweeAccountNumber"}/*收款方账号*/)}>
                                <span className="ant-form-text">{oldCashTransactionDetail.payeeAccountNumber}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.draweeAccountName"}/*收款方户名*/)}>
                                <span className="ant-form-text">{oldCashTransactionDetail.payeeAccountName}</span>
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.payAccountNumber"}/*付款方账号*/)}>
                                <span className="ant-form-text">{oldCashTransactionDetail.draweeAccountNumber}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.payAccountName"}/*付款方户名*/)}>
                                <span className="ant-form-text">{oldCashTransactionDetail.draweeAccountName}</span>
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.payMethod"}/*付款方式*/)}>
                                <span className="ant-form-text">{oldCashTransactionDetail.paymentTypeName}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={20} offset={1}>
                            <FormItem label={this.$t({id:"pay.refund.remark"}/*描述*/)}>
                                <span className="ant-form-text">{oldCashTransactionDetail.remark}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    {status === 'submitted' ? uncheckButton : approveButton}
                </Form>
                <div style={{ padding: 20, paddingBottom: 70 }}>
                    <ApproveHistory loading={this.state.historyLoading} infoData={this.state.approveHistory}></ApproveHistory>
                </div>
                <Modal visible={showDetail}
                        footer={[
                                <Button key="back" onClick={this.onClose}>{this.$t({id:"common.back"}/*返回*/)}</Button>
                        ]}
                        width={1200}
                        closable={false}
                        destroyOnClose={true}
                        onCancel={this.onClose}>
                    <div >
                        { detailFlag === 'PAYDETAIL'? this.wrapClose(PayDetail) :
                                detailFlag === 'ACP_REQUISITION'? this.wrapClose(PaymentRequisitionDetail) :
                                        detailFlag === 'PUBLIC_REPORT' ? this.wrapClose(PublicReport) : this.wrapClose(PrepaymentDetail) }
                    </div>
                </Modal>

                <Modal title={this.$t({id:"pay.refund.enterRejectInformation"}/*请输入驳回原因*/)}
                       visible={modalVisible}
                       okText={this.$t({id:"pay.refund.reject"}/*驳回*/)}
                       bodyStyle={{maxHeight:'70vh', overflow:'auto'}}
                       confirmLoading={modalLoading}
                       onOk={this.handleModalOk}
                       onCancel={() => this.setState({ modalVisible: false })}>
                    <Form>
                        <FormItem {...formItemLayout} label={this.$t({id:"pay.refund.information"}/*原因*/)}>
                            {getFieldDecorator('desc',{
                                rules:[{
                                    required: true,
                                    message:this.$t({id:"pay.refund.enterRejectInformation"}/*请输入驳回原因*/)
                                }]
                            })(
                                    <TextArea autosize={{minRows: 2}} style={{minWidth:'100%'}} placeholder={this.$t({id:"common.please.select"}/*请选择*/)}/>
                            )}
                        </FormItem>
                    </Form>
                </Modal>
                <Modal title={this.$t({id:"pay.refund.approveInformation"}/*可输入审批意见*/)}
                       visible={this.state.okModalVisible}
                       okText={this.$t({id:"common.ok"}/*确定*/)}
                       bodyStyle={{maxHeight:'70vh', overflow:'auto'}}
                       confirmLoading={modalLoading}
                       onOk={this.handleModalOkApproved}
                       onCancel={() => this.setState({ okModalVisible: false })}>
                    <Form>
                        <FormItem {...formItemLayout} label={this.$t({id:"pay.refund.suggestion"}/*意见*/)}>
                            {getFieldDecorator('approvedMsg')(
                                    <TextArea autosize={{minRows: 2}} style={{minWidth:'100%'}} placeholder={this.$t({id:"common.please.select"}/*请选择*/)}/>
                            )}
                        </FormItem>
                    </Form>
                </Modal>
            </div>

        )
    }
}




const wrappedPayRefundCheckDetail = Form.create()(PayRefundCheckDetail);

export default wrappedPayRefundCheckDetail;
