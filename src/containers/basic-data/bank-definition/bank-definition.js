import React from 'react';
import { connect } from 'dva';

import {
  Button,
  Table,
  Badge,
  Popover,
  Popconfirm,
  Tabs,
  Modal,
  Upload,
  Icon,
  message,
} from 'antd';
import SearchArea from 'components/Widget/search-area';
import config from 'config';
import 'styles/basic-data/bank-definition/bank-definition.scss';
import SlideFrame from 'components/Widget/slide-frame';
import CreateOrUpdateBank from 'containers/basic-data/bank-definition/create-or-update-bank';
//import ImportErrInfo from 'components/Widget/Template/import-err-info';
const TabPane = Tabs.TabPane;
import BSService from 'containers/basic-data/bank-definition/bank-definition.service';
import FileSaver from 'file-saver';

class BankDefinition extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      slideFrameKey: 0,
      loading: true,
      showImportBankModel: false, //导入自定义银行弹窗
      progressImportErrInfo: 1,
      showImportErrInfo: false,
      transactionOID: null,
      errorsList: [],
      fileList: [],
      flieUploading: false, //文件是否正在上传

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
          getUrl: config.locationUrl + '/api/localization/query/country',
          method: 'get',
          //默认国家是分页的20个一页，这里下拉列表直接显示全部
          getParams: {
            language: this.props.language.local === 'zh_CN' ? 'zh_CN' : 'en_US',
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
              <a  onClick={e => this.editItem(e, record)}>
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
    };
  }

  deleteItem = (e, record) => {
    this.setState({ loading: true });
    BSService.deleteSelfBank(record.id)
      .then(response => {
        this.getList();
      })
      .catch(e => {
        this.setState({ loading: false });
      });
  };

  //暂时不需要联动下级城市
  handleEvent = (event, value) => {};

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
      language: this.props.language.local === 'zh_CN' ? 'zh_CN' : 'en_US',
      code: 'CHN000000000',
      vendorType: 'standard',
      page: 0,
      size: 1000,
    };
    BSService.getStates(params).then(response => {
      let children = response.data.map(item => {
        item.label = item.state;
        item.value = item.code;
        item.children = [];
        this.getCityByCode(item.code);
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
      language: this.props.language.local === 'zh_CN' ? 'zh_CN' : 'en_US',
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
      .catch(res => {});
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
            transactionOID: res.data.transactionOID, //这个transactionOID在导出错误信息的时候，需要用到
          },
          () => {
            this.showImportErrInfo();
            this.showTransactionLogDialog(this.state.transactionOID); // 将参数传给dialog
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

  showTransactionLogDialog = transactionOID => {
    BSService.importSelfBankErr(transactionOID).then(res => {
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
            this.showTransactionLogDialog(this.state.transactionOID); // 将参数传给dialog
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
    BSService.exportSelfBankErr(this.state.transactionOID)
      .then(res => {
        let b = new Blob([res.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        // 银行导入错误信息
        let name = this.$t('bank.customBank.error.info');
        FileSaver.saveAs(b, `${name}.xlsx`);
      })
      .catch(res => {});
  };
  renderBtns = tabName => {
    if (tabName === 'commonBank') {
      return null;
    } else {
      return (
        <div>
          <Button type="primary" onClick={this.handleCreate}>
            {this.$t('common.create')}
          </Button>
          <Button onClick={this.handleImportShow}>
            {/*批量导入*/}
            {this.$t('bank.customBank.import')}
          </Button>
          <Button onClick={this.handleExport}>
            {/*批量导出*/}
            {this.$t('bank.customBank.export')}
          </Button>
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

    const { loading, data, searchForm, pagination, columns, label, slideFrame } = this.state;

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
              onClose={this.handleCloseSlide}/>
        </SlideFrame>

        <Modal
          closable
          width={800}
          className="pm-import-person-modal"
          title={this.$t('person.manage.im')} //导入
          visible={this.state.showImportBankModel}
          footer={null}
          onCancel={this.cancelImport}
          destroyOnClose={true}
        >
          <div className="import-person-modal-wrap">
            <div className="f-left import-person-modal-left">
              <div>
                <p>
                  {/*1.创建导入文件*/}
                  {this.$t('bank.customBank.im.tip1')}
                </p>
                <p>
                  {/*2.严格按照导入模板整理数据，检查必输事项是否缺少数据*/}
                  {this.$t('bank.customBank.im.tip2')}
                </p>
                <p>
                  {/*3.关闭文件后，方可进行数据导入*/}
                  {this.$t('bank.customBank.im.tip3')}
                </p>
              </div>
              <div className="download-list-item" onClick={this.downloadTemplate}>
                {/*点击下载模板*/}
                {this.$t('bank.customBank.download.temp')}
              </div>
            </div>
            <div className="f-right import-person-modal-right">
              <div className="import-person-right-tips">
                {/*上传模板*/}
                {this.$t('bank.customBank.upload.temp')}
              </div>
              <div className="upload-file-wrap">
                <Upload {...props}>
                  <Button>
                    <Icon type="upload" />
                    {/*选择一个文件*/}
                    {this.$t('person.manage.select.file')}
                  </Button>
                </Upload>
                <Button
                  className="upload-file-start"
                  type="primary"
                  onClick={this.handleFileUpload}
                  disabled={this.state.fileList.length === 0}
                  loading={this.state.flieUploading}
                >
                  {/*?上传中:开始上传*/}
                  {this.state.flieUploading
                    ? this.$t('person.manage.uploading')
                    : this.$t('person.manage.start.upload')}
                </Button>
              </div>
            </div>
            <div className="clear" />
          </div>
        </Modal>
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
