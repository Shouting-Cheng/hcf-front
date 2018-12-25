/**
 * 操作：重新启用
 * 适用：已通过(info.status === 1003) 且 单据未停用(info.closed === false) 的 差旅申请单、费用申请单
 *      且 info.applicationParticipant.closed === 0 && info.customFormProperties.participantEnable === 1
 */
import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Button, Modal, message } from 'antd';

import requestService from 'containers/request/request.service';
import PropTypes from 'prop-types';

class TraveRestartBtn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      formType: null,
      info: {},
      showRestartBtn: false, //是否显示【重新启用】按钮
      restartCloseDay: 0, //重新启用多少天后停用
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.formType || !this.state.info.applicationOid) {
      this.setState(
        {
          formType: nextProps.formType,
          info: nextProps.info,
        },
        () => {
          const { formType, info } = this.state;
          if ((formType === 2001 || formType === 2002) && info.status === 1003 && !info.closed) {
            //单据未停用时，停用启用只和个人的配置有关
            //如果配置了可重新启用，就一定也配置了重新启用多少天后停用
            if (info.applicationParticipant) {
              if (
                info.applicationParticipant.closed === 1 &&
                info.customFormProperties.participantEnable === 1
              ) {
                this.setState({
                  showRestartBtn: true,
                  restartCloseDay: info.customFormProperties.restartCloseDay,
                });
              }
            }
          }
        }
      );
    }
  }

  handleRestart = () => {
    let closeDate = new Date(
      new Date().getTime() + this.state.restartCloseDay * 24 * 60 * 60 * 1000
    );
    Modal.confirm({
      title: this.$t('request.detail.btn.restart.confirm.title'), //是否重新启用该申请单
      content: `${this.$t('request.detail.btn.restart.next.close.date') /*下次停用时间*/}：${moment(
        closeDate
      ).format('YYYY-MM-DD')}`,
      onOk: this.handleRestartOk,
    });
  };

  handleRestartOk = () => {
    const { info, restartCloseDay } = this.state;
    this.setState({ loading: true });
    requestService
      .restartApplication(
        info.applicationOid,
        info.applicationParticipant.participantOid,
        restartCloseDay
      )
      .then(res => {
        this.setState({ loading: false });
        if (res.data) {
          message.success(this.$t('common.operate.success'));
          this.context.router.push(this.state.applicationList.url);
        } else {
          message.success(this.$t('common.operate.filed'));
        }
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  render() {
    const { loading, showRestartBtn } = this.state;
    return (
      <div className="travel-expire-btn request-btn">
        {showRestartBtn && (
          <Button type="primary" loading={loading} onClick={this.handleRestart}>
            {this.$t('request.detail.btn.restart') /*重新启用*/}
          </Button>
        )}
      </div>
    );
  }
}

TraveRestartBtn.propTypes = {
  formType: PropTypes.number.isRequired,
  info: PropTypes.object.isRequired,
};

function mapStateToProps() {
  return {};
}

const wrappedTravelExpireBtn = Form.create()(TraveRestartBtn);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedTravelExpireBtn);
