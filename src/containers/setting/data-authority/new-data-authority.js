import React from 'react';
import { connect } from 'dva';
import { Button, Form, Divider, Input, Switch, Icon, Alert, Row, Col, Spin, message } from 'antd';
import LanguageInput from 'components/Widget/Template/language-input/language-input';
import LineModelChangeRules from 'containers/setting/data-authority/line-model-change-rule';
import DataAuthorityService from 'containers/setting/data-authority/data-authority.service';
import 'styles/setting/data-authority/data-authority.scss';
const FormItem = Form.Item;


class NewDataAuthority extends React.Component {
    constructor(props) {
        super(props);
        this.cardIndex = 0;
        this.targetKey = 0;
        this.state = {
            newChangeRulesRender: false,
            renderNewChangeRules: [],
            newDataPrams: {},
            isEditRule: false,
            formItemKey: '',
            /**单个保存成功后返回的数据规则组 */
            hasSaveRules: [],
            hasId: '',
            getRulesArr: [],
            dataScopeDesc: {
                '1001': { label: '全部' },
                '1002': { label: '当前' },
                '1003': { label: '当前及下属' },
                '1004': { label: '手动选择' }
            },
            filtrateMethodDesc: {
                'INCLUDE': { label: '包含' },
                'EXCLUDE': { label: '排除' },
            },
            sobValuesKeys: [],
            employeeKeys: [],
            companyItemsKeys:[],
            departMentItemsKeys:[]
        }

    }
    componentWillMount() {
        let param = this.props.params;
        if (param && JSON.stringify(param) === '{}') {
            this.setState({
                newDataPrams: param,
                renderNewChangeRules: []
            })
        } else {
            DataAuthorityService.getDataAuthorityDetail(param.id).then(res => {
                const { renderNewChangeRules } = this.state;
                const { getFieldDecorator } = this.props.form;
                renderNewChangeRules.push(
                    res.data.dataAuthorityRules.map(Item => (
                        <LineModelChangeRules
                            key={Item.id}
                            canceEditHandle={this.canceEditHandle}
                            targeKey={Item.id}
                            isEditRule={!this.state.isEditRule}
                            params={{
                                name: Item.dataAuthorityRuleName,
                                ruleDatail: Item.dataAuthorityRuleDetails,
                                deleted: res.data.deleted,
                                versionNumber: res.data.versionNumber,
                                createdBy: res.data.createdBy,
                                createdDate: res.data.createdDate,
                                lastUpdatedBy: res.data.lastUpdatedBy,
                                lastUpdatedDate: res.data.lastUpdatedDate,
                                ruleId: res.data.id,
                                getRulesArr: Item
                            }}
                            getFieldDecorator={getFieldDecorator}
                            form={this.props.form}
                            tenantId={this.props.company.tenantId}
                            newDataPrams={res.data}
                            hadleHasSaveRules={this.hadleHasSaveRules}
                            hasSaveEdit={this.hasSaveEdit}
                            handleTenantListOk={this.handleTenantListOk}
                            handleEmployeeListOk={this.handleEmployeeListOk}
                            handleCompanyListOk={this.handleCompanyListOk}
                            handleDePListOk={this.handleDePListOk}
                        />
                    ))
                );
                this.setState({
                    renderNewChangeRules,
                    newDataPrams: res.data
                })
            })

        }
    }

    onCancel = () => {
        this.props.close()
    }
    /**点击添加转换规则 */
    renderNewChangeRules = () => {
        const { getFieldDecorator } = this.props.form;
        const { renderNewChangeRules } = this.state;
        renderNewChangeRules.push(
            <LineModelChangeRules
                key={`new${this.cardIndex++}`}
                status="NEW"
                cancelHandle={this.cancelHandle}
                canceEditHandle={this.canceEditHandle}
                targeKey={`new${this.targetKey++}`}
                isEditRule={this.state.isEditRule}
                // saveNewRule={this.saveNewRule}
                getFieldDecorator={getFieldDecorator}
                form={this.props.form}
                tenantId={this.props.company.tenantId}
                newEditId={this.props.params ? this.props.params.id : undefined}
                newDataPrams={this.state.newDataPrams}
                hadleHasSaveRules={this.hadleHasSaveRules}
                hasSaveEdit={this.hasSaveEdit}
                hasId={this.state.hasId}
                handleTenantListOk={this.handleTenantListOk}
                handleEmployeeListOk={this.handleEmployeeListOk}
                handleCompanyListOk={this.handleCompanyListOk}
                handleDePListOk={this.handleDePListOk}

            />
        );
        this.setState({
            renderNewChangeRules,
        })
    }
    /**添加规则 */
    addApply = () => {
        this.renderNewChangeRules()
    }
    /**取消新添加的规则 */
    cancelHandle = (targetKey) => {
        let { renderNewChangeRules } = this.state;
        const card = renderNewChangeRules.filter(card => card.key !== targetKey);
        this.setState({
            renderNewChangeRules: card
        })
    }
    /**取消已经保存完成的规则 */
    canceEditHandle = (targetKey) => {
        DataAuthorityService.deletRuleItem(targetKey).then(res => {
            if (res.status === 200) {
                message.success('规则删除成功！')
            }
        })
        let { renderNewChangeRules } = this.state;
        if (renderNewChangeRules[0].length) {
            const card = renderNewChangeRules[0].filter(card => card.key !== targetKey);
            this.setState({
                renderNewChangeRules: card
            })
        } else {
            const card = renderNewChangeRules.filter(card => card.key !== targetKey);
            this.setState({
                renderNewChangeRules: card
            })
        }
    }
     //权限代码：多语言
     i18nNameChange = (name, i18nName) => {
        const newDataPrams = this.state.newDataPrams;
        newDataPrams.dataAuthorityName = name;
        if (!newDataPrams.i18n) {
            newDataPrams.i18n = {};
        }
        newDataPrams.i18n.dataAuthorityName = i18nName;
    };

    //权限说明：多语言
    i18nNameDes = (name, i18nName) => {
        const newDataPrams = this.state.newDataPrams;
        newDataPrams.description = name;
        if (!newDataPrams.i18n) {
            newDataPrams.i18n = {};
        }
        newDataPrams.i18n.description = i18nName;
    };

    /**
     * 单个权限是否已经保存并
     */
    hadleHasSaveRules = (dataAuthorityRules) => {
        this.setState({
            hasId: dataAuthorityRules[0].id,
            getRulesArr: dataAuthorityRules[0]
        });
    }
    hasSaveEdit = (getRulesArr) => {
        this.setState({ getRulesArr: getRulesArr })
    }
    /**listSlector弹窗关闭返回值 */
    handleTenantListOk = (sobValuesKeys) => {
        this.setState({
            sobValuesKeys: sobValuesKeys
        })
    }
    handleEmployeeListOk = (employeeKeys) => {
        this.setState({
            employeeKeys: employeeKeys
        })
    }
    handleCompanyListOk=(companyItemsKeys)=>{
        this.setState({
            companyItemsKeys:companyItemsKeys
        })
    }
    handleDePListOk=(departMentItemsKeys)=>{
        this.setState({
            departMentItemsKeys:departMentItemsKeys
        })
    }
    /**保存所有添加的规则 */
    handleSave = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let newDataPrams = this.state.newDataPrams;
                let renderNewChangeRules = this.state.renderNewChangeRules;
                let rules = [];
                for (let i = 0; i < renderNewChangeRules.length; i++) {
                    if (renderNewChangeRules[0].length && !renderNewChangeRules[i].props) {
                        rules = renderNewChangeRules[0]
                    } else {
                        rules = renderNewChangeRules
                    }
                }
                let getRulesArr = this.state.getRulesArr;
                let dataAuthorityRules = this.returnDataAuthorityRules(values, getRulesArr, rules);
                let params = {
                    id: newDataPrams.id ? newDataPrams.id : null,
                    i18n: null,
                    enabled: values.enabled,
                    tenantId: this.props.company.tenantId,
                    dataAuthorityCode: values.dataAuthorityCode,
                    dataAuthorityName: values.dataAuthorityName,
                    description: values.description,
                    dataAuthorityRules: rules.length ? (dataAuthorityRules.length ? dataAuthorityRules : undefined) : undefined,
                    deleted: false,
                    versionNumber: newDataPrams.versionNumber ? newDataPrams.versionNumber : undefined,
                    createdBy: newDataPrams.createdBy ? newDataPrams.createdBy : undefined,
                    createdDate: newDataPrams.createdDate ? newDataPrams.createdDate : undefined,
                    lastUpdatedBy: newDataPrams.lastUpdatedBy ? newDataPrams.lastUpdatedBy : undefined,
                    lastUpdatedDate: newDataPrams.lastUpdatedDate ? newDataPrams.lastUpdatedDate : undefined,
                }
                DataAuthorityService.saveDataAuthority(params).then(res => {
                    if (res.status === 200) {
                        this.props.close();
                        message.success('数据权限保存成功！')
                    }
                }).catch(e => {
                    message.error(e.response.data.message)
                })

            }
        })
    }
    returnDataAuthorityRules = (values, getRulesArr, rules) => {
        let dataAuthorityRules = [];
        let { dataScopeDesc, newDataPrams, filtrateMethodDesc,sobValuesKeys,employeeKeys,companyItemsKeys,departMentItemsKeys } = this.state;
        for (let i = 0; i < rules.length; i++) {
            dataAuthorityRules.push({
                i18n: null,
                dataAuthorityRuleName: values[`dataAuthorityRuleName-${rules[i].key}`],
                dataAuthorityRuleDetails: [
                    {
                        dataType: 'SOB',
                        dataScope: values[`dataScope1-${rules[i].key}`],
                        dataScopeDesc: values[`dataScope1-${rules[i].key}`] ? dataScopeDesc[values[`dataScope1-${rules[i].key}`]].label : undefined,
                        filtrateMethod: values[`filtrateMethod1-${rules[i].key}`] ? values[`filtrateMethod1-${rules[i].key}`] : undefined,
                        filtrateMethodDesc: values[`filtrateMethod1-${rules[i].key}`] ? filtrateMethodDesc[values[`filtrateMethod1-${rules[i].key}`]].label : null,
                        dataAuthorityRuleDetailValues: values[`filtrateMethod1-${rules[i].key}`] ? sobValuesKeys: null,
                        id: getRulesArr.dataAuthorityRuleDetails ? getRulesArr.dataAuthorityRuleDetails[0].id : null,
                        deleted: getRulesArr ? getRulesArr.deleted : undefined,
                        versionNumber: getRulesArr ? getRulesArr.versionNumber : undefined,
                        createdBy: getRulesArr ? getRulesArr.createdBy : undefined,
                        createdDate: getRulesArr ? getRulesArr.createdDate : undefined,
                        lastUpdatedBy: getRulesArr ? getRulesArr.lastUpdatedBy : undefined,
                        lastUpdatedDate: getRulesArr ? getRulesArr.lastUpdatedDate : undefined,
                        dataAuthorityId: newDataPrams.id ? newDataPrams.id : null,
                        dataAuthorityRuleId: getRulesArr ? getRulesArr.id : undefined
                    },
                    {
                        dataType: 'COMPANY',
                        dataScope: values[`dataScope2-${rules[i].key}`],
                        dataScopeDesc: values[`dataScope2-${rules[i].key}`] ? dataScopeDesc[values[`dataScope2-${rules[i].key}`]].label : undefined,
                        filtrateMethod: values[`filtrateMethod2-${rules[i].key}`] ? values[`filtrateMethod2-${rules[i].key}`] : undefined,
                        filtrateMethodDesc: values[`filtrateMethod2-${rules[i].key}`] ? filtrateMethodDesc[values[`filtrateMethod2-${rules[i].key}`]].label : null,
                        dataAuthorityRuleDetailValues: values[`filtrateMethod2-${rules[i].key}`] ? companyItemsKeys: null,
                        id: getRulesArr.dataAuthorityRuleDetails ? getRulesArr.dataAuthorityRuleDetails[1].id : null,
                        deleted: getRulesArr ? getRulesArr.deleted : undefined,
                        versionNumber: getRulesArr ? getRulesArr.versionNumber : undefined,
                        createdBy: getRulesArr ? getRulesArr.createdBy : undefined,
                        createdDate: getRulesArr ? getRulesArr.createdDate : undefined,
                        lastUpdatedBy: getRulesArr ? getRulesArr.lastUpdatedBy : undefined,
                        lastUpdatedDate: getRulesArr ? getRulesArr.lastUpdatedDate : undefined,
                        dataAuthorityId: newDataPrams.id ? newDataPrams.id : null,
                        dataAuthorityRuleId: getRulesArr ? getRulesArr.id : undefined
                    },
                    {
                        dataType: 'UNIT',
                        dataScope: values[`dataScope3-${rules[i].key}`],
                        dataScopeDesc: values[`dataScope3-${rules[i].key}`] ? dataScopeDesc[values[`dataScope3-${rules[i].key}`]].label : undefined,
                        filtrateMethod: values[`filtrateMethod3-${rules[i].key}`] ? values[`filtrateMethod3-$${rules[i].key}`] : undefined,
                        filtrateMethodDesc: values[`filtrateMethod3-${rules[i].key}`] ? filtrateMethodDesc[values[`filtrateMethod3-${rules[i].key}`]].label : null,
                        dataAuthorityRuleDetailValues: values[`filtrateMethod3-${rules[i].key}`] ? departMentItemsKeys: null,
                        id: getRulesArr.dataAuthorityRuleDetails ? getRulesArr.dataAuthorityRuleDetails[2].id : null,
                        deleted: getRulesArr ? getRulesArr.deleted : undefined,
                        versionNumber: getRulesArr ? getRulesArr.versionNumber : undefined,
                        createdBy: getRulesArr ? getRulesArr.createdBy : undefined,
                        createdDate: getRulesArr ? getRulesArr.createdDate : undefined,
                        lastUpdatedBy: getRulesArr ? getRulesArr.lastUpdatedBy : undefined,
                        lastUpdatedDate: getRulesArr ? getRulesArr.lastUpdatedDate : undefined,
                        dataAuthorityId: newDataPrams.id ? newDataPrams.id : null,
                        dataAuthorityRuleId: getRulesArr ? getRulesArr.id : undefined
                    },
                    {
                        dataType: 'EMPLOYEE',
                        dataScope: values[`dataScope4-${rules[i].key}`],
                        dataScopeDesc: values[`dataScope4-${rules[i].key}`] ? dataScopeDesc[values[`dataScope4-${rules[i].key}`]].label : undefined,
                        filtrateMethod: values[`filtrateMethod4-${rules[i].key}`] ? values[`filtrateMethod4-${rules[i].key}`] : undefined,
                        filtrateMethodDesc: values[`filtrateMethod4-${rules[i].key}`] ? filtrateMethodDesc[values[`filtrateMethod4-${rules[i].key}`]].label : null,
                        dataAuthorityRuleDetailValues: values[`filtrateMethod4-${rules[i].key}`] ? employeeKeys : null,
                        id: getRulesArr.dataAuthorityRuleDetails ? getRulesArr.dataAuthorityRuleDetails[3].id : null,
                        deleted: getRulesArr ? getRulesArr.deleted : undefined,
                        versionNumber: getRulesArr ? getRulesArr.versionNumber : undefined,
                        createdBy: getRulesArr ? getRulesArr.createdBy : undefined,
                        createdDate: getRulesArr ? getRulesArr.createdDate : undefined,
                        lastUpdatedBy: getRulesArr ? getRulesArr.lastUpdatedBy : undefined,
                        lastUpdatedDate: getRulesArr ? getRulesArr.lastUpdatedDate : undefined,
                        dataAuthorityId: newDataPrams.id ? newDataPrams.id : null,
                        dataAuthorityRuleId: getRulesArr ? getRulesArr.id : undefined
                    },
                ],
                id: getRulesArr ? getRulesArr.id : undefined,
                deleted: getRulesArr ? getRulesArr.deleted : undefined,
                versionNumber: getRulesArr ? getRulesArr.versionNumber : undefined,
                createdBy: getRulesArr ? getRulesArr.createdBy : undefined,
                createdDate: getRulesArr ? getRulesArr.createdDate : undefined,
                lastUpdatedBy: getRulesArr ? getRulesArr.lastUpdatedBy : undefined,
                lastUpdatedDate: getRulesArr ? getRulesArr.lastUpdatedDate : undefined,
                dataAuthorityId: newDataPrams.id ? newDataPrams.id : null

            }
            )
        }
        if (dataAuthorityRules.length) {
            for (let i = 0; i < dataAuthorityRules.length; i++) {
                dataAuthorityRules = dataAuthorityRules.filter(item => item.dataAuthorityRuleName !== undefined)
                // if (dataAuthorityRules[i].dataAuthorityRuleName === undefined) {
                //     // dataAuthorityRules = dataAuthorityRules.slice(1);
                //     dataAuthorityRules = dataAuthorityRules.filter(item=>item.dataAuthorityRuleName!==undefined)
                // }
            }
        }
        return dataAuthorityRules
    }

    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const { keys, cardShow, isNew, newChangeRulesRender, renderNewChangeRules, newDataPrams, treeData } = this.state;
        const formItemLayout = {
            labelCol: { span: 6, offset: 1 },
            wrapperCol: { span: 14, offset: 1 },
        };
        return (
            <div className="new-payment-method">
                <div>
                    基本信息
                </div>
                <Divider />
                <Form onSubmit={this.handleSave}>
                    <FormItem
                        {...formItemLayout}
                        label='数据权限代码'
                    >
                        {getFieldDecorator('dataAuthorityCode', {
                            rules: [
                                {
                                    required: true,
                                    message: this.$t({ id: 'common.please.enter' }),
                                },
                            ],
                            initialValue: newDataPrams.dataAuthorityCode || '',
                        })(<Input
                            placeholder={this.$t("common.please.enter")}
                            disabled={newDataPrams.id ? true : false}
                        />)
                        }

                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="数据权限名称"
                    >
                        {getFieldDecorator('dataAuthorityName', {
                            rules: [],
                            initialValue: newDataPrams.dataAuthorityName || ''
                        })(
                            <div>
                                 <LanguageInput
                                        key={1}
                                        name={newDataPrams.dataAuthorityName}
                                        i18nName={newDataPrams.i18n && newDataPrams.i18n.dataAuthorityName ? newDataPrams.i18n.dataAuthorityName : null}
                                        placeholder={this.$t('common.please.enter')/* 请输入 */}
                                        isEdit={newDataPrams.id ? true : false}
                                        nameChange={this.i18nNameChange}
                                    />
                            </div>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="数据权限说明"
                    >
                        {getFieldDecorator('description', {
                            rules: [],
                            initialValue: newDataPrams.description || ''
                        })(
                            <div>
                                 <LanguageInput
                                        key={2}
                                        name={newDataPrams.description}
                                        i18nName={newDataPrams.i18n && newDataPrams.i18n.description ? newDataPrams.i18n.description : null}
                                        placeholder={this.$t('common.please.enter')/* 请输入 */}
                                        isEdit={newDataPrams.id ? true : false}
                                        nameChange={this.i18nNameDes}
                                    />
                            </div>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={this.$t("common.status", { status: "" })}
                        colon={true}
                    >
                        {getFieldDecorator('enabled', {
                            rules: [],
                            initialValue:newDataPrams.id ? newDataPrams.enabled : true,
                            valuePropName: 'checked'
                        })(
                            <Switch checkedChildren={<Icon type="check" />}
                                unCheckedChildren={<Icon type="cross" />} />
                        )}

                    </FormItem>
                    <div>
                        数据权限设置
                     </div>
                    <Divider></Divider>
                    <Alert message="可定义多条规则，不同规则间数据权限为并集，同一规则不同参数数据权限为交集" type="info" showIcon />
                    <Spin spinning={false}>
                        <div style={{ marginTop: 24 }}>
                            {renderNewChangeRules}
                        </div>
                        <div style={{ marginTop: 24 }}>
                            <Row>
                                <Col offset={3} span={18} >
                                    <Button type="dashed" style={{ high: 40, width: "100%" }} onClick={this.addApply}><Icon type="plus" />{this.$t({ id: "accounting.source.addChangeRule" })} </Button>
                                </Col>
                            </Row>
                        </div>

                    </Spin>
                    <div className='slide-footer'>
                        <Button type='primary' htmlType="submit">
                            {this.$t({ id: 'common.save' })}
                        </Button>
                        <Button onClick={this.onCancel}>{this.$t({ id: 'common.cancel' })}</Button>
                    </div>

                </Form>


            </div>
        )
    }
}
const WrappedNewSubjectSheet = Form.create()(NewDataAuthority);

function mapStateToProps(state) {
    return {
        user: state.user.currentUser,
        company: state.user.company
    };
}

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewSubjectSheet);
