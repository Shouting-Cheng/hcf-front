
import React, { Component } from 'react';
import { Row, Col, Badge, Button, Icon, Checkbox, message } from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import Table from 'widget/table';
import ListSelector from 'components/Widget/list-selector';

class BatchSingleCompany extends Component {
    constructor(props) {
      super(props);
      this.state = {
        //当前维值的数据
        curTypeList: {},
        page: 0,
        size: 0,
        pagination: {
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: total => `一共${total}条数据`
        },
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
        isLoading: false,
        //table表dataSource
        companyData: [],
        companyVisible: false,
        selectorItem: {}
      }
    }

    componentWillMount = () => {
       //当前维值代码的id
       let id = this.props.match.params.dimensionCodeId;
    }
    componentDidMount = () => {
       this.getCompanyData();
    }
    //伪数据
    getCompanyData = () => {
        this.setState({
          companyData: [{
            id: 111,
            companyCode: 1,
            companyName: '公司',
            companyType: '民营'
          },
          {
            id:222,
            companyCode: 2,
            companyName: '公司',
            companyType: '国有'
          }]
        })
    }

    //返回上一页
    onBackClick = e => {
      e.preventDefault();
      this.props.dispatch(
        routerRedux.replace({
          pathname: `/admin-setting/dimension-definition/dimension-details`,
        })
      );
    }

    //是否启用
    onIsEnabledChange = (e, record) => {
      let params = [];
      params.push({
        id: record.id,
        enabled: e.target.checked,
      });
      console.log(params);
    };

    //批量分配公司
    handleBatch = () => {
        this.setState({companyVisible: true});
    }
    onCompanyCancel = () => {
        this.setState({companyVisible: false});
    }
    onCompanyOk = value => {
        console.log(value.result);
        const params = [];
        value.result.map( item => {
            params.push({
               companyId: item.id,
               companyCode: item.code,
               enabled: item.enabled,
            })
        });
    }

    render() {
       const { curTypeList,
               pagination,
               columns,
               isLoading,
               companyData,
               companyVisible,
               selectorItem} = this.state;
       return(
          <div>
            <h1 style={{padding: '14px 0', borderBottom: '1px solid #c9c9c9'}}>基本信息</h1>
            <div>
            <Row
              gutter={24}
              type="flex"
              justify="start"
              style={{ background: '#f7f7f7', padding: '20px 25px 0', borderRadius: '6px 6px 0 0' }}>
                  <Col span={8} style={{ marginBottom: '15px' }}>
                  <div style={{ color: '#989898' }}>维值代码</div>
                  <div style={{ wordWrap: 'break-word' }}>
                      {curTypeList.dimensionCode}
                  </div>
                </Col>
                <Col span={8} style={{ marginBottom: '15px' }}>
                  <div style={{ color: '#989898' }}>维值名称</div>
                  <div style={{ wordWrap: 'break-word' }}>
                      {curTypeList.dimensionName}
                  </div>
                </Col>
                <Col span={8} style={{ marginBottom: '15px' }}>
                  <div style={{ color: '#989898' }}>状态</div>
                  <div style={{ wordWrap: 'break-word' }}>
                    <Badge
                      status={curTypeList.enabled ? 'success' : 'error'}
                      text={curTypeList.enabled ? '启用' : '禁用'}
                    />
                  </div>
                </Col>
              </Row>
            </div>
            <Button
              type='primary'
              style={{marginBottom: '10px'}}
              onClick={this.handleBatch}>批量分配公司</Button>
            <Table
              columns={columns}
              pagination={pagination}
              loading={isLoading}
              dataSource={companyData}
              size="middle"
              bordered
              rowKey={record => record.id}
            />
            <div>
              <a onClick={this.onBackClick}>
                <Icon type="rollback" />返回
              </a>
            </div>
            <ListSelector
              visible={companyVisible}
              onCancel={this.onCompanyCancel}
              onOk={this.onCompanyOk}
              // selectorItem={selectorItem}
              type="gl_type_distribution_company"
              // extraParams={{ workOrderTypeId: this.props.match.params.id }}
              extraParams={{ workOrderTypeId: '1054275530954018818' }}
              single={false}
            />
          </div>
       )
    }
}

function mapStateToProps() {
   return {}
}
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(BatchSingleCompany);

