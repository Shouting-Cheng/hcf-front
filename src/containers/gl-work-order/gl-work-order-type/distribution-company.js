import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import config from 'config';
import { Form, Row, Col, Badge, Button, Table, Checkbox, message, Icon } from 'antd';
import ListSelector from 'components/Widget/list-selector';
import httpFetch from 'share/httpFetch';
import glWorkOrderTypeService from './gl-work-order-type.service';
class GLWorkOrderTypeDC extends Component {
  /**
   * 构造函数
   */
  constructor(props) {
    super(props);
    this.state = {
      //存储当前类型详细数据
      nowTypeList: {},
      columns: [
        { title: '公司代码', dataIndex: 'companyCode',align:'center' },
        { title: '公司名称', dataIndex: 'companyName',align:'center' },
        { title: '公司类型', dataIndex: 'companyType',align:'center' },
        {
          title: '启用',
          dataIndex: 'enabled',align:'center',
          render: (enabled, record, index) => {
            return <Checkbox checked={enabled} onChange={e => this.onIsEnabledChange(e, record)} />;
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
      //分配公司弹窗
      companyVisible: false,
    };
  }
  /**
   * 生命周期函数
   */
  componentWillMount = () => {
    glWorkOrderTypeService
      .getTypeById(this.props.match.params.id)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            nowTypeList: res.data.generalLedgerWorkOrderType,
          });
        }
      })
      .catch(e => {
        console.log(`获取核算工单类型详情失败：${e}`);
      });
    this.getList();
  };
  /**
   * 点击启用checkbox
   */
  onIsEnabledChange = (e, record) => {
    let params = [];
    params.push({
      id: record.id,
      enabled: e.target.checked,
      versionNumber: record.versionNumber,
    });
    this.setState({
      loading: true,
    });
    glWorkOrderTypeService
      .typeDistributionCompanyUpdate(params)
      .then(res => {
        if (res.status === 200) {
          message.success('操作成功');
          this.getList();
        }
      })
      .catch(e => {
        console.log(`启用操作失败：${e}`);
        if (e.response) {
          message.error(`操作失败：${e.response.data.message}`);
        }
        this.setState({ loading: false });
      });
  };
  /**
   * 获取核算工单类型分配公司
   */
  getList = () => {
    const { page, pageSize } = this.state;
    glWorkOrderTypeService
      .getTypeDistributionCompany(this.props.match.params.id, page, pageSize)
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
            },
          });
        }
      })
      .catch(e => {
        console.log(`获取核算工单类型分配公司失败：${e}`);
        if (e.response) {
          message.error(`获取核算工单类型分配公司失败：${e.response.data.message}`);
        }
        this.setState({
          loading: false,
        });
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
  /**
   * 分页点击
   */
  onChangePager = page => {
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
   * 返回
   */
  onBackClick = e => {
    e.preventDefault();
    //this.context.router.push(menuRoute.getRouteItem('gl-work-order-type', 'key').url.replace(':setOfBooksId', this.props.params.setOfBooksId));
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/document-type-manage/gl-work-order-type`,
      })
    );
  };
  /**
   * 分配公司按钮
   */
  handleCompany = () => {
    this.setState({
      companyVisible: true,
    });
  };
  /**
   * 取消弹窗
   */
  onCompanyCancel = () => {
    this.setState({
      companyVisible: false,
    });
  };
  /**
   * 确定弹窗
   */
  onCompanyOk = value => {
    this.setState({ loading: true });
    let params = [];
    value.result.map(item => {
      params.push({
        workOrderTypeId: this.props.match.params.id,
        companyId: item.id,
        companyCode: item.code,
        enabled: true,
      });
    });
    glWorkOrderTypeService
      .typeDistributionCompanyInsert(params)
      .then(res => {
        if (res.status === 200) {
          message.success('操作成功！');
          this.setState({ companyVisible: false });
          this.getList();
        }
      })
      .catch(e => {
        console.log(`操作失败：${e}`);
        if (e.response) {
          message.error(`操作失败：${e.response.data.message}`);
        }
        this.setState({ loading: false });
      });
  };
  /**
   * 渲染函数
   */
  render() {
    //当前类型信息
    const { nowTypeList } = this.state;
    //表格
    const { columns, loading, pagination, data } = this.state;
    //分配公司弹窗
    const { companyVisible } = this.state;
    return (
      <div>
        <Row
          gutter={24}
          type="flex"
          justify="start"
          style={{ background: '#f7f7f7', padding: '20px 25px 0', borderRadius: '6px 6px 0 0' }}
        >
          <Col span={6} style={{ marginBottom: '15px' }}>
            <div style={{ color: '#989898' }}>账套</div>
            <div style={{ wordWrap: 'break-word' }}>
              {nowTypeList.setOfBooksCode}-{nowTypeList.setOfBooksName}
            </div>
          </Col>
          <Col span={6} style={{ marginBottom: '15px' }}>
            <div style={{ color: '#989898' }}>核算工单类型代码</div>
            <div style={{ wordWrap: 'break-word' }}>{nowTypeList.workOrderTypeCode}</div>
          </Col>
          <Col span={6} style={{ marginBottom: '15px' }}>
            <div style={{ color: '#989898' }}>核算工单类型名称</div>
            <div style={{ wordWrap: 'break-word' }}>{nowTypeList.workOrderTypeName}</div>
          </Col>
          <Col span={6} style={{ marginBottom: '15px' }}>
            <div style={{ color: '#989898' }}>状态</div>
            <div style={{ wordWrap: 'break-word' }}>
              <Badge
                status={nowTypeList.enabled ? 'success' : 'error'}
                text={nowTypeList.enabled ? '启用' : '禁用'}
              />
            </div>
          </Col>
        </Row>
        <div className="table-header">
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleCompany}>
              分配公司
            </Button>
          </div>
        </div>
        <Table
          columns={columns}
          pagination={pagination}
          loading={loading}
          dataSource={data}
          size="middle"
          bordered
          rowKey={record => record['id']}
        />
        <a onClick={this.onBackClick}>
          <Icon type="rollback" />返回
        </a>
        {/* 批量分配公司 */}
        <ListSelector
          visible={companyVisible}
          onCancel={this.onCompanyCancel}
          onOk={this.onCompanyOk}
          type="gl_type_distribution_company"
          extraParams={{ workOrderTypeId: this.props.match.params.id }}
          single={false}
        />
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
)(GLWorkOrderTypeDC);
