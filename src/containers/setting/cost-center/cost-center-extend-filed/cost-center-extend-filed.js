/**
 * Created by zhouli on 18/3/13
 * Email li.zhou@huilianyi.com
 */
//成本中心扩展字段
import React from 'react';
import { connect } from 'dva';

import CCEFService from 'containers/setting/cost-center/cost-center-extend-filed/cost-center-extend-filed.service';
import 'styles/setting/cost-center/cost-center-extend-filed/cost-center-extend-filed.scss'
import ExtendFieldComponent from 'widget/Template/extend-field-setting/extend-field';
import {
    message
} from 'antd'

import { routerRedux } from 'dva/router';

const extendFieldDefault = {
    "formName": "成本中心项附加信息",//成本中心项附加信息
    "iconName": "cost_center_item_info",
    "messageKey": "cost_center_item_form",
    "formType": 6001,
    "formCode": "cost_center_item_form",
    "asSystem": false,
    "valid": true,
    "parentOID": null,
    "associateExpenseReport": false,
    "customFormFields": [],
    "remark": "成本中心项附加信息",//成本中心项附加信息
    "referenceOID": null,
    "visibleExpenseTypeScope": 1001,
    "visibleUserScope": 1001
};
class CostCenterExtendFiled extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isNeedNew: false,//是否需要新增
            loading: false,
            data: [],
            customFromOriginList: [],//可以选择表单类型
            customFrom: {},//配置的表单
        };
    }

    componentWillMount() {
    }

    componentDidMount() {
        this.getWidgetList();
        this.getCustomForm();
    }
    //获取表单字段类型
    getWidgetList = () => {
        CCEFService.getWidgetList({ type: 1003 })
            .then((res) => {
                let list = [];
                res.data.map((item) => {
                    if (item.messageKey === "cust_list") {
                        list.push(item)
                    }
                })
                this.setState({
                    customFromOriginList: list
                })
            })
    }
    createOrUpdate = (form) => {
        let isNeedNew = this.state.isNeedNew;
        if (isNeedNew) {
            this.createCustomForm(form)
        } else {
            this.updateCustomForm(form)
        }
    }
    //创建表单
    createCustomForm = (form) => {
        this.setState({
            loading: true,
        })
        CCEFService.createCustomForm(form)
            .then((res) => {
                message.success(this.$t("extend-field-updated"));
                this.setState({
                    loading: false,
                })
            })
    }
    //更新表单
    updateCustomForm = (form) => {
        this.setState({
            loading: true,
        })
        CCEFService.updateCustomForm(form)
            .then((res) => {
                message.success(this.$t("extend-field-updated"));
                this.setState({
                    loading: false,
                })
            })
    }
    //取消
    cancel = () => {
        this.context.router.goBack();
    }
    //获取表单
    getCustomForm = () => {
        //如果没有需要前端初始化创建
        this.setState({
            loading: true
        })
        CCEFService.getCustomForm()
            .then((res) => {
                if (res.data) {
                    let customFrom = res.data;
                    if (customFrom.customFormFields.length > 0) {
                        customFrom.customFormFields[0]._active = true;
                    }
                    this.setState({
                        isNeedNew: false,
                        loading: false,
                        customFrom,
                    })
                } else {
                    this.setState({
                        isNeedNew: true,
                        loading: false,
                        customFrom: extendFieldDefault
                    })
                }
            })
            .catch((res) => {
                this.setState({
                    loading: false
                })
            })
    }
    render() {
        return (
            <div className="cost-center-extend-filed">
                <ExtendFieldComponent
                    loading={this.state.loading}
                    filedMax={10}
                    cancel={this.cancel}
                    rightIsShow={this.props.tenantMode}
                    bottomBtnIsShow={this.props.tenantMode}
                    leftDragable={this.props.tenantMode}
                    saveFrom={this.createOrUpdate}
                    customFrom={this.state.customFrom}
                    customFromOriginList={this.state.customFromOriginList}
                />
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        profile: state.user.profile,
        user: state.user.currentUser,
        tenantMode: true,
        company: state.user.company,
    }
}

export default connect(mapStateToProps, null, null, { withRef: true })(CostCenterExtendFiled);
