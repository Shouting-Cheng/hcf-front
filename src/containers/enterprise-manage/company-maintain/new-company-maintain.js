// 为了0416迭代上线，重构此文件
import React from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Form, Switch, Icon, Input, Button, Row, Col, message, DatePicker, Select } from 'antd';
import moment from 'moment';
import config from 'config';
import companyMaintainService from 'containers/enterprise-manage/company-maintain/company-maintain.service';
import Selector from 'components/Widget/selector';
import 'styles/enterprise-manage/company-maintain/new-company-maintain.scss';

const Option = Select.Option;
const FormItem = Form.Item;

class WrappedNewCompanyMaintain extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      companyDetail: {
        companyOid: null,
        companyCode: null, //公司代码
        name: '', //公司名称
        companyTypeId: '4993798', //类型后端已经默认：业务实体
        companyTypeName: '', //类型后端已经默认：业务实体
        companyLevelId: null, //公司级别
        companyLevelName: '', //公司级别名称：用于显示
        legalEntityId: null, //法人
        legalEntityName: '', //法人名称：用于显示
        parentCompanyId: null, //非比填:上级公司
        parentCompanyName: '', //非比填:上级公司：用于显示
        setOfBooksId: null, //账套,也不用上传，默认是法人一个账套
        setOfBooksName: '', //账套：用于显示
        startDateActive: null, //有效期从
        endDateActive: null, //有效期到
        address: '', //非比填
        enabled: true, //状态
        id: '',
      },
      loading: false,
      //公司级别下拉单
      selectListCompanyLevel: {
        url: `${config.baseUrl}/api/companyLevel/selectByTenantId`,
        label: record => `${record.description}`,
        key: 'id',
      },
      //法人下拉单
      selectListLegalEntity: {
        url: `${config.baseUrl}/api/all/legalentitys`,
        label: record => `${record.entityName}`,
        key: 'id',
      },
      //上级公司：需要过滤本公司，所以有参数
      //如果是新增不过滤
      selectListParentCompany: {
        url:
          config.baseUrl +
          '/api/company/by/tenant?setOfBooksId=' +
          this.props.company.setOfBooksId +
          (this.props.match.params.companyOid === ':companyOid'
            ? ''
            : '&filterCompanyOids=' + this.props.match.params.companyOid),
        label: record => `${record.name}`,
        key: 'id',
      },
      //账套
      selectListSob: {
        url: `${config.baseUrl}/api/setOfBooks/by/tenant`,
        label: record => `${record.setOfBooksName}`,
        key: 'id',
      },
    };
  }

  componentDidMount() {
    if (this.props.match.params.flag === 'create') {
      this.getSelectListParentCompany();
    } else {
      this.getCompanyById(this.props.match.params.flag);
    }
  }

  //获取公司详情：如果是编辑
  getCompanyById = id => {
    companyMaintainService.getCompanyById(id).then(res => {
      this.setState(
        {
          companyDetail: res.data,
        },
        () => {
          this.getSelectListParentCompany(
            this.state.companyDetail.legalEntityId,
            this.props.match.params.companyOid
          );
        }
      );
    });
  };

  getSelectListParentCompany = (legalEntityId, companyOid) => {
    let params = {
      legalEntityId: legalEntityId ? legalEntityId : 0,
      filterCompanyOids: companyOid ? companyOid : null,
    };
    companyMaintainService.getSelectListParentCompany(params).then(res => {
      let selectListParentCompany = this.state.selectListParentCompany;
      selectListParentCompany = res.data;
      this.setState({
        selectListParentCompany,
      });
    });
  };

  //保存新建公司
  handleSave = e => {
    e.preventDefault();
    let _company = this.state.companyDetail;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (!_company.startDateActive) {
          //请选择有效期从
          message.warning(this.$t('common.please.select') + this.$t('company.startDateActive'));
          return;
        }

        values.startDateActive = values.startDateActive.format();
        if (values.endDateActive) {
          values.endDateActive = values.endDateActive.format();
        }

        if (values.legalEntityId === _company.legalEntityName) {
          values.legalEntityId = _company.legalEntityId;
        }
        if (values.companyLevelId === _company.companyLevelName) {
          values.companyLevelId = _company.companyLevelId;
        } else {
          _company.companyLevelId = values.companyLevelId;
        }
        if (values.parentCompanyId === _company.parentCompanyName) {
          //进入页面，未修改
          values.parentCompanyId = _company.parentCompanyId;
        } else {
          //修改后
          _company.parentCompanyId = values.parentCompanyId;
        }

        if (_company.id && _company.companyOid) {
          //当删除某一个字段的时候，values 为null，导致没有覆盖原有属性
          let company = Object.assign(_company, values);
          if (company.companyLevelId === null || company.companyLevelId === undefined) {
            company.companyLevelName = null;
            company.companyLevelId = null;
          }
          if (company.parentCompanyId === null || company.parentCompanyId === undefined) {
            company.parentCompanyName = null;
            company.parentCompanyId = null;
          }
          this.updateCompany(company);
        } else {
          this.addCompany(values);
        }
      }
    });
  };
  //新增公司
  addCompany = company => {
    this.setState({ loading: true });
    companyMaintainService.addCompany(company).then(response => {
      this.props.dispatch(
        routerRedux.replace({
          pathname: `/enterprise-manage/company-maintain`,
        })
      );
    });
    this.setState({ loading: false });
  };
  //编辑公司
  updateCompany = company => {
    this.setState({ loading: true });
    companyMaintainService.updateCompany(company).then(response => {
      this.props.dispatch(
        routerRedux.replace({
          pathname: `/enterprise-manage/company-maintain`,
        })
      );
    });
    this.setState({ loading: false });
  };
  //返回
  handleCancel = () => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/enterprise-manage/company-maintain`,
      })
    );
  };
  //不能大于endDate
  disabledStartDate = startValue => {
    const endValue = this.state.companyDetail.endDateActive;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  };
  //不能小于于startDate
  disabledEndDate = endValue => {
    const startValue = this.state.companyDetail.startDateActive;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  };
  onStartTimeChange = val => {
    let companyDetail = this.state.companyDetail;
    companyDetail.startDateActive = val;
    this.setState({
      companyDetail,
    });
  };
  onEndTimeChange = val => {
    let companyDetail = this.state.companyDetail;
    companyDetail.endDateActive = val;
    this.setState({
      companyDetail,
    });
  };
  //监听表单值
  handleChange = e => {
    if (this.state.loading) {
      this.setState({
        loading: false,
      });
    }
  };

  legalEntityIdChange = legalEntityId => {
    this.props.form.setFieldsValue({
      parentCompanyId: null,
    });
    this.getSelectListParentCompany(legalEntityId);
  };

  renderParentCompanyList = list => {
    if (list.length >= 1) {
      let listOption = list.map(item => {
        return (
          <Option value={item.id} key={item.id}>
            {item.name}
          </Option>
        );
      });
      return (
        <Select showSearch placeholder={this.$t('common.select')} allowClear={true}>
          {listOption}
        </Select>
      );
    } else {
      return (
        <Select placeholder={this.$t('common.select')} disabled={true}>
          {/*<Option value="null">*/}
          {/*{this.$t("common.select")}{this.$t("company.maintain.company.legalEntityName")}*/}
          {/*</Option>*/}
        </Select>
      );
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { companyDetail, loading } = this.state;
    return (
      <div className="new-company-maintain-warp">
        <Form onSubmit={this.handleSave} onChange={this.handleChange}>
          <Row gutter={24}>
            <Col span={8}>
              <FormItem
                label={this.$t('company.maintain.company.companyCode')} //公司代码
                colon={true}
              >
                {getFieldDecorator('companyCode', {
                  initialValue: companyDetail.companyCode,
                  rules: [
                    {
                      required: true,
                      message: this.$t('common.please.enter'),
                    },
                    {
                      max: 35,
                      message: this.$t('company.maintain.new.tips1'), //"不能超过35个字符"
                    },
                    //公司代码直接使用后端校验，前端提示
                    // {
                    //   message: this.$t("company.maintain.new.tips2"),//"只能是数字与字母",
                    //   validator: (rule, value, cb) => {
                    //     if (value === null || value === undefined || value === "") {
                    //       cb();
                    //       return;
                    //     }
                    //     var regExp = /^[a-z0-9_ ]+$/i;
                    //     //去掉空格
                    //     value = value.replace(/ /g, '');
                    //     if (value.length <= 35 && regExp.test(value)) {
                    //       cb();
                    //     } else {
                    //       cb(false);
                    //     }
                    //   },
                    // }
                  ],
                })(
                  <Input
                    disabled={!!companyDetail.companyCode}
                    placeholder={this.$t('common.please.enter')}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label={this.$t('company.maintain.company.name')} /* 公司名称*/ colon={true}>
                {getFieldDecorator('name', {
                  initialValue: companyDetail.name,
                  rules: [
                    {
                      required: true,
                      message: this.$t('common.please.enter'),
                    },
                    {
                      max: 100,
                      message: this.$t('company.maintain.new.tips3'), //"不能超过100个字符"
                    },
                  ],
                })(<Input placeholder={this.$t('common.please.enter')} />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={this.$t('company.maintain.company.companyLevelName')} /* 公司级别*/
                colon={true}
              >
                {getFieldDecorator('companyLevelId', {
                  initialValue: companyDetail.companyLevelName,
                })(
                  <Selector
                    placeholder={this.$t('common.please.select')}
                    selectorItem={this.state.selectListCompanyLevel}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <FormItem
                label={this.$t('company.maintain.company.legalEntityName')} /* 法人*/
                colon={true}
              >
                {getFieldDecorator('legalEntityId', {
                  initialValue: companyDetail.legalEntityName,
                  rules: [
                    {
                      required: true,
                      message: this.$t('common.please.select'),
                    },
                  ],
                })(
                  <Selector
                    onChange={this.legalEntityIdChange}
                    disabled={companyDetail.legalEntityId}
                    placeholder={this.$t('common.please.select')}
                    selectorItem={this.state.selectListLegalEntity}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={this.$t('company.maintain.company.parentCompanyName')} /* 上级公司*/
                colon={true}
              >
                {getFieldDecorator('parentCompanyId', {
                  initialValue: companyDetail.parentCompanyName,
                })(this.renderParentCompanyList(this.state.selectListParentCompany))}
              </FormItem>
            </Col>

            <Col span={8}>
              <FormItem
                label={this.$t('common.column.status')} //状态
                colon={false}
              >
                {getFieldDecorator('enabled', {
                  initialValue: companyDetail.enabled,
                  valuePropName: 'checked',
                })(
                  <Switch
                    //defaultChecked={companyDetail.enabled}
                    //checked={companyDetail.enabled}
                    checkedChildren={<Icon type="check" />}
                    unCheckedChildren={<Icon type="cross" />}
                  />
                )}
              </FormItem>
            </Col>
            {/*账套默认是法人的账套，暂时不用选择*/}
            {/*<Col span={8}>*/}
            {/*<FormItem*/}
            {/*label={"账套"} 账套*/}
            {/*colon={true}>*/}
            {/*{getFieldDecorator('setOfBooksId', {*/}
            {/*initialValue: companyDetail.setOfBooksName*/}
            {/*})(*/}
            {/*<Selector*/}
            {/*placeholder={this.$t("common.please.select")}*/}
            {/*selectorItem={this.state.selectListSob}/>*/}
            {/*)*/}
            {/*}*/}
            {/*</FormItem>*/}
            {/*</Col>*/}
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <FormItem
                label={
                  <span>
                    <span className="required-red">*&nbsp;</span>
                    <span>{this.$t('company.maintain.company.startDateActive')}</span>
                  </span>
                } //有效期从
                colon={true}
              >
                {getFieldDecorator('startDateActive', {
                  initialValue: companyDetail.startDateActive
                    ? moment(companyDetail.startDateActive)
                    : null,
                  rules: [],
                })(
                  <div>
                    <DatePicker
                      value={
                        companyDetail.startDateActive ? moment(companyDetail.startDateActive) : null
                      }
                      onChange={this.onStartTimeChange}
                      disabledDate={this.disabledStartDate}
                    />
                  </div>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={this.$t('company.maintain.company.endDateActive')} //有效期到
                colon={true}
              >
                {getFieldDecorator('endDateActive', {
                  initialValue: companyDetail.endDateActive
                    ? moment(companyDetail.endDateActive)
                    : null,
                  rules: [],
                })(
                  <div>
                    <DatePicker
                      value={
                        companyDetail.endDateActive ? moment(companyDetail.endDateActive) : null
                      }
                      onChange={this.onEndTimeChange}
                      disabledDate={this.disabledEndDate}
                    />
                  </div>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col>
              <FormItem label={this.$t('company.maintain.company.address')} /* 地址*/ colon={true}>
                {getFieldDecorator('address', {
                  initialValue: companyDetail.address,
                  rules: [],
                })(<Input placeholder={this.$t('common.please.enter')} />)}
              </FormItem>
            </Col>
          </Row>
          <div>
            <Button type="primary" loading={loading} htmlType="submit">
              {this.$t('common.save') /*保存*/}
            </Button>
            <Button onClick={this.handleCancel} style={{ marginLeft: 8 }}>
              {this.$t('common.cancel') /*取消*/}
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    profile: state.user.profile,
    user: state.user.currentSser,
    tenantMode: true,
    company: state.user.company,
  };
}
const NewCompanyMaintain = Form.create()(WrappedNewCompanyMaintain);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(NewCompanyMaintain);
