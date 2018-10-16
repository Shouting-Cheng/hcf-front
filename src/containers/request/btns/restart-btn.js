import {messages} from "share/common";
/**
 * 操作：重新启用
 * 适用：已通过(info.status === 1003) 且 单据未停用(info.closed === false) 的 差旅申请单、费用申请单
 *      且 info.applicationParticipant.closed === 0 && info.customFormProperties.participantEnable === 1
 */
import React from 'react'
import { connect } from 'react-redux'
import menuRoute from 'routes/menuRoute'
import moment from 'moment'
import { Form, Button, Modal, message } from 'antd'

import requestService from 'containers/request/request.service'

class TraveRestartBtn extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      formType: null,
      info: {},
      showRestartBtn: false, //是否显示【重新启用】按钮
      restartCloseDay: 0, //重新启用多少天后停用
      applicationList: menuRoute.getRouteItem('request','key'), //申请单列表页
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.formType || !this.state.info.applicationOID) {
      this.setState({
        formType: nextProps.formType,
        info: nextProps.info
      }, () => {
        const { formType, info } = this.state;
        if ((formType === 2001 || formType === 2002) && info.status === 1003 && !info.closed) {
          //单据未停用时，停用启用只和个人的配置有关
          //如果配置了可重新启用，就一定也配置了重新启用多少天后停用
          if (info.applicationParticipant) {
            if (info.applicationParticipant.closed === 1 && info.customFormProperties.participantEnable === 1) {
              this.setState({
                showRestartBtn: true,
                restartCloseDay: info.customFormProperties.restartCloseDay
              })
            }
          }
        }
      })
    }
  }

  handleRestart = () => {
    let closeDate = new Date(new Date().getTime() + this.state.restartCloseDay * 24 * 60 * 60 * 1000);
    Modal.confirm({
      title: messages('request.detail.btn.restart.confirm.title'), //是否重新启用该申请单
      content: `${messages('request.detail.btn.restart.next.close.date')/*下次停用时间*/}：${moment(closeDate).format('YYYY-MM-DD')}`,
      onOk: this.handleRestartOk
    });
  };

  handleRestartOk = () => {
    const { info, restartCloseDay } = this.state;
    this.setState({ loading: true });
    requestService.restartApplication(info.applicationOID, info.applicationParticipant.participantOID, restartCloseDay).then(res => {
      this.setState({ loading: false });
      if (res.data) {
        message.success(messages('common.operate.success'));
        this.context.router.push(this.state.applicationList.url);
      } else {
        message.success(messages('common.operate.filed'));
      }
    }).catch(() => {
      this.setState({ loading: false })
    })
  };

  render() {
    const { loading, showRestartBtn } = this.state;
    return (
      <div className="travel-expire-btn request-btn">
        {showRestartBtn && (
          <Button type="primary" loading={loading} onClick={this.handleRestart}>{messages('request.detail.btn.restart')/*重新启用*/}</Button>
        )}
      </div>
    )
  }
}

TraveRestartBtn.propTypes = {
  formType: React.PropTypes.number.isRequired,
  info: React.PropTypes.object.isRequired
};

TraveRestartBtn.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps() {
  return { }
}

const wrappedTravelExpireBtn = Form.create()(TraveRestartBtn);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedTravelExpireBtn)
