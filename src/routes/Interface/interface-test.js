import React from 'react';
import { Drawer, Table, Input, Button, Badge } from 'antd';
import service from './interface.service';
import httpFetch from '../../utils/fetch';
import axios from 'axios';

class InterfaceTest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      result: '',
      time: 0,
      info: {},
      loading: false,
      status: { code: 'default', text: '未开始' },
      columns: [
        { title: '字段', dataIndex: 'keyCode', width: 120 },
        { title: '名称', dataIndex: 'name', width: 200 },
        {
          title: '值',
          dataIndex: 'value',
          render: (value, record, index) => {
            return <Input value={value} onChange={e => this.change(index, e.target.value)} />;
          },
        },
      ],
    };
  }

  change = (index, value) => {
    let dataSource = this.state.dataSource;
    let record = dataSource[index];
    record.value = value;
    this.setState({ dataSource });
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible) {
      this.setState({ visible: nextProps.visible });
      if (nextProps.visible) {
        this.setState({ loading: true });
        service.getRequestList(nextProps.id).then(res => {
          res.map(item => {
            item.value = item.defaultValue;
          });
          this.setState({ dataSource: res, loading: false });
        });
        service.getInterfaceById(nextProps.id).then(res => {
          this.setState({ info: res });
        });
      } else {
        this.setState({
          result: '',
          dataSource: [],
          time: 0,
          status: { code: 'default', text: '未开始' },
        });
      }
    }
  }

  onClose = () => {
    this.props.onClose && this.props.onClose();
  };

  send = () => {
    const { id } = this.props;
    const { info } = this.state;

    let params = {};

    this.state.dataSource.map(item => {
      params[item.keyCode] = item.value;
    });

    this.setState({ status: { code: 'processing', text: '请求中...' }, result: '' });

    let option = {
      url: info.reqUrl,
      method: info['requestMethod'],
      headers: {
        Authorization: 'Bearer ' + window.sessionStorage.getItem('token'),
      },
      body: params,
      params:
        info['requestMethod'] === 'get' || info['requestMethod'] === 'delete' ? params : undefined,
    };

    var start = new Date();

    axios(option)
      .then(result => {
        var end = new Date();
        this.setState({
          result: JSON.stringify(result.data, null, 4),
          time: end - start,
          status: { code: 'success', text: '成功' },
        });
      })
      .catch(error => {
        console.log(JSON.stringify(error));
        var end = new Date();
        this.setState({
          result: '',
          time: end - start,
          status: { code: 'error', text: error.response.statusText },
        });
      });

    // httpFetch[info["request-method"]](info.url, params).then(result => {
    //   var end = new Date();
    //   this.setState({ result: JSON.stringify(result.data, null, 4), time: end - start, status: { code: "success", text: "成功" } });
    // }).catch(error => {
    //   this.setState({ result: "", time: end - start, status: { code: "error", text: "失败" } });
    // })
  };

  render() {
    const { visible, columns, dataSource, result, status, time, loading } = this.state;
    return (
      <Drawer
        title="接口测试"
        placement="right"
        onClose={this.onClose}
        visible={visible}
        width="60vw"
      >
        <div>
          <Table
            pagination={false}
            dataSource={dataSource || []}
            columns={columns}
            bordered
            size="small"
            scroll={{ y: 300 }}
            rowKey="id"
            loading={loading}
          />
          <div style={{ textAlign: 'right', margin: '12px 0' }}>
            <Button type="primary" onClick={this.send}>
              发送请求
            </Button>
          </div>
          <div style={{ marginTop: 10 }}>
            <span>
              状态：<Badge status={status.code} text={status.text} />
            </span>
            <span style={{ marginLeft: 20 }}>
              发费时间：<span style={{ color: 'green' }}>{time}ms</span>
            </span>
          </div>
          <Input.TextArea value={result} rows={10} style={{ marginTop: 10 }} />
        </div>
      </Drawer>
    );
  }
}

export default InterfaceTest;
