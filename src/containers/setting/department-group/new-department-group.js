import React from 'react';

import { Button, Form, Select, Input, Col, Row, Switch, message, Icon } from 'antd';
import { connect } from 'dva'

import httpFetch from 'share/httpFetch';
import config from 'config'
import debounce from 'lodash.debounce';
import 'styles/setting/department-group/new-department-group.scss';

import { routerRedux } from 'dva/router';


const FormItem = Form.Item;
const Option = Select.Option;
import LanguageInput from 'widget/Template/language-input/language-input'

class NewDepartmentGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            statusCode: this.$t({ id: 'common.enabled' }),  /*启用*/
            organization: {},
            setOfBooks: [],
            description: [], //描述的多语言
            name: '',
        };
    }

    componentWillMount() {
        httpFetch.get(`${config.baseUrl}/api/setOfBooks/by/tenant?roleType=TENANT`).then((response) => {
            let setOfBooks = [];
            response.data.map((item) => {
                let option = {
                    value: item.setOfBooksCode + " - " + item.setOfBooksName,
                    id: item.id
                };
                setOfBooks.addIfNotExist(option)
            });
            this.setState({
                setOfBooks: setOfBooks
            });
        });
    }


    //新建预算表
    handleSave = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                values.i18n = {};
                values.i18n.description = this.state.description;
                this.setState({ loading: true });
                httpFetch.post(`${config.baseUrl}/api/DepartmentGroup/insertOrUpdate`, values).then((response) => {
                    if (response) {
                        message.success(this.$t({ id: 'structure.saveSuccess' })); /*保存成功！*/
                        // this.context.router.push(menuRoute.getMenuItemByAttr('department-group', 'key').children.departmentGroupDetail.url.replace(':id',response.data.id))

                        this.props.dispatch(
                            routerRedux.push({
                                pathname: `/admin-setting/department-group/department-group-detail/${response.data.id}`,
                            })
                        );

                    }
                }).catch((e) => {
                    if (e.response) {
                        message.error(`${this.$t({ id: 'common.save.filed' })}, ${e.response.data.message}`);
                    }
                    this.setState({ loading: false });
                })
            }
        });
    };

    //点击取消，返回部门组
    handleCancel = (e) => {
        e.preventDefault();
        // this.context.router.push(menuRoute.getMenuItemByAttr('department-group', 'key').url);

        this.props.dispatch(
            routerRedux.push({
                pathname: `/admin-setting/department-group`,
            })
        );

    };


    handleChange = () => {
        if (this.state.loading) {
            this.setState({
                loading: false
            })
        }
    };

    //描述多语言
    handleDescriptionChange = (value, i18n) => {
        this.setState({ name: value, description: i18n })
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const { statusCode, organization, loading, setOfBooks, description, name } = this.state;

        return (
            <div className="new-department-group">
                <Form onSubmit={this.handleSave} onChange={this.handleChange}>
                    <Row gutter={24}>
                        <Col span={8}>
                            <FormItem
                                label={this.$t({ id: 'setting.deptGroup.code' })} /*部门组代码*/
                                colon={true}>
                                {getFieldDecorator('deptGroupCode', {
                                    initialValue: organization.organizationName,
                                    rules: [
                                        { required: true, message: this.$t({ id: 'common.please.enter' }) },
                                        //部门组代码前端不做校验，使用后端提示
                                        // {
                                        //   validator: (item,value,callback)=>{
                                        //     let str = /^[0-9a-zA-z-_]*$/;
                                        //     if(!str.test(value)||value.length >35){
                                        //       callback(messages('setting.companyGroupCode.tips'))
                                        //     }
                                        //     callback();
                                        //   }
                                        // }
                                    ]
                                })(
                                    <Input placeholder={this.$t({ id: 'common.please.enter' })} />)
                                }
                            </FormItem>
                            <div className="department-group-tips">
                                {this.$t({ id: 'setting.dept.code.tips' })}
                            </div>
                        </Col>
                        <Col span={8} offset={1}>
                            <FormItem
                                label={this.$t({ id: 'setting.deptGroup.name' })} /* 部门组名称*/
                                colon={true}>
                                {getFieldDecorator('description', {
                                    rules: [
                                        { required: true, message: this.$t({ id: 'common.please.enter' }) },
                                        {
                                            validator: (item, value, callback) => {
                                                if (value) {
                                                    let str = /^[\u4E00-\u9FA5a-zA-Z0-9_]*$/;
                                                    if (!str.test(value) || (value.length > 100)) {
                                                        callback(this.$t({ id: 'setting.companyGroupName.tips' }))
                                                    }
                                                }
                                                callback();
                                            }
                                        }
                                    ]
                                })(
                                    <LanguageInput nameChange={this.handleDescriptionChange} name={name} i18nName={description} />
                                    )}
                            </FormItem>
                            <div className="department-group-tips">
                                {this.$t({ id: 'setting.dept.name.tips' })}
                            </div>
                        </Col>
                        <Col span={6} offset={1}>
                            <FormItem
                                label={this.$t({ id: 'common.status' }, { status: statusCode })} /* {/!*状态*!/}*/
                                colon={false}>
                                {getFieldDecorator("enabled", {
                                    initialValue: true,
                                    valuePropName: 'checked',
                                    rules: [
                                        {
                                            validator: (item, value, callback) => {
                                                this.setState({
                                                    statusCode: value ? this.$t({ id: 'common.enabled' }) /*启用*/
                                                        : this.$t({ id: 'common.disabled' }) /*禁用*/
                                                });
                                                callback();
                                            }
                                        }
                                    ],
                                })
                                    (<Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />} />)
                                }
                            </FormItem>
                        </Col>
                    </Row>
                    <Button type="primary" loading={loading} htmlType="submit">{this.$t({ id: 'common.save' }) /*保存*/}</Button>
                    <Button onClick={this.handleCancel} style={{ marginLeft: 8 }}> {this.$t({ id: 'common.cancel' }) /*取消*/}</Button>
                </Form>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {}
}



const WrappedNewDepartmentGroup = Form.create()(NewDepartmentGroup);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewDepartmentGroup);
