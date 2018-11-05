
/**
 * Created by zhouli on 18/3/9
 * Email li.zhou@huilianyi.com
 * 这个界面展示法人实体详情
 * 分新老集团
 * 新集团是展示法人下面的公司
 * 老集团是展示法人下面的员工
 */
import React from 'react';
import { connect } from 'dva';

import config from 'config';
import {
  Form,
  Button,
  Select,
  Popover,
  Input,
  Switch,
  Icon,
  Table,
  message,
  Popconfirm,
} from 'antd';

const Search = Input.Search;
import { routerRedux } from "dva/router";
import ListSelector from 'components/Widget/list-selector';
import BasicInfo from 'components/Widget/basic-info';
import 'styles/enterprise-manage/legal-person/legal-person-detail.scss';
import LPService from 'containers/enterprise-manage/legal-person/legal-person.service';
import { SelectDepOrPerson } from 'components/Widget/index';
import { superThrottle, getLanguageName } from 'utils/extend';

class LegalPersonDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      legalPerson: {
        accountBank: '', //开户行
        address: '', //地址
        companyName: '', //名称

        cardNumber: '', //银行卡号
        enable: '', //状态
        i18n: {}, //包含开户行，地址，名称

        setOfBooksId: '', //账套
        telephone: '', //电话
        taxpayerNumber: '', //税号

        parentLegalEntityId: '', //上级法人

        attachmentId: '', //发票二维码上传图片后的id
      }, //顶部信息对象
      infoList: [
        //顶部信息字段
        //名称
        {
          type: 'input',
          id: 'companyName',
          isRequired: true,
          label: this.$t('legal.entity.detail.name'), //"名称"
        },
        // 纳税人识别号
        {
          type: 'input',
          id: 'taxpayerNumber',
          isRequired: true,
          label: this.$t('legal.entity.detail.tax'), //"纳税人识别号"
        },
        // 开户行
        {
          type: 'input',
          id: 'accountBank',
          isRequired: true,
          label: this.$t('legal.entity.detail.account'), //"开户行"
        },
        //银行卡号
        {
          type: 'input',
          id: 'cardNumber',
          isRequired: true,
          label: this.$t('legal.entity.detail.bank.card'), // "银行卡号"
        },
        // 电话
        {
          type: 'input',
          id: 'telephone',
          isRequired: true,
          label: this.$t('legal.entity.detail.mobile'), // "电话"
        },
        // 地址
        {
          type: 'input',
          id: 'address',
          isRequired: true,
          label: this.$t('legal.entity.detail.address'), // "地址"
        },
        // 账套名称
        {
          type: 'input',
          id: 'setOfBooksName',
          isRequired: true,
          label: this.$t('legal.entity.detail.sob.name'), // "账套名称"
        },
        // 上级法人
        {
          type: 'input',
          id: 'parentLegalEntityName',
          label: this.$t('legal.entity.detail.parent.legal'), //"上级法人"
        },
        // 状态
        {
          type: 'switch',
          id: 'enable',
          label: this.$t('common.column.status') /*状态*/,
        },
        // 开票显示语言
        {
          type: 'input',
          id: 'mainLanguageName',
          label: this.$t('legal.person.new.mainLanguage') /*开票显示语言*/,
        },
        // 开票二维码
        {
          type: 'IMG',
          id: 'attachmentId',
          label: this.$t('legal.entity.detail.qcode'), //"开票二维码",
          src: 'fileURL',
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
      //表格数据
      data: [],
      //老集团的人员表格
      columns: [
        { title: this.$t('legal.entity.detail.index'), key: 'id', dataIndex: 'id' } /*序号*/,
        {
          title: this.$t('legal.entity.detail.employee'),
          key: 'fullName',
          dataIndex: 'fullName',
        } /*员工*/,
        {
          title: this.$t('legal.entity.detail.employeeId'),
          key: 'employeeID',
          dataIndex: 'employeeID',
        } /*工号*/,
        {
          title: this.$t('legal.entity.detail.dep'),
          key: 'departmentName',
          dataIndex: 'departmentName',
        } /*部门*/,
        {
          title: this.$t('legal.entity.detail.mobile'),
          key: 'mobile',
          dataIndex: 'mobile',
        } /*电话*/,
        { title: this.$t('legal.entity.detail.email'), key: 'email', dataIndex: 'email' } /*邮箱*/,
        {
          title: this.$t('common.operation'),
          key: 'operation',
          width: '15%',
          render: (text, record) => (
            <a>
              <span onClick={e => this.moveToItem(e, record)}>
                {this.$t('legal.entity.detail.move')}
              </span>
            </a>
          ),
        }, //移动
      ],
      //新集团的公司表格
      columnsNew: [
        {
          title: this.$t('legal.entity.detail.company.code'),
          key: 'companyCode',
          dataIndex: 'companyCode',
        } /*公司代码*/,
        {
          title: this.$t('legal.entity.detail.company.name'),
          key: 'name',
          dataIndex: 'name',
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
        } /*公司名称*/,
        {
          title: this.$t('legal.entity.detail.company.type'),
          key: 'companyTypeName',
          dataIndex: 'companyTypeName',
        } /*公司类型*/,
        {
          title: this.$t('legal.entity.detail.sob'),
          key: 'setOfBooksName',
          dataIndex: 'setOfBooksName',
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
        } /*账套*/,
        {
          title: this.$t('legal.entity.detail.legal.entity'),
          key: 'legalEntityName',
          dataIndex: 'legalEntityName',
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
        } /*法人*/,
        {
          title: this.$t('legal.entity.detail.company.level'),
          key: 'companyLevelName',
          dataIndex: 'companyLevelName',
        } /*公司级别*/,
        {
          title: this.$t('legal.entity.detail.parent.company'),
          key: 'parentCompanyName',
          dataIndex: 'parentCompanyName',
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
        } /*上级公司*/,
      ],
      companyName: '', //搜索新公司

      selectedRowKeys: [], ///已选择的列表项的key，这个用来记住翻页的
      selectedEntityOIDs: [], //已选择的列表项的OIDs

      legalPersonList: false, //选择法人实体的列表弹窗,是否显示
      legalPersonSelectorItem: {
        //法人实体列表
        title: this.$t('legal.entity.detail.legal.entity1'),
        url:
          config.baseUrl +
          '/api/all/company/receipted/invoices/exclude/' +
          this.props.match.params.legalPersonOID,
        searchForm: [
          {
            type: 'input',
            id: 'keyword',
            label: this.$t('legal.entity.detail.name'),
            defaultValue: '',
          },
        ],
        columns: [
          {
            title: this.$t('legal.entity.detail.name'),
            dataIndex: 'companyName',
            key: 'companyName',
          },
          {
            title: this.$t('legal.entity.detail.tax'),
            dataIndex: 'taxpayerNumber',
            key: 'taxpayerNumber',
          },
        ],
        key: 'id',
      },
    };
  }

  componentDidMount() {
    //获取法人实体详情
    this.getLegalPersonDetail();
    this.getTable();
  }

  getTable = () => {
    //分新老老集团
    if (this.props.isOldCompany) {
      this.getPersonList();
    } else {
      this.getPersonCompanys();
    }
  };
  getLegalPersonDetail = () => {
    LPService.getLegalPersonDetail(this.props.match.params.legalPersonOID).then(res => {
      let data = res.data;
      data.mainLanguageName = getLanguageName(data.mainLanguage, this.props.languageList);

      this.setState({
        legalPerson: data,
      });
    });
  };

  //获取法人下面的人，这是老集团
  getPersonList() {
    let params = {
      corporationOID: this.props.match.params.legalPersonOID,
      page: this.state.pagination.page,
      size: this.state.pagination.pageSize,
    };
    this.setState({
      loading: true,
    });
    // let params = {
    //   companyOID:
    //   departmentOID: "37f0c85b-1f1a-4694-b9da-eecb125e2fbf",
    //   corporationOID: "37f0c85b-1f1a-4694-b9da-eecb125e2fbf",
    //   page: 0,
    //   size: 10,
    //   status: 1001,
    //   roleType: "TENANT",
    //   keyword: ""
    // }
    LPService.getLegalPersonPersons(params).then(res => {
      this.setState(
        {
          data: res.data,
          loading: false,
          pagination: {
            page: this.state.pagination.page,
            pageSize: this.state.pagination.pageSize,
            showSizeChanger: true,
            showQuickJumper: true,
            total: Number(res.headers['x-total-count']),
          },
        },
        () => {
          this.refreshRowSelection();
        }
      );
    });
  }

  //获取法人下面的公司，这是新集团
  getPersonCompanys() {
    let params = {
      keyword: this.state.companyName,
      legalEntityId: this.props.match.params.legalPersonID,
      page: this.state.pagination.page,
      size: this.state.pagination.pageSize,
    };
    this.setState({
      loading: true,
    });
    LPService.getLegalPersonCompanys(params).then(res => {
      this.setState({
        data: res.data,
        loading: false,
        pagination: {
          page: this.state.pagination.page,
          pageSize: this.state.pagination.pageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          total: Number(res.headers['x-total-count']),
        },
      });
    });
  }

  //分页点击
  onChangePager = (pagination, filters, sorter) => {
    let temp = this.state.pagination;
    temp.page = pagination.current - 1;
    temp.current = pagination.current;
    temp.pageSize = pagination.pageSize;
    this.setState(
      {
        pagination: temp,
      },
      () => {
        this.getTable();
      }
    );
  };

  //针对老集团的逻辑--start
  //点击弹框ok，选择了目标法人
  selectTargetLegalPerson = data => {
    let targetLegal = data.result[0].companyReceiptedOID;
    let params = {
      companyReceiptedOIDFrom: this.props.match.params.legalPersonOID,
      companyReceiptedOIDTo: targetLegal, //目标法人的oid
      userOIDs: this.state.selectedEntityOIDs, //要移动的员工数组
      selectMode: 'default',
    };
    LPService.movePersonsToLegalPerson(params).then(res => {
      // 员工移动成功
      message.success(this.$t('legal.entity.detail.move.success'));
      this.getTable();
      this.clearRowSelection();
      this.setState({
        legalPersonList: false,
      });
    });
  };

  //列表选择更改
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  onSelectRow = (record, selected) => {
    let temp = this.state.selectedEntityOIDs;
    if (selected) {
      temp.push(record.userOID);
    } else {
      temp.delete(record.userOID);
    }
    this.setState(
      {
        selectedEntityOIDs: temp,
      },
      () => {}
    );
  };

  //全选
  onSelectAllRow = selected => {
    let temp = this.state.selectedEntityOIDs;
    if (selected) {
      this.state.data.map(item => {
        temp.addIfNotExist(item.userOID);
      });
    } else {
      this.state.data.map(item => {
        temp.delete(item.userOID);
      });
    }
    this.setState(
      {
        selectedEntityOIDs: temp,
      },
      () => {}
    );
  };

  //换页后根据OIDs刷新选择框
  refreshRowSelection() {
    let selectedRowKeys = [];
    this.state.selectedEntityOIDs.map(selectedEntityOID => {
      this.state.data.map((item, index) => {
        if (item.userOID === selectedEntityOID) selectedRowKeys.push(index);
      });
    });
    this.setState({ selectedRowKeys });
  }

  //清空选择框
  clearRowSelection() {
    this.setState({ selectedEntityOIDs: [], selectedRowKeys: [] });
  }

  //移入员工
  moveInPerson = arr => {
    let oids = [];
    arr.map(data => {
      oids.push(data.userOID);
    });
    LPService.importPersonsToLegalPerson(this.props.match.params.legalPersonOID, oids).then(res => {
      // 员工导入成功
      message.success(this.$t('legal.entity.detail.im.success'));
      this.getTable();
    });
  };

  batchMoveItems = () => {
    this.setState({
      legalPersonList: true,
    });
  };
  //单个移动
  moveToItem = (e, record) => {
    let selectedEntityOIDs = [record.userOID];
    this.setState({
      selectedEntityOIDs,
      legalPersonList: true,
    });
  };

  //取消移动
  hideLegalPerson = () => {
    this.setState({
      legalPersonList: false,
    });
  };
  //针对老集团的逻辑--end

  //针对新集团的逻辑---start
  //搜索公司
  emitEmpty = () => {
    this.setState({ companyName: '' }, () => {
      this.getPersonCompanys();
    });
  };
  onChangeCompanyName = () => {
    this.getPersonCompanys();
  };
  //为了节流函数
  onInputCompnayName = e => {
    //这句是为了使用节流函数，不然onChangeSetCompanyName函数中只能使用上一次的输入
    this.state.companyName = e.target.value;
    this.setState({ companyName: e.target.value });
  };
  onChangeSetCompanyName = superThrottle(
    () => {
      this.onChangeCompanyName();
    },
    500,
    3000
  );
  //针对新集团的逻辑---end

  //返回
  handleBack = () => {
    this.props.dispatch(
      routerRedux.replace({
         pathname: '/enterprise-manage/legal-person',
         })
      );
  };
  //渲染老集团
  renderOldTenant = () => {
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.onSelectChange,
      onSelect: this.onSelectRow,
      onSelectAll: this.onSelectAllRow,
    };
    return (
      <div>
        <div className="table-header">
          <div className="table-header-title">
            {this.$t('common.total', { total: `${this.state.pagination.total}` })}
          </div>
          {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <div className="f-left">
              <SelectDepOrPerson
                buttonDisabled={this.state.selectedEntityOIDs.length > 0}
                buttonType={'primary'}
                title={this.$t('legal.entity.detail.select.person')} //移入人员
                onlyPerson={true}
                onConfirm={this.moveInPerson}
              />
            </div>
            <div className="f-left">
              <Button
                type="primary"
                disabled={this.state.selectedEntityOIDs.length < 1}
                onClick={this.batchMoveItems}
              >
                {this.$t('legal.entity.detail.move.to')}
                {/*"移动到"*/}
              </Button>
            </div>
            <div className="clear" />
          </div>
        </div>

        <Table
          dataSource={this.state.data}
          columns={this.state.columns}
          onChange={this.onChangePager}
          rowSelection={rowSelection}
          pagination={this.state.pagination}
          loading={this.state.loading}
          size="middle"
          bordered
        />

        <ListSelector
          single={true}
          visible={this.state.legalPersonList}
          onOk={this.selectTargetLegalPerson}
          selectorItem={this.state.legalPersonSelectorItem}
          extraParams={{}}
          onCancel={this.hideLegalPerson}
        />
      </div>
    );
  };
  //渲染新集团
  renderNewTenant = () => {
    const { companyName } = this.state;
    const suffix = companyName ? (
      <span className="company-search-icon">
        <Icon type="close-circle" onClick={this.emitEmpty} />
      </span>
    ) : null;
    return (
      <div>
        <div className="table-header-wrap">
          <div className="total-tips f-left">
            {this.$t('common.total', { total: `${this.state.pagination.total}` })}
          </div>
          {/*共搜索到*条数据*/}
          <div className="search-wrap f-right">
            <Search
              className="search-company-name"
              placeholder={this.$t('legal.entity.detail.input.companyName')} //"请输入公司名称"
              enterButton={
                <span>
                  {/*搜索*/}
                  {this.$t('legal.entity.detail.search')}
                </span>
              }
              prefix={<Icon type="filter" style={{ color: 'rgba(0,0,0,.25)' }} />}
              suffix={suffix}
              value={companyName}
              key={'search-company-name'}
              onInput={this.onInputCompnayName}
              onChange={this.onChangeSetCompanyName}
              onSearch={this.onChangeCompanyName}
            />
          </div>
          <div className="clear" />
        </div>

        <Table
          loading={this.state.loading}
          dataSource={this.state.data}
          columns={this.state.columnsNew}
          onChange={this.onChangePager}
          pagination={this.state.pagination}
          size="middle"
          bordered
        />
      </div>
    );
  };
  renderEnter = () => {
    if (this.props.isOldCompany) {
      return this.renderOldTenant();
    } else {
      return this.renderNewTenant();
    }
  };

  render() {
    return (
      <div className="legal-person-detail-wrap"  style={{marginBottom:20}}>
        <BasicInfo
          infoList={this.state.infoList}
          infoData={this.state.legalPerson}
          isHideEditBtn={true}
        />
        {this.renderEnter()}
        <a style={{ fontSize: '14px', paddingBottom: '20px' }} onClick={this.handleBack}>
          <Icon type="rollback" style={{ marginRight: '5px' }} />
          {this.$t('common.back')}
        </a>
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    profile: state.login.profile,
    user: state.user.currentUser,
    company: state.user.company,
    isOldCompany: state.user.isOldCompany,
    languageList: state.languages.languageList,
    tenantMode: true,
  };
}

const WrappedLegalPersonDetail = Form.create()(LegalPersonDetail);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedLegalPersonDetail);
