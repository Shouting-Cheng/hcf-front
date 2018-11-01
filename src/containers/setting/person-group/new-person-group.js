/**
 * Created by zhouli on 18/1/17
 * Email li.zhou@huilianyi.com
 */
import React from 'react';
import { Button, Form, Input, Col, Row, Switch, Icon } from 'antd';

// import menuRoute from 'routes/menuRoute';
import PGService from 'containers/setting/person-group/person-group.service';
import 'styles/setting/person-group/new-person-group.scss';
import { LanguageInput } from 'widget/index';

import { routerRedux } from 'dva/router';
import { connect } from 'dva';

const FormItem = Form.Item;

class NewPersonGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            statusCode: this.$t('common.enabled'), /*启用*/
            userGroup: { //人员组详情数据
                name: '', //人员组名称
                comment: '', //描述
                i18n: {} //多语言，包含人员组名称，描述
            }
        };
    }

    componentWillMount() {
        // console.log(this.props.match)
    }
    componentDidMount() {
        if (this.props.match.params.id) {
            this.getGroupDetail();
        }
    }

    getGroupDetail = () => {
        //根据路径上的oid,查出该条完整数据
        PGService.getPersonGroupDetail(this.props.match.params.id)
            .then((response) => {
                this.initDetailData(response.data);
            })
    }

    //初始化人员组详情页数据
    initDetailData = (data) => {
        this.props.form.setFieldsValue({
            'code': data.code,
            'name': data.name,
            'comment': data.comment,
            'enabled': data.enabled
        });
        this.setState({
            userGroup: data
        });
    };

    handleSave = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let _userGroup = this.state.userGroup;
                this.setState({
                    loading: true,
                });
                if (this.props.match.params.id) {
                    _userGroup.enabled = values.enabled;
                    PGService.UpdatePersonGroup(_userGroup)
                        .then((response) => {
                            if (response) {
                                this.setState({ loading: false });
                                // this.context.router.push(menuRoute.getMenuItemByAttr('person-group', 'key')
                                //   .children.personGroupDetail.url.replace(':id', response.data.userGroupOID));
                                this.props.dispatch(
                                    routerRedux.push({
                                        pathname: `/admin-setting/person-group/person-group-detail/${response.data.userGroupOID}`,
                                    })
                                );

                            }
                        })
                        .catch(() => {
                            this.setState({ loading: false });
                        })
                } else {
                    values.i18n = _userGroup.i18n;
                    PGService.createPersonGroup(values)
                        .then((response) => {
                            if (response) {
                                this.setState({ loading: false });
                                // this.context.router.push(menuRoute.getMenuItemByAttr('person-group', 'key')
                                //     .children.personGroupDetail.url.replace(':id', response.data.userGroupOID));
                                this.props.dispatch(
                                    routerRedux.push({
                                        pathname: `/admin-setting/person-group/person-group-detail/${response.data.userGroupOID}`,
                                    })
                                );
                            }
                        })
                        .catch(() => {
                            this.setState({ loading: false });
                        })
                }
            }
        });
    };
    //点击取消，返回
    handleCancel = (e) => {
        e.preventDefault();
        // this.context.router.goBack();
        this.props.dispatch(
            routerRedux.push({
                pathname: `/admin-setting/person-group`,
            })
        );
    };

    //人员组名称：多语言
    i18nNameChange = (name, i18nName) => {
        const userGroup = this.state.userGroup;
        userGroup.name = name;
        if (!userGroup.i18n) {
            userGroup.i18n = {};
        }
        userGroup.i18n.name = i18nName;
    };

    //描述：多语言
    i18nCommentChange = (name, i18nName) => {
        const userGroup = this.state.userGroup;
        userGroup.comment = name;
        if (!userGroup.i18n) {
            userGroup.i18n = {};
        }
        userGroup.i18n.comment = i18nName;
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const { statusCode, loading, userGroup } = this.state;

        return (
            <div className="new-person-group">
                <Form onSubmit={this.handleSave} onChange={this.handleChange}>
                    <Row gutter={24}>
                        <Col span={6}>
                            <FormItem
                                label={this.$t('person.group.code')}  /*人员组代码*/
                                colon={true}>
                                {getFieldDecorator('code', {
                                    rules: [
                                        { required: true, message: this.$t('common.please.enter') }
                                    ]
                                })(
                                    <Input placeholder={this.$t('common.please.enter')} disabled={!!this.props.match.params.id} />)
                                }
                            </FormItem>
                            {!this.props.match.params.id && (
                                <div className="person-group-tips">
                                    {/*注：人员组代码保存后将不可修改*/}
                                    {this.$t('person.group.creating_code_tips')}
                                </div>
                            )}
                        </Col>
                        <Col span={6}>
                            <FormItem
                                label={this.$t('person.group.name')} /* 人员组名称*/
                                colon={true}>
                                {getFieldDecorator('name', {
                                    rules: [
                                        { required: true, message: this.$t('common.please.enter') },
                                    ]
                                })(
                                    <LanguageInput
                                        key={1}
                                        name={userGroup.name}
                                        i18nName={userGroup.i18n && userGroup.i18n.name ? userGroup.i18n.name : null}
                                        placeholder={this.$t('common.please.enter')/* 请输入 */}
                                        isEdit={userGroup.id}
                                        nameChange={this.i18nNameChange}
                                    />
                                    )}
                            </FormItem>
                        </Col>
                        <Col span={6}>
                            <FormItem
                                label={this.$t('person.group.desc')} /* 人员组描述*/
                                colon={true}>
                                {getFieldDecorator('comment', {
                                    rules: [
                                        { required: true, message: this.$t('common.please.enter') },
                                    ]
                                })(
                                    <LanguageInput
                                        key={2}
                                        name={userGroup.comment}
                                        i18nName={userGroup.i18n && userGroup.i18n.comment ? userGroup.i18n.comment : null}
                                        placeholder={this.$t('common.please.enter')/* 请输入 */}
                                        isEdit={userGroup.id}
                                        nameChange={this.i18nCommentChange}
                                    />
                                    )}
                            </FormItem>
                        </Col>
                        {/* </Row>
                    <Row gutter={24}> */}
                        <Col span={6}>
                            <FormItem
                                label={this.$t('common.column.status')} /* {/!*状态*!/}*/
                                colon={false}>
                                {getFieldDecorator("enabled", {
                                    initialValue: true,
                                    valuePropName: 'checked',
                                    rules: [
                                        {
                                            validator: (item, value, callback) => {
                                                this.setState({
                                                    statusCode: value ? this.$t('common.enabled') /*启用*/
                                                        : this.$t('common.disabled') /*禁用*/
                                                })
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
                    <Button type="primary" loading={loading} htmlType="submit">
                        {this.$t('common.save') /*保存*/}
                    </Button>
                    <Button onClick={this.handleCancel} style={{ marginLeft: 8 }}>
                        {this.$t('common.cancel') /*取消*/}
                    </Button>
                </Form>
            </div>
        )
    }
}


//本组件需要用一下Form表单属性
const WrappedNewPersonGroup = Form.create()(NewPersonGroup);
export default connect()(WrappedNewPersonGroup);
