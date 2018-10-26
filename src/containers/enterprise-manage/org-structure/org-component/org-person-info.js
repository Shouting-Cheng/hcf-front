
/**
 * Created by zhouli on 18/1/30
 * Email li.zhou@huilianyi.com
 * 组织架构显示人员信息
 */
import React from 'react';

import 'styles/enterprise-manage/org-structure/org-component/org-person-info.scss';
import { Button, Icon } from 'antd';
import { routerRedux } from "dva/router";
import PropTypes from 'prop-types'
class OrgStructurePersonInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      user: {},
    };
  }

  componentWillMount() {
    this.setState({ user: this.props.user });
  }

  componentDidMount(){
    this.setState({ user: this.props.user });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ user: nextProps.user });
  }

  //去用户详情界面
  goToPersonDetail = () => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/enterprise-manage/person-manage/person-detail/person-detail/${this.state.user.userOID}`,
      })
    );
    // let path = menuRoute
    //   .getRouteItem('person-detail', 'key')
    //   .url.replace(':userOID', this.state.user.userOID);
    // this.context.router.push(path);
  };

  //渲染激活状态
  renderActivated = activated => {
    if (activated) {
      return (
        <span>
          {/*已激活*/}
          {this.$t('org.person.actived')}
        </span>
      );
    } else {
      return (
        <span>
          {/*未激活*/}
          {this.$t('org.person.no-active')}
        </span>
      );
    }
  };
  //渲染性别
  renderSex = gender => {
    // *0男1女，2未知
    if (parseInt(gender) === 0) {
      return (
        <div className="content">
          {/*男*/}
          {this.$t('org.person.man')}
        </div>
      );
    } else if (parseInt(gender) === 1) {
      return (
        <div className="content">
          {/*女*/}
          {this.$t('org.person.woman')}
        </div>
      );
    } else {
      return (
        <div className="content">
          {/*未知*/}
          {this.$t('org.person.unkown')}
        </div>
      );
    }
  };
  renderTime = date => {
    if (date) {
      return <span>{new Date(date).format('yyyy-MM-dd')}</span>;
    } else {
      return (
        <span>
          {/*未知*/}
          {this.$t('org.person.unkown')}
        </span>
      );
    }
  };

  renderStatus = status => {
    //在职，离职，待离职
    if (status + '' === '1001') {
      return <span>{this.$t('org.status.1001')}</span>;
    } else if (status + '' === '1002') {
      return <span>{this.$t('org.status.1002')}</span>;
    } else if (status + '' === '1003') {
      return <span>{this.$t('org.status.1003')}</span>;
    } else {
      return (
        <span>
          {/*未知*/}
          {this.$t('org.person.unkown')}
        </span>
      );
    }
  };

  render() {
    return (
      <div className="org-structure-person-info">
        <div className="person-info-avater-wrap">
          <div className="f-left avater-icon">
            <Icon type="frown" />
          </div>
          <div className="f-left person-info">
            <div className="f-left name">{this.state.user.fullName}</div>
            <div className="f-left status">{this.renderActivated(this.state.user.activated)}</div>
          </div>
          <div className="f-right avater-right">
            <Button type="primary" onClick={this.goToPersonDetail}>
              {/*查看详情*/}
              {this.$t('org.person.detail')}
            </Button>
          </div>
        </div>

        <div className="person-info-row">
          <div className="title">
            {/*公司*/}
            {this.$t('org.person.company')}
          </div>
          <div className="content">{this.state.user.companyName}</div>
          <div className="clear" />
        </div>
        <div className="person-info-row">
          <div className="title">
            {/*直属领导*/}
            {this.$t('org.person.directManager')}
          </div>
          <div className="content">{this.state.user.directManagerName}</div>
          <div className="clear" />
        </div>
        <div className="person-info-row">
          <div className="title">
            {/*部门*/}
            {this.$t('org.person.dep')}
          </div>
          <div className="content">{this.state.user.departmentName}</div>
          <div className="clear" />
        </div>
        <div className="person-info-row">
          <div className="title">
            {/*邮箱*/}
            {this.$t('org.person.email')}
          </div>
          <div className="content">{this.state.user.email}</div>
          <div className="clear" />
        </div>
        <div className="person-info-row">
          <div className="title">
            {/*电话*/}

            {this.$t('org.person.phone')}
          </div>
          <div className="content">{this.state.user.mobile ? this.state.user.mobile : ''}</div>
          <div className="clear" />
        </div>

        <div className="person-info-row">
          <div className="title">
            {/*职务*/}
            {this.$t('org.person.duty')}
          </div>
          <div className="content">{this.state.user.duty}</div>
          <div className="clear" />
        </div>
        <div className="person-info-row">
          <div className="title">
            {/*职位*/}
            {this.$t('org.person.title')}
          </div>
          <div className="content">{this.state.user.title}</div>
          <div className="clear" />
        </div>
        <div className="person-info-row">
          <div className="title">
            {/*级别*/}
            {this.$t('org.person.rank')}
          </div>
          <div className="content">{this.state.user.rank}</div>
          <div className="clear" />
        </div>
        <div className="person-info-row">
          <div className="title">
            {/*入职时间*/}
            {this.$t('org.person.entrytime')}
          </div>
          <div className="content">{this.renderTime(this.state.user.entryDate)}</div>
          <div className="clear" />
        </div>
        <div className="person-info-row">
          <div className="title">
            {/*状态*/}
            {this.$t('org.person.status')}
          </div>
          <div className="content">{this.renderStatus(this.state.user.status)}</div>
          <div className="clear" />
        </div>
        <div className="person-info-row">
          <div className="title">
            {/*生日*/}
            {this.$t('org.person.birthday')}
          </div>
          <div className="content">{this.renderTime(this.state.user.birthday)}</div>
          <div className="clear" />
        </div>

        <div className="person-info-row">
          <div className="title">
            {/*性别*/}
            {this.$t('org.person.sex')}
          </div>
          {this.renderSex(this.state.user.gender)}
          <div className="clear" />
        </div>
      </div>
    );
  }
}

OrgStructurePersonInfo.propTypes = {
  user: PropTypes.object.isRequired,
};
// OrgStructurePersonInfo.contextTypes = {
//   router: React.PropTypes.object,
// };
export default OrgStructurePersonInfo;
