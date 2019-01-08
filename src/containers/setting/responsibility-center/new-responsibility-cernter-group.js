import React from 'react';
import { connect } from 'dva';
import { Button, Form, Divider, Input, Switch, Icon, Alert, Row, Col, Spin, message, Select } from 'antd';
import LanguageInput from 'components/Widget/Template/language-input/language-input';
import ResponsibilityService from 'containers/setting/responsibility-center/responsibility-service'
const FormItem = Form.Item;
const Option = Select.Option;
class NewResponsibilityCenterGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            newDataParams:{}
        }
    }
    componentWillMount(){
        this.setState({
            newDataParams:this.props.params
        })
    }
    handleSave=(e)=>{
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                let params={
                    tenantId: this.props.company.tenantId,
                    setOfBooksId:values.setOfBooksId,
                    groupCode:values.groupCode,
                    groupName:values.groupName,
                    enabled:values.enabled
                }
                ResponsibilityService.saveResponsibilityGroup(params).then(res=>{
                    if(res.status===200){
                        this.props.close();
                        message.success('责任中心组保存成功！')
                    }
                }).catch(e => {
                    message.error(e.response.data.message)
                })
            }
        })

    }
    onCancel=()=>{
        this.props.close()
    }
      //责任中心组名称：多语言
      i18nNameChange = (name, i18nName) => {
        const newDataParams = this.state.newDataParams;
        newDataParams.groupName = name;
        if (!newDataParams.i18n) {
            newDataParams.i18n = {};
        }
        newDataParams.i18n.groupName = i18nName;
    };
    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const{newDataParams}=this.state;
        const formItemLayout = {
            labelCol: { span: 6, offset: 1 },
            wrapperCol: { span: 10, offset: 1 },
        };
        return (
            <div>
                <Form onSubmit={this.handleSave}>
                    <FormItem
                        {...formItemLayout}
                        label='账套'
                    >
                        {getFieldDecorator('setOfBooksId', {
                            rules: [
                                {
                                    required: true,
                                    message: this.$t({ id: 'common.please.enter' }),
                                },
                            ],
                            initialValue: newDataParams.id?newDataParams.setOfBooksId:this.props.company.setOfBooksId,
                        })(
                            <Select defaultValue="lucy" disabled>
                                <Option value="jack">Jack</Option>
                                <Option value="lucy">Lucy</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label='责任中心组代码'
                    >
                        {getFieldDecorator('groupCode', {
                            rules: [
                                {
                                    required: true,
                                    message: this.$t({ id: 'common.please.enter' }),
                                },
                            ],
                            initialValue: newDataParams.groupCode||'',
                        })(
                            <Input
                                placeholder={this.$t("common.please.enter")}
                            />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label='责任中心组名称'
                    >
                        {getFieldDecorator('groupName', {
                            rules: [
                                {
                                    required: true,
                                    message: this.$t({ id: 'common.please.enter' }),
                                },
                            ],
                            initialValue: newDataParams.groupName||'',
                        })(
                            <div>
                                <LanguageInput
                                key={1}
                                name={newDataParams.groupName}
                                i18nName={newDataParams.i18n && newDataParams.i18n.groupName ? newDataParams.i18n.groupName : null}
                                placeholder={this.$t('common.please.enter')/* 请输入 */}
                                isEdit={newDataParams.id ? true : false}
                                nameChange={this.i18nNameChange}
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
                            initialValue: newDataParams.id ? newDataParams.enabled : true,
                            valuePropName: 'checked'
                        })(
                            <Switch checkedChildren={<Icon type="check" />}
                                unCheckedChildren={<Icon type="cross" />} />
                        )}

                    </FormItem>
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
const WrappedNewSubjectSheet = Form.create()(NewResponsibilityCenterGroup);
function mapStateToProps(state) {
    return {
        user: state.user.currentUser,
        company: state.user.company
    };
}
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewSubjectSheet);