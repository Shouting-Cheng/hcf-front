import React from 'react'
import { Icon, Drawer } from 'antd'

import 'styles/components/slide-frame.scss'

/**
 * 侧拉组件，该组件内部组件将自带this.props.close(params)方法关闭侧拉栏
 */
class SlideFrame extends React.Component {
  constructor(props) {
    super(props);
  }

  /**
   * 关闭方法，如果内部有params参数，则传出至afterClose方法
   * @param params
   */
  close = (params) => {
    this.props.onClose && this.props.onClose();
  };

  render() {
    const { width, show, title } = this.props;
    return (
      <div>
        <Drawer
          style={{
            height: 'calc(100% - 55px)',
            overflow: 'auto',
            paddingBottom: 60,
          }}
          title={title}
          visible={show}
          width="50vw"
          destroyOnClose
          onClose={this.close}>
          {this.props.children}
          {/* <NewPrePaymentDetail params={{ id: this.state.id, paymentReqTypeId: this.state.paymentReqTypeId, companyId: this.state.companyId, flag: this.state.flag, remark: this.state.headerData.description, record, headerData: this.state.headerData }} /> */}
        </Drawer>
      </div>
    )
  }
}


export default SlideFrame
