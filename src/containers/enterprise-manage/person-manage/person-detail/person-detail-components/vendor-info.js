/**
 * Created by zhouli on 18/3/8
 * Email li.zhou@huilianyi.com
 */
//供应商信息信息
import React from 'react';

import 'styles/enterprise-manage/person-manage/person-detail/person-detail-components/vendor-info.scss';
import { Button, Form, Select, Col, Row, Switch, Icon, Input } from 'antd';
import PDService from 'containers/enterprise-manage/person-manage/person-detail/person-detail.service';
import PropTypes from 'prop-types';
const FormItem = Form.Item;
const Option = Select.Option;
import Chooser from 'components/Widget/chooser';

class PersonVendorInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      ctripList: [], //携程子账户
      vendorObj: {},
    };
  }

  componentDidMount() {
    let vendorObj = this.props.vendorObj;
    this.setState({ vendorObj });
    //获取携程子账户
    this.getSystemValueList(1003).then(res => {
      this.setState({
        ctripList: res.data.values,
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    let vendorObj = nextProps.vendorObj;
    this.setState({ vendorObj });
  }

  handleSave = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let vendorObj = this.state.vendorObj;

        vendorObj.confirmPassword = values.confirmPassword;
        //todo  需要做非空判断
        vendorObj.confirmUserOID =
          values.confirmUser.length > 0 ? values.confirmUser[0].userOID : null;
        vendorObj.confirm2UserOID =
          values.confirm2User.length > 0 ? values.confirm2User[0].userOID : null;
        vendorObj.confirmCCUserOID =
          values.confirmCCUser.length > 0 ? values.confirmCCUser[0].userOID : null;
        vendorObj.confirm2CCUserOID =
          values.confirm2CCUser.length > 0 ? values.confirm2CCUser[0].userOID : null;
        // vendorObj.subAccountName = values.subAccountName;
        if (vendorObj.subAccountName === values.subAccountName) {
          //前端没有边界，直接上传源值
        } else {
          vendorObj.subAccountCode = values.subAccountName;
        }
        this.updateSupplierInfo(vendorObj);
      }
    });
  };
  //更新携程子账户
  updateSupplierInfo = data => {
    this.setState({
      loading: true,
    });
    PDService.updateSupplierInfo(data)
      .then(data => {
        this.setState({
          loading: false,
        });
        this.props.savedData(data);
      })
      .catch(err => {
        this.props.savedData();
      });
  };
  handleChange = e => {
    if (this.state.loading) {
      this.setState({
        loading: false,
      });
    }
  };
  //取消按钮
  handleCancel = e => {
    //查询供应商状态
    this.getSupplierInfo()
    e.preventDefault();
    this.props.toNoEditing();
  };

  //获取供应商信息
  getSupplierInfo = () => {
    let vendorObj = this.state.vendorObj
    let userOID = vendorObj.userOID;
    PDService.getSupplierInfo(userOID).then(res => {
      //如果有供应商信息
      if (!!res.data) {
        //后期如果供应商信息状态错误时，查看后端接口进行赋值
        vendorObj.enable = true;
      } else {
        vendorObj.enable = false;
      }
      this.setState({
        vendorObj,
      });
    });
  };
  //切换状态
  switchCardStatusChange = e => {
    console.log(e)
    let vendorObj = this.state.vendorObj;
    vendorObj.enable = e;
    this.setState({
      loading: false,
      vendorObj,
    });
  };
  handleCtripAccountName = value => {
    //携程子账户
  };
  renderCtripAccountOption = data => {
    //渲染携程子账户
    if (data && data.length) {
      return data.map(item => {
        return (
          <Option value={item.value} key={item.code}>
            {item.messageKey}
          </Option>
        );
      });
    } else {
      return (
        <Option value={''} key={1}>
          {''}
        </Option>
      );
    }
  };

  renderNoEditing = () => {
    let vendorObj = this.state.vendorObj;
    //对象请求有延迟
    if (vendorObj.userOID) {
      return (
        <div className="info-item-wrap">
          <div className="info-item f-left">
            <div className="info-item-title">
              {/*启用状态：*/}
              {this.$t('pdc.vendor.info.status')}：
            </div>
            <div className="info-item-text">
              {/*? "已启用" : "已禁用"*/}
              {vendorObj.enable
                ? this.$t('pdc.vendor.info.enable')
                : this.$t('pdc.vendor.info.disable')}
            </div>
          </div>
          <div className="info-item f-left">
            <div className="info-item-title">
              {/*携程子账户：*/}
              {this.$t('pdc.vendor.info.ctrip.account')}：
            </div>
            <div className="info-item-text">{vendorObj.subAccountName}</div>
          </div>

          <div className="info-item f-left">
            <div className="info-item-title">
              {/*授权密码：*/}
              {this.$t('pdc.vendor.info.ctrip.password')}：
            </div>
            <div className="info-item-text">{vendorObj.confirmPasswordView}</div>
          </div>

          <div className="info-item f-left">
            <div className="info-item-title">
              {/*授权人：*/}
              {this.$t('pdc.vendor.info.s.person')}：
            </div>
            <div className="info-item-text">{vendorObj.confirmUser.fullName}</div>
          </div>

          <div className="info-item f-left">
            <div className="info-item-title">
              {/*二次授权人：*/}
              {this.$t('pdc.vendor.info.s2.person')}：
            </div>
            <div className="info-item-text">{vendorObj.confirm2User.fullName}</div>
          </div>

          <div className="info-item f-left">
            <div className="info-item-title">
              {/*抄送授权人：*/}
              {this.$t('pdc.vendor.info.cs.person')}：
            </div>
            <div className="info-item-text">{vendorObj.confirmCCUser.fullName}</div>
          </div>

          <div className="info-item f-left">
            <div className="info-item-title">
              {/*抄送二次授权人：*/}
              {this.$t('pdc.vendor.info.cs2.person')}：
            </div>
            <div className="info-item-text">{vendorObj.confirm2CCUser.fullName}</div>
          </div>

          <div className="clear" />
        </div>
      );
    } else {
      return <div />;
    }
  };
  renderEditing = () => {
    const { getFieldDecorator } = this.props.form;
    const { loading, vendorObj } = this.state;

    return (
      <div className="info-item-edit-wrap">
        <Form onSubmit={this.handleSave} onChange={this.handleChange}>
          <Row gutter={24}>
            <Col span={12}>
              <FormItem
                label={this.$t('pdc.vendor.info.status')} //启用状态
                colon={true}
              >
                {getFieldDecorator('enable', {
                  initialValue: vendorObj.enable,
                  rules: [],
                })(
                  <div>
                    <Switch
                      defaultChecked={vendorObj.enable}
                      checkedChildren={<Icon type="check" />}
                      unCheckedChildren={<Icon type="cross" />}
                      onChange={this.switchCardStatusChange}
                    />
                    <span
                      className="enabled-type"
                      style={{
                        marginLeft: 20,
                        width: 100,
                      }}
                    >
                      {vendorObj.enable
                        ? this.$t('common.status.enable')
                        : this.$t('common.disabled')}
                    </span>
                  </div>
                )}
              </FormItem>
            </Col>

            <Col span={12}>
              <FormItem
                label={this.$t('pdc.vendor.info.ctrip.password')} //授权密码
                colon={true}
              >
                {getFieldDecorator('confirmPassword', {
                  initialValue: vendorObj.confirmPassword,
                  rules: [
                    {
                      max: 20,
                      message: this.$t('pdc.basic.info.max.inp.20'), //"最多输入20个字符"
                    },
                  ],
                })(<Input placeholder={this.$t('common.please.enter')} />)}
              </FormItem>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              {/*bug14085 携程子账户名称 有些很长*/}
              <FormItem
                label={this.$t('pdc.vendor.info.ctrip.account')} //携程子账户
                colon={true}
              >
                {getFieldDecorator('subAccountName', {
                  initialValue: vendorObj.subAccountName,
                  rules: [
                    {
                      required: true,
                      message: this.$t('common.please.enter'),
                    },
                  ],
                })(
                  <Select
                    className="select-ctrip-account"
                    showSearch
                    placeholder={this.$t('common.please.select')}
                    optionFilterProp="children"
                    onChange={this.handleCtripAccountName}
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {this.renderCtripAccountOption(this.state.ctripList)}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>

          <Row gutter={24}>
            {/*授权人*/}
            <Col span={6}>
              <FormItem label={this.$t('pdc.vendor.info.s.person')} colon={true}>
                {getFieldDecorator('confirmUser', {
                  initialValue:
                    vendorObj.confirmUser.userOID === null
                      ? []
                      : [
                          {
                            userOID: vendorObj.confirmUser.userOID,
                            fullName: vendorObj.confirmUser.fullName,
                          },
                        ],
                  rules: [],
                })(
                  <Chooser
                    single={true}
                    type="user"
                    labelKey="fullName"
                    valueKey="userOID"
                    placeholder={this.$t('common.please.select')}
                    onChange={this.handleChange}
                    listExtraParams={{}}
                  />
                )}
              </FormItem>
            </Col>
            {/*二次授权人*/}
            <Col span={6}>
              <FormItem label={this.$t('pdc.vendor.info.s2.person')} colon={true}>
                {getFieldDecorator('confirm2User', {
                  initialValue:
                    vendorObj.confirm2User.userOID === null
                      ? []
                      : [
                          {
                            userOID: vendorObj.confirm2User.userOID,
                            fullName: vendorObj.confirm2User.fullName,
                          },
                        ],
                  rules: [],
                })(
                  <Chooser
                    single={true}
                    labelKey="fullName"
                    valueKey="userOID"
                    placeholder={this.$t('common.please.select')}
                    onChange={this.handleChange}
                    type="user"
                  />
                )}
              </FormItem>
            </Col>

            {/*//抄送授权人*/}
            <Col span={6}>
              <FormItem label={this.$t('pdc.vendor.info.cs.person')} colon={true}>
                {getFieldDecorator('confirmCCUser', {
                  initialValue:
                    vendorObj.confirmCCUser.userOID === null
                      ? []
                      : [
                          {
                            userOID: vendorObj.confirmCCUser.userOID,
                            fullName: vendorObj.confirmCCUser.fullName,
                          },
                        ],
                  rules: [],
                })(
                  <Chooser
                    single={true}
                    placeholder={this.$t('common.please.select')}
                    labelKey="fullName"
                    valueKey="userOID"
                    onChange={this.handleChange}
                    type="user"
                  />
                )}
              </FormItem>
            </Col>
            {/*//抄送二次授权人*/}
            <Col span={6}>
              <FormItem label={this.$t('pdc.vendor.info.cs2.person')} colon={true}>
                {getFieldDecorator('confirm2CCUser', {
                  initialValue:
                    vendorObj.confirm2CCUser.userOID === null
                      ? []
                      : [
                          {
                            userOID: vendorObj.confirm2CCUser.userOID,
                            fullName: vendorObj.confirm2CCUser.fullName,
                          },
                        ],
                  rules: [],
                })(
                  <Chooser
                    single={true}
                    labelKey="fullName"
                    placeholder={this.$t('common.please.select')}
                    valueKey="userOID"
                    onChange={this.handleChange}
                    type="user"
                  />
                )}
              </FormItem>
            </Col>
          </Row>

          <Button type="primary" loading={loading} htmlType="submit">
            {this.$t('common.save') /*保存*/}
          </Button>
          <Button onClick={this.handleCancel} style={{ marginLeft: 8 }}>
            {' '}
            {this.$t('common.cancel') /*取消*/}
          </Button>
        </Form>
      </div>
    );
  };
  //渲染入口
  renderEnter = () => {
    if (this.props.originEditingStatus) {
      return this.renderEditing();
    } else {
      return this.renderNoEditing();
    }
  };

  render() {
    return <div className="person-vendor-info-wrap">{this.renderEnter()}</div>;
  }
}

PersonVendorInfo.propTypes = {
  savedData: PropTypes.func.isRequired, //点击保存
  vendorObj: PropTypes.object, //基础信息数据对象
  toEditing: PropTypes.func, //设置编辑
  toNoEditing: PropTypes.func, //设置显示
  originEditingStatus: PropTypes.bool, //初始化是否是编辑
};
PersonVendorInfo.defaultProps = {
  originEditingStatus: false,
};
const WrappedPersonVendorInfo = Form.create()(PersonVendorInfo);

export default WrappedPersonVendorInfo;
