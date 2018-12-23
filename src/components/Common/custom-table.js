import React, { Component } from 'react';
import { message } from 'antd';
import Table from 'widget/table'
import { DropTarget } from 'react-dnd';
import uuid from '../../utils/uuid';

import { connect } from 'dva';

const cardSource = {
  drop(props, monitor, component) {
    let item = monitor.getItem();

    if (item.text != 'table-column') {
      message.warning('table只能接收table-column!');
      return;
    }

    let box = {
      type: 'column',
      id: uuid(),
      props: {},
      text: '',
      parent: props.id,
      title: '',
      dataIndex: '',
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

class CustomTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      columns: [],
      pagination: {
        total: 50,
        showTotal: this.showTotal,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSize: 10,
        current: 1,
        onChange: this.indexChange,
        onShowSizeChange: this.sizeChange,
        pageSizeOptions: ['10', '20', '30', '40'],
      },
      loading: false,
      page: 0,
      size: 10,
      columns: [],
      methods: [
        {
          name: 'search',
          desc: '搜索',
        },
        {
          name: 'test',
          desc: '测试',
        },
        {
          name: 'reload',
          desc: '刷新',
        },
      ],
    };
  }

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
      let columns = nextProps.components.filter(o => o.parent == this.props.id);
      this.setState({ columns });
    }
  }

  test = () => {
    console.log('hello');
  };

  indexChange = (page, size) => {
    let pagination = this.state.pagination;
    pagination.current = page;
    this.setState({ page: page - 1, pagination }, this.getList);
  };

  sizeChange = (page, size) => {
    let pagination = this.state.pagination;
    pagination.current = 1;
    pagination.pageSize = size;
    this.setState({ page: 0, size: size, pagination }, this.getList);
  };

  showTotal = (total, range) => {
    return `共 ${total} 条数据`;
  };

  render() {
    const { columns } = this.state;
    const { connectDropTarget, className } = this.props;

    return (
      connectDropTarget &&
      connectDropTarget(
        <div className={className}>
          <Table
            columns={columns.map(item => ({ ...item, dataIndex: "" })) || []}
          />
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
)(DropTarget('box', cardSource, collect, { withRef: true })(CustomTable));
