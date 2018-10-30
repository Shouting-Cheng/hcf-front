import React from 'react';
import { connect } from 'dva';
import { Form, Input, Affix, Button } from 'antd';
const FormItem = Form.Item;

import requestService from 'containers/request/request.service';
import 'styles/request/new-request.scss';

class NewRequest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formInfo: {},
    };
  }

  componentWillMount() {
    this.getFormInfo();
  }

  //获取表单配置
  getFormInfo = () => {
    requestService.getCustomForm(this.props.params.formOID).then(res => {
      this.setState({ formInfo: res.data });
    });
  };

  //返回
  goBack = () => {
    this.context.router.push(this.state.applicationList.url);
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { formInfo } = this.state;
    const customFormFields = formInfo.customFormFields || [];
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    return (
      <div className="new-request">
        <h3 className="header-title">新建{formInfo.formName}</h3>
        <Form className="form-container">
          {customFormFields.map(field => {
            return (
              <FormItem {...formItemLayout} label={field.fieldName} key={field.messageKey}>
                {getFieldDecorator(field.messageKey)(<Input />)}
              </FormItem>
            );
          })}
        </Form>
        <div style={{paddingLeft:30}}>
        <Affix offsetBottom={0} className="bottom-bar">
          <Button type="primary">提交</Button>
          <Button>保存</Button>
          <Button onClick={this.goBack}>返回</Button>
        </Affix>
        </div>
      </div>
    );
  }
}

function mapStateToProps() {
  return {};
}

const wrappedNewRequest = Form.create()(NewRequest);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedNewRequest);
