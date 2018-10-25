import React from 'react';
import { connect } from 'dva';
import { Button, Form, Switch, Input, message, Icon, Select, Radio, Col, Row } from 'antd';
import LanguageInput from 'components/Widget/Template/language-input/language-input'
const FormItem = Form.Item;
const Option = Select.Option;
import SSService from 'containers/setting/subject-sheet/subject-sheet.service'

class NewSubjectSheet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            params: {},
            loading: false,
            newSheet: {
                i18n: {},
                accountSetDesc: ''
            },
        };
    }

    componentWillMount() {
        let params = this.props.params;
        if (params && JSON.stringify(params) != "{}") {
          this.setState({
            newSheet: params,
          })
        }
      }
    
    //   componentWillReceiveProps(nextProps) {
    //     if (!nextProps.params.visible && this.props.params.visible) {
    //       this.setState({ newSheet: { i18n: {accountSetDesc:[]}, accountSetDesc: '' } });
    //       this.props.form.resetFields();
    //     }
    //     if (nextProps.params.visible && !this.props.params.visible) {
    //       let params = nextProps.params;
    //       console.log(params)
    //       if (params && JSON.stringify(params) != "{}") {
    //         this.setState({
    //           newSheet: params
    //         })
    //       }
    //     }
    //   }
    
      componentDidMount(){
        if(this.props.params.visible){
          this.setState({newSheet: this.props.params})
        }
      }
    

    //校验多语言
    validateI18n = (accout) => {
        let str = /^[\u4E00-\u9FA5\w\d]*$/u;
        if (!str.test(accout.accountSetDesc) || accout.accountSetDesc.length > 100) {
            message.warning(this.$t({ id: 'setting.companyGroupName.tips' }))
            return false;
        } else {
            return true;
        }
    }
    //新建或编辑
    handleSave = () => {
        const { newSheet } = this.state;
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let account = Object.assign({}, newSheet, values);
                if (this.validateI18n(account)) {
                    if (this.props.params.id) {
                        this.editAccount(account);
                    } else {
                        this.newAccount(account);
                    }
                }
            }
        });
    };

    //新增
    newAccount = (account) => {
        this.setState({ loading: true });
        SSService.newAccount(account).then((res) => {
            this.setState({
                newSheet: {
                    i18n: {},
                    accountSetDesc: '',
                },
                loading: false,
            })
            this.props.form.resetFields();
            this.props.close(true);
            message.success(this.$t({ id: "common.create.success" }, { name: this.$t({ id: 'subject.sheet' }) }));
        });
        this.setState({ loading: false });

    }
    //修改
    editAccount = (account) => {
        this.setState({ loading: true });
        SSService.editAccount(account)
            .then((res) => {
                this.setState({
                    loading: false,
                })
                this.props.form.resetFields();
                this.props.close(true);
                message.success(this.$t({ id: "wait.for.save.modifySuccess" })/*编辑成功*/);
            })

    }

    onCancel = () => {
        // this.setState({
        //   newSheet: {
        //     i18n: {},
        //     accountSetDesc: ''
        //   },
        // },()=>{
        this.props.form.resetFields();
        this.props.close();
        // })

    };

    handleNewSheetChange = (value, i18n) => {
        let newSheet = this.state.newSheet;
        newSheet.accountSetDesc = value;
        !newSheet.i18n && (newSheet.i18n = {});
        newSheet.i18n.accountSetDesc = i18n;
        this.setState({
            newSheet,
        })
    }

    formChange = () => {
        this.setState({
            loading: false,
        });
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const { newSheet } = this.state;
        const formItemLayout = {
            labelCol: { span: 6, offset: 1 },
            wrapperCol: { span: 14, offset: 1 },
        };
        return (
            <div className="new-payment-method">
                <Form onSubmit={this.handleSave} onChange={this.formChange}>
                    <FormItem {...formItemLayout} label={this.$t({ id: 'subject.sheet.code' })/*科目表代码*/}>
                        {getFieldDecorator('accountSetCode', {
                            rules: [{
                                required: true,
                                message: this.$t({ id: "common.please.enter" })
                            },
                            {
                                validator: (item, value, callback) => {
                                    let str = /^[0-9a-zA-z-_]*$/;
                                    if (!str.test(value) || value.length > 35) {
                                        callback(this.$t({ id: "setting.companyGroupCode.tips" }))
                                    }
                                    callback();
                                }
                            }
                            ],
                            initialValue: this.props.params.accountSetCode || ''
                        })(
                            <Input disabled={this.props.params.id ? true : false} />
                            )}
                    </FormItem>
                </Form>
                <Row style={{ marginBottom: 20 }}>
                    <Col span={6} offset={1} style={{ textAlign: 'right' }}>
                        <span style={{ color: 'red' }}>&nbsp;*</span>{/*科目表名称*/}&nbsp;{this.$t({ id: 'subject.sheet.describe' })}：
          </Col>
                    <Col span={14} offset={1}>
                        <LanguageInput
                            isEdit={this.props.params.id ? true : false}
                            name={newSheet.accountSetDesc}
                            i18nName={newSheet.i18n && newSheet.i18n.accountSetDesc ? [...newSheet.i18n.accountSetDesc] : null}
                            nameChange={(value, i18n) => this.handleNewSheetChange(value, i18n)}
                        //disabled={this.props.params.id ? true : false}
                        />
                    </Col>
                </Row>
                <Form>
                    <FormItem {...formItemLayout} label={this.$t({ id: 'common.column.status' })}>
                        {getFieldDecorator('enabled', {
                            initialValue: this.props.params.id ? this.props.params.enabled : true
                        })(
                            <Switch checked={this.props.form.getFieldValue('enabled')}
                                checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />} />
                            )}
                        &nbsp;&nbsp;&nbsp;&nbsp;
            {this.props.form.getFieldValue('enabled') ? this.$t({ id: "common.status.enable" }) : this.$t({ id: "common.status.disable" })}
                    </FormItem>
                </Form>
                <div className="slide-footer">
                    <Button type="primary"
                        onClick={this.handleSave}
                        loading={this.state.loading}>{this.$t({ id: "common.save" })}</Button>
                    <Button onClick={this.onCancel}>{this.$t({ id: "common.cancel" })}</Button>
                </div>
            </div>
        )
    }
}


const WrappedNewSubjectSheet = Form.create()(NewSubjectSheet);

function mapStateToProps(state) {
    return {
        company: state.user.company,
    }
}
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewSubjectSheet);
