import React, { Component } from 'react';
import { message, Icon, Tabs,Button,Input } from 'antd';
import config from 'config';
import httpFetch from 'share/httpFetch';
import baseService from 'share/base.service'
import CustomTable from 'components/Widget/custom-table';
import SlideFrame from 'widget/slide-frame';
import Responsibility from './new-responsibility';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import BasicInfo from './basic-info';
const Search = Input.Search;

class ResponsibilityCenter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      infoList: [
        {
          type: 'input',
          id: 'dimensionCode',
          isRequired: true,
          label: '部门代码:',
        },
        {
          type: 'input',
          id: 'dimensionName',
          isRequired: true,
          label: '部门名称:',
        },
      ],
      columns: [
        {
          title:'账套',
          dataIndex:'setOfBooksName',
          align:'center'
        },
        {
          title:'公司',
          dataIndex:'companyName',
          align:'center'
        },
        {
          title:'默认责任中心',
          dataIndex:'defaultResponsibilityCenterName',
          align:'center'
        },
        {
          title:'可用责任中心',
          dataIndex:'allResponsibilityCenter',
          align:'center',
          render: (value) => {
            return Number(value) ? `已选${value}个` : '全部';
          }
        },
        {
          title:'操作',
          dataIndex:'id',
          align:'center',
          render:(value,record,index)=>{
            return(<span><a onClick={()=>{this.edit(record)}}>编辑</a></span>);
          }
        }
      ],
      loading: false,
      updateParams: {},
      showSlideFrame: false,
      allSetBooks: [],
      pagination:{current: 1,},
      searchParams: {},
      page: 0,
      infoData:{},
      // departmentId:"1077870291782524929",
      departmentId: this.props.match.params.departmentId
    }
  }

  componentDidMount() {
    this.getSetOfBookList();
  }

  getDepartment = () => {
    const id = this.state.departmentId;
    service.getDimensionDetail(id).then(res => {
      this.setState({
        infoData: res.data,
       });
    }).catch(err => {
      message.error(err.response.data.message);
    })
  }
   // 通过部门oid查询部门详情
  //  getDepDetailByDepOid(Dep) {
  //   return new Promise((resolve, reject) => {
  //     httpFetch
  //       .get(config.baseUrl + '/api/departments/' + Dep.departmentOid)
  //       .then(res => {
  //         resolve(res);
  //       })
  //       .catch(err => {
  //         errorMessage(err.response);
  //         reject(err);
  //       });
  //   });
  // }


  // 获取帐套
  getSetOfBookList = () => {
    baseService.getSetOfBooksByTenant().then(res => {
      let list = [];
      res.data.map(item => {
        list.push({ value: item.id, label: `${item.setOfBooksCode}-${item.setOfBooksName}` });
      });
      this.setState({
        allSetBooks:list
      })
    });
  }

  // 编辑
  edit = (record) => {
    this.setState({
      showSlideFrame: true,
      updateParams: JSON.parse(JSON.stringify(record)),
    });
  };

  // 新建
  createResponsion = (e) => {
    e.preventDefault();
    this.setState({
      updateParams: {},
      showSlideFrame: true
    });
  };


   // 搜索
   search = (value) => {
    this.table.search({ setOfBooksName: value });
  }

  // 设置state
  mySetState = (params) => {
    let pagination = this.state.pagination;
    this.setState({ page: 0, pagination: { ...pagination, current: 1 }, ...params }, () => {
      this.table.search(params);
    })
  }

  handleClose=(params)=>{
    this.setState({
      showSlideFrame:false
    },()=>{
      params&&this.table.search()
    })
  }

   //返回到组织架构
  onBackClick = (e) => {
    e.preventDefault();
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/enterprise-manage/org-structure`,
      })
    );
  };


  render() {
      const { infoList, infoData,columns,departmentId,updateParams,showSlideFrame,allSetBooks} = this.state;

    return (
      <div>
        <BasicInfo
          infoList={infoList}
          infoData={infoData}
        />
         <Button
          style={{ margin: '30px 0',width:'85px'}}
          className="create-btn"
          type="primary"
          onClick={this.createResponsion}
        >
          新 建
        </Button>
        <Search
            placeholder="请输入账套代码名称"
            onSearch={this.search}
            style={{ width: '300px', float: 'right',margin:'30px 0' }}
          />
        <CustomTable
          columns={columns}
          url={`${config.baseUrl}/api/department/sob/responsibility/query?departmentId=${departmentId}`}
          ref={ref => (this.table = ref)}
        />
         <SlideFrame
          title={JSON.stringify(updateParams) === "{}" ? '新建责任中心配置' : '编辑责任中心配置'}
          show={showSlideFrame}
          onClose={() => this.setState({ showSlideFrame: false })}
        >
         <Responsibility allSetBooks={allSetBooks} params={{ ...updateParams}} close={this.handleClose} departmentId={departmentId}/>

        </SlideFrame>
        <p style={{ marginBottom: '20px' }}>
          <a onClick={this.onBackClick}>
            <Icon type="rollback" />返回
          </a>
        </p>

      </div>
    )
  }
}


export default connect(
  null,
  null,
  null,
  { withRef: true }
)(ResponsibilityCenter);
