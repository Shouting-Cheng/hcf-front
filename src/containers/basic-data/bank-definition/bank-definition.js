import React from 'react';
import { connect } from 'dva';

import {
  Button,
  Badge,
  Popover,
  Popconfirm,
  Tabs,
  Modal,
  Upload,
  Icon,
  message,
} from 'antd';
import Table from 'widget/table'
import SearchArea from 'components/Widget/search-area';
import config from 'config';
import 'styles/basic-data/bank-definition/bank-definition.scss';
import SlideFrame from 'components/Widget/slide-frame';
import CreateOrUpdateBank from 'containers/basic-data/bank-definition/create-or-update-bank';
//import ImportErrInfo from 'components/Widget/Template/import-err-info';
const TabPane = Tabs.TabPane;
import BSService from 'containers/basic-data/bank-definition/bank-definition.service';
import FileSaver from 'file-saver';
import ImporterNew from 'widget/Template/importer-new';
import ExcelExporter from 'widget/excel-exporter'
import httpFetch from 'share/httpFetch';

class BankDefinition extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      slideFrameKey: 0,
      loading: false,
      showImportBankModel: false, //导入自定义银行弹窗
      progressImportErrInfo: 1,
      showImportErrInfo: false,
      transactionOid: null,
      errorsList: [],
      fileList: [],
      flieUploading: false, //文件是否正在上传
      excelVisible: false,
      data: [],
      country: [], //需要传入侧边栏的数据
      label: 'customBank',
      slideFrame: {
        title: '',
        visible: false,
        params: {},
      },
      tabs: [
        { key: 'customBank', name: this.$t('bank.customBank') } /*自定义银行*/,
        { key: 'commonBank', name: this.$t('bank.commonBank') } /*通用银行*/,
      ],
      //点击顶部搜索时要参数
      searchParams: {
        bankCode: '',
        bankBranchName: '',
        countryCode: '',
        openAccount: '',
        // bankName: "",
        // provinceCode: "",
        // cityCode: "",
        // districtCode: ""
      },
      //顶部搜索区域
      searchForm: [
        { type: 'input', id: 'bankCode', label: this.$t('bank.bankCode') } /*银行代码*/,
        { type: 'input', id: 'bankBranchName', label: this.$t('bank.bankBranchName') } /*支行*/,
        {
          type: 'select',
          id: 'countryCode',
          options: [],
          labelKey: 'country',
          valueKey: 'code',
          label: this.$t('bank.country') /*国家*/,
          event: 'COUNTRY_CHANGE',
          //defaultValue:'中国',
          getUrl: config.baseUrl + '/api/localization/query/country',
          method: 'get',
          //默认国家是分页的20个一页，这里下拉列表直接显示全部
          getParams: {
            // language: this.props.language.local === 'zh_cn' ? 'zh_cn' : 'en_us',
            page: 0,
            size: 1000,
          },
        },
        {
          type: 'input',
          id: 'openAccount',
          options: [],
          event: 'ADDRESS_CHANGE',
          label: this.$t('bank.openAccount') /*开户地*/,
        },
      ],
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      // 自定义银行表格
      customBankColumns: [
        {
          /*国家*/
          title: this.$t('bank.country'),
          key: 'countryName',
          dataIndex: 'countryName',
          width: '10%',
          render: desc => (
            <span>
              {desc ? (
                <Popover placement="topLeft" content={desc}>
                  {desc}
                </Popover>
              ) : (
                  '-'
                )}
            </span>
          ),
        },
        {
          /*银行代码*/
          width: '15%',
          title: this.$t('bank.bankCode'),
          key: 'bankCode',
          dataIndex: 'bankCode',
        },
        {
          width: '10%',
          title: 'Swift Code',
          key: 'Swift Code',
          dataIndex: 'swiftCode',
        },
        {
          /*银行名称*/
          title: this.$t('bank.bankName'),
          key: 'bankName',
          dataIndex: 'bankName',
          render: desc => (
            <span>
              {desc ? (
                <Popover placement="topLeft" content={desc}>
                  {desc}
                </Popover>
              ) : (
                  '-'
                )}
            </span>
          ),
        },
        {
          /*支行名称*/
          title: this.$t('bank.bankBranchName'),
          key: 'bankBranchName',
          dataIndex: 'bankBranchName',
        },
        {
          /*开户地*/
          title: this.$t('bank.openAccount'),
          key: 'openAccount',
          dataIndex: 'openAccount',
        },
        {
          /*详细地址*/
          title: this.$t('bank.detailAddress'),
          key: 'detailAddress',
          dataIndex: 'detailAddress',
        },
        {
          /*状态*/
          title: this.$t('common.column.status'),
          key: 'status',
          width: '10%',
          dataIndex: 'enable',
          render: enable => (
            <Badge
              status={enable ? 'success' : 'error'}
              text={enable ? this.$t('common.status.enable') : this.$t('common.status.disable')}
            />
          ),
        },
        {
          /*操作*/
          title: this.$t('common.operation'),
          key: 'operation',
          dataIndex: 'operation',
          render: (text, record) => (
            <span>
              <a onClick={e => this.editItem(e, record)}>
                {this.$t('common.edit')}
              </a>
              <span className="ant-divider" />
              <Popconfirm
                onConfirm={e => this.deleteItem(e, record)}
                title={this.$t('budget.are.you.sure.to.delete.rule', {
                  controlRule: record.controlRuleName,
                })}
              >
                {/* 你确定要删除organizationName吗 */}
                <a
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {this.$t('common.delete')}
                </a>
              </Popconfirm>
            </span>
          ),
        },
      ],
      // 通用银行表格
      commonBankColumns: [
        {
          /*国家*/
          title: this.$t('bank.country'),
          key: 'countryName',
          dataIndex: 'countryName',
          width: '10%',
          render: desc => (
            <span>
              {desc ? (
                <Popover placement="topLeft" content={desc}>
                  {desc}
                </Popover>
              ) : (
                  '-'
                )}
            </span>
          ),
        },
        {
          /*银行代码*/
          width: '15%',
          title: this.$t('bank.bankCode'),
          key: 'bankCode',
          dataIndex: 'bankCode',
        },
        {
          width: '10%',
          title: 'Swift Code',
          key: 'Swift Code',
          dataIndex: 'swiftCode',
        },
        {
          /*银行名称*/
          title: this.$t('bank.bankName'),
          key: 'bankName',
          dataIndex: 'bankName',
          render: desc => (
            <span>
              {desc ? (
                <Popover placement="topLeft" content={desc}>
                  {desc}
                </Popover>
              ) : (
                  '-'
                )}
            </span>
          ),
        },
        {
          /*支行名称*/
          title: this.$t('bank.bankBranchName'),
          key: 'bankBranchName',
          dataIndex: 'bankBranchName',
          render: desc => (
            <span>
              {desc ? (
                <Popover placement="topLeft" content={desc}>
                  {desc}
                </Popover>
              ) : (
                  '-'
                )}
            </span>
          ),
        },
        {
          /*开户地*/
          title: this.$t('bank.openAccount'),
          key: 'openAccount',
          dataIndex: 'openAccount',
        },
        {
          /*详细地址*/
          title: this.$t('bank.detailAddress'),
          key: 'detailAddress',
          dataIndex: 'detailAddress',
        },
      ],
      columns: [],
      exportColumns: [
        { title: '国家', dataIndex: 'countryName' },
        { title: '银行代码', dataIndex: 'bankCode' },
        { title: 'Swift Code', dataIndex: 'swiftCode' },
        { title: '银行名称', dataIndex: 'bankName' },
        { title: '支行名称', dataIndex: 'bankBranchName' },
        { title: '开户地', dataIndex: 'openAccount' },
        { title: '详细地址', dataIndex: 'detailAddress' },
        { title: '状态', dataIndex: 'enable' },
      ],
    };
  }

  deleteItem = (e, record) => {
    this.setState({ loading: true });
    let pagination = this.state.pagination;
    BSService.deleteSelfBank(record.id)
      .then(response => {
        this.setState({
          pagination: {
            ...pagination,
            total: pagination.total - 1,
            page: parseInt((pagination.total - 2) / pagination.pageSize) < pagination.page ? parseInt((pagination.total - 2) / pagination.pageSize) : pagination.page,
            current: parseInt((pagination.total - 2) / pagination.pageSize) < pagination.page ? parseInt((pagination.total - 2) / pagination.pageSize) + 1 : pagination.page + 1
          }
        })
        this.getList();
      })
      .catch(e => {
        this.setState({ loading: false });
      });
  };

  //暂时不需要联动下级城市
  handleEvent = (event, value) => { };

  componentDidMount() {
    let { customBankColumns } = this.state;
    this.setState({
      columns: customBankColumns,
    });
    this.getList();
    this.getCountrys();
  }

  //Tabs点击
  onChangeTabs = key => {
    let { columns, commonBankColumns, pagination, customBankColumns } = this.state;
    if (key === 'customBank') {
      columns = customBankColumns;
    } else {
      columns = commonBankColumns;
    }
    pagination.page = 0;
    pagination.pageSize = 10;
    pagination.current = 1;
    this.setState(
      {
        loading: true,
        pagination,
        data: [],
        label: key,
        columns: columns,
      },
      () => {
        this.getList();
      }
    );
  };

  editItem = (e, record) => {
    e.preventDefault();
    e.stopPropagation();
    let slideFrame = {};
    let slideFrameKey = this.state.slideFrameKey;
    slideFrameKey++;
    slideFrame.title = this.$t('bank.editorBank'); //编辑银行
    slideFrame.visible = true;
    slideFrame.params = record;
    slideFrame.params.countryData = this.state.country;
    this.setState({
      slideFrame,
      slideFrameKey,
    });
  };

  handleCreate = () => {
    let slideFrame = {
      params: {},
    };
    let slideFrameKey = this.state.slideFrameKey;
    slideFrameKey++;
    slideFrame.title = this.$t('bank.createBank'); //新建银行
    slideFrame.visible = true;
    slideFrame.params.countryData = this.state.country;
    this.setState({
      slideFrame,
      slideFrameKey,
    });
  };

  //获取公司下的银行数据
  getList() {
    this.setState({ loading: true });
    let params = this.state.searchParams;
    let ps = {
      page: this.state.pagination.page,
      size: this.state.pagination.pageSize,
    };

    if (this.state.label === 'customBank') {
      BSService.getSelfBankList(params, ps).then(response => {
        let pagination = this.state.pagination;
        pagination.total = Number(response.headers['x-total-count']);
        this.setState({
          loading: false,
          data: response.data,
          pagination,
        });
      });
    } else {
      BSService.getSystemBankList(params, ps).then(response => {
        let pagination = this.state.pagination;
        pagination.total = Number(response.headers['x-total-count']);
        this.setState({
          loading: false,
          data: response.data,
          pagination,
        });
      });
    }
  }

  getCountrys = () => {
    BSService.getCountries(this.props.language.local).then(response => {
      let country = response.data.map(item => {
        item.label = item.country;
        item.value = item.code;
        if (item.value === 'CHN000000000') {
          item.children = [];
        }
        return item;
      });
      this.setState({
        country,
      });
      this.getChinaState();
    });
  };

  // ---------分割线------获取省市------
  // 8号上线了，6号的时候：
  // 产品要求说："用户选择中国的时候，把省与市联动"
  // 我需要一个接口，一次性获取中国的所有省市，后端说8号给不了，
  // 我这边就占时循环调接口，把省市掉出来，以此添加用户体验
  //获取中国的所有省
  getChinaState = () => {
    let params = {
      // language: this.props.language.local === 'zh_cn' ? 'zh_cn' : 'en_us',
      code: 'CHN000000000',
      vendorType: 'standard',
      page: 0,
      size: 1000,
    };
    BSService.getStatesAndCitys(params).then(response => {
      let children = response.data.map(item => {
        item.label = item.state;
        item.value = item.code;
        item.children.map(city => {
          city.label = city.city;
          city.value = city.code;
        })
        //item.children = [];
        //this.getCityByCode(item.code);
        return item;
      });
      this.setChinaState(children);
    });
  };
  //设置国家的省
  setChinaState = children => {
    let countrys = this.state.country;
    for (let i = 0; i < countrys.length; i++) {
      if (countrys[i].code === 'CHN000000000') {
        countrys[i].children = children;
      }
    }
  };
  //获取市
  getCityByCode = code => {
    let params = {
      // language: this.props.language.local === 'zh_cn' ? 'zh_cn' : 'en_us',
      code: code,
      vendorType: 'standard',
    };
    BSService.getCities(params).then(response => {
      let children = response.data.map(item => {
        item.label = item.city;
        item.value = item.code;
        return item;
      });
      this.setChinaCity(children, code);
    });
  };

  setChinaCity = (children, code) => {
    let countrys = this.state.country;
    let china = '';
    //选出中国
    for (let i = 0; i < countrys.length; i++) {
      if (countrys[i].code === 'CHN000000000') {
        china = countrys[i].children;
        break;
      }
    }
    //挨个省设置城市
    for (let i = 0; i < china.length; i++) {
      if (china[i].code === code) {
        china[i].children = children;
        break;
      }
    }
  };
  // ---------分割线------获取省市------
  handleSearch = params => {
    let pagination = this.state.pagination;
    pagination.page = 0;
    pagination.current = 1;

    this.setState(
      {
        searchParams: params,
        pagination,
      },
      () => {
        this.getList();
      }
    );
  };

  handleCloseSlide = params => {
    let slideFrame = this.state.slideFrame;
    slideFrame.visible = false;
    this.setState({
      slideFrame,
    });
    if (params) {
      this.setState({ loading: true });
      this.getList();
    }
  };

  //分页点击
  onChangePager = (pagination, filters, sorter) => {
    this.setState(
      {
        pagination: {
          current: pagination.current,
          page: pagination.current - 1,
          pageSize: pagination.pageSize,
          total: pagination.total,
        },
      },
      () => {
        this.getList();
      }
    );
  };
  handleImportShow = () => {
    this.setState({
      showImportBankModel: true,
    });
  };
  /**
   * 点击导出按钮
   */
  onExportClick = () => {
    this.setState({
      loading: true,
      excelVisible: true
    });
  };
  handleExport = () => {
    this.setState({
      loading: true,
    });
    BSService.exportSelfBank()
      .then(res => {
        this.setState({
          loading: false,
        });

        let b = new Blob([res.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        //自定义银行
        let name = this.$t('bank.customBank');
        FileSaver.saveAs(b, `${name}.xlsx`);
      })
      .catch(res => {
        this.setState({
          loading: false,
        });
      });
  };
  cancelImport = () => {
    this.setState({
      showImportBankModel: false,
    });
  };
  //下载模板
  downloadTemplate = () => {
    BSService.downloadSelfBankTemp()
      .then(res => {
        let b = new Blob([res.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        // 证件信息模板
        let name = this.$t('bank.customBank.temp');
        FileSaver.saveAs(b, `${name}.xlsx`);
      })
      .catch(res => { });
  };
  handleFileUpload = () => {
    const { fileList } = this.state;
    const formData = new FormData();

    // fileList.forEach((file) => {
    //   formData.append('files[]', file);
    // });
    formData.append('file', fileList[0]);
    this.setState({
      uploading: true,
      flieUploading: true,
    });

    BSService.importSelfBank(formData)
      .then(res => {
        this.setState(
          {
            uploading: false,
            fileList: [],
            flieUploading: false,
            showImportBankModel: false,
            transactionOid: res.data.transactionOid, //这个transactionOid在导出错误信息的时候，需要用到
          },
          () => {
            this.showImportErrInfo();
            this.showTransactionLogDialog(this.state.transactionOid); // 将参数传给dialog
          }
        );
      })
      .catch(res => {
        this.setState({
          uploading: false,
          flieUploading: false,
        });
      });
  };

  showTransactionLogDialog = transactionOid => {
    BSService.importSelfBankErr(transactionOid).then(res => {
      let data = res.data;

      if (data.totalEntities === 0) {
        return;
      } else {
        let errors = data.errors;
        let errorsList = this.getErrorDataByerrors(errors);
        let progressImportErrInfo = this.getProgressByData(data);
        this.setState({
          progressImportErrInfo,
          errorsList,
        });
        if (data.successEntities + data.failureEntities != data.totalEntities) {
          let gapTime = 500;
          setTimeout(() => {
            //请求频率涉及到一个算法
            this.showTransactionLogDialog(this.state.transactionOid); // 将参数传给dialog
          }, gapTime);
        } else {
          //导入完成了
          this.getList();
          if (this.state.errorsList.length === 0 && progressImportErrInfo === 100) {
            message.success(this.$t('common.operate.success'));
            this.hideImportErrInfo();
          }
        }
      }
    });
  };
  //获取百分进度
  getProgressByData = data => {
    return Math.round(((data.failureEntities + data.successEntities) * 100) / data.totalEntities);
  };
  //通过错误信息，解析成表格
  getErrorDataByerrors = errs => {
    let data = [];
    for (let key in errs) {
      let row = {};
      row.line = errs[key];
      if (row.line.length > 1) {
        let _line = [];
        for (let i = 0; i < row.line.length; i++) {
          _line.push(row.line[i]);
          if (i < row.line.length - 1) {
            _line.push(',');
          }
        }
        row.line = _line;
      }
      row.msg = key;
      data.push(row);
    }
    return data;
  };
  //银行导入错误信息
  exportFailedLog = () => {
    BSService.exportSelfBankErr(this.state.transactionOid)
      .then(res => {
        let b = new Blob([res.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        // 银行导入错误信息
        let name = this.$t('bank.customBank.error.info');
        FileSaver.saveAs(b, `${name}.xlsx`);
      })
      .catch(res => { });
  };
  renderBtns = tabName => {
    const { loading } = this.state;
    if (tabName === 'commonBank') {
      return null;
    } else {
      return (
        <div>
          <Button type="primary" onClick={this.handleCreate}>
            {this.$t('common.create')}
          </Button>
          <Button onClick={this.handleImportShow}>
            {this.$t({ id: 'importer.import' })}
          </Button>{' '}
          {/*导入*/}
          <Button loading={loading} onClick={this.onExportClick}>
            {this.$t({ id: 'importer.importOut' })}
          </Button>{' '}
        </div>
      );
    }
  };
  //人员导入的错误信息-start
  showImportErrInfo = () => {
    this.setState({
      showImportErrInfo: true,
    });
  };

  hideImportErrInfo = () => {
    this.setState({
      showImportErrInfo: false,
    });
  };

  //人员导入的错误信息-end
  renderTabs() {
    return this.state.tabs.map(tab => {
      return <TabPane tab={tab.name} key={tab.key} />;
    });
  }
  //导入成功回调
  handleImportOk = (transactionID) => {
    httpFetch.post(`${config.baseUrl}/api/bank/infos/import/new/confirm/${transactionID}`).then(res => {
      if (res.status === 200) {
        this.getList()
      }
    }).catch(() => {
      message.error(this.$t('importer.import.error.info')/*导入失败，请重试*/)
    })
    this.showImport(false);
  };
  showImport = flag => {
    this.setState({ showImportBankModel: flag });
  };

  //导出
  handleDownLoad = (result) => {
    debugger;
    let exportParams = this.state.searchParams;
    let ps = {
      page: this.state.pagination.page,
      size: this.state.pagination.pageSize,
    }
    let hide = message.loading(this.$t({ id: 'importer.spanned.file' } /*正在生成文件..*/));
    BSService.exportSelfBank(result, ps, exportParams)
      .then(response => {
        let b = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        let name = this.$t({ id: 'section.mapping.export.fileName' });
        FileSaver.saveAs(b, `${name}.xlsx`);
        this.setState({
          loading: false,
        });
        hide();
      })
      .catch(() => {
        message.error(this.$t({ id: 'importer.download.error.info' } /*下载失败，请重试*/));
        this.setState({
          btLoading: false,
        });
        hide();
      });
  };

  /**
   * 导出取消
   */
  onExportCancel = () => {
    this.setState({
      loading: false,
      excelVisible: false,
    });
  };


  render() {
    const props = {
      onRemove: file => {
        this.setState(({ fileList }) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: file => {
        this.setState(({ fileList }) => ({
          fileList: [file],
        }));
        return false;
      },
      fileList: this.state.fileList,
    };

    const { loading, data, searchForm, pagination, columns, label, slideFrame, showImportBankModel, excelVisible, exportColumns }
      = this.state;

    return (
      <div className="budget-bank-definition">
        <Tabs onChange={this.onChangeTabs}>{this.renderTabs()}</Tabs>
        <SearchArea
          searchForm={searchForm}
          eventHandle={this.handleEvent}
          submitHandle={this.handleSearch}
        />
        <div className="table-header">
          <div className="table-header-title">
            {this.$t('common.total', { total: `${pagination.total}` })}
          </div>
          {/*共搜索到*条数据*/}
          <div className="table-header-buttons">{this.renderBtns(label)}</div>
        </div>
        <Table
          dataSource={data}
          loading={loading}
          pagination={pagination}
          onChange={this.onChangePager}
          columns={columns}
          size="middle"
          bordered
        />
        <SlideFrame
          slideFrameKey={this.state.slideFrameKey}
          title={slideFrame.title}
          show={slideFrame.visible}
          onClose={() => this.setState({ slideFrame: { visible: false } })}>
          <CreateOrUpdateBank
            params={slideFrame.params}
            onClose={this.handleCloseSlide} />
        </SlideFrame>

        {/*导入*/}
        <ImporterNew visible={showImportBankModel}
          title={this.$t({ id: 'section.mapping.set.import' })}
          templateUrl={`${config.baseUrl}/api/bank/infos/custom/bank/info/template`}
          uploadUrl={`${config.baseUrl}/api/bank/infos/import/custom/bank/info/new`}
          errorUrl={`${config.baseUrl}/api/bank/infos/import/new/error/export`}
          errorDataQueryUrl={`${config.baseUrl}/api/bank/infos/import/new/query/result`}
          deleteDataUrl={`${config.baseUrl}/api/bank/infos/import/new/delete`}
          fileName={this.$t('bank.customBank.temp')}
          onOk={this.handleImportOk}
          afterClose={() => this.showImport(false)} />
        {/* 导出 */}
        <ExcelExporter
          visible={excelVisible}
          onOk={this.handleDownLoad}
          columns={exportColumns}
          canCheckVersion={false}
          fileName={"自定义银行"}
          onCancel={this.onExportCancel}
          excelItem={"PREPAYMENT_FINANCIAL_QUERY"}
        />
        {/* <ImportErrInfo
          progress={this.state.progressImportErrInfo}
          cancel={this.hideImportErrInfo}
          exportErrInfo={this.exportFailedLog}
          errorsList={this.state.errorsList}
          visible={this.state.showImportErrInfo}
        /> */}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    organization: state.user.organization,
    company: state.user.company,
    language: state.languages,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(BankDefinition);
