
/**
 * Created by zhouli on 18/2/7
 * Email li.zhou@huilianyi.com
 */

//关于人员导出的一些函数，对应的服务注释掉了
//统一用导出组件export-modal
import React from 'react';

import {
  Button, Tag, Table, Popover,message,
  Icon, Menu, Dropdown, Modal, Upload
} from 'antd';
import {connect} from 'react-redux';

import PMService from 'containers/enterprise-manage/person-manage/person-manage.service';
import SearchArea from 'components/search-area.js';
import menuRoute from 'routes/menuRoute';
import 'styles/enterprise-manage/person-manage/person-manage.scss';
import {isEmptyObj, messages} from 'share/common';
import FileSaver from 'file-saver';
import {deepCopy} from 'share/common';
import {SelectDepOrPerson} from 'components/index';
import ImportErrInfo from 'components/template/import-err-info';
import InvitePersonModal from 'containers/enterprise-manage/person-manage/person-manage-components/invite.person.modal'
import ExportModal from 'components/template/export-modal/export-modal';

class PersonManage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cacheObj: {
        "keyword": "",//关键字
        "departmentOIDs": [],//部门
        "corporationOIDs": [],//公司
        "status": "all"//员工状态
      },//缓存变量
      CREATE_DATA_TYPE: true,
      loading: false,
      showImportPersonModel: false,
      progressImportErrInfo: 1,
      showImportErrInfo: false,
      transactionOID: null,
      errorsList: [
        {
          line: "",
          msg: ""
        },
      ],

      fileList: [],
      flieUploading: false,//文件是否正在上传
      data: [],//条件下所有人
      exportList: [ //导出数据列表
        // 下载全部的功能先去掉
        // {
        //   type: 1001,
        //   name: messages("person.manage.all.data")//全部数据
        // },
        {
          type: 1002,
          command: "user_full_info",
          name: messages("person.manage.person.info.data")//人员信息数据
        },
        {
          type: 1003,
          command: "user_contact_bank_account",
          name: messages("person.manage.bank.info.data")//银行信息数据
        },
        {
          type: 1004,
          command: "user_contact_card",
          name: messages("person.manage.card.info.data")//证件信息数据
        },
        {
          type: 1005,
          command: "user_contact_supplier_ctrip",
          name: messages("person.manage.ctrip.info.data")//携程信息数据
        }
      ],
      downLoadTempList: [
        // 下载全部的功能先去掉
        // {
        //   type: 1,
        //   name: messages("person.manage.down.all.temp")//下载全部模板
        // },
        {
          type: 2,
          name: messages("person.manage.person.info.temp")//人员信息导入模板
        },
        {
          type: 3,
          name: messages("person.manage.bank.info.temp")//银行信息导入模板
        },
        {
          type: 4,
          name: messages("person.manage.card.info.temp")//证件信息导入模板
        },
        {
          type: 5,
          name: messages("person.manage.ctrip.info.temp")//携程信息导入模板
        },
      ],
      pagination: {
        page: 0,
        total: 0,
        pageSize: 10,
      },

      params: {
        "keyword": "",
        "departmentOIDs": [],
        "corporationOIDs": [],
        "status": "all"
      },
      extraDep: {
        res: [],
        title: messages("person.manage.select"),//"请选择",
        depClassName: "f-right select-dep-close-wrap",
        className: ["f-right select-dep-close-wrap", "f-right select-dep-close-wrap select-dep-close-wrap-show"]
      },
      searchForm: [
        {
          type: 'input',
          id: 'keyword',
          label: messages("person.manage.name.employeeId.email.mobile"),//'员工姓名、工号、邮箱、电话',
          event: "keywordChange"
        },
        {
          type: 'list',
          id: 'corporationOIDs',
          label: messages("person.manage.company"),//'公司',
          listType: 'all_company_with_legal_entity',
          labelKey: 'companyName',
          valueKey: 'companyOID',
          placeholder: messages("person.manage.select"),//"请选择",
          event: "companyOIDChange"
        },
        {
          type: 'select',
          id: 'status',
          label: messages("person.manage.status"),//"状态",
          event: "statusChange",
          defaultValue: "all",
          options: [
            {
              label: messages("person.manage.working.person"),// '在职员工',
              value: 1001
            },
            {
              label: messages("person.manage.will.go.person"),//'待离职员工',
              value: 1002
            },
            {
              label: messages("person.manage.gone.person"),//'离职员工',
              value: 1003
            },
            {
              label: messages("person.manage.all.person"),//'全部员工',
              value: "all"
            }
          ]
        },

      ],
      columns: [
        {
          title: messages("person.manage.company"),//"公司",
          key: "companyName",
          dataIndex: 'companyName',
          render: text => <span>{text ? <Popover placement="topLeft" content={text}>{text}</Popover> : '-'}</span>
        },
        {
          title: messages("person.manage.employeeId"),//"工号",
          key: "employeeID",
          dataIndex: 'employeeID',
          render: text => <span>{text ? <Popover placement="topLeft" content={text}>{text}</Popover> : '-'}</span>
        },
        {
          title: messages("person.manage.name"),//"姓名",
          key: "fullName",
          dataIndex: 'fullName',
          render: text => <span>{text ? <Popover placement="topLeft" content={text}>{text}</Popover> : '-'}</span>
        },
        {
          title: messages("person.manage.dep"),// "部门",
          key: "departmentName",
          dataIndex: 'departmentName',
          render: text => <span>{text ? <Popover placement="topLeft" content={text}>{text}</Popover> : '-'}</span>
        },
        {
          title: messages("person.manage.contact"),// "联系方式",
          key: "mobile",
          dataIndex: 'mobile',
          render: text => <span>{text ? <Popover placement="topLeft" content={text}>{text}</Popover> : '-'}</span>
        },
        {
          title: messages("person.manage.email"),// "邮箱",
          key: "email",
          dataIndex: 'email',
          render: text => <span>{text ? <Popover placement="topLeft" content={text}>{text}</Popover> : '-'}</span>
        },
        {
          title: messages("person.manage.status"),// "状态",
          key: "status",
          dataIndex: 'status',
          render: (text) => {
            if(text === 1001){
              return (<span>
                <Popover placement="topLeft" content={messages("person.manage.working.person")}>
                {messages("person.manage.working.person")}
                </Popover>
              </span>)
            }else if(text === 1002){
              return (<span>
                <Popover placement="topLeft" content={messages("person.manage.will.go.person")}>
                {messages("person.manage.will.go.person")}
                </Popover>
              </span>)
            }
            else if(text === 1003){
              return (<span>
                <Popover placement="topLeft" content={messages("person.manage.gone.person")}>
                {messages("person.manage.gone.person")}
                </Popover>
              </span>)
            }
          }
        },
        {
          title: messages("person.manage.operation"),//"操作",
          dataIndex: "id",
          key: "id",
          render: (text, record) => (
            <span>
              <a onClick={(e) => this.editItemPerson(e, record)}>
                                {/*详情*/}
                {messages("common.detail")}
              </a>
            </span>)
        }
      ],
    }
  }

  componentDidMount() {
    let _pagination = this.getBeforePage();
    let pagination = this.state.pagination;
    pagination.page = _pagination.page;
    pagination.current = _pagination.page + 1;
    this.setState({
      pagination
    },()=>{
      this.clearBeforePage();
      //取出页面缓存状态
      let cache = localStorage.getItem("person-manage-cache");
      let cacheObj = {};
      if(cache + "" != 'null'  && cache + "" != '{}'){
        //cache要有值
        cacheObj = JSON.parse(cache);
      }else {
        this.getPersonList();
      }
      //人员导入方式：this.props.company.createDataType如果是 1002，属于接口导入
      // 新增与导入按钮需要隐藏
      let CREATE_DATA_TYPE = (parseInt(this.props.company.createDataType) != 1002);
      this.setState({
        CREATE_DATA_TYPE,
        cacheObj
      },()=>{
        this.setDefaultSearchForm(this.state.cacheObj);
      })
    })
  }

  //设置默认的搜索值
  setDefaultSearchForm=(defaultVal)=>{
    if(isEmptyObj(defaultVal)){
      return
    }
    const {params,searchForm,extraDep} = this.state;
    searchForm[0].defaultValue = defaultVal.keyword;
    searchForm[1].defaultValue = defaultVal.corporationOIDs;
    searchForm[2].defaultValue = defaultVal.status || "all";

    //部门的稍微麻烦一点
    let deps = [];
    extraDep.res =  defaultVal.departmentOIDs || [];
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
    if(defaultVal && defaultVal.corporationOIDs && defaultVal.corporationOIDs.map){
      corporationOIDs = defaultVal.corporationOIDs.map((data)=>{
        return data.companyOID
      });
    }
    params.corporationOIDs = corporationOIDs;
    params.status = defaultVal.status || "all";
    params.departmentOIDs = deps;
    this.setState({
      extraDep,
      params
    },()=>{
      this.getPersonList();
    })
  }

  //获取员工表格
  getPersonList = () => {
    const pagination = this.state.pagination;
    this.setState({
      loading: true,
    })
    let params = {
      "sort": "status",
      "page": pagination.page,
      "size": pagination.pageSize,
      "keyword": this.state.params.keyword,
      "departmentOID": this.state.params.departmentOIDs,
      "corporationOID": this.state.params.corporationOIDs,
      "status": this.state.params.status,
    }


    PMService.searchPersonInDep(params)
      .then((response) => {
        pagination.total = Number(response.headers['x-total-count']);
        this.setState({
          loading: false,
          data: response.data,
          pagination,
        })
      })
  }


  //下载模板
  downloadTemplateByType = (type) => {
    switch (type) {
      case 1: {
        this.downloadEmployeeTemplate();
        setTimeout(()=>{
          this.downloadBankAccountTemplate();
        },500)
        setTimeout(()=>{
          this.downloadCardAccountTemplate();
        },1000)
        setTimeout(()=>{
          this.downloadCtripSupplierTemplate();
        },1500)
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
  }
  //下载人员信息
  downloadEmployeeTemplate = () => {
    PMService.downloadEmployeeTemplate()
      .then((res) => {
        let b = new Blob([res.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
        // 人员信息模板
        let name = messages("person.manage.person.info.temp1");
        FileSaver.saveAs(b, `${name}.xlsx`);
      })
      .catch((err) => {
      })
  };
  //下载携程供应商模板
  downloadCtripSupplierTemplate = () => {
    PMService.downloadCtripSupplierTemplate()
      .then((res) => {
        let b = new Blob([res.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
        // 供应商模板
        let name = messages("person.manage.vendor.info.temp1");
        FileSaver.saveAs(b, `${name}.xlsx`);
      })
      .catch((err) => {
      })
  };
  //下载银行信息模板
  downloadBankAccountTemplate = () => {
    PMService.downloadBankAccountTemplate()
      .then((res) => {
        let b = new Blob([res.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
        // 银行信息模板
        let name = messages("person.manage.bank.info.temp1");
        FileSaver.saveAs(b, `${name}.xlsx`);
      })
      .catch((err) => {
      })
  };
  //下载证件信息模板
  downloadCardAccountTemplate = () => {
    PMService.downloadCardAccountTemplate()
      .then((res) => {
        let b = new Blob([res.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
        // 证件信息模板
        let name = messages("person.manage.card.info.temp1");
        FileSaver.saveAs(b, `${name}.xlsx`);
      })
      .catch((err) => {
      })
  };


  //点击搜搜索
  handleSearch = (values) => {
    const {params}  = this.state;
    params.keyword = values.keyword;
    params.corporationOIDs = values.corporationOIDs;
    params.status = values.status;
    let pagination = this.state.pagination;
    pagination.page = 0;
    pagination.current = 1;
    //这个地方用deepCopy，只是因为在子组件要监听nextProps变化
    this.setState({
      pagination,
      params: deepCopy(params)
    }, () => {
      this.getPersonList()
    })
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
    if(e === "keywordChange"){
      cacheObj.keyword = item;
      params.keyword = item;
      //这个地方用deepCopy，只是因为在子组件要监听nextProps变化
      this.setState({
        pagination,
        cacheObj,
        params: deepCopy(params)
      }, () => {
        this.getPersonList()
      })
    }
    if(e === "companyOIDChange"){
      cacheObj.corporationOIDs = deepCopy(item);
      let corporationOIDs = item.map((data)=>{return data.companyOID});
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
    if(e === "statusChange"){
      params.status = item;
      cacheObj.status = item;
      this.state.pagination = pagination;
      this.state.cacheObj = cacheObj;
      this.state.params = deepCopy(params);
    }

  }
  clearSearchHandle = () => {
    localStorage.setItem("person-manage-cache", null);
    const {searchForm,params,pagination,cacheObj} = this.state;
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
    },()=>{
      this.handleSearch(this.state.params);
    })
    this.selectDepSearchArea([]);
  }

  //新增员工
  handleCreatePerson = () => {
    this.setBeforePage(this.state.pagination);
    let cacheObj = this.state.cacheObj;
    let cacheObjStr = JSON.stringify(cacheObj);
    localStorage.setItem("person-manage-cache",cacheObjStr);
    let path = menuRoute.getRouteItem('person-detail', 'key').url.replace(":userOID", "NEW");
    this.context.router.push(path);
  }
  //编辑员工
  editItemPerson = (e, record) => {
    this.setBeforePage(this.state.pagination);
    let cacheObj = this.state.cacheObj;
    let cacheObjStr = JSON.stringify(cacheObj);
    localStorage.setItem("person-manage-cache",cacheObjStr);
    let path = menuRoute.getRouteItem('person-detail', 'key').url.replace(":userOID", record.userOID);
    this.context.router.push(path);
  }
  //分页点击
  onChangePager = (pagination, filters, sorter) => {
    this.setState({
      pagination: {
        current: pagination.current,
        page: pagination.current - 1,
        pageSize: pagination.pageSize
      }
    }, () => {
      this.getPersonList();
    })
  };

  //导入
  personImport = () => {
    this.setState({
      showImportPersonModel: true
    })
  };
  cancelImportPerson = () => {
    this.setState({
      showImportPersonModel: false
    })
  }
  //导出用了统一导出组件，相关逻辑代码，下个迭代可以删除了
  //导出
  // personExport = (type) => {
  //   let params = {
  //     keyword: this.state.params.keyword,
  //     status: this.state.params.status,
  //     departmentOIDs:  this.state.params.departmentOIDs,
  //     corporationOIDs: this.state.params.corporationOIDs,
  //   }
  //   switch (type) {
  //     case 1001: {
  //       //这个case占时去掉了
  //       // this.exportEmployeeData(params);
  //       setTimeout(()=>{
  //         // this.exportBankCardData(params);
  //       },500)
  //       setTimeout(()=>{
  //         // this.exportIDCardData(params);
  //       },1000)
  //       setTimeout(()=>{
  //         // this.exportCtripData(params);
  //       },1500)
  //       break;
  //     }
  //     case 1002: {
  //       // this.exportEmployeeData(params);
  //       break;
  //     }
  //     case 1003: {
  //       // this.exportBankCardData(params);
  //       break;
  //     }
  //     case 1004: {
  //       // this.exportIDCardData(params);
  //       break;
  //     }
  //     case 1005: {
  //       // this.exportCtripData(params);
  //       break;
  //     }
  //     default: {
  //       // this.exportEmployeeData(params);
  //     }
  //   }
  //
  // };

  //导出人员信息数据
  // exportEmployeeData = (params) => {
    // this.setState({
    //   loading: true,
    // })
    // PMService.exportEmployeeData(params)
    //   .then((res) => {
    //     let b = new Blob([res.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
    //     //  "员工信息";
    //     let name = messages("person.manage.person.info");
    //     FileSaver.saveAs(b, `${name}.xlsx`);
    //     this.setState({
    //       loading: false,
    //     })
    //   })
    //   .catch((res) => {
    //     this.setState({
    //       loading: false,
    //     })
    //   })
  // }
  //导出证件信息数据
  // exportIDCardData = (params) => {
    // this.setState({
    //   loading: true,
    // })
    // PMService.exportIDCardData(params)
    //   .then((res) => {
    //     this.setState({
    //       loading: false,
    //     })
    //     let b = new Blob([res.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
    //     //  "证件信息";
    //     let name = messages("person.manage.card.info1");
    //     FileSaver.saveAs(b, `${name}.xlsx`);
    //   })
    //   .catch((res) => {
    //     this.setState({
    //       loading: false,
    //     })
    //   })
  // }
  //导出银行卡信息数据
  // exportBankCardData = (params) => {
  //   this.setState({
  //     loading: true,
  //   })
  //   PMService.exportBankCardData(params)
  //     .then((res) => {
  //       this.setState({
  //         loading: false,
  //       })
  //       let b = new Blob([res.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
  //       //  "银行卡信息";
  //       let name = messages("person.manage.bank.card.info");
  //       FileSaver.saveAs(b, `${name}.xlsx`);
  //     })
  //     .catch((res) => {
  //       this.setState({
  //         loading: false,
  //       })
  //     })
  // }
  //导出携程信息数据
  // exportCtripData = (params) => {
  //   this.setState({
  //     loading: true,
  //   })
  //   PMService.exportCtripData(params)
  //     .then((res) => {
  //       this.setState({
  //         loading: false,
  //       })
  //       let b = new Blob([res.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
  //       // "携程信息";
  //       let name = messages("person.manage.ctrip.info");
  //       FileSaver.saveAs(b, `${name}.xlsx`);
  //     })
  //     .catch((res) => {
  //       this.setState({
  //         loading: false,
  //       })
  //     })
  // }

  onMouseLeaveDepTag = (e) => {
    e.stopPropagation();

  };
  onMouseEnterDepTag = (e) => {
    e.stopPropagation();

  };
  //清除已经选择的部门
  onCloseDepTag = (e) => {
    e.stopPropagation();
    this.selectDepSearchArea([]);
  };

  //渲染已经选择的部门
  renderButtonTitle(titleArr) {
    if (titleArr.length < 1) {
      // 请选择
      return messages("person.manage.select");
    }
    let node = [];
    titleArr.map((item, i) => {
      node.push(<Tag key={i}>{item.name}</Tag>);
    })
    return node;
  }

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

  //渲染下载模板
  renderDownTemp = (list) => {
    return list.map((data) => {
      return (
        <div className="download-list-item"
             key={data.type}
             onClick={() => {
               this.downloadTemplateByType(data.type)
             }}
        >
          {data.name}
        </div>
      )

    })
  }
  //渲染导出的列表
  renderExportList = (list) => {
    return list.map((data) => {
      return <Menu.Item key={data.type}>
        <ExportModal
          exportTitle={data.name}
          exportType="USER"
          exportCondition={{
            "sort": "status",
            "keyword": this.state.params.keyword,
            "departmentOIDs": this.state.params.departmentOIDs,
            "corporationOIDs": this.state.params.corporationOIDs,
            "status": this.state.params.status,
          }}
          exportCommand={data.command}
        ></ExportModal>

        {/*<div onClick={() => {*/}
          {/*this.personExport(data.type)*/}
        {/*}}>{data.name}</div>*/}
      </Menu.Item>
    })
  }

  handleFileUpload = () => {
    const {fileList} = this.state;
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
      .then((res) => {
        this.setState({
          fileList: [],
          uploading: false,
          flieUploading: false,
          showImportPersonModel: false,
          transactionOID: res.data.transactionOID
        }, () => {
          this.showImportErrInfo();
          this.showTransactionLogDialog(this.state.transactionOID);   // 将参数传给dialog
        });
      })
      .catch((res) => {
        this.setState({
          uploading: false,
          flieUploading: false,
        });
      })
  }

  showTransactionLogDialog = (transactionOID) => {
    PMService.getBatchTransactionLogNew(transactionOID)
      .then((res) => {
        let data = res.data;
        if (data.totalEntities === 0) {
          return;
        } else {
          let errors = data.errors;
          let errorsList = this.getErrorDataByerrors(errors);
          let progressImportErrInfo = this.getProgressByData(data);
          this.setState({
            progressImportErrInfo,
            errorsList
          })
          if ((data.successEntities + data.failureEntities) != data.totalEntities) {
            let gapTime = 500;
            setTimeout(() => {
              //请求频率涉及到一个算法
              this.showTransactionLogDialog(this.state.transactionOID);   // 将参数传给dialog
            },gapTime)
          }else {
            this.getPersonList();
            if(this.state.errorsList.length === 0 && this.state.progressImportErrInfo === 100){
              message.success(messages("common.operate.success"));
              this.hideImportErrInfo();
            }
          }
        }
      })
  }
 //获取百分进度
  getProgressByData = (data) => {
    return Math.round((data.failureEntities + data.successEntities) * 100 / data.totalEntities);
  }
  //通过错误信息，解析成表格
  getErrorDataByerrors = (errs) => {
    let data = [];
    for (let key in errs) {
      let row = {};
      row.line = errs[key];
      if (row.line.length > 1) {
        let _line = [];
        for (let i = 0; i < row.line.length; i++) {
          _line.push(row.line[i]);
          if (i < row.line.length - 1) {
            _line.push(",");
          }
        }
        row.line = _line;
      }
      row.msg = key;
      data.push(row);
    }
    return data;
  }
  //人员导入错误信息
  exportFailedLog = () => {
    PMService.exportFailedLog(this.state.transactionOID)
      .then((res) => {
        let b = new Blob([res.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
        // 人员导入错误信息
        let name = messages("person.manage.im.err");
        FileSaver.saveAs(b, `${name}.xlsx`);
      })
      .catch((res) => {
      })
  }
  //人员导入的错误信息-start
  showImportErrInfo = () => {
    this.setState({
      showImportErrInfo: true
    })
  }

  hideImportErrInfo = () => {
    this.setState({
      showImportErrInfo: false
    })
  }

  //人员导入的错误信息-end

  render() {
    const menu = (
      <Menu>
        {
          this.renderExportList(this.state.exportList)
        }
      </Menu>
    );
    const props = {

      onRemove: (file) => {
        this.setState(({fileList}) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: (file) => {
        // this.setState(({fileList}) => ({
        //   fileList: [...fileList, file],
        // }));
        //只上传一个
        this.setState(({fileList}) => ({
          fileList: [file],
        }));
        return false;
      },
      fileList: this.state.fileList,
    };
    return (
      <div className="person-manage-wrap">
        <SearchArea
          isExtraFields={true}
          extraFields={
            [
              <div>
                <div className="select-dep-search-area-title">
                  {/*部门:*/}
                  {messages("person.manage.dep") + ":"}
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
          submitHandle={this.handleSearch}/>
        <div className="table-header">
          <div
            className="table-header-title">
            {messages('common.total',
              {total: `${this.state.pagination.total}`})}
          </div>
          {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <div className="f-left">
              {
                this.state.CREATE_DATA_TYPE ? <Button type="primary"
                                                      disabled={!this.props.tenantMode}
                                                     onClick={this.handleCreatePerson}>
                {/*新增员工*/}
                {messages("person.manage.new.person")}
              </Button> : <span></span>
              }
              {
                this.state.CREATE_DATA_TYPE ? <Button onClick={this.personImport}
                                                      disabled={!this.props.tenantMode}>
                  {/*导入人员数据*/}
                  {messages("person.manage.im.person.data")}
                </Button> : <span></span>
              }
              <Dropdown.Button overlay={menu}
                               disabled={this.state.loading}>
                <ExportModal
                  exportTitle={messages("person.manage.ex.person.data")}
                  exportType="USER"
                  exportCondition={{
                    "sort": "status",
                    "keyword": this.state.params.keyword,
                    "departmentOIDs": this.state.params.departmentOIDs,
                    "corporationOIDs": this.state.params.corporationOIDs,
                    "status": this.state.params.status,
                  }}
                  exportCommand={"user_full_info"}
                ></ExportModal>
              </Dropdown.Button>
            </div>

            <div className="f-left">
              <InvitePersonModal
                params={this.state.params}
              />
            </div>

            <div className="clear"></div>
          </div>
        </div>
        <Table
          loading={this.state.loading}
          dataSource={this.state.data}
          columns={this.state.columns}
          pagination={this.state.pagination}
          size="middle"
          bordered={true}
          onChange={this.onChangePager}
        />

        <Modal
          closable
          width={800}
          className="pm-import-person-modal"
          title={messages("person.manage.im")}//导入
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
                {messages("person.manage.im.tips1")}
              </p>
              {
                this.renderDownTemp(this.state.downLoadTempList)
              }
              <div className="download-list-item-a-wrap">
                <a className="download-list-item-a"
                   href="http://helioscloud-uat-static.oss-cn-shanghai.aliyuncs.com/bank_info.xlsx"
                >
                  {/*银行基础数据（录入银行信息时请根据银行数据录入，该文件无须上传）*/}
                  {messages("person.manage.im.tips2")}
                </a>
              </div>
            </div>
            <div className="f-right import-person-modal-right">
              <div className="import-person-right-tips">
                {/*上传模板*/}
                {/*如有多套模板，请先上传人员信息导入模板*/}
                {messages("person.manage.im.tips3")}
              </div>
              <div className="upload-file-wrap">

                <Upload {...props}>
                  <Button>
                    <Icon type="upload"/>
                    {/*选择一个文件*/}
                    {messages("person.manage.select.file")}
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
                  {this.state.flieUploading ? messages("person.manage.uploading") : messages("person.manage.start.upload")}
                </Button>

              </div>
            </div>
            <div className="clear"></div>
          </div>
        </Modal>
        <ImportErrInfo
          progress={this.state.progressImportErrInfo}
          cancel={this.hideImportErrInfo}
          exportErrInfo={this.exportFailedLog}
          title={messages("person.manage.import.error")}//"人员导入错误信息"
          errorsList={this.state.errorsList}
          visible={this.state.showImportErrInfo}/>




      </div>
    )
  }

}

PersonManage.propTypes = {};

PersonManage.contextTypes = {
  router: React.PropTypes.object
}
function mapStateToProps(state) {
  return {
    profile: state.login.profile,
    user: state.login.user,
    tenantMode: state.main.tenantMode,
    company: state.login.company,
  }
}
export default connect(mapStateToProps, null, null, { withRef: true })(PersonManage);

