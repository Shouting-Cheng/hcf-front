/**
 * Created by zhouli on 18/6/12
 * Email li.zhou@huilianyi.com
 */
import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';

import { Modal, Button } from 'antd';

import 'styles/components/Template/stop-announce/stop-announce.scss';
import StopAnnounceService from 'components/Template/stop-annonuce/stop-annonuce.service';
import StopAnnounceImage from 'images/stop-annonuce.png';
import moment from 'moment';

class StopAnnounceModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      title: '', //公告标题
      content: <div />, //公告内容
      effectiveDate: '',
      endTime: '',
      announceType: 200, //公告类型，停机公告100,维护公告200
      remindFlag: 1, //停机公告1代表停机预告，2代表停机
      isRightPerson: false, //是否是白名单的人

      isShowedModal: false, //针对停机预告，与维护公告，只展示一次，就不展示了
    };
  }

  componentWillMount() {}

  componentDidMount() {
    this.getStopAnnounce();

    if (localStorage.getItem('hly.token')) {
      // bug 15224
      // 登陆之后，不用调白名单;
      // 默认直接设置为非白名单的人（180625与魏胜确认）
      this.setState({
        isRightPerson: false,
      });
    } else {
      if (this.props.user.mobile || this.props.user.email) {
        let login =
          sessionStorage.getItem('loginAccount') || this.props.user.mobile || this.props.user.email;
        this.getIsWhiteList(login);
      }
    }
  }

  getIsWhiteList = login => {
    StopAnnounceService.getIsWhiteList(login)
      .then(res => {
        let data = res.data;
        if (data.result === 'false') {
          this.setState({
            isRightPerson: false,
          });
        } else {
          this.setState({
            isRightPerson: true,
          });
        }
      })
      .catch(err => {
        //白名单发送错误，尝试让用户登录
        this.setState({
          isRightPerson: true,
        });
      });
  };

  getStopAnnounce = () => {
    //停机公告之后，同步调用运维公告
    let account = this.props.user.mobile || this.props.user.email;
    let userOID = this.props.user.userOID;
    let tenantId = this.props.user.tenantId;
    let language = this.props.user.language;
    if (language) {
      language = this.props.user.language.toLowerCase();
    }
    StopAnnounceService.getOperationAnnouncements(tenantId, userOID, account, language)
      .then(res => {
        let data = res.data;
        if (data && data.title) {
          this.setInitStateModal(data);
        } else {
          this.setInitState();
        }
      })
      .catch(() => {
        this.setInitState();
      });
  };
  //显示模态框，针对预告与维护公告类型，需要记录状态
  setInitStateModal = data => {
    let visible = false;
    if (data.type === 100) {
      //如果是停机，弹窗显示，不用记录isShowedModal
      visible = true;
      this.state.isShowedModal = false;
    } else {
      if (this.state.isShowedModal) {
        //如果已经提示过，就不要提示了
        visible = false;
      } else {
        visible = true;
      }
      //记录模态框已经提示
      this.state.isShowedModal = true;
    }
    this.setState({
      title: data.title,
      content: data.content,
      effectiveDate: moment(data.effectiveDate).format('YYYY-MM-DD HH:mm'),
      endTime: moment(data.endTime).format('YYYY-MM-DD HH:mm'),
      visible: visible,
      remindFlag: data.remindFlag,
      announceType: data.type,
    });
  };
  setInitState = () => {
    this.setState({
      title: '',
      content: <div />,
      effectiveDate: '',
      endTime: '',
      visible: false,
      remindFlag: 1,
      announceType: 200,
    });
  };
  //点击弹窗关闭按钮
  handleCancel = () => {
    this.setState({
      visible: false,
    });
    if (this.props.onCancel) {
      this.props.onCancel();
    }
    this.gotoRightPageByType();
  };
  //点击知道了按钮
  handleOk = () => {
    this.setState({
      visible: false,
    });
    if (this.props.onConfirm) {
      this.props.onConfirm();
    }
    this.gotoRightPageByType();
  };

  //根据公告类型，去相应的页面
  gotoRightPageByType = () => {
    //根据公告类型，去相应的页面
    if (this.state.announceType === 100) {
      //停机类型
      //如果不是白名单的人去登录页
      if (!this.state.isRightPerson && this.state.remindFlag === 2) {
        //正在停机
        window.localStorage.clear();
        window.sessionStorage.clear();
        this.context.router.push('/?logout_sso=true');
      } else {
        //停机预告
      }
    } else {
      //运维类型
      //停留当前页
      //不要考虑remindFlag==2
    }
  };

  render() {
    return (
      <div className="stop-annonuce-wrap">
        <div className="stop-annonuce-modal-wrap" />
        <Modal
          width={748}
          getContainer={() => {
            return document.getElementsByClassName('stop-annonuce-modal-wrap')[0];
          }}
          className="stop-annonuce-modal-wrap-modal"
          title={null}
          visible={this.state.visible}
          footer={null}
          onCancel={this.handleCancel}
        >
          <div className="stop-annonuce">
            <div className="f-left image-wrap">
              <img src={StopAnnounceImage} />
            </div>
            <div className="f-right right-content">
              <div className="title">{this.state.title}</div>
              <div className="content">
                <div>
                  {' '}
                  {this.state.effectiveDate} &nbsp; {this.$t('stop-announce.to')} &nbsp;{' '}
                  {this.state.endTime}
                </div>
                <div dangerouslySetInnerHTML={{ __html: this.state.content }} />
              </div>
              <div className="btn-wrap">
                <Button type="primary" size="large" onClick={this.handleOk}>
                  {/*好的，我知道了*/}
                  {this.$t('stop-announce.ok')}
                </Button>
              </div>
            </div>
            <div className="clear" />
          </div>
        </Modal>
      </div>
    );
  }
}

StopAnnounceModal.propTypes = {
  onConfirm: PropTypes.func, // 点击确认之后的回调：返回结果
  onCancel: PropTypes.func, //点击取消的时候
};

StopAnnounceModal.defaultProps = {};

function mapStateToProps(state) {
  return {
    profile: state.login.profile,
    user: state.login.user,
    tenantMode: state.main.tenantMode,
    company: state.login.company,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(StopAnnounceModal);
