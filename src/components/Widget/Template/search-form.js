import { Form, Row, Col, Input, Button, Icon, Switch } from 'antd';
import React from 'react';
const FormItem = Form.Item;

import './search-form.less';
class AdvancedSearchForm extends React.Component {
  state = {
    expand: false,
  };

  handleSearch = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      this.props.search && this.props.search(values);
    });
  };

  handleReset = () => {
    this.props.form.resetFields();
  };

  toggle = () => {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  };

  // To generate mock Form.Item
  getFields() {
    const { getFieldDecorator } = this.props.form;
    const { formItems = [] } = this.props;
    const children = [];
    const count = this.state.expand ? formItems.length : 4;

    formItems.map((item, i) => {
      if (item.dataIndex) {
        children.push(
          <Col span={6} key={item.dataIndex} style={{ display: i < count ? 'block' : 'none' }}>
            <FormItem label={item.label}>
              {getFieldDecorator(item.dataIndex)(this.renderItem(item))}
            </FormItem>
          </Col>
        );
      }
    });

    return children;
  }

  renderItem = item => {
    switch (item.type) {
      case 'input':
        return <Input placeholder={item.placeholder} />;
      case 'switch':
        return (
          <Switch
            checkedChildren={<Icon type="check" />}
            unCheckedChildren={<Icon type="close" />}
          />
        );
      case 'select':
        return (
          <Select placeholder={item.placeholder}>
            {item.options.map(option => {
              return <Option key={option.value}>{option.label}</Option>;
            })}
          </Select>
        );
      default:
        return <Input placeholder={item.placeholder} />;
    }
  };

  render() {
    return (
      <Form className="ant-advanced-search-form" onSubmit={this.handleSearch}>
        <Row gutter={24}>{this.getFields()}</Row>
        <Row>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Button type="primary" htmlType="submit">
              搜索
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
              清除
            </Button>
            {this.props.formItems &&
              this.props.formItems.length > 4 && (
                <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
                  {this.state.expand ? '收缩' : '展开'}{' '}
                  <Icon type={this.state.expand ? 'up' : 'down'} />
                </a>
              )}
          </Col>
        </Row>
      </Form>
    );
  }
}

const WrappedAdvancedSearchForm = Form.create()(AdvancedSearchForm);

export default WrappedAdvancedSearchForm;
