import React from 'react'
import { connect } from 'react-redux'
import menuRoute from 'routes/menuRoute'
import config from 'config'
import { Form, Card, Row, Col, Input, Affix, Button,  message } from 'antd'
import Table from 'widget/table'
const FormItem = Form.Item;

import occupancyService from 'containers/budget/budget-occupancy/budget-occupancy.service'
import Importer from 'components/template/importer'

import { formatMessage } from "share/common"

class NewBudgetOccupancy extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      tableLoading: false,
      user: {},
      columns: [
        {
          title: formatMessage({ id: "common.sequence" }/*序号*/), dataIndex: 'index',
          render: (value, record, index) => this.state.pageSize * this.state.page + index + 1
        },
        { title: formatMessage({ id: "budget.occupancy.company" }/*公司*/), dataIndex: 'companyCodeName' },
        { title: formatMessage({ id: "budget.occupancy.period.name" }/*调整日期*/), dataIndex: 'periodName' },
        { title: formatMessage({ id: "budget.occupancy.currency" }/*币种*/), dataIndex: 'currency' },
        { title: formatMessage({ id: "budget.occupancy.budget.project" }/*预算项目*/), dataIndex: 'itemCodeName' },
        { title: formatMessage({ id: "budget.occupancy.amount" }/*金额*/), dataIndex: 'amount', render: this.filterMoney },
        { title: formatMessage({ id: "budget.occupancy.department" }/*部门*/), dataIndex: 'unitCodeName', render: value => value || '-' },
        { title: formatMessage({ id: "budget.occupancy.project" }/*项目*/), dataIndex: 'costCenterItemCodeName' },
        { title: formatMessage({ id: "budget.occupancy.product" }/*产品*/), dataIndex: 'costCenterProductCodeName' },
        { title: formatMessage({ id: "budget.occupancy.channel" }/*渠道*/), dataIndex: 'costCenterChannelCodeName' },
        { title: formatMessage({ id: "budget.occupancy.team" }/*团队*/), dataIndex: 'costCenterTeamCodeName' }
      ],
      data: [],
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0
      },
      showImportFrame: false,
      budgetOccupancy: menuRoute.getRouteItem('budget-occupancy', 'key'),    //预算占用调整
    }
  }

  componentWillMount() {
    this.setState({ user: this.props.user });
  }

  //获取导入数据
  getList = () => {
    const { page, pageSize } = this.state;
    this.setState({ tableLoading: true });
    occupancyService.getImporterInfo(page, pageSize).then(res => {
      if (res.status === 200) {
        this.setState({
          data: res.data,
          tableLoading: false,
          pagination: {
            total: Number(res.headers['x-total-count']) || 0,
            onChange: this.onChangePager,
            current: page + 1,
          }
        })
      }
    }).catch(e => {
      message.error(`${formatMessage({ id: "budget.occupancy.search.fail" })/*查询失败*/}，${e.response.data.message}`);
      this.setState({ tableLoading: false });
    })
  };

  //分页点击
  onChangePager = (page) => {
    if (page - 1 !== this.state.page)
      this.setState({ page: page - 1 }, () => {
        this.getList();
      })
  };

  //最终确认
  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let params = {
          reserveAdjustInfo: {
            remark: values.remark
          },
          reserveAdjustImports: this.state.data
        };
        this.setState({ loading: true });
        occupancyService.newOccupancy(params).then(res => {
          if (res.status === 200) {
            this.setState({ loading: false });
            message.success(formatMessage({ id: "common.save.success" }, { name: "" }/*保存成功*/));
            this.handleBack()
          }
        }).catch(e => {
          this.setState({ loading: false });
          message.error(`${formatMessage({ id: "common.save.filed" }/*保存失败*/)}，${e.response.data.message}`);
        })
      }
    })
  };

  //导入成功回调
  handleImportOk = () => {
    this.showImport(false);
    this.getList()
  };

  //返回
  handleBack = () => {
    this.context.router.replace(this.state.budgetOccupancy.url);
  };

  showImport = (flag) => {
    this.setState({ showImportFrame: flag })
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { loading, tableLoading, user, pagination, columns, data, showImportFrame } = this.state;
    return (
      <div className="new-budget-occupancy background-transparent" style={{ marginBottom: 40 }}>
        <Form onSubmit={this.handleSave}>
          <Card title={formatMessage({ id: "budget.occupancy.basic.info" }/*基本信息*/)} style={{ marginBottom: 20 }}>
            <Row>
              <Col span={7}>
                <div style={{ lineHeight: '32px' }}>{formatMessage({ id: "budget.occupancy.import.num" }/*导入批次号*/)}：</div>
                <Input value="-" disabled />
              </Col>
              <Col span={7} offset={1}>
                <div style={{ lineHeight: '32px' }}>{formatMessage({ id: "budget.occupancy.create.people" }/*创建人*/)}：</div>
                <Input value={user.fullName + ' - ' + user.employeeID} disabled />
              </Col>
              <Col span={7} offset={1}>
                <div style={{ lineHeight: '32px' }}>{formatMessage({ id: "budget.occupancy.create.date" }/*导入日期*/)}：</div>
                <Input value={new Date().format('yyyy-MM-dd')} disabled />
              </Col>
            </Row>
            <Row>
              <Col span={15} style={{ marginTop: 20 }}>
                <FormItem label={formatMessage({ id: "budget.occupancy.import.explain" }/*导入说明*/)}>
                  {getFieldDecorator('remark', {
                    rules: [{
                      required: true,
                      message: formatMessage({ id: "common.please.enter" }/*请输入*/)
                    }]
                  })(
                    <Input placeholder={formatMessage({ id: "common.please.enter" }/*请输入*/)} />
                    )}
                </FormItem>
              </Col>
            </Row>
          </Card>
          <Card title={formatMessage({ id: "budget.occupancy.import.data" }/*导入数据*/)}>
            <div style={{ marginBottom: 10 }}>{formatMessage({ id: "common.total" }, { total: `${pagination.total || 0}` }/*共搜索到 {total} 条数据*/)}</div>
            <Table rowKey={record => record.id}
              columns={columns}
              dataSource={data}
              pagination={pagination}
              loading={tableLoading}
              scroll={{ x: true, y: false }}
              bordered
              size="middle" />
          </Card>
          <Affix offsetBottom={0}
            style={{
              position: 'fixed', bottom: 0, marginLeft: '-35px', width: '100%', height: 50, zIndex: 1,
              boxShadow: '0px -5px 5px rgba(0, 0, 0, 0.067)', background: '#fff', lineHeight: '50px', paddingLeft: 20
            }}>
            <Button type="primary" onClick={() => this.showImport(true)}>{formatMessage({ id: 'importer.import' }/*导入*/)}</Button>
            <Importer visible={showImportFrame}
              title={formatMessage({ id: "budget.occupancy.budget.import" }/*预算导入*/)}
              templateUrl={`${config.budgetUrl}/api/budget/reserve/adjust/import`}
              uploadUrl={`${config.budgetUrl}/api/budget/reserve/adjust/import`}
              errorUrl={`${config.budgetUrl}/api/budget/reserve/adjust/import/failed/export`}
              fileName={formatMessage({ id: "budget.occupancy.budget.adjustment.import.template" }/*预算占用调整导入模板*/)}
              onOk={this.handleImportOk}
              afterClose={() => this.showImport(false)} />
            <Button htmlType="submit" loading={loading} style={{ marginLeft: 20 }}>{formatMessage({ id: "budget.occupancy.final.confirm" }/*最终确认*/)}</Button>
            <Button onClick={this.handleBack} style={{ marginLeft: 50 }}>{formatMessage({ id: "common.back" }/*返回*/)}</Button>
          </Affix>
        </Form>
      </div>
    )
  }
}

NewBudgetOccupancy.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {
    user: state.login.user
  }
}

const wrappedNewBudgetOccupancy = Form.create()((NewBudgetOccupancy));

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedNewBudgetOccupancy)
