import React from 'react';
import { connect } from 'dva';
import { Button, message, Popconfirm, Tag, } from 'antd';
import Table from 'widget/table'
import jobService from './job.service';
import SlideFrame from 'widget/slide-frame';
import JobActuatorDetail from './job-actuator-detail';

class JobActuator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      total: 0,
      columns: [
        {
          title: this.$t({ id: 'job.sort' } /*排序*/),
          dataIndex: 'order',
          align: 'center',
          width: 100,
        },
        {
          title: this.$t({ id: 'job.appName' } /*代码*/),
          dataIndex: 'appName',
          align: 'center',
          width: 100,
        },
        {
          title: this.$t({ id: 'job.appTitle' } /*名称*/),
          dataIndex: 'title',
          align: 'center',
          width: 100,
        },
        {
          title: this.$t({ id: 'job.initType' } /*注册方式*/),
          dataIndex: 'addressType',
          align: 'center',
          width: 100,
          render: (value, record) => {
            return (
              <div>
                <Tag color="#000" key={record.id}>
                  {value === 0
                    ? this.$t({ id: 'job.initType.auto' } /*自动*/)
                    : this.$t({ id: 'job.initType.manual' } /*手工*/)}
                </Tag>
              </div>
            );
          },
        },
        {
          title: this.$t({ id: 'job.address' } /*机器地址*/),
          dataIndex: 'registryList',
          align: 'center',
          width: 100,
          render: (value, record) => {
            return value === null
              ? ''
              : value.map(item => {
                  return (
                    <div key={item}>
                      <Tag color="green">{item}</Tag>
                    </div>
                  );
                });
          },
        },
        {
          title: this.$t({ id: 'job.operator' } /*操作*/),
          dataIndex: 'id',
          align: 'center',
          width: 100,
          render: (text, record) => (
            <span>
              <a onClick={e => this.editItem(e, record)}>
                {this.$t({ id: 'common.edit' } /*编辑*/)}
              </a>
              <span className="ant-divider" />
              <Popconfirm
                key={record.id}
                title={this.$t({ id: 'common.confirm.delete' } /*确定要删除吗？*/)}
                onConfirm={e => this.deleteItem(e, record)}
              >
                <a>{this.$t({ id: 'common.delete' } /*删除*/)}</a>
              </Popconfirm>
            </span>
          ),
        },
      ],
      editRecord: {},
      frameFlag: false,
      frameTitle: '',
    };
  }

  componentWillMount() {
    this.getList();
  }

  getList = () => {
    this.setState({ loading: true });
    jobService
      .queryActuatorList()
      .then(res => {
        if (res.status === 200) {
          this.setState({
            loading: false,
            data: res.data,
            total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
          });
        } else {
          this.setState({ loading: false });
          message.error(
            this.$t({ id: 'common.error' } /*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*/)
          );
        }
      })
      .catch(() => {
        this.setState({ loading: false });
        message.error(
          this.$t({ id: 'common.error' } /*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*/)
        );
      });
  };

  //窗口关闭
  cancelWindow = () => {
    this.setState({ frameFlag: false });
    this.getList();
  };
  //窗口完全关闭后回掉
  restFormFunc = () => {
    this.setState({ frameFlag: false }, () => {
      this.getList();
    });
  };
  //编辑
  editItem = (e, record) => {
    this.setState({
      frameFlag: true,
      editRecord: record,
      frameTitle: this.$t({ id: 'job.info.edit' } /*编辑*/),
    });
  };
  // 新建
  handOpenModal = () => {
    this.setState({
      frameFlag: true,
      editRecord: {},
      frameTitle: this.$t({ id: 'job.info.add' } /*新增*/),
    });
  };

  // 删除
  deleteItem = (e, record) => {
    jobService
      .removeActuator(record.id)
      .then(res => {
        if (res.data.code === 200) {
          message.success(this.$t({ id: 'common.operate.success' } /*操作成功*/));
          this.getList();
        } else {
          message.error(this.$t({ id: 'common.operate.filed' } /*操作失败*/) + '!' + res.data.msg);
        }
      })
      .catch(e => {
        message.error(
          this.$t({ id: 'common.operate.filed' } /*操作失败*/) + '!' + e.response.data.message
        );
      });
  };
  render() {
    const { columns, data, loading, total, frameFlag, editRecord, frameTitle } = this.state;
    return (
      <div className="header-title">
        <div className="table-header">
          <div className="table-header-title">
            {this.$t({ id: 'common.total' }, { total: total } /*共搜索到*/)}
          </div>
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handOpenModal}>
              {this.$t({ id: 'common.create' } /*新建*/)}
            </Button>
          </div>
        </div>
        <Table
          rowKey={record => record.id}
          columns={columns}
          dataSource={data}
          loading={loading}
          bordered={true}
          size="middle"
        />
        <SlideFrame
          title={frameTitle}
          show={frameFlag}
          onClose={this.cancelWindow}
          afterClose={this.restFormFunc}
        >
          <JobActuatorDetail
            params={{ record: editRecord, flag: frameFlag }}
            onClose={this.cancelWindow}
          />
        </SlideFrame>
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
)(JobActuator);
