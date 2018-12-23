import { Form, Row, Col, Input, Button, Icon, Switch, Select, message, DatePicker } from 'antd';
import React from 'react';
const FormItem = Form.Item;
import { DragSource, DropTarget } from 'react-dnd';
import { connect } from 'dva';
import './search-form.less';
import uuid from '../../utils/uuid';

const { RangePicker } = DatePicker;

const forms = ['select', 'input', 'date-picker', 'switch', 'custom-chooser', 'permissions-allocation'];

const cardSource = {
  drop(props, monitor, component) {
    let item = monitor.getItem();

    if (!forms.includes(item.text)) {
      message.warning('form只能接收表单元素!');
      return;
    }

    let box = {
      type: 'form-item',
      id: uuid(),
      props: {},
      text: item.text,
      parent: props.id,
      typeCode: item.text,
      key: '',
      label: '',
    };

    props.dispatch({
      type: 'components/addComponent',
      payload: box,
    });
  },
};

/**
 * Specifies the props to inject into your component.
 */
function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  };
}

class AdvancedSearchForm extends React.Component {
  state = {
    expand: false,
    methods: [{ name: 'setValues' }],
    formItems: [],
  };

  componentDidMount() {
    let selected = this.props.components.find(o => o.id == this.props.selectedId);

    if ((selected && selected.parent == this.props.id) || this.props.selectedId == 0) {
      let formItems = this.props.components.filter(o => o.parent == this.props.id);
      this.setState({ formItems });
    }

    window.refs = window.refs || {};
    if (this.props.refName) {
      window.refs[this.props.refName] = this;
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.refName != this.props.refName) {
      if (window.refs && this.props.refName && window.refs[this.props.refName]) {
        delete window.refs[this.props.refName];
      }
      window.refs = window.refs || {};

      if (nextProps.refName) {
        window.refs[nextProps.refName] = this;
      }
    }

    let selected = nextProps.components.find(o => o.id == nextProps.selectedId);

    if ((selected && selected.parent == this.props.id) || nextProps.selectedId == 0) {
      let formItems = nextProps.components.filter(o => o.parent == this.props.id);
      this.setState({ formItems });
    }
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

  // To generate mock Form.Item
  getFields() {
    const children = [];
    const { formItems = [] } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };

    // let fields = [
    //   { type: "input", key: "name", label: "名称", placeholder: "请输入" }
    // ];

    formItems.map((item, i) => {
      children.push(
        <Col span={24} key={i}>
          <FormItem {...formItemLayout} label={item.label}>
            {this.renderItem(item)}
          </FormItem>
        </Col>
      );
    });

    return children;
  }

  renderItem = item => {
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
          <Select placeholder={item.placeholder}>
            {item.options &&
              item.options.map(option => {
                return <Option key={option.value}>{option.label}</Option>;
              })}
          </Select>
        );
      case 'date-picker':
        return <DatePicker placeholder={item.placeholder} />;
      default:
        return <Input placeholder={item.placeholder} />;
    }
  };

  submit = () => { };

  cancel = () => { };

  render() {
    const { connectDropTarget, className } = this.props;
    return (
      connectDropTarget &&
      connectDropTarget(
        <div className={className}>
          <Form onSubmit={this.submit}>
            <Row>{this.getFields()}</Row>
            <Row style={{ textAlign: 'center' }}>
              <Button type="primary" onClick={this.submit}>
                确定
              </Button>
              <Button style={{ marginLeft: 20 }} onClick={this.cancel}>
                取消
              </Button>
            </Row>
          </Form>
        </div>
      )
    );
  }
}

function mapStateToProps(state) {
  return {
    components: state.components.components,
    selectedId: state.components.selectedId,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(DropTarget('box', cardSource, collect, { withRef: true })(AdvancedSearchForm));
