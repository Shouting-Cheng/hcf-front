import React, { Component } from 'react';
import { message, Icon, Tabs,Button,Input } from 'antd';
import Table from 'widget/table'
import config from 'config';
import baseService from 'share/base.service'
import CustomTable from 'components/Widget/custom-table';
import SlideFrame from 'widget/slide-frame';
import Responsibility from './new-responsibility';

import { connect } from 'dva';
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
          dataIndex:'defaultResiponsibilityCenterName',
          align:'center'
        },
        {
          title:'可用责任中心',
          dataIndex:'allResiponsibilityCenter',
          align:'center'
        },
        {
          title:'操作',
          dataIndex:'id',
          align:'center',
          render:(value,record,index)=>{
            return(
              <span>
                <a onClick={()=>{
                  this.edit(record);
                }}>
                  编辑
                </a>
              </span>
            );

          }

        }
      ],
      loading: false,
      updateParams: {},
      showSlideFrame: false,
      allSetBooks: [],
      infoData:{dimensionCode:123,dimensionName:123},
      departmentId:"1077870291782524929",

    }
  }

  componentDidMount() {
    this.getSetOfBookList();
  }
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
  edit = record => {
    this.setState({
      updateParams: JSON.parse(JSON.stringify(record)),
    }, () => {
      this.setState({ showSlideFrame: true })
    });
  };
  // 新建
  createResponsion = () => {
    this.setState({
      updateParams: {},
      showSlideFrame: true
    }, () => {
      this.setState({ showSlideFrame: true })
    });
  };
  // 搜索
  search = () => {

  }
  handleClose=()=>{
    this.setState({
      showSlideFrame:false
    })
  }

   //返回到组织架构
  onBackClick = (e) => {
    e.preventDefault();
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/admin-setting/dimension-definition`,
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
         <Responsibility allSetBooks={allSetBooks} params={{ ...updateParams}} close={this.handleClose}/>

        </SlideFrame>

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
