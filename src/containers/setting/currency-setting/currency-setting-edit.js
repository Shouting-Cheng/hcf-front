
import React from 'react'
import { connect } from 'dva'
import config from "config";
import httpFetch from "share/httpFetch";
import { Button, InputNumber, message, Checkbox, Modal, Divider, Switch, DatePicker, Row, Col } from 'antd';
import Table from 'widget/table'
import moment from 'moment';
import 'styles/setting/currency-setting/currency-setting-edit.scss';
// import menuRoute from "routes/menuRoute";
let dateChanged = 0;
let rateChanged = 0;
import { routerRedux } from "dva/router";

class CurrencySettingEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isBaseCurrency: '',//是否是本位币汇率
            //   backUrl: menuRoute.getRouteItem('currency-setting').url,
            data: [],
            page: 0,
            pageSize: 10,
            pagination: { total: 0 },
            visible: false,
            originalRate: 0,
            originalRecord: {},
            record: {},
            currencyRateOid: this.props.match.params.currencyRateOid,
            operatedRecord: {},//当前操作的表格里的某一条数据
            outEditRate: false,//点击表格外的更改汇率
            historyRateSave: false,//模态框里的更改历史汇率的确认
            outEditRateSave: false,
            startDate: null,//查询历史汇率的起始日期
            endDate: null,//查询历史汇率的截止日期
            language: this.props.language.local,
            loading: false,
            indexAdd: 0,
            columns: [
                {
                    title: this.$t("cost.center.detail.no")/*编号*/, dataIndex: 'index',
                    align: 'center',
                    render: (text, record, index) => { return index + this.state.indexAdd + 1 }
                },
                {
                    title: this.$t("currency.setting.rate.apply.date")/*汇率生效日期*/, dataIndex: 'applyDate',
                    align: 'center',
                    render: (text) => { return (moment(text).local().format('YYYY-MM-DD')) }
                },
                { title: this.$t("currency.setting.add.foreign.currency")/*外币*/, dataIndex: 'currencyCode', align: 'center' },
                { title: this.$t("common.currency.rate")/*汇率*/, dataIndex: 'rate', align: 'center' },
                { title: this.$t("currency.setting.add.currency")/*本币*/, dataIndex: 'baseCurrencyCode', align: 'center' },
                {
                    title: this.$t("currency.setting.add.edit.time")/*修改时间*/, dataIndex: 'lastModifiedDate', align: 'center',
                    render: (text) => { return (moment(text).local().format('YYYY-MM-DD HH:mm:ss')) }
                },
                {
                    title: this.props.tenantMode ? '操作' : '', align: 'center', dataIndex: 'operation', width: this.props.language.local === 'zh_cn' ? '7%' : '10%',
                    render: (text, record) => this.displayOperation(text, record)
                },
            ],
        }
    };

    componentWillMount() {
        this.getCurrencyDetail();
        console.log(this.props.match.params.enableAutoUpdate)
    };

    //获取当条数据的详情
    getCurrencyDetail = () => {
        const { language, currencyRateOid } = this.state;
        let params = {
            currencyOid: currencyRateOid,
        }
        httpFetch.get(`${config.baseUrl}/api/currency/rate`, params).then(res => {
            this.setState({
                record: res.data,
                originalRecord: JSON.parse(JSON.stringify(res.data))
            }, () => {
                if (this.state.record.currencyName === this.state.record.baseCurrencyName) {
                    this.setState({
                        isBaseCurrency: true,
                    })
                } else {
                    this.setState({
                        isBaseCurrency: false,
                    })
                }
                this.getRateHistory();
            })
        })
    }

    //什么时候显示列表里的更改
    displayOperation = (text, rec) => {
        const { record } = this.state;
        if (!record.enableAutoUpdate && this.props.tenantMode) {
            return (
                <a onClick={(event) => this.onOperation(event, rec)}>
                    {this.$t("itinerary.form.change.modal.alter")/*更改*/}
                </a>
            )
        }
    };

    //获取表格数据
    getRateHistory = () => {
        const { record, page, pageSize, language } = this.state;
        httpFetch.get(`${config.baseUrl}/api/currency/rate/history/list?currencyRateOid=${record.currencyRateOid}&page=${page}&size=${pageSize}`).then(
            res => {
                if (res.status === 200) {
                    this.setState({
                        indexAdd: page * pageSize,
                        data: res.data.records,
                        pagination: {
                            total: res.data.total,
                            onChange: this.onChangePager,
                            current: this.state.page + 1
                        },
                    })
                }
            }
        )
    };

    //分页点击
    onChangePager = (page) => {
        if (page - 1 !== this.state.page)
            this.setState({
                page: page - 1,
                loading: false
            }, () => {
                this.getRateHistory();
            })
    };
    //编辑汇率的启用与否
    onEnableRate = (e) => {
        const { record } = this.state;
        if (e) {
            Modal.confirm({
                title: this.$t("cash.flow.item.enabled.flag")/*启用？*/,
                content: this.$t("currency.setting.add.enable.influence")/*启用该币种会影响全公司员工报销*/,
                okText: this.$t("currency.setting.add.continue.update")/*继续更新*/,
                cancelText: this.$t("currency.setting.add.cancel.update")/*取消更新*/,
                onOk: () => {
                    httpFetch.put(`${config.baseUrl}/api/currency/status/enable?currencyRateOid=${record.currencyRateOid}&enable=${e}`).then(
                        res => {
                            if (res.status === 200) {
                                record.enabled = res.data.enabled;
                                this.setState({
                                    record,
                                    originalRecord: JSON.parse(JSON.stringify(record)),
                                });
                                message.success(this.$t("common.operate.success")/*操作成功*/)
                            }
                        }
                    ).catch(e => {
                        this.setState({ loading: false });
                        message.error(`{e.response.data.message}`);
                    });
                },
                onCancel: () => {
                },
            });
        } else {
            Modal.confirm({
                title: this.$t("common.disabled")/*禁用？*/,
                content: this.$t("currency.setting.add.forbid.influence")/*禁用该币种会影响全公司员工报销*/,
                okText: this.$t("currency.setting.add.continue.update")/*继续更新*/,
                cancelText: this.$t("currency.setting.add.cancel.update")/*取消更新*/,
                onOk: () => {
                    httpFetch.put(`${config.baseUrl}/api/currency/status/enable?currencyRateOid=${record.currencyRateOid}&enable=${e}`).then(
                        res => {
                            if (res.status === 200) {
                                record.enabled = res.data.enabled;
                                this.setState({
                                    record,
                                    originalRecord: JSON.parse(JSON.stringify(record))
                                });
                                message.success(this.$t("common.operate.success")/*操作成功*/)
                            }
                        }
                    ).catch(e => {
                        this.setState({ loading: false });
                        message.error(`{e.response.data.message}`);
                    });
                },
                onCancel: () => {
                },
            });
        }
    };

    //点击表格外的更改汇率
    onOutEditRate = () => {
        this.setState({
            outEditRate: true,
        })
    };

    //点击表格外的更改汇率,生效日期变化时
    outApplyDateChange = (date) => {
        dateChanged = 1;
        const { record } = this.state;
        record.applyDate = date;
        this.setState({
            record,
            outEditRateSave: true,
        })
    };

    //点击表格外的更改汇率,生效汇率变化时
    outRateChange = (value) => {
        rateChanged = 1;
        const { record } = this.state;
        record.rate = value;
        this.setState({
            record,
            outEditRateSave: true,
        });
    };

    //点击表格外的更改汇率的取消
    onOutEditRateCancel = () => {
        dateChanged = 0;
        rateChanged = 0;
        this.setState({
            outEditRate: false,
            record: JSON.parse(JSON.stringify(this.state.originalRecord))
        })
    };

    //点击表格外的更改汇率的保存
    onOutEditRateSave = () => {
        const { record, originalRecord } = this.state;
        if (typeof (record.rate) !== 'number' || record.rate <= 0) {
            message.error(this.$t("currency.setting.number.zero") /*生效汇率必须为大于0的数字*/)
        } else {
            if (!dateChanged) {
                record.applyDate = moment(new Date()).utc().format();
                this.setState({
                    record,
                }, () => {
                    if (moment(record.applyDate).format('YYYY-MM-DD') === moment(originalRecord.applyDate).format('YYYY-MM-DD') && record.rate === originalRecord.rate) {
                        message.error(this.$t("currency.setting.data.not.repeat") /*不能保存重复数据*/)
                    } else {
                        httpFetch.put(`${config.baseUrl}/api/currency/rate`, record).then(res => {
                            if (res.status === 200) {
                                this.setState({
                                    outEditRate: false,
                                    record: res.data.rows,
                                    originalRecord: JSON.parse(JSON.stringify(res.data.rows))
                                }, () => {
                                    this.getRateHistory();
                                    dateChanged = 0;
                                })
                            }
                        })
                    }
                })
            } else {
                if (moment(record.applyDate).format('YYYY-MM-DD') === moment(originalRecord.applyDate).format('YYYY-MM-DD') && record.rate === originalRecord.rate) {
                    message.error(this.$t("currency.setting.data.not.repeat") /*不能保存重复数据*/)
                } else {
                    httpFetch.put(`${config.baseUrl}/api/currency/rate`, record).then(res => {
                        if (res.status === 200) {
                            this.setState({
                                outEditRate: false,
                                record: res.data,
                                originalRecord: JSON.parse(JSON.stringify(res.data))
                            }, () => {
                                this.getRateHistory();
                                dateChanged = 0;
                            })
                        }
                    })
                }
            }
        }
    };

    //是否启用自动汇率
    onEnableAutoUpdate = (e) => {
        const { record } = this.state;
        Modal.confirm({
            content: this.$t("currency.setting.add.edit.confirm")/*是否确认修改*/,
            onOk: () => {
                httpFetch.put(`${config.baseUrl}/api/currency/status/enable/auto/update?tenantId=${this.props.company.tenantId}&setOfBooksId=${this.props.match.params.setOfBooksId}&enableAutoUpdate=${e.target.checked}&currencyCode=${record.currencyCode}`).then(res => {
                    if (res.data) {
                        record.enableAutoUpdate = e.target.checked;
                        this.setState({
                            record,
                            originalRecord: JSON.parse(JSON.stringify(record))
                        }, () => {
                            this.getRateHistory();
                        })
                    }
                }).catch(e => {
                    this.setState({ loading: false });
                    message.error(`${e.response.data.message}`);
                });;
            },
            onCancel: () => {
            },
        });
    };

    //点击更改
    onOperation = (event, record) => {
        this.setState({
            visible: true,
            originalRate: record.rate,
            operatedRecord: JSON.parse(JSON.stringify(record))
        })
    };

    //更改历史汇率
    onHistoryRateChange = (value) => {
        const { operatedRecord } = this.state;
        operatedRecord.rate = value;
        this.setState({
            operatedRecord,
        })
    };

    //更改历史汇率模态框的确定
    handleModalOK = () => {
        const { operatedRecord } = this.state;
        if (typeof (operatedRecord.rate) !== 'number' || operatedRecord.rate <= 0) {
            message.error(this.$t("currency.setting.number.zero") /*生效汇率必须为大于0的数字*/)
        } else {
            httpFetch.put(`${config.baseUrl}/api/currency/rate`, operatedRecord).then(res => {
                if (res.status === 200) {
                    message.success(this.$t("wait.for.save.modifySuccess")/*修改成功*/);
                    this.getRateHistory()
                } else {
                    message.error(this.$t("wait.for.save.modifyFail")/*修改历史汇率出错了*/);
                }
            });
            this.setState({
                visible: false,
                historyRateSave: true,
            });
        }
    };

    //更改历史汇率模态框的取消
    handleModalCancel = () => {
        this.setState({
            visible: false,
        })
    };

    //查询汇率历史
    onSearchHistoryRate = () => {
        const { record, startDate, endDate, pageSize } = this.state;
        let params = {
            currencyRateOid: record.currencyRateOid,
            endDate: endDate ? endDate.utc().format() : null,
            startDate: startDate ? startDate.utc().format() : null,
            page: 0,
            size: pageSize,
        };
        this.setState({ loading: true });
        httpFetch.get(`${config.baseUrl}/api/currency/rate/history/list`, params).then(
            res => {
                if (res.status === 200) {
                    this.setState({
                        page: 0,
                        data: res.data.records,
                        pagination: {
                            total: res.data.total,
                            onChange: this.onChangePager,
                            current: 1
                        },
                        loading: false
                    })
                }
            }
        )
    };

    //查询的初始日期
    startDateChange = (date) => {
        this.setState({
            startDate: date,
        })
    };

    //查询的结束日期
    endDateChange = (date) => {
        this.setState({
            endDate: date,
        })
    };

    //开始查询日期 <= 结束查询日期
    disabledStartDate = (startDate) => {
        let endDate = moment(moment(this.state.endDate).format('YYYY-MM-DD 23:59:59'));
        if (!startDate || !endDate) {
            return false;
        }
        return startDate.valueOf() > endDate.valueOf()
    };

    //结束查询日期 >= 开始查询日期 且 结束代理日期 <= 今天
    disabledEndDate = (endDate) => {
        const startDate = moment(moment(this.state.startDate).format('YYYY-MM-DD 00:00:00'));
        if (!endDate || !startDate) {
            return false;
        }
        if (startDate.valueOf() < new Date().valueOf() || !this.state.startDate) {
            // let end = this.getAfterDate(1, moment(new Date()).format('YYYY.MM.DD'));
            // return endDate.valueOf() > moment(end).valueOf()
            return endDate.valueOf() < new Date(new Date().format('yyyy-MM-dd 00:00:00')).valueOf()
        }
        return endDate.valueOf() < startDate.valueOf()
    };


    //清空查询条件
    clearSearch = () => {
        this.setState({
            endDate: null,
            startDate: null
        });
    };

    //不能选择今天之后
    disabledDate = (endValue) => {
        const startValue = new Date();
        if (!endValue || !startValue) {
            return false;
        }
        return endValue.valueOf() > startValue.valueOf();
    };
    //返回
    back = () => {
        let { setOfBooksId, functionalCurrencyCode, functionalCurrencyName } = this.props.match.params;
        this.props.dispatch(
            routerRedux.push({
                // pathname: `/admin-setting/currency-setting`
                pathname: `/admin-setting/currency-setting/${setOfBooksId}/${functionalCurrencyCode}/${functionalCurrencyName}`,

            })
        )
    }

    render() {
        const dateFormat = 'YYYY/MM/DD';
        const { record, isBaseCurrency, columns, data, pagination, visible, operatedRecord, outEditRate,
            startDate, endDate, originalRate, loading } = this.state;
        const { enableAutoUpdate } = this.props.match.params;

        return (
            isBaseCurrency ?
                <div className='currency-edit-base'>
                    <div className="title-container">
                        {this.$t("currency.setting.add.edit.rate")/*编辑汇率*/}
                        <Button className="back-button" onClick={this.back}
                        >{this.$t('common.back')}</Button>
                        <Divider />
                    </div>
                    <div className='currency-edit-base-content'>
                        <Row gutter={16}>
                            <Col span={8}>
                                {this.$t("currency.setting.currency.name")/*币种名：*/}&nbsp;&nbsp;&nbsp;
                {record.baseCurrencyName}
                            </Col>
                            <Col span={8}>
                                {this.$t("currency.setting.code")/*代码*/}&nbsp;&nbsp;
                {record.baseCurrencyCode}
                            </Col>
                        </Row>
                    </div>
                </div>
                :
                <div className='currency-edit-notBase'>
                    <div className="title-container">
                        {this.$t("currency.setting.add.edit.rate")/*编辑汇率*/}
                        <Button className="back-button" onClick={this.back}
                        >{this.$t('common.back')}</Button>
                        <Divider />
                    </div>
                    {record.enabled ?
                        this.$t("supplier.detail.searchForm.enabled")/*已启用*/
                        :
                        this.$t("common.disabling")/*已禁用*/}&nbsp;&nbsp;&nbsp;
          <Switch checked={record.enabled} onChange={this.onEnableRate} disabled={!this.props.tenantMode} />
                    <Divider />
                    <div className='currency-edit-notBase-content'>
                        <Row gutter={16} style={{ marginBottom: 20 }}>
                            <Col span={8}>
                                {this.$t("currency.setting.currency.name")/*币种名*/}&nbsp;&nbsp;&nbsp;
                {record.currencyName}
                            </Col>
                            <Col span={8}>
                                {this.$t("currency.setting.code")/*代码：*/}&nbsp;&nbsp;
                {record.currencyCode}
                            </Col>
                            <Col span={8}>
                                {this.$t("currency.setting.enable.auto.rate")/*启用自动汇率：*/}&nbsp;&nbsp;&nbsp;
                {
                                    <Checkbox checked={record.enableAutoUpdate}
                                        onChange={this.onEnableAutoUpdate}
                                        // disabled={!this.hasAnyAuthorities(['ROLE_TENANT_ADMIN']) || !enableAutoUpdate || outEditRate || !this.props.tenantMode}
                                        disabled={enableAutoUpdate == "false"}
                                    />
                                }
                            </Col>
                        </Row>
                        {outEditRate ?
                            <Row gutter={16}>
                                <Col span={8}>
                                    {this.$t("currency.setting.rate.apply.date")/*汇率生效日期：*/}&nbsp;&nbsp;
                  <DatePicker defaultValue={moment(moment(new Date()).format("YYYY-MM-DD"))}
                                        format={dateFormat}
                                        onChange={this.outApplyDateChange}
                                        disabledDate={this.disabledDate}
                                        allowClear={false} />
                                </Col>
                                <Col span={8}>{this.$t("currency.setting.effective.rate")/*生效汇率：*/}&nbsp;&nbsp;
                  <InputNumber value={record.rate}
                                        onChange={this.outRateChange}
                                        min={0.0000001}
                                        precision={7}
                                        step={0.0000001} />
                                </Col>
                            </Row>
                            :
                            <Row gutter={16}>
                                <Col span={8}>{this.$t("currency.setting.rate.apply.date")/*汇率生效日期：*/}&nbsp;&nbsp;
                  {moment(record.applyDate).local().format('YYYY-MM-DD')}
                                </Col>
                                <Col span={8}>{this.$t("currency.setting.effective.rate")/*生效汇率：*/}&nbsp;&nbsp;{record.rate}</Col>
                            </Row>
                        }
                        <Divider />
                        {
                            this.props.tenantMode && !outEditRate &&
                            <Button type='primary'
                                disabled={record.enableAutoUpdate}
                                onClick={this.onOutEditRate}>
                                {this.$t("currency.setting.add.change.rate")/*更改汇率*/}
                            </Button>
                        }
                        {
                            outEditRate &&
                            <span>
                                <Button onClick={this.onOutEditRateCancel}>
                                    {this.$t("currency.setting.cancel.edit")/*取消修改*/}
                                </Button>
                                <Button onClick={this.onOutEditRateSave}
                                    style={{ marginLeft: 20 }}
                                    type='primary'>
                                    {this.$t("common.save")/*保存*/}
                                </Button>
                            </span>
                        }
                        <div className='currency-edit-block' style={{ marginTop: 20 }}>
                            <span className='currency-edit-history-left' style={{ fontSize: 18 }}>
                                {this.$t("currency.setting.add.rate.history")/*汇率历史*/}
                            </span>
                            <div className='currency-edit-history-right' style={{ float: 'right' }}>
                                <span>
                                    {this.$t("currency.setting.rate.apply.date")/*汇率生效日期：*/}&nbsp;&nbsp;&nbsp;
              </span>
                                <DatePicker format={dateFormat}
                                    value={startDate}
                                    placeholder={this.$t("my.agency.myAgency.startDate")/*开始日期*/}
                                    onChange={this.startDateChange}
                                    disabledDate={this.disabledStartDate}
                                    allowClear />
                                &nbsp;&nbsp;{this.$t("my.contract.to")/*至*/}&nbsp;&nbsp;
                <DatePicker format={dateFormat}
                                    value={endDate}
                                    placeholder={this.$t("common.end.date")/*结束日期*/}
                                    onChange={this.endDateChange}
                                    // disabledDate={this.disabledEndDate}
                                    allowClear />
                                <Button style={{ marginRight: 20, marginLeft: 30 }} onClick={this.clearSearch}>
                                    {this.$t("currency.setting.add.clear.search")/*重置查询条件*/}
                                </Button>
                                <Button type='primary'
                                    onClick={this.onSearchHistoryRate}>
                                    {this.$t("budget.balance.search")/*查询*/}
                                </Button>
                            </div>
                        </div>
                        <div className='currency-edit-table' style={{ marginTop: 30 }}>
                            <Table columns={columns} loading={loading} dataSource={data} pagination={pagination} size={'middle'} bordered />
                        </div>
                        <div>
                            <Modal visible={visible}
                                onCancel={this.handleModalCancel}
                                footer={(
                                    <div>
                                        <Button style={{ marginRight: 8 }} onClick={this.handleModalCancel}>{this.$t('common.cancel')}</Button>
                                        <Button type="primary" onClick={this.handleModalOK} disabled={operatedRecord.rate === originalRate}>{this.$t('common.ok')}</Button>
                                    </div>
                                )}
                                title={this.$t("currency.setting.add.edit.history")/*更改历史汇率*/}>
                                <div>
                                    {this.$t("currency.setting.rate.apply.date")/*汇率生效日期：*/}
                                    &nbsp;&nbsp;&nbsp;{moment(operatedRecord.applyDate).local().format('YYYY-MM-DD HH:mm:ss')}
                                </div>
                                <div>{this.$t("common.currency.rate")/*汇率*/}&nbsp;&nbsp;&nbsp;
                  <span>
                                        <InputNumber min={0.0000001}
                                            precision={7}
                                            step={0.0000001}
                                            onChange={this.onHistoryRateChange}
                                            value={operatedRecord.rate} />
                                    </span>
                                </div>
                            </Modal>
                        </div>
                    </div>
                </div>
        )
    }
}

// CurrencySettingEdit.contextTypes = {
//   router: React.PropTypes.object
// };

function mapStateToProps(state) {
    return {
        language: state.languages,
        company: state.user.company,
        tenantMode: true,
    }
}

export default connect(mapStateToProps, null, null, { withRef: true })(CurrencySettingEdit)
