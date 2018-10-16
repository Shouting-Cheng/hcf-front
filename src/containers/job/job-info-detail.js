import React from 'react';
import { Form, Button, Input, Select, Radio, message, InputNumber } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
import jobService from './job.service';
import { connect } from 'dva';

class JobInfoDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      queryFlag: true,
      record: {},
      loading: false,
      jobGroup: [],
      selectValue: false, // 运行模式是不是Bean
      editFlag: false,
      routeGroup: [
        { label: this.$t({ id: 'job.info.first' } /*第一个*/), value: 'FIRST' },
        { label: this.$t({ id: 'job.info.last' } /*最后一个*/), value: 'LAST' },
        { label: this.$t({ id: 'job.info.round' } /*轮询*/), value: 'ROUND' },
        { label: this.$t({ id: 'job.info.random' } /*随机*/), value: 'RANDOM' },
        {
          label: this.$t({ id: 'job.info.consistentHash' } /*一致性HASH*/),
          value: 'CONSISTENT_HASH',
        },
        {
          label: this.$t({ id: 'job.info.leastFrequentlyUsed' } /*最不经常使用*/),
          value: 'LEAST_FREQUENTLY_USED',
        },
        {
          label: this.$t({ id: 'job.info.leastRecentlyUsed' } /*最近最久未使用*/),
          value: 'LEAST_RECENTLY_USED',
        },
        { label: this.$t({ id: 'job.info.failover' } /*故障转移*/), value: 'FAILOVER' },
        { label: this.$t({ id: 'job.info.busyover' } /*忙碌转移*/), value: 'BUSYOVER' },
        {
          label: this.$t({ id: 'job.info.shardingBroadcast' } /*分片广播*/),
          value: 'SHARDING_BROADCAST',
        },
      ],
      glueTypeGroup: [
        { label: this.$t({ id: 'job.info.bean' } /*BEAN*/), value: 'BEAN' },
        { label: this.$t({ id: 'job.info.glueShell' } /*GLUE模式(Shell)*/), value: 'GLUE_SHELL' },
      ],
      executorBlockStrategyGroup: [
        {
          label: this.$t({ id: 'job.info.serialExecution' } /*单机串行*/),
          value: 'SERIAL_EXECUTION',
        },
        {
          label: this.$t({ id: 'job.info.discardLater' } /*丢弃后续调度*/),
          value: 'DISCARD_LATER',
        },
        { label: this.$t({ id: 'job.info.coverEarly' } /*覆盖之前调度*/), value: 'COVER_EARLY' },
      ],
      executorFailStrategygGroup: [
        { label: this.$t({ id: 'job.info.failAlarm' } /*失败告警*/), value: 'FAIL_ALARM' },
        { label: this.$t({ id: 'job.info.failRetry' } /*失败重试*/), value: 'FAIL_RETRY' },
      ],
    };
  }

  componentWillMount() {
    jobService
      .queryActuatorList()
      .then(res => {
        if (res.status === 200) {
          this.setState({
            jobGroup: res.data,
          });
        }
      })
      .catch(() => {
        message.error(
          this.$t({ id: 'common.error' } /*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*/)
        );
      });
  }

  componentDidMount() {
    const record = this.props.params.record;
    if (record.id) {
      let selectValue = false;

      if (record.glueType === 'BEAN') {
        selectValue = true;
      }
      this.setState({
        record: record,
        queryFlag: false,
        selectValue: selectValue,
        editFlag: true,
      });
      let values = this.props.form.getFieldsValue();
      for (let name in values) {
        let result = {};
        result[name] = record[name];
        this.props.form.setFieldsValue(result);
      }
    } else {
      this.setState({
        record: {},
        queryFlag: true,
        editFlag: false,
        selectValue: false,
      });
    }
  }

  onChange = e => {
    if (e === 'BEAN') {
      this.setState({
        selectValue: true,
      });
    } else {
      let result = {};
      result['executorHandler'] = null;
      this.props.form.setFieldsValue(result);
      this.setState({
        selectValue: false,
      });
    }
  };

  // 取消
  onCancel = () => {
    this.props.onClose();
  };
  // 保存
  handleSave = e => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        if (!this.state.record.id) {
          let param = { ...values };
          if (values['glueType'] !== 'BEAN') {
            param['glueSource'] =
              '#!/bin/bash\necho "xxl-job: hello shell"\n\necho "脚本位置：$0"\necho "任务参数：$1"\necho "分片序号 = $2"\necho "分片总数 = $3"\n\necho "Good bye!"\nexit 0\n';
            param['glueRemark'] = 'GLUE代码初始化';
          }
          jobService
            .saveJobInfo(param)
            .then(res => {
              if (res.data.code === 200) {
                this.props.onClose(true);
                message.success(this.$t({ id: 'common.operate.success' } /*操作成功*/));
                this.setState({ loading: false });
              } else {
                this.setState({ loading: false });
                message.error(
                  this.$t({ id: 'common.operate.filed' } /*操作失败*/) + '!' + res.data.msg
                );
              }
            })
            .catch(e => {
              this.setState({ loading: false });
              message.error(
                this.$t({ id: 'common.operate.filed' } /*操作失败*/) + '!' + e.response.data.message
              );
            });
        } else {
          let param = { ...values, id: this.state.record.id };
          jobService
            .updateJobInfo(param)
            .then(res => {
              if (res.data.code === 200) {
                this.props.onClose(true);
                message.success(this.$t({ id: 'common.operate.success' } /*操作成功*/));
                this.setState({ loading: false });
              } else {
                this.setState({ loading: false });
                message.error(
                  this.$t({ id: 'common.operate.filed' } /*操作失败*/) + '!' + res.data.msg
                );
              }
            })
            .catch(e => {
              this.setState({ loading: false });
              message.error(
                this.$t({ id: 'common.operate.filed' } /*操作失败*/) + '!' + e.response.data.message
              );
            });
        }
      }
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      jobGroup,
      loading,
      selectValue,
      routeGroup,
      glueTypeGroup,
      executorBlockStrategyGroup,
      executorFailStrategygGroup,
      editFlag,
    } = this.state;
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 13, offset: 1 },
    };
    return (
      <div className="new-payment-requisition-line">
        <Form onSubmit={this.handleSave}>
          <FormItem {...formItemLayout} label={this.$t({ id: 'job.info.group' } /*执行器*/)}>
            {getFieldDecorator('jobGroup', {
              rules: [
                {
                  required: true,
                },
              ],
              initialValue: '',
            })(
              <Select disabled={editFlag}>
                {jobGroup.map(item => {
                  return (
                    <Option key={item.id} value={item.id}>
                      {item.title}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'job.info.remark' } /*任务描述*/)}>
            {getFieldDecorator('jobDesc', {
              rules: [
                {
                  required: true,
                },
              ],
              initialValue: '',
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'job.info.route' } /*路由策略*/)}>
            {getFieldDecorator('executorRouteStrategy', {
              rules: [
                {
                  required: true,
                },
              ],
              initialValue: '',
            })(
              <Select>
                {routeGroup.map(item => {
                  return (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'job.info.cron' } /*cron表达式*/)}>
            {getFieldDecorator('jobCron', {
              rules: [
                {
                  required: true,
                },
              ],
              initialValue: '',
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'job.info.glueType' } /*运行模式*/)}>
            {getFieldDecorator('glueType', {
              rules: [
                {
                  required: true,
                },
              ],
              initialValue: '',
            })(
              <Select onChange={this.onChange} disabled={editFlag}>
                {glueTypeGroup.map(item => {
                  return (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.$t({ id: 'job.info.handle' } /*executorHandler*/)}
          >
            {getFieldDecorator('executorHandler', {
              rules: [
                {
                  required: selectValue,
                },
              ],
              initialValue: '',
            })(<Input disabled={!selectValue} />)}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'job.info.params' } /*执行参数*/)}>
            {getFieldDecorator('executorParam', {
              rules: [{}],
              initialValue: '',
            })(<Input placeholder={'多个参数用 , 隔开'} />)}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.$t({ id: 'job.info.childJobKey' } /*子任务Key*/)}
          >
            {getFieldDecorator('childJobKey', {
              rules: [{}],
              initialValue: '',
            })(<Input placeholder={'多个子任务用 , 隔开'} />)}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.$t({ id: 'job.info.executorBlockStrategy' } /*阻塞处理策略*/)}
          >
            {getFieldDecorator('executorBlockStrategy', {
              rules: [
                {
                  required: true,
                },
              ],
              initialValue: '',
            })(
              <Select>
                {executorBlockStrategyGroup.map(item => {
                  return (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.$t({ id: 'job.info.executorFailStrategy' } /*失败处理策略*/)}
          >
            {getFieldDecorator('executorFailStrategy', {
              rules: [
                {
                  required: true,
                },
              ],
              initialValue: '',
            })(
              <Select>
                {executorFailStrategygGroup.map(item => {
                  return (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'job.info.person' } /*负责人*/)}>
            {getFieldDecorator('author', {
              rules: [
                {
                  required: true,
                },
              ],
              initialValue: '',
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'job.info.alarmEmail' } /*报警邮件*/)}>
            {getFieldDecorator('alarmEmail', {
              rules: [
                {
                  required: false,
                },
              ],
              initialValue: '',
            })(
              <TextArea
                placeholder={'多个邮件地址请用 , 隔开'}
                autosize={{ minRows: 2, maxRows: 6 }}
              />
            )}
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={loading}>
              {this.$t({ id: 'common.save' } /*保存*/)}
            </Button>
            <Button onClick={this.onCancel} loading={loading}>
              {this.$t({ id: 'common.cancel' } /*取消*/)}
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}
const wrappedJobInfoDetail = Form.create()(JobInfoDetail);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedJobInfoDetail);
