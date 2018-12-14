// import React, { Component } from "react";
// import { Form, Input, Button, message, Select } from "antd";
// import "styles/setting/params-setting/params-setting.scss";
// const FormItem = Form.Item;

// import service from "./service"

// class NewDemoEdit extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       saveLoading:false,
//       paramsTypeList:[],
//       filterMethodList: []
//      };
//   }
//   // 生命周期
//   componentDidMount(){
//     this.getTableType();
//     this.getFilterMethodList();
//   }
//   // 获取参数类型
//   getTableType = () => {
//     this.getSystemValueList(3101).then((res) => {
//         this.setState({
//           paramsTypeList:res.data.values
//         });
//     }).catch((err) => {
//       message.error(err.response.data.message);
//     })
//   }
//   //获取筛选方式
//   getFilterMethodList = () => {
//     this.getSystemValueList(3104).then(res => {
//         this.setState({
//             filterMethodList: res.data.values
//         });
//     }).catch(err => {
//         message.error(err.response.data.message);
//     })
// }
//  //保存
//  handleSubmit = () => {
//   this.props.form.validateFields((err, values) => {
//       if (err) return;
//       this.setState({ saveLoading: true });
//       service.addParamsSetting(values).then(res => {
//           message.success("新增成功！");
//           this.setState({ saveLoading: false });
//           this.props.close && this.props.close(true);
//       }).catch(err => {
//           message.error(err.response.data.message);
//           this.setState({ saveLoading: false });
//       });
//   })
// }

// //取消
//   handleCancel = () => {
//     this.props.close && this.props.close();
//   }

//   render() {
//     const { getFieldDecorator } = this.props.form;
//    const { saveLoading, paramsTypeList, filterMethodList } = this.state;
//     const formItemLayout = {
//       labelCol: {
//           span: 10
//       },
//       wrapperCol: {
//           span: 12
//       }
//   };
//     return (
//       <div>
//       1111111111111111
//         <Form onSubmit={this.handleSubmit}>
//           <FormItem
//               {...formItemLayout}
//               label="表名称"

//           >
//             {
//                 getFieldDecorator('tableName', {
//                   rules: [{
//                       required: true, message: '请输入'
//                   }],
//                   initialValue: this.props.params.tableName || ""
//               })(
//                   <Input placeholder="请输入"/>
//               )}
//           </FormItem>

//           <FormItem
//           {...formItemLayout}
//           label="参数类型"
//           hasFeedback
//         >
//           {getFieldDecorator('dataType', {
//             rules: [
//               { required: true, message: '请选择' },
//             ],
//             initialValue: this.props.params.dataType || ""
//           })(
//             <Select placeholder="请选择">
//               {
//                 paramsTypeList.map((item) => {
//                   return(
//                     <Select.Option key={item.value} value={item.value} >{item.messageKey}</Select.Option>
//                   )
//                 })
//               }
//             </Select>
//           )}
//         </FormItem>
//         <FormItem
//             {...formItemLayout}
//             label="筛选方式"
//             validateStatus="success"
//           >
//              {
//                 getFieldDecorator('filterMethod', {
//                   initialValue: this.props.params.dataType || ""
//               })(
//                 <Select >
//                 {
//                   paramsTypeList.map((item) => {
//                     return(
//                       <Select.Option key={item.value} value={item.value} >{item.messageKey}</Select.Option>
//                     )
//                   })
//                 }
//               </Select>
//               )}

//           </FormItem>
//           <FormItem
//               {...formItemLayout}
//               label="关联表名称"
//           >
//            {getFieldDecorator('columnName', {
//               rules: [{
//                   required: true, message: '请输入',
//               }],
//               initialValue: this.props.params.columnName || ""
//             })(
//                 <Input placeholder="请选择"/>
//             )}
//           </FormItem>
//           <FormItem
//               {...formItemLayout}
//               label="关联条件"
//           >
//            {getFieldDecorator('customSql', {
//               rules: [{
//                   required: true, message: '请输入',
//               }],
//               initialValue: this.props.params.customSql || ""
//             })(
//                 <Input placeholder="请选择"/>
//             )}
//           </FormItem>
//           <FormItem
//               {...formItemLayout}
//               label="参数名称"
//           >
//               {getFieldDecorator('columnName', {
//                   rules: [{
//                       required: true, message: '请输入',
//                   }],
//                   initialValue: this.props.params.columnName || ""
//               })(
//                   <Input />
//               )}
//           </FormItem>
//           <div className="footer-button">
//             <Button type="primary" htmlType="submit" loading={saveLoading}> {this.$t('common.save')}</Button>
//             <Button onClick={this.handleCancel}>{this.$t('common.cancel')}</Button>
//           </div>

//         </Form>
//       </div>
//     );
//   }
// }

// export default Form.create()(NewDemoEdit);
