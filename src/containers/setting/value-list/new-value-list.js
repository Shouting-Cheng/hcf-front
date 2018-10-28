import { messages } from "utils/utils";
/**
 * Created by zaranengap on 2017/9/1.
 * 此组件的功能有：
 * 1.新增自定义值列表与编辑自定义值列表
 * 2.值列表详情：包括自定义值列表详情与系统值列表详情
 */
import React from 'react';

import config from 'config';
import { connect } from 'dva';

// import menuRoute from 'routes/menuRoute';
import debounce from 'lodash.debounce';
import {
  Form, Table, Button, Icon, Badge, Row, Col, Input, Popover,
  Switch, Dropdown, Menu, message, Checkbox, Tabs
} from 'antd';

const FormItem = Form.Item;
const Search = Input.Search;
const TabPane = Tabs.TabPane;

import SlideFrame from 'widget/slide-frame';
import NewValue from 'containers/setting/value-list/new-value';
import ListSelector from 'widget/list-selector';
import Importer from 'widget/Template/importer';
import FileSaver from 'file-saver';
import { LanguageInput } from 'widget/index';
import valueListService from 'containers/setting/value-list/value-list.service';
import 'styles/setting/value-list/new-value-list.scss';

import { routerRedux } from 'dva/router';

class ValueList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dBtnDisabled: false,
      loading: false,
      tableLoading: false,
      companyLoading: false,
      tabValue: 'valueListDetailPage',
      data: [],
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0
      },
      keyWords: '',
      columnsSystem: [

        {
          title: messages('value.list.value.name'/*值名称*/),
          dataIndex: 'messageKey'
        },
        {
          title: messages('value.list.value.code'/*编码*/),
          dataIndex: 'value'
        },
        {
          title: messages('common.sequence'/*序号*/),
          dataIndex: 'sequenceNumber',
          width: '10%',
        },
        {
          title: messages('common.remark'/*备注*/),
          dataIndex: 'remark',
          render: text => <span>{text ? <Popover placement="topLeft" content={text}>{text}</Popover> : '-'}</span>
        },
        {
          title: messages('common.column.status'/*状态*/), dataIndex: 'enabled', width: '10%',
          render: enabled =>
            <Badge status={enabled ? 'success' : 'error'}
              text={enabled ? messages('common.status.enable') : messages('common.status.disable')} />
        },
      ],
      columnsCustom: [
        {
          title: messages('value.list.value.name'/*值名称*/),
          dataIndex: 'messageKey'
        },
        {
          title: messages('value.list.value.code'/*编码*/),
          dataIndex: 'value'
        },
        {
          title: messages('common.sequence'/*序号*/),
          dataIndex: 'sequenceNumber',
          width: '10%',
        },
        {
          title: messages('value.list.limit'/*数据权限*/),
          dataIndex: 'common',
          render: common =>
            common ? messages('value.list.limit.all'/*全员*/) : messages('value.list.limit.part'/*部分*/)
        },
        {
          title: messages('common.remark'/*备注*/),
          dataIndex: 'remark',
          render: text => <span>{text ? <Popover placement="topLeft" content={text}>{text}</Popover> : '-'}</span>

        },
        {
          title: messages('common.column.status'/*状态*/),
          dataIndex: 'enabled',
          width: '10%',
          render: enabled =>
            <Badge status={enabled ? 'success' : 'error'}
              text={enabled ? messages('common.status.enable') : messages('common.status.disable')} />
        },
        {
          title: messages('value.list.default'/*默认*/),
          dataIndex: 'customEnumerationItemOID',
          width: '10%',
          render: (value, record) =>
            <Checkbox checked={value === this.state.defaultCustomEnumerationItemOID}
              onChange={e => this.setDefault(e, record)} />
        },
        {
          title: messages('common.operation'/*操作*/),
          dataIndex: 'id',
          width: '10%',
          render: (value, record) =>
            <a onClick={() => this.handleRowClick(record)}>{messages('common.edit'/*编辑*/)}</a>
        }
      ],
      companyData: [],
      companyPage: 0,
      companySize: 10,
      companyPagination: {
        total: 0
      },
      companyColumns: [
        {
          title: messages('value.list.company.code'/*公司代码*/),
          dataIndex: 'companyCode'
        },
        {
          title: messages('value.list.company.name'/*公司名称*/),
          dataIndex: 'name'
        }
      ],
      showListSelector: false,
      showSlideFrame: false,
      showImportFrame: false,
      form: {
        name: '',
        enabled: true,
        i18n: {}
      },
      _form: {
        name: '',
        enabled: true,
        i18n: {}
      },
      edit: true,
      customEnumerationOID: null,
      defaultCustomEnumerationItemOID: null,
      isCustom: 'SYSTEM',
      slideFrameParams: {}, //侧滑参数
      selectedRowKeys: [],
      // valueList: menuRoute.getRouteItem('value-list', 'key')   //值列表页
    };
    this.handleSearch = debounce(this.handleSearch, 250);
  }

  componentWillMount() {
    if (this.props.tenantMode) {
      let columnsSystem = this.state.columnsSystem;
      let col0 = {
        title: messages('value.list.default'/*默认*/),
        dataIndex: 'customEnumerationItemOID',
        width: '10%',
        render: (value, record) =>
          <Checkbox checked={value === this.state.defaultCustomEnumerationItemOID}
            onChange={e => this.setDefault(e, record)} />
      }
      let col1 = {
        title: messages('common.operation'/*操作*/),
        dataIndex: 'id',
        width: '10%',
        render: (value, record) =>
          <a onClick={() => this.handleRowClick(record)}>{messages('common.edit'/*编辑*/)}</a>
      }

      columnsSystem.push(col0);
      columnsSystem.push(col1);
      this.setState({ columnsSystem })
    }
    if (this.props.match.params.customEnumerationOID) {
      //编辑
      this.setState({
        customEnumerationOID: this.props.match.params.customEnumerationOID,
        edit: false
      }, () => {
        this.getInfo();
        this.getList()
      })
    } else {
      //新增
      this.setState({ isCustom: 'CUSTOM' })
    }
  }

  //选中项发生变化的时的回调
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys })
  };

  //获取基本信息
  getInfo = () => {
    valueListService.getValueListInfo(this.state.customEnumerationOID)
      .then(res => {
        let data = res.data;
        data.i18n = data.i18n || {};
        let form = { ... this.state.form, ...data };
        this.setState({
          isCustom: res.data.isCustom,
          defaultCustomEnumerationItemOID: res.data.defaultCustomEnumerationItemOID,
          form,
          _form: { ...form }
        })
      })
  };

  //获取值内容列表
  getList = () => {
    const { page, pageSize, keyWords } = this.state;
    this.setState({ tableLoading: true });
    valueListService.getValueList(page, pageSize, this.state.customEnumerationOID, keyWords)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            tableLoading: false,
            data: res.data,
            pagination: {
              total: Number(res.headers['x-total-count']),
              current: page + 1,
              onChange: this.onChangePager
            }
          })
        }
      }).catch(() => {
        this.setState({ tableLoading: false });
      })
  };

  //获取公司列表
  getCompanyList = () => {
    const { companyPage, companySize, customEnumerationOID } = this.state;
    this.setState({ companyLoading: true });
    valueListService.getCompanyList(companyPage, companySize, customEnumerationOID)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            companyData: res.data,
            companyLoading: false,
            companyPagination: {
              total: Number(res.headers['x-total-count']),
              current: companyPage + 1,
              onChange: this.onCompanyChangePager
            }
          })
        }
      })
  };

  onChangePager = (page) => {
    if (page - 1 !== this.state.page)
      this.setState({ page: page - 1 }, () => {
        this.getList()
      })
  };

  onCompanyChangePager = (page) => {
    if (page - 1 !== this.state.companyPage)
      this.setState({ companyPage: page - 1 }, () => {
        this.getCompanyList()
      })
  };

  //设置默认的值内容
  setDefault = (e, record) => {
    let { data, form } = this.state;
    console.log(record)
    data.map(item => {
      if (e.target.checked) {
        item.isDefault = (item.id === record.id);
        form.defaultCustomEnumerationItemOID = record.customEnumerationItemOID;
        form.defaultCustomEnumerationItemValue = record.value
      } else {
        item.isDefault = false;
        form.defaultCustomEnumerationItemOID = null;
        form.defaultCustomEnumerationItemValue = null
      }
    });
    this.setState({ data, form, _form: form, tableLoading: true }, () => {
      this.handleSave()
    })
  };

  handleSearch = (value) => {
    this.setState({
      page: 0,
      keyWords: value,
      pagination: { current: 1 }
    }, () => {
      this.setState({ selectedRowKeys: [] });
      this.getList()
    })
  };

  showSlide = (flag) => {
    this.setState({ showSlideFrame: flag })
  };

  showListSelector = (flag) => {
    this.setState({ showListSelector: flag })
  };

  handleNameChange = (evt) => {
    let form = this.state.form;

    form.name = evt.target.value;
    this.setState({
      form
    })
  };

  handleEnabled = (enabled) => {
    let form = this.state.form;
    form.enabled = enabled;
    this.setState({
      form
    })
  };

  validataNameLengthErr = (name) => {
    if (name === null || name === undefined || name === "") {
      // 请填写名称
      message.warn(messages('value.list.name.input'));
      return true;
    }
    if (name && name.length && name.length > 15) {
      //名称最多输入15个字符
      message.warn(messages('value.list.name.max.15'));
      return true;
    }
  }
  handleSave = () => {
    let params = {
      isCustom: this.state.isCustom,
      fieldType: "TEXT",
      values: [],
      dataFrom: "101"
    };
    Object.keys(this.state.form).map(key => {
      params[key] = this.state.form[key]
    });

    //todo
    // 验证一下name的长度
    // let validateStatus = length > 15 ? "error" : null;
    // let help = length > 15 ? messages('value.list.name.max.15'/*最多输入15个字符*/) : null;
    if (this.validataNameLengthErr(this.state._form.name)) {
      return;
    }
    if (this.state.customEnumerationOID) {
      params.customEnumerationOID = this.state.customEnumerationOID
    }
    this.setState({ loading: true });
    valueListService[this.state.customEnumerationOID ? 'uploadValueList' : 'newValueList'](params)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            loading: false,
            edit: false,
            customEnumerationOID: res.data.customEnumerationOID
          }, () => {
            this.getInfo();
            this.getList()
          });
          message.success(messages('common.operate.success'));
        }
      }).catch(e => {
        this.setState({ loading: false, tableLoading: false });
      })
  };

  handleEdit = () => {
    this.setState({ edit: true })
  };

  handleCancel = () => {
    if (this.state.customEnumerationOID) {
      //编辑
      this.setState({ edit: false, form: { ...this.state._form } })
    } else {

      //新增
      this.props.dispatch(routerRedux.push({
        pathname: "/admin-setting/value-list"
      }))

      // this.context.router.push(`${this.state.valueList.url}?tab=CUSTOM`)
    }
  };

  showImport = (flag) => {
    this.setState({
      showImportFrame: flag
    })
  };

  //关闭侧栏的方法，判断是否有内部参数传出
  handleCloseSlide = (params) => {
    this.setState({
      showSlideFrame: false
    }, () => {
      params && this.getList()
    })
  };
  //名称：自定义值列表多语言
  i18nNameChange = (name, i18nName) => {
    const form = this.state.form;
    console.log(form)
    console.log(i18nName)
    form.name = name;
    form.i18n.name = i18nName;
  }

  renderForm() {
    let form = this.state.form;
    return (
      this.state.edit ?
        <div>
          <Row gutter={12}>
            <Col span={8}>
              <div className="new-lp-row">
                <span className="new-lp-row-re">*</span>
                <span>
                  {/*值列表名称*/}
                  {messages("value.list.information")}
                </span>
              </div>
              <LanguageInput
                key={1}
                name={form.name}
                i18nName={form.i18n && form.i18n.name ? form.i18n.name : null}
                isEdit={form.id}
                nameChange={this.i18nNameChange}
              />
            </Col>

            <Col span={8}>
              <FormItem label={messages('common.column.status'/*状态*/)}
                colon={false}>
                <Switch defaultChecked={this.state.form.enabled}
                  onChange={this.handleEnabled}
                  checkedChildren={<Icon type="check" />}
                  unCheckedChildren={<Icon type="cross" />} />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={12}>
            <Button type="primary"
              htmlType="submit"
              loading={this.state.loading}
              onClick={this.handleSave}
            >{messages('common.save')}</Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleCancel}>{messages('common.cancel')}</Button>
          </Row>
        </div> :
        <div>
          <div className="form-title">
            {/*值列表名称*/}
            {messages('value.list.information')}
          </div>
          <div>{this.state.form.name}</div>
        </div>
    )
  }

  renderDropDown() {
    return (
      <Menu onClick={() => this.showImport(true)}>
        <Menu.Item key="1">{messages('value.list.value.import'/*值导入*/)}</Menu.Item>
      </Menu>
    )
  }

  newValueList = () => {
    let customEnumerationOID = this.state.customEnumerationOID;
    this.setState({
      slideFrameParams: { customEnumerationOID, isCustom: this.state.isCustom, hasInit: false }
    }, () => {
      this.showSlide(true)
    })
  };

  //编辑值内容
  handleRowClick = (record) => {
    let customEnumerationOID = this.state.customEnumerationOID;
    this.setState({
      slideFrameParams: {
        customEnumerationOID,
        record,
        isCustom: this.state.isCustom,
        systemInit: record.systeminit,
        hasInit: false
      }
    }, () => {
      this.showSlide(true)
    })
  };

  //切换tab
  handleTabsChange = (tab) => {
    this.setState({ tabValue: tab }, () => {
      if (this.state.tabValue === 'distributeCompanyPage') {
        this.getCompanyList()
      }
    })
  };

  //分配公司
  distributeCompany = (values) => {
    if (!this.state.dBtnDisabled) {
      this.state.dBtnDisabled = true;
      let companies = [];
      values.result.map((item) => {
        companies.push(item.companyOID)
      })
      valueListService.distributeCompany(companies, [this.state.customEnumerationOID])
        .then(res => {
          this.state.dBtnDisabled = false;
          if (res.status === 200) {
            message.success(messages('common.operate.success'));
            this.showListSelector(false);
            this.getCompanyList()
          }
        })
        .catch(err => {
          this.state.dBtnDisabled = false;
        })
    }
  };

  //导入成功回调
  handleImportOk = () => {
    this.showImport(false);
    this.getList()
  };

  //值导出
  exportValues = () => {
    const { customEnumerationOID, isCustom } = this.state;
    let hide = message.loading(messages("importer.spanned.file"/*正在生成文件..*/));
    valueListService.exportValues(customEnumerationOID, isCustom).then(res => {
      let b = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      let name = messages('value.list'/*值列表*/);
      FileSaver.saveAs(b, `${name}.xlsx`);
      hide();
    }).catch(() => {
      message.error(messages("importer.download.error.info"/*下载失败，请重试*/));
      hide();
    })
  };

  //批量启用禁用
  //type enabled启用 disabled禁用
  handleBatch = (type) => {
    let enable = false;
    if (type === 'enabled') {
      enable = true;
    }
    valueListService.batchUpdate(this.state.selectedRowKeys, enable).then(res => {
      if (res.status === 200) {
        message.success(messages('common.operate.success'));
        this.setState({ selectedRowKeys: [] });
        this.getList();
      }
    })
  }

  handleBack = () => {
    this.props.dispatch(routerRedux.push({
      pathname: "/admin-setting/value-list"
    }))
  };

  render() {
    const {
      tableLoading, companyLoading, tabValue, showSlideFrame, edit, data, columnsSystem,
      columnsCustom, pagination, showImportFrame, form, customEnumerationOID, slideFrameParams,
      companyColumns, companyData, companyPagination, showListSelector, isCustom, selectedRowKeys
    } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRowKeys,
      onChange: this.onSelectChange
    };
    const hasSelected = selectedRowKeys.length > 0;
    return (
      <div style={{ paddingBottom: 20 }} className="new-value-list">
        {customEnumerationOID && isCustom === 'CUSTOM' && this.props.tenantMode && (
          <Tabs defaultActiveKey="valueListDetailPage" onChange={this.handleTabsChange}>
            <TabPane tab={messages('value.list.detail'/*值列表详情*/)} key="valueListDetailPage" />
            <TabPane tab={messages('value.list.distribute.company'/*分配公司*/)} key="distributeCompanyPage" />
          </Tabs>
        )}

        {tabValue === 'valueListDetailPage' && (
          <div>
            <div className="common-top-area">
              <div className="common-top-area-title">
                {!edit ? <Icon type={form.enabled ? "check-circle" : "minus-circle"}
                  className={form.enabled ? "title-icon" : "title-icon not"} /> : null}
                {messages('value.list.basic.info'/*基本信息*/)}
                {!edit && isCustom === 'CUSTOM' ?
                  <span className="title-edit" onClick={this.handleEdit}>{messages('common.edit')}</span> : null}
              </div>
              <div className="common-top-area-content form-title-area">
                {this.renderForm()}
              </div>
            </div>

            {customEnumerationOID && (
              <div>
                <div className="table-header">
                  <div className="table-header-title">{messages("common.total1", { total: pagination.total || 0 })}</div>
                  <div className="table-header-buttons">
                    {(this.props.tenantMode || isCustom === 'CUSTOM') && (
                      <Dropdown.Button overlay={this.renderDropDown()} type="primary" onClick={this.newValueList}>
                        {messages('value.list.new.value'/*新建值内容*/)}
                      </Dropdown.Button>
                    )}
                    <Button onClick={this.exportValues}>{messages('value.list.value.export'/*值导出*/)}</Button>
                    {(this.props.tenantMode || isCustom === 'CUSTOM') && (
                      <div style={{ display: 'inline-block' }}>
                        <Button onClick={() => this.handleBatch('enabled')} disabled={!hasSelected}>
                          {messages('common.enabled'/*启用*/)}
                        </Button>
                        <Button onClick={() => this.handleBatch('disabled')} disabled={!hasSelected}>
                          {messages('common.disabled'/*禁用*/)}
                        </Button>
                        <div style={{ display: 'inline-block', padding: '4px 8px 4px 20px', border: '1px solid #91d5ff', backgroundColor: '#e6f7ff', borderRadius: 4 }}>
                          <Icon type="info-circle" style={{ color: '#1890ff' }} />
                          <span>&nbsp;{messages("common.total.selected2", { total: selectedRowKeys.length })}</span>
                        </div>
                      </div>
                    )}
                    <Search
                      placeholder={messages('value.list.search.name.code.remark'/*请输入值名称/编码/备注*/)}
                      style={{ width: 300, position: 'absolute', right: 0, bottom: 0 }}
                      onChange={(e) => this.handleSearch(e.target.value)} />
                  </div>
                </div>
                <Table rowKey="customEnumerationItemOID"
                  columns={isCustom === 'SYSTEM' ? columnsSystem : columnsCustom}
                  dataSource={data}
                  pagination={pagination}
                  loading={tableLoading}
                  size="middle"
                  rowSelection={(this.props.tenantMode || isCustom === 'CUSTOM') ? rowSelection : null}
                  bordered />
                <a style={{ fontSize: '14px', paddingBottom: '20px' }} onClick={this.handleBack}>
                  <Icon type="rollback" style={{ marginRight: '5px' }} />{messages('common.back')}
                </a>
                <SlideFrame
                  // 编辑值内容:新建值内容
                  title={slideFrameParams.record ? messages('value.list.edit.value') : messages('value.list.new.value')}
                  show={showSlideFrame}
                  onClose={this.handleCloseSlide}
                >
                  <NewValue onClose={() => this.showSlide(false)} params={slideFrameParams}></NewValue>
                </SlideFrame>
              </div>
            )}
          </div>
        )}

        {tabValue === 'distributeCompanyPage' && (
          <div>
            <div className="table-header">
              <div className="table-header-buttons">
                {/*分配公司*/}
                <Button type="primary"
                  onClick={() => this.showListSelector(true)}>
                  {messages('value.list.distribute.company')}
                </Button>
              </div>
            </div>
            <Table rowKey="id"
              columns={companyColumns}
              dataSource={companyData}
              pagination={companyPagination}
              loading={companyLoading}
              bordered
              size="middle" />
            <a style={{ fontSize: '14px', paddingBottom: '20px' }} onClick={this.handleBack}>
              <Icon type="rollback" style={{ marginRight: '5px' }} />{messages('common.back')}
            </a>
            <ListSelector visible={showListSelector}
              onCancel={() => this.showListSelector(false)}
              type="deploy_company"
              extraParams={{ source: this.props.match.params.id }}
              onOk={this.distributeCompany} />
          </div>
        )}

        <Importer visible={showImportFrame}
          title={messages('value.list.value.import'/*值导入*/)}
          templateUrl={`${config.baseUrl}/api/custom/enumerations/items/template`}
          uploadUrl={`${config.baseUrl}/api/custom/enumerations/items/import?customEnumerationOID=${customEnumerationOID}&isCustom=${isCustom === 'CUSTOM'}`}
          listenUrl={`${config.baseUrl}/api/batch/transaction/logs/customenumerationitem`}
          errorUrl={`${config.baseUrl}/api/batch/transaction/logs/failed/export/customenumerationitem`}
          fileName={messages('value.list.value.import'/*值导入*/)}
          onOk={this.handleImportOk}
          afterClose={() => this.showImport(false)} />
      </div>
    )
  }
}


function mapStateToProps(state) {
  return {
    tenantMode: true
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(ValueList);