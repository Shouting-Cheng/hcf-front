import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import config from 'config';
import { Table, Button, message, Badge, Divider } from 'antd';
import SearchArea from 'components/Widget/search-area';
import baseService from 'share/base.service';
import NewGLWorkOrderType from 'containers/gl-work-order/gl-work-order-type/new-gl-work-order-type';
import SlideFrame from 'components/Widget/slide-frame';
import glWorkOrderTypeService from './gl-work-order-type.service';
import Operation from 'antd/lib/transfer/operation';
class GLWorkOrderType extends Component {
  /**
   * 构造函数
   */
  constructor(props) {
    super(props);
    this.state = {
      setOfBooksId: this.props.company.setOfBooksId,
      searchForm: [
        {
          type: 'select',
          id: 'setOfBooksId',
          colSpan: 6,
          label: '账套',
          options: [],
          labelKey: 'name',
          valueKey: 'id',
          isRequired: 'true',
          event: 'SETOFBOOKSID',
          defaultValue: this.props.company.setOfBooksId,
        },
        {
          type: 'input',
          id: 'workOrderTypeCode',
          colSpan: '6',
          label: '核算工单类型代码',
        },
        {
          type: 'input',
          id: 'workOrderTypeName',
          colSpan: '6',
          label: '核算工单类型名称',
        },
        {
          type: 'select',
          id: 'enabled',
          colSpan: '6',
          label: '状态',
          options: [{ value: true, label: '启用' }, { value: false, label: '禁用' }],
          labelKey: 'label',
          valueKey: 'value',
        },
      ],
      columns: [
        {
          title: '账套',
          dataIndex: 'setOfBooksName',
          align: 'center',
          render: (setOfBooksName, record) => {
            return (
              <span>
                {record.setOfBooksCode}-{record.setOfBooksName}
              </span>
            );
          },
        },
        { title: '核算工单类型代码', dataIndex: 'workOrderTypeCode', align: 'center' },
        { title: '核算工单类型名称', dataIndex: 'workOrderTypeName', align: 'center' },
        { title: '关联表单类型', dataIndex: 'formName', align: 'center' },
        {
          title: '状态',
          dataIndex: 'enabled',
          align: 'center',
          render: (enabled, record, index) => {
            return (
              <Badge status={enabled ? 'success' : 'error'} text={enabled ? '启用' : '禁用'} />
            );
          },
        },
        {
          title: '操作',
          dataIndex: 'operation',
          align: 'center',
          render: (operation, record, index) => {
            return (
              <div>
                <a onClick={e => this.onEditClick(e, record)}> 编辑</a>
                <Divider type="vertical" />
                <a onClick={e => this.onCompanyClick(e, record)}>分配公司</a>
              </div>
            );
          },
        },
      ],
      data: [],
      loading: true,
      pagination: {
        total: 0,
        showQuickJumper: true,
        showSizeChanger: true,
      },
      page: 0,
      pageSize: 10,
      searchParams: {},
      /**
       * 侧滑页面
       */
      showSlideFrame: false,
      glWorkOrderTypeList: {},
      typeTitle: '新建核算工单类型',
    };
  }
  /**
   * 编辑按钮
   */
  onEditClick = (e, record) => {
    e.preventDefault();
    this.setState({
      showSlideFrame: true,
      glWorkOrderTypeList: record,
      typeTitle: '编辑核算工单类型',
    });
  };
  /**
   * 分配公司
   */
  onCompanyClick = (e, record) => {
    e.preventDefault();
    //this.context.router.push(menuRoute.getRouteItem('gl-company-distribution', 'key').url.replace(':setOfBooksId', record.setOfBooksId).replace(':id', record.id));
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/document-type-manage/gl-work-order-type/company-distribution/${
          record.setOfBooksId
        }/${record.id}`,
      })
    );
  };
  /**
   * 生命周期函数，constructor之后，render之前
   */
  componentWillMount = () => {
    this.getSetOfBookList();
    this.getList();
  };
  /**
   * 获取账套列表数据
   */
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
  /**
   * 获取核算工单类型列表
   */
  getList = () => {
    let { searchParams, page, pageSize, setOfBooksId } = this.state;
    let params = {
      page: page,
      size: pageSize,
      setOfBooksId: setOfBooksId,
      workOrderTypeCode: searchParams.workOrderTypeCode ? searchParams.workOrderTypeCode : '',
      workOrderTypeName: searchParams.workOrderTypeName ? searchParams.workOrderTypeName : '',
      enabled: searchParams.enabled ? searchParams.enabled : '',
    };
    glWorkOrderTypeService
      .typeQuery(params)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            loading: false,
            data: res.data,
            pagination: {
              total: Number(
                res.headers['x-total-count'] ? Number(res.headers['x-total-count']) : 0
              ),
              onChange: this.onChangePaper,
              onShowSizeChange: this.onShowSizeChange,
              current: this.state.page + 1,
              showTotal: (total, range) =>
                this.$t(
                  { id: 'common.show.total' },
                  { range0: `${range[0]}`, range1: `${range[1]}`, total: total }
                ),
              // showTotal: total => this.$t({ id: 'common.total' }, { total: `${total}` })
            },
          });
        }
      })
      .catch(e => {
        this.setState({ loading: false });
        console.log(`获取核算工单类型失败：${e}`);
        message.error(`加载核算工单类型失败，请重试：${e.response.data.message}`);
      });
  };
  /**
   * 切换每页显示的条数
   */
  onShowSizeChange = (current, pageSize) => {
    this.setState(
      {
        loading: true,
        page: current - 1,
        pageSize,
      },
      () => {
        this.getList();
      }
    );
  };
  //分页点击
  onChangePaper = page => {
    if (page - 1 !== this.state.page)
      this.setState(
        {
          loading: true,
          page: page - 1,
        },
        () => {
          this.getList();
        }
      );
  };
  /**
   * 搜索
   */
  search = params => {
    this.setState(
      {
        loading: true,
        page: 0,
        searchParams: params,
      },
      () => {
        this.getList();
      }
    );
  };
  /**
   * 清空
   */
  clear = () => {
    this.setState(
      {
        loading: true,
        searchParams: {},
        page: 0,
        setOfBooksId: this.props.company.setOfBooksId,
      },
      () => {
        this.getList();
      }
    );
  };
  //账套切换事件
  searchEventHandle = (event, value) => {
    if (event == 'SETOFBOOKSID') {
      this.setState(
        {
          loading: true,
          setOfBooksId: value,
        },
        () => {
          this.getList();
        }
      );
    }
  };
  /**
   * 新建按钮触发的事件
   */
  handleNew = () => {
    this.setState({
      showSlideFrame: true,
      typeTitle: '新建核算工单类型',
      glWorkOrderTypeList: {},
    });
  };
  /**
   * 侧滑页面关闭的时候触发的事件
   */
  onSlideFrameClose = () => {
    this.setState(
      {
        showSlideFrame: false,
        slideParams: {},
      },
      () => {
        this.getList();
      }
    );
  };
  /**
   * 关闭侧滑页面之后
   */
  onSlideFrameAfterClose = flag => {
    this.setState({ showSlideFrame: false }, () => {
      if (flag) {
        this.setState({
          loading: true,
        });
        this.getList();
      }
    });
  };
  /**
   * 渲染函数
   */
  render() {
    //查询条件
    const { searchForm } = this.state;
    //返回列表
    const { columns, pagination, loading, data } = this.state;
    //侧滑页面
    const { showSlideFrame, setOfBooksId, glWorkOrderTypeList, typeTitle } = this.state;
    return (
      <div>
        <SearchArea
          searchForm={searchForm}
          maxLength={4}
          submitHandle={this.search}
          clearHandle={this.clear}
          eventHandle={this.searchEventHandle}
          wrappedComponentRef={inst => (this.formRef = inst)}
        />
        <div className="divider" />
        <div className="table-header">
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleNew}>
              新建
            </Button>
          </div>
        </div>
        <Table
          columns={columns}
          size="middle"
          bordered
          rowKey={record => record['id']}
          loading={loading}
          pagination={pagination}
          dataSource={data}
        />
        <SlideFrame
          content={NewGLWorkOrderType}
          title={typeTitle}
          show={showSlideFrame}
          onClose={this.onSlideFrameAfterClose}
        >
          <NewGLWorkOrderType
            onClose={this.onSlideFrameClose}
            params={{
              glWorkOrderTypeList: glWorkOrderTypeList,
              setOfBooksId: setOfBooksId,
              visibleFlag: showSlideFrame,
            }}
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
)(GLWorkOrderType);
