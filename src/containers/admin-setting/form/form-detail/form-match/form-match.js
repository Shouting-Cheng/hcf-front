import React from 'react';
import { Input, Col, Row, Form, Radio, Checkbox, Select, Button, message } from 'antd';
import RadioGroup from 'antd/lib/radio/group';
import ListSelector from 'widget/list-selector'
import { connect } from 'dva';
import formService from 'containers/admin-setting/form/form.service'
import config from 'config';
// import menuRoute from 'routes/menuRoute'
import PropTypes from 'prop-types'
const FormItem = Form.Item;
const Option = Select.Option;


class FormMatch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isRelation: false,
            paymentTypeVal: '全部类型',
            applyTypeVal: '全部类型',
            selectDisabled: true,
            listNumber: 0,
            listVisible: false,
            extraParams: {},
            applyTypeDisabled: true,
            applyListVisible: false,
            selectorItem: {},
            paymentSelectorItem: {
                title: "付款用途",
                url: `${config.baseUrl}/api/expense/form/assign/cash/transaction/classes/query`,
                searchForm: [
                    {
                        type: 'input', label: '账套', id: 'setOfBookId', defaultValue: this.props.company.setOfBooksId, disabled: true
                    },
                    {
                        type: 'input', label: '现金事务分类', id: 'classCode'
                    },
                    {
                        type: 'input', label: '现金事务分类名称', id: 'description'
                    },
                    {
                        type: 'select', label: '查看', id: 'range', defaultValue: 'all', options: [
                            { label: '已选', value: 'selected' },
                            { label: '未选', value: 'notChoose' },
                            { label: '全部', value: 'all' }
                        ]
                    }
                ],
                columns: [
                    { title: '现金事务分类代码', dataIndex: 'classCode' },
                    { title: '现金事务分类名称', dataIndex: 'description' }
                ],
                key: 'id'
            },
            applyTypeSelectorItem: {
                title: '关联申请单',
                url: `${config.baseUrl}/api/custom/forms/getCustomFormByRange`,
                searchForm: [
                    { type: 'input', label: '申请单类型名称', id: 'formName' },
                    {
                        type: 'select', label: '查看', id: 'range', defaultValue: 'all', options: [
                            { label: '已选', value: 'selected' },
                            { label: '未选', value: 'notChoose' },
                            { label: '全部', value: 'all' }
                        ]
                    }
                ],
                columns: [
                    { title: '申请单类型名称', dataIndex: 'formName' },
                ],
                key: 'id',
                listKey: 'records'
            },
            isApply: false,
            isApplyType: false,
            isCashTransactionClass:false,
            applyIds: [],
            cashTransactionIds: [],
            isCommon: false,
            // formMenu: menuRoute.getRouteItem('form-list', 'key'),    //表单管理
            relatedChecked:false
        }

    }
    componentWillMount() {
        const { form } = this.context;
        this.setState({isCommon: form.sameContract});
        if (form.needApply) {
            this.setState({
                isApply: true
            })
        }
        if(form.applyIds){
            this.setState({
                applyTypeDisabled: false,
                isApplyType:true,
                applyIds:form.applyIds,
                applyTypeVal: `已选择${form.applyIds.length}个类型`
            })
        }else{
            this.setState({
                isApplyType:false,
                applyTypeDisabled: true,
                applyTypeVal: "全部类型"
            })
        }
        // 付款用途初始化值
        if (form.cashTransactionIds) {
            this.setState({
                selectDisabled: false,
                isCashTransactionClass:true,
                transactionClassIdList:form.cashTransactionIds,
                cashTransactionIds:form.cashTransactionIds,
                paymentTypeVal: `已选择${form.cashTransactionIds.length}个类型`
            });
        } else {
            this.setState({
                selectDisabled: true,
                isCashTransactionClass:false,
                paymentTypeVal: "全部类型"
            });
        }
        //是否关联合同
        if (form.relatedContract) {
            this.setState({
                isRelation: true
            })
        }

    }
    //是否可关联
    needApplyFun = (e) => {
        if (e.target.value === true) {
            this.setState({
                isApply: true
            })
        } else {
            this.setState({
                isApply: false
            })
        }
    }
    //是否选择关联合同
    normContract = (e) => {
        this.setState({
            relatedChecked:e.target.value,
        },()=>{
            if (e.target.checked) {
                this.setState({
                    isRelation: true
                })
            } else {
                this.setState({
                    isRelation: false
                })
            }
        })
        
    }
    //是否关联相同的合同
    commonContract = (e) => {
        if (e.target.checked) {
            this.setState({
                isCommon: true,
            })
        } else {
            this.setState({
                isCommon: false,
            })
        }
    }
    //切换付款方式类型
    paymentFun = (e) => {
        if (e.target.value === false) {
            this.setState({
                selectDisabled: false,
                paymentTypeVal: `已选择了0个类型`,
            })
        } else {
            this.setState({
                selectDisabled: true,
                paymentTypeVal: '全部类型',
                cashTransactionIds: []
            })
        }

    }
    //获取付款用途弹框列表
    getCashIds = () => {
        this.select.blur();
        const { paymentSelectorItem } = this.state;
        this.setState({
            isApplyType: false,
            extraParams: {
                transactionClassIdList: this.state.transactionClassIdList||[]
            },
        }, () => {
            this.setState({
                listVisible: true,
                selectorItem: paymentSelectorItem
            })

        })
    }
    //返回
    backFun = () => {
        // this.context.router.push(this.state.formMenu.url)
    }
    //关闭弹出框
    showListSelector = () => {
        this.setState({
            listVisible: false
        })
    }
    //弹出框确定
    handleListOk = (result) => {
        const { isApplyType, applyIds, cashTransactionIds } = this.state;
        const resultVal = result.result;
        const arrayList = [];
        resultVal.map(item => {
            arrayList.push(item.id)
        })
        if (isApplyType) {
            this.setState({
                listVisible: false,
                applyTypeVal: `已选择${result.result.length}个类型`,
                applyIds: arrayList
            })
        } else {
            this.setState({
                listVisible: false,
                paymentTypeVal: `已选择${result.result.length}个类型`,
                cashTransactionIds: arrayList
            })
        }

    }
    //切换可关联申请单类型
    applyFun = (e) => {
        if (e.target.value === false) {
            this.setState({
                applyTypeDisabled: false,
                applyTypeVal: `已选择了0个类型`
            });
        } else {
            this.setState({
                applyTypeDisabled: true,
                applyTypeVal: '全部类型',
                applyIds:[]
            });
        }

    }
    /**
     * 选择可关联申请类型的值
     * 
     */
    getApplyIds = () => {
        this.applyTypeSelect.blur();
        const { applyTypeSelectorItem } = this.state;
        this.setState({
            isApplyType: true,
            extraParams: {
                companyId: this.props.company.id,
                formCode: '',
                idList: this.state.applyIds
            },
        }, () => {
            this.setState({
                listVisible: true,
                selectorItem: applyTypeSelectorItem
            })
        })
    }
    /**
     * 保存表单设置的值
     */
    save = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const { applyIds, cashTransactionIds, isRelation, isCommon } = this.state;
                const { form } = this.context;
                const formVal = {
                    ...form,
                    allowAultipleConnections: values.allowAultipleConnections,
                    applicationFormBasis: values.applicationFormBasis,
                    applyIds: applyIds,
                    budgetManagement: values.budgetManagement,
                    cashTransactionIds: cashTransactionIds,
                    contractPosition: values.contractPosition,
                    multipleReceivables: values.multipleReceivables,
                    needApply: values.needApply,
                    payeeType: values.payeeType,
                    paymentMethod: values.paymentMethod,
                    relatedContract: isRelation,
                    sameApplicationForm: values.sameApplicationForm,
                    sameContract: isCommon
                }
                formService.saveFormDetail(formVal).then(res => {
                    if (res.status === 200) {
                        message.success("表单设置保存完成");
                        this.props.refreshMacthData(formVal)
                    }
                }).catch(e => {
                    let error = e.response.data;
                    message.error(`${messages('common.save.filed')}，${error.message}`)
                })
            }
        })

    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const { form } = this.context;
        const { isRelation, paymentTypeVal, selectDisabled, listVisible, selectorItem, extraParams, applyTypeDisabled, applyTypeVal, applyListVisible, isApply,relatedChecked } = this.state;
        return (
            <div className="form-permission">
                <Form style={{ marginBottom: '20px' }} onSubmit={this.save}>
                    <div className="info-title">
                        关联申请设置
                    </div>
                    <FormItem>
                        <Row>
                            <Col span={8} offset={2}>
                                {getFieldDecorator('needApply', {
                                    initialValue: form.needApply,

                                })(
                                    <RadioGroup onChange={this.needApplyFun}>
                                        <Radio value={true}>可关联</Radio>
                                        <Radio value={false}>不可关联</Radio>
                                    </RadioGroup>
                                )}
                            </Col>
                        </Row>
                    </FormItem>
                    {isApply && <div>
                        <div className="info-title">
                            关联次数限制
                        </div>
                        <FormItem>
                            <Row>
                                <Col span={8} offset={2}>
                                    {getFieldDecorator('allowAultipleConnections', {
                                        initialValue: form.allowAultipleConnections,
                                    })(
                                        <Checkbox
                                        defaultChecked={form.allowAultipleConnections}
                                    >
                                        同一申请允许多次关联
                                    </Checkbox>
                                    )}
                                </Col>
                            </Row>
                        </FormItem>
                        <div className="info-title">
                            关联申请单依据
                        </div>
                        <FormItem>
                            <Row>
                                <Col span={8} offset={2}>
                                    {getFieldDecorator('applicationFormBasis', {
                                        initialValue: form.applicationFormBasis,
                                    })(
                                        <RadioGroup>
                                            <Radio value={1}>报账单头公司=申请单头公司</Radio>
                                            <Radio value={2}>报账单头部门=申请单头部门</Radio>
                                            <Radio value={3}>报账单头公司+头部门=申请单头公司+头部门</Radio>
                                            <Radio value={4}>报账单头申请人=申请单头申请人</Radio>
                                        </RadioGroup>
                                    )}
                                </Col>
                            </Row>
                        </FormItem>
                        <div className="info-title">
                            可关联申请类型
                        </div>
                        <FormItem>
                            <Row>
                                <Col span={8} offset={2}>
                                    <RadioGroup onChange={this.applyFun} defaultValue={!this.state.isApplyType}>
                                        <Radio value={true}>全部类型</Radio>
                                        <Radio value={false}>部分类型</Radio>
                                    </RadioGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={8} offset={2}>
                                    {getFieldDecorator('applyIds', {
                                        initialValue: "val1",

                                    })(
                                        <Select ref={ref => this.applyTypeSelect = ref} disabled={applyTypeDisabled} onFocus={this.getApplyIds}>
                                            <Option value="val1">{applyTypeVal}</Option>
                                        </Select>
                                    )}

                                </Col>
                            </Row>
                        </FormItem>
                    </div>
                    }
                    <div className="info-title">
                        预算管控设置
                    </div>
                    <FormItem>
                        <Row>
                            <Col span={8} offset={2}>
                                {getFieldDecorator('budgetManagement', {
                                    initialValue: form.budgetManagement
                                })(
                                    <RadioGroup>
                                        <Radio value={true}>启用</Radio>
                                        <Radio value={false}>不启用</Radio>
                                    </RadioGroup>
                                )}
                            </Col>
                        </Row>
                    </FormItem>
                    <div className="info-title">
                        关联合同设置
                        </div>
                    <FormItem>
                        <Row>
                            <Col span={8} offset={2}>
                                {getFieldDecorator('relatedContract', {
                                    initialValue: form.relatedContract,
                                })(
                                    <Checkbox
                                        defaultChecked={form.relatedContract}
                                        onChange={this.normContract}
                                    >
                                        关联合同
                                    </Checkbox>
                                )}
                            </Col>
                        </Row>
                    </FormItem>
                    {isRelation && <div>
                        <div className="info-title">
                            合同布局位置
                         </div>
                        <FormItem>
                            <Row>
                                <Col span={8} offset={2}>
                                    {getFieldDecorator('contractPosition', { initialValue: form.contractPosition ? form.contractPosition : 'DOCUMENTS_LINE' })(
                                        <Select>
                                            <option value="DOCUMENTS_HEAD">付款行</option>
                                            <option value="DOCUMENTS_LINE">单据头</option>
                                        </Select>
                                    )}
                                </Col>
                            </Row>
                        </FormItem>
                    </div>
                    }
                    <div className="info-title">
                        收款方设置
                    </div>
                    <FormItem>
                        <Row>
                            <Col span={8} offset={2}>
                                {getFieldDecorator('multipleReceivables', {
                                    initialValue: form.multipleReceivables
                                })(
                                    <Checkbox defaultChecked={form.multipleReceivables}>支持多收款方</Checkbox>
                                )}
                            </Col>
                        </Row>
                    </FormItem>
                    <div className="info-title">
                        收款方属性
                    </div>
                    <FormItem>
                        <Row>
                            <Col span={8} offset={2}>
                                {getFieldDecorator('payeeType', { initialValue: form.payeeType })(
                                    <RadioGroup>
                                        <Radio value="EMPLOYEE">员工</Radio>
                                        <Radio value="VENDER">供应商</Radio>
                                        <Radio value="EMPLOYEE_VENDER">员工和供应商</Radio>
                                    </RadioGroup>
                                )}
                            </Col>
                        </Row>
                    </FormItem>
                    <div className="info-title">
                        付款方式类型设置
                    </div>
                    <FormItem>
                        <Row>
                            <Col span={8} offset={2}>
                                <span>付款方式类型</span>
                                {getFieldDecorator('paymentMethod', { initialValue: form.paymentMethod })(
                                    <Select>
                                        <Option value="ONLINE_PAYMENT">线上</Option>
                                        <Option value="OFFLINE_PAYMENT">线下</Option>
                                        <Option value="EBANK_PAYMENT">落地文件</Option>
                                    </Select>
                                )}
                            </Col>
                        </Row>
                    </FormItem>
                    <div className="info-title">
                        付款用途
                    </div>
                    <FormItem>
                        <Row>
                            <Col span={8} offset={2}>
                                <RadioGroup onChange={this.paymentFun} defaultValue={!this.state.isCashTransactionClass}>
                                    <Radio value={true}>全部类型</Radio>
                                    <Radio value={false}>部分类型</Radio>
                                </RadioGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8} offset={2}>
                                {getFieldDecorator('cashTransactionIds', {
                                    initialValue: 'val1',

                                })(
                                    <Select ref={ref => this.select = ref} disabled={selectDisabled} onFocus={this.getCashIds}>
                                        <Option value="val1">{paymentTypeVal}</Option>
                                    </Select>
                                )}

                            </Col>
                        </Row>
                    </FormItem>
                    <div className="info-title">
                        核销依据
                    </div>
                    <FormItem>
                        <Row>
                            <Col span={8} offset={2}>
                                {getFieldDecorator('sameApplicationForm', {
                                    initialValue: form.sameApplicationForm
                                })(
                                    <Checkbox  defaultChecked={form.sameApplicationForm}>关联相同申请单</Checkbox>
                                )}
                            </Col>
                        </Row>
                    </FormItem>
                    <FormItem>
                        <Row>
                            <Col span={8} offset={2}>
                                {getFieldDecorator('sameContract', {
                                    initialValue: form.sameContract,

                                })(
                                    <Checkbox  defaultChecked={form.sameContract} onChange={this.commonContract}>关联相同合同</Checkbox>
                                )}
                            </Col>
                        </Row>
                    </FormItem>
                    <Row>
                        <Col span={8} offset={2}>
                            <Button type="primary" htmlType="submit" style={{ marginRight: '20px' }}>保存</Button>
                            <Button type="default" onClick={this.backFun}>返回</Button>
                        </Col>

                    </Row>
                </Form>
                <ListSelector
                    visible={listVisible}
                    selectorItem={selectorItem}
                    onCancel={this.showListSelector}
                    extraParams={extraParams}
                    method={'post'}
                    onOk={this.handleListOk}

                />

            </div>
        )
    }

}
function mapStateToProps(state) {
    return {
        company: state.user.company,
        language:state.languages.languages,
        languageList: state.languages.languageList,
        user: state.user.currentUser,
        tenantMode: true

    }
}
FormMatch.contextTypes = {
    formType: PropTypes.any,
    formOID: PropTypes.string,
    booksID: PropTypes.string,
    form: PropTypes.object,
    propertyList: PropTypes.array,
    router: PropTypes.object
};

const wrapperFormMatch = Form.create()(FormMatch)
export default connect(mapStateToProps, null, null, { withRef: true })(wrapperFormMatch)