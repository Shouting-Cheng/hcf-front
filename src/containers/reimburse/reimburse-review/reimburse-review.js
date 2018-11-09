import React from 'react'
import { connect } from 'dva';
import { routerRedux } from "dva/router";
import { Button, Table, Menu, Tabs, Dropdown, Icon, Row, Col, Badge, Popconfirm, Popover, Input, message, Divider } from 'antd';
import httpFetch from 'share/httpFetch'
import config from 'config'
import SearchArea from 'components/Widget/search-area'
const TabPane = Tabs.TabPane;
import moment from "moment"
const Search = Input.Search;
import 'styles/reimburse/reimburse.scss';

//报账单审核界面
class ReimburseReview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      page: 0,
      pageSize: 10,
      data: [],
      pagination: {
        total: 0
      },
      status: {
        1001: { label: '编辑中', state: 'default' },
        1004: { label: '审批通过', state: 'success' },
        2002: { label: '审核通过', state: 'warning' },
        1002: { label: '审批中', state: 'processing' },
        1005: { label: '审批驳回', state: 'error' },
        1003: { label: '撤回', state: 'warning' },
        0: { label: '未知', state: 'warning' },
        2004: { label: '未知', state: 'warning' },
      },
      invoiceColumns: [
        {          /*序号*/
            title: this.$t({ id: "myReimburse.index" }), dataIndex: 'index', width: 50,
            render: (recode, value, index) => (
              <span>
                {index + 1}
              </span>)
          },
          {
            /*单号*/
            title: this.$t({ id: "myReimburse.businessCode" }), dataIndex: 'businessCode', width: 180,
            render: recode => (
              <Popover content={recode}>
                {recode}
              </Popover>)
          },
          {          /*提交日期*/
            title: "申请日期", dataIndex: 'createdDate', width: 100,
            render: value => (
              <Popover content={value ? moment(value).format("YYYY-MM-DD") : ""}>
                {value ? moment(value).format("YYYY-MM-DD") : ""}
              </Popover>)
          },
          {          /*申请人*/
            title: this.$t({ id: "myReimburse.applicationName" }), dataIndex: 'applicantName', width: 150,
          },
          {          /*单据名称*/
            title: "单据类型", dataIndex: 'formName', width: 150,
            render: recode => (
              <Popover content={recode}>
                {recode}
              </Popover>)
          },
          {
            /*事由*/
            title: this.$t({ id: "myReimburse.remark" }), dataIndex: 'remark',
            render: recode => (
              <Popover content={recode}>
                {recode}
              </Popover>)
          },
          {
            /*币种*/
            title: this.$t({ id: "myReimburse.currencyCode" }), dataIndex: 'currencyCode', width: 80,
            render: recode => (
              <Popover content={recode}>
                {recode}
              </Popover>)
          },
          {          /*金额*/
            title: this.$t({ id: "myReimburse.totalAmount" }), dataIndex: 'totalAmount', width: 150,
            render: recode => (
              <Popover content={recode}>
                {recode}
              </Popover>)
          },
          {
            /*本币金额*/
            title: this.$t({ id: "myReimburse.functionalAmount" }), dataIndex: 'functionalAmount', width: 150,
            render: recode => (
              <Popover content={recode}>
                {recode}
              </Popover>)
          },
          {
            title: '状态', dataIndex: 'status', width: 150, render: (value, record) => {
                return (
                  <Badge status={this.state.status[value].state} text={this.state.status[value].label} />
                )
              }
          }
      ],
      borrowColumns: [
        {          /*序号*/
            title: this.$t({ id: "myReimburse.index" }), dataIndex: 'index', width: 100,
            render: (recode, value, index) => (
              <span>
                {index + 1}
              </span>)
          },
          {
            /*单号*/
            title: this.$t({ id: "myReimburse.businessCode" }), dataIndex: 'businessCode', width: 200,
            render: recode => (
              <Popover content={recode}>
                {recode}
              </Popover>)
          },
          {          /*提交日期*/
            title: "申请日期", dataIndex: 'createdDate', width: 150,
            render: value => (
              <Popover content={value ? moment(value).format("YYYY-MM-DD") : ""}>
                {value ? moment(value).format("YYYY-MM-DD") : ""}
              </Popover>)
          },
          {          /*申请人*/
            title: this.$t({ id: "myReimburse.applicationName" }), dataIndex: 'applicantName', width: 150,
          },
          {          /*单据名称*/
            title: "单据类型", dataIndex: 'formName', width: 150,
            render: recode => (
              <Popover content={recode}>
                {recode}
              </Popover>)
          },
          {
            /*事由*/
            title: this.$t({ id: "myReimburse.remark" }), dataIndex: 'remark', width: 200,
            render: recode => (
              <Popover content={recode}>
                {recode}
              </Popover>)
          },
          {
            /*币种*/
            title: this.$t({ id: "myReimburse.currencyCode" }), dataIndex: 'currencyCode', width: 100,
            render: recode => (
              <Popover content={recode}>
                {recode}
              </Popover>)
          },
          {          /*金额*/
            title: this.$t({ id: "myReimburse.totalAmount" }), dataIndex: 'totalAmount', width: 150,
            render: recode => (
              <Popover content={recode}>
                {recode}
              </Popover>)
          },
          {
            /*本币金额*/
            title: this.$t({ id: "myReimburse.functionalAmount" }), dataIndex: 'functionalAmount', width: 150,
            render: recode => (
              <Popover content={recode}>
                {recode}
              </Popover>)
          },
          {
            title: '状态', dataIndex: 'status', width: 150, render: (value, record) => {
              return (
                <Badge status={this.state.status[value].state} text={this.state.status[value].label} />
              )
            }
          }
      ],
      tabs: [
        {key: 'prending_audit', name: '待审核'},
        {key: 'audit_pass', name: '已审核'}],
      searchParams: {
        applicationId: null,
        corporationOIDs: [],
        dateTo: undefined,
        dateFrom: undefined,
        formId:null,
      },
      searchForm: [
        { type: 'select', id: 'formId',event:"formId",colSpan: 6, label: '单据类型', getUrl: `${config.baseUrl}/api/custom/forms/company/my/available/all/?formType=105`, options: [], method: "get", valueKey: "formId", labelKey: "formName" },
        {
          type: 'list', colSpan: 6,event:"applicationId",listType: "select_authorization_user", options: [], id: 'applicationId', label: "申请人", labelKey: "userName",
          valueKey: "userId", single: true
        },
        { type: 'date', id: 'dateFrom',event:"dateFrom",colSpan: 6, label: '申请日期从' },
        { type: 'date', id: 'dateTo',event:"dateTo", colSpan: 6,label: '申请日期到' },
      ],
      nowType: 'prending_audit',
      count: {},
      expenseForms: [],
      total: 0
    };
  }

  componentWillMount() {
    let countResult = {};
    this.state.tabs.map(item => {
      countResult[item.key] = {
        expenseReportCount: 0,
        loanApplicationCount: 0
      }
    });
    this.setState({count: countResult});
    this.getList();
    this.getForms();
  }

  onChangePager = (page) => {
    if (page - 1 !== this.state.page)
      this.setState({
        page: page - 1,
        loading: true
      }, () => {
        this.getList();
      })
  };

  //获取列表
  getList = () => {
    this.setState({ loading: true });

    console.log(this.state.searchParams);

    let { searchParams, page, pageSize } = this.state;

    let auditFlag = {};
    if(this.state.nowType == 'prending_audit'){
        auditFlag = 0;
    }else{
        auditFlag = 1;
    }

    let params = { ...searchParams, allForm: false, page: page, size: pageSize,auditFlag};
    httpFetch.get(`${config.baseUrl}/api/expReport/recheck`, params).then(res => {
      this.setState({
        loading: false,
        data: res.data,
        total: res.data.length,
        pagination: {
          total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
          current: page + 1,
          pageSize: pageSize,
          onChange: this.onChangePager
        }
      });
    }).catch(err => {
      message.error("网路错误！请稍后重试");
    });
  }

  getForms = () => {
    Promise.all([
      httpFetch.get(`${config.baseUrl}/api/custom/forms/company/my/available/all/?formType=105`),
    ]).then(res => {
      let expenseForms = [];
      res[0].data.map(item => {
        expenseForms.push({label: item.formName, value: item.formOID})
      });
      this.setState({ expenseForms })
    })
  };

  //渲染Tab头
  renderTabs() {
    return (
      this.state.tabs.map(tab => {
        let typeCount = this.state.count[tab.key];
        /* return <TabPane tab={`${tab.name}（${typeCount.expenseReportCount + typeCount.loanApplicationCount}）`}
                        key={tab.key}/> */
        return <TabPane tab={`${tab.name}`}
                        key={tab.key}/>
      })
    )
  }

  //Tab点击事件
  onChangeTabs = (key) => {
    let temp = this.state.searchParams;
    temp.status = key;
    console.log(key);
    this.setState({
      loading: true,
      page: 0,
      nowType: key
    }, () => {
      this.getList()
    });
  };

  search = (result) => {
   /*  result.dateFrom = result.dateFrom ? result.dateFrom.format('YYYY-MM-DD hh:mm:ss') : undefined;
    result.dateTo = result.dateTo ? result.dateTo.format('YYYY-MM-DD hh:mm:ss') : undefined; */
    result.dateFrom = result.dateFrom ? result.dateFrom.format('YYYY-MM-DD') : undefined;
    result.dateTo = result.dateTo ? result.dateTo.format('YYYY-MM-DD') : undefined;
    if(result.applicationId && result.applicationId[0]){
      result.applicationId = result.applicationId[0];
    }
    let searchParams = {
      applicationId: result.applicationId,
      formId: result.formId,
      corporationOIDs: result.legalEntity,
      dateTo: result.dateTo,
      dateFrom: result.dateFrom,
      businessCode: result.businessCode || this.state.searchParams.businessCode
    };
    this.setState({
      searchParams: searchParams,
      loading: true,
      page: 0
    }, () => {
      this.getList();
    })
  };
  onDocumentSearch=(value)=>{
    this.setState({
      searchParams:{...this.state.searchParams,businessCode:value}
    },()=>{
      this.search(this.state.searchParams);
    })
  }

  onDocumentChange = (e) =>{
    let {searchParams} = this.state;
    if(e && e.target && e.target.value){
      searchParams.businessCode = e.target.value;
    }else{
      searchParams.businessCode = '';
    }
    this.setState({searchParams});
  }

  clear = () => {
    this.setState({
      searchParams: {
        applicationId: "",
        businessCode: "",
        formId: '',
        corporationOIDs: [],
        dateTo: null,
        dateFrom: null
      }
    })
  };

  searchEventHandle = (event, value) => {
    let {searchParams} = this.state;
    switch (event) {
      case 'applicationId': {
        if(value && value[0]){
          searchParams.applicationId = value[0].userId;
        }else{
          searchParams.applicationId = '';
        }
        break;
      }
      case 'dateFrom': {
        if (value) {
          searchParams.dateFrom = moment(value).format('YYYY-MM-DD');
        } else {
          searchParams.dateFrom = '';
        }
        break;
      }
      case 'dateTo': {
        if (value) {
          searchParams.dateTo = moment(value).format('YYYY-MM-DD');
        } else {
          searchParams.dateTo = '';
        }
        break;
      }
      case 'formId': {
        searchParams.formId = value;
        break;
      }
    }
    this.setState({searchParams});
  };

  handleRowClick = (record) => {
    const { nowType } = this.state;
    //this.context.router.push(this.state.detailReimburePage.url.replace(":id", record.expenseReportId));
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/financial-management/reimburse-review/reimburse-detail/${record.expenseReportId}`,
      })
    );
  };
  render() {
    const {data, loading, invoiceColumns ,borrowColumns, pagination, searchForm, nowType} = this.state;
    return (
      <div>
        <Tabs onChange={this.onChangeTabs}>
          {this.renderTabs()}
        </Tabs>
        <SearchArea searchForm={searchForm}
                    submitHandle={this.search}
                    clearHandle={this.clear}
                    maxLength={4}
                    eventHandle={this.searchEventHandle}/>
        <div className="divider"/>
        <div className="table-header">
          <div className="table-header-title">{this.$t({id: "common.total"}, {total: pagination.total})}</div>
          {/* 共total条数据 */}
        </div>
        <Row gutter={24} style={{ marginBottom: 12, marginTop: -40 }}>
          <Col span={18} />
          <Col span={6}>
            <Search
              placeholder={"请输入报账单号"}
              onSearch={this.onDocumentSearch}
              onChange={this.onDocumentChange}
              className="search-number"
              enterButton
            />
          </Col>
        </Row>
        <Table columns={nowType === 'NOT_AUDITED' ? invoiceColumns : borrowColumns}
               dataSource={data}
               bordered
               scroll={{x:1300}}
               pagination={pagination}
               onRow={record => ({onClick: () => this.handleRowClick(record)})}
               loading={loading}
               size="middle"
               rowKey={record => record.expenseReportId}
               /* rowKey={nowType === 'NOT_AUDITED' ? 'expenseReportOID' : 'applicationOID'} */
               />
      </div>
    )
  }

}

export default connect(null, null, null, { withRef: true })(ReimburseReview);
