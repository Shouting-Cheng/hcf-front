import React, { Component } from 'react';
import { Modal, Table, Popover } from 'antd';

class Verification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      columns: [
        {
          title: this.$t('acp.company'),
          dataIndex: 'companyName',
          key: 'companyName',
          width: 120,
          align: 'center',
          render: desc => (
            <Popover content={desc}>
              <span>{desc ? desc : '-'}</span>
            </Popover>
          ),
        },
        {
          title: this.$t('acp.unitName'),
          dataIndex: 'unitName',
          key: 'unitName',
          width: 120,
          align: 'center',
          render: desc => (
            <Popover content={desc}>
              <span>{desc ? desc : '-'}</span>
            </Popover>
          ),
        },
        {
          title: this.$t('exp.adjust.type'),
          dataIndex: 'expenseTypeName',
          key: 'expenseTypeName',
          width: 120,
          align: 'center',
          render: desc => (
            <Popover content={desc}>
              <span>{desc ? desc : '-'}</span>
            </Popover>
          ),
        },
        {
          title: this.$t('exp.detail.amount'),
          dataIndex: 'amount',
          key: 'amount',
          align: 'center',
          width: 80,
          render: desc => this.formatMoney(desc),
        },
      ],
      data: [],
      model: {},
      messageType: 'warning',
      pagination: {
        total: 0,
        page: 0,
        pageSize: 5,
      },
      loading: false,
      changeList: [],
      headerData: {},
      id: '',
      x: 0,
    };
  }

  componentDidMount() {
    console.log(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const { columns } = this.state;
    if (nextProps.visible && !this.props.visible) {
      const pagination = this.state.pagination;
      if (nextProps.params.costCenterData.length) {
        if (columns.length === 4) {
          nextProps.params.costCenterData.reverse().map(
            item =>
              item &&
              columns.splice(2, 0, {
                title: item.name,
                key: item.id,
                dataIndex: 'dimension' + item.sequenceNumber + 'Name',
                align: 'center',
                render: desc => <Popover content={desc}>{desc ? desc : '-'}</Popover>,
              })
          );
        }
        pagination.tota = nextProps.params.data;
      }
      this.setState({
        columns,
        pagination,
        data: nextProps.params.data,
      });
    }
  }
  //分页
  onChangePaper = page => {
    const pagination = this.state.pagination;
    pagination.page = page;
    pagination.current = page;
    this.setState({ pagination });
  };

  handleCancel = () => {
    this.setState({ data: [] });
    this.props.close && this.props.close();
  };

  render() {
    const { data, columns, model, messageType, loading, pagination } = this.state;
    return (
      <Modal
        className="select-cost-type"
        title={this.$t('exp.detail.info')}
        visible={this.props.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        width="65%"
        footer={false}
        rowkey={record => record.id}
      >
        <Table
          rowKey={record => record.key}
          loading={loading}
          pagination={pagination}
          bordered
          dataSource={data}
          columns={columns}
        />
      </Modal>
    );
  }
}

export default Verification;
