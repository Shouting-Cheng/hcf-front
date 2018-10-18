/**
 * 操作：撤回
 * 适用：审批中 的 所有申请单
 * fp['ca.opt.withdraw.disabled'] === true 则不显示
 * fp['ca.opt.withdraw.disabled'] === false 且 fp['bill.approved.withdraw'] === true 且 withdrawFlag === 'N' 则不显示
 */
import React from 'react'
import { connect } from 'dva'
import { Form, Button, message } from 'antd'
import PropTypes from 'prop-types';

import requestService from 'containers/request/request.service'

class RecallBtn extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    }
  }

  //撤回
  handleRecall = () => {
    let params = {
      entities:[{
        entityOID: this.props.info.applicationOID,
        entityType: 1001 //申请单
      }]
    };
    this.setState({ loading: true });
    requestService.recallRequest(params).then(res => {
      this.setState({ loading: false });
      if (res.data.failNum) {
        let reason = '';
        Object.keys(res.data.failReason).map(key => {
          reason = res.data.failReason[key]
        });
        message.error(`${this.$t('common.operate.filed')}，${reason}`)
      } else {
        message.success(this.$t('common.operate.success'));
        this.context.router.push(this.state.applicationList.url)
      }
    }).catch(e => {
      this.setState({ loading: false });
      message.error(`${this.$t('common.operate.filed')}，${e.response.data.message}`)
    })
  };

  render() {
    const { loading } = this.state;
    const { info } = this.props;
    let recallVisible = true;
    if (this.checkFunctionProfiles('ca.opt.withdraw.disabled', [true]) ||
       (this.checkFunctionProfiles('ca.opt.withdraw.disabled', [false]) &&
          this.checkFunctionProfiles('bill.approved.withdraw', [true]) &&
          info.withdrawFlag === 'N')) {
      recallVisible = false
    }
    return (
      <div className="recall-btn request-btn">
        {info.status === 1002 && info.rejectType === 1000 && recallVisible &&
          <Button type="primary"
                  loading={loading}
                  onClick={this.handleRecall}>{this.$t('request.detail.btn.recall')/*撤 回*/}</Button>
        }
      </div>
    )
  }
}

RecallBtn.propTypes = {
  info: PropTypes.object.isRequired
};

function mapStateToProps() {
  return { }
}

const wrappedRecallBtn = Form.create()(RecallBtn);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedRecallBtn)
