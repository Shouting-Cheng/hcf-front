/**
 * Created by zhouli on 18/3/13
 * Email li.zhou@huilianyi.com
 */
//新增成本中心项
import React from 'react';
import { connect } from 'dva';
import { Button, Form, Input, Col, Row, Switch, Icon, message, Tag, Select, Tooltip } from 'antd';

import CCService from 'containers/setting/cost-center/cost-center.service';
import 'styles/setting/cost-center/cost-center-item/new-cost-center-item.scss';
import { LanguageInput } from 'widget/index';
import { deepCopy } from 'utils/extend';
import Chooser from 'widget/chooser';

const Option = Select.Option;
const FormItem = Form.Item;
import { SelectDepOrPerson } from 'widget/index';
import { costCenterItemDefault } from 'containers/setting/cost-center/cost-center.model';

import { routerRedux } from 'dva/router';

class NewCostCenterItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      costCenterItemDetail: deepCopy(costCenterItemDefault),
      //主要部门
      extraMainDep: {
        res: [],
        title: this.$t('person.manage.select'), //"请选择",
        depClassName: 'f-right select-dep-close-wrap',
        className: [
          'f-right select-dep-close-wrap',
          'f-right select-dep-close-wrap select-dep-close-wrap-show',
        ],
      },
      //从属部门
      extraSecDep: {
        res: [],
        title: this.$t('person.manage.select'), //"请选择",
        depClassName: 'f-right select-dep-close-wrap',
        className: [
          'f-right select-dep-close-wrap',
          'f-right select-dep-close-wrap select-dep-close-wrap-show',
        ],
      },
      //成本中心项：详情
      // CostCenterItemDetail: menuRoute.getRouteItem('cost-center-item-detail'),
      manageIsNoRequired: true,
    };
  }

  componentDidMount() {
    // 经理是否必填，通过fp控制：costcenteritem.manager.nullable===true,代表可以不填，其他代表必须填写
    // 这个字段必须保证公司的fp配置与集团的fp配置一样，不然在公司模式下修改，会有问题：报错经理必填
    this.setState({
      //不知道这个错是什么愿意:hx
      // manageIsNoRequired: this.props.profile['costcenteritem.manager.nullable']
    });
    if (this.props.match.params.itemId === 'NEW') {
      //新增
    } else {
      //更新
      this.getCostCenterItemDetail();
    }
  }

  //查看成本中心项详情
  getCostCenterItemDetail() {
    CCService.getCostCenterItemDetail(this.props.match.params.itemId).then(response => {
      let data = response.data;
      this.setState(
        {
          costCenterItemDetail: data,
        },
        () => {
          this.forGetCustomValues(this.state.costCenterItemDetail);
          this.initMainSecDep(this.state.costCenterItemDetail);
        }
      );
    });
  }

  //获取成本中心项扩展字段列表
  forGetCustomValues = costCenterItemDetail => {
    let data = costCenterItemDetail.customFormValues;
    if (data && data.length && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        let custom = JSON.parse(data[i].dataSource);
        if (custom.customEnumerationOID) {
          this._getCustomValues(i, custom.customEnumerationOID);
        }
      }
    }
  };
  //获取自定义值列表
  _getCustomValues = (index, customEnumerationOID) => {
    let costCenterItemDetail = this.state.costCenterItemDetail;
    //值列表，循环所有expense field，找到值列表，提前获取值列表的所有值，放在数组内
    CCService.getListByCustomEnumerationOID(customEnumerationOID).then(res => {
      costCenterItemDetail.customFormValues[index].selectList = res.data;
      this.setState({
        costCenterItemDetail: costCenterItemDetail,
      });
    });
  };
  //回显主要部门与从属部门
  initMainSecDep = data => {
    let mainDeps = [];
    let secDeps = [];
    if (data.primaryDepartmentId) {
      let mainDep = {
        id: data.primaryDepartmentId,
        name: data.primaryDepartmentName,
      };
      mainDeps.push(mainDep);
    }
    if (data.secondaryDepartmentIds && data.secondaryDepartmentIds.length > 0) {
      for (let id in data.secondaryDepartmentNames) {
        let secDep = {
          id: id,
          name: data.secondaryDepartmentNames[id],
        };
        secDeps.push(secDep);
      }
    }
    this.selectMainDep(mainDeps);
    this.selectSecDep(secDeps);
  };

  //校验名称长度
  validateNameLengthErr = name => {
    if (name === null || name === undefined || name === '') {
      // 请填写名称
      message.warn(this.$t('value.list.name.input'));
      return true;
    }
    if (name && name.length && name.length > 100) {
      //名称最多输入100个字符
      message.warn(this.$t('value.list.name.max.100'));
      return true;
    }
  };
  handleSave = e => {
    e.preventDefault();
    let costCenterItemDetail = this.state.costCenterItemDetail;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        //这个很重要，设置扩展字段的
        this.setFromToCustomFormValues(values);
        //名称涉及到多语言，就不用values
        values.name = costCenterItemDetail.name;
        costCenterItemDetail = Object.assign(costCenterItemDetail, values, {
          managerOID: values.managerOID[0] ? values.managerOID[0].userOID : null,
        });
        if (this.validateNameLengthErr(costCenterItemDetail.name)) {
          return;
        }
        if (costCenterItemDetail.id) {
          this.updateCostCenterItem(costCenterItemDetail);
        } else {
          this.createCostCenterItem(costCenterItemDetail);
        }
      }
    });
  };
  createCostCenterItem = costCenterItem => {
    this.setState({
      loading: true,
    });
    CCService.createCostCenterItem(this.props.match.params.id, costCenterItem)
      .then(res => {
        if (res) {
          this.setState({ loading: false });
          this.detailCostCenterItem(res.data);
          //直接跳入详情页
          // this.context.router.goBack();
          this.props.dispatch(
            routerRedux.push({
              pathname: `/admin-setting/cost-center/cost-center-detail/${this.props.match.params.id}/${this.props.match.params.setOfBooksId}`,
            })
          );
        }
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };
  //成本中心项详情
  detailCostCenterItem = record => {
    // let path = this.state.CostCenterItemDetail.url.replace(":id", this.props.match.params.id);
    // path = path.replace(":itemId", record.costCenterItemOID);
    // this.context.router.push(path);
    this.props.dispatch(
      routerRedux.push({
        pathname: `/admin-setting/cost-center/cost-center-detail/cost-center-item/cost-center-item-detail/${
          this.props.match.params.id
        }/${record.costCenterItemOID}/${this.props.match.params.setOfBooksId}`,
      })
    );
  };
  updateCostCenterItem = costCenterItem => {
    this.setState({
      loading: true,
    });
    CCService.updateCostCenterItem(costCenterItem)
      .then(response => {
        if (response) {
          this.setState({ loading: false });
          this.props.dispatch(
            routerRedux.push({
              pathname: `/admin-setting/cost-center/cost-center-detail/${this.props.match.params.id}/${this.props.match.params.setOfBooksId}`,
            })
          );
        }
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };
  //点击取消，返回
  handleCancel = e => {
    e.preventDefault();
    // this.context.router.goBack();
    this.props.dispatch(
      routerRedux.push({
        pathname: `/admin-setting/cost-center/cost-center-detail/${this.props.match.params.id}/${this.props.match.params.setOfBooksId}`,
      })
    );
  };
  //名称：自定义值列表项多语言
  i18nNameChange = (name, i18nName) => {
    this.state.costCenterItemDetail.name = name;
    if (this.state.costCenterItemDetail.i18n) {
      this.state.costCenterItemDetail.i18n.name = i18nName;
    } else {
      this.state.costCenterItemDetail.i18n = {
        name: i18nName,
      };
    }
  };

  handleChange = val => {
    if (this.state.loading) {
      this.setState({
        loading: false,
      });
    }
  };

  //渲染已经选择的部门
  renderButtonTitle(titleArr) {
    if (titleArr.length < 1) {
      // 请选择
      return this.$t('person.manage.select');
    }
    let node = [];
    titleArr.map((item, i) => {
      node.push(<Tag key={i}>{item.name}</Tag>);
    });
    return node;
  }

  //选择了主要部门的回调
  selectMainDep = res => {
    this.state.costCenterItemDetail.primaryDepartmentId = res[0] ? res[0].id : '';
    let extraMainDep = this.state.extraMainDep;
    extraMainDep.res = deepCopy(res);
    if (extraMainDep.res.length > 0) {
      extraMainDep.depClassName = extraMainDep.className[1];
    } else {
      extraMainDep.depClassName = extraMainDep.className[0];
    }
    extraMainDep.title = this.renderButtonTitle(extraMainDep.res);
    this.setState({
      extraMainDep,
    });
  };
  //选择了从属部门的回调
  selectSecDep = res => {
    let ids = [];
    res.map(item => {
      ids.push(item.id);
    });
    this.state.costCenterItemDetail.secondaryDepartmentIds = ids;
    let extraSecDep = this.state.extraSecDep;
    extraSecDep.res = deepCopy(res);
    if (extraSecDep.res.length > 0) {
      extraSecDep.depClassName = extraSecDep.className[1];
    } else {
      extraSecDep.depClassName = extraSecDep.className[0];
    }
    extraSecDep.title = this.renderButtonTitle(extraSecDep.res);
    this.setState({
      extraSecDep,
    });
  };
  onMouseLeaveDepTag = e => {
    e.stopPropagation();
  };
  onMouseEnterDepTag = e => {
    e.stopPropagation();
  };
  //清除已经选择的部门：主要部门
  onCloseMainDepTag = e => {
    e.stopPropagation();
    this.selectMainDep([]);
  };
  //清除已经选择的部门：从属部门
  onCloseSecDepTag = e => {
    e.stopPropagation();
    this.selectSecDep([]);
  };

  //渲染扩展字段
  renderExtendFiled = extendFileds => {
    if (extendFileds) {
      if (this.props.match.params.itemId != 'NEW') {
        let dom = [];
        for (let i = 0; i < extendFileds.length; i++) {
          if (extendFileds[i].selectList) {
            dom.push(this.renderEditingContentByMessageKey(extendFileds[i]));
          }
        }
        return dom;
      } else {
        return (
          <div className="no-show-extend-tips">
            {/*新增之后，可以进入编辑扩展字段*/}
            {this.$t('new.cost.center.item.tip1')}
          </div>
        );
      }
    } else {
      return <div />;
    }
  };

  // -----编辑状态---start
  renderEditingContentByMessageKey = field => {
    let messageKey = field.messageKey;
    //只有值列表
    switch (messageKey) {
      case 'cust_list': {
        return this.renderEditingFiled_cust_list(field);
        break;
      }
    }
  };
  renderEditingFiled_cust_list = field => {
    const { getFieldDecorator } = this.props.form;

    //如果是值列表类型，在返回的数据上，前端多挂了一个customEnumerationList属性，
    //这个选择列表就从这个属性上拿了
    return (
      <Col span={8} className="cost-center-form-row">
        <FormItem
          key={field.fieldOID}
          label={
            field.fieldName && field.fieldName.length && field.fieldName.length > 0 ? (
              field.fieldName
            ) : (
              <span>&nbsp;</span>
            )
          }
          colon={true}
        >
          {getFieldDecorator(field.fieldOID, {
            initialValue: field.value,
            rules: [
              {
                required: field.required,
                message: this.$t('common.please.enter'),
              },
            ],
          })(
            <Select disabled={!this.props.tenantMode}>
              {_renderCustomEnumerationList(field.selectList.values)}
            </Select>
          )}
        </FormItem>
      </Col>
    );

    //渲染值列表
    function _renderCustomEnumerationList(list) {
      let dom = [];
      if (list.length > 0) {
        list.map(function(item, index) {
          dom.push(
            <Option key={index} value={item.value}>
              {item.messageKey}
            </Option>
          );
        });
        return dom;
      } else {
        return '';
      }
    }
  };

  // 把表单的值设置到人员信息扩展字段里面去
  setFromToCustomFormValues = values => {
    let customFormValues = this.state.costCenterItemDetail.customFormValues;
    if (!customFormValues) {
      return;
    }
    for (let key in values) {
      for (let i = 0; i < customFormValues.length; i++) {
        if (customFormValues[i].fieldOID === key) {
          customFormValues[i].value = values[key];
        }
      }
    }
  };

  // -----编辑状态---end
  render() {
    const { getFieldDecorator } = this.props.form;
    const { loading, costCenterItemDetail } = this.state;
    let depClass = 'select-dep-search-area';
    console.log(costCenterItemDetail);
    if (!this.props.tenantMode) {
      depClass = 'select-dep-search-area select-dep-search-area-disabled';
    }
    return (
      <div className="new-cost-center-item">
        <Form onSubmit={this.handleSave} onChange={this.handleChange}>
          <Row gutter={24} className="cost-center-form-row">
            <Col span={8}>
              {/*//成本中心项代码*/}
              <FormItem label={this.$t('new.cost.center.item.code')} colon={true}>
                {getFieldDecorator('code', {
                  initialValue: costCenterItemDetail.code,
                  rules: [
                    {
                      required: true,
                      message: this.$t('common.please.enter'),
                    },
                    {
                      message: this.$t('new.cost.center.item.max36'), //"最多36个字符，支持字母与数字和一些限定特殊字符",
                      validator: (rule, value, cb) => {
                        if (value === null || value === undefined || value === '') {
                          cb();
                          return;
                        }
                        let regExp = /^[a-z0-9_ ]+$/i;
                        //去掉空格
                        value = value.replace(/ /g, '');
                        if (value.length <= 36) {
                          cb();
                        } else {
                          cb(false);
                        }
                      },
                    },
                  ],
                })(
                  <Input
                    disabled={
                      (!!costCenterItemDetail.id && !!costCenterItemDetail.code) ||
                      !this.props.tenantMode
                    }
                    placeholder={this.$t('common.please.enter')}
                  />
                )}
              </FormItem>
              <div className="cost-center-code-tips">
                {/*注：成本中心项代码保存后将不可修改*/}
                {this.$t('new.cost.center.item.tip2')}
              </div>
            </Col>
            <Col span={8}>
              {/*成本中心项名称*/}
              <FormItem label={this.$t('new.cost.center.item.name')}>
                {getFieldDecorator('name', {
                  initialValue: costCenterItemDetail.name,
                  rules: [
                    {
                      required: true,
                      message: this.$t('common.please.enter'),
                    },
                    {
                      max: 100,
                      //最多输入100个字符
                      message: this.$t('value.list.input.max.100'),
                    },
                  ],
                })(
                  <div>
                    <LanguageInput
                      disabled={!this.props.tenantMode}
                      key={1}
                      name=''
                      value={costCenterItemDetail.name}
                      i18nName={costCenterItemDetail.i18n ? costCenterItemDetail.i18n.name : []}
                      isEdit={costCenterItemDetail.id}
                      nameChange={this.i18nNameChange}
                    />
                  </div>
                )}
              </FormItem>
            </Col>

            <Col span={8}>
              {/*//序号*/}
              <FormItem label={this.$t('new.cost.center.item.index')} colon={true}>
                {getFieldDecorator('sequenceNumber', {
                  initialValue: costCenterItemDetail.sequenceNumber,
                  rules: [
                    {
                      message: this.$t('new.cost.center.item.index_tip1'),
                      validator: (rule, value, cb) => {
                        if (value === null || value === undefined || value === '') {
                          cb();
                          return;
                        }
                        //去掉空格
                        value = value.replace(/ /g, '');
                        if (value.split('.').length > 1) {
                          cb(false);
                        } else {
                          cb();
                        }
                      },
                    },
                  ],
                })(
                  <Input
                    disabled={!this.props.tenantMode}
                    placeholder={this.$t('common.please.enter')}
                  />
                )}
              </FormItem>
              <div className="cost-center-index-tip">
                {/*序号之间尽量保持一定的步长，便于后续调整，如首位10，间隔10*/}
                {this.$t('new.cost.center.item.index_tip')}
              </div>
            </Col>
          </Row>

          <Row gutter={24} className="cost-center-form-row">
            <Col span={8}>
              <div className="main-select-dep-wrap">
                <div className="ant-form-item-label">
                  {/*主要部门:(单选)*/}
                  {this.$t('new.cost.center.item.main')}
                </div>
                <div className={depClass}>
                  <div className="f-left select-dep-wrap">
                    <SelectDepOrPerson
                      buttonDisabled={!this.props.tenantMode}
                      renderButton={false}
                      multiple={false}
                      title={this.state.extraMainDep.title}
                      onlyDep={true}
                      onConfirm={this.selectMainDep}
                    />
                  </div>
                  <div
                    className={this.state.extraMainDep.depClassName}
                    onMouseLeave={this.onMouseLeaveDepTag}
                    onMouseEnter={this.onMouseEnterDepTag}
                    onClick={this.onCloseMainDepTag}
                  >
                    <Icon type="close-circle" className="closeCircle" />
                  </div>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="sec-select-dep-wrap">
                <div className="ant-form-item-label">
                  {/*从属部门:(可多选)*/}
                  {this.$t('new.cost.center.item.sec')}
                </div>
                <div className={depClass}>
                  <div className="f-left select-dep-wrap">
                    <SelectDepOrPerson
                      buttonDisabled={!this.props.tenantMode}
                      renderButton={false}
                      title={this.state.extraSecDep.title}
                      onlyDep={true}
                      onConfirm={this.selectSecDep}
                    />
                  </div>
                  <div
                    className={this.state.extraSecDep.depClassName}
                    onMouseLeave={this.onMouseLeaveDepTag}
                    onMouseEnter={this.onMouseEnterDepTag}
                    onClick={this.onCloseSecDepTag}
                  >
                    <Icon type="close-circle" className="closeCircle" />
                  </div>
                </div>
              </div>
            </Col>

            <Col span={8}>
              <FormItem
                label={this.$t('new.cost.center.item.manager')} //经理
                colon={true}
              >
                {getFieldDecorator('managerOID', {
                  initialValue: costCenterItemDetail.managerFullName
                    ? [
                        {
                          fullName: costCenterItemDetail.managerFullName,
                          userOID: costCenterItemDetail.managerOID,
                        },
                      ]
                    : [],
                  rules: [
                    {
                      //required: !this.state.manageIsNoRequired,
                      required: true,
                      message: this.$t('common.please.enter'),
                    },
                  ],
                })(
                  <Chooser
                    single={true}
                    disabled={!this.props.tenantMode}
                    placeholder={this.$t('common.please.select')}
                    labelKey="fullName"
                    valueKey="userOID"
                    onChange={this.handleChange}
                    type="user"
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24} className="cost-center-form-row">
            <Col span={8}>
              {/*全员可见*/}
              <FormItem label={this.$t('new.cost.center.item.showall')} colon={false}>
                {getFieldDecorator('publicFlag', {
                  initialValue: costCenterItemDetail.publicFlag,
                  valuePropName: 'checked',
                  rules: [],
                })(
                  <Switch
                    disabled={!this.props.tenantMode}
                    checkedChildren={<Icon type="check" />}
                    unCheckedChildren={<Icon type="cross" />}
                  />
                )}
              </FormItem>
            </Col>

            <Col span={8}>
              {/*状态*/}
              <FormItem label={this.$t('common.status', { status: '' })} colon={true}>
                {getFieldDecorator('enabled', {
                  initialValue: costCenterItemDetail.enabled,
                  valuePropName: 'checked',
                  rules: [],
                })(
                  <Switch
                    checkedChildren={<Icon type="check" />}
                    unCheckedChildren={<Icon type="cross" />}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <div className="basic-info-extend-title">
            {/*成本中心项扩展字段*/}
            {this.$t('new.cost.center.item.extend')}
            &nbsp;&nbsp;
            <Tooltip title={this.$t('new.cost.center.item.tips3')}>
              {/*可以在成本中心--成本中心项扩展字段进行编辑成本中心项扩展字段*/}
              <Icon type="question-circle" />
            </Tooltip>
          </div>
          <Row gutter={24}>{this.renderExtendFiled(costCenterItemDetail.customFormValues)}</Row>

          <Button type="primary" loading={loading} htmlType="submit">
            {this.$t('common.save') /*保存*/}
          </Button>
          <Button onClick={this.handleCancel} style={{ marginLeft: 8 }}>
            {this.$t('common.cancel') /*取消*/}
          </Button>
        </Form>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    profile: state.user.profile,
    user: state.user.currentUser,
    company: state.user.company,
    tenantMode: true,
  };
}

//本组件需要用一下Form表单属性
const WrappedNewCostCenterItem = Form.create()(NewCostCenterItem);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedNewCostCenterItem);
