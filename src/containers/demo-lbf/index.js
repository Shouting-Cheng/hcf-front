
import React, { Component } from 'react'
import SearchArea from 'widget/search-area'
import SlideFrame from "widget/slide-frame"
import { Button, Table, message, Modal } from 'antd'
import FormToAddOrEditData from './form.js'
import service from './service.js'

class DemoLbfParamsSetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchForm: [{
        type: 'input',
        id: 'tableName',
        label: '表名称',
        placeholder: '请输入',
        colSpan: '6'
      }, {
        type: 'value_list',
        id: 'dataType',
        options: [],
        valueListCode: 3101,
        label: '参数类型',
        placeholder: '请选择',
        colSpan: '6'
      }, {
        type: 'value_list',
        id: 'filterMethod',
        options: [],
        valueListCode: 3104,
        label: '筛选方式',
        placeholder: '请选择',
        colSpan: '6'
      }, {
        type: 'input',
        id: 'dataTypeName',
        label: '参数名称',
        placeholder: '请输入',
        colSpan: '6'
      }],
      columns: [{
        title: '表名称',
        dataIndex: 'tableName',
        align: 'center'
      }, {
        title: '参数类型',
        dataIndex: 'dataType',
        align: 'center'
      }, {
        title: '筛选方式',
        dataIndex: 'filterMethod',
        align: 'center'
      }, {
        title: '关联条件',
        dataIndex: 'customSql',
        align: 'center'
      }, {
        title: '参数名称',
        dataIndex: 'dataTypeName',
        align: 'center'
      }, {
        title: '操作',
        align: 'center',
        render: (text, record, index) => {
          return (
            <span>
              <Button
                size='small'
                type='primary'
                style={{ marginRight: '4px' }}
                onClick={() => { this.editData(record) }}>编辑</Button>
              <Button
                size='small'
                onClick={() => { this.confirmToDel(record.id, index) }}>删除</Button>
            </span>
          )
        },
      }],
      tableData: [],
      isLoading: false,
      searchParams: {},
      page: 0,
      size: 10,
      pagination: {
        showSizeChanger: true,
        showQuickJumper: true
      },
      isVisibleToEditData: false,
      formData: {}
    }
  }

  componentDidMount() {
    this.getParamsData();
  }

  //获取数据
  getParamsData = () => {
    let { searchParams, page, size, pagination } = this.state;
    this.setState({ isLoading: true })
    service.getParamsDataList({ ...searchParams, page, size })
      .then(res => {
        pagination.total = Number(res.headers['x-total-count']);
        this.setState({
          tableData: res.data,
          isLoading: false,
          pagination
        });
      })
      .catch(err => {
        message.error(err.response.data.message);
        this.setState({ isLoading: false });
      })
  }

  //分页
  tablePageChange = (pagination) => {
    this.setState({
      page: pagination.current - 1,
      size: pagination.pageSize || 10
    }, () => {
      this.getParamsData();
    })
  }

  //按给定的所有条件查询
  search = (values) => {
    Object.keys(values).map(key => {
      if (!values[key]) {
        delete values[key]
      }
    });

    this.setState({ searchParams: values }, () => {
      this.getParamsData();
    })
  }

  //清空查询条件
  empty = () => {
    this.setState({ searchParams: {} })
  }

  //新增数据,打开新增数据模态框
  addNewData = () => {
    this.setState({
      isVisibleToEditData: true,
      formData: {}
    })
  }

  //关闭模态框
  closeFormModal = (flag) => {
    if (flag) this.getParamsData();
    this.setState({
      isVisibleToEditData: false,
      formData: {}
    })
  }

  //编辑数据--将当前行数据挂载到模态框中
  editData = (record) => {
    this.setState({
      formData: JSON.parse(JSON.stringify(record)),
      isVisibleToEditData: true
    });
  }

  /**
   * 删除数据，如果当前页数据只有一条,删除后跳转至page0
   */
  delData = (id, index) => {
    service.delParamsData(id)
      .then(res => {
        message.success("删除成功", 5);
        if (index < 1) {
          this.setState({ page: 0 }, () => {
            this.getParamsData();
          })
        } else this.getParamsData();
      })
      .catch(err => {
        console.log(err);
        message.error(err.response.data.message, 5);
      })
  }
  //提示：是否删除
  confirmToDel = (id, index) => {
    const that = this;
    Modal.confirm({
      title: '您是否确认要删除该数据',
      onOk() {
        that.delData(id, index);
      },
      onCancel() { },
    });
  }

  render() {
    const {
      searchForm,
      tableData,
      isLoading,
      columns,
      pagination,
      isVisibleToEditData,
      formData
    } = this.state;

    return (
      <div>
        <SearchArea
          searchForm={searchForm}
          submitHandle={this.search}
          clearHandle={this.empty} />
        <Button
          style={{ margin: '30px 0' }}
          type="primary"
          onClick={this.addNewData}>新增数据</Button>
        <Table
          rowKey={record => record.id}
          size="middle"
          bordered
          dataSource={tableData}
          columns={columns}
          loading={isLoading}
          pagination={pagination}
          onChange={this.tablePageChange}></Table>
        <SlideFrame
          title={formData.id ? "编辑参数配置" : "新建参数配置"}
          show={isVisibleToEditData}
          onClose={() => {
            this.setState({ isVisibleToEditData: false })
          }}>
          <FormToAddOrEditData params={formData} close={this.closeFormModal} />
        </SlideFrame>
      </div>
    )
  }
}

export default DemoLbfParamsSetting
