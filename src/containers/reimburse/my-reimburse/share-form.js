import React, { Component } from "react"
import { Modal, Form, Input, Select, InputNumber } from "antd"
import { connect } from 'dva';
const FormItem = Form.Item;
import reimburseService from 'containers/reimburse/my-reimburse/reimburse.service'
import SelectApplication from 'containers/reimburse/my-reimburse/select-application'
import Chooser from 'containers/reimburse/my-reimburse/chooser'

class ShareForm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            companyList: [],
            departmentList: [],
            typeList: [],
            data: {},
            defaultApportion: {},
            model: {},
            isNew: true,
            showSelectApplication: false,
            applincationParams: {},
            application: {},
            selectedData: []
        }
    }

    componentDidMount() {
        reimburseService.getCompanyList(this.props.company.setOfBooksId).then(res => {
            this.setState({ companyList: res.data });
        });
        reimburseService.getDepartmentList().then(res => {
            this.setState({ departmentList: res.data });
        });
    }

    componentWillReceiveProps(newProps) {
        if (newProps.visible && !this.props.visible) {
            this.setState({
                visible: newProps.visible,
                typeList: newProps.typeList,
                defaultApportion: newProps.defaultApportion,
                model: newProps.model,
                isNew: JSON.stringify(newProps.model) == "{}"
            }, () => {
                if (!this.state.isNew) {
                    this.setState({ application: { id: newProps.model.applicationId, businessCode: newProps.model.applicationCode } });
                }
            });
        }

        if (!newProps.visible && this.props.visible) {
            this.setState({ visible: newProps.visible });
        }
    }

    handleOk = () => {
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }

            values = {
                ...this.state.model,
                ...values
            }

            values.applicationId = this.state.application.id;
            values.applicationCode = this.state.application.businessCode;

            this.props.handleOk && this.props.handleOk(values, this.state.isNew);
            this.setState({ application: {} });
            this.props.form.resetFields();
        })

    }

    handleCancel = () => {
        this.props.handleCancel && this.props.handleCancel();
        this.setState({ application: {} });
        this.props.form.resetFields();
    }

    checkCost = () => {
        let cost = this.props.form.getFieldValue("cost");
        cost = this.toDecimal2(cost);

        this.props.form.setFieldsValue({ cost: cost ? cost : "0.00" });
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

    //成本中心得到焦点时
    handleFocus = (oid) => {
        if (this.state.data[oid]) return;

        let data = {};
        reimburseService.getCostList(oid).then(res => {
            data[oid] = res.data;
            this.setState({ data });
        })
    }

    //选择申请单
    showSelectApplication = () => {

        this.props.form.getFieldInstance('applicationId').blur();

        this.setState({ showSelectApplication: true, applincationParams: this.props.headerData, selectedData: this.state.application.id ? [this.state.application.id] : [] });


    }

    //选择申请单后的回调
    handleListOk = (values) => {
        if (values && values.result && values.result.length) {
            this.setState({ application: values.result[0], showSelectApplication: false, applincationParams: {} }, () => {
                let application = this.state.application;
                this.props.form.setFieldsValue({
                    company: [{ id: application.companyId, name: application.companyName }],
                    department: [{ departmentId: application.departmentId, name: application.departmentName }],
                    cost: application.amount,
                    applicationId: { key: application.id, label: application.businessCode }
                });
            });
        }
        else {
            this.setState({ application: {}, showSelectApplication: false, applincationParams: {} }, () => {
                let application = this.state.application;
                this.props.form.setFieldsValue({
                    company: [{ id: application.companyId, name: application.companyName }],
                    department: [{ departmentId: application.departmentId, name: application.departmentName }],
                    cost: 0.00,
                    applicationId: {key: "", label: ""}
                });
            });
        }
    }

    checkPrice = (rule, value, callback) => {
        if (value > 0) {
            callback();
            return;
        }
        callback('金额不能小于等于0！');
    }

    render() {
        const { visible, companyList, application, applincationParams, showSelectApplication, isNew, model, departmentList, typeList, data, defaultApportion, selectedData } = this.state;
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                span: 6,
            },
            wrapperCol: {
                span: 14,
                offset: 0
            },
        };
        return (
            <div>
                <Modal
                    className="select-cost-type"
                    title="新建分摊"
                    visible={visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    width="45%">
                    {visible && <Form>
                        {
                            this.props.flag &&
                            <FormItem {...formItemLayout}
                                label="关联申请单">
                                {getFieldDecorator("applicationId", {
                                    initialValue: isNew ? { key: "", label: "" } : { key: model.applicationId, label: model.applicationCode },
                                    rules: [{ message: "请选择", required: true }]
                                })(
                                    <Select labelInValue onFocus={this.showSelectApplication}>
                                    </Select>)
                                }
                            </FormItem>
                        }
                        <FormItem {...formItemLayout}
                            label="公司">
                            {getFieldDecorator("company", {
                                initialValue: isNew ? (this.props.flag ? [] : [{ id: defaultApportion.companyId, name: defaultApportion.companyName }]) : [{ id: model.company.id, name: model.company.name }],
                                rules: [{ message: "请选择", required: true }]
                            })(
                                <Chooser placeholder={this.$t({ id: "common.please.select" })}
                                    type="select_company_reimburse"
                                    labelKey="name"
                                    valueKey="id"
                                    disabled={this.props.flag}
                                    listExtraParams={{ tenantId: this.props.user.tenantId, setOfBooksId: this.props.company.setOfBooksId }}
                                    single={true} />
                                )
                            }
                        </FormItem>
                        <FormItem {...formItemLayout}
                            label="部门">
                            {getFieldDecorator("department", {
                                initialValue: isNew ? (this.props.flag ? [] : [{ departmentId: defaultApportion.departmentId, name: defaultApportion.departmentName }]) : [{ departmentId: model.department.departmentId, name: model.department.name }],
                                rules: [{ message: "请选择", required: true }]
                            })(
                                <Chooser placeholder={this.$t({ id: "common.please.select" })}
                                    type="department"
                                    labelKey="name"
                                    valueKey="departmentId"
                                    single={true}
                                    disabled={this.props.flag}
                                />
                                )
                            }
                        </FormItem>
                        <FormItem {...formItemLayout}
                            label="分摊金额">
                            {getFieldDecorator("cost", {
                                initialValue: isNew ? "" : model.cost,
                                rules: [{ validator: this.checkPrice }]
                            })(
                                <InputNumber disabled={model.defaultApportion} onBlur={this.checkCost} step={0.01} />
                                )
                            }
                        </FormItem>
                        {
                            typeList && typeList.map(item => {
                                return (
                                    <FormItem key={item.costCenterOid} {...formItemLayout}
                                        label={item.fieldName}>
                                        {getFieldDecorator(item.costCenterOid, {
                                            initialValue: isNew ? { key: item.costCenterItemId, label: item.costCenterItemName } : {
                                                key: model[item.costCenterOid].key, label: model[item.costCenterOid].label
                                            }
                                        })(
                                            <Select labelInValue onFocus={() => this.handleFocus(item.costCenterOid)}>
                                                {
                                                    data[item.costCenterOid] && data[item.costCenterOid].map(o => {
                                                        return (
                                                            <Select.Option key={parseInt(o.id)} value={parseInt(o.id)}>{o.name}</Select.Option>
                                                        )
                                                    })
                                                }
                                            </Select>
                                            )
                                        }
                                    </FormItem>
                                )
                            })
                        }
                    </Form>}
                </Modal>
                <SelectApplication
                    visible={showSelectApplication}
                    onCancel={() => { this.setState({ showSelectApplication: false, applincationParams: {} }) }}
                    onOk={this.handleListOk}
                    single={true}
                    params={{ applincationParams: this.state.applincationParams, show: showSelectApplication, type: this.props.type }}
                    selectedData={selectedData}
                />
            </div>

        )
    }
}
function mapStateToProps(state) {
    return {
        user: state.user.currentUser,
        company: state.user.company,
    }
}


export default connect(mapStateToProps, null, null, { withRef: true })((Form.create()(ShareForm)))
