import React from 'react';
import { connect } from 'dva';
import { Button, message, Tag, Table, Icon, Popover, Modal, Menu, Dropdown } from 'antd';
import jobService from './job.service';
import moment from 'moment';
import config from 'config';
import SearchArea from 'widget/search-area';

import LogDetail from './job-log-detail';
class JobLog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      searchParams: {},
      page: 0,
      pageSize: 10,
      columns: [
        {
          title: this.$t({ id: 'job.info.jobKey' } /*JobKey*/),
          dataIndex: 'jobGroup',
          align: 'center',
          width: 70,
          render: (text, record) => {
            return record.jobGroup + '_' + record.jobId;
          },
        },
        {
          title: this.$t({ id: 'job.log.triggerTime' } /*调度时间*/),
          dataIndex: 'triggerTime',
          align: 'center',
          width: 130,
          render: value => (value === null ? '' : moment(value).format('YYYY-MM-DD HH:mm:ss')),
        },
        {
          title: this.$t({ id: 'job.log.triggerCode' } /*调度结果*/),
          dataIndex: 'triggerCode',
          align: 'center',
          width: 120,
          render: value => {
            return value === 200 ? (
              <div>
                <span>
                  <Tag color="#87d068">{this.$t({ id: 'job.log.success' } /*成功*/)}</Tag>
                </span>
              </div>
            ) : value === 500 ? (
              <div>
                <span>
                  <Tag color="#f50">{this.$t({ id: 'job.log.fail' } /*失败*/)}</Tag>
                </span>
              </div>
            ) : (
              <div>
                <span>
                  <Tag color="#2db7f5">{this.$t({ id: 'job.log.running' } /*运行中*/)}</Tag>
                </span>
              </div>
            );
          },
        },
        {
          title: this.$t({ id: 'job.log.triggerMsg' } /*调度备注*/),
          dataIndex: 'triggerMsg',
          align: 'center',
          width: 120,
          render: value => {
            return (
              <Popover
                content={<div dangerouslySetInnerHTML={{ __html: value }} />}
                overlayStyle={{ maxWidth: 550 }}
                trigger="click"
              >
                <a>查看</a>
              </Popover>
            );
          },
        },
        {
          title: this.$t({ id: 'job.log.handleTime' } /*执行时间*/),
          dataIndex: 'handleTime',
          align: 'center',
          width: 130,
          render: value => (value === null ? '' : moment(value).format('YYYY-MM-DD HH:mm:ss')),
        },
        {
          title: this.$t({ id: 'job.log.handleCode' } /*执行结果*/),
          dataIndex: 'handleCode',
          align: 'center',
          width: 120,
          render: value => {
            return value === 200 ? (
              <div>
                <span>
                  <Tag color="#87d068">{this.$t({ id: 'job.log.success' } /*成功*/)}</Tag>
                </span>
              </div>
            ) : value === 500 ? (
              <div>
                <span>
                  <Tag color="#f50">{this.$t({ id: 'job.log.fail' } /*失败*/)}</Tag>
                </span>
              </div>
            ) : (
              <div>
                <span>
                  <Tag color="#2db7f5">{this.$t({ id: 'job.log.running' } /*运行中*/)}</Tag>
                </span>
              </div>
            );
          },
        },
        {
          title: this.$t({ id: 'job.log.handleMsg' } /*执行备注*/),
          dataIndex: 'handleMsg',
          align: 'center',
          width: 120,
          render: value => {
            return value === null || value === '' ? (
              <span>{this.$t({ id: 'job.log.no.data' } /*暂无数据*/)}</span>
            ) : (
              <Popover
                overlayStyle={{ maxWidth: 750 }}
                content={<div dangerouslySetInnerHTML={{ __html: value }} />}
                trigger="click"
              >
                <a>{this.$t({ id: 'job.log.view' } /*查看*/)}</a>
              </Popover>
            );
          },
        },
        {
          title: this.$t({ id: 'job.operator' } /*操作*/),
          dataIndex: 'id',
          width: 180,
          render: (value, record) => (
            <div>
              <span>
                <a onClick={e => this.viewRunLog(e, record)}>
                  {this.$t({ id: 'job.log.console' } /*执行日志*/)}
                </a>
              </span>
              {record.handleCode === 0 ? (
                <span>
                  <span className="ant-divider" />
                  <span>
                    <a onClick={e => this.kill(e, record)}>
                      {this.$t({ id: 'job.task.kill' } /*终止任务*/)}
                    </a>
                  </span>
                </span>
              ) : (
                ''
              )}
            </div>
          ),
        },
      ],
      viewRecord: {},
      frameFlag: false,
      searchForm: [
        {
          type: 'select',
          id: 'jobGroup',
          colSpan: 6,
          label: this.$t({ id: 'job.info.group' } /*执行器*/),
          options: [],
          getUrl: `${config.jobUrl}/api/jobgroup`,
          method: 'get',
          labelKey: 'title',
          valueKey: 'id',
        }, //执行器
        {
          type: 'list',
          colSpan: 6,
          selectorItem: {
            title: this.$t({ id: 'job.log.task' } /*任务*/),
            url: `${config.jobUrl}/api/jobinfo/pageList`,
            searchForm: [
              {
                type: 'input',
                id: 'JobHandler',
                label: this.$t({ id: 'job.info.handle' } /*JobHandler*/),
              },
            ],
            columns: [
              { title: 'id', dataIndex: 'id', width: 150 },
              {
                title: this.$t({ id: 'job.info.remark' } /*描述*/),
                dataIndex: 'jobDesc',
                width: 250,
              },
            ],
            key: 'id',
          },
          id: 'jobId',
          label: this.$t({ id: 'job.log.task' } /*任务*/),
          labelKey: 'jobDesc',
          valueKey: 'id',
          single: true,
        },
        {
          type: 'select',
          colSpan: 6,
          id: 'logStatus',
          label: this.$t({ id: 'job.log.status' } /*状态*/),
          options: [
            { value: -1, label: this.$t({ id: 'job.log.all' } /*全部*/) },
            { value: 1, label: this.$t({ id: 'job.log.success' } /*成功*/) },
            { value: 2, label: this.$t({ id: 'job.log.fail' } /*失败*/) },
            { value: 3, label: this.$t({ id: 'job.log.running' } /*运行中*/) },
          ],
          key: '',
        },
        {
          type: 'rangeDateTimePicker',
          colSpan: 6,
          id: 'dateRange',
          label: this.$t({ id: 'job.log.triggerTime' } /*调度时间*/),
        },
      ],
      searchForm1: [
        {
          type: 'select',
          id: 'logStatus',
          label: this.$t({ id: 'job.log.status' } /*状态*/),
          options: [
            { value: -1, label: this.$t({ id: 'job.log.all' } /*全部*/) },
            { value: 1, label: this.$t({ id: 'job.log.success' } /*成功*/) },
            { value: 2, label: this.$t({ id: 'job.log.fail' } /*失败*/) },
            { value: 3, label: this.$t({ id: 'job.log.running' } /*运行中*/) },
          ],
          key: '',
        },
        {
          type: 'rangeDateTimePicker',
          id: 'dateRange',
          label: this.$t({ id: 'job.log.triggerTime' } /*调度时间*/),
        },
      ],
      pagination: {
        total: 0,
      },
    };
  }

  componentWillMount() {
    if (this.props.params && this.props.params.jobInfoDetail) {
      this.setState(
        {
          searchParams: {
            jobGroup: this.props.params.jobInfoDetail.jobGroup,
            jobId: this.props.params.jobInfoDetail.id,
          },
        },
        () => {
          this.getList();
        }
      );
    } else {
      this.getList();
    }
  }

  getList = () => {
    this.setState({ loading: true });
    const { searchParams, page, pageSize } = this.state;
    jobService
      .queryLogList(page, pageSize, searchParams)
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
  //每页多少条
  onChangePageSize = (page, pageSize) => {
    if ((page - 1 !== this.state.page || pageSize !== this.state, pageSize)) {
      this.setState({ page: page - 1, pageSize: pageSize }, () => {
        this.getList();
      });
    }
  };
  onChangePaper = page => {
    if (page - 1 !== this.state.page) {
      this.setState({ page: page - 1 }, () => {
        this.getList();
      });
    }
  };
  // 搜索
  search = values => {
    let filterTimeFrom;
    let filterTimeTo;
    values.dateRange &&
      (filterTimeFrom = moment(values.dateRange[0]).format('YYYY-MM-DD HH:mm:ss'));
    values.dateRange && (filterTimeTo = moment(values.dateRange[1]).format('YYYY-MM-DD HH:mm:ss'));
    values.dateRange && (values.filterTime = filterTimeFrom + ' - ' + filterTimeTo);
    values.dateRange = undefined;
    if (this.props.params && this.props.params.jobInfoDetail) {
      this.setState(
        {
          searchParams: {
            jobGroup: this.props.params.jobInfoDetail.jobGroup,
            jobId: this.props.params.jobInfoDetail.id,
            page: 0,
            ...values,
          },
        },
        () => {
          this.getList();
        }
      );
    } else {
      this.setState({ searchParams: values, page: 0 }, () => {
        this.getList();
      });
    }
  };
  // 清除
  clearFunction = () => {
    if (this.props.params.jobInfoDetail) {
      this.setState({
        searchParams: {
          jobGroup: this.props.params.jobInfoDetail.jobGroup,
          jobId: this.props.params.jobInfoDetail.id,
        },
      });
    } else {
      this.setState({ searchParams: {} });
    }
  };

  // 删除
  deleteItem = deleteParams => {
    jobService
      .deleteLog(deleteParams)
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

  //弹出框关闭
  onClose = () => {
    this.setState({
      frameFlag: false,
    });
  };

  /**
   * 组装方法
   * @param content 内部组件
   * @return {*} 给组件添加this.props.close(params)方法,params为返回到最外层的值
   *             同时添加外部传入的props为内部组件可用
   */
  wrapClose = content => {
    let logDetail = this.state.viewRecord;
    const newProps = {
      params: { logDetail: logDetail },
    };
    return React.createElement(content, Object.assign({}, newProps.params, newProps));
  };
  // 查看执行日志
  viewRunLog = (e, record) => {
    this.setState({
      frameFlag: true,
      viewRecord: record,
    });
  };
  // 杀死
  kill = (e, record) => {
    jobService
      .kill(record.id)
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

  handleMenuClick = (e) => {
    let deleteParams = {};
    deleteParams['type'] = e.key;
    if (this.props.params && this.props.params.jobInfoDetail) {
      deleteParams['jobGroup'] = this.props.params.jobInfoDetail.jobGroup;
      deleteParams['jobId'] = this.props.params.jobInfoDetail.id;
    } else {
      deleteParams['jobGroup'] = -1;
      deleteParams['jobId'] = -1;
    }
    this.deleteItem(deleteParams);
  };

  render() {
    const {
      columns,
      data,
      loading,
      pagination,
      frameFlag,
      searchParams,
      searchForm,
      searchForm1,
    } = this.state;
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key={1}>
          {this.$t({ id: 'job.log.clear.oneMonth' } /*清理一个月之前日志数据*/)}
        </Menu.Item>
        <Menu.Item key={2}>
          {this.$t({ id: 'job.log.clear.threeMonth' } /*清理三个月之前日志数据*/)}
        </Menu.Item>
        <Menu.Item key={3}>
          {this.$t({ id: 'job.log.clear.sixMonth' } /*清理六个月之前日志数据*/)}
        </Menu.Item>
        <Menu.Item key={4}>
          {this.$t({ id: 'job.log.clear.oneYear' } /*清理一年之前日志数据*/)}
        </Menu.Item>
      </Menu>
    );

    return (
      <div className="header-title">
        <SearchArea
          maxLength={4}
          searchParams={searchParams}
          submitHandle={this.search}
          clearHandle={this.clearFunction}
          searchForm={
            this.props.params && this.props.params.jobInfoDetail ? searchForm1 : searchForm
          }
        />
        <div className="table-header">
          <div className="table-header-buttons">
            <Dropdown overlay={menu} trigger={['click']}>
              <Button icon="delete" type="primary">
                {this.$t({ id: 'job.log.clear' } /*清除日志*/)}
                <Icon type="down" />
              </Button>
            </Dropdown>
          </div>
        </div>
        <Table
          rowKey={record => record.id}
          columns={columns}
          dataSource={data}
          loading={loading}
          bordered={true}
          scroll={{ x: 1300 }}
          pagination={pagination}
          size="middle"
        />
        <Modal
          visible={frameFlag}
          footer={[
            <Button key="back" onClick={this.onClose}>
              {this.$t({ id: 'common.back' } /*返回*/)}
            </Button>,
          ]}
          width={1300}
          closable={false}
          destroyOnClose={true}
          onCancel={this.onClose}
        >
          <div>{this.wrapClose(LogDetail)}</div>
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
)(JobLog);
