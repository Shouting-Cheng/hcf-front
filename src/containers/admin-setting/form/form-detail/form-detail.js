
import React from 'react'
import { connect } from 'dva'
import { Tabs, Spin } from 'antd'
const TabPane = Tabs.TabPane;
// import FormDetailBase from 'containers/admin-setting/form/form-detail/form-detail-base'
// import FormDetailCustom from 'containers/setting/form/form-detail/form-detail-custom/form-detail-custom'
// import FormPermission from 'containers/setting/form/form-detail/form-permission/form-permission'
// import FormSetting from 'containers/setting/form/form-detail/form-setting/form-setting'
// import FormMatch from "containers/setting/form/form-detail/form-match/form-match"
import 'styles/setting/form/form-detail.scss'
import formService from 'containers/admin-setting/form/form.service'
import PropTypes from 'prop-types'

class FormDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nowTab: 'base',
            formType: null,
            formOID: null,
            booksID: null, //账套id
            loading: false,
            form: null,
            propertyList: [],
            expenseTypeScope: {},
            userScope: {},
            matchFormData: {}
        }
    };

    componentWillMount() {
        const { formType, formOID, booksID } = this.props.match.params;
        if (formType) {
            this.setState({
                formType,
                formOID: null,
                nowTab: 'base'
            });
        }
        if (booksID) {
            this.setState({ booksID });
        }
        if (formOID) {
            this.setDetailByFormOID(formOID);
        }
    }

    setDetailByFormOID = (formOID) => {
        this.setState({ loading: true }, () => {
            Promise.all([
                formService.getFormDetail(formOID),
                formService.getExpenseTypeScope(formOID, 99),
                formService.getUserScope(formOID),
                formService.getFormPropertyList(formOID)
            ]).then(res => {
                this.setState({
                    nowTab: 'custom',
                    loading: false,
                    formOID,
                    form: res[0].data,
                    formType: res[0].data.formType,
                    expenseTypeScope: res[1].data,
                    userScope: res[2].data,
                    propertyList: res[3].data
                })
            })
        })
    };

    //刷新基本信息
    refreshBase = (formOID) => {
        if (formOID) {
            this.setState({ loading: true }, () => {
                Promise.all([
                    formService.getFormDetail(formOID),
                    formService.getFormPropertyList(formOID)
                ]).then(res => {
                    this.setState({
                        loading: false,
                        form: res[0].data,
                        propertyList: res[1].data
                    })
                })
            })
        }
    };

    //Tabs点击
    onChangeTabs = (key) => {
        this.setState({ nowTab: key });
    };
    /**
     * 获取表单设置页面的数据
     */
    refreshMacthData = (data) => {
        this.setState({
            matchFormData: data
        })
    }
    renderTabs() {
        let tabs = [
            { key: 'base', name: this.$t('form.setting.base.info')/*基本信息*/ }
        ];
        this.props.match.params.formOID && tabs.push({ key: 'custom', name: this.$t('form.setting.detail.info')/*详情设置*/ });
        this.props.match.params.formOID && tabs.push({ key: 'permission', name: this.$t('form.setting.permission.setting')/*权限分配*/ });
        this.state.formType === 2001 && tabs.push({ key: 'form', name: this.$t('form.setting.properties.setting')/*表单配置*/ });
        this.state.formType === 801001 && tabs.push({ key: 'match', name: this.$t('form.setting.match')/*表单设置*/ })
        return (
            tabs.map(tab => {
                return <TabPane tab={tab.name} key={tab.key} />
            })
        )
    }

    handleNew = (form) => {
        this.setDetailByFormOID(form.formOID)
    };

    //刷新分配公司，人员，费用的数据
    refreshData = (type) => {
        const { formOID } = this.props.match.params;
        if (type === 'company' && formOID) {
            this.setState({ loading: true }, () => {
                Promise.all([
                    formService.getFormDetail(formOID)
                ]).then(res => {
                    this.setState({
                        loading: false,
                        form: res[0].data
                    })
                })
            })
        }
        if (type === 'user' && formOID) {
            this.setState({ loading: true }, () => {
                Promise.all([
                    formService.getUserScope(formOID)
                ]).then(res => {
                    this.setState({
                        loading: false,
                        userScope: res[0].data
                    })
                })
            })
        }
        if (type === 'expense' && formOID) {
            this.setState({ loading: true }, () => {
                Promise.all([
                    formService.getExpenseTypeScope(formOID, 99)
                ]).then(res => {
                    this.setState({
                        loading: false,
                        expenseTypeScope: res[0].data
                    })
                })
            })
        }
    };

    getChildContext() {
        return {
            formType: Number(this.state.formType),
            formOID: this.state.formOID,
            booksID: this.state.booksID,
            form: this.state.form,
            propertyList: this.state.propertyList,
            expenseTypeScope: this.state.expenseTypeScope,
            userScope: this.state.userScope
        }
    }

    pageJump = (param) => {
        if (param) {
            this.setState({ nowTab: 'custom' })
        }
    };

    render() {
        const { nowTab, loading, matchFormData } = this.state;
        const { formOID } = this.props.match.params;
        return (
            <div className="form-detail">
                {loading ? <Spin /> : (
                    <div>
                        <Tabs onChange={this.onChangeTabs} activeKey={nowTab}>
                            {this.renderTabs()}
                        </Tabs>
                        {/* {nowTab === 'base' && <FormDetailBase handleNew={this.handleNew} refreshBase={this.refreshBase} />} */}
                        {/* {nowTab === 'custom' && <FormDetailCustom />}
                        {nowTab === 'permission' && <FormPermission refreshData={this.refreshData} />}
                        {nowTab === 'form' && <FormSetting formOID={formOID} handlePageJump={this.pageJump} />}
                        {nowTab === 'match' && <FormMatch refreshMacthData={this.refreshMacthData} />} */}
                    </div>
                )}
            </div>
        )
    }
}

FormDetail.childContextTypes = {
    formType: PropTypes.any,
    formOID: PropTypes.string,
    booksID: PropTypes.string,
    form: PropTypes.object,
    propertyList: PropTypes.array,
    expenseTypeScope: PropTypes.object,
    userScope: PropTypes.object,
    handlePageJump: PropTypes.func
};

function mapStateToProps(state) {
    return {
        tenantMode: true
    }
}

export default connect(mapStateToProps, null, null, { withRef: true })(FormDetail)
