import React, { Component } from 'react'
import { Modal, Table, Alert, Input, Popover, message } from "antd"
import reimburseService from 'containers/reimburse/my-reimburse/reimburse.service'
import moment from "moment"

class Verification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            columns: [
                {
                    title: "交易日期", dataIndex: "payDate", width: 120, render: (value) => {
                        return <span>{moment(value).format('YYYY-MM-DD')}</span>
                    }
                },
                {
                    title: "付款流水号", dataIndex: "billcode", width: 120, render: (value) => {
                        return <Popover content={value}>{value}</Popover>
                    }
                },
                {
                    title: "预付款单号", dataIndex: "prepaymentRequisitionNumber", render: (value) => {
                        return <Popover content={value}>{value}</Popover>
                    }
                },
                {
                    title: "预付款单类型", dataIndex: "prepaymentRequisitionTypeDesc", width: 120, render: (value) => {
                        return <Popover content={value}>{value}</Popover>
                    }
                },
                { title: "币种", dataIndex: "currencyCode", width: 80 },
                { title: "总金额", dataIndex: "prepaymentRequisitionAmount", width: 80, render: this.filterMoney },
                { title: "可核销额", dataIndex: "unWriteOffAmount", width: 120, render: this.filterMoney },
                {
                    title: "本次核销额", width: 120, dataIndex: "writeOffAmount", render: (value, record, index) => {
                        return <Input value={value} onChange={(e) => { this.change(e, index, record) }} />
                    }
                },
            ],
            data: [

            ],
            model: {},
            messageType: "warning",
            pagination: {
                total: 0
            },
            page: 0,
            pageSize: 5,
            loading: false,
            changeList: []
        }
    }

    componentWillReceiveProps(nextProps) {

        if (!nextProps.visible && this.props.visible) {
            this.setState({
                data: [], changeList: [], page: 0, pagination: {
                    total: 0,
                    current: this.state.page + 1
                },
            });
        }

        //显示
        if (nextProps.visible && !this.props.visible) {

            if (!nextProps.model.writeOffAmount) {
                nextProps.model.writeOffAmount = 0;
            }

            this.setState({ visible: nextProps.visible, model: nextProps.model, loading: true, messageType: "warning" }, () => {
                this.getList();
            })

        }
    }

    //格式化金额
    formatMoney = (money, fixed = 2) => {
        if (typeof fixed !== "number") fixed = 2;
        money = Number(money || 0).toFixed(fixed).toString();
        let numberString = '';
        if (money.indexOf('.') > -1) {
            let integer = money.split('.')[0];
            let decimals = money.split('.')[1];
            numberString = integer.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + '.' + decimals;
        } else {
            numberString = money.replace(/(\d)(?=(\d{3})+(?!\d))\./g, '$1,');
        }
        numberString += (numberString.indexOf('.') > -1 ? '' : '.00');
        return numberString;
    }

    //获取列表
    getList = () => {

        let model = { ...this.state.model, page: this.state.page };

        this.setState({ loading: true });

        reimburseService.getWriteOffList(model).then(res => {
            res.data.map(item => {
                let record = this.state.changeList.find(o => o.cshTransactionDetailId == item.cshTransactionDetailId);
                if (record) {
                    item.writeOffAmount = record.writeOffAmount;
                }
            })
            this.setState({
                data: res.data,
                pagination: {
                    total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
                    current: this.state.page + 1,
                    pageSize: this.state.pageSize,
                    onChange: this.onChangePaper,
                    showTotal: total => `共 ${total} 条数据`
                },
                loading: false
            }, () => {

                this.checkAmount();
            });
        })
    }

    //分页
    onChangePaper = (page) => {
        if (page - 1 !== this.state.page) {
            this.setState({ page: page - 1 }, () => {
                this.getList();
            })
        }
    }

    //核销
    handleOk = () => {

        if (this.state.messageType == "error") {
            message.error("核销金额不能超过计划付款行金额！");
            return;
        }

        let result = this.state.changeList.map(o => {
            return {
                cshTransactionDetailId: o.cshTransactionDetailId,
                billcode: o.billcode,
                tenantId: o.tenantId,
                unWriteOffAmount: o.unWriteOffAmount,
                operationType: "WRITE_OFF",
                writeOffAmount: o.writeOffAmount ? o.writeOffAmount : 0
            }
        });

        this.props.handleOk && this.props.handleOk(result);
    }

    handleCancel = () => {
        this.props.close && this.props.close();
    }

    change = (e, index) => {
        let data = this.state.data;
        let writeOffAmount = data[index].writeOffAmount;
        let model = this.state.model;
        data[index].writeOffAmount = e.target.value;

        let changeList = this.state.changeList;
        let record = changeList.find(o => data[index].cshTransactionDetailId == o.cshTransactionDetailId);
        if (record) {
            record.writeOffAmount = e.target.value;
        } else {
            changeList.push(data[index]);
        }

        if (writeOffAmount && e.target.value) {
            model.writeOffAmount += parseFloat(e.target.value) - parseFloat(writeOffAmount);
        }
        else if (!writeOffAmount && e.target.value) {
            model.writeOffAmount += parseFloat(e.target.value)
        }
        else if (!e.target.value && writeOffAmount) {
            model.writeOffAmount -= parseFloat(writeOffAmount)
        }


        this.setState({ data, changeList, model }, this.checkAmount);
    }

    //检查头上金额
    checkAmount = () => {

        let model = this.state.model;

        if (model.writeOffAmount > model.amount) {
            this.setState({ messageType: "error" })
        }
        else {
            this.setState({ messageType: "warning" })
        }
    }

    render() {
        const { data, columns, model, messageType, loading } = this.state;
        return (
            <Modal
                className="select-cost-type"
                title="核销预付款单"
                visible={this.props.visible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                width="65%"
            >
                <Alert message="核销金额不能超过计划付款行金额" type={messageType} showIcon style={{ marginBottom: 10 }}></Alert>
                <div>计划付款行金额：{model.currency} {this.formatMoney(model.amount)}</div>
                <div style={{ marginBottom: 10 }}>
                    <span style={{ marginRight: 24 }}>已核销金额：{model.currency} {this.formatMoney(model.writeOffAmount)}</span>
                    <span>可核销金额：{model.currency} {this.formatMoney(model.amount - model.writeOffAmount)}</span>
                </div>
                <Table loading={loading} pagination={this.state.pagination} bordered dataSource={data} columns={columns}></Table>
            </Modal>
        )
    }
}
export default Verification
