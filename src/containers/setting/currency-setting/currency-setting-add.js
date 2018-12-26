
import React from 'react'
import { connect } from 'dva'
import { Button, Input, message, Select, Switch, Divider, DatePicker, InputNumber, Form } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import moment from 'moment';
import config from "config";
import httpFetch from "share/httpFetch";
// import menuRoute from 'routes/menuRoute'
import 'styles/setting/city-level/city-level.scss';
import 'styles/setting/currency-setting/currency-setting-add.scss'
import { routerRedux } from "dva/router";


class CurrencySettingAdd extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            saving: false,
            currencyOptions: [],
            data: [],
            pageSize: 10,
            params: {},//路由参数
            language: this.props.language.local,
            //   backUrl: menuRoute.getRouteItem('currency-setting', 'key').url,//币种设置
        }
    }

    componentWillMount() {
        this.getCurrencyName();
    }

    //获取币种名的option
    getCurrencyName = () => {
        const { baseCurrency, setOfBooksId, tenantId, } = this.props.match.params;
        httpFetch.get(`${config.baseUrl}/api/currencyI18n/select/not/created/currency?baseCurrencyCode=${baseCurrency}&setOfBooksId=${setOfBooksId}&tenantId=${tenantId}`).then(res => {
            if (res.status === 200) {
                this.setState({
                    currencyOptions: res.data
                })
            }
        }
        )
    };

    //选中币种名，选中之后代码随其改变
    onCurrencyNameChange = (value) => {
        const { currencyOptions } = this.state;
        currencyOptions.map(item => {
            if (item.currencyName === value.split('+')[1]) {
                this.props.form.setFieldsValue({ currencyCode: item.currencyCode })
            }
        })
    };

    //不能选择今天之后
    disabledEndDate = (endValue) => {
        const startValue = new Date();
        if (!endValue || !startValue) {
            return false;
        }
        return endValue.valueOf() > startValue.valueOf();
    };

    //点击保存
    onSave = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            const { language, backUrl } = this.state;
            const { baseCurrency, setOfBooksId, tenantId } = this.props.match.params;
            if (!err) {
                values.applyDate = values.applyDate.utc().format();
                values.baseCurrencyCode = baseCurrency;
                values.setOfBooksId = setOfBooksId;
                values.tenantId = tenantId;
                values.autoUpateRate = false;
                this.setState({ saving: true });
                httpFetch.post(`${config.baseUrl}/api/currency/rate`, values).then(res => {
                    this.setState({ saving: false });
                    if (res.status === 200) {
                        message.success(this.$t("wait.for.save.addSuc")/*新增成功*/);
                        let { setOfBooksId, baseCurrency, baseCurrencyName } = this.props.match.params;
                        this.props.dispatch(
                            routerRedux.push({
                                pathname: `/admin-setting/currency-setting/${setOfBooksId}/${baseCurrency}/${baseCurrencyName}`,
                            })
                        )
                        // this.context.router.replace({
                        //     pathname: backUrl,
                        //     state: {
                        //         setOfBooksId: this.props.location.state.setOfBooksId,
                        //         functionalCurrencyCode: this.props.location.state.baseCurrency,
                        //         functionalCurrencyName: this.props.location.state.baseCurrencyName
                        //     }
                        // })
                    }
                }).catch(() => {
                    this.setState({ saving: false });
                    message.error(this.$t('currency.setting.add.enable.auto.rate')/*'当前账套尚未启用汇率自动更新服务,请先开启!'*/, 3);
                    this.props.dispatch(
                        routerRedux.push({
                            pathname: `/admin-setting/currency-setting`,

                        })
                    );
                    //   this.context.router.replace({
                    //     pathname: backUrl,
                    //     state: {
                    //       setOfBooksId: this.props.location.state.setOfBooksId,
                    //       functionalCurrencyCode: this.props.location.state.baseCurrency,
                    //       functionalCurrencyName: this.props.location.state.baseCurrencyName
                    //     }
                    //   })
                })
            }
        })
    };

    render() {
        const { currencyOptions, backUrl, saving } = this.state;
        const { enableAutoUpdate } = this.props.match.params;
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 8, offset: 1 },
        };
        const { getFieldDecorator } = this.props.form;
        return (
            <Form className='currency-setting-add' onSubmit={this.onSave}>
                <FormItem {...formItemLayout} label={this.$t("currency.setting.add.new.enable")/*状态enable*/}>
                    {getFieldDecorator('enable', {
                        valuePropName: 'checked',
                        initialValue: true
                    })(
                        <Switch />
                    )}
                </FormItem>
                <Divider dashed />
                <FormItem {...formItemLayout} label={this.$t("currency.setting.currency.name")/*币种名*/}>
                    {getFieldDecorator('currencyName', {
                        rules: [{
                            required: true,
                            message: this.$t('common.please.select')
                        }]
                    })(
                        <Select onSelect={this.onCurrencyNameChange}
                            placeholder={this.$t("common.please.select")/*请选择币种名*/}
                            getPopupContainer={triggerNode => triggerNode.parentNode}
                            showSearch={true}
                            filterOption={(inputValue, option) => option.props.children.toLowerCase().indexOf(inputValue.toLowerCase()) > -1}>
                            {currencyOptions.map((item, index) => {
                                return <Option key={`${item.currencyCode}+${item.currencyName}`}>
                                    {this.state.language === 'en' ? item.currencyCode : `${item.currencyCode} ${item.currencyName}`}</Option>
                            })} 
                        </Select>
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label={this.$t("currency.setting.code")/*代码*/}>
                    {getFieldDecorator('currencyCode', {
                        rules: [{
                            required: true,
                            message: this.$t('common.please.enter')
                        }]
                    })(
                        <Input disabled />
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label={this.$t("currency.setting.rate.apply.date")/*汇率生效日期*/}>
                    {getFieldDecorator('applyDate', {
                        rules: [{
                            required: true,
                            message: this.$t('common.please.select')
                        }]
                    })(
                        <DatePicker disabledDate={this.disabledEndDate}
                            style={{ width: '100%' }}
                            allowClear={false} />
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label={this.$t("currency.setting.effective.rate")/*生效汇率*/}>
                    {getFieldDecorator('rate', {
                        rules: [{
                            required: true,
                            message: this.$t("currency.setting.number.zero") /*生效汇率必须为大于0的数字*/,
                            validator: (personObj, value, cb) => {
                                if (value === "" || value === undefined || value === null) {
                                    cb(false);
                                };
                                if (typeof (value) !== 'number' || value <= 0) {
                                    cb(false);
                                } else {
                                    cb();
                                }
                            },
                        }
                        ]
                    })(
                        <InputNumber min={0.0000001} precision={7} step={0.0000001} style={{ width: '100%' }} />
                    )}
                </FormItem>

                <FormItem {...formItemLayout} label={this.$t("currency.setting.enable.auto.rate")/*启用自动汇率*/}>
                    {getFieldDecorator('enableAutoUpdate', {
                        valuePropName: 'checked',
                        initialValue: enableAutoUpdate
                    })(
                        <Switch disabled={!enableAutoUpdate} />
                    )}
                </FormItem>

                <FormItem {...formItemLayout} wrapperCol={{ offset: 5 }}>
                    <Button onClick={() => {
                        let { setOfBooksId, baseCurrency, baseCurrencyName } = this.props.match.params;
                        this.props.dispatch(
                            routerRedux.push({
                                pathname: `/admin-setting/currency-setting/${setOfBooksId}/${baseCurrency}/${baseCurrencyName}`,
                            })
                        )
                    }} style={{ marginRight: 15 }}>
                        {this.$t("common.back")/*返回*/}
                    </Button>
                    <Button type='primary' htmlType="submit" loading={saving}>{this.$t("common.save")/*保存*/}</Button>
                </FormItem>
            </Form>
        )
    }
}

// CurrencySettingAdd.contextTypes = {
//   router: React.PropTypes.object
// };

function mapStateToProps(state) {
    return {
        language: state.languages,
        tenantMode: true,
    }
}

const WrappedCurrencySettingAdd = Form.create()(CurrencySettingAdd);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedCurrencySettingAdd);
