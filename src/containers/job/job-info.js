import React from 'react';
import { connect } from 'dva';
import { Button, message, Popconfirm, Tag, Table, Icon, Popover, Modal } from 'antd';
import moment from 'moment';
import jobService from './job.service';
import SlideFrame from 'widget/slide-frame';
import JobInfoDetail from './job-info-detail';
import config from 'config';
import SearchArea from 'widget/search-area';
import LogDetail from './job-log';
import GlueDetail from './job-info-glue';
class JobInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      searchParams: {},
      page: 0,
      pageSize: 10,
      glueFlag: false,
      columns: [
        {
          title: this.$t({ id: 'job.info.jobKey' } /*JobKey*/),
          dataIndex: 'jobGroup',
          align: 'center',
          width: 70,
          render: (text, record) => {
            return (
              <Popover content={record.jobGroup + '_' + record.id}>
                {record.jobGroup + '_' + record.id}
              </Popover>
            );
          },
        },
        {
          title: this.$t({ id: 'job.info.remark' } /*描述*/),
          dataIndex: 'jobDesc',
          align: 'center',
          width: 70,
          render: text => {
            return <Popover content={text}>{text}</Popover>;
          },
        },
        {
          title: this.$t({ id: 'job.info.runType' } /*运行模式*/),
          dataIndex: 'title',
          align: 'center',
          width: 100,
          render: (text, record) => {
            return (
              <Popover content={record.executorHandler}>
                {record.glueType +
                  this.$t({ id: 'job.info.runType' } /*模式*/) +
                  (record.executorHandler === null ? '' : '：' + record.executorHandler)}
              </Popover>
            );
          },
        },
        {
          title: this.$t({ id: 'job.info.cron' } /*Cron表达式*/),
          dataIndex: 'jobCron',
          align: 'center',
          width: 60,
          render: text => {
            return <Popover content={text}>{text}</Popover>;
          },
        },
        {
          title: this.$t({ id: 'job.info.startTime' } /*开始时间*/),
          dataIndex: 'startTime',
          align: 'center',
          width: 130,
          render: value => (value === null ? '' : moment(value).format('YYYY-MM-DD HH:mm:ss')),
        },
        {
          title: this.$t({ id: 'job.info.nextTime' } /*下次执行时间*/),
          dataIndex: 'nextTime',
          align: 'center',
          width: 130,
          render: value => (value === null ? '' : moment(value).format('YYYY-MM-DD HH:mm:ss')),
        },
        {
          title: this.$t({ id: 'job.info.person' } /*负责人*/),
          dataIndex: 'author',
          align: 'center',
          width: 70,
        },
        {
          title: this.$t({ id: 'job.info.status' } /*状态*/),
          dataIndex: 'jobStatus',
          align: 'center',
          width: 60,
          render: (value, record) => {
            return value === 'PAUSED' || value === 'NONE' ? (
              <div>
                <span>
                  <Tag color="gray">
                    <i>
                      <Icon type="pause" />
                    </i>
                    {this.$t({ id: 'job.info.pause' } /*暂停*/)}
                  </Tag>
                </span>
              </div>
            ) : (
              <div>
                <span>
                  <Tag color="#87d068">
                    <i>
                      <Icon type="play-circle" />
                    </i>
                    {this.$t({ id: 'job.info.normal' } /*正常*/)}
                  </Tag>
                </span>
              </div>
            );
          },
        },

        {
          title: this.$t({ id: 'job.operator' } /*操作*/),
          dataIndex: 'id',
          width: 250,
          render: (text, record) => {
            return (
              <div>
                <Popconfirm
                  key={record.id + 'run'}
                  title={this.$t({ id: 'job.info.run.immediately' } /*立即执行*/)}
                  onConfirm={e => this.run(e, record)}
                >
                  <Tag color="#eebb1e">
                    <i>
                      <Icon type="play-circle" />
                    </i>
                    {this.$t({ id: 'job.info.run' } /*执行*/)}
                  </Tag>
                </Popconfirm>
                {record.jobStatus === 'PAUSED' || record.jobStatus === 'NONE' ? (
                  <Tag color="#87d068" onClick={e => this.start(e, record)}>
                    <i>
                      <Icon type="play-circle" />
                    </i>
                    {this.$t({ id: 'job.info.start' } /*启动*/)}
                  </Tag>
                ) : (
                  <Tag color="#f50" onClick={e => this.pause(e, record)}>
                    <i>
                      <Icon type="pause" />
                    </i>
                    {this.$t({ id: 'job.info.pause' } /*暂停*/)}
                  </Tag>
                )}
                <Tag color="#2db7f5" onClick={e => this.edit(e, record)}>
                  <i>
                    <Icon type="edit" />
                  </i>
                  {this.$t({ id: 'job.info.edit' } /*编辑*/)}
                </Tag>

                <Popconfirm
                  key={record.id + 'delete'}
                  title={this.$t({ id: 'common.confirm.delete' } /*确定要删除吗？*/)}
                  onConfirm={e => this.delete(e, record)}
                >
                  <Tag color="#ff0033">
                    <i>
                      <Icon type="delete" />
                    </i>
                    {this.$t({ id: 'job.info.delete' } /*删除*/)}
                  </Tag>
                </Popconfirm>
                <Tag color="#990099" onClick={e => this.viewLog(e, record)}>
                  <i>
                    <Icon type="file" />
                  </i>
                  {this.$t({ id: 'job.info.log' } /*日志*/)}
                </Tag>
                {record.glueType !== 'BEAN' && (
                  <Tag color="#003333" onClick={e => this.glue(e, record)}>
                    <i>
                      <Icon type="form" />
                    </i>GLUE
                  </Tag>
                )}
              </div>
            );
          },
        },
      ],
      editRecord: {},
      frameFlag: false,
      frameTitle: '',
      searchForm: [
        {
          type: 'select',
          id: 'jobGroup',
          label: this.$t({ id: 'job.info.group' } /*执行器*/),
          options: [],
          getUrl: `${config.jobUrl}/api/jobgroup`,
          method: 'get',
          labelKey: 'title',
          valueKey: 'id',
        }, //执行器
        {
          type: 'input',
          id: 'JobHandler',
          label: this.$t({ id: 'job.info.handle' } /*JobHandler*/),
        },
      ],
      pagination: {
        total: 0,
      },
      openWindowFlag: false,
      jobInfoDetail: {},
    };
  }

  componentWillMount() {
    this.getList();
  }

  getList = () => {
    this.setState({ loading: true });
    const { searchParams, page, pageSize } = this.state;
    jobService
      .queryInfoList(page, pageSize, searchParams)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            loading: false,
            data: res.data,
            pagination: {
              total: Number(res.headers['x-total-count'])
                ? Number(res.headers['x-total-count'])
                : 0,
              current: page + 1,
              pageSize: pageSize,
              onChange: this.onChangePaper,
              pageSizeOptions: ['10', '20', '30', '40'],
              showSizeChanger: true,
              onShowSizeChange: this.onChangePageSize,
              showQuickJumper: true,
              showTotal: (total, range) =>
                this.$t(
                  { id: 'common.show.total' },
                  { range0: `${range[0]}`, range1: `${range[1]}`, total: total }
                ),
            },
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
  onChangePaper = page => {
    if (page - 1 !== this.state.page) {
      this.setState({ page: page - 1 }, () => {
        this.getList();
      });
    }
  };
  //每页多少条
  onChangePageSize = (page, pageSize) => {
    if (page - 1 !== this.state.page || pageSize !== this.state.pageSize) {
      this.setState({ page: page - 1, pageSize: pageSize }, () => {
        this.getList();
      });
    }
  };
  // 搜索
  search = values => {
    this.setState({ searchParams: values, page: 0 }, () => {
      this.getList();
    });
  };
  // 清除
  clearFunction = () => {
    this.setState({ searchParams: {} });
  };

  //侧滑窗口关闭
  cancelWindow = () => {
    this.setState({ frameFlag: false });
    this.getList();
  };
  //侧滑窗口完全关闭后回掉
  restFormFunc = () => {
    this.setState({ frameFlag: false }, () => {
      this.getList();
    });
  };
  //编辑
  edit = (e, record) => {
    this.setState({
      frameFlag: true,
      editRecord: record,
      frameTitle: this.$t({ id: 'job.info.edit' } /*编辑*/),
    });
  };
  // 立即运行
  run = (e, record) => {
    jobService
      .runJobInfo(record.id)
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

  // 暂停
  pause = (e, record) => {
    jobService
      .pauseJobInfo(record.id)
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
  // 启动
  start = (e, record) => {
    jobService
      .startJobInfo(record.id)
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
  // 新建
  handOpenModal = () => {
    this.setState({
      frameFlag: true,
      editRecord: {},
      frameTitle: this.$t({ id: 'job.info.add' } /*新增*/),
    });
  };

  // 删除
  delete = (e, record) => {
    jobService
      .deleteJobInfo(record.id)
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
  // 查看日志
  viewLog = (e, record) => {
    this.setState({
      openWindowFlag: true,
      jobInfoDetail: record,
      glueFlag: false,
    });
  };

  // 编写代码
  glue = (e, record) => {
    this.setState({
      openWindowFlag: true,
      jobInfoDetail: record,
      glueFlag: true,
    });
  };
  //弹出框关闭
  onClose = () => {
    if (this.state.glueFlag) {
      this.setState(
        {
          openWindowFlag: false,
        },
        () => {
          this.getList();
        }
      );
    } else {
      this.setState({
        openWindowFlag: false,
      });
    }
  };
  /**
   * 组装方法
   * @param content 内部组件
   * @return {*} 给组件添加this.props.close(params)方法,params为返回到最外层的值
   *             同时添加外部传入的props为内部组件可用
   */
  wrapClose = content => {
    let jobInfoDetail = this.state.jobInfoDetail;
    const newProps = {
      close: this.onClose,
      params: { jobInfoDetail: jobInfoDetail },
    };
    return React.createElement(content, Object.assign({}, newProps.params, newProps));
  };
  render() {
    const {
      columns,
      data,
      loading,
      pagination,
      frameFlag,
      editRecord,
      frameTitle,
      searchParams,
      searchForm,
      openWindowFlag,
      glueFlag,
    } = this.state;
    return (
      <div className="header-title">
        <SearchArea
          maxLength={3}
          searchParams={searchParams}
          submitHandle={this.search}
          clearHandle={this.clearFunction}
          searchForm={searchForm}
        />
        <div className="table-header">
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
          pagination={pagination}
          bordered={true}
          scroll={{ x: 1400 }}
          size="middle"
        />
        <SlideFrame
          title={frameTitle}
          show={frameFlag}
          content={JobInfoDetail}
          params={{ record: editRecord, flag: frameFlag }}
          onClose={this.cancelWindow}
          afterClose={this.restFormFunc}
        >
          <JobInfoDetail
            onClose={this.cancelWindow}
            params={{ record: editRecord, flag: frameFlag }}
          />
        </SlideFrame>

        <Modal
          visible={openWindowFlag}
          footer={
            glueFlag
              ? null
              : [
                  <Button key="back" onClick={this.onClose}>
                    {this.$t({ id: 'common.back' } /*返回*/)}
                  </Button>,
                ]
          }
          width={1300}
          closable={false}
          destroyOnClose={true}
          onCancel={this.onClose}
        >
          <div>{glueFlag ? this.wrapClose(GlueDetail) : this.wrapClose(LogDetail)}</div>
        </Modal>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(JobInfo);
