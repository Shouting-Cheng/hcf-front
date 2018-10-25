import React from 'react';
import { Modal, Button, Icon, Input, Card, message } from 'antd';

import reimburseService from 'containers/reimburse/my-reimburse/reimburse.service';
import '../../../styles/reimburse/select-cost-type.scss';
import ExpenseTypeSelector from 'components/Template/expense-type-selector';

const Search = Input.Search;

class SelectCostType extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      data: {},
      typeList: [],
      index: 0,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible) {
      this.getAllCostType();
    }
    this.setState({
      visible: nextProps.visible,
    });
  }

  //获取所有费用类型
  getAllCostType = () => {
    reimburseService
      .getAllCostType()
      .then(res => {
        this.setState({ data: res.data, typeList: res.data.expenseTypes });
      })
      .catch(err => {
        message.error('获取数据失败！');
      });
  };

  handleOk = () => {
    this.setState({
      visible: false,
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  selected = index => {
    this.setState({ index: index });
  };

  render() {
    let { visible, typeList } = this.state;
    const gridStyle = {
      width: '30%',
      marginRight: '3.333%',
      marginTop: 10,
    };

    return (
      <ExpenseTypeSelector
        onSelect={this.selected}
        source="company"
        param={'2ec774f5-7aba-486c-bd48-cf2ae74c9d9f'}
      />
    );
    // return (
    //     <Modal
    //         className="select-cost-type"
    //         title="新建费用"
    //         visible={visible}
    //         onOk={this.handleOk}
    //         onCancel={this.handleCancel}
    //         width="60%"
    //     >
    //         <Search
    //             placeholder="input search text"
    //             onSearch={value => console.log(value)}
    //             style={{ width: 300 }}
    //         />
    //         <Card title={
    //             <div>
    //                 <Icon type="clock-circle-o" />&nbsp;&nbsp;历史选择
    //             </div>} bordered style={{ width: "100%", marginTop: 20 }}>
    //             <div>
    //                 <Card.Grid style={gridStyle}>
    //                     <div style={{ lineHeight: "30px", height: 30 }}>
    //                         <img style={{ display: "inlineBlock", width: 30, height: 30, marginRight: 10 }} src="https://huilianyi-uat-static.oss-cn-shanghai.aliyuncs.com//2ec774f5-7aba-486c-bd48-cf2ae74c9d9f/expenseIcon/0769ad40-c3e5-4598-b61b-0e2f9b682fa4-bus.png" />
    //                         <span >交通</span>
    //                     </div>
    //                 </Card.Grid>
    //                 <Card.Grid style={gridStyle}>
    //                     <div style={{ lineHeight: "30px", height: 30 }}>
    //                         <img style={{ display: "inlineBlock", width: 30, height: 30, marginRight: 10 }} src="https://huilianyi-uat-static.oss-cn-shanghai.aliyuncs.com//2ec774f5-7aba-486c-bd48-cf2ae74c9d9f/expenseIcon/0769ad40-c3e5-4598-b61b-0e2f9b682fa4-bus.png" />
    //                         <span >交通</span>
    //                     </div>
    //                 </Card.Grid>
    //                 <Card.Grid style={gridStyle}>
    //                     <div style={{ lineHeight: "30px", height: 30 }}>
    //                         <img style={{ display: "inlineBlock", width: 30, height: 30, marginRight: 10 }} src="https://huilianyi-uat-static.oss-cn-shanghai.aliyuncs.com//2ec774f5-7aba-486c-bd48-cf2ae74c9d9f/expenseIcon/0769ad40-c3e5-4598-b61b-0e2f9b682fa4-bus.png" />
    //                         <span >交通</span>
    //                     </div>
    //                 </Card.Grid>
    //                 <Card.Grid style={gridStyle}>
    //                     <div style={{ lineHeight: "30px", height: 30 }}>
    //                         <img style={{ display: "inlineBlock", width: 30, height: 30, marginRight: 10 }} src="https://huilianyi-uat-static.oss-cn-shanghai.aliyuncs.com//2ec774f5-7aba-486c-bd48-cf2ae74c9d9f/expenseIcon/0769ad40-c3e5-4598-b61b-0e2f9b682fa4-bus.png" />
    //                         <span >交通</span>
    //                     </div>
    //                 </Card.Grid>
    //                 <Card.Grid style={gridStyle}>
    //                     <div style={{ lineHeight: "30px", height: 30 }}>
    //                         <img style={{ display: "inlineBlock", width: 30, height: 30, marginRight: 10 }} src="https://huilianyi-uat-static.oss-cn-shanghai.aliyuncs.com//2ec774f5-7aba-486c-bd48-cf2ae74c9d9f/expenseIcon/0769ad40-c3e5-4598-b61b-0e2f9b682fa4-bus.png" />
    //                         <span >交通</span>
    //                     </div>
    //                 </Card.Grid>
    //                 <Card.Grid style={gridStyle}>
    //                     <div style={{ lineHeight: "30px", height: 30 }}>
    //                         <img style={{ display: "inlineBlock", width: 30, height: 30, marginRight: 10 }} src="https://huilianyi-uat-static.oss-cn-shanghai.aliyuncs.com//2ec774f5-7aba-486c-bd48-cf2ae74c9d9f/expenseIcon/0769ad40-c3e5-4598-b61b-0e2f9b682fa4-bus.png" />
    //                         <span >交通</span>
    //                     </div>
    //                 </Card.Grid>
    //             </div>
    //         </Card>
    //         <Card title="费用类型" bordered style={{ width: "100%", marginTop: 20 }}>
    //             <div>
    //                 {
    //                     typeList.map((o, index) => {
    //                         return (
    //                             <Card.Grid onClick={() => { this.selected(index) }} className={index == this.state.index ? "selectedColor" : "disSelectedColor"} key={o.id} style={gridStyle}>
    //                                 <div style={{ lineHeight: "30px", height: 30 }}>
    //                                     <img style={{ display: "inlineBlock", width: 30, height: 30, marginRight: 10 }} src={o.iconURL} />
    //                                     <span>{o.name}</span>
    //                                 </div>
    //                             </Card.Grid>
    //                         )
    //                     })
    //                 }
    //             </div>
    //         </Card>
    //     </Modal >
    // )
  }
}

export default SelectCostType;
