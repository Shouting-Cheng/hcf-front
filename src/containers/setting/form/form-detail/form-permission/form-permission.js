
/**
 * Created by tanbingqin on 2018/6/7.
 */
import React from 'react'
import { connect } from 'dva'
import { Button, Input, Radio, Row, Col, message, Icon, Affix } from 'antd'
import formService from 'containers/setting/form/form.service'
// import menuRoute from 'routes/menuRoute'
import Chooser from 'widget/chooser'
import PermissionsAllocation from 'widget/Template/permissions-allocation'
import PropTypes from 'prop-types'
import { routerRedux } from 'dva/router'

const RadioGroup = Radio.Group;

class FormPermission extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading1: false,
            isEdit1: false,
            loading2: false,
            isEdit2: false,
            loading3: false,
            isEdit3: false,
            userValue: {
                type: 'all',
                values: []
            },
            canEditExpense: true, //是否可更改分配费用&分配人员
            expenseTypeValue: {
                type: 1001
            },
            visibleCompanyScope: 1, //1全部公司 2部分公司
            companySelectedList: [], //分配公司，如果是部分公司，则选中的公司对象
            visibleExpenseScope: 1001, //1001全部费用 1002部分费用
            expenseSelectedList: [] //自定义费用，如果是部分费用，则选中的费用对象
        }
    }

    componentWillMount() {
        this.initCompanyData();
        this.initUserData();
        this.initEditExpense();
        this.initExpenseData();
    }

    componentDidMount() {

    }

    //初始化分配公司数据，点击取消还原数据的时候也使用此初始化方法
    initCompanyData = () => {
        const { form } = this.context;
        let visibleCompanyScope = 1;
        if (form.visibleCompanyScope === 2) {
            visibleCompanyScope = 2;
        }
        let companySelectedList = [];
        if (form.companyList && form.companyList.length) {
            companySelectedList = form.companyList;
        }
        this.setState({ visibleCompanyScope, companySelectedList });
    };

    //初始化分配人员数据，点击取消还原数据的时候也使用此初始化方法
    initUserData = () => {
        const { userScope } = this.context;
        //分配人员数据初始化
        let permissionValueType;
        switch (userScope.visibleScope) {
            case 1001:
                permissionValueType = 'all';
                break;
            case 1002:
                permissionValueType = 'group';
                break;
            case 1003:
                permissionValueType = 'department';
                break;
        }
        let userSelectedList = [];
        let userValue = {
            type: permissionValueType,
            values: userSelectedList
        };
        if (userScope.departments) {
            userScope.departments.map(department => {
                userSelectedList.push({
                    label: department.path,
                    key: department.departmentOID,
                    value: department.departmentOID
                })
            });
            userValue.values = userSelectedList;
        }
        if (userScope.userGroups) {
            userScope.userGroups.map(userGroup => {
                userSelectedList.push({
                    label: userGroup.name,
                    key: userGroup.userGroupOID,
                    value: userGroup.userGroupOID
                })
            });
            userValue.values = userSelectedList;
        }
        this.setState({ userValue });
    };

    //初始化是否可分配费用
    initEditExpense = () => {
        const { form } = this.context;
        if ((form.formType === 3001 || form.formType === 3002 || form.formType === 3003) && form.referenceOID) {
            this.setState({
                canEditExpense: false
            });
        } else {
            this.setState({
                canEditExpense: true
            });
        }
    };

    //初始化分配费用数据，点击取消还原数据的时候也使用此初始化方法
    initExpenseData = () => {
        const { form, userScope, expenseTypeScope } = this.context;
        let visibleExpenseScope = expenseTypeScope.visibleScope;
        let expenseSelectedList = [];
        if (expenseTypeScope.expenseTypes && expenseTypeScope.expenseTypes.length) {
            expenseTypeScope.expenseTypes.map((item) => {
                expenseSelectedList.push(item);
            });
        }
        this.setState({ visibleExpenseScope, expenseSelectedList });
    };

    handleChangeCompany = (e) => {
        this.setState({
            visibleCompanyScope: e.target.value
        }, () => {
            this.setState({ companySelectedList: [] });
        });
    };

    handleSelectCompany = (value) => {
        console.log(value)
        this.setState({
            companySelectedList: value
        });
    };

    handleChangeExpense = (e) => {
        this.setState({
            visibleExpenseScope: e.target.value
        }, () => {
            this.setState({ expenseSelectedList: [] });
        });
    };

    handleSelectExpense = (value) => {
        this.setState({
            expenseSelectedList: value
        });
    };

    handleChangePermissions = (values) => {
        this.setState({ userValue: values });
    };

    //type company公司 user人员 expense费用
    //是否是点击 取消，bool，如果为true就要还原数据
    handleChangeStatus = (type, isCancel) => {
        if (type === 'company') {
            this.setState({
                isEdit1: !this.state.isEdit1
            });
            if (isCancel) {
                this.initCompanyData();
            }
        }
        if (type === 'user') {
            this.setState({
                isEdit2: !this.state.isEdit2
            });
            if (isCancel) {
                this.initUserData();
            }
        }
        if (type === 'expense') {
            this.setState({
                isEdit3: !this.state.isEdit3
            });
            if (isCancel) {
                this.initExpenseData();
            }
        }
    };

    //type company公司 user人员 expense费用
    handleSave = (type) => {
        const { form } = this.context;
        if (type === 'company') {
            //校验分配公司的选择
            if (this.state.visibleCompanyScope === 2 && !this.state.companySelectedList.length) {
                message.error('请选择要分配的公司');//请选择要分配的公司
                return
            }
            let permissionData = {};
            permissionData.customFormOID = form.formOID;
            permissionData.visibleCompanyScope = this.state.visibleCompanyScope;
            permissionData.companyOIDList = [];
            if (permissionData.visibleCompanyScope === 2) {
                this.state.companySelectedList.map((item) => {
                    permissionData.companyOIDList.push(item.companyOID);
                });
            }
            this.setState({ loading1: true });
            formService.setCompanyPermission(permissionData).then(res => {
                message.success(this.$t("common.save.success", { name: '' }));
                this.setState({ loading1: false });
                this.handleChangeStatus('company');
                this.props.refreshData('company');
            }).catch(error => {
                this.setState({ loading1: false });
                let errorMessage = this.$t('common.error');
                if (error.response && error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
                message.error(errorMessage);
            });
        }
        if (type === 'user') {
            //校验分配人员的选择
            if (this.state.userValue.type !== 'all' && !this.state.userValue.values.length) {
                message.error('请选择要分配的人员');//请选择要分配的人员
                return
            }
            let permissionData = {};
            permissionData.formOID = form.formOID;
            switch (this.state.userValue.type) {
                case 'all':
                    permissionData.visibleScope = 1001;
                    break;
                case 'group':
                    permissionData.visibleScope = 1002;
                    permissionData.userGroupOIDs = [];
                    permissionData.userGroups = [];
                    this.state.userValue.values.map(group => {
                        permissionData.userGroupOIDs.push(group.key);
                        permissionData.userGroups.push({
                            userGroupOID: group.key,
                            name: group.label
                        })
                    });
                    break;
                case 'department':
                    permissionData.visibleScope = 1003;
                    permissionData.departmentOIDs = [];
                    permissionData.departments = [];
                    this.state.userValue.values.map(department => {
                        permissionData.departmentOIDs.push(department.value);
                        permissionData.departments.push({
                            departmentOID: department.key,
                            path: department.label
                        })
                    });
                    break;
            }
            this.setState({ loading2: true });
            formService.updateUserScope(permissionData).then(res => {
                message.success(this.$t("common.save.success", { name: '' }));
                this.setState({ loading2: false });
                this.handleChangeStatus('user');
                this.props.refreshData('user');
            }).catch(error => {
                this.setState({ loading2: false });
                let errorMessage = this.$t('common.error');
                if (error.response && error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
                message.error(errorMessage);
            });
        }
        if (type === 'expense') {
            //校验分配费用的选择
            if (this.state.visibleExpenseScope === 1002 && !this.state.expenseSelectedList.length) {
                message.error('请选择要分配的费用');//请选择要分配的费用
                return
            }
            this.setState({ loading3: true });
            formService.updateExpenseTypeScope(form.formOID, this.state.expenseSelectedList, this.state.visibleExpenseScope).then(res => {
                message.success(this.$t("common.save.success", { name: '' }));
                this.setState({ loading3: false });
                this.handleChangeStatus('expense');
                this.props.refreshData('expense');
            }).catch(error => {
                this.setState({ loading3: false });
                let errorMessage = this.$t('common.error');
                if (error.response && error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
                message.error(errorMessage);
            });
        }
    };

    renderSobUser = () => {
        return (
            <Row>
                <Col span={16} offset={3}>
                    <div className="user-list-wrap-title">
                        <Icon type="info-circle" />
                        <span>{this.$t('form.setting.form.tip02')/*如需编辑适用人员，请前往相关联的申请单设置*/}</span>
                    </div>
                    <div className="user-list-wrap">
                        {this.renderUser(this.context.userScope)}
                    </div>
                </Col>
            </Row>
        )
    }
    renderTenantUser = () => {
        const { loading1, isEdit1, loading2, isEdit2, loading3, isEdit3, companySelectedList,
            visibleCompanyScope, expenseSelectedList, visibleExpenseScope, userValue } = this.state;
        return (
            <div>
                <Row>
                    <Col span={8} offset={3}>
                        <PermissionsAllocation onChange={this.handleChangePermissions}
                            disabled={!isEdit2}
                            mode="oid"
                            needEntity
                            hiddenComponents={this.props.tenantMode ? ["department"] : []}
                            value={userValue} />
                    </Col>
                </Row>
                <Row style={{ marginTop: 12, marginBottom: 20 }}>
                    <Col span={8} offset={3}>
                        {!isEdit2 && (
                            <Button type="primary" onClick={() => this.handleChangeStatus('user')}>{this.$t('common.edit')/*编辑*/}</Button>
                        )}
                        {isEdit2 && (
                            <div>
                                <Button style={{ marginRight: 20 }} type="primary" loading={loading2} onClick={() => this.handleSave('user')}>{this.$t('common.save')/*保存*/}</Button>
                                <Button onClick={() => this.handleChangeStatus('user', true)}>{this.$t('common.cancel')/*取消*/}</Button>
                            </div>
                        )}
                    </Col>
                </Row>

            </div>
        )
    }
    renderSobExpenseTypeScope = () => {
        return (
            <Row>
                <Col span={16} offset={3}>
                    <div className="expense-type-list-wrap-title">
                        <Icon type="info-circle" />
                        <span>{this.$t('form.setting.form.tip03')/*如需编辑可见费用类型，请前往相关联的申请单设置*/}</span>
                    </div>
                    <div className="expense-type-list-wrap">
                        {this.renderExpenseTypeScope(this.context.expenseTypeScope)}
                    </div>
                </Col>
            </Row>
        )
    }
    renderTenantExpenseTypeScope = () => {
        const { loading1, isEdit1, loading2, isEdit2, loading3, isEdit3, companySelectedList, visibleCompanyScope,
            expenseSelectedList, visibleExpenseScope, userValue } = this.state;
        return (
            <div>
                <Row>
                    <Col span={8} offset={3}>
                        <RadioGroup onChange={this.handleChangeExpense} value={visibleExpenseScope}>
                            <Radio disabled={!isEdit3} value={1001}>{this.$t('form.setting.form.allExpense')/*全部费用*/}</Radio>
                            <Radio disabled={!isEdit3} value={1002}>{this.$t('form.setting.form.partExpense')/*部分费用*/}</Radio>
                        </RadioGroup>
                        {visibleExpenseScope === 1002 &&
                            <Chooser placeholder={this.$t('common.please.select')}
                                type='available_expense'
                                labelKey='name'
                                valueKey='expenseTypeOID'
                                listExtraParams={{ setOfBooksId: this.props.tenantMode ? this.context.booksID : this.props.company.setOfBooksId }}
                                disabled={!isEdit3}
                                onChange={this.handleSelectExpense}
                                value={expenseSelectedList}
                                showNumber={true}
                                single={false} />
                        }
                    </Col>
                </Row>
                <Row style={{ marginTop: 12, marginBottom: 20 }}>
                    <Col span={8} offset={3}>
                        {!isEdit3 && (
                            <Button type="primary" onClick={() => this.handleChangeStatus('expense')}>{this.$t('common.edit')/*编辑*/}</Button>
                        )}
                        {isEdit3 && (
                            <div>
                                <Button style={{ marginRight: 20 }} type="primary" loading={loading3} onClick={() => this.handleSave('expense')}>{this.$t('common.save')/*保存*/}</Button>
                                <Button onClick={() => this.handleChangeStatus('expense', true)}>{this.$t('common.cancel')/*取消*/}</Button>
                            </div>
                        )}
                    </Col>
                </Row>
            </div>
        )
    }

    renderExpenseTypeScope = (expenseType) => {
        console.log(expenseType)
        if (expenseType.visibleScope === 1001) {
            return (
                <div>{this.$t('form.setting.form.allExpense')/*全部费用*/}</div>
            )
        }
        if (expenseType.visibleScope === 1002) {
            let len = this.state.expenseSelectedList.length;
            return this.state.expenseSelectedList.map((item, index) => {
                if (len - 1 === index) {
                    return (<div className="f-left">{item.name}</div>);
                } else {
                    return (<div className="f-left">{item.name}，</div>);
                }
            })
        }
    }

    renderUser = (users) => {
        console.log(users)
        if (users.visibleScope === 1001) {
            return (
                <div>{this.$t('form.setting.form.allCompany')/*全公司人员*/}</div>
            )
        }
        if (users.visibleScope === 1002) {
            let len = users.userGroups.length;
            return users.userGroups.map((item, index) => {
                if (len - 1 === index) {
                    return (<div className="f-left">{item.name}</div>);
                } else {
                    return (<div className="f-left">{item.name}，</div>);
                }
            })
        }
        if (users.visibleScope === 1003) {
            return (
                <div>部门</div>
            )
        }
    }
    goBack = () => {
        this.props.dispatch(
            routerRedux.push({
                pathname: `/admin-setting/form-list`,
            })
        );
    }

    render() {
        const { loading1, isEdit1, loading2, isEdit2, loading3, isEdit3, companySelectedList, visibleCompanyScope,
            expenseSelectedList, visibleExpenseScope, userValue, canEditExpense } = this.state;
        return (
            <div className="form-permission" style={{ paddingBottom: 50 }}>
                {this.props.tenantMode &&
                    <div>
                        <div className="info-title">{this.$t('form.setting.form.divide.company')/*分配公司*/}&nbsp;&nbsp;&nbsp;<span style={{ color: '#989898', fontSize: 14 }}>{this.$t('form.setting.form.tip04')/*当前账套下启用的公司*/}</span></div>
                        <Row>
                            <Col span={8} offset={3}>
                                <RadioGroup onChange={this.handleChangeCompany} value={visibleCompanyScope}>
                                    <Radio disabled={!isEdit1} value={1}>{this.$t('form.setting.form.allCompany2')/*全部公司*/}</Radio>
                                    <Radio disabled={!isEdit1} value={2}>{this.$t('form.setting.form.partCompany')/*部分公司*/}</Radio>
                                </RadioGroup>
                                {visibleCompanyScope === 2 &&
                                    <Chooser placeholder={this.$t('common.please.select')}
                                        type='available_company_setOfBooks'
                                        labelKey='name'
                                        valueKey='id'
                                        disabled={!isEdit1}
                                        onChange={this.handleSelectCompany}
                                        value={companySelectedList}
                                        listExtraParams={{ setOfBooksId: this.context.booksID, enabled: true }}
                                        showNumber={true}
                                        single={false} />
                                }
                            </Col>
                        </Row>
                        <Row style={{ marginTop: 12, marginBottom: 20 }}>
                            <Col span={8} offset={3}>
                                {!isEdit1 && (
                                    <Button type="primary" onClick={() => this.handleChangeStatus('company')}>{this.$t('common.edit')/*编辑*/}</Button>
                                )}
                                {isEdit1 && (
                                    <div>
                                        <Button style={{ marginRight: 20 }} type="primary" loading={loading1} onClick={() => this.handleSave('company')}>{this.$t('common.save')/*保存*/}</Button>
                                        <Button onClick={() => this.handleChangeStatus('company', true)}>{this.$t('common.cancel')/*取消*/}</Button>
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </div>
                }
                <div className="info-title">{this.$t('form.setting.form.divide.user')/*分配人员*/}</div>
                {canEditExpense && (
                    <div>
                        {this.props.tenantMode || this.context.form.fromType != 2 ? this.renderTenantUser() : this.renderSobUser()}
                    </div>
                )}
                {!canEditExpense && (
                    <Row>
                        <Col span={8} offset={3}>
                            <div>
                                {this.$t('form.setting.form.tip05')/*注：关联报销单的分配人员与申请单一致，如需更改请在申请单页面操作*/}
                            </div>
                        </Col>
                    </Row>
                )}
                <div className="info-title">
                    {this.$t('form.setting.form.tip08')/*可见费用类型*/}&nbsp;&nbsp;&nbsp;
          {this.props.tenantMode &&
                        <span style={{ color: '#989898', fontSize: 14 }}>{this.$t('form.setting.form.tip07')/*当前账套下启用的费用类型*/}</span>
                    }
                </div>
                {canEditExpense && (
                    <div>
                        {this.props.tenantMode || this.context.form.fromType != 2 ? this.renderTenantExpenseTypeScope() : this.renderSobExpenseTypeScope()}
                    </div>
                )}
                {!canEditExpense && (
                    <Row>
                        <Col span={8} offset={3}>
                            <div>
                                {this.$t('form.setting.form.tip06')/*注：关联报销单的费用类型与申请单一致，如需更改请在申请单页面操作*/}
                            </div>
                        </Col>
                    </Row>
                )}
                <div style={{ paddingLeft: '20px' }}>
                    <Affix offsetBottom={0} style={{
                        position: 'fixed', bottom: 0, marginLeft: '-35px', width: '100%', height: '50px',
                        boxShadow: '0px -5px 5px rgba(0, 0, 0, 0.067)', background: '#fff', lineHeight: '50px', zIndex: 1
                    }}>
                        <Button
                            type="primary"
                            onClick={this.goBack}
                            style={{ margin: '0 20px' }}
                        >
                            {this.$t('common.back' /*提 交*/)}
                        </Button>
                    </Affix>

                </div>
            </div>
        )
    }
}

FormPermission.propTypes = {
    refreshData: PropTypes.func
};

function mapStateToProps(state) {
    return {
        company: state.user.company,
        language: state.languages.languageList,
        tenantMode: true
    }
}

FormPermission.contextTypes = {
    formType: PropTypes.any,
    formOID: PropTypes.string,
    booksID: PropTypes.string,
    form: PropTypes.object,
    expenseTypeScope: PropTypes.object,
    userScope: PropTypes.object,
    propertyList: PropTypes.array,
    //   router: React.PropTypes.object
};

export default connect(mapStateToProps, null, null, { withRef: true })(FormPermission)
