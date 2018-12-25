/**
 * 操作：停用
 * 适用：已通过(info.status === 1003) 且 单据未停用(info.closed === false) 的 差旅申请单、费用申请单
 *      且 info.applicationParticipant.closed === 0 && info.customFormProperties.participantEnable === 1
 */
import React from 'react';
import { connect } from 'dva';
import { Form, Button, Modal, message } from 'antd';
import PropTypes from 'prop-types';

import requestService from 'containers/request/request.service';

class TravelExpireBtn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      formType: null,
      info: {},
      showExpireBtn: false, //是否显示【停用】按钮
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
            if (info.applicationParticipant) {
              if (
                info.applicationParticipant.closed === 0 &&
                info.customFormProperties.participantEnable === 1
              ) {
                this.setState({ showExpireBtn: true });
              }
            }
          }
        }
      );
    }
  }

  handleExpire = () => {
    Modal.confirm({
      title: this.$t('request.detail.btn.expire.is.close.application'), //是否停用该申请单
      content: this.$t('request.detail.btn.expire.notice'), //停用后将不可与报销单关联
      onOk: this.handleExpireOk,
    });
  };

  handleExpireOk = () => {
    this.setState({ loading: true });
    requestService
      .expireApplication(
        this.state.info.applicationOid,
        this.state.info.applicationParticipant.participantOid
      )
      .then(res => {
        this.setState({ loading: false });
        switch (res.data.errorCode) {
          case 1000:
            message.success(this.$t('common.operate.success'));
            this.context.router.push(this.state.applicationList.url);
            break;
          case 1001:
            message.error(this.$t('request.detail.btn.expire.closeStatus.has.not.paid')); //部分关联报销单未付款
            break;
          case 1002:
            message.error(this.$t('request.detail.btn.expire.closeStatus.none.operator')); //当前操作人不存在
            break;
          case 1003:
            message.error(this.$t('request.detail.btn.expire.closeStatus.already.close')); //当前申请单已停用
            break;
          default:
            message.error(this.$t('common.operate.filed'));
        }
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  render() {
    const { loading, showExpireBtn } = this.state;
    return (
      <div className="travel-expire-btn request-btn">
        {showExpireBtn && (
          <Button type="primary" loading={loading} onClick={this.handleExpire}>
            {this.$t('request.detail.btn.expire') /*停 用*/}
          </Button>
        )}
      </div>
    );
  }
}

TravelExpireBtn.propTypes = {
  formType: PropTypes.number.isRequired,
  info: PropTypes.object.isRequired,
};

function mapStateToProps() {
  return {};
}

const wrappedTravelExpireBtn = Form.create()(TravelExpireBtn);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedTravelExpireBtn);
