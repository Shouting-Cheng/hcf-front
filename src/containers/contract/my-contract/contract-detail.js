import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import contractService from 'containers/contract/contract-approve/contract.service';
import { Form, Affix, Button, message } from 'antd';
import ContractDetailCommon from 'containers/contract/my-contract/contract-detail-common';
import 'styles/contract/my-contract/contract-detail.scss';

class ContractDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dLoading: false,
      submitAble: false,
      headerData: {},
      paramsId: 0
      //myContract: menuRoute.getRouteItem('my-contract', 'key'),    //我的合同
    };
  }

  //获取合同状态
  getStatus = status => {
    if (
      status === 1001 ||
      status === 1005 ||
      status === 1003 /*&& this.props.match.params.from === "contract"*/
    ) {
      this.setState({ submitAble: true });
    }
  };

  //提交
  onSubmit = () => {
    this.setState({ loading: true });
    if (this.detail && this.detail.state.headerData.contractName) {
      // 如果formOid有值，则走工作流提交
      if (this.detail.state.headerData.formOid) {
        const { headerData } = this.detail.state;
       /* let params = {
          applicantOID: headerData.applicantOid,
          userOID: this.props.user.userOID,
          formOID: headerData.formOid,
          entityOID: headerData.documentOid,
          entityType: headerData.documentType,
          countersignApproverOIDs: null,
        };*/
        let workFlowDocumentRef = {
          applicantOid: headerData.applicantOid,
          userOid: this.props.user.userOID,
          formOid: headerData.formOid,
          documentOid: headerData.documentOid,
          documentCategory: headerData.documentType,
          countersignApproverOIDs: null,
          documentNumber: headerData.contractNumber,
          remark: headerData.remark,
          companyId: headerData.companyId,
          unitOid: headerData.unitOid,
          amount: headerData.amount,
          currencyCode: headerData.currency,
          documentTypeId: headerData.contractTypeId,
          applicantDate: headerData.createdDate,
          documentId: headerData.id
        };
        contractService
          .submitWorkflowContract(workFlowDocumentRef)
          .then(res => {
            if (res.status === 200) {
              this.setState({ loading: false });
              message.success(this.$t({ id: 'common.operate.success' } /*操作成功*/));
              this.onCancel();
            }
          })
          .catch(e => {
            this.setState({ loading: false });
            message.error(
              `${this.$t({ id: 'common.operate.filed' } /*操作失败*/)}，${e.response.data.message}`
            );
          });
      } else {
        contractService
          .submitContract(this.props.match.params.id)
          .then(res => {
            if (res.status === 200) {
              this.setState({ loading: false });
              message.success(this.$t({ id: 'common.operate.success' } /*操作成功*/));
              this.onCancel();
            }
          })
          .catch(e => {
            this.setState({ loading: false });
            message.error(
              `${this.$t({ id: 'common.operate.filed' } /*操作失败*/)}，${e.response.data.message}`
            );
          });
      }
    } else {
      message.error(this.$t('my.contract.add.info.tips'));
      this.setState({ loading: false });
    }
  };
  componentWillMount () {
    // 该判断是支付模块查看合同详情时判断，因为支付模块使用的是弹出框
    let paramsId = 0;
    if (this.props.params && this.props.params.refund) {
      paramsId = this.props.params.id;
    } else {
      paramsId = this.props.match.params.id;
    }
    this.setState({
      paramsId : paramsId
    })
  }
  //删除
  onDelete = () => {
    this.setState({ dLoading: true });
    contractService
      .deleteContract(this.props.match.params.id)
      .then(res => {
        if (res.status === 200) {
          this.setState({ dLoading: false });
          message.success(this.$t({ id: 'common.delete.success' }, { name: '' } /*删除成功*/));
          this.onCancel();
        }
      })
      .catch(e => {
        this.setState({ dLoading: false });
        message.error(
          `${this.$t({ id: 'common.operate.filed' } /*操作失败*/)}，${e.response.data.message}`
        );
      });
  };

  //取消
  onCancel = () => {
    //this.context.router.push(this.state.myContract.url);
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/contract-manage/my-contract`,
      })
    );
  };

  render() {
    const { loading, dLoading, submitAble,paramsId} = this.state;
    return (
      <div className="contract-detail" style={{ margin: '-12px -14px' }}>
        <ContractDetailCommon
          id={paramsId}
          wrappedComponentRef={ref => (this.detail = ref)}
          getContractStatus={this.getStatus}
          isApprovePage={this.props.match.params.from !== 'contract'}
        />
        {submitAble && (
          <Affix offsetBottom={0} className="bottom-bar-jsq">
            <Button
              type="primary"
              onClick={this.onSubmit}
              loading={loading}
              style={{ marginTop: 0, marginRight: 20, marginBottom: 0, marginLeft: 40 }}
            >
              {this.$t({ id: 'my.contract.submit' } /*提 交*/)}
            </Button>
            <Button style={{ marginLeft: '0px' }} onClick={this.onDelete} loading={dLoading}>
              {this.$t({ id: 'common.delete' } /*删除合同*/)}
            </Button>
            <Button style={{ marginLeft: '20px' }} onClick={this.onCancel}>
              {this.$t({ id: 'common.back' } /*返回*/)}
            </Button>
          </Affix>
        )}
        {this.props.params && this.props.params.refund
          ? ''
          : !submitAble && (
              <Affix offsetBottom={0} className="bottom-bar-jsq">
                <Button style={{ marginLeft: '30px' }} onClick={this.onCancel}>
                  {this.$t({ id: 'common.back' } /*返回*/)}
                </Button>
              </Affix>
            )}
      </div>
    );
  }
}

const wrappedContractDetail = Form.create()(ContractDetail);

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
  };
}
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedContractDetail);

//export default wrappedContractDetail;
