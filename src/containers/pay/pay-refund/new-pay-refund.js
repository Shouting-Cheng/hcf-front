import React from 'react'
import { Form, Button, Input, Card, Row, Col, Select, InputNumber, DatePicker, message, Tag, Modal } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
import moment from 'moment'
import payRefundService from './pay-refund.service'
import config from 'config'
import httpFetch from 'share/httpFetch'

import PayDetail from 'containers/pay/pay-workbench/payment-detail' //支付详情
import PrepaymentDetail from 'containers/pre-payment/my-pre-payment/pre-payment-detail' //预付款详情
import PaymentRequisitionDetail from 'containers/payment-requisition/new-payment-requisition-detail' //付款申请单
import PublicReport from 'containers/reimburse/reimburse-detail' // 对公报账单
import Upload from 'widget/upload-button'
class NewPayRefund extends React.Component {
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
            detailId: undefined,
            saveData: {},//保存后返回新的支付数据
            saveFlag: false,//是否已经保存
            btnLoading: false,//按钮加载
            fileList: [], // 附件
            uploadOIDs: [],//附件OIDS
            fileShow: false
        }
    }

    componentWillMount() {
        this.getCurrencyList();
    }
    //获取币种列表
    getCurrencyList = () => {
        if (this.state.currencyList.length === 0) {
            httpFetch.get(`${config.baseUrl}/api/company/standard/currency/getAll`).then(res => {
                this.setState({ currencyList: res.data });
            })
        }
    };

    //获取收款账户 即原付款公司
    getPayAccount = (paymentCompanyId, currency) => {
        if (this.state.draweeAccountNumber.length > 0) return;
        let url = `${config.baseUrl}/api/CompanyBank/selectByCompanyId?companyId=${paymentCompanyId}&currency=${currency}`;
        httpFetch.get(url).then(res => {
            res.status === 200 && this.setState({ draweeAccountNumber: res.data || [] })
        }).catch(() => {
            message.error(this.$t({ id: "pay.refund.getDraweeAccountNumberError" }/*获取收款方银行账户信息失败*/));
        })
    };

    //获取退款账户 即原员工或供应商
    getAccount = (name) => {
        if (this.state.payeeAccountNumber.length > 0) return;
        let url = `${config.baseUrl}/api/expReportHeader/get/bank/info/by/name?name=${name}&empFlag=1003`;
        httpFetch.get(url).then(res => {
            if (res.status === 200 && res.data[0]) {
                this.setState({ payeeAccountNumber: res.data[0].bankInfos || [] });
            }
        }).catch((e) => {
            message.error(this.$t({ id: "pay.refund.getPayeeAccountNumberError" }/*获取退款方银行账户信息失败*/));
        })
    };

    componentDidMount () {
      const record = this.props.params.record;
      this.setState({ formLoading: true });
      payRefundService.queryById(record.id).then(res => {
        if (res.status === 200) {
          this.getAccount(res.data.partnerName);//获取退款方
          this.getPayAccount(res.data.paymentCompanyId, res.data.currency);//获取收款方银行账户
          let data = {};
          data = res.data || {};
          this.setState({
            queryFlag: false,
            data: data,
            abledRefundAmount: data.abledRefundAmount,
            fileShow: true
          });
          let values = this.props.form.getFieldsValue();
          for (let name in values) {
            let result = {};
            if (name !== 'payDate' && name !== 'remark') {
              result[name] = data[name];
              this.props.form.setFieldsValue(result);
            }
          }
        }

      }).catch(e => {
        this.setState({
          queryFlag: false,
        });
        message.error(this.$t({ id: "pay.refund.getPayDetailError" }/*获取支付明细数据失败*/));
      });
    }



    onCancel = () => {
        this.props.onClose();
    };
    //校验可退款金额
    checkAmount = (rule, value, callback) => {
        if (value && value > this.state.abledRefundAmount) {
            callback(this.$t({ id: "pay.refund.amountGTabledAmount" }/*输入金额大于可退款金额*/) + this.state.abledRefundAmount);
        } else if (value <= 0) {
            callback(this.$t({ id: "pay.refund.amountLTZero" }/*可退款金额必须大于0*/));
        } else {
            callback();
        }
    };

    //查看支付流水详情
    viewPayDetail = (id) => {
        this.setState({
            showDetail: true,
            detailId: id,
            detailFlag: 'PAYDETAIL'
        })
    };

    //查看单据详情
    viewDocumentDetail = (id, documentCategory) => {
        this.setState({
            showDetail: true,
            detailId: id,
            detailFlag: documentCategory
        })
    };

    //弹出框关闭
    onClose = () => {
        this.setState({
            showDetail: false
        })
    };

    /**
     * 组装方法
     * @param content 内部组件
     * @return {*} 给组件添加this.props.close(params)方法,params为返回到最外层的值
     *             同时添加外部传入的props为内部组件可用
     */
    wrapClose = (content) => {
        let id = this.state.detailId;
        const newProps = {
            params: { id: id, refund: true }
        };
        return React.createElement(content, Object.assign({}, newProps.params, newProps));
    };

    saveFunction = (e) => {
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err, values) => {
            const { uploadOIDs } = this.state;
            let backlashAttachmentOID = uploadOIDs.join(",");
            if (!err) {
                //第一次新建
                if (!this.state.saveFlag) {
                    this.setState({ btnLoading: true });
                    let params = { ...this.state.data, ...values };
                    params["backFlashAttachmentOIDs"] = backlashAttachmentOID;
                    payRefundService.saveFunction(params).then(res => {
                        if (res.status === 200) {
                            this.setState({
                                queryFlag: false,
                                saveData: res.data || {},
                                saveFlag: true,
                                btnLoading: false
                            });
                            message.success(this.$t({ id: "common.save.success" }, { name: '' }/*保存成功*/) + '!');
                            let result = { refBillCode: res.data.billcode };

                            this.props.form.setFieldsValue(result);
                        }
                    }).catch((e) => {
                        this.setState({
                            btnLoading: false
                        });
                        message.error(this.$t({ id: "common.save.filed" }/*保存失败*/) + '!' + e.response.data.message);
                    })
                } else {//反之更新刚刚新建的
                    this.setState({ btnLoading: true });
                    let params = { ...this.state.saveData, ...values };
                    params["backFlashAttachmentOIDs"] = backlashAttachmentOID;
                    payRefundService.updateFunction(params).then(res => {
                        if (res.status === 200) {
                            this.setState({
                                queryFlag: false,
                                saveData: res.data || {},
                                saveFlag: true,
                                btnLoading: false
                            });
                            message.success(this.$t({ id: "common.save.success" }, { name: '' }/*保存成功*/) + '!');
                        }
                    }).catch((e) => {
                        this.setState({
                            btnLoading: false
                        });
                        message.error(this.$t({ id: "common.save.filed" }/*保存失败*/) + '!' + e.response.data.message);
                    })
                }
            }
        });
    };
    //点击通知财务退款
    onSubmit = () => {
        const e = this;
        let params = { ...this.state.saveData };
        params['paymentStatus'] = "P"; //状态为提交
        Modal.confirm({
            title: this.$t({ id: "pay.refund.submitInfo" }/*确认通知财务针对该数据进行退款*/),
            content: this.$t({ id: "pay.refund.inform" }/*通知后需要进行复核*/),
            okText: this.$t({ id: "common.ok" }/*确定*/),
            cancelText: this.$t({ id: "common.cancel" }/*取消*/),
            onOk() {
                e.setState({ btnLoading: true });
                payRefundService.operateFunction(params).then(res => {
                    if (res.status === 200) {
                        e.setState({ btnLoading: false });
                        e.onCancel();
                        message.success(this.$t({ id: "common.operate.success" }/*操作成功*/) + '!');
                    }
                }).catch(err => {
                    e.setState({ btnLoading: false });
                    message.error(this.$t({ id: "common.operate.filed" }/*操作失败*/) + "!" + err.response.data.message);
                });
            },
            onCancel() { },
        });
    };
    //点击删除
    onDelete = () => {
        const e = this;
        Modal.confirm({
            title: this.$t({ id: "pay.refund.deleteConfirm" }/*确认删除这条数据?*/),
            content: this.$t({ id: "pay.refund.deleteInfo" }/*删除后可以重新添加退款信息!*/),
            okText: this.$t({ id: "common.ok" }/*确定*/),
            cancelText: this.$t({ id: "common.cancel" }/*取消*/),
            onOk() {
                e.setState({ btnLoading: true });
                payRefundService.deleteById(e.state.saveData.id).then(res => {
                    if (res.status === 200) {
                        e.setState({ btnLoading: false });
                        e.onCancel();
                        message.success(e.$t({ id: "common.operate.success" }/*操作成功*/) + '!');
                    }
                }).catch(err => {
                    e.setState({ btnLoading: false });
                    message.error(e.$t({ id: "common.operate.filed" }/*操作失败*/) + '!' + err.response.data.message);
                });
            },
            onCancel() { },
        });

    };
    //收款账号改变修改名称
    payeeAccountNumberChange = (value) => {
        const { draweeAccountNumber } = this.state;
        draweeAccountNumber.map(item => {
            if (item.bankAccountNumber === value) {
                this.props.form.setFieldsValue({ draweeAccountName: item.bankAccountName });
            }
        });
    };
    //日期限制
    disabledDate = (current) => {
        const { payDate } = this.state.data;
        return current && current.valueOf() <= moment(payDate).valueOf();
    };
    // 上传附件成功回调
    handleUpload = (OIDs) => {
        this.setState({ uploadOIDs: OIDs })
    };
    render() {
        const { getFieldDecorator } = this.props.form;
        const { payeeAccountNumber, currencyList, data, draweeAccountNumber, showDetail, detailFlag, saveFlag, btnLoading } = this.state;
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

        let newButton = (
            <div className="slide-footer">
                <Button onClick={this.onSubmit} type="primary" loading={btnLoading}>{this.$t({ id: "pay.refund.submitButtonText" }/*通知财务退款*/)}</Button>
                <Button type="primary" htmlType="submit" loading={btnLoading} >{this.$t({ id: "common.save" }/*保存*/)}</Button>
                <Button onClick={this.onCancel} loading={btnLoading}>{this.$t({ id: "common.cancel" }/*取消*/)}</Button>
                <Button onClick={this.onDelete} loading={btnLoading} style={{ color: '#fff', background: '#f04134', "border-color": '#f04134' }}>{this.$t({ id: "common.delete" }/*删除*/)}</Button>
            </div>
        );
        let approveButton = (
            <div className="slide-footer">
                <Button type="primary" htmlType="submit" loading={btnLoading} > {this.$t({ id: "common.save" }/*保存*/)} </Button>
                <Button onClick={this.onCancel}>{this.$t({ id: "common.cancel" }/*取消*/)}</Button>
            </div>
        );

        return (
            <div className="new-payment-requisition-line">
                <Form onSubmit={this.saveFunction}>
                    <div className="common-item-title">{this.$t({ id: "pay.refund.refundInfo" }/*退款信息*/)}</div>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.returnDate" }/*退款日期*/)} >
                                {getFieldDecorator('payDate', {
                                    rules: [{
                                        required: true,
                                        message: this.$t({ id: "common.please.select" }/*请选择*/)
                                    }],
                                    initialValue: moment(new Date()).format("YYYY-MM-DD") >= moment(data.payDate).format("YYYY-MM-DD") ? moment(new Date()) : undefined
                                })(
                                    <DatePicker style={{ width: '100%' }} disabledDate={this.disabledDate} />
                                    )}
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.billCode" }/*付款流水号*/)}>
                                {getFieldDecorator('refBillCode', {
                                })(
                                    <Input disabled={true} />
                                    )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.payeeAccountNumber" }/*退款方账号*/)}>
                                {getFieldDecorator('payeeAccountNumber', {
                                    rules: [{
                                        required: true,
                                        message: this.$t({ id: "common.please.select" }/*请选择*/)
                                    }],
                                })(
                                    <Select placeholder={this.$t({ id: 'common.please.select' })/* 请选择 */} notFoundContent={this.$t({ id: "pay.refund.notFoundContent" }/*无匹配结果*/)}>
                                        {payeeAccountNumber.map((option) => {
                                            return <Option key={option.number} >{option.number}</Option>
                                        })}
                                    </Select>
                                    )}
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.partnerCategoryName" }/*退款方*/)}>
                                {getFieldDecorator('partnerName', {
                                })(
                                    <Input disabled={true} />
                                    )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.draweeAccountNumber" }/*收款方账号*/)}>
                                {getFieldDecorator('draweeAccountNumber', {
                                    rules: [{
                                        required: true,
                                        message: this.$t({ id: "common.please.select" }/*请选择*/)
                                    }],
                                })(
                                    <Select placeholder={this.$t({ id: 'common.please.select' })/* 请选择 */} onChange={this.payeeAccountNumberChange}
                                        notFoundContent={this.$t({ id: "pay.refund.notFoundContent" }/*无匹配结果*/)}>
                                        {draweeAccountNumber.map((option) => {
                                            return <Option key={option.bankAccountNumber}>{option.bankAccountNumber}</Option>
                                        })}
                                    </Select>
                                    )}
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.draweeAccountName" }/*收款方户名*/)}>
                                {getFieldDecorator('draweeAccountName', {
                                })(
                                    <Input disabled={true} />
                                    )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.currency" }/*币种*/)}>
                                {getFieldDecorator('currency', {
                                    rules: [{
                                        required: true,
                                        message: this.$t({ id: "pay.refund.selectCurrency" }/*请选择币种*/)
                                    }],
                                })(
                                    <Select disabled={true}>
                                        {
                                            currencyList.map(item => {
                                                return <Option key={item.currency}>{item.currencyName}</Option>
                                            })
                                        }
                                    </Select>
                                    )}
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.refundAmount" }/*退款金额*/)}>
                                {getFieldDecorator('abledRefundAmount', {
                                    rules: [
                                        {
                                            required: true,
                                            message: this.$t({ id: "pay.refund.enterAmount" }/*请输入金额*/)
                                        },
                                        { validator: this.checkAmount }
                                    ]

                                })(
                                    <InputNumber step={0.01} placeholder={this.$t({ id: "common.please.enter" }/*请输入*/)} style={{ width: '100%' }} parser={limitDecimals} />
                                    )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.remark" }/*备注*/)}>
                                {getFieldDecorator('remark', {
                                })(
                                    <TextArea autosize={{ minRows: 2 }} style={{ minWidth: '100%' }} placeholder={this.$t({ id: "common.please.enter" }/*请输入*/)} />
                                    )}
                            </FormItem>
                        </Col>
                        <Col span={12} offset={1}>
                            <FormItem label={"附件"}>
                                {this.state.fileShow && <Upload attachmentType="PAYMENT"
                                    fileNum={99}
                                    multiple={true}
                                    uploadHandle={this.handleUpload}
                                    defaultFileList={this.state.fileList}
                                    defaultOIDs={this.state.uploadOIDs}
                                />}
                            </FormItem>
                        </Col>
                    </Row>
                    <div className="common-item-title">{this.$t({ id: "pay.refund.documentInfo" }/*业务单据信息*/)}</div>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.documentNumber" }/*单据编号*/)}>
                                <span className="ant-form-text"><a onClick={() => { this.viewDocumentDetail(data.documentId, data.documentCategory) }}>{data.documentNumber}</a></span>
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.documentTypeName" }/*单据类型*/)}>
                                <span className="ant-form-text">{data.documentTypeName}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.submitDate" }/*提交日期*/)}>
                                <span className="ant-form-text">{moment(data.requisitionDate).format("YYYY-MM-DD")}</span>
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.employeeName" }/*申请人*/)}>
                                <span className="ant-form-text">{data.employeeCode} - {data.employeeName}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    <div className="common-item-title">{this.$t({ id: "pay.refund.oldPaymentInfo" }/*原支付信息*/)}</div>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.billCode" }/*付款流水号*/)}>
                                <span className="ant-form-text"><a onClick={() => { this.viewPayDetail(data.id) }}>{data.billcode}</a>
                                </span>
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.payDate" }/*付款日期*/)}>
                                <span className="ant-form-text">{moment(data.payDate).format("YYYY-MM-DD")}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.amount" }/*金额*/)}>
                                <span className="ant-form-text">{data.currency}&nbsp;&nbsp;&nbsp;&nbsp;{this.filterMoney(data.amount)}</span>
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.exchangeRate" }/*汇率*/)}>
                                <span className="ant-form-text">{data.exchangeRate}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.partnerName" }/*收款方*/)}>
                                <span className="ant-form-text">{data.partnerName}</span>
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.draweeAccountNumber" }/*收款方账号*/)}>
                                <span className="ant-form-text">{data.payeeAccountNumber}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.draweeAccountName" }/*收款方户名*/)}>
                                <span className="ant-form-text">{data.payeeAccountName}</span>
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.payAccountNumber" }/*付款方账号*/)}>
                                <span className="ant-form-text">{data.draweeAccountNumber}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.payAccountName" }/*付款方户名*/)}>
                                <span className="ant-form-text">{data.draweeAccountName}</span>
                            </FormItem>
                        </Col>
                        <Col span={10} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.payMethod" }/*付款方式*/)}>
                                <span className="ant-form-text">{data.paymentTypeName}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={20} offset={1}>
                            <FormItem label={this.$t({ id: "pay.refund.remark" }/*描述*/)}>
                                <span className="ant-form-text">{data.remark}</span>
                            </FormItem>
                        </Col>
                    </Row>
                    {saveFlag ? newButton : approveButton}
                </Form>
                <Modal visible={showDetail}
                    footer={[
                        <Button key="back" onClick={this.onClose}>{this.$t({ id: "common.back" }/*返回*/)}</Button>
                    ]}
                    width={1200}
                    closable={false}
                    destroyOnClose={true}
                    onCancel={this.onClose}>
                    <div >
                        {detailFlag === 'PAYDETAIL' ? this.wrapClose(PayDetail) :
                            detailFlag === 'ACP_REQUISITION' ? this.wrapClose(PaymentRequisitionDetail) :
                                detailFlag === 'PUBLIC_REPORT' ? this.wrapClose(PublicReport) : this.wrapClose(PrepaymentDetail)}
                    </div>
                </Modal>
            </div>

        )
    }
}


const wrappedNewPayRefund = Form.create()(NewPayRefund);

export default wrappedNewPayRefund;
