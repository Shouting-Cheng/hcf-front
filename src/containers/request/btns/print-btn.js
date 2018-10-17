/**
 * 操作：打印
 * 适用：差旅申请单、费用申请单、借款申请单
 */
import React from 'react'
import { connect } from 'dva'
import { Form, Button } from 'antd'

import requestService from 'containers/request/request.service'

class PrintBtn extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      showPrintBtn: false,
      info: {}
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.info.applicationOID) {
      this.setState({ info: nextProps.info }, () => {
        this.showPrint()
      })
    }
  }

  //判断是否显示打印按钮
  showPrint = () => {
    const { info } = this.state;
    this.setState({ showPrintBtn: info.printButtonDisplay })
  };

  handlePrint = () => {
    let methodType = this.props.info.formType === 2001 ? 'printTravelApplication' :
      this.props.info.formType === 2002 ? 'printExpenseApplication' : 'printLoanApplication';
    this.setState({ loading: true });
    requestService[methodType](this.state.info.applicationOID).then(res => {
      this.setState({ loading: false });
      window.open(res.data.link, '_blank')
    }).catch(() => {
      this.setState({ loading: false })
    })
  };

  render() {
    const { loading, showPrintBtn } = this.state;
    return (
      <div className="print-btn request-btn">
        {(showPrintBtn || this.props.printFlag) && <Button type="primary" loading={loading} onClick={this.handlePrint}>{this.$t('common.print')/*打印*/}</Button>}
      </div>
    )
  }
}


function mapStateToProps() {
  return { }
}

const wrappedPrintBtn = Form.create()(PrintBtn);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedPrintBtn)
