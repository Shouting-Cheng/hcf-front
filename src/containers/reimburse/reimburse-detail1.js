import React from 'react'
import { connect } from 'react-redux';




class ReimburseDetail1 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dLoading: false,
      submitAble: false,
      headerData: {},
      submitLoading: false,
      myReimburse: menuRoute.getRouteItem('my-reimburse', 'key'),    //我的报账单
    }
  }

  componentWillMount() {

  }




  render() {

    return (
      <div className="contract-detail background-transparent">

      </div>
    )
  }
}



function mapStateToProps(state) {
  return {
    user: state.login.user,
  }
}
export default connect(mapStateToProps, null, null, { withRef: true })((ReimburseDetail1));

