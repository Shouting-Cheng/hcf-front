
import React, { Component } from 'react';
import { Button, Badge, Input, Divider, message } from 'antd';

import Table from 'widget/table';
import CustomTable from 'widget/custom-table';
import SlideFrame from 'widget/slide-frame';
import ValueForm from './new-dimevalue-form.js';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import dimensionValueService from './dimension-value-service';



const Search = Input.Search;

class DimensionDeValue extends Component {
    constructor(props) {
       super(props);
       this.state = {
          // setOfBooksId: this.props.company.setOfBooksId,
          //是否允许分配公司按钮可用
          ableToAllocate: true,
          searchForm: {},
          valueColumns: [
            {
              title: '维值代码',
              dataIndex: 'dimensionItemCode',
              align: 'center'
            },
            {
              title: '维值名称',
              dataIndex: 'dimensionItemName',
              align: 'center'
            },{
              title: '状态',
              dataIndex: 'enabled',
              align: 'center',
              render: (enabled, record, index) => {
                return (
                  <Badge status={enabled ? 'success' : 'error'} text={enabled ? '启用' : '禁用'} />
                );
              }
            },{
                title: '操作',
                dataIndex: 'operation',
                align: 'center',
                render: (operation, record, index) => {
                  return (
                    <div>
                      <a onClick={e => this.EditDimValue(e, record)}> 编辑</a>
                      <Divider type="vertical" />
                      <a onClick={e => this.onCompanyClick(e, record)}>分配公司</a>
                    </div>
                  );
                }
            }
         ],
         data: [],
         //维度id
         dimensionId: this.props.dimensionId,
         //被选中的维值数据的id
         selectedRowKeys: [],
         isLoading: false,
         //是否可见新增/编辑模态框
         isVisibleForFrame: false,
         //新增/编辑模态框的数据集合
         modelData: {},
         page: 0,
         size: 10,
         pagination: {
           showSizeChanger: true,
           showQuickJumper: true,
           showTotal: total => `一共${total}条数据`
         },
       }
    }

    componentDidMount = () => {
       this.getDetailsValue();
    }
    getDetailsValue = () => {
      const datas =  [{
        id: 0,
        dimensionItemCode:'cp0',
        dimensionItemName: '组1',
        enabled: true
      },{
          id: 1,
          dimensionItemCode:'cp1',
          dimensionItemName: '组2',
          enabled: false
      }];
      this.setState({isLoading: true});
      this.setState({dataArr: datas});
      this.setState({isLoading: false});
      // let { searchParams, page, size, pagination, dimensionId } = this.state;
      // this.setState({isLoading: true})
      // dimensionValueService.getDimensionList({ ...searchParams, page, size, dimensionId })
      //   .then(res => {
      //       console.log(res);
      //       pagination.total = Number(res.headers['x-total-count']);
      //       this.setState({
      //         tableData: res.data,
      //         isLoading: false,
      //         pagination
      //       });
      //   })
      //   .catch(err => {
      //      console.log(err);
      //      message.error('失败:'+err);
      //      this.setState({isLoading: false});
      //   })
    }

    //搜索
    getSearchData = (value) => {
      this.setState({
          searchForm: {dimensionCode: value}
      },() => {
        console.log(this.state.searchForm);
        this.setState({
          searchForm: {}
        });
      })
    }

    //新增维值
    addNewDimValue = () => {
        this.setState({isVisibleForFrame: true});
    }
    //编辑维值
    EditDimValue = (e,record) => {
        this.setState({
           modelData: JSON.parse(JSON.stringify(record)),
           isVisibleForFrame: true
        })
    }
    //批量分配公司按钮
    batchAllocation = () => {
        // this.setState({batACompanyModalView: true});
    }
    //分配公司
    onCompanyClick = (e,record) => {
      console.log(record);
      this.props.dispatch(
        routerRedux.replace({
          //账套id,recordid
          pathname: `/admin-setting/dimension-definition/batch-company/${record.id}`,
        })
      );
    }
    //表格内数据批量选择
    onSelectChange = (selectedRowKeys) => {
      console.log(selectedRowKeys);
      this.setState({ selectedRowKeys }, () => {
          selectedRowKeys.length > 0 ? this.setState({ableToAllocate: false}) : this.setState({ableToAllocate: true})
      });
    }
    //关闭模态框
    closeFormModal = () => {
       this.setState({
          isVisibleForFrame: false,
          modelData: {}
       })
    }

    render() {
      const {
        ableToAllocate,
        valueColumns,
        selectedRowKeys,
        isLoading,
        isVisibleForFrame,
        modelData,
        pagination,
        dataArr} = this.state;

      const rowSelection = {
        selectedRowKeys,
        onChange: this.onSelectChange,
      };

      return (
        <div>
          <div className='ant-row' style={{padding: '20px 0'}}>
            <div className='ant-col-18'>
              <Button
                type='primary'
                style={{marginRight: '20px'}}
                onClick={this.addNewDimValue}>新建维值</Button>
              <Button style={{marginRight: '20px'}}>导入维值</Button>
              <Button style={{marginRight: '20px'}}>导出维值</Button>
              <Button
                disabled={ableToAllocate}
                style={{marginRight: '20px'}}
                onClick={this.batchAllocation}>分配公司</Button>
            </div>
            <div className='ant-col-6'>
              <Search
                placeholder='请输入维值代码'
                onSearch={value => {
                  this.getSearchData(value);
                }}
                style={{width: '100%'}} />
            </div>
          </div>
          {/* <CustomTable
            columns={valueColumns}
            // url={``}
            ref={ref => this.table = ref}
          /> */}
          <Table
            rowKey={record => record.id}
            rowSelection={rowSelection}
            size="middle"
            bordered
            columns={valueColumns}
            dataSource={dataArr}
            loading={isLoading}
            pagination={pagination} />
          <SlideFrame
            title={modelData.id ? "编辑维值数据" : "新建维值数据"}
            show={isVisibleForFrame}
            onClose={() => {
              this.setState({ isVisibleForFrame: false }, () => {
                 this.setState({modelData: {}});
              })
          }}>
              <ValueForm params={modelData} close={this.closeFormModal}/>
          </SlideFrame>
        </div>
      )
    }
}


export default connect(
  null,
  null,
  null,
  { withRef: true }
)(DimensionDeValue);
