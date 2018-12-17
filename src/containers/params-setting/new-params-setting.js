import React, { Component } from "react"
import { Form, Input, Button, message, Select } from "antd"
const FormItem = Form.Item;
const { TextArea } = Input;

import service from "./service"

class NewParamsSetting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            saveLoading: false,
            paramsTypeList: [],
            filterMethodList: []
        }
    }


    componentDidMount() {
        this.getParamsTypeList();
        this.getFilterMethodList();
    }

    //获取参数类型列表
    getParamsTypeList = () => {
        this.getSystemValueList(3101).then(res => {
            this.setState({
                paramsTypeList: res.data.values
            });
        }).catch(err => {
            message.error(err.response.data.message);
        })
    }

    //获取筛选方式列表
    getFilterMethodList = () => {
        this.getSystemValueList(3104).then(res => {
            this.setState({
                filterMethodList: res.data.values
            });
        }).catch(err => {
            message.error(err.response.data.message);
        })
    }

    //提交
    handleSubmit = () => {
        this.props.form.validateFields((err, values) => {
            if (err) return;

            let { params } = this.props;

            let method = service.addParamsSetting;

            if (params.id) {
                method = service.updateParamsSetting;
            }

            this.setState({ saveLoading: true });
            method({ ...params, ...values }).then(res => {
                message.success(params.id ? "编辑成功！" : "新增成功！");
                this.setState({ saveLoading: false });
                this.props.close && this.props.close(true);
            }).catch(err => {
                message.error(err.response.data.message);
                this.setState({ saveLoading: false });
            });
        })
    }

    //取消
    handleCancel = () => {
        this.props.close && this.props.close();
    }

    //筛选方式改变
    filterMethodChange = (value) => {
        if (value == "CUSTOM_SQL") {
            this.props.form.setFieldsValue({ columnName: "" });
        } else if (value == "TABLE_COLUMN") {
            this.props.form.setFieldsValue({ customSql: "" });
        }
    }

    render() {

        const { getFieldDecorator } = this.props.form;
        const { saveLoading, paramsTypeList, filterMethodList } = this.state;

        const formItemLayout = {
            labelCol: {
                span: 8
            },
            wrapperCol: {
                span: 10
            }
        };

        return (
            <div style={{ padding: "40px 0" }}>
                <Form onSubmit={this.handleSubmit}>
                    <FormItem
                        {...formItemLayout}
                        label="表名称"
                    >
                        {getFieldDecorator('tableName', {
                            rules: [{
                                required: true, message: '请输入',
                            }],
                            initialValue: this.props.params.tableName || ""
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="参数类型"
                    >
                        {getFieldDecorator('dataType', {
                            rules: [{
                                required: true, message: '请选择',
                            }],
                            initialValue: this.props.params.dataType || ""
                        })(
                            <Select>
                                {paramsTypeList.map(item => {
                                    return (
                                        <Select.Option key={item.value} value={item.value}>{item.messageKey}</Select.Option>
                                    )
                                })}
                            </Select>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="筛选方式"
                    >
                        {getFieldDecorator('filterMethod', {
                            rules: [{
                                required: true, message: '请选择',
                            }],
                            initialValue: this.props.params.filterMethod || ""
                        })(
                            <Select onChange={this.filterMethodChange}>
                                {filterMethodList.map(item => {
                                    return (
                                        <Select.Option key={item.value} value={item.value}>{item.messageKey}</Select.Option>
                                    )
                                })}
                            </Select>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="关联条件"
                    >
                        {getFieldDecorator('customSql', {
                            rules: [{
                                required: this.props.form.getFieldValue("filterMethod") == "CUSTOM_SQL", message: '请输入',
                            }],
                            initialValue: this.props.params.customSql || ""
                        })(
                            <TextArea autosize={{
                                minRows: 3
                            }} disabled={this.props.form.getFieldValue("filterMethod") != "CUSTOM_SQL"} />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="参数名称"
                    >
                        {getFieldDecorator('columnName', {
                            rules: [{
                                required: this.props.form.getFieldValue("filterMethod") == "TABLE_COLUMN", message: '请输入',
                            }],
                            initialValue: this.props.params.columnName || ""
                        })(
                            <Input disabled={this.props.form.getFieldValue("filterMethod") != "TABLE_COLUMN"} />
                        )}
                    </FormItem>
                    <div className="slide-footer">
                        <Button type="primary" htmlType="submit" loading={saveLoading}>
                            {this.$t('common.save')}
                        </Button>
                        <Button onClick={this.handleCancel}>{this.$t('common.cancel')}</Button>
                    </div>
                </Form>
            </div>
        )
    }
}

export default Form.create()(NewParamsSetting)

