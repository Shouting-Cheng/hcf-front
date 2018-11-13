import React from 'react';
import { connect } from 'dva';
import { Button, Form, Switch, Input, message, Icon, InputNumber, Select, Modal, Card, Row, Col, Badge, Divider } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import 'styles/setting/data-authority/data-authority.scss';
import ViewRuleModal from 'containers/setting/data-authority/view-rule-modal'

class LineModelChangeRulesSystem extends React.Component {
    constructor() {
        super();
        this.state = {
            targeKey: '',
            show: true,
            renderSelectList: false,
            renderCompanyList: false,
            renderDepartmentList: false,
            renderEmplyeeList: false,
            showRuleModal: false
        }
    }
    componentWillMount() {
        console.log(this.props);
        this.setState({
            targeKey: this.props.targeKey
        })
    }
    /**删除规则 */
    removeRule = (targeKey) => {
        this.props.cancelHandle(targeKey)
    }
    /**保存单条规则 */
    saveRuleItem = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log(values);
                this.setState({
                    show: false
                })
            }
        })
    }
    /**编辑单条规则 */
    editRuleItem = () => {
        this.setState({
            show: true
        })
    }
    /**选中手动选择 */
    handleChangeRuleChange = (value) => {
        if (value === 'handleSelect') {
            this.setState({
                renderSelectList: true
            })
        } else {
            this.setState({
                renderSelectList: false
            })
        }
    }
    handleChangeCompany = (value) => {
        if (value === 'handleSelect') {
            this.setState({
                renderCompanyList: true
            })
        } else {
            this.setState({
                renderCompanyList: false
            })
        }
    }
    handleChangeDepartment = (value) => {
        if (value === 'handleSelect') {
            this.setState({
                renderDepartmentList: true
            })
        } else {
            this.setState({
                renderDepartmentList: false
            })
        }
    }
    handleEmplyee = (value) => {
        if (value === 'handleSelect') {
            this.setState({
                renderEmplyeeList: true
            })
        } else {
            this.setState({
                renderEmplyeeList: false
            })
        }
    }
    /**查看数据权限详情 */
    handleViewRule = () => {
        this.setState({
            showRuleModal: true
        })
    }
    closeRuleModal = () => {
        this.setState({
            showRuleModal: false
        })
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const { targeKey, show, renderSelectList, renderCompanyList, renderDepartmentList, renderEmplyeeList, showRuleModal } = this.state;
        const ruleFormLayout = {
            labelCol: { span: 6, offset: 1 },
            wrapperCol: { span: 16, offset: 1 },
        }
        const cardTitle = (
            <span className="rule-form-item">
                <FormItem
                    {...ruleFormLayout}
                    label=' '
                >
                    {getFieldDecorator('ruleName', {
                        rules: [{
                            required: true,
                            message: this.$t({ id: 'common.please.enter' }),
                        }],
                    })(
                        <Input placeholder="请输入规则名称" />
                    )}

                </FormItem>
            </span>
        )
        return (
            <div className='add-rule-form'>
                {show &&
                    <Form onSubmit={this.saveRuleItem}>
                        <Card
                            title={cardTitle}
                            style={{ background: '#f7f7f7', marginTop: 25 }}
                            extra={<span><Button type='primary' htmlType="submit">{this.$t({ id: 'common.save' })} </Button>
                                <Button style={{ marginLeft: 10 }} onClick={() => this.removeRule(targeKey)}>{this.$t({ id: 'common.cancel' })}</Button>
                            </span>
                            }
                        >
                            <Row className="rule-form-item">
                                <Col span={8}>
                                    <FormItem
                                        {...ruleFormLayout}
                                        label='账套'
                                    >
                                        {getFieldDecorator('tenantId', { initialValue: 'all' })(
                                            <Select placeholder={this.$t({ id: "common.please.enter" })} onSelect={this.handleChangeRuleChange}>
                                                <Option value='all'>全部</Option>
                                                <Option value='current'>当前</Option>
                                                <Option value='handleSelect'>手动选择</Option>
                                            </Select>
                                        )}

                                    </FormItem>
                                </Col>
                                {renderSelectList &&
                                    <Col span={16} style={{ marginTop: 3 }}>
                                        <Row>
                                            <Col span={6} style={{ marginLeft: 10 }}>
                                                <Select placeholder={this.$t({ id: "common.please.enter" })} >
                                                    <Option value='include'>包含</Option>
                                                    <Option value='exclude'>排除</Option>
                                                </Select>
                                            </Col>
                                            <Col span={6} style={{ marginLeft: 10 }}>
                                                <Button icon="plus">添加账套</Button>
                                            </Col>
                                        </Row>

                                    </Col>
                                }
                            </Row>
                            <Row className="rule-form-item">
                                <Col span={8}>
                                    <FormItem
                                        {...ruleFormLayout}
                                        label='公司'
                                    >
                                        {getFieldDecorator('company', { initialValue: 'all' })(
                                            <Select placeholder={this.$t({ id: "common.please.enter" })} onSelect={this.handleChangeCompany}>
                                                <Option value='all'>全部</Option>
                                                <Option value='current'>当前</Option>
                                                <Option value='currentBranch'>当前及下属</Option>
                                                <Option value='handleSelect'>手动选择</Option>
                                            </Select>
                                        )}

                                    </FormItem>
                                </Col>
                                {renderCompanyList &&
                                    <Col span={16} style={{ marginTop: 3 }} >
                                        <Row>
                                            <Col span={6} style={{ marginLeft: 10 }}>
                                                <Select placeholder={this.$t({ id: "common.please.enter" })} >
                                                    <Option value='include'>包含</Option>
                                                    <Option value='exclude'>排除</Option>
                                                </Select>
                                            </Col>
                                            <Col span={6} style={{ marginLeft: 10 }}>
                                                <Button icon="plus">添加公司</Button>
                                            </Col>
                                        </Row>

                                    </Col>
                                }
                            </Row>
                            <Row className="rule-form-item">
                                <Col span={8}>
                                    <FormItem
                                        {...ruleFormLayout}
                                        label='部门'
                                    >
                                        {getFieldDecorator('department', { initialValue: 'all' })(
                                            <Select placeholder={this.$t({ id: "common.please.enter" })} onSelect={this.handleChangeDepartment}>
                                                <Option value='all'>全部</Option>
                                                <Option value='current'>当前</Option>
                                                <Option value='currentBranch'>当前及下属</Option>
                                                <Option value='handleSelect'>手动选择</Option>
                                            </Select>
                                        )}

                                    </FormItem>
                                </Col>
                                {renderDepartmentList &&
                                    <Col span={16} style={{ marginTop: 3 }}>
                                        <Row>
                                            <Col span={6} style={{ marginLeft: 10 }}>
                                                <Select placeholder={this.$t({ id: "common.please.enter" })} >
                                                    <Option value='include'>包含</Option>
                                                    <Option value='exclude'>排除</Option>
                                                </Select>
                                            </Col>
                                            <Col span={6} style={{ marginLeft: 10 }}>
                                                <Button icon="plus">添加部门</Button>
                                            </Col>
                                        </Row>

                                    </Col>
                                }
                            </Row>
                            <Row className="rule-form-item">
                                <Col span={8}>
                                    <FormItem
                                        {...ruleFormLayout}
                                        label='员工'
                                    >
                                        {getFieldDecorator('employee', { initialValue: 'all' })(
                                            <Select placeholder={this.$t({ id: "common.please.enter" })} onSelect={this.handleEmplyee}>
                                                <Option value='all'>全部</Option>
                                                <Option value='current'>当前</Option>
                                                <Option value='currentBranch'>当前及下属</Option>
                                                <Option value='handleSelect'>手动选择</Option>
                                            </Select>
                                        )}

                                    </FormItem>
                                </Col>
                                {renderEmplyeeList &&
                                    <Col span={16} style={{ marginTop: 3 }}>
                                        <Row>
                                            <Col span={6} style={{ marginLeft: 10 }}>
                                                <Select placeholder={this.$t({ id: "common.please.enter" })} >
                                                    <Option value='include'>包含</Option>
                                                    <Option value='exclude'>排除</Option>
                                                </Select>
                                            </Col>
                                            <Col span={6} style={{ marginLeft: 10 }}>
                                                <Button icon="plus">添加员工</Button>
                                            </Col>
                                        </Row>

                                    </Col>
                                }
                            </Row>
                        </Card>
                    </Form>}
                {!show &&
                    <Card title='数据权限组1' style={{ marginTop: 25, background: '#f7f7f7' }}
                        extra={<span>
                            <a onClick={this.handleViewRule}>查看</a>
                            <a style={{ paddingLeft: 15 }} onClick={this.editRuleItem}>编辑</a>
                            <a style={{ paddingLeft: 15 }} onClick={() => this.removeRule(targeKey)}>删除</a>
                        </span>}>
                        <Row>
                            <Col span={24}>
                                <span>账套：</span>
                                <span>全部账套</span>
                            </Col>
                            <Col span={24}>
                                <span>公司：</span>
                                <span>当前公司</span>
                            </Col>
                            <Col span={24}>
                                <span>部门：</span>
                                <span>当前及下属部门</span>
                            </Col>
                            <Col span={24}>
                                <span>员工：</span>
                                <span>排除5个员工</span>
                            </Col>
                        </Row>
                    </Card>}
                <ViewRuleModal
                    visibel={showRuleModal}
                    closeRuleModal={this.closeRuleModal}
                />


            </div>

        )
    }
}

const WrappedLineModelChangeRules = Form.create()(LineModelChangeRulesSystem);
function mapStateToProps() {
    return {}
}
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedLineModelChangeRules);