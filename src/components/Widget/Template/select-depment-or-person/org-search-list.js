/**
 * Created by zhouli on 18/2/3
 * Email li.zhou@huilianyi.com
 * 组织架构搜索之后的人员部门混合显示
 * 只显示列表，点击右边展示详情
 */
import React from 'react';
import PropTypes from 'prop-types';

import { Icon } from 'antd';
import 'styles/components/template/select-depment-or-person/org-search-list.scss';
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

  componentWillReceiveProps(nextProps) {
    this.setState({ data: nextProps.searchList });
  }

  //选择这个
  selectedHandle = item => {
    this.props.selectedHandle(item);
  };

  //渲染搜索的部门
  renderSearchListDep(list) {
    if (list.length < 1) {
      if (this.props.isSearchOver) {
        return (
          <div className="no-dep">
            <Icon type="frown" />
            {/*没有搜索到部门*/
            this.$t('sdp.no-dep')}
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
      if (item.nodeDisabled) {
        return (
          <div className="re-dep-item-disabled" key={item.departmentOID}>
            <div className="type-icon">
              <Icon type="folder" />
            </div>
            <div className="name">{item.name}</div>
            <div className="clear" />
          </div>
        );
      } else {
        return (
          <div
            className={item.actived ? 're-dep-item-active' : 're-dep-item'}
            key={item.departmentOID}
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
      }
    });
  }

  //渲染搜索的人
  renderSearchListPerson(list) {
    if (list.length < 1) {
      if (this.props.isSearchOver) {
        return (
          <div className="no-person">
            <Icon type="frown" />
            {/*没有搜索到员工*/
            this.$t('sdp.no-person')}
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
      if (item.nodeDisabled) {
        return (
          <div className="re-person-item-disabled" key={item.userOID}>
            <div className="type-icon">
              <Icon type="user" />
            </div>
            <div className="name">{item.fullName}</div>
            <div className="clear" />
          </div>
        );
      } else {
        return (
          <div
            className={item.actived ? 're-person-item-active' : 're-person-item'}
            key={item.userOID}
            onClick={() => {
              this.selectedHandle(item);
            }}
          >
            <div className="type-icon">
              <Icon type="user" />
            </div>
            <div className="name">{item.fullName}</div>
            <div className="clear" />
          </div>
        );
      }
    });
  }
  isRenderPerson = () => {
    if (this.props.onlyDep) {
      return <div />;
    } else {
      return (
        <div className="list-person">
          <div className="list-person-title">
            {/*成员*/
            this.$t('sdp.person')}
          </div>
          <div className="list-person-wrap">
            {this.renderSearchListPerson(this.state.data.personList)}
          </div>
        </div>
      );
    }
  };
  isRenderDep = () => {
    if (this.props.onlyPerson) {
      return <div />;
    } else {
      return (
        <div className="list-dep">
          <div className="list-dep-title">
            {/*部门*/
            this.$t('sdp.dep')}
          </div>
          <div className="list-dep-wrap">{this.renderSearchListDep(this.state.data.depList)}</div>
        </div>
      );
    }
  };
  render() {
    return (
      <div className="org-search-list">
        {this.isRenderPerson()}
        {this.isRenderDep()}
      </div>
    );
  }
}

OrgSearchList.propTypes = {
  isSearchOver: PropTypes.bool, //是否搜索完毕
  selectedHandle: PropTypes.func.isRequired, //点击选择之后的回调
  searchList: PropTypes.object.isRequired,
  onlyDep: PropTypes.bool, //是否只显示部门，默认false显示部门与人
  onlyPerson: PropTypes.bool, //是否只显示选人，默认false显示部门与人
};
OrgSearchList.defaultProps = {
  isSearchOver: false,
  onlyDep: false,
  onlyPerson: false,
};
//加入多语言
export default OrgSearchList;
