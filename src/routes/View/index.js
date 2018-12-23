import React from 'react';
import fetch from '../../utils/fetch';
import { Tabs } from 'antd';
import View from './view';
import httpFetch from '../../utils/fetch';
import { messages } from '../../utils/utils';

const TabPane = Tabs.TabPane;

class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      panes: [],
      activeKey: '0',
      menus: [],
    };
  }

  componentDidMount() {
    httpFetch.get(`/api/menu/query`).then(res => {
      let { panes } = this.state;
      let id = this.props.match.params.id;
      let menu = res.find(o => o.id == id) || {};
      panes.push({ id: String(id), name: menu.menuName });
      this.setState({ panes, activeKey: String(id), menus: res });
    });
  }

  componentWillReceiveProps(nextProps) {
    let { panes, menus } = this.state;

    let id = nextProps.match.params.id;

    if (panes.length > 0 && panes.findIndex(o => o.id == String(id)) < 0) {
      let menu = menus.find(o => o.id == id) || {};
      panes.push({ id: String(id), name: menu.menuName });
      this.setState({ panes, activeKey: String(id) });
    } else {
      this.setState({ activeKey: String(id) });
    }
  }

  componentWillUnmount() {
    this.setState({ panes: [] });
  }

  onChange = activeKey => {
    this.setState({ activeKey });
  };

  onEdit = (targetKey, action) => {
    if (action === 'remove') {
      this.remove(targetKey);
    }
  };

  remove = targetKey => {
    let activeKey = this.state.activeKey;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.id === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.id !== targetKey);
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = panes[lastIndex].key;
    }
    this.setState({ panes, activeKey });
  };

  render() {
    const { panes } = this.state;

    return <View id={this.props.match.params.id} />;
  }
}
export default Menu;
