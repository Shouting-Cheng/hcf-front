import React from 'react'
import { connect } from 'dva';

import config from 'config'
import { Table, Button, Badge } from 'antd';
import httpFetch from 'share/httpFetch'

import SearchArea from 'components/Widget/search-area'
import SlideFrame from 'components/Widget/slide-frame'
import NewSetOfBooks from 'containers/finance-setting/set-of-books/new-set-of-books'
class SetOfBooks extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      loading: true,
      data: [],
      page: 0,
      pageSize: 10,
      columns: [
        {title: this.$t("set-of-books.code"), dataIndex: "setOfBooksCode"},
        {title: this.$t("set-of-books.name"), dataIndex: "setOfBooksName"},
        {title: this.$t("set-of-books.period.set.code"), dataIndex: "periodSetCode"},
        {title: this.$t("set-of-books.base.currency"), dataIndex: "functionalCurrencyCode"},
        {title: this.$t("set-of-books.account.set.code"), dataIndex: "accountSetCode"},
        {title: this.$t("common.column.status"), dataIndex: 'enabled', render: enabled => (
          <Badge status={enabled ? 'success' : 'error'} text={enabled ? this.$t('common.status.enable') : this.$t('common.status.disable')} />)}
      ],
      pagination: {
        total: 0
      },
      searchForm: [
        {type: 'input', id: 'setOfBooksCode', label: this.$t("set-of-books.code")},
        {type: 'input', id: 'setOfBooksName', label: this.$t("set-of-books.name")}
      ],
      searchParams: {
        setOfBooksCode: '',
        setOfBooksName: ''
      },
      showSlideFrame: false,
      nowSetOfBooks: {}
    };
  }

  componentWillMount(){
    this.getList();
  }

  //得到列表数据
  getList(){
    this.setState({ loading: true });
    let params = this.state.searchParams;
    params.page = this.state.page;
    params.size = this.state.pageSize;
    let url = `${config.baseUrl}/api/setOfBooks/query/dto`;
    return httpFetch.get(url, params).then((response)=>{
      response.data.map((item)=>{
        item.key = item.id;
      });
      this.setState({
        data: response.data,
        loading: false,
        pagination: {
          total: Number(response.headers['x-total-count']),
          onChange: this.onChangePager,
          current: this.state.page + 1
        }
      })
    });
  }

  //分页点击
  onChangePager = (page) => {
    if(page - 1 !== this.state.page)
      this.setState({
        page: page - 1,
        loading: true
      }, ()=>{
        this.getList();
      })
  };

  search = (result) => {
    this.setState({
      page: 0,
      searchParams: Object.assign({}, this.state.searchParams, result)
    }, ()=>{
      this.getList();
    })
  };

  clear = () => {
    this.setState({
      searchParams: {
        setOfBooksCode: '',
        setOfBooksName: ''
      }
    })
  };

  handleNew = () => {
    this.setState({ nowSetOfBooks: {}, showSlideFrame: true })
  };

  handleRowClick = (record) => {
    this.setState({ nowSetOfBooks: record, showSlideFrame: true })
  };

  handleCloseSlide = (success) => {
    success && this.getList();
    this.setState({showSlideFrame : false});
  };

  render(){
    const { columns, data, loading,  pagination, searchForm, showSlideFrame, nowSetOfBooks } = this.state;
    
    return (
      <div>
        <h3 className="header-title">{this.$t("set-of-books.define")}</h3>
        <SearchArea
          searchForm={searchForm}
          submitHandle={this.search}
          clearHandle={this.clear}/>

        <div className="table-header">
          <div className="table-header-title">{this.$t('common.total', {total: pagination.total + ''})}</div> {/* 共total条数据 */}
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleNew}>{this.$t('common.create')}</Button> {/* 新建 */}
          </div>
        </div>
        <Table columns={columns}
               dataSource={data}
               pagination={pagination}
               loading={loading}
               onRow={record => ({onClick: () => this.handleRowClick(record)})}
               rowKey="setOfBooksId"
               bordered
               size="middle"/>

        <SlideFrame
                    title={nowSetOfBooks.setOfBooksId ? this.$t("set-of-books.edit") : this.$t("set-of-books.new")}
                    show={showSlideFrame}
                    afterClose={() => this.setState({showSlideFrame : false})}>
                    <NewSetOfBooks  onClose={ this.handleCloseSlide} 
                     params={nowSetOfBooks}></NewSetOfBooks>
        </SlideFrame>

      </div>
    )
  }

}


function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(SetOfBooks);
