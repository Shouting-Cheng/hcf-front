import React from 'react'
import { connect } from 'dva'
import config from 'config'
import { Table, Badge, Button, Popover, message } from 'antd';
import httpFetch from 'share/httpFetch'
import NewPrePaymentType from './new-pre-payment-type'
import SlideFrame from 'widget/slide-frame'
import SearchArea from 'widget/search-area'
import baseService from 'share/base.service'
import PrePaymentTypeService from './pre-payment-type.service'
import { routerRedux } from 'dva/router';

class PrePaymentType extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      page: 0,
      pageSize: 10,
      setOfBookList: [],
      setOfBookId: this.props.company.setOfBooksId,
      columns: [
        {
          title: this.$t({ id: 'pre.payment.setOfBookName' }/*账套*/),
          dataIndex: 'setOfBookName', width: 180, align: 'left',
          render: (value, record) => {
            return (
              <Popover content={record.setOfBookName}><span>{record.setOfBookCode}-{record.setOfBookName}</span></Popover>
            )
          }
        },
        {
          title: this.$t({ id: 'pre.payment.typeCode' }/*预付款单类型代码*/),
          dataIndex: 'typeCode', width: 150, align: 'center',
        },
        {
          title: this.$t({ id: 'pre.payment.typeName' }/*预付款单类型名称*/),
          dataIndex: 'typeName', width: 180, align: 'left',
          render: typeName => (
            <Popover content={typeName}>
              {typeName}
            </Popover>)
        },
        {
          title: this.$t({ id: 'pre.payment.paymentMethodCategoryName' }/*付款方式类型*/),
          dataIndex: 'paymentMethodCategoryName', width: 160, align: 'center',
        },
        { title: this.$t({ id: 'pre.payment.formName' }/*关联表单类型*/), dataIndex: "formName", width: 180, align: 'center' },
        {
          title: this.$t({ id: "common.column.status" }),
          dataIndex: 'enabled', width: 100, align: 'center',
          render: enabled => (
            <Badge status={enabled ? 'success' : 'error'}
              text={enabled ? this.$t({ id: "common.status.enable" }) : this.$t({ id: "common.status.disable" })} />
          )
        }, //状态
        {
          title: this.$t({ id: "common.operation" }),
          key: 'operation', width: '15%', align: 'center',
          render: (text, record) => (
            <span>
              <a onClick={(e) => this.editItem(e, record)}>{this.$t({ id: "common.edit" })}</a>
              <span className="ant-divider" />
              <a onClick={() => this.handleDistribute(record)}>{this.$t({ id: 'pre.payment.company.distribution' }/*公司分配*/)}</a>
            </span>)
        },  //操作
      ],
      pagination: {
        total: 0,
        showQuickJumper: true,
        showSizeChanger: true
      },
      searchForm: [
        {
          type: 'select', colSpan: '6', id: 'setOfBookId', label: this.$t({ id: 'pre.payment.setOfBookName' }/*账套*/), options: [],
          labelKey: 'name', valueKey: 'id', isRequired: true, event: "SETOFBOOKID",
          defaultValue: this.props.company.setOfBooksId
        }, //账套
        { type: 'input', colSpan: '6', id: 'typeCode', label: this.$t({ id: 'pre.payment.typeCode' }/*预付款单类型代码*/) },
        { type: 'input', colSpan: '6', id: 'typeName', label: this.$t({ id: 'pre.payment.typeName' }/*预付款单类型名称*/) },
        {
          type: 'select', colSpan: '6', id: 'paymentMethodCategory', label: '付款方式类型',
          options: [{ value: 'ONLINE_PAYMENT', label: '线上' }, { value: 'OFFLINE_PAYMENT', label: '线下' }, { value: 'EBANK_PAYMENT', label: '落地文件' }],
          labelKey: 'label', valueKey: 'value'
        }
      ],
      searchParams: {
        setOfBookId: "",
        typeCode: '',
        typeName: '',
        paymentMethodCategory: ''
      },
      showSlideFrame: false,
      nowType: {}
    };
  }
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
  }
  //编辑
  editItem = (e, record) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      nowType: record,
      showSlideFrame: true
    });
  }
  //分配公司
  handleDistribute = (record) => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/document-type-manage/prepayment-type/distribution-company/${record.setOfBookId}/${record.id}`,
      })
    );
  }
  //得到列表数据
  getList() {
    this.setState({ loading: true });
    let params = this.state.searchParams;
    params.setOfBookId = this.state.setOfBookId;
    return PrePaymentTypeService.getPrePaymentType(this.state.page, this.state.pageSize, params).then((response) => {
      this.setState({
        data: response.data,
        loading: false,
        pagination: {
          total: Number(response.headers['x-total-count']) ? Number(response.headers['x-total-count']) : 0,
          onChange: this.onChangePager,
          onShowSizeChange: this.onShowSizeChange,
          current: this.state.page + 1,
          showTotal: total => this.$t({ id: "common.total" }, { total: total })
        }
      });
    });
  }
  /**
    * 切换每页显示的条数
    */
  onShowSizeChange = (current, pageSize) => {
    this.setState({
      page: current - 1,
      pageSize
    }, () => {
      this.getList();
    });
  }
  //分页点击
  onChangePager = (page) => {
    if (page - 1 !== this.state.page)
      this.setState({
        page: page - 1,
        loading: true
      }, () => {
        this.getList();
      });
  }
  search = (result) => {
    this.setState({
      page: 0,
      searchParams: {
        setOfBookId: result.setOfBookId ? result.setOfBookId : this.props.company.setOfBooksId,
        typeCode: result.typeCode ? result.typeCode : '',
        typeName: result.typeName ? result.typeName : '',
        paymentMethodCategory: result.paymentMethodCategory ? result.paymentMethodCategory : ''
      }
    }, () => {
      this.getList();
    });
  }
  clear = () => {
    this.setState({
      searchParams: {
        setOfBooksId: this.props.company.setOfBooksId,
        typeCode: '',
        typeName: '',
        paymentMethodCategory: ''
      },
      setOfBookId: this.props.company.setOfBooksId
    }, () => {
      this.getList();
    });
  }
  searchEventHandle = (event, value) => {
    if (event == "SETOFBOOKID") {
      this.setState({ setOfBookId: value }, () => {
        this.getList();
      });
    }
  }
  //新建
  handleNew = () => {
    if (!this.state.setOfBookId) {
      message.warning(this.$t({ id: 'pre.payment.new.warn' }/*新建前请选择账套*/));
      return;
    }
    this.setState({
      showSlideFrame: true,
      nowType: { setOfBookId: this.state.setOfBookId }
    });
  }
  afterClose = (flag) => {
    this.setState({ showSlideFrame: false }, () => {
      if (flag) {
        this.getList();
      }
    });
  }
  render() {
    const { columns, data, loading, pagination, searchForm, showSlideFrame, nowType } = this.state;
    return (
      <div className="budget-organization">
        <SearchArea
          maxLength={4}
          searchForm={searchForm}
          submitHandle={this.search}
          clearHandle={this.clear}
          eventHandle={this.searchEventHandle}
          wrappedComponentRef={(inst) => this.formRef = inst} />
        <div className='divider'></div>
        <div className="table-header">
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleNew}>{this.$t({ id: "common.create" })}</Button> {/* 新建 */}
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={data}
          pagination={pagination}
          loading={loading}
          bordered
          rowKey="id"
          size="middle" />
        <SlideFrame
          title={this.$t({ id: 'pre.payment.type' })/*预付款类型*/}
          show={showSlideFrame}
          onClose={() => { this.setState({ showSlideFrame: false }) }}
        >
          <NewPrePaymentType close={this.afterClose} params={{ prePaymentType: nowType, flag: showSlideFrame }} />
        </SlideFrame>
      </div>
    )
  }

}

function mapStateToProps(state) {
  return {
    company: state.user.company
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(PrePaymentType);
