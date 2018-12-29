import { messages } from 'utils/utils';
/**
 * Created by zaranengap on 2017/9/1.
 * 此组件的功能有：
 * 1.新增自定义值列表与编辑自定义值列表
 * 2.值列表详情：包括自定义值列表详情与系统值列表详情
 */
import React from 'react';
import ExcelExporter from 'widget/excel-exporter';
import config from 'config';
import { connect } from 'dva';
import ImporterNew from 'widget/Template/importer-new';
import httpFetch from 'share/httpFetch';
import debounce from 'lodash.debounce';
import {
  Form,
  Button,
  Icon,
  Badge,
  Row,
  Col,
  Input,
  Popover,
  Switch,
  Dropdown,
  Menu,
  message,
  Checkbox,
  Tabs,
} from 'antd';
import Table from 'widget/table';

const FormItem = Form.Item;
const Search = Input.Search;
const TabPane = Tabs.TabPane;

import SlideFrame from 'widget/slide-frame';
import NewValue from 'containers/setting/value-list/new-value';
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
        total: 0,
      },
      keyWords: '',
      columnsSystem: [
        {
          title: messages('value.list.value.name' /*值名称*/),
          dataIndex: 'name',
        },
        {
          title: messages('value.list.value.code' /*编码*/),
          dataIndex: 'value',
        },
        {
          title: messages('common.remark' /*备注*/),
          dataIndex: 'remark',
          render: text => (
            <span>
              {text ? (
                <Popover placement="topLeft" content={text}>
                  {text}
                </Popover>
              ) : (
                '-'
              )}
            </span>
          ),
        },
        {
          title: messages('common.column.status' /*状态*/),
          dataIndex: 'enabled',
          width: '10%',
          render: enabled => (
            <Badge
              status={enabled ? 'success' : 'error'}
              text={enabled ? messages('common.status.enable') : messages('common.status.disable')}
            />
          ),
        },
      ],
      columnsCustom: [
        {
          title: messages('value.list.value.name' /*值名称*/),
          dataIndex: 'name',
        },
        {
          title: messages('value.list.value.code' /*编码*/),
          dataIndex: 'value',
        },
        {
          title: messages('common.remark' /*备注*/),
          dataIndex: 'remark',
          render: text => (
            <span>
              {text ? (
                <Popover placement="topLeft" content={text}>
                  {text}
                </Popover>
              ) : (
                '-'
              )}
            </span>
          ),
        },
        {
          title: messages('common.column.status' /*状态*/),
          dataIndex: 'enabled',
          width: '10%',
          render: enabled => (
            <Badge
              status={enabled ? 'success' : 'error'}
              text={enabled ? messages('common.status.enable') : messages('common.status.disable')}
            />
          ),
        },
        {
          title: messages('common.operation' /*操作*/),
          dataIndex: 'id',
          width: '10%',
          render: (value, record) => (
            <a onClick={() => this.handleRowClick(record)}>{messages('common.edit' /*编辑*/)}</a>
          ),
        },
      ],
      showListSelector: false,
      showSlideFrame: false,
      showImportFrame: false,
      form: {
        name: '',
        enabled: true,
        code: '',
        i18n: {},
      },
      _form: {
        name: '',
        enabled: true,
        i18n: {},
        code: '',
      },
      edit: true,
      id: null,
      typeFlag: 'SYSTEM',
      slideFrameParams: {}, //侧滑参数
      selectedRowKeys: [],
      // valueList: menuRoute.getRouteItem('value-list', 'key')   //值列表页
      /**
       * 导出
       */
      excelVisible: false,
      btLoading: false,
      exportColumns: [
        { title: '值名称', dataIndex: 'name' },
        { title: '编码', dataIndex: 'code' },
        { title: '备注', dataIndex: 'remark' },
        { title: '是否启用', dataIndex: 'enabledStr' },
      ],
    };
    this.handleSearch = debounce(this.handleSearch, 250);
  }

  componentWillMount() {
    if (this.props.match.params.id) {
      //编辑
      this.setState(
        {
          id: this.props.match.params.id,
          edit: false,
        },
        () => {
          this.getInfo();
          this.getList();
        },
      );
    } else {
      //新增
      this.setState({ typeFlag: 'CUSTOM' });
    }
  }


  //获取基本信息
  getInfo = () => {
    valueListService.getValueListInfo(this.state.id).then(res => {
      let data = res.data;
      data.i18n = data.i18n || {};
      let form = { ...this.state.form, ...data };
      this.setState({
        typeFlag: res.data.typeFlag,
        form,
        _form: { ...form, i18n: { ...form.i18n } },
      });
    });
  };

  //获取值内容列表
  getList = () => {
    const { page, pageSize, keyWords } = this.state;
    this.setState({ tableLoading: true });
    valueListService
    .getValueList(page, pageSize, this.state.id, keyWords)
    .then(res => {
      if (res.status === 200) {
        this.setState({
          tableLoading: false,
          data: res.data,
          pagination: {
            total: Number(res.headers['x-total-count']),
            current: page + 1,
            onChange: this.onChangePager,
            onShowSizeChange: this.onShowSizeChange,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              this.$t(
                'common.show.total',
                { range0: `${range[0]}`, range1: `${range[1]}`, total: total },
              ),
          },
        });
      }
    })
    .catch(() => {
      this.setState({ tableLoading: false });
    });
  };


  onChangePager = page => {
    if (page - 1 !== this.state.page) {
      this.setState({ page: page - 1 }, () => {
        this.getList();
      });
    }
  };

  //改变每页显示的条数
  onShowSizeChange = (current, pageSize) => {
    this.setState({ page: current - 1, pageSize }, () => {
      this.getList();
    });
  };

  handleSearch = value => {
    this.setState(
      {
        page: 0,
        keyWords: value,
        pagination: { current: 1 },
      },
      () => {
        this.setState({ selectedRowKeys: [] });
        this.getList();
      },
    );
  };

  showSlide = flag => {
    this.setState({ showSlideFrame: flag });
  };

  showListSelector = flag => {
    this.setState({ showListSelector: flag });
  };


  handleEnabled = enabled => {
    let form = this.state.form;
    form.enabled = enabled;
    this.setState({
      form,
    });
  };
  handleCode = input => {
    let form = this.state.form;
    form.code = input;
    this.setState({
      form,
    });
  };
  validataNameLengthErr = name => {
    if (name === null || name === undefined || name === '') {
      // 请填写名称
      message.warn(messages('value.list.name.input'));
      return true;
    }
    if (name && name.length && name.length > 15) {
      //名称最多输入15个字符
      message.warn(messages('value.list.name.max.15'));
      return true;
    }
  };

  validataCodeLengthErr = name => {
    if (name === null || name === undefined || name === '') {
      // 请填写代码
      message.warn(messages('value.list.code.input'));
      return true;
    }
  };
  handleSave = () => {
    let params = {
      typeFlag: this.state.typeFlag,
    };
    Object.keys(this.state.form).map(key => {
      params[key] = this.state.form[key];
    });
    if (this.validataNameLengthErr(this.state.form.name)) {
      return;
    }
    if (this.validataCodeLengthErr(this.state.form.code)) {
      return;
    }
    if (this.state.id) {
      params.id = this.state.id;
    }
    this.setState({ loading: true });
    valueListService[this.state.id ? 'uploadValueList' : 'newValueList'](params)
    .then(res => {
      if (res.status === 200) {
        this.setState(
          {
            loading: false,
            edit: false,
            id: res.data.id,
          },
          () => {
            this.getInfo();
            this.getList();
          },
        );
        !res.data.values[0].enabled
          ? message.warning(messages('common.operate.value.disabled'))
          : message.success(messages('common.operate.success'));
      }
    })
    .catch(e => {
      this.setState({ loading: false, tableLoading: false });
    });
  };

  handleEdit = () => {
    this.setState({ edit: true });
  };

  handleCancel = () => {
    if (this.state.id) {
      //编辑
      this.setState({ edit: false, form: { ...this.state._form, i18n: { ...this.state._form.i18n } } });
    } else {
      //新增
      this.props.dispatch(
        routerRedux.push({
          pathname: '/admin-setting/value-list/:tab'.replace(':tab', this.props.match.params.tab),
        }),
      );
    }
  };

  showImport = flag => {
    if (this.state.form.enabled) {
      this.setState({
        showImportFrame: flag,
      });
    }else{
      message.warning(messages('value.list.code.is.disabled'));
      return;
    }
  };

  //关闭侧栏的方法，判断是否有内部参数传出
  handleCloseSlide = params => {
    this.setState(
      {
        showSlideFrame: false,
      },
      () => {
        params && this.getList();
      },
    );
  };
  //名称：自定义值列表多语言
  i18nNameChange = (name, i18nName) => {
    const form = this.state.form;
    form.name = name;
    form.i18n.name = i18nName;
    this.setState({ form });
  };

  /**
   * 点击导出按钮
   */
  onExportClick = () => {
    this.setState({
      btLoading: true,
      excelVisible: true,
    });
  };
  /**
   * 导出取消
   */
  onExportCancel = () => {
    this.setState({
      btLoading: false,
      excelVisible: false,
    });
  };
  /**
   * 确定导出
   */
  export = result => {
    let hide = message.loading('正在生成文件，请等待......');

    const { id, typeFlag } = this.state;
    valueListService
    .exportValues(result, id, typeFlag)
    .then(res => {
      if (res.status === 200) {
        message.success('操作成功');
        let fileName = res.headers['content-disposition'].split('filename=')[1];
        let f = new Blob([res.data]);
        FileSaver.saveAs(f, decodeURIComponent(fileName));
        this.setState({
          btLoading: false,
        });
        hide();
      }
    })
    .catch(e => {
      message.error('下载失败，请重试!');
      this.setState({
        btLoading: false,
      });
      hide();
    });
  };

  renderForm() {
    let form = this.state.form;
    return this.state.edit ? (
      <div>
        <Row gutter={12}>
          <Col span={8}>
            <div className="ant-form-item-label">
              <span className="new-lp-row-re">*</span>
              <span>
                {/*值列表名称*/}
                {messages('value.list.information')}
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
            <div className="ant-form-item-label">
              <span className="new-lp-row-re">*</span>
              <span>
                {/*值列表代码*/}
                {messages('value.list.code')}
              </span>
            </div>
            <Input
              defaultValue={this.state.form.code}
              disabled={this.state.id !== null && this.state.id !== undefined && this.state.id !== ''}
              onChange={e => this.handleCode(e.target.value)}
            />

          </Col>

          <Col span={8}>
            <FormItem label={messages('common.column.status' /*状态*/)} colon={false}>
              <Switch
                defaultChecked={this.state.form.enabled}
                onChange={this.handleEnabled}
                checkedChildren={<Icon type="check"/>}
                unCheckedChildren={<Icon type="cross"/>}
              />
            </FormItem>
          </Col>
        </Row>
        <Row gutter={12}>
          <Button
            type="primary"
            htmlType="submit"
            loading={this.state.loading}
            onClick={this.handleSave}
          >
            {messages('common.save')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleCancel}>
            {messages('common.cancel')}
          </Button>
        </Row>
      </div>
    ) : (
      <div>
        <Row>
          <Col span={8}>
            <div className="form-title">
              {/*值列表名称*/}
              {messages('value.list.information')}
            </div>
            <div>{this.state.form.name}</div>
          </Col>
          <Col span={8}>
            <div className="form-title">
              {/*值列表名称*/}
              {messages('value.list.code')}
            </div>
            <div>{this.state.form.code}</div>
          </Col>
          <Col span={8}>
            <div className="form-title">
              {/*状态*/}
              {messages('common.column.status')}
            </div>
            <div><Badge status={this.state.form.enabled ? 'success' : 'error'}
                        text={this.state.form.enabled ? messages('common.status.enable') : messages('common.status.disable')}/>
            </div>
          </Col>
        </Row>
      </div>
    );
  }

  renderDropDown() {
    return (
      <Menu onClick={() => this.showImport(true)}>
        <Menu.Item key="1">{messages('value.list.value.import' /*值导入*/)}</Menu.Item>
      </Menu>
    );
  }

  newValueList = () => {
    let codeId = this.state.id;
    if(this.state.form.enabled) {
      this.setState(
        {
          slideFrameParams: { codeId: codeId, typeFlag: this.state.typeFlag },
        },
        () => {
          this.showSlide(true);
        },
      );
    }else{
      message.warning(messages('value.list.code.is.disabled'));
      return;
    }
  };

  //编辑值内容
  handleRowClick = record => {
    let codeId = this.state.id;
    this.setState(
      {
        slideFrameParams: {
          codeId: codeId,
          record,
          typeFlag: this.state.typeFlag,
        },
      },
      () => {
        this.showSlide(true);
      },
    );
  };


  //导入成功回调
  handleImportOk = (transactionID) => {
    httpFetch.post(`${config.baseUrl}/api/custom/enumerations/items/import/confirm/${transactionID}`).then(res => {
      if (res.status === 200) {
        this.getList();
      }
    }).catch(() => {
      message.error(this.$t('importer.import.error.info')/*导入失败，请重试*/);
    });
    this.showImport(false);
  };

  //值导出
  exportValues = () => {
    const { customEnumerationOid, isCustom } = this.state;
    let hide = message.loading(messages('importer.spanned.file' /*正在生成文件..*/));
    valueListService
    .exportValues(customEnumerationOid, isCustom)
    .then(res => {
      let b = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      let name = messages('value.list' /*值列表*/);
      FileSaver.saveAs(b, `${name}.xlsx`);
      hide();
    })
    .catch(() => {
      message.error(messages('importer.download.error.info' /*下载失败，请重试*/));
      hide();
    });
  };

  //批量启用禁用
  //type enabled启用 disabled禁用
  handleBatch = type => {
    if (this.state.form.enabled) {
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
      });
    }else{
      message.warning(messages('value.list.code.is.disabled'));
      return;
    }
  };

  handleBack = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/admin-setting/value-list/:tab'.replace(':tab', this.props.match.params.tab),
      }),
    );
  };
//选中项发生变化的时的回调
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  render() {
    const {
      tableLoading,
      tabValue,
      showSlideFrame,
      edit,
      data,
      columnsSystem,
      columnsCustom,
      pagination,
      showImportFrame,
      form,
      id,
      slideFrameParams,
      typeFlag,
      selectedRowKeys,
    } = this.state;
    //导出
    const { exportColumns, excelVisible, btLoading } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;
    return (
      <div style={{ paddingBottom: 20 }} className="new-value-list">


        {tabValue === 'valueListDetailPage' && (
          <div>
            <div className="common-top-area">
              <div className="common-top-area-title">
                {!edit ? (
                  <Icon
                    type={form.enabled ? 'check-circle' : 'minus-circle'}
                    className={form.enabled ? 'title-icon' : 'title-icon not'}
                  />
                ) : null}
                {messages('value.list.basic.info' /*基本信息*/)}
                {!edit && typeFlag === 'CUSTOM' ? (
                  <span className="title-edit" onClick={this.handleEdit}>
                    {messages('common.edit')}
                  </span>
                ) : null}
              </div>
              <div className="common-top-area-content form-title-area">{this.renderForm()}</div>
            </div>

            {id && (
              <div>
                <div className="table-header">
                  <div className="table-header-title">
                    {messages('common.total1', { total: pagination.total || 0 })}
                  </div>
                  <div className="table-header-buttons">
                    {(typeFlag !== 'SYSTEM') && (
                      <Dropdown.Button
                        overlay={this.renderDropDown()}
                        type="primary"
                        onClick={this.newValueList}
                      >
                        {messages('value.list.new.value' /*新建值内容*/)}
                      </Dropdown.Button>
                    )}

                    <Button loading={btLoading} onClick={this.onExportClick}>
                      {messages('value.list.value.export' /*值导出*/)}
                    </Button>
                    {(typeFlag !== 'SYSTEM') && (
                      <div style={{ display: 'inline-block' }}>
                        <Button onClick={() => this.handleBatch('enabled')} disabled={!hasSelected}>
                          {messages('common.enabled' /*启用*/)}
                        </Button>
                        <Button
                          onClick={() => this.handleBatch('disabled')}
                          disabled={!hasSelected}
                        >
                          {messages('common.disabled' /*禁用*/)}
                        </Button>
                        <div
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px 4px 20px',
                            border: '1px solid #91d5ff',
                            backgroundColor: '#e6f7ff',
                            borderRadius: 4,
                          }}
                        >
                          <Icon type="info-circle" style={{ color: '#1890ff' }}/>
                          <span>
                            &nbsp;{messages('common.total.selected2', {
                            total: selectedRowKeys.length,
                          })}
                          </span>
                        </div>
                      </div>
                    )}
                    <Search
                      placeholder={messages(
                        'value.list.search.name.code.remark', /*请输入值名称/编码/备注*/
                      )}
                      style={{ width: 300, position: 'absolute', right: 0, bottom: 0 }}
                      onChange={e => this.handleSearch(e.target.value)}
                    />
                  </div>
                </div>
                <Table
                  rowKey={record => record.id}
                  columns={typeFlag !== 'SYSTEM' ? columnsCustom : columnsSystem}
                  dataSource={data}
                  pagination={pagination}
                  loading={tableLoading}
                  size="middle"
                  rowSelection={typeFlag !== 'SYSTEM' ? rowSelection : null}
                  bordered
                />
                <a style={{ fontSize: '14px', paddingBottom: '20px' }} onClick={this.handleBack}>
                  <Icon type="rollback" style={{ marginRight: '5px' }}/>
                  {messages('common.back')}
                </a>
                <SlideFrame
                  // 编辑值内容:新建值内容
                  title={
                    slideFrameParams.record
                      ? messages('value.list.edit.value')
                      : messages('value.list.new.value')
                  }
                  show={showSlideFrame}
                  onClose={() => this.showSlide(false)}
                >
                  <NewValue close={this.handleCloseSlide} params={slideFrameParams}/>
                </SlideFrame>
              </div>
            )}
          </div>
        )}
        <ImporterNew visible={showImportFrame}
                     title={messages('value.list.value.import' /*值导入*/)}
                     templateUrl={`${config.baseUrl}/api/custom/enumerations/items/template`}
                     uploadUrl={`${config.baseUrl}/api/custom/enumerations/items/import?id=${id}`}
                     errorUrl={`${config.baseUrl}/api/custom/enumerations/items/import/error/export`}
                     errorDataQueryUrl={`${config.baseUrl}/api/custom/enumerations/items/import/query/result`}
                     deleteDataUrl={`${config.baseUrl}/api/custom/enumerations/items/import/delete`}
                     fileName={messages('value.list.value.import' /*值导入*/)}
                     onOk={this.handleImportOk}
                     afterClose={() => this.showImport(false)}/>
        {/* 导出 */}
        <ExcelExporter
          visible={excelVisible}
          onOk={this.export}
          columns={exportColumns}
          canCheckVersion={false}
          fileName={'值列表'}
          onCancel={this.onExportCancel}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    tenantMode: true,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true },
)(ValueList);
