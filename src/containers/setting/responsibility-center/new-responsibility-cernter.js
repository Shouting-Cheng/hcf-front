import React from 'react';
import { connect } from 'dva';
import { Button, Form, Divider, Input, Switch, Icon, Alert, Row, Col, Spin, message, Select } from 'antd';
import LanguageInput from 'components/Widget/Template/language-input/language-input';
import ResponsibilityService from 'containers/setting/responsibility-center/responsibility-service'
const FormItem = Form.Item;
const Option = Select.Option;
class NewResponsibilityCenter extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            newDataPrams:{}
        }
       
    }
    componentWillMount(){
        this.setState({
            newDataPrams:this.props.params
        })
    }
    handleSave=(e)=>{
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                let params={
                    tenantId: this.props.company.tenantId,
                    setOfBooksId:values.setOfBooksId,
                    responsibilityCenterCode:values.responsibilityCenterCode,
                    responsibilityCenterName:values.responsibilityCenterName,
                    enabled:values.enabled

                }
                ResponsibilityService.saveResponsibility(params).then(res=>{
                    if(res.status===200){
                        this.props.close();
                        message.success('责任中心保存成功！')
                    }
                }).catch(e => {
                    message.error(e.response.data.message)
                })

            }
        })
    }
    onCancel=()=>{
        
    }
    render() {
        const { getFieldDecorator, getFieldValue, } = this.props.form;
        const{newDataPrams}=this.state;
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
                            initialValue: newDataPrams.id?newDataPrams.setOfBooksId:this.props.company.setOfBooksId,
                        })(
                            <Select defaultValue="lucy" disabled>
                                <Option value="jack">Jack</Option>
                                <Option value="lucy">Lucy</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label='责任中心代码'
                    >
                        {getFieldDecorator('resiponsibilityCenterCode', {
                            rules: [
                                {
                                    required: true,
                                    message: this.$t({ id: 'common.please.enter' }),
                                },
                            ],
                            initialValue: newDataPrams.resiponsibilityCenterCode||'',
                        })(
                            <Input
                                placeholder={this.$t("common.please.enter")}
                            />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label='责任中心名称'
                    >
                        {getFieldDecorator('resiponsibilityCenterName', {
                            rules: [
                                {
                                    required: true,
                                    message: this.$t({ id: 'common.please.enter' }),
                                },
                            ],
                            initialValue: newDataPrams.resiponsibilityCenterName||'',
                        })(
                            <div>
                                <LanguageInput
                                // key={1}
                                // name={newDataPrams.dataAuthorityName}
                                // i18nName={newDataPrams.i18n && newDataPrams.i18n.dataAuthorityName ? newDataPrams.i18n.dataAuthorityName : null}
                                // placeholder={this.$t('common.please.enter')/* 请输入 */}
                                // isEdit={newDataPrams.id ? true : false}
                                // nameChange={this.i18nNameChange}
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
                            initialValue: newDataPrams.id ? newDataPrams.enabled : true,
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
const WrappedNewSubjectSheet = Form.create()(NewResponsibilityCenter);
function mapStateToProps(state) {
    return {
        user: state.user.currentUser,
        company: state.user.company
    };
}
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewSubjectSheet);