import { Form, Row, Col, Input, Button, Icon, Switch, Select, message } from 'antd';
import React from 'react';
const FormItem = Form.Item;
import { DragSource, DropTarget } from 'react-dnd';
import { connect } from 'dva';
import './search-form.less';
import fetch from '../../utils/fetch';
import commonService from '../../services/common';
import baseMethods from '../../methods/index';

class AdvancedSearchForm extends React.Component {
  state = {
    expand: false,
    loading: false,
    options: {},
  };

  componentDidMount() {
    if (this.props.getRef) {
      this.props.getRef(this);
    }

    let { formItems } = this.props;

    formItems.map(item => {
      if ((!item.options || !item.options.length) && item.url) {
        this.getOptions(item);
      }
    });
  }

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

  setValues = values => {
    let data = this.props.form.getFieldsValue();

    Object.keys(data).map(key => {
      this.props.form.setFieldsValue({ [key]: String(values[key]) });
    });
  };

  getOptions = item => {
    commonService.getInterface(item.url).then(res => {
      if (res.data) {
        let options = res.data.map(o => {
          return { label: o[item.labelKey], value: o[item.valueKey] };
        });
        this.setState({ options: { [item.id]: options } });
      }
    });
  };

  onChange = (item, value) => {
    if (item.onChange) {
      this.exec(item.onChange, value);
    }
  };

  exec = (key, values) => {
    const keys = String(key).split('.');
    let func = null;
    if (keys[0] == 0) {
      func = baseMethods[keys[1]][keys[2]];
    } else {
      func = window.instances[keys[1]][keys[2]];
    }
    func && func(values);
  };

  // To generate mock Form.Item
  getFields() {
    const children = [];
    const { formItems = [] } = this.props;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 10 },
      },
    };

    formItems.map((item, i) => {
      if (item.dataIndex) {
        children.push(
          <Col span={24} key={i}>
            <FormItem {...formItemLayout} label={item.label}>
              {getFieldDecorator(item.dataIndex, {
                rules: [{ required: item.required, message: item.message || '不能为空' }],
              })(this.renderItem(item))}
            </FormItem>
          </Col>
        );
      }
    });

    return children;
  }

  renderItem = item => {
    const { options } = this.state;

    switch (item.typeCode) {
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
          <Select
            onChange={value => this.onChange(item, value)}
            allowClear={item.allowClear}
            placeholder={item.placeholder}
          >
            {options[item.id] &&
              options[item.id].map(option => {
                return <Select.Option key={option.value}>{option.label}</Select.Option>;
              })}
          </Select>
        );
      case 'date-picker':
        return <DatePicker allowClear={item.allowClear} placeholder={item.placeholder} />;
      default:
        return <Input placeholder={item.placeholder} />;
    }
  };

  submit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;

      this.setState({ loading: true });

      if (this.props.submit) {
        this.props.submit(values);
        return;
      }

      if (!this.props.url) return;

      fetch.get('/api/interface/query/' + this.props.url).then(res => {
        fetch
          .post(res.reqUrl, values)
          .then(response => {
            this.setState({ loading: false });
            this.props.onSuccess && this.props.onSuccess();
          })
          .catch(err => {
            this.setState({ loading: false });
            this.props.onError && this.props.onError();
          });
      });
    });
  };

  cancel = () => {
    this.props.onCancel && this.props.onCancel();
  };

  render() {
    const { className } = this.props;
    const { loading } = this.state;
    return (
      <Form>
        <Row>{this.getFields()}</Row>
        <Row style={{ textAlign: 'center' }}>
          <Button loading={loading} type="primary" onClick={this.submit}>
            确定
          </Button>
          <Button style={{ marginLeft: 20 }} onClick={this.cancel}>
            取消
          </Button>
        </Row>
      </Form>
    );
  }
}

function mapStateToProps(state) {
  return {
    components: state.components.components,
    selectedId: state.components.selectedId,
  };
}

export default Form.create()(AdvancedSearchForm);
