import { Form, Row, Col, Input, Button, Icon, Switch, Select, message } from 'antd';
import React from 'react';
const FormItem = Form.Item;
import './search-form.less';
import fetch from '../../utils/fetch';
import commonService from 'services/common';
import baseMethods from '../../methods/index';
import { connect } from "dva"

@connect(state => state)

class AdvancedSearchForm extends React.Component {
  state = {
    expand: false,
    loading: false,
    options: {},
    defaultValue: {}
  };

  componentDidMount() {
    if (this.props.getRef) {
      this.props.getRef(this);
    }

    const { formItems = [], dispatch } = this.props;

    let defaultValue = {};

    formItems.map((item, i) => {
      if (!item.dataIndex) return;

      if (item.dataSource) {
        this.setState({ options: { ...this.state.options, [item.id]: JSON.parse(item.dataSource) } });
      } else {
        if ((!item.options || !item.options.length) && item.url && !this.state.options[item.id]) {
          this.getOptions(item);
        }
      }

      if (item.defaultValue) {

        defaultValue[item.id] = item.defaultValue;
        let key = "";
        item.defaultValue.replace(/\$\{(.+)\}/g, (target, result) => {
          key = result;
        });

        if (key) {
          let temp = this.getValue(this.props, key);
          if (temp && temp.length) {
            defaultValue[item.id] = temp[0];
          }
        }

        dispatch({
          type: "database/setData",
          payload: {
            moduleName: "priview",
            objName: this.props.code,
            key: item.dataIndex,
            value: defaultValue[item.id]
          }
        })
      }
    })

    this.setState({ defaultValue });

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
        this.setState({ options: { ...this.state.options, [item.id]: res.data } }, () => {
          this.getFields();
        });
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
    const { getFieldDecorator } = this.props.form;
    const { formItems = [] } = this.props;
    const children = [];

    formItems.map((item, i) => {
      if (!item.dataIndex) return;

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

      let options = {};

      if (this.state.defaultValue[item.id]) {
        if (item.typeCode == "switch") {
          if (this.state.defaultValue[item.id] == "false") {
            options.initialValue = false;
          } else {
            options.initialValue = Boolean(this.state.defaultValue[item.id]);
          }
        } else {
          options.initialValue = this.state.defaultValue[item.id];
        }
      }

      if (item.typeCode == "switch") {
        options.valuePropName = "checked";
      }

      children.push(
        <Col span={24} key={i}>
          <FormItem {...formItemLayout} label={item.label}>
            {getFieldDecorator(item.dataIndex, {
              rules: [{ required: item.required, message: item.message || '不能为空' }],
              ...options
            })(this.renderItem(item))}
          </FormItem>
        </Col>
      );

    });

    return children;
  }

  getValue(data, ...args) {
    const res = JSON.stringify(data);
    return args.map((item) => (new Function(`try {return ${res}.${item} } catch(e) {}`))());
  }

  renderItem = item => {
    const { options } = this.state;

    switch (item.typeCode) {
      case 'input':
        return <Input placeholder={item.placeholder} disabled={item.disabled} />;
      case 'switch':
        return (
          <Switch
            checkedChildren={<Icon type="check" />}
            unCheckedChildren={<Icon type="close" />}
          />
        );
      case 'select':
        return (
          <Select disabled={item.disabled} allowClear={item.allowClear} placeholder={item.placeholder}>
            {options[item.id] &&
              options[item.id].map(option => {
                return <Select.Option key={option[item.valueKey]}>{option[item.labelKey]}</Select.Option>;
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

      if (this.props.onSubmit) {
        this.props.onSubmit(values, (flag) => {
          this.setState({ loading: false });
          if (flag) {
            this.props.onSuccess && this.props.onSuccess();
          } else {
            this.props.onError && this.props.onError();
          }
        });
        return;
      }

      if (!this.props.url) return;

      fetch.get('/auth/api/interface/query/' + this.props.url).then(res => {
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

export default Form.create()(AdvancedSearchForm);
