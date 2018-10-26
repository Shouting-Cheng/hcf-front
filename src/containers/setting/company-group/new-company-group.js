import React from 'react';
import { Button, Form, Select, Input, Col, Row, Switch, message, Icon } from 'antd';
import { connect } from 'dva';

import httpFetch from 'share/httpFetch';
import config from 'config';
import 'styles/setting/company-group/new-company-group.scss';
import companyGroupService from 'containers/setting/company-group/company-group.service';
import LanguageInput from 'components/Widget/Template/language-input/language-input';

import { routerRedux } from 'dva/router';

const FormItem = Form.Item;
const Option = Select.Option;

class NewCompanyGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      statusCode: this.$t({ id: 'common.enabled' }) /*启用*/,
      setOfBooks: [],
      companyGroupName: [], //公司组名称国际化
      name: '',
    };
  }

  componentWillMount() {
    httpFetch.get(`${config.baseUrl}/api/setOfBooks/by/tenant?roleType=TENANT`).then(response => {
      let setOfBooks = [];
      response.data.map(item => {
        let option = {
          value: item.setOfBooksCode + ' - ' + item.setOfBooksName,
          id: item.id,
        };
        setOfBooks.addIfNotExist(option);
      });
      this.setState({
        setOfBooks: setOfBooks,
      });
    });
  }

  componentDidMount() {
    let id = this.props.match.params.companyGroupId;
    if (id !== 'NEW') {
      companyGroupService.getCompanyGroupById(id).then(res => {
        this.props.form.setFieldsValue({
          companyGroupCode: res.data.companyGroupCode,
          setOfBooksId: res.data.setOfBooksId,
          enabled: res.data.enabled,
          companyGroupName: res.data.companyGroupName,
        });
        this.setState({
          companyGroupName: res.data.i18n.companyGroupName,
          name: res.data.companyGroupName,
          statusCode: res.data.enabled
            ? this.$t({ id: 'common.enabled' })
            : this.$t({ id: 'common.disabled' }),
        });
      });
    }
  }

  //新建公司组
  handleSave = e => {
    e.preventDefault();
    this.setState({ loading: true });
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.i18n = {};
        values.i18n.companyGroupName = this.state.companyGroupName;
        let id = this.props.match.params.companyGroupId;
        if (id !== 'NEW') {
          values.id = id;
          companyGroupService
            .updateCompanyGroup(values)
            .then(response => {
              if (response) {
                message.success(this.$t({ id: 'structure.saveSuccess' })); /*保存成功！*/
                // window.history.go(-1);

                this.props.dispatch(
                  routerRedux.push({
                    pathname: `/admin-setting/company-group`,
                  })
                );


              }
            })
            .catch(e => {
              if (e.response) {
                message.error(
                  `${this.$t({ id: 'common.save.filed' })}, ${e.response.data.message}`
                );
                this.setState({ loading: false });
              }
            });
        } else {
          companyGroupService
            .addCompanyGroup(values)
            .then(response => {
              if (response) {
                message.success(this.$t({ id: 'structure.saveSuccess' })); /*保存成功！*/
                //   this.context.router.push(menuRoute.getMenuItemByAttr('company-group', 'key').children.companyGroupDetail.url.replace(':id',response.data.id));

                this.props.dispatch(
                  routerRedux.push({
                    pathname: `/admin-setting/company-group/company-group-detail/${
                      response.data.id
                      }`,
                  })
                );

                this.setState({ loading: false });
              }
            })
            .catch(e => {
              if (e.response) {
                message.error(
                  `${this.$t({ id: 'common.save.filed' })}, ${e.response.data.message}`
                );
                this.setState({ loading: false });
              }
            });
        }
      } else {
        this.setState({ loading: false });
      }
    });
  };

  //点击取消，返回预算组织详情
  handleCancel = e => {
    e.preventDefault();
    window.history.go(-1);
  };

  handleChange = () => {
    if (this.state.loading) {
      this.setState({
        loading: false,
      });
    }
  };

  //修改公司组名称
  handleNameChange = (value, i18n) => {
    this.setState({ name: value, companyGroupName: i18n });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { statusCode, loading, setOfBooks, name, companyGroupName } = this.state;

    const isEdit = this.props.match.params.companyGroupId !== 'NEW';
    return (
      <div className="new-company-group">
        <Form onSubmit={this.handleSave} onChange={this.handleChange}>
          <Row gutter={24}>
            <Col span={8}>
              <FormItem
                label={this.$t({ id: 'setting.companyGroupCode' })} /*公司组代码*/
                colon={true}
              >
                {getFieldDecorator('companyGroupCode', {
                  rules: [
                    { required: true, message: this.$t({ id: 'common.please.enter' }) },
                    // 公司组代码前端不做校验，使用后端提示
                    // {
                    //   validator: (item,value,callback)=>{
                    //     let str = /^[0-9a-zA-z-_]*$/;
                    //     if(!str.test(value)||value.length >35){
                    //       callback(messages('setting.companyGroupCode.tips'))
                    //     }
                    //     callback();
                    //   }
                    // }
                  ],
                })(
                  <Input placeholder={this.$t({ id: 'common.please.enter' })} disabled={isEdit} />
                  )}
              </FormItem>
              <div className="company-group-tips">
                {this.$t({ id: 'setting.companyGroup.tips' })}
              </div>
            </Col>
            <Col span={8}>
              <FormItem
                label={this.$t({ id: 'setting.companyGroupName' })} /* 公司组名称*/
                colon={true}
              >
                {getFieldDecorator('companyGroupName', {
                  rules: [
                    {
                      required: true,
                      message: this.$t({ id: 'common.please.enter' }),
                    },
                    {
                      validator: (item, value, callback) => {
                        if (value) {
                          let str = /^[\u4E00-\u9FA5\w\d]*$/u;
                          if (!str.test(value) || value.length > 100) {
                            callback(this.$t({ id: 'setting.companyGroupName.tips' }));
                          }
                        }
                        callback();
                      },
                    },
                  ],
                })(
                  <LanguageInput
                    nameChange={this.handleNameChange}
                    name={name}
                    i18nName={companyGroupName}
                    isEdit={isEdit}
                  />
                  )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label={this.$t({ id: 'setting.set.of.book' })} /* 账套*/ colon={true}>
                {getFieldDecorator('setOfBooksId', {
                  rules: [{ required: true, message: this.$t({ id: 'common.please.select' }) }],
                })(
                  <Select placeholder={this.$t({ id: 'common.please.select' })} disabled={isEdit}>
                    {setOfBooks.map(item => <Option key={item.id}>{item.value}</Option>)}
                  </Select>
                  )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <FormItem
                label={this.$t({ id: 'common.status' }, { status: statusCode })} /* {/!*状态*!/}*/
                colon={false}
              >
                {getFieldDecorator('enabled', {
                  initialValue: true,
                  valuePropName: 'checked',
                  rules: [
                    {
                      validator: (item, value, callback) => {
                        this.setState({
                          statusCode: value
                            ? this.$t({ id: 'common.enabled' }) /*启用*/
                            : this.$t({ id: 'common.disabled' }) /*禁用*/,
                        });
                        callback();
                      },
                    },
                  ],
                })(
                  <Switch
                    checkedChildren={<Icon type="check" />}
                    unCheckedChildren={<Icon type="cross" />}
                  />
                  )}
              </FormItem>
            </Col>
          </Row>
          <Button type="primary" loading={loading} htmlType="submit">
            {this.$t({ id: 'common.save' }) /*保存*/}
          </Button>
          <Button onClick={this.handleCancel} style={{ marginLeft: 8 }}>
            {' '}
            {this.$t({ id: 'common.cancel' }) /*取消*/}
          </Button>
        </Form>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

const WrappedNewCompanyGroup = Form.create()(NewCompanyGroup);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedNewCompanyGroup);
