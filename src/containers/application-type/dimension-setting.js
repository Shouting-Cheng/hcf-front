import React from 'react'

import { Form, Row, Col, Badge, Button, message, Icon, Divider, Popconfirm } from 'antd'
import Table from 'widget/table'
import service from './service'
import { routerRedux } from 'dva/router';
import { connect } from "dva"


class CompanyDistribution extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      companyTypeList: [
        { label: '账套', id: 'setOfBookCode' },
        { label: '预付款单类型代码', id: 'typeCode' },
        { label: '预付款单类型名称', id: 'typeName' },
        { label: '状态', id: 'enabled' }
      ],
      companyTypeInfo: {},
      columns: [
        { title: '维度', dataIndex: 'dimensionName', align: 'center' },
        { title: '默认值', dataIndex: 'defaultValue', align: 'center' },
        {
          title: '布局位置', dataIndex: 'headerFlag', align: 'center',
          render: value => <span>{value ? "单据头" : '单据行'}</span>
        },
        {
          title: '优先级', dataIndex: 'sequence', align: 'center'
        },
        {
          title: '操作', dataIndex: 'options', width: 120, align: 'center',
          render: (enabled, record) =>
            (<span>
              <a onClick={() => this.edit(record)}>编辑</a>
              <Divider type="vertical" />
              <Popconfirm title="确定删除？" onConfirm={() => this.delete(record.id)} okText="确定" cancelText="取消">
                <a>删除</a>
              </Popconfirm>
            </span>)
        }
      ],
      data: []
    };
  }

  componentWillMount() {
    this.getBasicInfo();
    this.getList();
  }

  getBasicInfo = () => {
    const { match } = this.props;
    service.getInfoById(match.params.id).then((res) => {
      this.setState({ companyTypeInfo: res.data.applicationType });
    });
  }

  getList = () => {
    const { match } = this.props;
    const { page, pageSize } = this.state;
    this.setState({ loading: true });
    service.getDimensionById(match.params.id, { page: page, size: pageSize }).then((res) => {
      this.setState({
        data: res.data,
        loading: false,
        pagination: {
          total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
          current: page + 1,
          onChange: this.onChangePaper,
          onShowSizeChange: this.onShowSizeChange,
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
  onChangePaper = (page) => {
    if (page - 1 !== this.state.page) {
      this.setState({ page: page - 1 }, () => {
        this.getList();
      });
    }
  }

  handleStatusChange = (e, record) => {
    let params = [{
      id: record.id,
      enabled: e.target.checked,
      versionNumber: record.versionNumber
    }];
    service.updateAssignCompany(params).then((res) => {
      this.getList();
      message.success('操作成功');
    }).catch(e => {
      message.error(`${e.response.data.message}`)
    });
  }

  handleListShow = (flag) => {
    this.setState({ showListSelector: flag });
  }

  handleListOk = (values) => {
    let paramsValue = [];
    paramsValue.sobPayReqTypeId = this.props.match.params.id;
    paramsValue.companyId = [];
    paramsValue.compcompanyCodeanyId = [];

    values = values.result.map(item => item.id);

    service.batchDistributeCompany(this.props.match.params.id, values).then((res) => {
      message.success('操作成功');
      this.handleListShow(false);
      this.getList();
    }).catch((e) => {
      if (e.response) {
        message.error(`操作失败，${e.response.data.message}`);
      }
    });
  }
  handleBack = () => {

    this.props.dispatch(routerRedux.push({
      pathname: "/document-type-manage/prepayment-type"
    }));
    // this.context.router.push(this.state.contractTypeDefine.url);
  }
  render() {
    const { loading, companyTypeList, companyTypeInfo, pagination, columns, data, showListSelector, selectorItem } = this.state;
    let periodRow = [];
    let periodCol = [];
    companyTypeList.map((item, index) => {
      index <= 2 && periodCol.push(
        <Col span={6} style={{ marginBottom: '15px' }} key={item.id}>
          <div style={{ color: '#989898' }}>{item.label}</div>
          <div style={{ wordWrap: 'break-word' }}>
            {item.id === 'setOfBookCode' ?
              companyTypeInfo[item.id] ? companyTypeInfo[item.id] + ' - ' + companyTypeInfo.setOfBookName : '-' :
              companyTypeInfo[item.id]}
          </div>
        </Col>
      );
      index == 3 && periodCol.push(
        <Col span={6} style={{ marginBottom: '15px' }} key={item.id}>
          <div style={{ color: '#989898' }}>{item.label}</div>
          <Badge status={companyTypeInfo[item.id] ? 'success' : 'error'}
            text={companyTypeInfo[item.id] ? '启用' : '禁用'} />
        </Col>
      );
    });
    periodRow.push(
      <Row style={{ background: '#f7f7f7', padding: '20px 25px 0', borderRadius: '6px 6px 0 0' }} key="1">
        {periodCol}
      </Row>);
    return (
      <div className="company-distribution" style={{ paddingBottom: 20 }}>
        {periodRow}
        <div className="table-header">
          <div className="table-header-buttons">
            <Button type="primary" onClick={() => this.handleListShow(true)}>添加维度</Button>
          </div>
        </div>
        <Table
          columns={columns}
          pagination={pagination}
          dataSource={data}
          size="middle"
        />
        <a style={{ fontSize: '14px', paddingBottom: '20px' }} onClick={this.handleBack}><Icon type="rollback" style={{ marginRight: '5px' }} />返回</a>
      </div>
    )
  }
}


const wrappedCompanyDistribution = Form.create()(CompanyDistribution);

export default connect()(wrappedCompanyDistribution);
