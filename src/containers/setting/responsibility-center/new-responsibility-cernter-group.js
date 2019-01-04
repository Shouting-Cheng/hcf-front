import React from 'react';
import { connect } from 'dva';
import { Button, Form, Divider, Input, Switch, Icon, Alert, Row, Col, Spin, message, Select } from 'antd';
import LanguageInput from 'components/Widget/Template/language-input/language-input';
const FormItem = Form.Item;
const Option = Select.Option;
class NewResponsibilityCenterGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            
        }
    }

    handleSave=()=>{

    }
    onCancel=()=>{
        
    }
    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form;
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
                        {getFieldDecorator('sent', {
                            rules: [
                                {
                                    required: true,
                                    message: this.$t({ id: 'common.please.enter' }),
                                },
                            ],
                            initialValue: '',
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
                        {getFieldDecorator('responsibilityCode', {
                            rules: [
                                {
                                    required: true,
                                    message: this.$t({ id: 'common.please.enter' }),
                                },
                            ],
                            initialValue: '',
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
                        {getFieldDecorator('responsibilityName', {
                            rules: [
                                {
                                    required: true,
                                    message: this.$t({ id: 'common.please.enter' }),
                                },
                            ],
                            initialValue: '',
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
                            // initialValue: newDataPrams.id ? newDataPrams.enabled : true,
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