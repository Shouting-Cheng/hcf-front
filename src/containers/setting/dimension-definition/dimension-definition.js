import React, { Component } from 'react';
import { connect } from 'dva';
import SearchArea from 'widget/search-area';
import { Button, Divider, message, Popconfirm, Badge } from 'antd';
import SlideFrame from 'widget/slide-frame';
import CustomTable from 'components/Widget/custom-table';
import config from 'config';
import { routerRedux } from 'dva/router';
import NewBuilt from './date-setting';
import service from './dimension-definition.service';
import 'styles/setting/params-setting/params-setting.scss';

class Dfinition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchForm: [
        {
          type: 'value_list',
          options: [{ value: props.company.setOfBooksId, label: props.company.setOfBooksId }],
          id: 'setOfBooksId',
          placeholder: '请选择',
          label: '账套',
          colSpan: 6,
        },
        {
          type: 'input',
          id: 'dimensionCode',
          placeholder: '请输入',
          label: '维度代码',
          colSpan: 6,
        },
        {
          type: 'input',
          id: 'dimensionName',
          placeholder: '请输入',
          label: '维度名称',
          colSpan: 6,
        },
        {
          type: 'value_list',
          id: 'enabled',
          label: '状态',
          colSpan: '6',
          options: [
            { value: false, label: '禁用' },
            { value: true, label: '启用' },
          ],
          valueKey: 'value',
          labelkey: 'label',
        },
      ],
      columns: [
        {
          title: '序号',
          dataIndex: 'dimensionSequence',
          align: 'center',
        },
        {
          title: '维度代码',
          dataIndex: 'dimensionCode',
          align: 'center',
        },
        {
          title: '维度名称',
          dataIndex: 'dimensionName',
          align: 'center',
        },
        {
          title: '账套',
          dataIndex: 'setOfBooksId',
          align: 'center',
        },
        {
          title: '状态',
          dataIndex: 'enabled',
          align: 'center',
          render: enabled => (
            <Badge status={enabled ? 'success' : 'error'}
              text={enabled ? this.$t("common.status.enable") : this.$t("common.status.disable")} />)
        },
        {
          title: '操作',
          dataIndex: 'id',
          align: 'center',
          render: (value, record, index) => {
            return (
              <span>
                <a
                  onClick={() => {
                    this.edit(record);
                  }}
                >
                  编辑
                </a>
                <Divider type="vertical" />
                <a onClick={(e) => this.detailClick(e, record)}>详情</a>
                {/* <Divider type="vertical" /> */}
                {/* <Popconfirm
                  placement="topLeft"
                  title="确定删除?"
                  onConfirm={() => {
                    this.delete(record.id);
                  }}
                  okText="确定"
                  cancelText="取消"
                >
                   <a>删除</a>
                </Popconfirm> */}
              </span>
            );
          },
        },
      ],
      searchParams: {},
      showSlideFrame: false,
      data: [],
      updateParams: {},
    };
  }

  // 获取账套
  // getSetOfBooks(){
  //   let setOfBooksOption = [];
  //   paymentCompanySettingService.getSetOfBooksByTenant().then((res)=>{
  //       res.data.map(data =>{
  //         setOfBooksOption.push({"label":data.setOfBooksCode+" - "+data.setOfBooksName,"value":String(data.id)})
  //       })
  //       this.setState({
  //         setOfBooksOption
  //       })
  //     }
  //   )
  // }
  // 新建维度
  createDimension = () => {
    this.setState({
      updateParams: {},
      showSlideFrame: true
    }, () => {
      this.setState({ showSlideFrame: true })
    });
  };
  // 编辑
  edit = record => {
    this.setState({
      updateParams: JSON.parse(JSON.stringify(record)),
    }, () => {
      this.setState({ showSlideFrame: true })
    });
  };
  // 删除
  // delete = id => {
  //   service
  //     .deleteDimensionSetting(id)
  //     .then(res => {
  //       message.success('删除成功');
  //       this.table.search({setOfBooksId: this.props.company.setOfBooksId});
  //     })
  //     .catch(err => {
  //       message.error(err.response.data.message);
  //     });
  // };

  // 搜索
  search = (values) => {
    this.table.search(values);
    console.log(this.state.searchParams, '搜索条件');

  };
  //清除
  clear = (values) => {
    this.setState({ searchParams: {} })
    this.table.search(values);
  }
  // 详情
  detailClick = (e, record) => {
    this.props.dispatch(
      routerRedux.replace({
        //账套id,recordid
        pathname: `/admin-setting/dimension-definition/dimension-details/${record.id}`,
      })
    );
  }
  handleCloseSlide = (flag) => {
    this.setState({
      showSlideFrame: false
    }, () => {
      flag && this.table.search(this.state.searchParams);
    })
  }
  render() {
    const { searchForm, columns, updateParams, showSlideFrame, setOfBooksId } = this.state;
    return (
      <div>
        <SearchArea searchForm={searchForm} submitHandle={this.search} clearHandle={this.clear} />
        <Button
          style={{ margin: '20px 0' }}
          className="create-btn"
          type="primary"
          onClick={this.createDimension}
        >
          新 建
        </Button>

        <CustomTable
          columns={columns}
          url={`${config.baseUrl}/api/dimension/page/by/cond?setOfBooksId=${this.props.company.setOfBooksId}`}
          ref={ref => (this.table = ref)}
        />
        <SlideFrame
          title={JSON.stringify(updateParams) === "{}" ? '新建维度' : '编辑维度'}
          show={showSlideFrame}
          onClose={() => this.setState({ showSlideFrame: false })}
        >
          <NewBuilt params={{ ...updateParams }} close={this.handleCloseSlide} set={setOfBooksId} />
        </SlideFrame>
      </div>
    );
  }
}
function mapStateToProps(state) {
  // console.log(state);

  return {

    company: state.user.company
  }
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(Dfinition);
