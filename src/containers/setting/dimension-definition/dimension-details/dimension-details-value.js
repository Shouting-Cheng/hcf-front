
import React, { Component } from 'react';
import { Button, Badge, Input, Divider, message, Popconfirm } from 'antd';
import ListSelector from 'components/Widget/list-selector';
import Table from 'widget/table';
import SlideFrame from 'widget/slide-frame';
import ValueForm from './new-dimevalue-form.js';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import config from 'config';
import dimensionValueService from './dimension-value-service';



const Search = Input.Search;

class DimensionDeValue extends Component {
    constructor(props) {
       super(props);
       this.state = {
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
                      <Divider type="vertical" />
                      <Popconfirm
                        title="确定删除？"
                        onConfirm={() => this.onDelClick(record.id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <a>删除</a>
                      </Popconfirm>
                    </div>
                  );
                }
            }
         ],
         //列表所需数据
         dataArr: [],
         //维度id
        //  dimensionId: this.props.match.params.dimensionId,
         dimensionId: '1077473797370626050',
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
         //分配公司模态框可见性
         companyVisible: false,
         //公司模态框样式
         selectorItem: {
            title: "批量分配公司",
            url: `${config.baseUrl}/api/refactor/companies/user/setOfBooks`,
            searchForm: [
              { type: 'input', id: 'companyCode', label: '公司代码' },
              { type: 'input', id: 'name', label: '公司名称' },
              { type: 'input', id: 'companyCodeFrom', label: '公司代码从' },
              { type: 'input', id: 'companyCodeTo', label: '公司代码至' }
            ],
            columns: [
              { title: '公司代码', dataIndex: 'companyCode' },
              { title: '公司名称', dataIndex: 'name' },
              { title: '公司类型', dataIndex: 'companyTypeName', render: value => value ? value : '-' },
            ],
            key: 'id'
         }
       }
    }

    componentDidMount = () => {
       this.getDetailsValue();
    }
    //获取维值数据
    getDetailsValue = () => {
      let { searchForm, page, size, pagination, dimensionId } = this.state;
      this.setState({isLoading: true})
      dimensionValueService.getDimensionList({ ...searchForm, page, size, dimensionId })
        .then(res => {
            const temp = [];
            res.data.forEach(item => {
              let obj = {
                departmentOrUserGroupIdList: item['departmentOrUserGroupIdList'],
                departmentOrUserGroupList: item['departmentOrUserGroupList'],
                ...item['dimensionItem']
              }
              //  temp.push(item['dimensionItem']);
              temp.push(obj);
            });
            pagination.total = Number(res.headers['x-total-count']);
            this.setState({
              dataArr: temp,
              isLoading: false,
              pagination
            });
        })
        .catch(err => {
           console.log(err);
           message.error('失败:'+err);
           this.setState({isLoading: false});
        })
    }
    //搜索
    getSearchData = (value) => {
      this.setState({
          searchForm: {dimensionItemCode: value}
      },() => {
        console.log(this.state.searchForm);
        this.getDetailsValue();
        this.setState({
          searchForm: {}
        });
      });
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
    //删除
    onDelClick = id => {
      dimensionValueService.delDimensionValue(id)
        .then(res => {
          let { size, page, pagination } = this.state;
          let { total, current } = pagination;
          if (Math.ceil(total / size) === current) {
            if (Number.isInteger((total - 1) / size)) {
              page -= 1;
              current -= 1;
            }
          }
          message.success('删除成功！');
          this.setState({ page, pagination: { current } }, () => {
            this.getDetailsValue();
          });
        })
        .catch(err => {
          message.error(err.response.data.message);
        });
    }

    //分页
    tablePageChange = (pagination) => {
      this.setState({
        page: pagination.current - 1,
        size: pagination.pageSize || 10
      }, () => {
        this.getDetailsValue();
      })
    }

    //分配公司--跳转
    onCompanyClick = (e,record) => {
      console.log(record);
      this.props.dispatch(
        routerRedux.replace({
          pathname: `/admin-setting/dimension-definition/batch-company/${record.id}`,
        })
      );
    }
    //表格内数据批量选择
    onSelectChange = (selectedRowKeys) => {
      this.setState({ selectedRowKeys }, () => {
          selectedRowKeys.length > 0
             ? this.setState({ableToAllocate: false})
             : this.setState({ableToAllocate: true})
      });
    }
    //批量分配公司按钮
    batchAllocation = () => {
      this.setState({companyVisible: true});
    }
    onCompanyCancel = () => {
      this.setState({companyVisible: false});
    }
    onCompanyOk = value => {
        const params = [];
        const { selectedRowKeys } = this.state;
        value.result.map( item => {
            params.push({
              companyId: item.id,
              companyCode: item.code,
              enabled: item.enabled,
            });
        });
        let temp = [];
        params.forEach(company => {
           selectedRowKeys.forEach(selectedId => {
              temp.push({...company,dimensionItemId: selectedId})
           });
        })
        dimensionValueService
          .addNewCompanyData(temp)
          .then(res => {
              this.getDetailsValue();
              message.success('创建成功');
              this.setState({
                companyVisible: false,
                selectedRowKeys: []
              });
          })
          .catch(err => {
              message.error(err.response.data.message);
              this.setState({
                companyVisible: false,
                selectedRowKeys: []
              });
          })
    }

    //关闭新增/编辑模态框
    closeFormModal = (flag) => {
       this.setState({
          isVisibleForFrame: false,
          modelData: {}
       },() => {
          if(flag) {
            this.getDetailsValue();
          }
       });
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
        dataArr,
        searchForm,
        companyVisible,
        selectorItem} = this.state;

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
          <Table
            rowKey={record => record.id}
            rowSelection={rowSelection}
            size="middle"
            bordered
            columns={valueColumns}
            dataSource={dataArr}
            loading={isLoading}
            pagination={pagination}
            onChange={this.tablePageChange} />
          <SlideFrame
            title={modelData.id ? "编辑维值数据" : "新建维值数据"}
            show={isVisibleForFrame}
            onClose={() => {
              this.setState({ isVisibleForFrame: false }, () => {
                 this.setState({modelData: {}});
              })
          }}>
              <ValueForm
                params={modelData}
                close={this.closeFormModal}/>
          </SlideFrame>
          <ListSelector
              visible={companyVisible}
              onCancel={this.onCompanyCancel}
              onOk={this.onCompanyOk}
              selectorItem={selectorItem}
              extraParams={{setOfBooksId:1,page: 0,size: 10}}
              single={false}
            />
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
