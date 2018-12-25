/**
 * created by jsq on 2017/12/27
 */
import React from 'react'
import {connect} from 'dva'
import {Button,Form, message} from 'antd'
import Table from 'widget/table'
import accountingService from 'containers/financial-accounting-setting/accounting-source-system/accounting-source-system.service'
import 'styles/financial-accounting-setting/section-structure/section-mapping-set.scss'

class DataStructure extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      total: 0,
      columns: [
        {
          /*数据结构代码*/
          title: this.$t({id: "data.structure.code"}), key: "code", dataIndex: 'code',
        },
        {
          /*数据结构名称*/
          title: this.$t({id: "data.structure.name"}), key: "description", dataIndex: 'description',
        },
      ],
      selectedEntityOids: []    //已选择的列表项的Oids
    };
  }


  componentWillMount() {
    if (this.props.params.id) {
      this.getList();
    }
  }

  componentWillReceiveProps(nextProps) {

  }

  getList() {
    this.setState({loading: true})
    let params = {}
    params.sourceTransactionType = this.props.params.sourceTransactionCode;
    for (let paramsName in params) {
      !params[paramsName] && delete params[paramsName];
    }
    accountingService.getSourceTransactionData(params).then((response) => {
      response.data.map(item => {
        item.key = item.code
      });
      this.setState({
        data: response.data,
        loading: false,
        total: Number(response.headers['x-total-count']),
      })
    }).catch((e) => {
      this.setState({loading: false});
      message.error(e.response.data.message)
    })
  }


  onCancel = () => {
    this.props.onClose(false)
  };

  render() {
    const {loading, data, columns, total} = this.state;
    return (
      <div className="section-mapping-set">
        <div className="table-header">
          <div className="table-header-title">{this.$t({id: 'common.total'}, {total: `${total}`})}</div>
          {/*共搜索到*条数据*/}
        </div>
        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          bordered
          size="middle"/>
        <div className="slide-footer">
          <Button onClick={this.onCancel}>{this.$t({id: "common.cancel"})}</Button>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    company: state.user.company,
  }
}

const WrappedDataStructure = Form.create()(DataStructure);
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedDataStructure);
