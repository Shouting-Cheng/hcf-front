import React from 'react';
import CustomTable from 'components/Template/custom-table';
import {
  Popover,
  Tag,
  Menu,
  message,
  Tooltip,
  Alert,
  Button,
  Dropdown,
  Icon,
  Modal,
  Upload,
} from 'antd';
import Table from 'widget/table'
import service from './service';
// import NewRole from "./new"
import SelectRoles from './roles';
import { connect } from 'dva';
import { isEmptyObj, deepCopy } from 'utils/extend';
import SearchArea from 'components/Widget/search-area.js';
import { routerRedux } from 'dva/router';
import PMService from 'containers/enterprise-manage/person-manage/person-manage.service';
import { SelectDepOrPerson } from 'components/Widget/index';
import ImportErrInfo from 'components/Widget/Template/import-err-info';
import 'styles/enterprise-manage/person-manage/person-manage.scss';

//导出控件
import ExportModal from 'components/Widget/Template/export-modal/export-modal';
import InvitePersonModal from 'containers/enterprise-manage/person-manage/person-manage-components/invite.person.modal';

import FileSaver from "file-saver"

class Employee extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newShow: false,
      allocShow: false,
      userId: '',
      cacheObj: {
        keyword: '', //关键字
        departmentOIDs: [], //部门
        corporationOIDs: [], //公司
        status: 'all', //员工状态
      }, //缓存变量
      CREATE_DATA_TYPE: true,
      loading: false,
      showImportPersonModel: false,
      progressImportErrInfo: 1,
      showImportErrInfo: false,
      transactionOID: null,
      errorsList: [
        {
          line: '',
          msg: '',
        },
      ],

      fileList: [],
      flieUploading: false, //文件是否正在上传
      data: [], //条件下所有人
      exportList: [
        //导出数据列表
        // 下载全部的功能先去掉
        // {
        //   type: 1001,
        //   name: this.$t("person.manage.all.data")//全部数据
        // },
        {
          type: 1002,
          command: 'user_full_info',
          name: this.$t('person.manage.person.info.data'), //人员信息数据
        },
        {
          type: 1003,
          command: 'user_contact_bank_account',
          name: this.$t('person.manage.bank.info.data'), //银行信息数据
        },
        {
          type: 1004,
          command: 'user_contact_card',
          name: this.$t('person.manage.card.info.data'), //证件信息数据
        },
        {
          type: 1005,
          command: 'user_contact_supplier_ctrip',
          name: this.$t('person.manage.ctrip.info.data'), //携程信息数据
        },
      ],
      downLoadTempList: [
        // 下载全部的功能先去掉
        // {
        //   type: 1,
        //   name: this.$t("person.manage.down.all.temp")//下载全部模板
        // },
        {
          type: 2,
          name: this.$t('person.manage.person.info.temp'), //人员信息导入模板
        },
        {
          type: 3,
          name: this.$t('person.manage.bank.info.temp'), //银行信息导入模板
        },
        {
          type: 4,
          name: this.$t('person.manage.card.info.temp'), //证件信息导入模板
        },
        {
          type: 5,
          name: this.$t('person.manage.ctrip.info.temp'), //携程信息导入模板
        },
      ],
      pagination: {
        page: 0,
        total: 0,
        pageSize: 10,
      },

      params: {
        keyword: '',
        departmentOIDs: [],
        corporationOIDs: [],
        status: 'all',
        tenantId: '',
      },
      extraDep: {
        res: [],
        title: this.$t('person.manage.select'), //"请选择",
        depClassName: 'f-right select-dep-close-wrap',
        className: [
          'f-right select-dep-close-wrap',
          'f-right select-dep-close-wrap select-dep-close-wrap-show',
        ],
      },
      searchForm: [
        {
          type: 'input',
          id: 'keyword',
          label: this.$t('person.manage.name.employeeId.email.mobile'), //'员工姓名、工号、邮箱、电话',
          event: 'keywordChange',
        },
        {
          type: 'list',
          id: 'corporationOIDs',
          label: this.$t('person.manage.company'), //'公司',
          listType: 'all_company_with_legal_entity',
          labelKey: 'companyName',
          valueKey: 'companyOID',
          single: true,
          placeholder: this.$t('person.manage.select'), //"请选择",
          event: 'companyOIDChange',
        },
        {
          type: 'select',
          id: 'status',
          label: this.$t('person.manage.status'), //"状态",
          event: 'statusChange',
          defaultValue: 'all',
          options: [
            {
              label: this.$t('person.manage.working.person'), // '在职员工',
              value: 1001,
            },
            {
              label: this.$t('person.manage.will.go.person'), //'待离职员工',
              value: 1002,
            },
            {
              label: this.$t('person.manage.gone.person'), //'离职员工',
              value: 1003,
            },
            {
              label: this.$t('person.manage.all.person'), //'全部员工',
              value: 'all',
            },
          ],
        },
        {
          type: 'list',
          listType: 'department',
          id: 'departmentOIDs',
          label: '部门',
          options: [],
          labelKey: 'name',
          valueKey: 'departmentOid',
          single: true,
          listExtraParams: { "tenantId": this.props.user.tenantId },
          //   event:'departmentOIDChange'
        },
      ],
      columns: [
        {
          title: this.$t('person.manage.company'), //公司
          dataIndex: 'companyName',
          showTooltip: true,
          width: 160,
          render: text => (
            <span>
              {text ? (
                <Popover placement="topLeft" content={text}>
                  {text}
                </Popover>
              ) : (
                  '-'
                )}
            </span>
          ),
        },
        {
          title: this.$t('person.manage.employeeId'), //"工号",
          key: 'employeeID',
          dataIndex: 'employeeID',
          render: text => (
            <span>
              {text ? (
                <Popover placement="topLeft" content={text}>
                  {text}
                </Popover>
              ) : (
                  '-'
                )}
            </span>
          ),
        },

        {
          title: this.$t('person.manage.name'), //姓名
          dataIndex: 'fullName',
          render: (value, record) => (
            <Tooltip title={record.roleList.map(o => o.roleName).join(' ')}>
              <Tag color="green">{value}</Tag>
            </Tooltip>
          ),
        },
        {
          title: this.$t('person.manage.dep'), //部门
          dataIndex: 'departmentName',
          showTooltip: true,
          render: text => (
            <span>
              {text ? (
                <Popover placement="topLeft" content={text}>
                  {text}
                </Popover>
              ) : (
                  '-'
                )}
            </span>
          ),
        },
        {
          title: this.$t('person.manage.contact'), //联系方式
          dataIndex: 'mobile',
          render: text => (
            <span>
              {text ? (
                <Popover placement="topLeft" content={text}>
                  {text}
                </Popover>
              ) : (
                  '-'
                )}
            </span>
          ),
        },
        {
          title: this.$t('person.manage.email'), //邮箱
          dataIndex: 'email',
          render: text => (
            <span>
              {text ? (
                <Popover placement="topLeft" content={text}>
                  {text}
                </Popover>
              ) : (
                  '-'
                )}
            </span>
          ),
        },
        {
          title: this.$t('person.manage.status'), // "状态",
          key: 'status',
          dataIndex: 'status',
          render: text => {
            if (text === 1001) {
              return (
                <span>
                  <Popover placement="topLeft" content={this.$t('person.manage.working.person')}>
                    {this.$t('person.manage.working.person')}
                  </Popover>
                </span>
              );
            } else if (text === 1002) {
              return (
                <span>
                  <Popover placement="topLeft" content={this.$t('person.manage.will.go.person')}>
                    {this.$t('person.manage.will.go.person')}
                  </Popover>
                </span>
              );
            } else if (text === 1003) {
              return (
                <span>
                  <Popover placement="topLeft" content={this.$t('person.manage.gone.person')}>
                    {this.$t('person.manage.gone.person')}
                  </Popover>
                </span>
              );
            }
          },
        },
        {
          title: this.$t('person.manage.operation'), //操作
          dataIndex: 'option',
          align: 'center',
          width: 140,
          render: (value, record) => {
            return (
              <span>
                <a onClick={() => this.alloc(record)}>分配角色</a>
                <span className="ant-divider" />
                <a onClick={e => this.editItemPerson(e, record)}>
                  {/*详情*/}
                  {this.$t('common.detail')}
                </a>
              </span>
            );
          },
        },
      ],
    };
  }
  componentDidMount() {
    let _pagination = this.getBeforePage();
    let pagination = this.state.pagination;
    pagination.page = _pagination.page;
    pagination.current = _pagination.page + 1;
    this.setState(
      {
        pagination,
      },
      () => {
        this.clearBeforePage();
        //取出页面缓存状态
        let cache = localStorage.getItem('person-manage-cache');
        let cacheObj = {};
        if (cache + '' != 'null' && cache + '' != '{}') {
          //cache要有值
          cacheObj = JSON.parse(cache);
        } else {
          this.getPersonList();
        }
        //人员导入方式：this.props.company.createDataType如果是 1002，属于接口导入
        // 新增与导入按钮需要隐藏
        let CREATE_DATA_TYPE = parseInt(this.props.company.createDataType) != 1002;
        this.setState(
          {
            CREATE_DATA_TYPE,
            cacheObj,
          },
          () => {
            this.setDefaultSearchForm(this.state.cacheObj);
          }
        );
      }
    );
  }

  //设置默认的搜索值
  setDefaultSearchForm = defaultVal => {
    if (isEmptyObj(defaultVal)) {
      return;
    }
    const { params, searchForm, extraDep } = this.state;
    searchForm[0].defaultValue = defaultVal.keyword;
    searchForm[1].defaultValue = defaultVal.corporationOIDs;
    searchForm[2].defaultValue = defaultVal.status || 'all';
    //部门的稍微麻烦一点
    let deps = [];
    extraDep.res = defaultVal.departmentOIDs || [];
    if (extraDep.res.length > 0) {
      extraDep.depClassName = extraDep.className[1];
    } else {
      extraDep.depClassName = extraDep.className[0];
    }
    for (let i = 0; i < extraDep.res.length; i++) {
      deps.push(extraDep.res[i].departmentOID);
    }
    extraDep.title = this.renderButtonTitle(extraDep.res);

    //查询参数，重新设置
    params.keyword = defaultVal.keyword;
    let corporationOIDs = [];
    if (defaultVal && defaultVal.corporationOIDs && defaultVal.corporationOIDs.map) {
      corporationOIDs = defaultVal.corporationOIDs.map(data => {
        return data.companyOID;
      });
    }
    params.corporationOIDs = corporationOIDs;
    params.status = defaultVal.status || 'all';
    // params.departmentOIDs = dev;
    params.departmentOIDs = defaultVal.departmentOIDs;
    this.setState(
      {
        extraDep,
        params,
      },
      () => {
        this.getPersonList();
      }
    );
  };

  //获取员工表格
  getPersonList = () => {
    const pagination = this.state.pagination;
    this.setState({
      loading: true,
    });
    let params = {
      sort: 'status',
      page: pagination.page,
      size: pagination.pageSize,
      tenantId: this.props.user.tenantId,
      keyword: this.state.params.keyword,
      departmentOID: this.state.params.departmentOIDs,
      corporationOID: this.state.params.corporationOIDs,
      status: this.state.params.status,
    };
    // searchUserListByCond  searchPersonInDep
    PMService.searchUserListByCond(params).then(response => {
      pagination.total = Number(response.headers['x-total-count']);
      this.setState({
        loading: false,
        data: response.data,
        pagination,
      });
    });
  };
  //分页点击
  onChangePager = (pagination, filters, sorter) => {
    this.setState(
      {
        pagination: {
          current: pagination.current,
          page: pagination.current - 1,
          pageSize: pagination.pageSize,
        },
      },
      () => {
        this.getPersonList();
      }
    );
  };
  //新增员工
  handleCreatePerson = () => {
    this.setBeforePage(this.state.pagination);
    let cacheObj = this.state.cacheObj;
    let cacheObjStr = JSON.stringify(cacheObj);
    localStorage.setItem('person-manage-cache', cacheObjStr);
    this.props.dispatch(
      routerRedux.push({
        pathname: `/setting/employee/person-detail/person-detail/NEW`,
      })
    );
  };
  //渲染已经选择的部门
  renderButtonTitle(titleArr) {
    if (titleArr.length < 1) {
      // 请选择
      return this.$t('person.manage.select');
    }
    let node = [];
    titleArr.map((item, i) => {
      node.push(<Tag key={i}>{item.name}</Tag>);
    });
    return node;
  }

  //渲染下载模板
  renderDownTemp = list => {
    return list.map(data => {
      return (
        <div
          className="download-list-item"
          key={data.type}
          onClick={() => {
            this.downloadTemplateByType(data.type);
          }}
        >
          {data.name}
        </div>
      );
    });
  };
  //选择了部门的回调
  selectDepSearchArea = (res) => {
    //翻页的时候，缓存数据
    let cacheObj = this.state.cacheObj;
    cacheObj.departmentOIDs = deepCopy(res);
    let extraDep = this.state.extraDep;
    let params = this.state.params;
    let deps = [];
    extraDep.res = res;
    if (extraDep.res.length > 0) {
      extraDep.depClassName = extraDep.className[1];
    } else {
      extraDep.depClassName = extraDep.className[0];
    }
    for (let i = 0; i < extraDep.res.length; i++) {
      deps.push(extraDep.res[i].departmentOID);
    }
    params.departmentOIDs = deps;
    extraDep.title = this.renderButtonTitle(extraDep.res);
    this.setState({
      extraDep,
      params
    })
  };
  clearSearchHandle = () => {
    localStorage.setItem("person-manage-cache", null);
    const { searchForm, params, pagination, cacheObj } = this.state;
    searchForm[0].defaultValue = "";
    searchForm[1].defaultValue = [];
    searchForm[2].defaultValue = "all";
    //部门重置有下面的this.selectDepSearchArea([]);

    pagination.page = 0;
    pagination.current = 1;
    pagination.total = 0;
    pagination.pageSize = 10;

    params.keyword = "";
    params.departmentOIDs = "";
    params.corporationOIDs = "";
    params.status = "all";

    cacheObj.keyword = "";
    cacheObj.departmentOIDs = "";
    cacheObj.corporationOIDs = "";
    cacheObj.status = "all";

    this.setState({
      params,
      pagination,
      cacheObj,
      searchForm
    }, () => {
      this.handleSearch(this.state.params);
    })
    this.selectDepSearchArea([]);
  }
  //清除已经选择的部门
  onCloseDepTag = (e) => {
    e.stopPropagation();
    this.selectDepSearchArea([]);
  };

  //下载模板
  downloadTemplateByType = type => {
    switch (type) {
      case 1: {
        this.downloadEmployeeTemplate();
        setTimeout(() => {
          this.downloadBankAccountTemplate();
        }, 500);
        setTimeout(() => {
          this.downloadCardAccountTemplate();
        }, 1000);
        setTimeout(() => {
          this.downloadCtripSupplierTemplate();
        }, 1500);
        break;
      }
      case 2: {
        this.downloadEmployeeTemplate();
        break;
      }
      case 3: {
        this.downloadBankAccountTemplate();
        break;
      }
      case 4: {
        this.downloadCardAccountTemplate();
        break;
      }
      case 5: {
        this.downloadCtripSupplierTemplate();
        break;
      }
      default: {
        this.downloadEmployeeTemplate();
      }
    }
  };
  //下载人员信息
  downloadEmployeeTemplate = () => {
    PMService.downloadEmployeeTemplate()
      .then(res => {
        let b = new Blob([res.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        // 人员信息模板
        let name = this.$t('person.manage.person.info.temp1');
        FileSaver.saveAs(b, `${name}.xlsx`);
      })
      .catch(err => {
        console.log(err);
      });
  };
  //下载携程供应商模板
  downloadCtripSupplierTemplate = () => {
    PMService.downloadCtripSupplierTemplate()
      .then(res => {
        let b = new Blob([res.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        // 供应商模板
        let name = this.$t('person.manage.vendor.info.temp1');
        FileSaver.saveAs(b, `${name}.xlsx`);
      })
      .catch(err => { });
  };
  //下载银行信息模板
  downloadBankAccountTemplate = () => {
    PMService.downloadBankAccountTemplate()
      .then(res => {
        let b = new Blob([res.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        // 银行信息模板
        let name = this.$t('person.manage.bank.info.temp1');
        FileSaver.saveAs(b, `${name}.xlsx`);
      })
      .catch(err => { });
  };
  //下载证件信息模板
  downloadCardAccountTemplate = () => {
    PMService.downloadCardAccountTemplate()
      .then(res => {
        let b = new Blob([res.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        // 证件信息模板
        let name = this.$t('person.manage.card.info.temp1');
        FileSaver.saveAs(b, `${name}.xlsx`);
      })
      .catch(err => { });
  };

  //编辑员工
  editItemPerson = (e, record) => {
    this.setBeforePage(this.state.pagination);
    let cacheObj = this.state.cacheObj;
    let cacheObjStr = JSON.stringify(cacheObj);
    localStorage.setItem('person-manage-cache', cacheObjStr);
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/setting/employee/person-detail/person-detail/${record.userOID}`,
      })
    );
  };
  //员工信息，工号，电话等关键字是及时搜索
  //要缓存选择状态
  eventSearchAreaHandle = (e, item) => {
    //翻页的时候，缓存数据
    let cacheObj = this.state.cacheObj;
    let params = this.state.params;
    let pagination = this.state.pagination;
    // let _pagination = this.getBeforePage();
    // pagination.page = _pagination.page;
    // pagination.current = _pagination.page + 1;
    if (e === 'keywordChange') {
      cacheObj.keyword = item;
      params.keyword = item;
      //这个地方用deepCopy，只是因为在子组件要监听nextProps变化
      this.setState(
        {
          pagination,
          cacheObj,
          params: deepCopy(params),
        },
        () => {
          this.getPersonList();
        }
      );
    }
    if (e === 'companyOIDChange') {
      cacheObj.corporationOIDs = deepCopy(item);
      let corporationOIDs = item.map(data => {
        return data.companyOID;
      });
      params.corporationOIDs = corporationOIDs;
      this.state.cacheObj = cacheObj;
      this.state.pagination = pagination;
      this.state.params = deepCopy(params);
      //只是把值设置一下
      //不要设置，因为不需要刷新未激活的人
      // this.setState({
      //   pagination,
      //   params: deepCopy(params)
      // })
    }
    if (e === 'statusChange') {
      params.status = item;
      cacheObj.status = item;
      this.state.pagination = pagination;
      this.state.cacheObj = cacheObj;
      this.state.params = deepCopy(params);
    }
  };
  //渲染导出的列表
  renderExportList = list => {
    return list.map(data => {
      return (
        <Menu.Item key={data.type}>
          <ExportModal
            exportTitle={data.name}
            exportType="USER"
            exportCondition={{
              sort: 'status',
              keyword: this.state.params.keyword,
              departmentOIDs: this.state.params.departmentOIDs,
              corporationOIDs: this.state.params.corporationOIDs,
              status: this.state.params.status,
            }}
            exportCommand={data.command}
          />

          {/*<div onClick={() => {*/}
          {/*this.personExport(data.type)*/}
          {/*}}>{data.name}</div>*/}
        </Menu.Item>
      );
    });
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

    PMService.importEmployeeNew(formData)
      .then(res => {
        this.setState(
          {
            fileList: [],
            uploading: false,
            flieUploading: false,
            showImportPersonModel: false,
            transactionOID: res.data.transactionOID,
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
  //导入
  personImport = () => {
    this.setState({
      showImportPersonModel: true,
    });
  };
  cancelImportPerson = () => {
    this.setState({
      showImportPersonModel: false,
    });
  };
  add = () => {
    this.setState({ newShow: true });
  };

  alloc = record => {
    this.setState({ allocShow: true, userId: record.id });
  };

  remove = record => {
    service.disableRole({ ...record, isEnabled: !record.isEnabled }).then(response => {
      this.getPersonList();
      message.success('操作成功！');
    });
  };

  close = flag => {
    this.setState({ newShow: false, allocShow: false }, () => {
      flag && this.getPersonList();
    });
  };
  //点击搜搜索
  handleSearch = values => {
    const { params } = this.state;
    console.log(values)
    if (values.corporationOIDs && values.corporationOIDs[0]) {
      values.corporationOIDs = values.corporationOIDs[0];
    }
    if (values.departmentOIDs && values.departmentOIDs[0]) {
      values.departmentOIDs = values.departmentOIDs[0];
    }
    params.keyword = values.keyword;
    params.corporationOIDs = values.corporationOIDs;
    params.status = values.status;
    params.departmentOIDs = values.departmentOIDs;
    let pagination = this.state.pagination;
    pagination.page = 0;
    pagination.current = 1;
    //这个地方用deepCopy，只是因为在子组件要监听nextProps变化
    this.setState(
      {
        pagination,
        params: deepCopy(params),
      },
      () => {
        this.getPersonList();
      }
    );
  };
  showTransactionLogDialog = transactionOID => {
    PMService.getBatchTransactionLogNew(transactionOID).then(res => {
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
          this.getPersonList();
          if (this.state.errorsList.length === 0 && this.state.progressImportErrInfo === 100) {
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
  //人员导入错误信息
  exportFailedLog = () => {
    PMService.exportFailedLog(this.state.transactionOID)
      .then(res => {
        let b = new Blob([res.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        // 人员导入错误信息
        let name = this.$t('person.manage.im.err');
        FileSaver.saveAs(b, `${name}.xlsx`);
      })
      .catch(res => { });
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
  onMouseLeaveDepTag = (e) => {
    e.stopPropagation();

  };
  onMouseEnterDepTag = (e) => {
    e.stopPropagation();

  };
  //人员导入的错误信息-end
  render() {
    const menu = <Menu>{this.renderExportList(this.state.exportList)}</Menu>;
    const { columns, newShow, allocShow, userId, searchForm } = this.state;
    const { user } = this.props;
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
        // this.setState(({fileList}) => ({
        //   fileList: [...fileList, file],
        // }));
        //只上传一个
        this.setState(({ fileList }) => ({
          fileList: [file],
        }));
        return false;
      },
      fileList: this.state.fileList,
    };
    return (
      <div className="person-manage-wrap">
        <Alert
          style={{ marginBottom: 10 }}
          closable
          message="操作成功后，刷新当前页面或重新登录才能生效！"
          type="info"
        />
        <SearchArea isExtraFields={true} submitHandle={this.handleSearch} searchForm={searchForm} />
        {/* <SearchArea
          isExtraFields={true}
          extraFields={
            [
              <div>
                <div className="select-dep-search-area-title">
                  {/*部门:*
                  {this.$t("person.manage.dep") + ":"}
                </div>
                <div className="select-dep-search-area">
                  <div className="f-left select-dep-wrap">
                    <SelectDepOrPerson
                      renderButton={false}
                      title={this.state.extraDep.title}
                      onlyDep={true}
                      onConfirm={this.selectDepSearchArea}/>
                  </div>
                  <div className={this.state.extraDep.depClassName}
                       onMouseLeave={this.onMouseLeaveDepTag}
                       onMouseEnter={this.onMouseEnterDepTag}
                       onClick={this.onCloseDepTag}>
                    <Icon type="close-circle" className="closeCircle"/>
                  </div>
                </div>
              </div>
            ]
          }
          eventHandle={this.eventSearchAreaHandle}
          searchForm={this.state.searchForm}
          clearHandle={this.clearSearchHandle}
          submitHandle={this.handleSearch}/> */}
        <div className="table-header">
          <div className="table-header-title">
            {this.$t('common.total', { total: `${this.state.pagination.total}` })}
          </div>
          {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <div className="f-left">
              {this.state.CREATE_DATA_TYPE ? (
                <Button
                  type="primary"
                  disabled={!this.props.tenantMode}
                  onClick={this.handleCreatePerson}
                >
                  {/*新增员工*/}
                  {this.$t('person.manage.new.person')}
                </Button>
              ) : (
                  <span />
                )}
              {this.state.CREATE_DATA_TYPE ? (
                <Button onClick={this.personImport} disabled={!this.props.tenantMode}>
                  {/*导入人员数据*/}
                  {this.$t('person.manage.im.person.data')}
                </Button>
              ) : (
                  <span />
                )}

              <Dropdown.Button overlay={menu} disabled={false}>
                <ExportModal
                  exportTitle={this.$t('person.manage.ex.person.data')}
                  exportType="USER"
                  exportCondition={{
                    sort: 'status',
                    keyword: this.state.params.keyword,
                    departmentOIDs: this.state.params.departmentOIDs,
                    corporationOIDs: this.state.params.corporationOIDs,
                    status: this.state.params.status,
                  }}
                  exportCommand={'user_full_info'}
                />
              </Dropdown.Button>
            </div>
            <div className="f-left">
              <InvitePersonModal params={this.state.params} />
            </div>

            <div className="clear" />
          </div>
        </div>
        <div style={{ padding: '24px 0' }}>
          {/* <CustomTable
            ref={ref => (this.table = ref)}
            columns={columns}
            url={`/auth/api/userRole/query/userList?tenantId=${user.tenantId}`}
          /> */}
          <Table
            ref={ref => (this.table = ref)}
            loading={this.state.loading}
            dataSource={this.state.data}
            columns={columns}
            pagination={this.state.pagination}
            size="middle"
            bordered={true}
            onChange={this.onChangePager}
          />
        </div>
        {/* <NewRole visible={newShow} onClose={this.close} /> */}
        <SelectRoles userId={userId} onCancel={this.close} visible={allocShow} />
        <Modal
          closable
          width={800}
          className="pm-import-person-modal"
          title={this.$t('person.manage.im')} //导入
          visible={this.state.showImportPersonModel}
          footer={null}
          onCancel={this.cancelImportPerson}
          destroyOnClose={true}
        >
          <div className="import-person-modal-wrap">
            <div className="f-left import-person-modal-left">
              <p className="import-person-left-tips">
                {/*主信息模板（必须导入）,*/}
                {/*包含个人基本信息、默认一套银行&证件信息、供应商信息*/}
                {/*补充信息模板（上传前必须先导入主数据）*/}
                {/*维护员工多套银行&证件信息*/}
                {this.$t('person.manage.im.tips1')}
              </p>
              {this.renderDownTemp(this.state.downLoadTempList)}
              <div className="download-list-item-a-wrap">
                <a
                  className="download-list-item-a"
                  href="http://helioscloud-uat-static.oss-cn-shanghai.aliyuncs.com/bank_info.xlsx"
                >
                  {/*银行基础数据（录入银行信息时请根据银行数据录入，该文件无须上传）*/}
                  {this.$t('person.manage.im.tips2')}
                </a>
              </div>
            </div>
            <div className="f-right import-person-modal-right">
              <div className="import-person-right-tips">
                {/*上传模板*/}
                {/*如有多套模板，请先上传人员信息导入模板*/}
                {this.$t('person.manage.im.tips3')}
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
        <ImportErrInfo
          progress={this.state.progressImportErrInfo}
          cancel={this.hideImportErrInfo}
          exportErrInfo={this.exportFailedLog}
          title={this.$t('person.manage.import.error')} //"人员导入错误信息"
          errorsList={this.state.errorsList}
          visible={this.state.showImportErrInfo}
        />
      </div>
    );
  }
}
function mapStateToProps(state) {
  return {
    // profile: state.login.profile,
    user: state.user.currentUser,
    tenantMode: true,
    company: state.user.company,
  };
}
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(Employee);
