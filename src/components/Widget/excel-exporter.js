import React from 'react';
import { connect } from 'dva';
import { Modal, Tabs, message, Table, Radio } from 'antd';
import PropTypes from 'prop-types';
const RadioGroup = Radio.Group;

//数据导出组件
class ExcelExporter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      excelVersion: 'xlsx',
    };
  }
  componentWillMount() {
    let selectedRowKeys = [];
    this.props.columns.map(item => {
      selectedRowKeys.push(item.dataIndex);
    });
    this.setState({
      selectedRowKeys,
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      let selectedRowKeys = [];
      this.props.columns.map(item => {
        selectedRowKeys.push(item.dataIndex);
      });
      let excelVersion = 'xlsx';
      this.setState({ selectedRowKeys, excelVersion });
    }
  }
  exportResult = () => {
    let { selectedRowKeys, excelVersion } = this.state;
    let columnsInfo = [];
    if (selectedRowKeys.length === 0) {
      message.error('请选择导出列');
      return;
    }
    this.props.columns.map(item => {
      let columnInfo = {};
      selectedRowKeys.map(key => {
        if (item.dataIndex === key) {
          columnInfo['title'] = item.title;
          columnInfo['name'] = item.dataIndex;
          columnsInfo.push(columnInfo);
        }
      });
    });
    let result = {};
    result['fileName'] = this.props.fileName;
    result['columnsInfo'] = columnsInfo;
    result['excelType'] = excelVersion;
    result['excelItem'] = this.props.excelItem;
    this.props.onOk(result);
    this.props.onCancel();
  };

  handleRowClick = record => {
    let { selectedRowKeys } = this.state;
    let hasRecord = false;
    selectedRowKeys.map((key, index) => {
      if (key === record.dataIndex) {
        selectedRowKeys.splice(index, 1);
        hasRecord = true;
      }
    });
    !hasRecord && selectedRowKeys.push(record.dataIndex);
    this.setState({ selectedRowKeys });
  };

  onSelectItem = (record, selected) => {
    let { selectedRowKeys } = this.state;
    selected
      ? selectedRowKeys.push(record.dataIndex)
      : selectedRowKeys.map((key, index) => {
          if (key === record.dataIndex) {
            selectedRowKeys.splice(index, 1);
          }
        });
    this.setState({ selectedRowKeys });
  };

  //选择当页全部时的判断
  onSelectAll = (selected, selectedRows, changeRows) => {
    changeRows.map(changeRow => this.onSelectItem(changeRow, selected));
  };

  render() {
    const { visible, columns } = this.props;
    const { excelVersion, selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onSelect: this.onSelectItem,
      onSelectAll: this.onSelectAll,
    };
    const pagination = { pageSize: 10 };
    return (
      <Modal
        visible={visible}
        width={800}
        destroyOnClose={true}
        onCancel={this.props.onCancel}
        onOk={this.exportResult}
        title="选择要导出的列"
        bodyStyle={{ height: '70vh', overflowY: 'scroll' }}
        okText="导出"
        cancelText={formatMessage({ id: 'common.cancel' })}
      >
        导出为：
        <RadioGroup
          onChange={e => this.setState({ excelVersion: e.target.value })}
          value={excelVersion}
        >
          <Radio value="xls">Excel 2003</Radio>
          <Radio value="xlsx">Excel 2007</Radio>
        </RadioGroup>
        <Table
          dataSource={columns}
          rowSelection={rowSelection}
          pagination={pagination}
          columns={[{ title: '列名', dataIndex: 'title', width: 150 }]}
          rowKey="dataIndex"
          size="middle"
          onRow={record => ({
            onClick: () => this.handleRowClick(record),
          })}
          // scroll={{ y: 450 }}
          style={{ marginTop: 10, cursor: 'pointer' }}
          bordered
        />
      </Modal>
    );
  }
}

ExcelExporter.propTypes = {
  visible: PropTypes.bool, // 导出弹框是否可见
  onCancel: PropTypes.func, //点击取消回调
  onOk: PropTypes.func, // 选择导出列回调，
  afterClose: PropTypes.func, //关闭后的回调
  columns: PropTypes.array, //需要导出的列
  fileName: PropTypes.string, // 导出的文件名称
  excelItem: PropTypes.string, //导出文件大类
};

ExcelExporter.defaultProps = {
  onOk: () => {},
  afterClose: () => {},
  columns: [],
  fileName: 'excel',
};

function mapStateToProps(state) {
  return {};
}
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(ExcelExporter);
