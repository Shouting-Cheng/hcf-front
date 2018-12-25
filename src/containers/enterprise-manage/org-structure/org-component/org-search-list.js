/**
 * Created by zhouli on 18/2/3
 * Email li.zhou@huilianyi.com
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';
import 'styles/enterprise-manage/org-structure/org-component/org-search-list.scss';

class OrgSearchList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {}, //传入的数据:包含搜索的部门或者人
    };
  }

  componentWillMount() {
    this.setState({ data: this.props.searchList });
  }

  componentDidMount() {
    this.setState({ data: this.props.searchList });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ data: nextProps.searchList });
  }

  //选择这个
  selectedHandle = (item, index) => {
    if (item.userOid) {
      let data = this.state.data;
      data.personList.map(item => {
        item.actived = false;
      });
      data.personList[index].actived = true;
      this.setState({ data: data });
      this.props.selectItemHandle(item);
    } else {
      this.props.selectItemHandle(item);
    }
  };

  //渲染搜索部门
  renderSearchListDep(list) {
    if (list.length < 1) {
      if (this.props.isSearchOver) {
        return (
          <div className="no-dep">
            <Icon type="frown" />
            {/*没有搜索到部门*/}
            {this.$t('org.search.no-dep')}
          </div>
        );
      } else {
        return (
          <div className="no-person">
            <Icon type="frown" />
            {/*正在搜索*/
            this.$t('sdp.is-searching')}
          </div>
        );
      }
    }
    return list.map(item => {
      return (
        <div
          className={item.actived ? 're-dep-item-active' : 're-dep-item'}
          key={item.departmentOid}
          onClick={() => {
            this.selectedHandle(item);
          }}
        >
          <div className="type-icon">
            <Icon type="folder" />
          </div>
          <div className="name">{item.name}</div>
          <div className="clear" />
        </div>
      );
    });
  }

  //渲染搜索的人
  renderSearchListPerson(list) {
    if (list.length < 1) {
      if (this.props.isSearchOver) {
        return (
          <div className="no-person">
            <Icon type="frown" />
            {/*没有搜索到员工*/}
            {this.$t('org.search.no-person')}
          </div>
        );
      } else {
        return (
          <div className="no-person">
            <Icon type="frown" />
            {/*正在搜索*/
            this.$t('sdp.is-searching')}
          </div>
        );
      }
    }
    return list.map((item, index) => {
      return (
        <div
          className={item.actived ? 're-person-item-active' : 're-person-item'}
          key={item.userOid}
          onClick={() => {
            this.selectedHandle(item, index);
          }}
        >
          <div className="type-icon">
            <Icon type="user" />
          </div>
          <div className="name">{item.fullName}</div>
          <div className="clear" />
        </div>
      );
    });
  }

  render() {
    return (
      <div className="org-search-list-wrap">
        <div className="list-person">
          <div className="list-person-title">
            {/*成员*/}
            {this.$t('org.search.person')}
          </div>
          <div className="list-person-wrap">
            {this.renderSearchListPerson(this.state.data.personList)}
          </div>
        </div>
        <div className="list-dep">
          <div className="list-dep-title">
            {/*部门*/}
            {this.$t('org.search.dep')}
          </div>
          <div className="list-dep-wrap">{this.renderSearchListDep(this.state.data.depList)}</div>
        </div>
      </div>
    );
  }
}

OrgSearchList.propTypes = {
  isSearchOver: PropTypes.bool, //是否搜索完毕
  searchList: PropTypes.object.isRequired,
  selectItemHandle: PropTypes.func.isRequired, //当前被选择的人或部门
};
OrgSearchList.defaultProps = {
  isSearchOver: false,
};
//加入多语言
export default OrgSearchList;
