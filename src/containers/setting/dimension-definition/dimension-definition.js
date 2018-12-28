import React, { Component } from 'react';
import { connect } from 'dva';
import SearchArea from 'widget/search-area';
import { Button, Divider, message, Popconfirm, Badge } from 'antd';
import SlideFrame from 'widget/slide-frame';
import CustomTable from 'components/Widget/custom-table';
import config from 'config';
import { routerRedux } from 'dva/router';
import NewBuilt from './date-setting';
import baseService from 'share/base.service'
import service from './dimension-definition.service';
import 'styles/setting/params-setting/params-setting.scss';

class Dfinition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchForm: [
        {
          type: 'select',
          options: [],
          id: 'setOfBooksId',
          placeholder: '请选择',
          label: '账套',
          labelKey: 'setOfBooksName',
          valueKey: 'id',
          colSpan: 6,
          isRequired: true,
          event: "setOfBooksId",
          allowClear: false,
          defaultValue: props.company.setOfBooksId ,
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
              </span>
            );
          },
        },
      ],
      searchParams: {},
      showSlideFrame: false,
      data: [],
      updateParams: {},
      setOfBooksId: props.company.setOfBooksId,
    };
  }

  // 生命周期
  componentDidMount(){
    this.getSetOfBookList();
  }
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

  // 搜索
  search = (values) => {
    this.table.search(values);

  };
   //获取账套列表
   getSetOfBookList = () => {
    baseService.getSetOfBooksByTenant().then(res => {
      let list = [];
      res.data.map(item => {
        list.push({ value: item.id, label: `${item.setOfBooksCode}-${item.setOfBooksName}` });
      });
      let form = this.state.searchForm;
      form[0].options = list;
      form[0].defaultValue = this.props.company.setOfBooksId;
      this.setState({ searchForm: form, setOfBooksId: form[0].defaultValue });
    });
  }
  // 搜索框事件
  handleEvent = (event, value) => {
    switch(event){
      case 'setOfBooksId':{
        this.setState({ setOfBooksId: value, searchParams: { ...this.state.searchParams, setOfBooksId: value } }, () => {
          this.table.search(this.state.searchParams);
        });
      break;
    }
    case 'enabled':{
      this.setState({ searchParams: { ...this.state.searchParams, enabled: value } }, () => {
        this.table.search(this.state.searchParams);
      });
      break;
    }
  }
}

  //   if (event == "setOfBooksId") {
  //     this.setState({ setOfBooksId: value, searchParams: { ...this.state.searchParams, setOfBooksId: value } }, () => {
  //       this.table.search(this.state.searchParams);
  //     });
  //   } else if (event == "enabled") {
  //     this.setState({ searchParams: { ...this.state.searchParams, enabled: value } }, () => {
  //       this.table.search(this.state.searchParams);
  //     });
  //   }
  // }

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
    const { searchForm, columns,updateParams,showSlideFrame,setOfBooksId,options} = this.state;
    return (
      <div>
        <SearchArea searchForm={searchForm} submitHandle={this.search} clearHandle={this.clear} eventHandle={this.handleEvent}/>
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
          <NewBuilt setOfBooks={ searchForm[0].options } params={{ ...updateParams}} close={this.handleCloseSlide} set={setOfBooksId}/>
        </SlideFrame>
      </div>
    );
  }
}
function mapStateToProps(state) {
 (state);

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
