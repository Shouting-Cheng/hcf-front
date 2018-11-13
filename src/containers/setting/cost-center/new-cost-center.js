
/**
 * Created by zhouli on 18/3/13
 * Email li.zhou@huilianyi.com
 */
//新增成本中心
//编辑成本中心

import React from 'react';
import { Button, Form, Input, Col, Row, Switch, Icon, Select, message } from 'antd';

import CCService from 'containers/setting/cost-center/cost-center.service';
import 'styles/setting/cost-center/new-cost-center.scss';
import { connect } from 'dva';

const FormItem = Form.Item;
import { deepCopy } from 'utils/extend';

const Option = Select.Option;
import { LanguageInput } from 'widget/index';
import { costCenterDefault } from "containers/setting/cost-center/cost-center.model";

import { routerRedux } from 'dva/router';

class NewCostCenter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            setOfBooks: [],
            costCenterDetail: deepCopy(costCenterDefault),
            setOfBooksId:0
        }
            ;
    }

    componentWillMount() {
        CCService.getTenantAllSob()
            .then(res => {
                this.setState({ setOfBooks: res.data })
            })
        if (this.props.match.params.id === "NEW") {
            //新增
        } else {
            //更新
            this.getCostCenterDetail()
        }
    }

    getCostCenterDetail() {
        CCService.getCostCenterDetail(this.props.match.params.id)
            .then((response) => {
                this.setState({
                    costCenterDetail: response.data,
                })
            });
    }

    //校验名称长度
    validateNameLengthErr = (name) => {
        if (name === null || name === undefined || name === "") {
            // 请填写名称
            message.warn(this.$t("value.list.name.input"));
            return true;
        }
        if (name && name.length && name.length > 100) {
            //名称最多输入100个字符
            message.warn(this.$t('value.list.name.max.100'));
            return true;
        }
    }
    handleSave = (e) => {
        e.preventDefault();
        let costCenterDetail = this.state.costCenterDetail;
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                if (values.setOfBooksId === costCenterDetail.setOfBooksName) {
                    values.setOfBooksId = costCenterDetail.setOfBooksId;
                }
                //名称涉及到多语言，就不用values
                values.name = costCenterDetail.name;
                costCenterDetail = Object.assign(costCenterDetail, values);
                if (this.validateNameLengthErr(costCenterDetail.name)) {
                    return;
                }
                if (costCenterDetail.id) {
                    this.updateCostCenter(costCenterDetail);
                } else {
                    this.createCostCenter(costCenterDetail);
                }
            }
        });
    };
    createCostCenter = (costCenter) => {
        this.setState({
            loading: true,
        });
        CCService.createCostCenter(costCenter)
            .then((response) => {
                if (response) {
                    this.setState({ loading: false });
                    this.props.form.resetFields();
                    this.setState({costCenterDetail:{}})
                    this.props.dispatch(
                        routerRedux.push({
                            pathname: `/admin-setting/cost-center/${this.state.setOfBooksId}`,
                        })
                    );
                }
            })
            .catch(() => {
                this.setState({ loading: false });
            })
    }
    updateCostCenter = (costCenter) => {
        this.setState({
            loading: true,
        });
        CCService.updateCostCenter(costCenter)
            .then((response) => {
                if (response) {
                    message.success(this.$t('common.save.success',{name : ''}))
                    this.setState({ loading: false });
                    this.props.dispatch(
                    routerRedux.push({
                      pathname: `/admin-setting/cost-center/${this.props.match.params.setOfBooksId}`,
                    })
                  );
                }
            })
            .catch((e) => {
                message.error(e.response.data.message);
                this.setState({ loading: false });
            })
    }
    //点击取消，返回
    handleCancel = (e) => {
        e.preventDefault();
        // this.context.router.goBack();
        this.props.form.resetFields();
        this.setState({costCenterDetail:{}})
        this.props.dispatch(
            routerRedux.push({
                pathname: `/admin-setting/cost-center/${this.props.match.params.setOfBooksId}`,
            })
        );
    };
    //名称：自定义值列表项多语言
    i18nNameChange = (name, i18nName) => {
        this.state.costCenterDetail.name = name;
        if (this.state.costCenterDetail.i18n) {
            this.state.costCenterDetail.i18n.name = i18nName;
        } else {
            this.state.costCenterDetail.i18n = {
                name: i18nName
            };
        }
    }
    onSelectSetOfBook=(value)=>{
        this.setState({
            setOfBooksId:value
        })
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const { loading, costCenterDetail } = this.state;
        return (
            <div className="new-cost-center">
                <Form onSubmit={this.handleSave} onChange={this.handleChange}>
                    <Row gutter={24}>
                        <Col span={8}>
                            {/*成本中心代码*/}
                            <FormItem
                                label={this.$t("new.cost.center.code")}
                                colon={true}>
                                {getFieldDecorator('code', {
                                    initialValue: costCenterDetail.code,
                                    rules: [
                                        {
                                            required: true,
                                            message: this.$t("common.please.enter")
                                        },
                                        //成本中心编码直接使用后端校验
                                        // {
                                        //   message: this.$t("new.cost.center.max36.char"),//最多36个字符，只支持字母与数字
                                        //   validator: (rule, value, cb) => {
                                        //     if (value === null || value === undefined || value === "") {
                                        //       cb();
                                        //       return;
                                        //     }
                                        //     let regExp = /^[a-z0-9_ ]+$/i;
                                        //     //去掉空格
                                        //     value = value.replace(/ /g, '');
                                        //     if (value.length <= 36 && regExp.test(value)) {
                                        //       cb();
                                        //     } else {
                                        //       cb(false);
                                        //     }
                                        //   },
                                        // },
                                    ]
                                })(
                                    <Input disabled={(costCenterDetail.id && costCenterDetail.code) || !this.props.tenantMode}
                                        placeholder={this.$t("common.please.enter")} />)
                                }
                            </FormItem>
                            <div className="person-group-tips">
                                {/*注：成本中心代码保存后将不可修改*/}
                                {
                                    this.$t("new.cost.center.tip1")
                                }
                            </div>
                        </Col>

                        <Col span={8}>
                            {/*成本中心名称*/}
                            <FormItem label={this.$t("new.cost.center.name")}>
                                {getFieldDecorator('name', {
                                    initialValue: costCenterDetail.name,
                                    rules: [
                                        {
                                            required: true,
                                            message: this.$t("common.please.enter")
                                        },
                                        {
                                            max: 100,
                                            //最多输入100个字符
                                            message: this.$t('value.list.input.max.100'),
                                        }],
                                })(
                                    <div>
                                        <LanguageInput
                                            disabled={!this.props.tenantMode}
                                            key={1}
                                            name={costCenterDetail.name}
                                            i18nName={costCenterDetail.i18n ? costCenterDetail.i18n.name : ""}
                                            isEdit={costCenterDetail.id}
                                            nameChange={this.i18nNameChange}
                                        />
                                    </div>
                                    )}
                            </FormItem>

                        </Col>

                        <Col span={8}>
                            {/*账套*/}
                            <FormItem
                                label={this.$t("new.cost.center.sob")}
                                colon={true}>
                                {getFieldDecorator('setOfBooksId', {
                                    initialValue: costCenterDetail.setOfBooksName,
                                    rules: [
                                        {
                                            required: true,
                                            message: this.$t("common.please.enter")
                                        },
                                    ]
                                })(
                                    <Select disabled={!this.props.tenantMode || costCenterDetail.setOfBooksName}
                                        placeholder={this.$t('common.please.select')}
                                        onSelect={this.onSelectSetOfBook}
                                    >
                                        {this.state.setOfBooks.map((option) => {
                                            return <Option key={option.id}>{option.setOfBooksName}</Option>
                                        })}
                                    </Select>
                                    )
                                }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col span={8}>
                            {/*状态*/}
                            <FormItem
                                label={this.$t("common.status", { status: "" })}
                                colon={true}>
                                {getFieldDecorator("enabled", {
                                    initialValue: costCenterDetail.enabled,
                                    valuePropName: 'checked',
                                    rules: [],
                                })
                                    (<Switch checkedChildren={<Icon type="check" />}
                                        unCheckedChildren={<Icon type="cross" />} />)
                                }
                            </FormItem>
                        </Col>
                    </Row>
                    <Button type="primary" loading={loading} htmlType="submit">
                        {this.$t("common.save") /*保存*/}
                    </Button>
                    <Button onClick={this.handleCancel} style={{ marginLeft: 8 }}>
                        {this.$t("common.cancel") /*取消*/}
                    </Button>
                </Form>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        profile: state.user.profile,
        user: state.user.currentUser,
        company: state.user.company,
        tenantMode: true,
    }
}

//本组件需要用一下Form表单属性
const WrappedNewCostCenter = Form.create()(NewCostCenter);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewCostCenter);
