import React from 'react';
import {connect} from 'dva';
import { routerRedux } from 'dva/router';
import { Button, Card, Icon, Popover} from 'antd';
import Table from 'widget/table'
import config from 'config'
import httpFetch from 'share/httpFetch'

class LcnModel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      managerUrl: "/admin-setting/lcn-manager",
      columns: [
        {
          title: "模块名称",
          dataIndex: 'model',
          align: 'center',
          width: 150,
        },
        {
          title: "唯一标识",
          dataIndex: 'uniqueKey',
          align: 'center',
          width: 150,
        },
        {
          title: "模块地址",
          dataIndex: 'ipAddress',
          align: 'center',
          width: 150,
        },
        {
          title: "管道名称",
          dataIndex: 'channelName',
          align: 'center',
          width: 150,
        },
        ]
    }
  }

  componentWillMount(){
    this.getList();
  }

  getList = () => {

    httpFetch.get(`${config.txManagerUrl}/admin/onlines`).then(res => {
      this.setState({
        data: res.data
      })
    });

  }
  handleBack = () => {
    let path = this.state.managerUrl.replace();
    this.props.dispatch(
      routerRedux.push({
        pathname: path
      })
    );
  }

  render(){
    const {data, columns} = this.state;
    return (
      <div>
        <Table
          rowKey={record => record.uniqueKey}
          columns={columns}
          dataSource={data}
          pagination={{pageSize:50}}
          bordered={true}
          size="middle"
        />
        <a style={{ fontSize: '14px', paddingBottom: '20px' }} onClick={this.handleBack}>
          <Icon type="rollback" style={{ marginRight: '5px' }} />返回
        </a>
      </div>
    )
  }

}

function mapStateToProps(state) {
  return {
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(LcnModel);
