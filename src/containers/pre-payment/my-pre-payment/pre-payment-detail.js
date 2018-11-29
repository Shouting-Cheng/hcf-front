/**
 * Created by 13576 on 2017/12/4.
 */
import React from 'react';
import config from 'config';
import httpFetch from 'utils/httpFetch';
// import menuRoute from 'routes/menuRoute'
import { Form, Affix, Button, message, Modal } from 'antd';
const confirm = Modal.confirm;
import { connect } from 'dva';
import PrePaymentCommon from 'containers/pre-payment/my-pre-payment/pre-payment-common';
import 'styles/pre-payment/my-pre-payment/pre-payment-detail.scss';
import prePaymentService from 'containers/pre-payment/my-pre-payment/me-pre-payment.service';
import { routerRedux } from 'dva/router';

class PrePaymentDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dLoading: false,
      // myContract: menuRoute.getRouteItem('me-pre-payment', 'key'),
      // paymentDetail: menuRoute.getRouteItem('payment-detail', 'key'),    //支付详情
      headerData: {},
      id: 0,
    };
  }
  componentDidMount() {
    this.getInfo();
  }
  //获取预付款头信息
  getInfo = () => {
    let id = null;
    if (this.props.params && this.props.params.refund) {
      id = this.props.params.id;
    } else {
      id = this.props.match.params.id;
    }
    prePaymentService
      .getHeadById(id)
      .then(res => {
        if (!res.data) {
          message.error('该单据不存在！');
        }
        this.setState({
          headerData: res.data,
          id: id,
        });
      })
      .catch(e => {
        console.log(`获取预付款头信息失败：${e}`);
        message.error('预付款单据数据加载失败，请重试');
      });
  };
  //提交
  onSubmit = () => {
    const { applicationOid, empOid, formOid, documentOid, id } = this.state.headerData;
    let model = {
      applicantOID: applicationOid,
      userOID: empOid,
      formOID: formOid,
      entityOID: documentOid,
      entityType: 801003,
      countersignApproverOIDs: null,
    };
    this.setState({
      loading: true,
    });
    if (!formOid) {
      prePaymentService
        .submit(id, this.props.user.id)
        .then(res => {
          if (res.status === 200) {
            this.setState({
              loading: false,
            });
            message.success(this.$t('common.operate.success'));
            this.onCancel();
          }
        })
        .catch(e => {
          console.log(e);
          this.setState({
            loading: false,
          });
          message.error(`提交失败，${e.response.data.message}`);
        });
    } else {
      prePaymentService
        .submitToWorkflow(model)
        .then(res => {
          if (res.status === 200) {
            message.success(this.$t('common.operate.success'));
            this.setState({
              loading: false,
            });
            this.onCancel();
          }
        })
        .catch(e => {
          console.log(e);
          let mess;
          if(e.response.data.message.indexOf("CONTRACT_STATUS_HOLD")>0){
            mess = e.response.data.message.replace("CONTRACT_STATUS_HOLD",this.$t('my.zan.gua'));
          }else if(e.response.data.message.indexOf("CONTRACT_STATUS_CANCEL")>0){
            mess = e.response.data.message.replace("CONTRACT_STATUS_CANCEL",this.$t('common.cancel'));
          }else if(e.response.data.message.indexOf("CONTRACT_STATUS_FINISH")){
            mess = e.response.data.message.replace("CONTRACT_STATUS_FINISH",this.$t('my.comtract.state.finish'));
          }
          this.setState({
            loading: false,
          });
          message.error(`提交失败:` + mess);
        });
    }
  };
  //删除预付款单
  onDelete = () => {
    confirm({
      title: '删除',
      content: '确认删除该预付款单？',
      onOk: () => {
        this.setState({
          dLoading: true,
        });
        prePaymentService
          .deleteHeadAndLineByHeadId(this.props.match.params.id)
          .then(res => {
            this.setState({
              dLoading: false,
            });
            message.success('删除成功');
            this.onCancel();
          })
          .catch(e => {
            this.setState({
              dLoading: false,
            });
            message.error(`删除失败，${e.response.data.message}`);
          });
      },
    });
  };
  //取消
  onCancel = () => {
    if (this.props.match.params.flag === 'prePayment' || this.props.match.params.flag === ':flag') {
      this.props.dispatch(
        routerRedux.push({
          pathname: `/pre-payment/my-pre-payment`,
        })
      );
    } else {
      // this.context.router.push(this.state.paymentDetail.url.replace(':id', this.props.params.flag).replace(':flag', 'me-pre-payment'));
      this.props.dispatch(
        routerRedux.push({
          pathname: `/financial-view/pre-payment-view`,
        })
      );
    }
  };
  render() {
    const { loading, dLoading, headerData, id } = this.state;
    const newState = (
      <div>
        <Button
          type="primary"
          onClick={this.onSubmit}
          loading={loading}
          style={{ margin: '0 20px' }}
        >
          提 交
        </Button>
        <Button onClick={this.onDelete} loading={dLoading}>
          删 除
        </Button>
        <Button style={{ marginLeft: '20px' }} onClick={this.onCancel}>
          返 回
        </Button>
      </div>
    );
    const otherState = (
      <div>
        <Button style={{ marginLeft: '20px' }} onClick={this.onCancel}>
          返 回
        </Button>
      </div>
    );
    return (
      <div style={{ paddingBottom: 100 }} className="pre-payment-detail">
        <PrePaymentCommon params={headerData} contractEdit={true} id={id} />
        {this.props.params && this.props.params.refund ? (
          ''
        ) : (
          <Affix
            offsetBottom={0}
            style={{
              position: 'fixed',
              bottom: 0,
              marginLeft: '-35px',
              width: '100%',
              height: '50px',
              boxShadow: '0px -5px 5px rgba(0, 0, 0, 0.067)',
              background: '#fff',
              lineHeight: '50px',
              zIndex: 1,
            }}
          >
            {headerData.status &&
            (headerData.status === 1001 || headerData.status === 1003 || headerData.status === 1005)
              ? newState
              : otherState}
          </Affix>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company,
  };
}

const wrappedPrePaymentDetail = Form.create()(PrePaymentDetail);
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedPrePaymentDetail);
