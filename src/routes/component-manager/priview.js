import React, { Component } from 'react';
import { connect } from 'dva';
import CustomTable from 'components/Template/custom-table';
import SearchForm from 'components/Template/search-form';
import SlideFrame from 'components/Template/slide-frame';
import CustomForm from 'components/Template/custom-form';
import { Button, Row } from 'antd';
import baseMethods from '../../methods/index';

class Priview extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() { }
  selected = () => { };

  formatProps = data => {
    Object.keys(data).map(key => {
      if (typeof data[key] == 'string') {
        data[key] = data[key].replace(/\$\{(.+)\}/g, function (match, k) {
          return '45';
        });
      } else if (typeof data[key] == 'number') {
        data[key] = String(data[key]).replace(/\$\{(.+)\}/g, function (match, k) {
          console.log(k); // name
        });
      } else if (typeof data[key] == 'object') {
        this.formatProps(data[key]);
      }
    });
  };

  getRef = (refName, ref) => {
    window.instances = window.instances || {};
    window.instances[refName] = ref;
  };

  exec = (key, values) => {
    const keys = String(key).split('.');

    let func = null;
    if (keys[0] == 0) {
      func = baseMethods[keys[1]][keys[2]];
    } else {
      func = window.instances[keys[1]][keys[2]];
    }
    func && func(...values);
  };

  getChildren = (item, key) => {
    let { components = [] } = this.props;
    components = JSON.parse(JSON.stringify(components));
    let result = components.filter(o => o.parent == item.id);
    item.props[key] = result;
  };

  renderNode = (id = 0) => {
    let { components = [] } = this.props;

    components = JSON.parse(JSON.stringify(components));

    let roots = components.filter(o => o.parent == id);

    const componentList = {
      table: CustomTable,
      'search-form': SearchForm,
      button: Button,
      'slide-frame': SlideFrame,
      form: CustomForm,
      row: Row
    };

    return roots.map(item => {
      if (item.type == 'table') {
        this.getChildren(item, 'columns');
      } else if (item.type == 'form' || item.type == 'search-form') {
        this.getChildren(item, 'formItems');
      }

      let Type = componentList[item.type];

      item.props = { ...item.props } || {};

      if (item.props.refName) {
        item.props.getRef = ref => {
          this.getRef(item.props.refName, ref);
        };
      }

      if (item.events) {
        let that = this;
        Object.keys(item.events).map(key => {
          item.props[key] = function () {
            that.exec(item.events[key], arguments);
          };
        });
      }

      // let text = messages(item.text) == "#" ? item.text : messages(item.text);

      let children = item.text
        ? [this.$t(item.text), ...this.renderNode(item.id)]
        : [...this.renderNode(item.id)];

      // this.formatProps(Object.assign({}, item));

      return Type && React.createElement(Type, { ...item.props, key: item.id, code: item.refName }, children);
    });
  };

  render() {
    return (
      <div style={{ backgroundColor: '#fff', padding: 10, overflow: 'auto', borderRadius: 4 }}>
        {this.renderNode()}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    components: state.components.components,
    selectedId: state.components.selectedId,
  };
}

export default connect(mapStateToProps)(Priview);
