/**
 * created by jsq on 2017/12/26
 */
import React from 'react';
import { connect } from 'dva';
import { Button, Input, Select, Form, Table, notification, Popconfirm, message } from 'antd';
import accountingService from 'containers/financial-accounting-setting/section-structure/section-structure.service';
import config from 'config';
import 'styles/financial-accounting-setting/section-structure/section-mapping-set.scss';
import debounce from 'lodash.debounce';
import Importer from 'widget/Template/importer';
import FileSaver from 'file-saver';
const FormItem = Form.Item;
const Option = Select.Option;
const Search = Input.Search;

class SectionMappingSet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      isSave: true,
      isDelete: true,
      btnLoading: false,
      paramsKey: 0,
      selectedRowKeys: [],
      showImportFrame: false,
      searchParams: {
        segmentId: this.props.params.id,
        valueCode: '',
      },
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      columns: [
        {
          /*科目段值代码*/
          title: this.$t({ id: 'section.value.code' }),
          key: 'segmentValueCode',
          dataIndex: 'segmentValueCode',
          render: (text, record, index) =>
            this.renderColumns(text, record, index, 'segmentValueCode'),
        },
        {
          /*总账科目段值代码*/
          title: this.$t({ id: 'section.value.code.total' }),
          key: 'glSegmentValueCode',
          dataIndex: 'glSegmentValueCode',
          render: (text, record, index) =>
            this.renderColumns(text, record, index, 'glSegmentValueCode'),
        },
        {
          title: this.$t({ id: 'common.operation' }),
          key: 'operation',
          width: '15%',
          render: (text, record, index) => (
            <span>
              <a
                href="#"
                onClick={
                  record.edit
                    ? e => this.saveItem(e, record, index)
                    : e => this.operateItem(e, record, index, true)
                }
              >
                {this.$t({ id: record.edit ? 'common.save' : 'common.edit' })}
              </a>
              {record.edit ? (
                <a
                  href="#"
                  style={{ marginLeft: 12 }}
                  onClick={e => this.operateItem(e, record, index, false)}
                >
                  {this.$t({ id: 'common.cancel' })}
                </a>
              ) : (
                <Popconfirm
                  onConfirm={e => this.deleteItem(e, record, index)}
                  title={this.$t(
                    { id: 'budget.are.you.sure.to.delete.rule' },
                    { controlRule: record.controlRuleName }
                  )}
                >
                  {/* 你确定要删除organizationName吗 */}
                  <a href="#" style={{ marginLeft: 12 }}>
                    {this.$t({ id: 'common.delete' })}
                  </a>
                </Popconfirm>
              )}
            </span>
          ),
        },
      ],
      selectedEntityOIDs: [], //已选择的列表项的OIDs
    };
    this.handleParam = debounce(this.handleParam, 1000);
  }

  //删除
  deleteItem = (e, record, index) => {
    this.setState({ loading: true });
    e.preventDefault();
    e.stopPropagation();
    let param = [record.id];
    let selectedRowKeys = this.state.selectedRowKeys;
    accountingService
      .deleteSectionMap(param)
      .then(response => {
        this.getList();
        message.success(`${this.$t({ id: 'common.operate.success' })}`);
      })
      .catch(e => {
        if (e.response) {
          message.error(`${this.$t({ id: 'common.operate.filed' })},${e.response.data.message}`);
        }
      });
  };

  //保存
  saveItem = (e, record, index) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      typeof record.segmentValueCode !== 'undefined' &&
      record.glSegmentValueName !== 'undefined'
    ) {
      record.segmentId = this.props.params.id;
      accountingService
        .addOrUpdateSectionMapping([record])
        .then(response => {
          message.success(`${this.$t({ id: 'common.save.success' }, { name: '' })}`);
          this.setState(
            {
              loading: true,
              isSave: true,
            },
            this.getList()
          );
        })
        .catch(e => {
          if (e.response) {
            message.error(
              `${this.$t({ id: 'common.save.filed' })}, ${
                !!e.response.data.message ? e.response.data.message : e.response.data.errorCode
              }`
            );
          }
        });
    } else {
      if (typeof record.id === 'undefined') {
        let data = this.state.data;
        data.delete(data[index]);
        let isSave = true;
        data.map(item => {
          if (item.edit) isSave = false;
        });
        this.setState({
          data,
          isSave,
        });
        return;
      }
    }
  };

  operateItem = (e, record, index, flag) => {
    e.preventDefault();
    e.stopPropagation();
    let data = this.state.data;
    if (!flag) {
      if (typeof record.id === 'undefined') {
        data.delete(data[index]);
        let isSave = true;
        data.map(item => {
          if (item.edit) isSave = false;
        });
        this.setState({
          data,
          isSave,
        });
        return;
      }
    }
    data[index].edit = flag;
    this.setState({
      data,
      isSave: !flag,
    });
  };

  handValueChange = (e, index, flag) => {
    let data = this.state.data;
    data[index][flag] = e.target.value;
    if (
      typeof data[index].glSegmentValueCode !== 'undefined' &&
      typeof data[index].glSegmentValueCode !== 'undefined'
    ) {
      data[index].edit = true;
    }
    this.setState({ data });
  };

  renderColumns = (decode, record, index, flag) => {
    const { paramValueMap, sourceType } = this.state;
    if (record.edit) {
      return (
        <Input
          onBlur={e => this.handValueChange(e, index, flag)}
          defaultValue={decode}
          placeholder={this.$t({ id: 'common.please.enter' })}
        />
      );
    } else return decode;
  };

  componentWillMount() {
    let searchParams = { segmentId: this.props.params.id };
    this.setState({ searchParams }, this.getList);
  }

  getList() {
    if (typeof this.props.params.id !== 'undefined') {
      this.setState({ loading: true });
      let params = this.state.searchParams;
      for (let paramsName in params) {
        !params[paramsName] && delete params[paramsName];
      }
      params.page = this.state.pagination.page;
      params.size = this.state.pagination.pageSize;
      let data = [];
      accountingService.getSectionMapSet(params).then(response => {
        response.data.map(item => {
          item.key = item.id;
          this.state.selectedRowKeys.map(i => {
            if (item.id === i) {
              data.push(i);
            }
          });
        });
        let pagination = this.state.pagination;
        pagination.total = Number(response.headers['x-total-count']);
        this.setState({
          selectedRowKeys: data,
          loading: false,
          data: response.data,
          pagination,
        });
      });
    }
  }

  handleSearch = e => {
    this.handleParam(e.target.value);
  };

  handleParam = value => {
    let searchParams = this.state.searchParams;
    searchParams.valueCode = value;
    this.setState(
      {
        searchParams,
      },
      this.getList()
    );
  };

  //分页点击
  onChangePager = (pagination, filters, sorter) => {
    let temp = this.state.pagination;
    temp.page = pagination.current - 1;
    temp.current = pagination.current;
    temp.pageSize = pagination.pageSize;
    this.setState(
      {
        loading: true,
        pagination: temp,
      },
      this.getList
    );
  };

  //列表选择更改
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  //选择一行
  //选择逻辑：每一项设置selected属性，如果为true则为选中
  //同时维护selectedEntityOIDs列表，记录已选择的OID，并每次分页、选择的时候根据该列表来刷新选择项
  onSelectRow = (record, selected) => {
    let temp = this.state.selectedEntityOIDs;
    if (selected) temp.push(record.id);
    else temp.delete(record.id);
    this.setState({
      selectedEntityOIDs: temp,
      isSave: temp.length > 0 ? false : true,
      isDelete: temp.length > 0 ? false : true,
    });
  };

  //全选
  onSelectAllRow = selected => {
    let temp = this.state.selectedEntityOIDs;
    if (selected) {
      this.state.data.map(item => {
        temp.addIfNotExist(item.id);
      });
    } else {
      this.state.data.map(item => {
        temp.delete(item.id);
      });
    }
    this.setState({
      selectedEntityOIDs: temp,
      isSave: temp.length > 0 ? false : true,
      isDelete: temp.length > 0 ? false : true,
    });
  };

  //换页后根据OIDs刷新选择框
  refreshRowSelection() {
    let selectedRowKeys = [];
    this.state.selectedEntityOIDs.map(selectedEntityOID => {
      this.state.data.map((item, index) => {
        if (item.id === selectedEntityOID) selectedRowKeys.push(index);
      });
    });
    this.setState({ selectedRowKeys });
  }

  //清空选择框
  clearRowSelection() {
    this.setState({ selectedEntityOIDs: [], selectedRowKeys: [] });
  }

  handleAdd = () => {
    let { data, paramsKey } = this.state;
    if (data.length === 0 || data[0].sectionValueCode !== '') {
      let newParams = {
        segmentValueCode: '',
        glSegmentValueCode: '',
        key: paramsKey++,
        edit: true,
      };
      let array = [];
      array.push(newParams);
      let newArray = array.concat(data);
      this.setState({ data: newArray, paramsKey });
    } else {
      notification.warning({
        message: `${this.$t({ id: 'section.notification.mapping' })}`,
        duration: 3,
      });
    }
  };

  onCancel = () => {
    this.props.onClose(false);
  };

  showImport = flag => {
    this.setState({ showImportFrame: flag });
  };

  //导入成功回调
  handleImportOk = () => {
    this.showImport(false);
    this.getList();
  };

  //导出
  handleDownLoad = () => {
    let params = {
      segmentId: this.props.params.id,
    };
    let hide = message.loading(this.$t({ id: 'importer.spanned.file' } /*正在生成文件..*/));
    accountingService
      .downLoadMapping(params)
      .then(response => {
        let b = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        let name = this.$t({ id: 'section.mapping.export.fileName' });
        FileSaver.saveAs(b, `${name}.xlsx`);
        hide();
      })
      .catch(() => {
        message.error(this.$t({ id: 'importer.download.error.info' } /*下载失败，请重试*/));
        hide();
      });
  };

  handleDelete = () => {
    accountingService
      .deleteSectionMap(this.state.selectedEntityOIDs)
      .then(response => {
        message.success(`${this.$t({ id: 'common.operate.success' })}`);
        this.getList();
      })
      .catch(e => {
        if (e.response) {
          message.error(`${this.$t({ id: 'common.operate.filed' })},${e.response.data.message}`);
        }
      });
  };

  handleSave = () => {
    this.setState({ loading: true });
    let data = this.state.data;
    let params = [];
    data.map(item => {
      if (item.edit) {
        item.segmentId = this.props.params.id;
        item.edit = false;
        params.push(item);
      }
    });

    if (params.length > 0) {
      accountingService
        .addOrUpdateSectionMapping(params)
        .then(response => {
          message.success(`${this.$t({ id: 'common.save.success' }, { name: '' })}`);
          this.setState({ loading: false });
          this.props.close(true);
        })
        .catch(e => {
          if (e.response) {
            message.error(`${this.$t({ id: 'common.operate.filed' })},${e.response.data.message}`);
            this.setState({ loading: false });
          }
        });
    } else this.props.close(false);
  };

  render() {
    const {
      loading,
      data,
      columns,
      pagination,
      selectedRowKeys,
      showImportFrame,
      isSave,
      isDelete,
    } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      onSelect: this.onSelectRow,
      onSelectAll: this.onSelectAllRow,
    };
    return (
      <div className="section-mapping-set">
        <div className="table-header">
          <div className="table-header-title">
            {this.$t({ id: 'common.total' }, { total: `${pagination.total}` }) +
              ' / ' +
              this.$t({ id: 'section.selected' }, { selected: selectedRowKeys.length })}
          </div>{' '}
          {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleAdd}>
              {this.$t({ id: 'common.add' })}
            </Button>{' '}
            {/*添加*/}
            <Button onClick={() => this.showImport(true)}>
              {this.$t({ id: 'importer.import' })}
            </Button>{' '}
            {/*导入*/}
            <Importer
              visible={showImportFrame}
              title={this.$t({ id: 'section.mapping.set.import' })}
              templateUrl={`${config.accountingUrl}/api/general/ledger/segment/map/export/template`}
              uploadUrl={`${config.accountingUrl}/api/general/ledger/segment/map/import?segmentId=${
                this.props.params.id
              }`}
              errorUrl={`${config.accountingUrl}/api/general/ledger/segment/map/export/failed/data`}
              listenUrl={`${config.accountingUrl}/api/general/ledger/batch/transaction/logs`}
              fileName={this.$t({ id: 'section.mapping.import.fileName' })}
              onOk={this.handleImportOk}
              afterClose={() => this.showImport(false)}
            />
            <Button onClick={this.handleDownLoad}>{this.$t({ id: 'importer.importOut' })}</Button>{' '}
            {/*导出*/}
            <Popconfirm
              onConfirm={this.handleDelete}
              title={this.$t({ id: 'budget.are.you.sure.to.delete.rule' })}
            >
              <Button disabled={isDelete}>{this.$t({ id: 'common.delete' })}</Button>
            </Popconfirm>
            <Search
              className="table-header-search"
              placeholder={this.$t({ id: 'section.mapping.set.placeholder' })}
              onChange={e => this.handleSearch(e)}
              style={{ width: 320, float: 'right' }}
            />
          </div>
        </div>
        <Table
          loading={loading}
          dataSource={data}
          rowSelection={rowSelection}
          columns={columns}
          pagination={pagination}
          onChange={this.onChangePager}
          bordered
          size="middle"
        />
        <div className="slide-footer">
          <Button
            type="primary"
            disabled={isSave}
            onClick={this.handleSave}
            loading={this.state.btnLoading}
          >
            {this.$t({ id: 'common.save' })}
          </Button>
          <Button onClick={this.onCancel}>{this.$t({ id: 'common.cancel' })}</Button>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    company: state.user.company,
  };
}

const WrappedSectionMappingSet = Form.create()(SectionMappingSet);
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedSectionMappingSet);
