import React from 'react';
import { connect } from 'dva';
import { Button, Form, Divider, Input, Switch, Icon, Alert, Row, Col, Spin,message } from 'antd';
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
            formItemKey:'',
            /**单个保存成功后返回的数据规则组 */
            hasSaveRules:{}
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
                const { renderNewChangeRules} = this.state;
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
                                 deleted:res.data.deleted,
                                 versionNumber:res.data.versionNumber,
                                 createdBy:res.data.createdBy,
                                 createdDate:res.data.createdDate,
                                 lastUpdatedBy:res.data.lastUpdatedBy,
                                 lastUpdatedDate:res.data.lastUpdatedDate,
                                 ruleId:Item.id
                            }}
                            getFieldDecorator={getFieldDecorator}
                            form={this.props.form}
                            tenantId={this.props.company.tenantId}
                            newDataPrams={res.data}
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
    // componentDidMount() {
    //     let params = this.props.params;
    //     console.log(params);
    //     this.setState({
    //         newDataPrams: params
    //     })
    // }

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
                newEditId={this.props.params?this.props.params.id:undefined}
                newDataPrams={this.state.newDataPrams}
                
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
    cancelHandle = (targetKey) => {
        let { renderNewChangeRules } = this.state;
        const card = renderNewChangeRules.filter(card => card.key !== targetKey);
        this.setState({
            renderNewChangeRules: card
        })
    }
    canceEditHandle = (targetKey) => {
        DataAuthorityService.deletRuleItem(targetKey).then(res=>{
            if(res.status===200){
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
    //名称：自定义值列表项多语言
    i18nNameChange = (name, i18nName) => {
        this.state.newDataPrams.dataAuthorityName = name;
        if (this.state.newDataPrams.i18n) {
            this.state.newDataPrams.i18n.dataAuthorityName = i18nName;
        } else {
            this.state.newDataPrams.i18n = {
                name: i18nName
            };
        }
        
    }
    i18nNameDes = (name, i18nName) => {
        this.state.newDataPrams.description = name;
        if (this.state.newDataPrams.i18n) {
            this.state.newDataPrams.i18n.description = i18nName;
        } else {
            this.state.newDataPrams.i18n = {
                name: i18nName
            };
        }
    }
    hadleHasSaveRules=(dataAuthorityRules)=>{
        console.log(dataAuthorityRules)
        this.setState({
            hasSaveRules:dataAuthorityRules
        })
    }

    /**保存所有添加的规则 */
    handleSave = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                let rules=this.state.renderNewChangeRules;
                let {hasSaveRules}=this.state;
                let dataAuthorityRules=[];
                for(let i=0;i<rules.length;i++){
                    dataAuthorityRules.push({
                        i18n:null,
                        dataAuthorityRuleName:values[`dataAuthorityRuleName-${rules[i].key}`],
                        dataAuthorityRuleDetails:[
                            {
                                dataType: 'SOB',
                                dataScope: values[`dataScope1-${rules[i].key}`],
                                filtrateMethod: values[`filtrateMethod1-${rules[i].key}`] ? values[`filtrateMethod1-${rules[i].key}`] : undefined,
                                dataAuthorityRuleDetailValues: values[`filtrateMethod1-${rules[i].key}`] ? [
                                    {
                                        "valueKey": "1"
                                    }
                                ] : undefined
                            },
                            {
                                dataType: 'COMPANY',
                                dataScope: values[`dataScope2-${rules[i].key}`],
                                filtrateMethod: values[`filtrateMethod2-${rules[i].key}`] ? values[`filtrateMethod2-${rules[i].key}`] : undefined,
                                dataAuthorityRuleDetailValues: values[`filtrateMethod2-${rules[i].key}`] ? [
                                    {
                                        "valueKey": "1"
                                    }
                                ] : undefined
                            },
                            {
                                dataType: 'UNIT',
                                dataScope: values[`dataScope3-${rules[i].key}`],
                                filtrateMethod: values[`filtrateMethod3-${rules[i].key}`] ? values[`filtrateMethod3-$${rules[i].key}`] : undefined,
                                dataAuthorityRuleDetailValues: values[`filtrateMethod3-${rules[i].key}`] ? [
                                    {
                                        "valueKey": "1"
                                    }
                                ] : undefined
                            },
                            {
                                dataType: 'EMPLOYEE',
                                dataScope: values[`dataScope4-${rules[i].key}`],
                                filtrateMethod: values[`filtrateMethod4-${rules[i].key}`] ? values[`filtrateMethod4-${rules[i].key}`] : undefined,
                                dataAuthorityRuleDetailValues: values[`filtrateMethod4-${rules[i].key}`] ? [
                                    {
                                        "valueKey": "1"
                                    }
                                ] : undefined
                            },
                        ]
                    },
                    hasSaveRules?hasSaveRules:undefined
                    )
                }
                let params={
                    id:null,
                    i18n: null,
                    enabled: values.enabled,
                    tenantId: this.props.company.tenantId,
                    dataAuthorityCode:values.dataAuthorityCode,
                    dataAuthorityName:values.dataAuthorityName,
                    description:values.description,
                    dataAuthorityRules:dataAuthorityRules
                }
                DataAuthorityService.saveDataAuthority(params).then(res => {
                    if(res.status===200){
                        this.props.close();
                        // this.setState({
                        //     hasSaveRules:res.data.dataAuthorityRules[0]
                        // })
                    }
                }).catch(e => {
                    message.error(e.response.data.message)
                })
                
            }
        })
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
                            rules: [{
                                required: true, message: this.$t({ id: 'common.please.enter' })
                            },
                            {
                                max: 100,
                                //最多输入100个字符
                                message: this.$t('value.list.input.max.100'),
                            }],
                            initialValue: newDataPrams.dataAuthorityName || ''
                        })(
                            <div>
                                <LanguageInput
                                    // disabled={!this.props.tenantMode}
                                    key={1}
                                    name={newDataPrams.dataAuthorityName}
                                    i18nName={newDataPrams.i18n ? newDataPrams.i18n.dataAuthorityName : ""}
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
                        {getFieldDecorator('description',{
                             rules: []
                        })(
                            <div>
                                <LanguageInput
                                    // disabled={!this.props.tenantMode}
                                    key={1}
                                    name={newDataPrams.description}
                                    i18nName={newDataPrams.i18n ? newDataPrams.i18n.description : ""}
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
                            initialValue: newDataPrams.enabled ? true : false,
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
