
import React, { Component } from 'react';
import { Button, Badge, Input, Divider, message, Popconfirm } from 'antd';
import ListSelector from 'components/Widget/list-selector';
import Table from 'widget/table';
import Importer from 'components/Widget/Template/importer.js'
import ImporterNew from 'widget/Template/importer-new';
import ExcelExporter from 'widget/excel-exporter';
import SlideFrame from 'widget/slide-frame';
import ValueForm from './new-dimevalue-form.js';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import config from 'config';
import FileSaver from 'file-saver';
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
         //当前账套Id
         setOfBooksId: null,
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
         //分配公司模态框可见性
         companyVisible: false,
         //公司模态框样式
         selectorItem: {
            title: "批量分配公司",
            url: `${config.baseUrl}/api/dimension/item/assign/company/filter/by/setOfBooksId`,
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
         },
         importerVisible: false,
         excelVisible: false,
         exportColumns: [
          { title: '维值代码', dataIndex: 'dimensionItemCode' },
          { title: '维值名称', dataIndex: 'dimensionItemName' },
          { title: '权限', dataIndex: 'visibleUserScope' },
          { title: '状态', dataIndex: 'enabled' },
        ],
       }
    }

    componentDidMount = () => {
       this.getDetailsValue();
    }

    componentWillReceiveProps = (nextProps) => {
        this.setState({setOfBooksId:nextProps.setOfBooksId});
    }
    //获取维值数据
    getDetailsValue = () => {
      let { searchForm, page, size, pagination, dimensionId } = this.state;
      this.setState({isLoading: true})
      dimensionValueService
        .getDimensionList({ ...searchForm, page, size, dimensionId })
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
           message.error('失败:'+err.response.data.message);
           this.setState({isLoading: false});
        })
    }
    //搜索
    getSearchData = (value) => {
      this.setState({
          searchForm: {dimensionItemCode: value}
      },() => {
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
      const {dimensionId,setOfBooksId} = this.state;
      this.props.dispatch(
        routerRedux.replace({
          pathname: `/admin-setting/dimension-definition/batch-company/${setOfBooksId}/${dimensionId}/${record.id}`,
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
      this.setState({
        companyVisible: false,
        selectedRowKeys: [],
        ableToAllocate: true
      });
    }
    onCompanyOk = value => {
        const params = [];
        const { selectedRowKeys } = this.state;
        value.result.map( item => {
            params.push({
              companyId: item.id,
              companyCode: item.companyCode,
              enabled: item.enabled,
            });
        });
        let temp = [];
        params.forEach(company => {
           selectedRowKeys.forEach(selectedId => {
              temp.push({...company,dimensionItemId: selectedId})
           });
        });
        dimensionValueService
          .addNewCompanyData(temp)
          .then(res => {
              this.getDetailsValue();
              message.success('分配成功');
              this.setState({
                companyVisible: false,
                selectedRowKeys: [],
                ableToAllocate: true
              });
          })
          .catch(err => {
              message.error(err.response.data.message);
              this.setState({
                companyVisible: false,
                selectedRowKeys: [],
                ableToAllocate: true
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

    //导入--可视化导入模态框
    handelImport = () => {
       this.setState({importerVisible: true});
    }
    //确认导入
    onConfirmImport = transactionId => {
        dimensionValueService
           .confirmImporter(transactionId)
           .then(res => {
              this.setState({importerVisible: false});
              this.getDetailsValue();
              message.success('导入成功');
           })
           .catch(err => {
              message.error(err.response.data.message);
              this.setState({importerVisible: false});
           });
    }
    //导出维值--可视化导出模态框
    handleExport = () => {
      this.setState({excelVisible: true});
    }
    //确认导出
    confirmExport = result => {
      let hide = message.loading('正在生成文件，请等待......');
      const {dimensionId} = this.state;
      dimensionValueService
        .exportDimensionValue(result,dimensionId)
        .then(res => {
           if (res.status === 200) {
            message.success('导出成功');
            let fileName = res.headers['content-disposition'].split('filename=')[1];
            let f = new Blob([res.data]);
            FileSaver.saveAs(f, decodeURIComponent(fileName));
            hide();
          }
        })
        .catch(err => {
          //  message.error(err.response.data.message);
           message.error('下载失败，请重试!');
           hide();
        });
    }
    onExportCancel = () => {
       this.setState({excelVisible: false});
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
        companyVisible,
        selectorItem,
        importerVisible,
        dimensionId,
        excelVisible,
        exportColumns,
        setOfBooksId} = this.state;

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
              <Button
                style={{marginRight: '20px'}}
                onClick={this.handelImport}>导入维值</Button>
              <Button
                style={{marginRight: '20px'}}
                onClick={this.handleExport}
              >导出维值</Button>
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
                ref='searchRef'
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
                close={this.closeFormModal}
                dimensionId={dimensionId}/>
          </SlideFrame>
          <ListSelector
              visible={companyVisible}
              onCancel={this.onCompanyCancel}
              onOk={this.onCompanyOk}
              selectorItem={selectorItem}
              extraParams={{setOfBooksId}}
              single={false}
              showSelectTotal={true}
            />
            {/*导入 */}
          <ImporterNew
            visible={importerVisible}
            templateUrl={`${config.baseUrl}/api/dimension/item/template`}
            deleteDataUrl={`${config.baseUrl}/api/dimension/item/import/delete`}
            errorUrl={`${config.baseUrl}/api/dimension/item/import/error/export`}
            errorDataQueryUrl={`${config.baseUrl}/api/dimension/item/import/query/result`}
            uploadUrl={`${config.baseUrl}/api/dimension/item/import?dimensionId=${dimensionId}`}
            fileName='维值导入模板'
            afterClose={() => {this.setState({importerVisible: false})}}
            onOk={this.onConfirmImport} />
           {/* 导出 */}
           <ExcelExporter
            visible={excelVisible}
            onOk={this.confirmExport}
            columns={exportColumns}
            canCheckVersion={false}
            fileName={'维值'}
            onCancel={this.onExportCancel}
            excelItem={'PREPAYMENT_FINANCIAL_QUERY'} />
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
