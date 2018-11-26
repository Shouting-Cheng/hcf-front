import React from 'react';
import { connect } from 'dva';
import { Button, Form, Divider, Input, Switch, Icon, Alert, Row, Col, Spin } from 'antd';
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
            treeData: [
                {
                    title: 'parent 1',
                    key: '0-0'
                },
                {
                    title: 'parent 1-1',
                    key: '0-1'
                },


            ],
        }

    }
    componentWillMount() {
        let params = this.props.params;
        if (params && JSON.stringify(params) === '{}') {
            this.setState({
                newDataPrams: params,
                renderNewChangeRules: []
            })
        } else {
            DataAuthorityService.getDataAuthorityDetail(params.id).then(res => {
                console.log(res);
                const { renderNewChangeRules, treeData } = this.state;
                const { getFieldDecorator } = this.props.form;
                renderNewChangeRules.push(
                    res.data.dataAuthorityRules.map(Item => (
                        <LineModelChangeRules
                            key={Item.id}
                            canceEditHandle={this.canceEditHandle}
                            targeKey={Item.id}
                            isEditRule={!this.state.isEditRule}
                            params={{ name: Item.dataAuthorityRuleName, ruleDatail: Item.dataAuthorityRuleDetails }}
                            getFieldDecorator={getFieldDecorator}
                            form={this.props.form}
                            tenantId={this.props.company.tenantId}
                            editKey={Item.id}
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
            />
        );
        this.setState({
            renderNewChangeRules
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

    /**保存所有添加的规则 */
    handleSave = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {

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
                        {getFieldDecorator('description')(
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
