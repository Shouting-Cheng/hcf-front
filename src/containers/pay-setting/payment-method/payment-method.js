/**
 * Created by 13576 on 2017/11/25.
 */
import React from 'react';
import { connect } from 'dva';
import { Button, Table, Badge } from 'antd';
import SlideFrame from 'widget/slide-frame';
import SearchArea from 'widget/search-area';
import WrappedPaymentMethod from './new-payment-method';
import paymentMethodService from './payment-method.service';
import { messages } from 'utils/utils';

class PaymentMethod extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      timestamp: new Date().valueOf(),
      columns: [
        {
          /*付款方式类型*/
          title: this.$t('paymentMethod.paymentMethodCategory'),
          dataIndex: 'paymentMethodCategory',
          key: 'paymentMethodCategory',
          render(recode) {
            if (recode === 'ONLINE_PAYMENT') {
              return messages('pay.online');
            } else if (recode === 'OFFLINE_PAYMENT') {
              return messages('pay.underline');
            } else if (recode === 'EBANK_PAYMENT') {
              return messages('pay.landing.file');
            }
          },
        },
        {
          /*付款方式代码*/
          title: this.$t('paymentMethod.paymentMethodCode'),
          dataIndex: 'paymentMethodCode',
          key: 'paymentMethodCode',
        },
        {
          /*付款方式名称*/
          title: this.$t('paymentMethod.description'),
          dataIndex: 'description',
          key: 'description',
        },

        {
          /*状态*/
          title: this.$t('paymentMethod.isEnabled'),
          dataIndex: 'enabled',
          key: 'enabled',
          render: (recode, text) => {
            return (
              <div>
                <Badge status={recode ? 'success' : 'error'} />
                {recode ? this.$t('common.status.enable') : this.$t('common.status.disable')}
              </div>
            );
          },
        },
        {
          /*创建方式*/
          title: this.$t({ id: 'paymentMethod.createType' }),
          dataIndex: 'createType',
          key: 'createType',
          render: value => {
            return (
              <div>
                <Badge status={value === 'USER' ? 'success' : 'processing'} />
                {value === 'USER'
                  ? this.$t({ id: 'paymentMethod.userDefine' })
                  : this.$t({ id: 'paymentMethod.systemDefine' })}
              </div>
            );
          },
        },
      ],
      searchForm: [
        {
          type: 'input',
          colSpan: 6,
          id: 'paymentMethodCode',
          label: this.$t('paymentMethod.paymentMethodCode'),
        },
        {
          type: 'input',
          colSpan: 6,
          id: 'description',
          label: this.$t('paymentMethod.description'),
        },
      ],
      pageSize: 10,
      page: 0,
      pagination: {
        total: 0,
      },
      searchParams: {
        paymentMethodCode: '',
        description: '',
      },
      updateParams: {},
      showSlideFrameNew: false,
      loading: true,
    };
  }

  componentWillMount() {
    this.getList();
  }

  //获得数据
  getList() {
    let params = {};
    params.description = this.state.searchParams.description;
    params.paymentMethodCode = this.state.searchParams.paymentMethodCode;
    params.size = this.state.pageSize;
    params.current = this.state.page + 1;
    paymentMethodService
      .getPaymentType(params)
      .then(response => {
        response.data.map(item => {
          item.key = item.id;
        });
        this.setState({
          data: response.data,
          loading: false,
          pagination: {
            total: Number(response.headers['x-total-count'])
              ? Number(response.headers['x-total-count'])
              : 0,
            onChange: this.onChangePager,
            current: this.state.page + 1,
            onShowSizeChange: this.onChangePageSize,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              this.$t(
                { id: 'common.show.total' },
                { range0: `${range[0]}`, range1: `${range[1]}`, total: total }
              ),
          },
        });
      })
      .catch(e => {});
  }
  //每页多少条
  onChangePageSize = (page, pageSize) => {
    if (page - 1 !== this.state.page || pageSize !== this.state.pageSize) {
      this.setState({ page: page - 1, pageSize: pageSize }, () => {
        this.getList();
      });
    }
  };
  //分页点击
  onChangePager = page => {
    if (page - 1 !== this.state.page)
      this.setState(
        {
          page: page - 1,
          loading: true,
        },
        () => {
          this.getList();
        }
      );
  };

  //清空搜索区域
  clear = () => {
    this.setState({
      updateParams: {
        description: '',
        paymentMethodCode: '',
      },
    });
  };

  //搜索
  search = result => {
    let searchParams = {
      description: result.description,
      paymentMethodCode: result.paymentMethodCode,
    };
    this.setState(
      {
        searchParams: searchParams,
        loading: true,
        page: 0,
        current: 1,
      },
      () => {
        this.getList();
      }
    );
  };


  handleClose = params => {
    this.setState(
      {
        showSlideFrameNew: false,
      },
      () => {
        params && this.getList();
      }
    );
  };

  showSlideNew = flag => {
    this.setState({
      showSlideFrameNew: flag,
    });
  };

  newItemTypeShowSlide = () => {
    let timestamp = new Date().valueOf();
    this.setState(
      {
        timestamp,
        updateParams: {},
      },
      () => {
        this.showSlideNew(true);
      }
    );
  };

  putItemTypeShowSlide = recode => {
    let timestamp = new Date().valueOf();
    this.setState(
      {
        updateParams: recode,
        timestamp,
      },
      () => {
        this.showSlideNew(true);
      }
    );
  };

  render() {
    const {
      columns,
      data,
      pagination,
      searchForm,
      showSlideFrameNew,
      loading,
      updateParams,
      isPut,
      timestamp,
    } = this.state;
    return (
      <div className="payment-method">
        <div className="searchFrom">
          <SearchArea
            searchForm={searchForm}
            submitHandle={this.search}
            clearHandle={this.clear}
            maxLength={4}
            eventHandle={this.searchEventHandle}
          />
        </div>

        <div className="table-header">
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.newItemTypeShowSlide}>
              {this.$t('common.create')}
            </Button>
          </div>
        </div>
        <div className="Table_div" style={{ backgroundColor: 111 }}>
          <Table
            columns={columns}
            dataSource={data}
            pagination={pagination}
            loading={loading}
            bordered
            onRow={record => ({
              onClick: () => this.putItemTypeShowSlide(record),
            })}
            size="middle"
          />
        </div>

        <SlideFrame
          title={
            JSON.stringify(this.state.updateParams) === '{}'
              ? this.$t('paymentMethod.newPaymentMethod')
              : this.$t('paymentMethod.editPaymentMethod')
          }
          show={showSlideFrameNew}
          afterClose={this.handleCloseNewSlide}
          onClose={this.handleClose}>
          <WrappedPaymentMethod params={{ updateParams, timestamp }} onClose={(e) => {this.handleClose(e)}} />
        </SlideFrame>
      </div>
    );
  }
}

function mapStateToProps() {
  return {};
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(PaymentMethod);
