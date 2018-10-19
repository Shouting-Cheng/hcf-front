import React from 'react'
import { Form, Spin, Row, Col, Tabs, Table, Icon, message } from 'antd'
const TabPane = Tabs.TabPane;
import menuRoute from 'routes/menuRoute'

import occupancyService from 'containers/budget/budget-occupancy/budget-occupancy.service'
import moment from 'moment'
import 'styles/budget/budget-occupancy/import-detail.scss'

import { formatMessage } from "share/common"
class ExportDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      tableLoading: false,
      headerData: {},
      columns: [
        {title: formatMessage({id: "common.sequence"}/*序号*/), dataIndex: 'index',
          render: (value, record, index) => this.state.pageSize * this.state.page + index + 1},
        {title: formatMessage({id: "budget.occupancy.company"}/*公司*/), dataIndex: 'companyName'},
        {title: formatMessage({id: "budget.occupancy.period.name"}/*调整日期*/), dataIndex: 'periodName'},
        {title: formatMessage({id: "budget.occupancy.currency"}/*币种*/), dataIndex: 'currency'},
        {title: formatMessage({id: "budget.occupancy.budget.project"}/*预算项目*/), dataIndex: 'itemName'},
        {title: formatMessage({id: "budget.occupancy.amount"}/*金额*/), dataIndex: 'amount', render: this.filterMoney},
        {title: formatMessage({id: "budget.occupancy.department"}/*部门*/), dataIndex: 'unitName'},
        {title: formatMessage({id: "budget.occupancy.project"}/*项目*/), dataIndex: 'costCenterItemName'},
        {title: formatMessage({id: "budget.occupancy.product"}/*产品*/), dataIndex: 'costCenterProductName'},
        {title: formatMessage({id: "budget.occupancy.channel"}/*渠道*/), dataIndex: 'costCenterChannelName'},
        {title: formatMessage({id: "budget.occupancy.team"}/*团队*/), dataIndex: 'costCenterTeamName'}
      ],
      data: [],
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0,
      },
      budgetOccupancy:  menuRoute.getRouteItem('budget-occupancy','key'),    //预算占用调整
    }
  }

  componentWillMount() {
    let info = new Promise((resolve, reject) => {
      this.getInfo(resolve, reject)
    });
    let list = new Promise((resolve, reject) => {
      this.getList(resolve, reject)
    });
    Promise.all([ info, list ]).catch(() => {
      message.error(formatMessage({id: "common.error"}/*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*/))
    })
  }

  getInfo = (resolve, reject) => {
    this.setState({ loading: true });
    occupancyService.getOccupancyInfo(this.props.params.id).then(res => {
      if (res.status === 200) {
        this.setState({
          headerData: res.data,
          loading: false
        });
        resolve()
      }
    }).catch(() => {
      this.setState({ loading: false });
      reject()
    })
  };

  getList = (resolve, reject) =>{
    const { page, pageSize } = this.state;
    this.setState({ tableLoading: true });
    occupancyService.getImporterList(page, pageSize, this.props.params.batchNumber).then(res => {
      if (res.status === 200) {
        this.setState({
          data: res.data,
          tableLoading: false,
          pagination: {
            total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
            onChange: this.onChangePager,
            current: page + 1
          }
        });
        resolve()
      }
    }).catch(() => {
      this.setState({ tableLoading: false });
      reject()
    })
  };

  //分页点击
  onChangePager = (page) => {
    if(page - 1 !== this.state.page)
      this.setState({ page: page - 1 }, ()=>{
        this.getList();
      })
  };

  renderList = (title, value) => {
    return (
      <div style={{fontSize:14, color:'#333', marginBottom:8}}>
        <span>{title}：</span>
        <span style={{color:'#666'}}>{value}</span>
      </div>
    )
  };

  handleBack = () => {
    this.context.router.replace(this.state.budgetOccupancy.url);
  };

  render() {
    const { loading, tableLoading, headerData, pagination, columns, data } = this.state;
    return (
      <div className="import-detail background-transparent">
        <Spin spinning={loading}>
          <div className="top-info">
            <h3 className="header-title">{formatMessage({id: "budget.occupancy.import.detail"}/*导入详情*/)}</h3>
            <Row>
              <Col span={6}>
                {this.renderList(formatMessage({id: "budget.occupancy.create.people"}/*创建人*/), headerData.employeeName + ' - ' + headerData.createdBy)}
                {this.renderList(formatMessage({id: "budget.occupancy.import.explain"}/*导入说明*/), headerData.remark)}
              </Col>
              <Col span={6}>
                {this.renderList(formatMessage({id: "budget.occupancy.import.num"}/*导入批次号*/), headerData.batchNumber)}
              </Col>
              <Col span={12}>
                {this.renderList(formatMessage({id: "budget.occupancy.create.date"}/*导入日期*/), moment(headerData.createdDate).format('YYYY-MM-DD'))}
              </Col>
            </Row>
          </div>
        </Spin>
        <Tabs className="detail-tabs">
          <TabPane tab={formatMessage({id: "budget.occupancy.import.data"}/*导入数据*/)} key="export">
            <div className="tab-container">
              <h3 className="sub-header-title">{formatMessage({id: "budget.occupancy.import.data"}/*导入数据*/)}</h3>
              <div style={{marginBottom:10}}>{formatMessage({id: "common.total"},{total:`${pagination.total || 0}`}/*共搜索到 {total} 条数据*/)}</div>
              <Table rowKey={record => record.id}
                     columns={columns}
                     dataSource={data}
                     pagination={pagination}
                     scroll={{x:true, y:false}}
                     loading={tableLoading}
                     bordered
                     size="middle"/>
            </div>
          </TabPane>
        </Tabs>
        <a style={{fontSize:'14px',paddingBottom:'20px'}} onClick={this.handleBack}>
          <Icon type="rollback" style={{marginRight:'5px'}}/>{formatMessage({id: "common.back"}/*返回*/)}
        </a>
      </div>
    )
  }
}

ExportDetail.contextTypes = {
  router: React.PropTypes.object
};

const wrappedExportDetail = Form.create()((ExportDetail));

export default wrappedExportDetail;
