import React, { Component } from 'react';
import { connect } from 'dva';
import CustomTable from 'components/Template/custom-table';
import SearchForm from 'components/Template/search-form';

import { messages } from '../../utils/utils';
import { Button } from 'antd';

import fetch from '../../utils/fetch';

class View extends Component {
  constructor(props) {
    super(props);
    this.state = {
      components: [],
      buttons: [],
    };
  }

  componentDidMount() {
    fetch.get(`/auth/api/menuButton/query/selectedButton?menuId=` + this.props.id).then(data => {
      fetch
        .get(`/auth/api/componentVersion/query/latest/byMenuId?menuId=` + this.props.id)
        .then(res => {
          this.setState({
            components: JSON.parse(res.contents || '[]'),
            buttons: data.map(item => item.buttonCode),
          });
        });
    });
  }

  selected = () => {};

  formatProps = data => {
    Object.keys(data).map(key => {
      if (typeof data[key] == 'string') {
        data[key] = data[key].replace(/\$\{(.+)\}/g, function(match, k) {
          return '45';
        });
      } else if (typeof data[key] == 'number') {
        data[key] = String(data[key]).replace(/\$\{(.+)\}/g, function(match, k) {
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
    let func = window.instances[String(key).split('.')[0]][String(key).split('.')[1]];
    func && func(...values);
  };

  renderNode = (id = 0) => {
    const { components = [], buttons } = this.state;

    let roots = components.filter(o => o.parent == id);

    const componentList = {
      table: CustomTable,
      'search-form': SearchForm,
      button: Button,
    };

    return roots.map(item => {
      if (item.type == 'button' && item.code && !buttons.includes(item.code)) {
        return;
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
          item.props[key] = function() {
            that.exec(item.events[key], arguments);
          };
        });
      }

      let text = messages(item.text) == '#' ? item.text : messages(item.text);

      let children = text ? [text, ...this.renderNode(item.id)] : [...this.renderNode(item.id)];

      // this.formatProps(Object.assign({}, item));

      return Type && React.createElement(Type, { ...item.props, key: item.id }, children);
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

export default connect(mapStateToProps)(View);
