import React from 'react';
import { connect } from 'dva';
import { Modal, Button, Row, Col, Divider, Card, Form, Select,Input } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import BasicInfo from 'widget/basic-info';

class ViewRuleModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            infoList: [
                {
                    //数据权限代码
                    type: 'input',
                    label: '数据权限代码',
                    id: 'dataAuthorityCode',
                    disabled: true,
                    colSpan: 6
                },
                {
                    //数据权限名称
                    type: 'input',
                    label: '数据权限名称',
                    id: 'dataAuthorityName',
                    disabled: false
                },
                {
                    //描述
                    type: 'input',
                    label: '数据权限名称',
                    id: 'description',
                    disabled: false
                },
                {
                    //状态
                    type: 'switch',
                    label: '状态',
                    id: 'enabled',
                }

            ],
            infoData: {},
            renderSelectList: false,
            renderCompanyList: false,
            renderDepartmentList: false,
            renderEmplyeeList: false,
            show: true,
            tabListNoTitle:[
                {
                    key:'tenantPermission',
                    tab:'账套权限'
                },
                {
                    key:'companyPermission',
                    tab:'公司权限'
                },
                {
                    key:'departmentPermission',
                    tab:'部门权限'
                },
                {
                    key:'empolyeePermission',
                    tab:'员工权限'
                },
                
            ],
            noTitleKey:'tenantPermission'

        }
    }
    onCloseRuleModal = () => {
        this.props.closeRuleModal()
    }
    editRuleItem = () => {

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
    /**编辑数据详情 */
    editRuleCard = () => {
        this.setState({
            show: false
        })
    }
    /**保存数据规则 */
    saveRuleCard=()=>{
        this.setState({
            show:true
        })
    }
    /**取消保存数据规则 */
    canceleRuleCard=()=>{
        this.setState({
            show:true
        })
    }
    onTabChange = (key, type) => {
        console.log(key, type);
        this.setState({ [type]: key });
      }
    
    render() {
        const { visibel } = this.props;
        const { infoList, infoData, renderSelectList, renderCompanyList,noTitleKey, renderDepartmentList, renderEmplyeeList,show,tabListNoTitle } = this.state;
        const { getFieldDecorator } = this.props.form;
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
            <Modal
                visible={visibel}
                footer={[
                    <Button key="back" onClick={this.onCloseRuleModal}>
                        {this.$t({ id: 'common.back' } /* 返回*/)}
                    </Button>,
                ]}
                width={1200}
                destroyOnClose={true}
                closable={false}
                onCancel={this.onCloseRuleModal}
            >
                <div>
                    <BasicInfo
                        infoList={infoList}
                        isHideEditBtn={false}
                        infoData={infoData}
                    />
                    <Form>
                        <Card title={show?'数据权限组1':cardTitle} style={{ marginTop: 25, background: '#f7f7f7' }} 
                         extra={show?<a onClick={this.editRuleCard}>编辑</a>:<span>
                             <a onClick={this.saveRuleCard}>保存</a>
                             <a onClick={this.canceleRuleCard} style={{marginLeft:10}}>取消</a></span>}>
                            {show &&
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
                            }
                            {!show&&
                                <div className='add-rule-form'>
                                <Row className="rule-form-item">
                                    <Col span={3}>
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
                                    <Col span={3}>
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
                                    <Col span={3}>
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
                                    <Col span={3}>
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
                            </div>
                            }
                            
                        </Card>

                    </Form>
                    <Card
                     tabList={tabListNoTitle}
                     activeTabKey={noTitleKey}
                     onTabChange={(key) => { this.onTabChange(key, 'noTitleKey'); }}
                     style={{ marginTop: 25, background: '#f7f7f7',width: '100%' }}
                     className='rule-ant-card'
                    >

                    </Card>

                </div>
            </Modal>
        )

    }

}

const WrappedLineModelChangeRules = Form.create()(ViewRuleModal);

function mapStateToProps() {
    return {}
}
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedLineModelChangeRules);