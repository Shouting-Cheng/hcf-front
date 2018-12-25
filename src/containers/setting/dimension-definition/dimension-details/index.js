
import React, {Component} from 'react';
import Table from 'widget/table';
import { Button, Badge, Input, Divider, message } from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import httpFetch from 'share/httpFetch';
import config from 'config';
class Dimension extends Component{
   constructor(props) {
      super(props);
      this.state = {
        valueColumns: [
          {
            title: '序号',
            dataIndex: 'id',
            align: 'center'
          },
          {
            title: '维度代码',
            dataIndex: 'dimensionCode',
            align: 'center'
          },
          {
            title: '维度名称',
            dataIndex: 'dimensionName',
            align: 'center'
          },
          {
            title: '账套',
            dataIndex: 'setOfBooksName',
            align: 'center'
          }
          ,{
            title: '状态',
            dataIndex: 'enabled',
            align: 'center',
            render: (enabled, record, index) => {
              return (
                <Badge status={enabled ? 'success' : 'error'} text={enabled ? '启用' : '禁用'} />
              );
            }
          },{
              title: '操作',
              dataIndex: 'operation',
              align: 'center',
              render: (operation, record, index) => {
                return (
                  <div>
                    <a >编辑</a>
                    <Divider type="vertical" />
                    <a onClick={e => this.onDetailClick(e, record)}>详情</a>
                  </div>
                );
              }
          }],
          data: [],
          page: 0,
          size: 10,
      }
   }

   componentDidMount = () => {
     this.getData();
   }
   getData = () => {
     const {page,size} =this.state;
     let params = {
       setOfBooksId: 1050629005174435842,
       page,
       size
     }
    const data = [{
      id: 1,
      dimensionCode:1111,
      dimensionName: '11',
      setOfBooksName: 'one',
      enabled: false
    },
     {
       id:2,
    dimensionCode:2222,
    dimensionName: '22',
    setOfBooksName: 'one2',
    enabled: true}];
    this.setState({data:data})
   }
   onDetailClick = (e,record) => {
     const setOfBooksId = 1050629005174435842
    this.props.dispatch(
      routerRedux.replace({
        //账套id,recordid
        pathname: `/admin-setting/dimension-definition/dimension-details/${setOfBooksId}/${record.id}`,
      })
    );
   }

   render() {
      const {valueColumns,data} = this.state;
      return (
        <Table
          columns={valueColumns}
          dataSource={data}
          rowKey={record => record.id}>
        </Table>
      )
   }
}

export default connect(
  null,
  null,
  null,
  { withRef: true }
)(Dimension);
