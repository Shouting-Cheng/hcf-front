
import React from 'react';
import { connect } from 'dva';

import { Alert, Divider, Switch, InputNumber, Button, Form, message, Select } from 'antd';
const FormItem = Form.Item;
import 'styles/setting/form/form-detail.scss'
// import menuRoute from "routes/menuRoute";
import formService from "containers/admin-setting/form/form.service";

const Option = Select.Option;
import PropTypes from 'prop-types'
import { routerRedux } from 'dva/router';

class HuilianyiManagement extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            disabled: true,
            isEditing: false,//是否点击编辑
            //   formManagement: menuRoute.getRouteItem('form-list', 'key'),//点击返回跳转到的页面
            //   travelPolicy: menuRoute.getRouteItem('travel-policy', 'key'),//点击差旅标准设置跳转到的页面
            travelApplypolicy: {},//差旅标准控制
            versionChange: {},//版本变更
            autoStop: {},//自动停用
            employeeAutoStop: {},//允许员工自动停用
            autoStopDays: {},//允许员工自动停用的天数
            employeeRestartUse: {},//允许员工重新启用
            employeeRestartDays: {},//允许员工重新启用的天数
            bookingPreference: {}, //统一订票方式
            autoStopDaysDisabled: true,//允许员工自动停用的天数的inputNumber的disabled
            employeeRestartDaysDisabled: true,//允许员工重新启用的天数的inputNumber的disabled
            autoStopNumRequired: false,//允许员工自动停用的天数的inputNumber的表单的required
            restartNumRequired: false,//允许员工重新启用的天数的inputNumber的表单的required
            params: [],//提交时需要的参数
        }
    }
    componentWillMount() {
        const { propertyList } = this.props;
        const { params } = this.state;
        propertyList.map(item => {
            if (item.propertyName === 'ca.travel.applypolicy.enable') {
                this.setState({
                    travelApplypolicy: item,
                })
            }
            if (item.propertyName === 'application.change.enable') {
                this.setState({
                    versionChange: item,
                })
            }
            if (item.propertyName === 'application.close.enabled') {
                this.setState({
                    autoStop: item,
                }, () => {
                    this.setState({
                        autoStopNumRequired: this.state.autoStop.propertyValue === '1' || this.state.autoStop.propertyValue === 1 ? true : false,
                    })
                })
            }
            if (item.propertyName === 'application.close.closeDay') {
                this.setState({
                    autoStopDays: item,
                })
            }
            if (item.propertyName === 'application.close.restart.closeDay') {
                this.setState({
                    employeeRestartDays: item,
                })
            }
            if (item.propertyName === 'application.close.participant.enabled') {
                this.setState({
                    employeeAutoStop: item,
                })
            }
            if (item.propertyName === 'application.close.restart.enabled') {
                this.setState({
                    employeeRestartUse: item,
                }, () => {
                    this.setState({
                        restartNumRequired: this.state.employeeRestartUse.propertyValue === '1' || this.state.employeeRestartUse.propertyValue === 1 ? true : false,
                    })
                })
            }
            if (item.propertyName === 'ca.travel.bookingpreference') {
                this.setState({
                    bookingPreference: item,
                })
            }
        })
    }
    componentDidMount() {
        const { travelApplypolicy, versionChange, autoStop, employeeAutoStop, autoStopDays, employeeRestartUse,
            employeeRestartDays, bookingPreference } = this.state;
        const { formOID } = this.props.params;
        if (!travelApplypolicy.hasOwnProperty('propertyName')) {
            this.setState({
                travelApplypolicy: {
                    formOID: formOID,
                    propertyName: 'ca.travel.applypolicy.enable',
                    propertyValue: null,
                }
            })
        }
        if (!versionChange.hasOwnProperty('propertyName')) {
            this.setState({
                versionChange: {
                    formOID: formOID,
                    propertyName: 'application.change.enable',
                    propertyValue: null,
                }
            })
        }
        if (!autoStop.hasOwnProperty('propertyName')) {
            this.setState({
                autoStop: {
                    formOID: formOID,
                    propertyName: 'application.close.enabled',
                    propertyValue: null,
                }
            })
        }
        if (!autoStopDays.hasOwnProperty('propertyName')) {
            this.setState({
                autoStopDays: {
                    formOID: formOID,
                    propertyName: 'application.close.closeDay',
                    propertyValue: null,
                }
            })
        }
        if (!employeeAutoStop.hasOwnProperty('propertyName')) {
            this.setState({
                employeeAutoStop: {
                    formOID: formOID,
                    propertyName: 'application.close.participant.enabled',
                    propertyValue: null,
                }
            })
        }
        if (!employeeRestartUse.hasOwnProperty('propertyName')) {
            this.setState({
                employeeRestartUse: {
                    formOID: formOID,
                    propertyName: 'application.close.restart.enabled',
                    propertyValue: null,
                }
            })
        }
        if (!employeeRestartDays.hasOwnProperty('propertyName')) {
            this.setState({
                employeeRestartDays: {
                    formOID: formOID,
                    propertyName: 'application.close.restart.closeDay',
                    propertyValue: null,
                }
            })
        }
        if (!bookingPreference.hasOwnProperty('propertyName')) {
            this.setState({
                bookingPreference: {
                    formOID: formOID,
                    propertyName: 'ca.travel.bookingpreference',
                    propertyValue: null,
                }
            })
        }
    }
    //处于编辑状态时切换tab相当于点击取消编辑
    componentWillReceiveProps(nextProps) {
        if (nextProps.params.activeKey !== this.props.params.activeKey) {
            this.state.isEditing && this.cancelEditing();
        }
    }
    //点击编辑
    editClicked = () => {
        const { autoStop, employeeRestartUse } = this.state
        this.setState({
            isEditing: true,
            disabled: false,
        }, () => {
            if (autoStop.propertyValue === '1' || autoStop.propertyValue === 1)
                this.setState({
                    autoStopDaysDisabled: false,
                })
            if (employeeRestartUse.propertyValue === '1' || employeeRestartUse.propertyValue === 1) {
                this.setState({
                    employeeRestartDaysDisabled: false
                })
            }
        })
    }
    //取消编辑
    cancelEditing = () => {
        this.setState({
            isEditing: false,
            disabled: true,
            autoStopDaysDisabled: true,
            employeeRestartDaysDisabled: true
        }, () => {
            this.props.form.resetFields();
        })
    }
    //后面跟有inputNumber的两个switch按钮切换时
    onSwitchChange = (e, key) => {
        switch (key) {
            case 'autoStop': this.setState({
                autoStopDaysDisabled: !e,
                autoStopNumRequired: e
            });
                break;
            case 'employeeRestartUse': this.setState({
                employeeRestartDaysDisabled: !e,
                restartNumRequired: e,
            })
                break;
        }
    }
    //点击保存
    onFatherSaveClick = () => {
        const { travelApplypolicy, versionChange, autoStop, employeeAutoStop, autoStopDays, employeeRestartUse,
            employeeRestartDays, bookingPreference, autoStopNumRequired, restartNumRequired } = this.state;
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                travelApplypolicy.propertyValue = values.travelApplypolicy;
                versionChange.propertyValue = values.versionChange;
                autoStop.propertyValue = values.autoStop === true ? '1' : '0';
                employeeAutoStop.propertyValue = values.employeeAutoStop === true ? '1' : '0';
                autoStopDays.propertyValue = values.autoStopDays;
                employeeRestartUse.propertyValue = values.employeeRestartUse === true ? '1' : '0';
                employeeRestartDays.propertyValue = values.employeeRestartDays;
                let params = [
                    travelApplypolicy,
                    versionChange,
                    autoStop,
                    employeeAutoStop,
                    employeeRestartUse
                ];
                if (values.bookingPreference) {
                    bookingPreference.propertyValue = values.bookingPreference;
                    params.push(bookingPreference);
                }
                if (autoStopNumRequired && !parseInt(autoStopDays.propertyValue)) {
                    message.error("自动停用天数必须为正整数");
                    return;
                }
                if (restartNumRequired && !parseInt(employeeRestartDays.propertyValue)) {
                    message.error("重新启用的停用天数必须为正整数");
                    return;
                }
                if (autoStopNumRequired) {
                    params.push(autoStopDays);
                }
                if (restartNumRequired) {
                    params.push(employeeRestartDays);
                }
                formService.saveHuilianyiForm(params).then(res => {
                    if (res.status === 200) {
                        message.success(this.$t("invoice.management.save.success")/*保存成功*/)
                        this.props.saveHandle(true)
                    } else {
                        message.error(this.$t("bookingManagement.save.fail")/*保存失败*/)
                    }
                    this.setState({
                        disabled: true,
                        isEditing: false,
                        autoStopDaysDisabled: true,
                        employeeRestartDaysDisabled: true
                    })
                })
            }
        });
    };
    //返回
    back = () => {
        this.props.dispatch(
            routerRedux.push({
                pathname: `/admin-setting/form-list`,
            })
        );
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const { disabled, isEditing, travelApplypolicy, versionChange, autoStop, autoStopDays,
            employeeAutoStop, employeeRestartUse, autoStopDaysDisabled, employeeRestartDays, employeeRestartDaysDisabled,
            autoStopNumRequired, restartNumRequired, bookingPreference } = this.state;
        return (
            <div className='form-setting-huilianyi'>
                <Form hideRequiredMark={true}>
                    <div className='huilianyi-alert'>
                        <Alert
                            message={this.$t("common.help")/*帮助提示*/}
                            description={this.$t("form.setting.huilianyi.enable.rules")/*设置该单据是否启用相应的管控规则*/}
                            type="info"
                            showIcon />
                    </div>
                    <div className='huilianyi-global'>
                        <div className='huilianyi-module'>
                            <FormItem label={this.$t("form.setting.huilianyi.control.standard")/*差旅控制标准*/}>
                                {getFieldDecorator('travelApplypolicy', {
                                    rules: [{
                                        required: true,
                                    }],
                                    valuePropName: 'checked',
                                    initialValue: travelApplypolicy.propertyValue === 'true' || travelApplypolicy.propertyValue === true ? true : false
                                })(
                                    <Switch disabled={disabled} />
                                )}
                            </FormItem>
                            <Divider dashed />
                            <span className='huilianyi-note'>
                                {this.$t("form.setting.huilianyi.auto.apply")/*启用后，该单据在添加行程时将自动应用公司设置的差旅标准，包括机票舱等、折扣、酒店单价上限、火车座席等*/}
                            </span>
                            <div>{this.$t("form.setting.huilianyi.go.to")/*前往*/}
                                <a onClick={() => { this.context.router.push(travelPolicy.url); }}>{this.$t("travel.policy.travel.standard.setting")/*差旅标准设置*/}</a>
                                {this.$t("form.setting.huilianyi.rules.setting")/*进行规则设置*/}
                            </div>
                        </div>
                        <div className='huilianyi-module'>
                            <FormItem label={this.$t("form.setting.huilianyi.version.change")/*版本变更管理*/}>
                                {getFieldDecorator('versionChange', {
                                    rules: [{
                                        required: true,
                                    }],
                                    valuePropName: 'checked',
                                    initialValue: versionChange.propertyValue === 'true' || versionChange.propertyValue === true ? true : false
                                })(
                                    <Switch disabled={disabled} />
                                )}
                            </FormItem>
                            <Divider dashed />
                            <span className='huilianyi-note'>{this.$t("form.setting.huilianyi.enable.employee.stop")/*启用后，差旅申请单审批通过后，员工可以修改行程。*/}</span>
                        </div>
                        <div className='huilianyi-module'>
                            <div className='module-form-switch'>
                                <FormItem label={this.$t("form.setting.huilianyi.auto.stop")/*自动停用*/}>
                                    {getFieldDecorator('autoStop', {
                                        rules: [{
                                            required: true,
                                        }],
                                        valuePropName: 'checked',
                                        initialValue: autoStop.propertyValue === '1' || autoStop.propertyValue === 1 ? true : false
                                    })(
                                        <Switch disabled={disabled} onChange={(e) => this.onSwitchChange(e, 'autoStop')} />
                                    )}
                                </FormItem>
                            </div>
                            <div className='module-form-item'>
                                <span className='module-form-message'>{this.$t("form.setting.huilianyi.after.travel")/*差旅结束后*/}</span>
                                <FormItem  >
                                    {getFieldDecorator('autoStopDays', {
                                        rules: [{
                                            required: false,
                                        }],
                                        initialValue: autoStopDays.propertyValue
                                    })(
                                        <InputNumber size='small' min={0} precision={0} disabled={autoStopDaysDisabled} />
                                    )}
                                </FormItem>
                                <span className='module-form-message'>{this.$t("form.setting.huilianyi.after.days")/*天后系统自动停用*/}</span>
                            </div>
                            <Divider dashed />
                            <span className='huilianyi-note'>{this.$t("form.setting.huilianyi.after.enable.stop")/*启用后，差旅结束后，在设置天数内自动停用。*/}</span>
                        </div>
                        <div className='huilianyi-module'>
                            <FormItem label={this.$t("form.setting.huilianyi.allow.auto.stop")/*允许员工自行停用*/}>
                                {getFieldDecorator('employeeAutoStop', {
                                    rules: [{
                                        required: true,
                                    }],
                                    valuePropName: 'checked',
                                    initialValue: employeeAutoStop.propertyValue === '1' || employeeAutoStop.propertyValue === 1 ? true : false
                                })(
                                    <Switch disabled={disabled} />
                                )}
                            </FormItem>
                            <Divider dashed />
                            <span className='huilianyi-note'>
                                {this.$t("form.setting.huilianyi.enable.employee.stop")/*启用后，差旅申请单审批通过后，申请单内出现停用按钮，员工可自行停用差旅申请单。*/}
                            </span>
                        </div>
                        <div className='huilianyi-module'>
                            <div className='module-form-switch'>
                                <FormItem label={this.$t("form.setting.huilianyi.enable.employee.restart")/*允许员工重新启用*/}>
                                    {getFieldDecorator('employeeRestartUse', {
                                        rules: [{
                                            required: true,
                                        }],
                                        valuePropName: 'checked',
                                        initialValue: employeeRestartUse.propertyValue === '1' || employeeRestartUse.propertyValue === 1 ? true : false
                                    })(
                                        <Switch disabled={disabled} onChange={(e, key) => this.onSwitchChange(e, 'employeeRestartUse')} />
                                    )}
                                </FormItem>
                            </div>
                            <div className='module-form-item'>
                                <span className='module-form-message'>{this.$t("form.setting.huilianyi.after.restart")/*重新启用*/}</span>
                                <FormItem>
                                    {getFieldDecorator('employeeRestartDays', {
                                        rules: [{
                                            required: false,
                                        }],
                                        initialValue: employeeRestartDays.propertyValue
                                    })(
                                        <InputNumber size='small' min={0} precision={0} disabled={employeeRestartDaysDisabled} />
                                    )}
                                </FormItem>
                                <span className='module-form-message'>{this.$t("form.setting.huilianyi.after.days2")/*天后系统自动停用*/}</span>
                            </div>
                            <Divider dashed />
                            <span className='huilianyi-note'>
                                {this.$t("form.setting.huilianyi.employee.restart.apply")/*启用后，当申请单停用后，申请单内启用按钮，支持员工重新启用申请单。*/}
                            </span>
                        </div>
                        <div className='huilianyi-module'>
                            <FormItem label={this.$t("form.setting.huilianyi.book.ways")/*订票方式*/}>
                                {getFieldDecorator('bookingPreference', {
                                    rules: [{
                                        required: false
                                    }],
                                    initialValue: bookingPreference.propertyValue
                                })(
                                    <Select style={{ width: 250 }}
                                        placeholder={this.$t("common.please.select")/*请选择*/}
                                        getPopupContainer={triggerNode => triggerNode.parentNode}
                                        disabled={disabled}>
                                        <Option value='Consolidated'>{this.$t("form.setting.huilianyi.privilege.book.together")/*优先统一订票*/}</Option>
                                        <Option value="Individual">{this.$t("form.setting.huilianyi.privilege.book.alone")/*优先各自订票*/}</Option>
                                    </Select>
                                )}
                            </FormItem>
                            <Divider dashed />
                            <span className='huilianyi-note'>{this.$t("form.setting.huilianyi.book.default")/*为差旅申请设置订票方式默认值*/}</span>
                        </div>
                    </div>
                    <div className='form-setting-buttons'>
                        {isEditing ?
                            <div>
                                <Button type='primary' className='buttons-save' onClick={this.onFatherSaveClick}>
                                    {this.$t("common.save")/*保存*/}
                                </Button>
                                <Button type='primary' className='buttons-cancelEdit' onClick={this.cancelEditing}>
                                    {this.$t("form.setting.huilianyi.cancel.edit")/*取消编辑*/}
                                </Button>
                                <Button type='default'
                                    onClick={this.back}
                                >
                                    {this.$t("common.back")/*返回*/}
                                </Button>
                            </div>
                            :
                            <div>
                                <Button type='primary' className='buttons-edit' onClick={this.editClicked}>{this.$t("common.edit")/*编辑*/}</Button>
                                <Button type='default'
                                    onClick={this.back()}
                                >{this.$t("common.back")/*返回*/}</Button>
                            </div>
                        }

                    </div>
                </Form>
            </div>
        )
    }
}
HuilianyiManagement.contextTypes = {
    router: PropTypes.object
};
function mapStateToProps(state) {
    return {}
}
const wrappedNewContract = Form.create()(HuilianyiManagement);
export default connect(mapStateToProps, null, null, { withRef: true })(wrappedNewContract);

