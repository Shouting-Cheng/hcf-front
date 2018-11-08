
import React from 'react'
import { connect } from 'dva'

import config from "config";
import httpFetch from "share/httpFetch";
import { Button, Table, Badge, Form, Icon, message, Checkbox, Input, Modal, Alert, Switch} from 'antd';
const FormItem = Form.Item;
import SearchArea from 'widget/search-area'
import 'styles/setting/company-level-define/company-level-define.scss'
import LanguageInput from 'widget/Template/language-input/language-input'


class CompanyLevelDefine extends React.Component {
  constructor (props){
    super (props);
    this.state = ({
      loading: false,
      data: [],
      page: 0,
      pageSize: 10,
      pagination: {total: 0},
      visible: false,
      editVisible: false,
      record: '',
      searchParams: {
        companyLevelCode: '',
        description: ''
      },
      searchForm: [
        {type: 'input', id: 'companyLevelCode', label: this.$t("company.level.define.company.code")/*公司级别代码*/},
        {type: 'input', id: 'companyLevelDescription', label: this.$t("person.group.desc")/*描述*/,},
      ],
      columns: [
        {title: this.$t("company.level.define.company.code")/*公司级别代码*/, key: 'companyLevelCode', dataIndex: 'companyLevelCode'},
        {title: this.$t("person.group.desc")/*描述*/, key: 'description', dataIndex: 'description'},
        {title: this.$t("common.column.status")/*状态*/, key: 'enabled', dataIndex: 'enabled', render: enabled => (
            <Badge status={enabled ? 'success' : 'error'}
                   text={enabled ? this.$t("common.status.enable") : this.$t("common.status.disable")} />)},
      ],
    })
  }
  componentWillMount () {
    this.getList ();
  }
  //得到列表数据
  getList = () => {
    const {searchParams, page, pageSize} = this.state
    this.setState({loading: true});
    let params = searchParams;
    params.page = page;
    params.size = pageSize;
    let url = `${config.baseUrl}/api/companyLevel/selectByInput`;
    return httpFetch.get(url, params).then((response)=>{
      this.setState({
        data: response.data,
        loading: false,
        pagination: {
          total: Number(response.headers['x-total-count']),
          onChange: this.onChangePager,
          current: this.state.page + 1
        }
      })
    });
  }
  //分页点击
  onChangePager = (page) => {
    if(page - 1 !== this.state.page)
      this.setState({
        page: page - 1,
        loading: true
      }, ()=>{
        this.getList();
      })
  };
  //点击搜索
  onSearch = (result) => {
    const {pageSize} = this.state
    this.setState({
      page: 0,
      searchParams: Object.assign({}, this.state.searchParams, result),
      loading: true,
    }, () => {
      let code = this.state.searchParams.companyLevelCode ? this.state.searchParams.companyLevelCode : '';
      let description = this.state.searchParams.companyLevelDescription ? this.state.searchParams.companyLevelDescription : '';
      httpFetch.get(`${config.baseUrl}/api/companyLevel/selectByInput?companyLevelCode=${code}&description=${description}&page=0&size=${pageSize}`).then(
        res => {
          if(res.status === 200){
            this.setState({
              data: res.data,
              loading: false,
              pagination: {
                total: Number(res.headers['x-total-count']),
                onChange: this.onChangePager,
                current: this.state.page + 1
              }
            })
          }
        }
      )
    })
  }
  //点击重置
  onSearchClear = () => {
    this.setState({
      searchParams: {
        companyLevelCode: '',
        description: ''
      }
    }, () => {
      this.getList ();
    })
  }
  //点击新建
  newCompanyLevel = () => {
    this.setState({
      visible: true,
    }, () => {
      this.props.form.resetFields();
    })
  }

  handlePeriodSetNameChange = (value, i18n) => {
    let param = {
      i18n: {
        description: i18n,
      },
      description: value
    }
    this.setState({ record: param })
  }
  //公司级别描述国际化
  handleEdiePeriodSetNameChange = (value, i18n) => {
    const {record} = this.state;
    record.i18n.description = i18n;
    record.description = value;
    this.setState({ record })
  };
  //点击table某一行数据
  handleRowClick = (record) => {
    this.setState({
      record:{...record},
      editVisible: true,
    })
  }
  //点击模态框的确定
  handleModalOk = (e, key) => {
    const {record} = this.state;
    this.props.form.validateFieldsAndScroll((errs,values) => {
      let params = {}
        if(key === 'edit'){
           params = {
            companyLevelCode: record.companyLevelCode,
            description: record.description,
            enabled: record.enabled,
            i18n: record.i18n,
            id:record.id
          }
        }else {
          if (!errs) {
             params = {
              companyLevelCode: values.companyLevelCode,
              enabled: values.enabled,
              i18n: record.i18n,
              description: record.description
            }
          }
        }
        httpFetch.post(`${config.baseUrl}/api/companyLevel/insertOrUpdate`,params).then(res => {
          if(res.status === 200){
            key === 'edit' ? message.success(this.$t("wait.for.save.modifySuccess")/*修改成功*/) : message.success(this.$t("company.level.define.add.success")/*新建成功*/)
          }else{
            message.error(this.$t("common.create.filed")/*新建失败*/)
          }
          key === 'edit' ? this.setState({editVisible: false}) : this.setState({visible: false, record: {}})
          this.getList();
        }).catch(res => {
          switch (res.response.data.message) {
            // case '验证失败': message.error(this.$t('extend.field.name.no.empty'))
            //       break;
            case '公司级别已被引用不可修改': message.error(this.$t('company.level.define.can.not.edit'))
                  break;
            case '公司级别code重复': message.error(this.$t('company.level.define.code.repeat'))
                  break;
            // default: message.error(res.response.data.message);
            //       break;
          }
        })
    })
  }
  //点击模态框的取消
  onModalCancel = (e, key) => {
    if(key === 'edit'){
      this.props.form.resetFields();
      this.setState({
        editVisible: false,
        record:''
      })
    }else{
      this.props.form.resetFields();
      this.setState({
        visible: false,
        record: ''
      })
    }
  }
  //切换switch
  onSwitchChange = (e) => {
    const {record} = this.state;
    record.enabled = e
    this.setState({
      record,
    })
  }
  render () {
    const {getFieldDecorator} = this.props.form;
    const {searchForm, columns, data, pagination, visible, loading, record, editVisible} = this.state;
    return (
      <div>
        <SearchArea searchForm={searchForm}
                    clearText={this.$t('common.clear')/*清空*/}
                    submitHandle={this.onSearch}
                    clearHandle={this.onSearchClear}/>
        <div style={{marginTop: 30}}>
          <div style={{margin: '10px 0'}}>
            <Button type='primary' onClick={this.newCompanyLevel}>
              {this.$t("common.create")/*新建*/}
            </Button>
            <Modal visible={visible}
                   title={this.$t("company.level.define.new.level.define")/*新增公司级别定义*/}
                   onOk={(e) => this.handleModalOk(e)}
                   onCancel={(e) => this.onModalCancel(e)}
                   destroyOnClose={true}>
              <Alert type="info"
                     message={this.$t("common.help")/*帮助提示*/}
                     description={this.$t("company.level.define.save.not.edit")/*【公司级别代码】 保存后将不可修改*/}
                     showIcon/>
              <div style={{marginTop: 20}}>
                <Form hideRequiredMark={false}>
                  <FormItem  label = {this.$t("company.level.define.company.code")/*公司级别代码*/}>
                    {getFieldDecorator('companyLevelCode', {
                      rules: [{
                        required: true,
                        message: this.$t("company.level.define.code.not.empty")/*公司级别代码不能为空*/
                      }],
                    })(
                      <Input/>
                    )}
                  </FormItem>
                </Form>
                <Form hideRequiredMark={false} style={{marginTop:'-20px'}}>
                  <FormItem  label = "描述">
                    {getFieldDecorator('des', {
                      rules: [{
                        required: true,
                        message: '描述字段不能为空'
                      }],
                    })(
                      <LanguageInput  name={record.description ? record.description : ''}
                      isEdit={false}
                      i18nName={record.i18n && record.i18n.description}
                      nameChange={this.handlePeriodSetNameChange}/>
                    )}
                  </FormItem>
                </Form>
                  
                  <div className='company-level-status'>
                    <Form>
                    <FormItem label = {this.$t("common.column.status")/*状态*/}>
                      {getFieldDecorator('enabled', {
                        rules: [{
                          required: false,
                        }],
                        initialValue: true,
                        valuePropName: 'checked',
                      })(
                        <Switch/>
                      )}
                    </FormItem>
                </Form>
                  </div>
              </div>
            </Modal>
          </div>
          <div>
            <div style={{margin: '10px 0', fontSize: 13 }}>{this.$t("common.total", {total: pagination.total})/*{`共搜索到${data.length}条数据`}*/}</div>
            <Table rowKey='id'
                   size="middle"
                   dataSource={data}
                   columns={columns}
                   loading={loading}
                   pagination={pagination}
                   onRow={record => ({
                     onClick: () => this.handleRowClick(record)
                   })}
                   bordered/>
            <Modal visible={editVisible}
                   title={this.$t("company.level.define.edit.level.define")/*编辑公司级别定义*/}
                   onOk={(e) => this.handleModalOk(e,'edit')}
                   onCancel={(e) => this.onModalCancel(e,'edit')}>
              <Alert type="info"
                     message={this.$t("common.help")/*帮助提示*/}
                     description={this.$t("company.level.define.save.not.edit")/*【公司级别代码】 保存后将不可修改*/}
                     showIcon/>
              <div style={{marginTop: 20}}>
                <div className='company-level-modal'>
                  <div className='company-level-text'>{this.$t("company.level.define.company.code")/*公司级别代码：*/}</div>
                  <Input value={record.companyLevelCode} disabled/>
                </div>
                <div className='company-level-modal'>
                  <div className='company-level-text'>{this.$t("person.group.desc")/*描述*/}</div>
                  <LanguageInput name=''
                                 isEdit={true}
                                 i18nName={record.i18n && record.i18n.description}
                                 nameChange={this.handleEdiePeriodSetNameChange}
                                 value={record.description}/>
                </div>
                <div className='company-level-modal'>
                  <div className='company-level-text-switch'>{this.$t("common.column.status")/*状态*/}</div>
                  <div className='company-level-switch' style={{marginLeft:'10px'}}><Switch checked={record.enabled} onChange={this.onSwitchChange}/></div>
                </div>
              </div>
            </Modal>
          </div>
        </div>
      </div>
    )
  }
}
// CompanyLevelDefine.contextTypes = {
//   router: React.PropTypes.object
// };

function mapStateToProps(state) {
  return {
  }
}

const wrappedNewContract = Form.create()(CompanyLevelDefine);
export default connect(mapStateToProps, null, null, { withRef: true })(wrappedNewContract);
