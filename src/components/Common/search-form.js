import { Form, Row, Col, Input, Button, Icon, Switch, Select, message, DatePicker } from 'antd';
import React from 'react';
const FormItem = Form.Item;
import { DragSource, DropTarget } from 'react-dnd';
import { connect } from 'dva';
import './search-form.less';
import uuid from '../../utils/uuid';

const cardSource = {
  drop(props, monitor, component) {
    let item = monitor.getItem();

    // if (item.text != "table-column") {
    //   message.warning("table只能接收table-column!");
    //   return;
    // }

    // let components = props.components;

    // let form = components.find(o => o.id === props.id);

    // let formItems = form.props.formItems || [];

    // formItems.push({
    //   type: item.text,
    //   key: '',
    //   label: '',
    // });

    // props.dispatch({
    //   type: 'components/updateComponent',
    //   payload: {
    //     id: props.id,
    //     value: formItems,
    //     key: 'props.formItems',
    //   },
    // });

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
  };

  componentDidMount() {
    let selected = this.props.components.find(o => o.id == this.props.selectedId);

    if ((selected && selected.parent == this.props.id) || this.props.selectedId == 0) {
      let formItems = this.props.components.filter(o => o.parent == this.props.id);
      this.setState({ formItems });
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
    const count = this.state.expand ? 10 : 6;

    const children = [];
    const { formItems = [] } = this.state;

    // let fields = [
    //   { type: "input", key: "name", label: "名称", placeholder: "请输入" }
    // ];

    formItems.map((item, i) => {
      children.push(
        <Col span={8} key={i} style={{ display: i < count ? 'block' : 'none' }}>
          <FormItem label={item.label}>{this.renderItem(item)}</FormItem>
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

  render() {
    const { connectDropTarget } = this.props;
    return (
      connectDropTarget &&
      connectDropTarget(
        <div>
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
                  this.props.formItems.length > 3 && (
                    <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
                      {this.state.expand ? '收缩' : '展开'}{' '}
                      <Icon type={this.state.expand ? 'up' : 'down'} />
                    </a>
                  )}
              </Col>
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
