import React from 'react';
import {connect} from 'dva';
import { routerRedux } from 'dva/router';
import { Icon, Row, Col, Card, Button, Modal, message, Popconfirm } from 'antd';
import Table from 'widget/table'
import config from 'config'
import httpFetch from 'share/httpFetch'

class LcnTransaction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      showDetail:false,
      modelTimes:null,
      managerUrl: "/admin-setting/lcn-manager",
      columns: [
        {
          title: "模块名称",
          dataIndex: 'name',
          align: 'center',
          width: 50,
        },
        {
          title: "记录条数",
          dataIndex: 'count',
          align: 'center',
          width: 30,
        }
        ],
      columns1: [
        {
          title: "记录日期",
          dataIndex: 'modelTimes',
          align: 'center',
          width: 50,
        }
      ],
      data1:[],
      columns2: [
        {
          title: "记录时间",
          dataIndex: 'time',
          align: 'center',
          width: 100,
        },
        {
          title: "执行方法",
          dataIndex: 'method',
          align: 'center',
          width: 150,
        },
        {
          title: "执行时间",
          dataIndex: 'executeTime',
          align: 'center',
          width: 100,
        },
        {
          title: "操作",
          dataIndex: 'id',
          align: 'center',
          width: 150,
          render: (text, record) => (
            <span>
              <a onClick={e => this.detail(e, record)}>
                详情
              </a>
              <span className="ant-divider" />
              <Popconfirm
                title={"确定要补偿吗？"}
                onConfirm={e => this.compensate(e, record)}
              >
                <a>补偿</a>
              </Popconfirm>
              <span className="ant-divider" />
              <Popconfirm
                title={"确定要删除吗？"}
                onConfirm={e => this.delete(e, record)}
              >
                <a>删除</a>
              </Popconfirm>
            </span>
          ),
        },
      ],
      data2:[],
      obj:{
        txGroup:{}
      },
      data3:[],
      columns3: [
        {
          title: "模块名称",
          dataIndex: 'model',
          align: 'center'
        },
        {
          title: "模块地址",
          dataIndex: 'modelIpAddress',
          align: 'center'
        },
        {
          title: "唯一标识",
          dataIndex: 'uniqueKey',
          align: 'center'
        },
        {
          title: "是否提交",
          dataIndex: 'notify',
          align: 'center'
        },
        {
          title: "执行方法",
          dataIndex: 'methodStr',
          align: 'center'
        },
      ],
    }
  }


  detail = (e, record) => {
    let unicode = record.base64.replace(/\s/g, '+');
    unicode = Buffer.from(commonContent, 'base64').toString();
    let str = '';
    for (let i = 0, len = unicode.length; i < len; ++i) {
      str += String.fromCharCode(unicode[i]);
    }

    let obj = JSON.parse(str);

    let currentTime = obj["currentTime"];
    let date = new Date(currentTime);

    obj["currentTime"] = date.format('yyyy-MM-dd h:m:s');
    let data = [];
    let list = obj["txGroup"]["list"];

    for (let index in list) {
      let p = list[index];
      data.push(list[index]);
    }
    this.setState({obj:obj,data3:data})

  };


  compensate = (e, record) => {
    e.preventDefault();
    httpFetch.get(`${config.txManagerUrl}/admin/compensate?path=${record.key}`).then(res => {
      if (res.data){
        message.error('补偿成功！');
        this.handleBack();
      }else{
        message.error('补偿失败！');
      }
    });
  };

  delete = (e, record) => {
    e.preventDefault();
    httpFetch.get(`${config.txManagerUrl}/admin/delCompensate?path=${record.key}`).then(res => {
      if (res.data){
        message.error('删除成功！');
        this.handleBack();
      }else{
        message.error('删除失败！');
      }
    });

  };
  componentWillMount(){
    this.getList();
  }

  getList = () => {

    httpFetch.get(`${config.txManagerUrl}/admin/modelList`).then(res => {
      this.setState({
        data: res.data
      })
    });

  }
  handleBack = () => {
    let path = this.state.managerUrl;
    this.props.dispatch(
      routerRedux.push({
        pathname: path
      })
    );
  }
  rowClick = (record) => {
    httpFetch.get(`${config.txManagerUrl}/admin/modelTimes?model=${record.name}`).then(res => {
      let data = [];
      res.data.forEach(item =>{
        let name = item.split(":")[0];
        let value ={modelTimes:name};
        data.push(value);
      })
      this.setState({
        data1: data
      })
    });
  }

  rowClick1 = (record) => {
    httpFetch.get(`${config.txManagerUrl}/admin/modelInfos?path==${record.modelTimes}`).then(res => {
      this.setState({
        data2: res.data
      })
    });
  }

  render(){
    const {data, columns,columns1, data1,columns2, data2, obj,data3,columns3} = this.state;
    const gridStyle = {
      width: '50%',
      textAlign: 'left',
      padding: '10px 8px'
    };
    const gridStyle2 = {
      width: '50%',
      textAlign: 'left',
      padding: '10px 8px',
      backgroundColor: "#e6f7ff"
    };
    const gridTitleStyle = {
      width: '50%',
      textAlign: 'left',
      padding: '10px 8px',
      backgroundColor: "#f0f0f0"
    };
    return (
      <div>
        <Row>
          <Col span={5} style={{ marginRight: 10 }}>
            <Table
              rowKey={record => record.name}
              columns={columns}
              dataSource={data}
              onRow={record => ({
                onClick: () => this.rowClick(record),
              })}
              bordered={true}
              size="middle"
            />
          </Col>
          <Col span={3} style={{ marginRight: 10 }}>
            <Table
              rowKey={record => record.modelTimes}
              columns={columns1}
              dataSource={data1}
              onRow={record => ({
                onClick: () => this.rowClick1(record),
              })}
              bordered={true}
              size="middle"
            />
          </Col>
          <Col span={14} >
            <Table
              rowKey={record => record.key}
              columns={columns2}
              dataSource={data2}
              scroll={{x:700}}
              bordered={true}
              size="middle"
            />
          </Col>
        </Row>
        <a style={{ fontSize: '14px', paddingBottom: '20px' }} onClick={this.handleBack}>
          <Icon type="rollback" style={{ marginRight: '5px' }} />返回
        </a>

        <Modal
          visible={this.state.showDetail}
          footer={[
            <Button key="back" onClick={()=>{this.setState({showDetail:false})}}>
              返回
            </Button>,
          ]}
          width={800}
          destroyOnClose={true}
          closable={true}
          onCancel={()=>{this.setState({showDetail:false})}}
        >
          <div>
            <Card bordered={false}>
              <Card.Grid style={gridTitleStyle}>发起方模块</Card.Grid>
              <Card.Grid style={gridTitleStyle}>{obj["model"]}</Card.Grid>

              <Card.Grid style={gridStyle}>发起方地址</Card.Grid>
              <Card.Grid style={gridStyle}>{obj["address"] ||'-'}</Card.Grid>

              <Card.Grid style={gridStyle2}>发起方标识</Card.Grid>
              <Card.Grid style={gridStyle2}>{obj["uniqueKey"] ||'-'}</Card.Grid>


              <Card.Grid style={gridStyle}>记录时间</Card.Grid>
              <Card.Grid style={gridStyle}>{obj["currentTime"] ||'-'}</Card.Grid>

              <Card.Grid style={gridStyle2}>执行时间(毫秒)</Card.Grid>
              <Card.Grid style={gridStyle2}>{obj["time"]  ||'-'}</Card.Grid>

              <Card.Grid style={gridStyle}>发起方执行方法</Card.Grid>
              <Card.Grid style={gridStyle}>{obj["methodStr"] ||'-'}</Card.Grid>

              <Card.Grid style={gridStyle2}>事务组Id</Card.Grid>
              <Card.Grid style={gridStyle2}>{obj["txGroup"]["groupId"] ||'-'}</Card.Grid>

              <Card.Grid style={gridStyle}>完成状态</Card.Grid>
              <Card.Grid style={gridStyle}>{obj["txGroup"]["hasOver"] === "1" ? "已结束" : "未结束" }</Card.Grid>
            </Card>

            <Table
              rowKey={record => record.key}
              columns={columns3}
              dataSource={data3}
              scroll={{x:700}}
              bordered={true}
              size="middle"
            />
          </div>
        </Modal>
      </div>
    )
  }

}

function mapStateToProps(state) {
  return {
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(LcnTransaction);
