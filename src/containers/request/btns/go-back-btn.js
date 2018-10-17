/**
 * 操作：返回
 * 适用：所有申请单
 */
import React from 'react'
import { connect } from 'dva'
import { Form, Button } from 'antd'

class GoBackBtn extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      applicationList: menuRoute.getRouteItem('request','key'), //申请单列表页

    }
  }

  //返回
  goBack = () => {
    if(this.props.backType==='history')
    {
        window.history.go(-1);
    }
    else {
      this.context.router.push(this.state.applicationList.url)
    }


  };

  render() {
    return (
      <div className="go-back-btn request-btn">
        <Button onClick={this.goBack}>{messages('common.back')}</Button>
      </div>
    )
  }
}

function mapStateToProps() {
  return { }
}

const wrappedGoBackBtn = Form.create()(GoBackBtn);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedGoBackBtn)
