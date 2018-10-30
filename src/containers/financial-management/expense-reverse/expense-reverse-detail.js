/**
 * Created by Allen on 2018/5/8.
 */
import React from 'react'
import { connect } from 'dva';
import { routerRedux } from "dva/router";
import { Form, Affix, Button, message, Popconfirm, Modal } from 'antd'
const confirm = Modal.confirm;
import ReverseDetailCommon from 'containers/financial-management/expense-reverse/reverse-detail-common'
import reverseService from 'containers/financial-management/expense-reverse/expense-reverse.service'
import 'styles/financial-management/expense-reverse/reverse-detail.scss'

class ExpenseReverseDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dLoading: false,
      headerData: {},
      submitLoading: false,
      // newReverse: menuRoute.getRouteItem('update-reverse', 'key'),
      // expenseReverse: menuRoute.getRouteItem('expense-reverse','key'),  //费用反冲页
    }
  }

  componentWillMount() {
    this.getInfo();
  }

  //获取报销单信息
  getInfo = () =>{
    reverseService.getExpenseDetail(this.props.match.params.id).then(resp => {
      if (resp.status === 200){
        this.setState({headerData: resp.data})
      }
    })
  };

  //提交
  onSubmit = () => {
    this.setState({submitLoading: true});
    reverseService.submitReverseDocument(this.state.headerData.reverseHeader.id).then(resp => {
      if (resp.status === 200){
        message.success(this.$t({id: 'pay.backlash.submitSuccess'}));
        this.setState({submitLoading: false});
        this.props.dispatch(
          routerRedux.replace({
            pathname: `/financial-management/expense-reverse`,
          })
        );
        // this.context.router.push(this.state.expenseReverse.url);
      }
    }).catch(e => {
      debugger;
      this.setState({submitLoading: false});
      message.error(e.response.data ? e.response.data.message : this.$t({id:'exp.summit.failed'}))
    })
  };

  //取消
  onCancel = () => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/financial-management/expense-reverse`,
      })
    );
    // this.context.router.push(this.state.expenseReverse.url);
  };

  deleteItem = () =>{
    reverseService.deleteReserveByHeadId(this.state.headerData.reverseHeader.id).then(()=>{
      this.props.dispatch(
          routerRedux.replace({
            pathname: `/financial-management/expense-reverse`,
          })
        );
      // this.context.router.push(this.state.expenseReverse.url);
    })
  };

  render() {
    const { dLoading, headerData, submitLoading } = this.state;
    let isEdit = null;
    if (headerData.reverseHeader){
      isEdit = headerData.reverseHeader.status === 1001 || headerData.reverseHeader.status === 1003 || headerData.reverseHeader.status === 1005;
    }

    return (
      <div className="expense-reverse-detail background-transparent" style={{marginBottom: 30}}>
        <ReverseDetailCommon getInfo={this.getInfo}
                             headerData={headerData}
                             id={this.props.match.params.id}
                             query={this.getInfo}
                             userId={this.props.user.id}/>
          <Affix offsetBottom={0} className="bottom-bar">
            {isEdit && <Button type="primary" onClick={this.onSubmit} loading={submitLoading} style={{ margin: '0 20px' }}>
              {this.$t({ id: "my.contract.submit" }/*提 交*/)}
            </Button>}
            {  isEdit &&
              <Popconfirm title={this.$t({id:'configuration.detail.tip.delete'})} onConfirm={this.deleteItem} okText={this.$t({id:'common.ok'})} cancelText={this.$t({id:'common.cancel'})}>
                <Button>{this.$t({ id: "common.delete" })}</Button>
              </Popconfirm>
            }
            <Button style={{ marginLeft: '40px' }} onClick={this.onCancel}>{this.$t({ id: "common.back" }/*返回*/)}</Button>
          </Affix>
      </div>
    )
  }
}

// ExpenseReverseDetail.contextTypes = {
//   router: React.PropTypes.object
// };

const wrappedExpenseReverseDetail = Form.create()(ExpenseReverseDetail);

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
  }
}
export default connect(mapStateToProps, null, null, { withRef: true })(wrappedExpenseReverseDetail);

//export default wrappedContractDetail;
