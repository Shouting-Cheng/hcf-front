/**
 * Created by 13576 on 2018/1/14.
 */
import React from 'react';
import { connect } from 'dva';
import { Button,  Badge, Icon, Popconfirm, message, Input, Popover } from 'antd';
import Table from 'widget/table'
import SlideFrame from 'widget/slide-frame';
import NewUpDataLineModeJudgeRules from 'containers/financial-accounting-setting/accounting-source/new-updata-line-mode-data-judge-rules';
import accountingService from 'containers/financial-accounting-setting/accounting-source/accounting-source.service';
import { routerRedux } from 'dva/router';

class LineModeJudgeRules extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dataVisible: false,
      searchText: '',
      recode: {},
      filterDropdownVisible: false,
      data: [],
      lov: {
        visible: false,
        params: {
          isNew: true,
        },
      },
      journalLineModel: {},
      searchParams: [],
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0,
      },
      searchForm: [
        {
          //来源事物代码
          type: 'input',
          id: 'journalLineModelCode',
          label: this.$t({ id: 'accounting.source.code' }),
        },
        {
          //来源事物名称
          type: 'input',
          id: 'description',
          label: this.$t({ id: 'section.structure.name' }),
        },
      ],
    };
  }

  onInputChange = e => {
    this.setState({ searchText: e.target.value });
  };

  onSearch = () => {
    const { searchText } = this.state;
    this.setState(
      {
        filterDropdownVisible: false,
      },
      () => {
        this.getList(searchText);
      }
    );
  };

  componentWillMount() {
    this.getList();
    this.getLineMode();
  }

  getLineMode() {
    accountingService
      .getSourceTransactionModelSobById(this.props.match.params.lineModelId)
      .then(response => {
        this.setState({
          journalLineModel: response.data,
        });
      });
  }

  getList(searchText) {
    this.setState({
      loading: true,
    });
    let params = Object.assign({}, this.state.searchParams);
    params.sobJournalLineModelId = this.props.match.params.lineModelId;
    if (searchText) {
      params.accountElementCode = searchText;
    } else {
      params.accountElementCode = '';
    }
    for (let paramsName in params) {
      !params[paramsName] && delete params[paramsName];
    }
    params.page = this.state.page;
    params.size = this.state.pageSize;
    accountingService
      .getSourceLineModelJudgeRules(params)
      .then(response => {
        response.data.map((item, index) => {
          item.key = item.id;
        });
        this.setState({
          data: response.data,
          loading: false,
          pagination: {
            total: Number(response.headers['x-total-count']),
            onChange: this.onChangePager,
            pageSize: this.state.pageSize,
            current: this.state.page + 1,
          },
        });
      })
      .catch(e => {
        message.error(`${e.response.data.message}`);
      });
  }

  handleSearch = params => { };

  handleCreate = () => {
    let time = new Date().valueOf();
    let lov = {
      title: this.$t({ id: 'accounting.source.newJudgeRules' }),
      visible: true,
      params: {
        isNew: true,
        time: time,
        sourceTransactionId: this.props.match.params.id,
        lineModelId: this.props.match.params.lineModelId,
        glSceneId: this.state.journalLineModel.glSceneId,
        journalLineModel: this.state.journalLineModel,
      },
    };
    this.setState({
      lov,
    });
  };

  handleUpdate = (e, record, index) => {
    let time = new Date().valueOf();
    let params = {
      record: record,
      isNew: false,
      sourceTransactionId: this.props.match.params.id,
      lineModelId: this.props.match.params.lineModelId,
      glSceneId: this.state.journalLineModel.glSceneId,
      journalLineModel: this.state.journalLineModel,
      time: time,
    };
    let lov = {
      title: this.$t({ id: 'accounting.source.editJudgeRules' }),
      visible: true,
      params: params,
    };
    this.setState({
      lov,
    });
  };

  handleAfterClose = value => {
    this.setState(
      {
        lov: {
          visible: false,
        },
      },
      () => {
        if (value) {
          this.getList();
        }
      }
    );
  };

  handleShowSlide = () => {
    this.setState({
      lov: {
        visible: false,
      },
    });
  };

  //分页点击
  onChangePager = page => {
    if (page - 1 !== this.state.page)
      this.setState(
        {
          page: page - 1,
          loading: true,
        },
        () => {
          this.getList();
        }
      );
  };

  handleBack = () => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/financial-accounting-setting/accounting-source/voucher-template-sob/:id'.replace(
          ':id',
          this.props.match.params.id
        ),
      })
    );
  };

  //取消添加凭证模板
  handleCancel = () => {
    this.setState({ showListSelector: false });
  };

  render() {
    const { loading, data, pagination, lov, journalLineModel } = this.state;
    const columns = [
      {
        /*优先级*/
        title: this.$t({ id: 'accounting.source.sequence' }),
        key: 'sequence',
        dataIndex: 'sequence',
        width: '8%',
      },
      {
        /*逻辑操作*/
        title: this.$t({ id: 'accounting.source.andOr' }),
        key: 'andOr',
        dataIndex: 'andOr',
        width: '10%',
      },
      {
        /*左括号*/
        title: this.$t({ id: 'accounting.source.leftBracket' }),
        key: 'leftBracket',
        dataIndex: 'leftBracket',
        width: '8%',
        render: recode => (
          <Popover content={recode}>
            <a>{recode}</a>
          </Popover>
        ),
      },
      {
        /*核算要素*/
        title: this.$t({ id: 'accounting.source.accountElementCode' }),
        key: 'accountElementCode',
        dataIndex: 'accountElementCode',
        width: '17%',
        filterDropdown: (
          <div className="custom-filter-dropdown">
            <Input
              ref={ele => (this.searchInput = ele)}
              placeholder={this.$t({ id: 'accounting.source.accountElementCode' })}
              value={this.state.searchText}
              onChange={this.onInputChange}
              onPressEnter={this.onSearch}
            />
            <Button type="primary" onClick={this.onSearch}>
              Search
            </Button>
          </div>
        ),
        filterIcon: <Icon type="filter" />,
        filterDropdownVisible: this.state.filterDropdownVisible,
        onFilterDropdownVisibleChange: visible => {
          this.setState(
            {
              filterDropdownVisible: visible,
            },
            () => this.searchInput && this.searchInput.focus()
          );
        },
        render: recode => <Popover content={recode}>{recode}</Popover>,
      },
      {
        /*要素性质*/
        title: this.$t({ id: 'accounting.source.elementNature' }),
        key: 'elementNature',
        dataIndex: 'elementNature',
        render: recode => <Popover content={recode}>{recode}</Popover>,
      },
      {
        /*判断条件*/
        title: this.$t({ id: 'accounting.source.judgeRuleName' }),
        key: 'judgeRuleName',
        dataIndex: 'judgeRuleName',
        width: '8%',
        render: recode => <Popover content={recode}>{recode}</Popover>,
      },
      {
        /*值*/
        title: this.$t({ id: 'accounting.source.data' }),
        key: 'judgeData',
        dataIndex: 'judgeData',
        render: recode => <Popover content={recode}>{recode}</Popover>,
      },
      {
        /*右括号*/
        title: this.$t({ id: 'accounting.source.rightBracket' }),
        key: 'rightBracket',
        dataIndex: 'rightBracket',
        width: '8%',
        render: recode => (
          <Popover content={recode}>
            <a src="#">{recode}</a>
          </Popover>
        ),
      },
      {
        /*状态*/
        title: this.$t({ id: 'common.column.status' }),
        key: 'status',
        width: '8%',
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
        title: this.$t({ id: 'common.operation' }),
        key: 'operation',
        width: '5%',
        render: (text, record, index) => (
          <span>
            <a onClick={e => this.handleUpdate(e, record, index)}>
              {this.$t({ id: 'common.edit' })}
            </a>
          </span>
        ),
      },
    ];
    return (
      <div className="voucher-template" style={{ paddingBottom: 20 }}>
        <h3>
          <span style={{ marginLeft: '16px', size: '16px' }}>
            {this.$t({ id: 'accounting.source.source' })}:{journalLineModel.sourceTransactionName}
          </span>
          <span style={{ marginLeft: '16px', size: '16px' }}>
            {this.$t({ id: 'accounting.source.mode' })}:{journalLineModel.journalLineModelCode}
          </span>
          <span style={{ marginLeft: '16px', size: '16px' }}>
            {this.$t({ id: 'accounting.source.scenarios' })}:{journalLineModel.glSceneName}
          </span>
        </h3>

        <div className="table-header">
          <div className="table-header-title">
            {this.$t({ id: 'common.total' }, { total: `${pagination.total}` })}
          </div>
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
          rowKey={record => record.id}
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
          <NewUpDataLineModeJudgeRules onClose={this.handleAfterClose} params={lov.params} />
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
)(LineModeJudgeRules);
