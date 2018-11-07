/**
 * created by jsq on 2017/12/25
 */
import React from 'react';
import { connect } from 'dva';
import { Button, Table, Icon, Badge, Popover } from 'antd';
import SlideFrame from 'widget/slide-frame';
import NewUpdateSection from 'containers/financial-accounting-setting/section-structure/new-update-section';
import SectionMappingSet from 'containers/financial-accounting-setting/section-structure/section-mapping-set';
import SearchArea from 'widget/search-area';
import accountingService from 'containers/financial-accounting-setting/section-structure/section-structure.service';
import { routerRedux } from 'dva/router';

class SectionSetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      mapVisible: false,
      data: [],
      record: {},
      lov: {
        visible: false,
      },
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      searchParams: {
        segmentSetId: this.props.match.params.id,
      },
      searchForm: [
        {
          //科目段代码
          type: 'input',
          id: 'segmentCode',
          label: this.$t({ id: 'section.code' }),
        },
        {
          //科目段名称
          type: 'input',
          id: 'segmentName',
          label: this.$t({ id: 'section.name' }),
        },
        {
          //科目段字段代码
          type: 'input',
          id: 'segmentField',
          label: this.$t({ id: 'section.field.code' }),
        },
      ],
      columns: [
        {
          /*科目段代码*/
          title: this.$t({ id: 'section.code' }),
          key: 'segmentCode',
          dataIndex: 'segmentCode',
        },
        {
          /*科目段名称*/
          title: this.$t({ id: 'section.name' }),
          key: 'segmentName',
          dataIndex: 'segmentName',
          render: description => (
            <span>
              {description ? <Popover content={description}>{description} </Popover> : '-'}{' '}
            </span>
          ),
        },
        {
          /*科目段字段代码*/
          title: this.$t({ id: 'section.field.code' }),
          key: 'segmentField',
          dataIndex: 'segmentField',
        },
        {
          /*科目段字段名称*/
          title: this.$t({ id: 'section.field.name' }),
          key: 'segmentFieldName',
          dataIndex: 'segmentFieldName',
          render: description => (
            <span>
              {description ? <Popover content={description}>{description} </Popover> : '-'}{' '}
            </span>
          ),
        },
        {
          /*状态*/
          title: this.$t({ id: 'common.column.status' }),
          key: 'enabled',
          dataIndex: 'enabled',
          render: enabled => (
            <Badge
              status={enabled ? 'success' : 'error'}
              text={
                enabled
                  ? this.$t({ id: 'common.status.enable' })
                  : this.$t({ id: 'common.status.disable' })
              }
            />
          ),
        },

        {
          /*操作*/
          title: this.$t({ id: 'common.operation' }),
          key: 'operate',
          dataIndex: 'operate',
          render: (text, record, index) => (
            <span>
              <a onClick={e => this.handleUpdate(e, record, index)}>
                {this.$t({ id: 'common.edit' })}
              </a>
              <span className="ant-divider" />
              <a onClick={e => this.handleLinkMapping(e, record, index)}>
                {this.$t({ id: 'section.mapping.setting' })}
              </a>
            </span>
          ),
        },
      ],
    };
  }

  handleLinkMapping = (e, record, index) => {
    this.setState({
      mapVisible: true,
      record,
    });
  };

  componentWillMount() {
    this.getList();
  }

  getList() {
    this.setState({ loading: true });
    let params = this.state.searchParams;
    for (let paramName in params) {
      !params[paramName] && delete params[paramName];
    }
    params.page = this.state.pagination.page;
    params.size = this.state.pagination.pageSize;
    accountingService.getSectionSettingsByOptions(params).then(response => {
      response.data.map(item => {
        item.key = item.id;
      });
      let pagination = this.state.pagination;
      pagination.total = Number(response.headers['x-total-count']);
      this.setState({
        loading: false,
        data: response.data,
        pagination,
      });
    });
  }

  handleSearch = values => {
    let searchParams = this.state.searchParams;
    for (let paramName in values) {
      searchParams[paramName] = values[paramName];
    }
    this.setState(
      {
        searchParams,
      },
      this.getList
    );
  };

  handleCreate = () => {
    let lov = {
      title: this.$t({ id: 'section.new' }),
      visible: true,
      params: { segmentSetId: this.props.match.params.id },
    };
    this.setState({
      lov,
      mapVisible: false,
    });
  };

  handleUpdate = (e, record, index) => {
    let lov = {
      title: this.$t({ id: 'section.update' }),
      visible: true,
      params: { record },
    };
    this.setState({
      lov,
      mapVisible: false,
    });
  };

  handleAfterClose = params => {
    this.setState({
      lov: {
        visible: false,
      },
    });
    if (params) {
      this.setState({ loading: true }, this.getList());
    }
  };

  handleShowSlide = () => {
    this.setState({
      lov: {
        visible: false,
      },
    });
  };

  handleBack = () => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/financial-accounting-setting/section-structure',
        //.replace(":setOfBooksId",this.props.match.params.setOfBooksId)
      })
    );
  };

  handleCloseMap = params => {
    this.setState({
      record: {},
      mapVisible: false,
    });
  };

  render() {
    const { loading, data, columns, searchForm, pagination, lov, mapVisible, record } = this.state;
    return (
      <div className="section-setting" style={{paddingBottom: 20}}>
        <SearchArea
          searchForm={searchForm}
          submitHandle={this.handleSearch}
          clearHandle={() => {}}
        />
        <div className="table-header">
          <div className="table-header-title">
            {this.$t({ id: 'common.total' }, { total: `${pagination.total}` })}
          </div>{' '}
          {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleCreate}>
              {this.$t({ id: 'common.create' })}
            </Button>{' '}
            {/*新 建*/}
          </div>
        </div>
        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          pagination={pagination}
          bordered
          size="middle"
        />
        <a style={{ fontSize: '14px', paddingBottom: '20px' }} onClick={this.handleBack}>
          <Icon type="rollback" style={{ marginRight: '5px' }} />
          {this.$t({ id: 'common.back' })}
        </a>
        <SlideFrame
          title={lov.title}
          show={lov.visible}
          onClose={() => this.handleShowSlide(false)}
        >
          <NewUpdateSection onClose={this.handleAfterClose} params={lov.params} />
        </SlideFrame>
        <SlideFrame
          title={this.$t({ id: 'section.mapping' })}
          show={mapVisible}
          onClose={() => this.setState({ mapVisible: false })}
        >
          <SectionMappingSet onClose={this.handleCloseMap} params={record} />
        </SlideFrame>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(SectionSetting);
