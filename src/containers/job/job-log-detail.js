import React from 'react';
import { connect } from 'dva';
import { Button, message, Icon } from 'antd';
import moment from 'moment';
import jobService from './job.service';

class JobLogDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fromLineNum: 1,
      logContent: '<br><span style="color: green;">[Rolling Log Start]</span><br/>',
    };
  }

  componentWillMount() {
    /* let leaveInterval = setInterval(() => {
            this.getList(leaveInterval);
        }, 300)*/
    this.getList();
  }

  getList = () => {
    const { logDetail } = this.props.params;
    let searchParams = {};
    searchParams['triggerTime'] = moment(logDetail.triggerTime).valueOf();
    searchParams['logId'] = logDetail.id;
    searchParams['executorAddress'] = logDetail.executorAddress;
    let fromLineNum = this.state.fromLineNum;
    searchParams['fromLineNum'] = fromLineNum;

    jobService
      .queryJobDetail(searchParams)
      .then(res => {
        if (res.status === 200) {
          if (res.data.code === 200) {
            if (!res.data.content) {
              return;
            }
            if (fromLineNum !== res.data.content.fromLineNum) {
              return;
            }
            if (fromLineNum > res.data.content.toLineNum) {
              if (res.data.content.end) {
                this.logRunStop('<br><span style="color: green;">[Rolling Log Finish]</span>');
                return;
              }
              return;
            }
            // append content
            let content = res.data.content.logContent;
            content = content.replace(/\r\n/g, '<br>');
            content = content.replace(/\n/g, '<br>');
            this.setState(
              {
                fromLineNum: res.data.content.toLineNum + 1,
                logContent: this.state.logContent + content,
              },
              () => {
                setTimeout(() => {
                  this.getList();
                }, 3000);
              }
            );
          } else {
            message.error(res.data.msg);
          }
        } else {
          message.error(
            this.$t({ id: 'common.error' } /*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*/)
          );
        }
      })
      .catch(() => {
        message.error(
          this.$t({ id: 'common.error' } /*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*/)
        );
      });
  };

  logRunStop = content => {
    this.setState({
      logContent: this.state.logContent + content,
    });
  };
  // 刷新
  refresh = () => {
    this.setState(
      {
        fromLineNum: 1,
        logContent: '<br><span style="color: green;">[Rolling Log Start]</span><br/>',
      },
      () => {
        this.getList();
      }
    );
  };
  render() {
    const { logContent } = this.state;
    return (
      <div>
        <div onClick={this.refresh}>
          <span>
            <Icon type="reload" />
            {this.$t({ id: 'job.log.refresh' } /*刷新*/)}
          </span>
        </div>
        <div dangerouslySetInnerHTML={{ __html: logContent }} />
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
)(JobLogDetail);
