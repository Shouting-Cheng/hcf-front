import React from 'react';
import { connect } from 'dva';
import config from 'config';
import { Badge, Button, Popover, message, Table, Row, Col, Input } from 'antd';
import { routerRedux } from 'dva/router';
import httpFetch from 'share/httpFetch';
import AcpRequestTypeDetail from './new-acp-request-type';
import SlideFrame from 'widget/slide-frame';
import SearchArea from 'widget/search-area';
import baseService from 'share/base.service';
import CustomTable from 'widget/custom-table';
const Search = Input.Search;

class AcpRequestType extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      page: 0,
      pageSize: 10,
      columns: [
        {
          title: '账套',
          dataIndex: 'setOfBooksName',
          width: '20%',
          align: "center",
          render: (value, record) => {
            return (
              <span>
                <Popover content={`${record.setOfBooksCode}-${record.setOfBooksName}`}>
                  {record ? `${record.setOfBooksCode}-${record.setOfBooksName}` : '-'}
                </Popover>
              </span>
            );
          },
        },
        {
          title: '付款申请单类型代码',
          dataIndex: 'acpReqTypeCode',
          width: '20%',
          align: "center",
          render: recode => (
            <span>
              <Popover content={recode}>{recode ? recode : '-'}</Popover>
            </span>
          ),
        },
        {
          title: '付款申请单类型名称',
          dataIndex: 'description',
          width: '20%',
          align: "center",
          render: description => (
            <Popover content={description}>{description ? description : '-'}</Popover>
          ),
        },

        {
          title: '关联表单类型',
          dataIndex: 'formName',
          width: '20%',
          align: "center",
          render: recode => (
            <span>
              <Popover content={recode}>{recode ? recode : '-'}</Popover>
            </span>
          ),
        },
        {
          title: '状态',
          dataIndex: 'enabled',
          width: '15%',
          align: "center",
          render: isEnabled => (
            <Badge status={isEnabled ? 'success' : 'error'} text={isEnabled ? '启用' : '禁用'} />
          ),
        },
        {
          title: '操作',
          key: 'operation',
          width: '15%',
          align: "center",
          render: (text, record) => (
            <span>
              <a onClick={e => this.editItem(e, record)}>编辑</a>
              <span className="ant-divider" />
              <a onClick={() => this.handleDistribute(record)}>公司分配</a>
            </span>
          ),
        }, //操作
      ],
      pagination: { total: 0 },
      searchForm: [
        {
          type: 'select',
          id: 'setOfBooksId',
          label: '账套',
          options: [],
          labelKey: 'name',
          valueKey: 'id',
          isRequired: true,
          event: 'SETOFBOOKID',
          defaultValue: this.props.company.setOfBooksId,
          colSpan: '6',
        }, //账套
        { type: 'input', id: 'acpReqTypeCode', label: '付款申请单类型代码', colSpan: '6' },
        { type: 'input', id: 'description', label: '付款申请单类型名称', colSpan: '6' },
      ],
      searchParams: {
        setOfBooksId: this.props.company.setOfBooksId,
        acpReqTypeCode: '',
        description: '',
      },
      showSlideFrame: false,
      slideParams: {},
      companyDistribution:
        '/document-type-manage/payment-requisition/acp-request-type/distribution-company/:setOfBooksId/:id', //公司分配
    };
  }
  editItem = (e, record) => {
    let slideParams = this.state.slideParams;
    slideParams.record = record;
    this.setState({ slideParams }, () => {
      this.showSlide(true);
    });
  };

  //分配公司
  handleDistribute = record => {
    this.props.dispatch(
      routerRedux.push({
        pathname: this.state.companyDistribution
          .replace(':setOfBooksId', record.setOfBooksId)
          .replace(':id', record.id),
      })
    );
  };

  onChangePaper = page => {
    if (page - 1 !== this.state.page) {
      this.setState({ page: page - 1 }, () => {
        this.getList();
      });
    }
  };
  componentWillMount() {
    this.getList();
    this.getSetOfBookList();
  }

  //获取账套列表
  getSetOfBookList = () => {
    baseService.getSetOfBooksByTenant().then(res => {
      let list = [];
      res.data.map(item => {
        list.push({ value: item.id, label: `${item.setOfBooksCode}-${item.setOfBooksName}` });
      });
      let form = this.state.searchForm;

      form[0].options = list;

      this.setState({ searchForm: form });
    });
  };

  //得到列表数据
  getList = () => {
    const { searchParams, page, pageSize } = this.state;

    this.setState({ loading: true });
    let url = `${config.payUrl}/api/acp/request/type/query?page=${page}&size=${pageSize}`;
    for (let paramsName in searchParams) {
      url += searchParams[paramsName] ? `&${paramsName}=${searchParams[paramsName]}` : '';
    }
    return httpFetch.get(url).then(response => {
      this.setState({
        data: response.data,
        loading: false,
        pagination: {
          total: Number(response.headers['x-total-count'])
            ? Number(response.headers['x-total-count'])
            : 0,
          current: page + 1,
          onChange: this.onChangePaper,
          onShowSizeChange: this.onShowSizeChange,
          pageSize: pageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: () =>
            this.$t(
              { id: 'common.total' },
              {
                total: Number(response.headers['x-total-count'])
                  ? Number(response.headers['x-total-count'])
                  : 0,
              } /*共搜索到*/
            ),
        },
      });
    });
  };

  search = result => {
    this.setState(
      {
        searchParams: {
          setOfBooksId: result.setOfBooksId ? result.setOfBooksId : this.props.company.setOfBooksId,
          acpReqTypeCode: result.acpReqTypeCode ? result.acpReqTypeCode : '',
          description: result.description ? result.description : '',
        },
      },
      () => {
        //this.getList();
        this.refs.table.search(this.state.searchParams);
      }
    );
  };

  clear = () => {
    this.setState({
      searchParams: {
        setOfBooksId: '',
        acpReqTypeCode: '',
        description: '',
      },
    });
  };
  showSlide = flag => {
    this.setState({ showSlideFrame: flag }, () => {
      !flag && this.refs.table.search(this.state.searchParams);
    });
  };
  searchEventHandle = (event, value) => {
    if (event == 'SETOFBOOKID') {
      value = value ? value : '';
      this.setState(
        { searchParams: { setOfBooksId: value }, slideParams: { setOfBooksId: value } },
        () => {
          if (value) {
            this.refs.table.search(this.state.searchParams);
          }
        }
      );
    }
  };

  handleNew = () => {
    let slideParams = this.state.slideParams;
    this.setState(
      {
        slideParams: {
          setOfBooksId: slideParams.setOfBooksId
            ? slideParams.setOfBooksId
            : this.props.company.setOfBooksId,
        },
      },
      () => {
        this.showSlide(true);
      }
    );
  };

  afterClose = flag => {
    this.setState(
      {
        showSlideFrame: false,
      },
      () => {
        flag && this.refs.table.search(this.state.searchParams);
      }
    );
  };
  onShowSizeChange = (current, pageSize) => {
    this.setState(
      {
        page: current - 1,
        pageSize,
      },
      () => {
        this.getList();
      }
    );
  };
  // //根据账套进行查询
  // onDocumentSearch=(value)=>{
  //   this.setState({searchParams:{setOfBooksName:value}},()=>{
  //     this.getList()
  //   })
  // }
  render() {
    const {
      columns,
      data,
      loading,
      searchForm,
      showSlideFrame,
      slideParams,
      pagination,
      searchParams,
    } = this.state;
    return (
      <div className="budget-organization">
        {/* <h3 className="header-title">付款申请单类型定义</h3> */}
        <SearchArea
          searchForm={searchForm}
          submitHandle={this.search}
          clearHandle={this.clear}
          eventHandle={this.searchEventHandle}
          maxLength={4}
        />
        <div className="divider" />
        <div className="table-header">
          {/* <div className="table-header-title">{`共搜索到 ${pagination.total} 条数据`}</div> */}
          <Row>
            <Col span={18}>
              <div className="table-header-buttons">
                <Button type="primary" onClick={this.handleNew}>
                  {this.$t({ id: 'common.create' })}
                </Button>{' '}
                {/* 新建 */}
              </div>
            </Col>
            {/* <Col span={6}>
                <Search
                 placeholder="请输入账套"
                 onSearch={this.onDocumentSearch}
                 enterButton
                />
            </Col> */}
          </Row>
        </div>
        <CustomTable
          columns={columns}
          ref="table"
          url={`${config.payUrl}/api/acp/request/type/query`}
          params={searchParams}
        />
        <SlideFrame
          title={slideParams.record ? '编辑付款申请单类型' : '新建付款申请单类型'}
          show={showSlideFrame}
          afterClose={this.afterClose}
          onClose={() => this.showSlide(false)}
          params={{ editFlag: showSlideFrame, record: slideParams }}
        >
          <AcpRequestTypeDetail
            onClose={e => this.showSlide(e)}
            params={{ editFlag: showSlideFrame, record: slideParams }}
          />
        </SlideFrame>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    company: state.user.company,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(AcpRequestType);
