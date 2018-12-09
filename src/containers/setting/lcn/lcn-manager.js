import React from 'react';
import {connect} from 'dva';
import { routerRedux } from 'dva/router';
import { Button, Card, Icon } from 'antd';
import config from 'config'
import httpFetch from 'share/httpFetch'

class LcnManager extends React.Component{
  constructor(props) {
    super(props);
    this.state ={
      setting:{},
      json:true,
      hasCompensate:null,
      modelUrl:"/admin-setting/lcn-manager/model",
      transactionUrl:"/admin-setting/lcn-manager/transaction"
    }
  }

  componentWillMount(){
    this.getList();
  }

  getList = () => {
    this.setState({
      setting:{},
      json:true,
      hasCompensate:null
    },() =>{
      Promise.all([]).then(() => {
        this.getSetting();
        this.getJson();
        this.getOther();
      })
    })
  }

  getSetting = () => {
    httpFetch.get(`${config.txManagerUrl}/admin/setting`).then(res => {
      this.setState({
        setting: res.data
      })
    });
  }

  getJson = () => {
    httpFetch.get(`${config.txManagerUrl}/admin/json`).then(res => {
    }).catch(() => {
      this.setState({json : false})
    });
  }
  getOther = () => {
    let hasCompensate = "无";
    httpFetch.get(`${config.txManagerUrl}/admin/hasCompensate`).then(res => {
      if(res.data){
        hasCompensate = "有";
      }else{
        hasCompensate = "无";
      }
      this.setState({
        hasCompensate:hasCompensate
      })
    }).catch(() => {
      hasCompensate = "异常";
      this.setState({
        hasCompensate:hasCompensate
      })
    });
  }


  goModel = () => {
    let path = this.state.modelUrl.replace();
    this.props.dispatch(
      routerRedux.push({
        pathname: path
      })
    );
  }

  transaction = () => {
    let path = this.state.transactionUrl.replace();
    this.props.dispatch(
      routerRedux.push({
        pathname: path
      })
    );
  }
  render(){
    const {hasCompensate, setting,json} = this.state;
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
      <div className="header-title">
        <h1>分布式事务管理器</h1>
        <Card bordered={false}>
          <Card.Grid style={gridTitleStyle}>属性名称</Card.Grid>
          <Card.Grid style={gridTitleStyle}>属性值</Card.Grid>

          <Card.Grid style={gridStyle}>Socket对外服务IP</Card.Grid>
          <Card.Grid style={gridStyle}>{setting.ip ||'-'}</Card.Grid>

          <Card.Grid style={gridStyle2}>Socket对外服务端口</Card.Grid>
          <Card.Grid style={gridStyle2}>{setting.port ||'-'}</Card.Grid>


          <Card.Grid style={gridStyle}>最大连接数</Card.Grid>
          <Card.Grid style={gridStyle}>{setting.maxConnection ||'-'}</Card.Grid>

          <Card.Grid style={gridStyle2}>当前连接数</Card.Grid>
          <Card.Grid style={gridStyle2}>{setting.nowConnection ||'-'}</Card.Grid>

          <Card.Grid style={gridStyle}>TxManager模块心跳间隔时间(秒)</Card.Grid>
          <Card.Grid style={gridStyle}>{setting.transactionNettyHeartTime ||'-'}</Card.Grid>

          <Card.Grid style={gridStyle2}>TxManager模块通讯最大等待时间(秒)</Card.Grid>
          <Card.Grid style={gridStyle2}>{setting.transactionNettyDelayTime ||'-'}</Card.Grid>

          <Card.Grid style={gridStyle}>redis服务状态</Card.Grid>
          <Card.Grid style={gridStyle}>{json ? "正常" : "异常" }</Card.Grid>

          <Card.Grid style={gridStyle2}>redis存储最大时间(秒)</Card.Grid>
          <Card.Grid style={gridStyle2}>{setting.redisSaveMaxTime ||'-'}</Card.Grid>

          <Card.Grid style={gridStyle}>负载均衡服务器地址</Card.Grid>
          <Card.Grid style={gridStyle}>{setting.slbList ||'-'}</Card.Grid>

          <Card.Grid style={gridStyle2}>补偿回调地址(rest api 地址，post json格式)</Card.Grid>
          <Card.Grid style={gridStyle2}>{setting.notifyUrl ||'-'}</Card.Grid>

          <Card.Grid style={gridStyle}>存在补偿数据</Card.Grid>
          <Card.Grid style={gridStyle}>{hasCompensate ||'-'}</Card.Grid>

          <Card.Grid style={gridStyle2}>开启自动补偿</Card.Grid>
          <Card.Grid style={gridStyle2}>{setting.compensate? "开启":"关闭"}</Card.Grid>

          <Card.Grid style={gridStyle}>补偿失败尝试间隔时间(秒)</Card.Grid>
          <Card.Grid style={gridStyle}>{setting.compensateTryTime || '-'} </Card.Grid>

          <Card.Grid style={gridStyle2}>各事务模块自动补偿的时间上限</Card.Grid>
          <Card.Grid style={gridStyle2}>{setting.compensateMaxWaitTime || '-'}</Card.Grid>
        </Card>
        <div className="table-header">
          <Button type="primary" style={{ marginRight: 10 }} onClick={this.getList}>刷新</Button>
          <Button type="primary" style={{ marginRight: 10 }} onClick={this.goModel}>在线模块</Button>
          <Button type="primary"  onClick={this.transaction}>事务补偿</Button>
        </div>
      </div>
    )
  }

}
function mapStateToProps(state) {
  return {
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(LcnManager);
