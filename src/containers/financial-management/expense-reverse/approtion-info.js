import React, { Component } from 'react'
import { Modal, Table, Alert, Input, Popover, message } from "antd"
import reimburseService from 'containers/reimburse/reimburse.service'

class Verification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      columns: [
     /*   {
          title: "关联申请单", dataIndex: "sourceDocumentCode", key: "sourceDocumentCode", width: 180, render: (value, record) => {
            return (
              <Popover content={value}>
                <div style={{ maxWidth: 180, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}><a>{value ? value : '-'}</a></div>
              </Popover>
            )
          }
        },*/
        {
          title: this.$t("exp.company"), dataIndex: "companyName", key: "companyName", width: 120, align:'center',
          render: (value, record) => {
            return <span>{value}</span>
          }
        },
        {
          title: this.$t("common.department"), dataIndex: "departmentName", key: "departmentName", width: 120, align: 'center',
          render: (value, record) => {
            return <span>{value}</span>
          }
        },            //"分摊金额"
        { title: this.$t('expense.apportion.amount'), dataIndex: "amount", key: "amount", width: 120, align: 'center',
          render: (desc) => this.formatMoney(this.props.mode ? -desc : desc) }
      ],
      data: [

      ],
      model: {},
      messageType: "warning",
      pagination: {
        total: 0
      },
      page: 0,
      pageSize: 5,
      loading: false,
      changeList: [],
      headerData: {},
      id: "",
      x: 0
    }
  }

  componentDidMount(){
      this.setState({
        data: [], changeList: [], page: 0, pagination: {
          total: 0,
          current: this.state.page + 1
        },
      });
    

    //显示
      this.setState({ visible: this.props.visible, id: this.props.id, loading: true, headerData: this.props.headerData }, () => {
        //this.getColumns();
        this.getList();
      })
    
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.visible && this.props.visible) {
      this.setState({
        data: [], changeList: [], page: 0, pagination: {
          total: 0,
          current: this.state.page + 1
        },
      });
    }

    //显示
    if (nextProps.visible && !this.props.visible) {
      this.setState({ visible: nextProps.visible, id: nextProps.id, loading: true, headerData: nextProps.headerData }, () => {
        //this.getColumns();
        this.getList();
      })
    }
  }

  getColumns = () => {

    let cols = this.state.columns;

    if (!this.state.headerData.relatedApplication) {
      if (cols[0].dataIndex == "sourceDocumentCode") {
        cols.splice(0, 1);
        this.setState({ columns: cols });
      }
    }

   /* if (!this.state.headerData.defaultApportionInfo.costCenterItems || !this.state.headerData.defaultApportionInfo.costCenterItems.length) return;
*/
    let columns = [
      {       //关联申请单
        title: this.$t('expense-report.association.request'), dataIndex: "sourceDocumentCode", key: "sourceDocumentCode", fixed: "left", width: 180, render: (value, record) => {
          return (
            <Popover content={value}>
              <div style={{ maxWidth: 180, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}><a>{value}</a></div>
            </Popover>
          )
        }
      },
      {
        title: this.$t('exp.company'), dataIndex: "companyName", key: "companyName", width: 120, render: (value, record) => {
          return <span>{value}</span>
        }
      },
      {
        title: this.$t("common.department"), dataIndex: "departmentName", key: "departmentName", width: 120, render: (value, record) => {
          return <span>{value}</span>
        }
      }
    ];

    if (!this.state.headerData.relatedApplication) {
      columns = [
        {
          title: this.$t('exp.company'), dataIndex: "companyName", key: "companyName", width: 120, render: (value, record) => {
            return <span>{value}</span>
          }
        },
        {
          title: this.$t("common.department"), dataIndex: "departmentName", key: "departmentName", width: 120, render: (value, record) => {
            return <span>{value}</span>
          }
        },
      ]
    }

    this.state.headerData.defaultApportionInfo.costCenterItems.map(o => {
      columns.push({ title: o.fieldName, dataIndex: o.sequenceNumber, key: o.sequenceNumber })
    });
                         //分摊金额
    columns.push({ title: this.$t('expense.apportion.amount'), dataIndex: "amount", fixed: "right", width: 100, key: "amount", render: desc => this.filterMoney(this.props.mode === "negative" ? -desc : desc) });

    let width = this.state.headerData.relatedApplication ? 400 : 300;
    this.setState({ columns, flag: true, x: this.state.headerData.defaultApportionInfo.costCenterItems.length ? width + (this.state.headerData.defaultApportionInfo.costCenterItems.length) * 150 : false });
  };

  //格式化金额
  formatMoney = (money, fixed = 2) => {
    if (typeof fixed !== "number") fixed = 2;
    money = Number(money || 0).toFixed(fixed).toString();
    let numberString = '';
    if (money.indexOf('.') > -1) {
      let integer = money.split('.')[0];
      let decimals = money.split('.')[1];
      numberString = integer.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + '.' + decimals;
    } else {
      numberString = money.replace(/(\d)(?=(\d{3})+(?!\d))\./g, '$1,');
    }
    numberString += (numberString.indexOf('.') > -1 ? '' : '.00');
    return numberString;
  };

  //获取列表
  getList = () => {

    let model = { ...this.state.model, page: this.state.page };

    this.setState({ loading: true });

    reimburseService.getApprotionLine(this.state.id).then(res => {

      (res.data && res.data.length) && res.data.map(item => {
        item.key = item.id;
        (item.costCenterItems && item.costCenterItems.length) && item.costCenterItems.map(o => {
          item[o.sequenceNumber] = o.costCenterItemName;
        })
      });

      this.setState({
        data: res.data,
        pagination: {
          total: res.data.length,
          current: this.state.page + 1,
          pageSize: this.state.pageSize,
          onChange: this.onChangePaper,
          showTotal: total => this.$t('common.total1',{total: total})
        },
        loading: false
      });
    })
  };
  //分页
  onChangePaper = (page) => {
    if (page - 1 !== this.state.page) {
      this.setState({ page: page - 1 }, () => {
        this.getList();
      })
    }
  };

  handleCancel = () => {
    this.props.close && this.props.close();
  };

  change = (e, index) => {
    let data = this.state.data;
    let writeOffAmount = data[index].writeOffAmount;
    let model = this.state.model;
    data[index].writeOffAmount = e.target.value;

    let changeList = this.state.changeList;
    let record = changeList.find(o => data[index].cshTransactionDetailId == o.cshTransactionDetailId);
    if (record) {
      record.writeOffAmount = e.target.value;
    } else {
      changeList.push(data[index]);
    }

    if (writeOffAmount && e.target.value) {
      model.writeOffAmount += parseFloat(e.target.value) - parseFloat(writeOffAmount);
    }
    else if (!writeOffAmount && e.target.value) {
      model.writeOffAmount += parseFloat(e.target.value)
    }
    else if (!e.target.value && writeOffAmount) {
      model.writeOffAmount -= parseFloat(writeOffAmount)
    }


    this.setState({ data, changeList, model }, this.checkAmount);
  };

  //检查头上金额
  checkAmount = () => {

    let model = this.state.model;

    if (model.writeOffAmount > model.amount) {
      this.setState({ messageType: "error" })
    }
    else {
      this.setState({ messageType: "warning" })
    }
  };

  render() {
    const { data, columns, model, messageType, loading } = this.state;
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
        <Table loading={loading} pagination={this.state.pagination} bordered dataSource={data} columns={columns}></Table>
      </Modal>
    )
  }
}


export default Verification
