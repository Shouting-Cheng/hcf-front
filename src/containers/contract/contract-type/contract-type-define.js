import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button, Badge, message } from 'antd';
import Table from 'widget/table'
import config from 'config';
import baseService from 'share/base.service';
import contractService from 'containers/contract/contract-type/contract-type-define.service';
import SearchArea from 'components/Widget/search-area';
import SlideFrame from 'components/Widget/slide-frame';
import NewContractType from 'containers/contract/contract-type/new-contract-type';
import CustomTable from 'components/Widget/custom-table';

class ContractTypeDefine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      searchForm: [
        {
          type: 'select',
          id: 'setOfBooksId',
          colSpan: 6,
          label: this.$t('adjust.setOfBooks'),
          options: [],
          labelKey: 'name',
          valueKey: 'id',
          isRequired: 'true',
          event: 'SETOFBOOKSID',
          defaultValue: Number(this.props.match.params.setOfBooksId)
            ? this.props.match.params.setOfBooksId
            : this.props.company.setOfBooksId,
        },
        {
          type: 'input',
          colSpan: '6',
          id: 'contractTypeCode',
          label: this.$t('contract.type.code'),
        },
        {
          type: 'input',
          colSpan: '6',
          id: 'contractTypeName',
          label: this.$t('contract.type.name'),
        }, //合同类型名称
        {
          type: 'select',
          colSpan: '6',
          options: [],
          id: 'contractCategory',
          label: this.$t('my.contract.category'),
        }, //合同大类
      ],
      searchParams: {
        setOfBooksId: this.props.company.setOfBooksId,
      },
      columns: [
        {
          title: this.$t('adjust.setOfBooks'),
          align: 'center',
          dataIndex: 'setOfBooksCode',
          render: (value, record) => value + '-' + record.setOfBooksName,
        },
        { title: this.$t('contract.type.code'), align: 'center', dataIndex: 'contractTypeCode' },
        { title: this.$t('contract.type.name'), align: 'center', dataIndex: 'contractTypeName' },
        {
          title: this.$t('my.contract.category'),
          align: 'center',
          dataIndex: 'contractCategoryName',
        },
        {
          title: this.$t('adjust.formName'),
          align: 'center',
          dataIndex: 'formName',
          render: value => value || '-',
        },
        {
          title: this.$t('common.column.status'),
          align: 'center',
          dataIndex: 'enabled',
          render: status => (
            <Badge
              status={status ? 'success' : 'error'}
              text={status ? this.$t('common.enabled') : this.$t('common.disabled')}
            />
          ),
        },
        {
          title: this.$t('common.operation'),
          dataIndex: 'id',
          align: 'center',
          render: (id, record) => (
            <span>
              <a onClick={() => this.handleEdit(record)}>{this.$t('common.edit')}</a>
              {
                <span>
                  <span className="ant-divider" />
                  <a onClick={() => this.handleDistribute(record)}>
                    {this.$t('adjust.company.distribution')}
                  </a>
                </span>
              }
            </span>
          ),
        },
      ],
      data: [],
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0,
        showQuickJumper: true,
        showSizeChanger: true,
      },
      showSlideFrame: false,
      slideParams: {},
      //companyDistribution:  menuRoute.getRouteItem('company-distribution','key'),    //公司分配
    };
  }
  getSetOfBookList = () => {
    baseService.getSetOfBooksByTenant().then(res => {
      let list = [];
      res.data.map(item => {
        list.push({ value: item.id, label: `${item.setOfBooksCode}-${item.setOfBooksName}` });
      });
      let form = this.state.searchForm;
      form[0].options = list;
      this.setState({ searchForm: form });
    });
  };

  componentWillMount() {
    const { company } = this.props;
    const { searchForm, searchParams, slideParams } = this.state;
    this.getSetOfBookList();
    this.getSystemValueList(2202).then(res => {
      //合同大类
      let options = [];
      res.data.values.map(item => options.push({ label: item.messageKey, value: item.value }));
      searchForm[3].options = options;
    });
    this.setState({ searchForm, searchParams, slideParams }, () => {
      //this.getList()
      this.customTable.search(searchParams);
    });
  }

  getList = () => {
    const { page, pageSize, searchParams } = this.state;
    this.setState({ loading: true });
    contractService.getContractTypeDefineList(page, pageSize, searchParams).then(res => {
      if (res.status === 200) {
        this.setState({
          loading: false,
          data: res.data,
          pagination: {
            total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
            current: page + 1,
            onChange: this.onChangePaper,
            showTotal: total => formatMessage({ id: 'common.total' }, { total: `${total}` }),
          },
        });
      }
    });
  };

  onChangePaper = page => {
    if (page - 1 !== this.state.page) {
      this.setState({ page: page - 1 }, () => {
        //this.getList()
        this.customTable.search();
      });
    }
  };

  onSearch = result => {
    if (!result.setOfBooksId) return;
    let searchParams = {
      setOfBooksId: result.setOfBooksId,
      contractTypeCode: result.contractTypeCode,
      contractTypeName: result.contractTypeName,
      contractCategory: result.contractCategory,
    };
    this.setState(
      {
        searchParams,
        slideParams: { setOfBooksId: result.setOfBooksId },
      },
      () => {
        this.customTable.search(searchParams);
        //this.getList()
      }
    );
  };

  onClear = () => {
    this.setState({
      searchParams: { setOfBooksId: this.props.company.setOfBooksId },
      slideParams: { setOfBooksId: this.props.company.setOfBooksId }
    },
      () => {
        this.customTable.search(this.state.searchParams);
      }
    );
  };

  showSlide = flag => {
    this.setState({ showSlideFrame: flag });
  };

  //新建合同类型
  handleNew = () => {
    let slideParams = this.state.slideParams;
    if (!slideParams.setOfBooksId) {
      slideParams.setOfBooksId = this.props.company.setOfBooksId;
    }
    slideParams.record = {};
    this.setState({
      slideParams,
      showSlideFrame: true,
    });
  };

  //编辑合同类型
  handleEdit = record => {
    let slideParams = this.state.slideParams;
    slideParams.record = record;
    this.setState({ slideParams, showSlideFrame: true });
  };

  //关闭侧滑后的回调
  handleCloseSlide = params => {
    this.setState(
      {
        showSlideFrame: false,
        slideParams: {},
      },
      () => {
        params && this.customTable.search(this.state.searchParams); //this.getList()
      }
    );
  };

  //分配公司
  handleDistribute = record => {
    //this.context.router.push(this.state.companyDistribution.url.replace(':setOfBooksId', record.setOfBooksId).replace(':id', record.id))
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/document-type-manage/contract-type/company-distribution/${
          record.setOfBooksId
          }/${record.id}`,
      })
    );
  };

  //账套切换事件
  searchEventHandle = (event, value) => {
    if (event == 'SETOFBOOKSID') {
      this.setState(
        {
          setOfBooksId: value,
        },
        () => {
          this.customTable.search();
        }
      );
    }
  };

  eventHandle = (event, value) => {
    let searchParams = this.state.searchParams;
    if (event == 'SETOFBOOKSID') {
      searchParams.setOfBooksId = value;
    }
    this.setState(
      {
        searchParams,
        slideParams: { setOfBooksId: value },
      },
      () => {
        //this.getList();
        this.customTable.search(searchParams);
      }
    );
  };

  render() {
    const {
      loading,
      searchForm,
      columns,
      data,
      pagination,
      showSlideFrame,
      slideParams,
    } = this.state;
    slideParams.editFlag = false;
    return (
      <div className="contract-type-define">
        <SearchArea
          searchForm={searchForm}
          submitHandle={this.onSearch}
          maxLength={4}
          clearHandle={this.onClear}
          eventHandle={this.eventHandle}
        />
        <div className="divider" />
        <div className="table-header">
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleNew}>
              {this.$t('common.create')}
            </Button>
          </div>
        </div>
        <CustomTable
          ref={ref => (this.customTable = ref)}
          columns={columns}
          params={{ setOfBooksId: this.state.setOfBooksId }}
          url={`${config.contractUrl}/api/contract/type/query`}
        />
        <SlideFrame
          title={slideParams.record ? this.$t('contract.edit.type') : this.$t('contract.new.type')}
          show={showSlideFrame}
          onClose={() => this.showSlide(false)}
        >
          <NewContractType
            onClose={this.handleCloseSlide}
            params={{
              record: slideParams.record,
              setOfBooksId: slideParams.setOfBooksId,
              flag: showSlideFrame,
            }}
          />
        </SlideFrame>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    /*  main: state.main,
    tenantMode: state.main.tenantMode, */
    company: state.user.company,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(ContractTypeDefine);
