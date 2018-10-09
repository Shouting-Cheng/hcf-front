import React, { Component } from "react"
import { Row, Col, Input, Select, message, InputNumber, DatePicker, Form, Popover, Checkbox } from 'antd'
import "styles/reimburse/invoice-info.scss"
import reimburseService from 'containers/reimburse/reimburse.service'
import baseService from 'share/base.service'
import moment from "moment"
const FormItem = Form.Item;
import invoiceImg from 'images/expense/invoice-info.png';
import invoiceImgEn from 'images/expense/invoice-info-en.png';

class InvoiceInfo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            typeList: [],
            rateList: [],
            defaultRate: "",
            currencyList: [],
            cost: 0.0,
            invoiceDate: moment(new Date, "YYYY-MM-DD"),
            invoiceCode: "",     //代码
            invoiceNumber: "",   //号码
            vatInvoiceCurrencyCode: "", //币种
            priceTaxAmount: "",
            taxAmount: "",
            typeId: "",
            currency: "",
            rateTotal: "",   //价税合计
            costTotal: "(输入价税合计&税率后自动算出)",   //金额合计
            isCalculation: true
        }
    }
    componentDidMount() {
        this.getAllInvoiceType();
        this.getRate();
        baseService.getCurrencyList().then(res => {
            this.setState({ currencyList: res.data.rows })
        })
    }

    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(nextProps.params) != "{}" && JSON.stringify(this.props.params) == "{}") {
            this.setForm(nextProps.params);
        }
    }

    //获取表单数据
    getFormData = () => {
        return {
            receiptTypeNo: this.state.typeId,
            invoiceCode: this.state.invoiceCode,
            invoiceNumber: this.state.invoiceNumber,
            invoiceDate: this.state.invoiceDate.format("YYYY-MM-DD"),
            priceTaxAmount: this.state.cost,
            taxRate: this.state.defaultRate,
            taxAmount: this.state.rateTotal,
            nonVATinclusiveAmount: this.state.costTotal,
            vatInvoiceCurrencyCode: this.state.currency
        }
    }

    //设置表单
    setForm = (data) => {
        this.props.form.setFieldsValue({
            invoiceCode: data.invoiceCode,
            invoiceNumber: data.invoiceNumber,
            invoiceDate: moment(new Date(data.invoiceDate), "YYYY-MM-DD"),
            priceTaxAmount: data.priceTaxAmount,
            taxRate: data.taxRate,
            taxAmount: this.formatMoney(data.taxAmount),
            nonVATinclusiveAmount: this.formatMoney(data.nonVATinclusiveAmount),
            vatInvoiceCurrencyCode: data.vatInvoiceCurrencyCode,
            receiptTypeNo: data.receiptTypeNo
        }, () => {
            this.typeChange(data.receiptTypeNo);
        })
    }

    //重置表单
    resetForm = () => {
        this.setState({
            rateList: [],
            defaultRate: "",
            cost: 0.0,
            invoiceDate: moment(new Date, "YYYY-MM-DD"),
            invoiceCode: "",     //代码
            invoiceNumber: "",   //号码
            vatInvoiceCurrencyCode: "", //币种
            priceTaxAmount: "",
            taxAmount: "",
            typeId: "",
            currency: "",
            rateTotal: "",   //价税合计
            costTotal: "(输入价税合计&税率后自动算出)"    //金额合计
        })
    }

    //获取开票类型
    getAllInvoiceType = () => {
        reimburseService.getAllInvoiceType().then(res => {
            this.setState({
                typeList: res.data
            })
        }).catch(err => {
            message.error("获取数据失败！");
        })
    }


    getRate = () => {
        reimburseService.getRate().then(res => {
            this.setState({ rateList: res.data });
        });
    }

    //开票类型切换事件
    typeChange = (value) => {
        reimburseService.getRate(value).then(res => {

            let isCalculation = this.state.isCalculation;

            if (value == "04" || value == "10") {
                isCalculation = false;
            }
            else {
                isCalculation = true;
            }

            let taxRate = "";

            this.setState({ rateList: res.data, isCalculation }, () => {
                res.data.map(o => {
                    if (o.defaultValue) {
                        taxRate = o.taxRateValue;
                    }
                });

                if (taxRate || this.props.form.getFieldValue("taxRate")) {
                    var amount = this.props.form.getFieldValue("priceTaxAmount");
                    taxRate = taxRate || this.props.form.getFieldValue("taxRate");
                    let val = parseFloat(amount);
                    var rate = parseFloat(taxRate);
                    let costTotal = this.toDecimal2(val / (1 + rate));
                    let rateTotal = this.toDecimal2(val - costTotal);
                    this.props.form.setFieldsValue({ taxAmount: rateTotal, nonVATinclusiveAmount: costTotal, taxRate: taxRate });
                    this.props.onAmountChange && this.props.onAmountChange(amount, rate, this.state.isCalculation);
                }
                else {
                    this.props.form.setFieldsValue({ taxRate: taxRate, taxAmount: "", nonVATinclusiveAmount: "(输入价税合计&税率后自动算出)" });
                    this.props.onRateChange && this.props.onRateChange(taxRate, this.state.isCalculation);
                }
            });


            // this.setState({ rateList: res.data, isCalculation }, () => {
            //     let flag = false;
            //     res.data.map(o => {
            //         if (o.defaultValue) {
            //             this.props.onRateChange && this.props.onRateChange(this.state.cost, o.taxRateValue, this.state.isCalculation);
            //             this.setState({ defaultRate: o.taxRateValue }, () => {
            //                 if (this.state.cost > 0) {
            //                     this.setCost(this.state.cost);
            //                 }
            //             });
            //             flag = true;
            //         }
            //     });
            //     if (!flag && !isReset) {
            //         this.props.onRateChange && this.props.onRateChange(this.state.cost, "", this.state.isCalculation);
            //         this.setState({ defaultRate: "" }, () => {
            //             this.setCost(this.state.cost);
            //         });
            //     }
            // });
        });

        // this.setState({ typeId: value });
    }

    //税率改变事件
    rateChange = (value) => {

        var amount = this.props.form.getFieldValue("priceTaxAmount");

        let val = parseFloat(amount);
        var rate = parseFloat(value);
        let costTotal = this.toDecimal2(val / (1 + rate));
        let rateTotal = this.toDecimal2(val - costTotal);
        this.props.form.setFieldsValue({ taxAmount: rateTotal, nonVATinclusiveAmount: costTotal });


        this.props.onAmountChange && this.props.onAmountChange(amount, rate, this.state.isCalculation);

        //this.props.onRateChange && this.props.onRateChange(value, this.state.isCalculation);
        // this.setState({ defaultRate: value }, () => {
        //     if (this.state.cost > 0) {
        //         this.setCost(this.state.cost);
        //     }
        // });




        // this.props.form.setFieldsValue({ taxAmount: "", nonVATinclusiveAmount: "(输入价税合计&税率后自动算出)", priceTaxAmount: "" });
    }

    //币种改变事件
    currencyChange = (value) => {
        this.setState({ currency: value });
    }

    //金额改变事件
    costChange = (value) => {



        this.setCost(value);
        // this.props.onAmountChange && this.props.onAmountChange(value, this.state.defaultRate, this.state.isCalculation);
    }

    setCost = (value) => {

        let rate = this.props.form.getFieldValue("taxRate");

        if (!value) {
            this.props.form.setFieldsValue({ taxAmount: "", nonVATinclusiveAmount: "(输入价税合计&税率后自动算出)" });
            return;
        }

        if (rate || rate === 0) {
            let val = parseFloat(value);
            rate = parseFloat(rate);
            let costTotal = this.toDecimal2(val / (1 + rate));
            let rateTotal = this.toDecimal2(val - costTotal);
            this.props.form.setFieldsValue({ taxAmount: rateTotal, nonVATinclusiveAmount: costTotal });
        }
        else {
            this.props.form.setFieldsValue({ taxAmount: "", nonVATinclusiveAmount: "(输入价税合计&税率后自动算出)" });
        }

        this.props.onAmountChange && this.props.onAmountChange(value, rate, this.state.isCalculation);
    }

    formatCost = (value) => {
        if (!value) {
            this.setState({ rateTotal: "", costTotal: "(输入价税合计&税率后自动算出)", cost: value });
            return;
        }

        if (this.state.defaultRate !== "") {
            let val = parseFloat(value);
            let rate = parseFloat(this.state.defaultRate);
            let costTotal = this.toDecimal2(val / (1 + rate));
            let rateTotal = this.toDecimal2(val - costTotal);
            this.setState({ rateTotal, costTotal, cost: value });
        }
        else {
            this.setState({ rateTotal: "", costTotal: "(输入价税合计&税率后自动算出)", cost: value });
        }

        this.props.onAmountChange && this.props.onAmountChange(value, this.state.defaultRate, this.state.isCalculation);
    }


    //加税合计改变时
    amountChange = (value) => {

        if (!value) return;

        if (this.state.defaultRate !== "") {
            let val = parseFloat(value);
            let rate = parseFloat(this.state.defaultRate);
            let costTotal = this.toDecimal2(val / (1 + rate));
            this.props.onAmountChange && this.props.onAmountChange(costTotal, this.state.defaultRate, this.state.isCalculation);
        }

    }

    checkCost = () => {
        let cost = this.props.form.getFieldValue("priceTaxAmount");
        cost = this.toDecimal2(cost);
        // let rate = this.props.form.getFieldValue("taxRate");
        // this.props.onAmountChange && this.props.onAmountChange(cost, rate, this.state.isCalculation);
        this.props.form.setFieldsValue({ priceTaxAmount: cost });

        this.setCost(cost);
    }

    //开票日期改变
    invoiceDateChange = (value) => {
        this.setState({ invoiceDate: value });
    }

    //发票代码
    invoiceCodeChange = (value) => {
        this.setState({ invoiceCode: value.target.value });
    }

    //发票号码
    invoiceNumberChange = (value) => {
        this.setState({ invoiceNumber: value.target.value });
    }

    //四舍五入 保留两位小数
    toDecimal2 = (x) => {
        var f = parseFloat(x);
        if (isNaN(f)) {
            return false;
        }
        var f = Math.round(x * 100) / 100;
        var s = f.toString();
        var rs = s.indexOf('.');
        if (rs < 0) {
            rs = s.length;
            s += '.';
        }
        while (s.length <= rs + 2) {
            s += '0';
        }
        return s;
    }

    checkPrice = (rule, value, callback) => {
        if (value > 0) {
            callback();
            return;
        }
        callback('金额不能小于等于0！');
    }

    //格式化金额
    formatMoney = (money, fixed = 2) => {
        if (typeof fixed !== "number") fixed = 2;
        let temp = Number(money || 0).toFixed(fixed).toString();
        if (temp === "NaN") return money;
        let numberString = '';
        if (temp.indexOf('.') > -1) {
            let integer = temp.split('.')[0];
            let decimals = temp.split('.')[1];
            numberString = integer.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + '.' + decimals;
        } else {
            numberString = temp.replace(/(\d)(?=(\d{3})+(?!\d))\./g, '$1,');
        }
        numberString += (numberString.indexOf('.') > -1 ? '' : '.00');
        return numberString;
    }

    render() {
        const { typeList, typeId, rateList, invoiceNumber, invoiceCode, invoiceDate, defaultRate, currencyList, rateTotal, costTotal, cost } = this.state;
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 18, },
        };
        return (
            <Row className="invoice-info-row">
                <Col span={24}>
                    <div className="invoice-info-box">
                        <div className="invoice-info-title">
                            <Popover trigger="click" content={
                                <img style={{ width: '600px' }}
                                    src={invoiceImg} />}>
                                <a>发票填写说明</a>
                            </Popover>
                        </div>
                        <Row>
                            <Col span={11}>
                                <FormItem {...formItemLayout} label="发票类型">
                                    {
                                        getFieldDecorator("receiptTypeNo", {
                                            rules: [{ required: true, message: "请选择" }],
                                            initialValue: ""
                                        })(
                                            <Select onChange={this.typeChange}>
                                                {
                                                    typeList.map(o => {
                                                        return <Select.Option value={o.value} key={o.value}>{o.messageKey}</Select.Option>
                                                    })
                                                }
                                            </Select>
                                            )
                                    }
                                </FormItem>
                            </Col>
                            <Col span={11} offset={2}>
                                <FormItem {...formItemLayout} label="开票日期">
                                    {
                                        getFieldDecorator("invoiceDate", {
                                            rules: [{ required: true, message: "请选择" }],
                                            initialValue: moment(new Date())
                                        })(
                                            <DatePicker onChange={this.invoiceDateChange} />
                                            )
                                    }
                                </FormItem>
                            </Col>
                            <Col span={11}>
                                <FormItem {...formItemLayout} label="发票代码">
                                    {
                                        getFieldDecorator("invoiceCode", {
                                            rules: [{ required: true, message: "请选择" }],
                                            initialValue: ""
                                        })(
                                            <Input onChange={this.invoiceCodeChange} />
                                            )
                                    }
                                </FormItem>

                            </Col>
                            <Col span={11} offset={2}>
                                <FormItem {...formItemLayout} label="发票号码">
                                    {
                                        getFieldDecorator("invoiceNumber", {
                                            rules: [{ required: true, message: "请选择" }],
                                            initialValue: ""
                                        })(
                                            <Input onChange={this.invoiceNumberChange} />
                                            )
                                    }
                                </FormItem>
                            </Col>

                            <Col span={11}>
                                <div className="ant-row ant-form-item">
                                    <Row>
                                        <div className="ant-col-6 ant-form-item-label"><label htmlFor="invoiceCode" title="发票代码">价税合计</label>
                                        </div>
                                        <Col span={7}>
                                            <FormItem>
                                                {
                                                    getFieldDecorator("vatInvoiceCurrencyCode", {
                                                        rules: [{ required: true, message: "请选择" }],
                                                        initialValue: this.props.headerData.currencyCode
                                                    })(
                                                        <Select disabled optionLabelProp='value' onChange={this.currencyChange}>
                                                            {
                                                              currencyList&&currencyList.map(o => {
                                                                    return <Select.Option value={o.currency} key={o.currency}>{o.currencyName}</Select.Option>
                                                                })
                                                            }
                                                        </Select>
                                                        )
                                                }
                                            </FormItem>
                                        </Col>
                                        <Col span={10} offset={1}>
                                            <FormItem>
                                                {getFieldDecorator("priceTaxAmount", {
                                                    rules: [{ validator: this.checkPrice }],
                                                    initialValue: 0
                                                })(
                                                    <InputNumber style={{ width: "100%" }} onBlur={this.checkCost} onChange={this.costChange} />
                                                    )}
                                            </FormItem>
                                        </Col>
                                    </Row>
                                </div>
                            </Col>
                            <Col span={11} offset={2}>
                                <div className="ant-row ant-form-item">
                                    <Row>
                                        <div className="ant-col-6 ant-form-item-label"><label htmlFor="invoiceCode" title="发票代码">税额</label>
                                        </div>
                                        <Col span={7}>
                                            <FormItem>
                                                {
                                                    getFieldDecorator("taxRate", {
                                                        rules: [{ required: true, message: "请选择" }],
                                                        initialValue: ""
                                                    })(
                                                        <Select placeholder="税率" onChange={this.rateChange}>
                                                            {
                                                                rateList.map(o => {
                                                                    return <Select.Option value={o.taxRateValue} key={o.taxRateValue}>{o.taxRateKey}</Select.Option>
                                                                })
                                                            }
                                                        </Select>
                                                        )
                                                }
                                            </FormItem>
                                        </Col>
                                        <Col span={10} offset={1}>
                                            <FormItem >
                                                {
                                                    getFieldDecorator("taxAmount", {
                                                        rules: [{ required: true, message: "请选择" }],
                                                        initialValue: this.formatMoney(this.state.rateTotal)
                                                    })(
                                                        <Input placeholder="税额合计" disabled onChange={this.invoiceNumberChange} />
                                                        )
                                                }
                                            </FormItem>
                                        </Col>
                                    </Row>
                                </div>
                            </Col>
                            {/* <Col span={11}>
                                <FormItem label="税率">
                                    {
                                        getFieldDecorator("taxRate", {
                                            rules: [{ required: true, message: "请选择" }],
                                            initialValue: ""
                                        })(
                                            <Select onChange={this.rateChange}>
                                                {
                                                    rateList.map(o => {
                                                        return <Select.Option value={o.taxRateValue} key={o.taxRateValue}>{o.taxRateKey}</Select.Option>
                                                    })
                                                }
                                            </Select>
                                            )
                                    }
                                </FormItem>
                            </Col> */}
                            {/* <Col span={11}>
                                <FormItem label="税率合计">
                                    {
                                        getFieldDecorator("taxAmount", {
                                            rules: [{ required: true, message: "请选择" }],
                                            initialValue: this.formatMoney(this.state.rateTotal)
                                        })(
                                            <Input disabled onChange={this.invoiceNumberChange} />
                                            )
                                    }
                                </FormItem>

                            </Col> */}
                            <Col span={11} >
                                <FormItem {...formItemLayout} label="金额合计">
                                    {
                                        getFieldDecorator("nonVATinclusiveAmount", {
                                            rules: [{ required: true, message: "请选择" }],
                                            initialValue: this.formatMoney(this.state.costTotal)
                                        })(
                                            <Input disabled onChange={this.invoiceNumberChange} />
                                            )
                                    }
                                </FormItem>
                            </Col>
                            <Col span={11} offset={2}>
                                <FormItem {...formItemLayout}>
                                    <Checkbox>分期抵扣</Checkbox>
                                </FormItem>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>
        )
    }
}

export default Form.create()((InvoiceInfo))
//
