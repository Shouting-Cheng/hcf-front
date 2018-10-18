import { messages } from 'share/common';
/**
 * Created by zhouli on 18/1/30
 * Email li.zhou@huilianyi.com
 * 组织架构显示人员信息
 */
import React from 'react';

import 'styles/enterprise-manage/org-structure/org-component/org-person-info.scss';
import { Button, Icon } from 'antd';
import menuRoute from 'routes/menuRoute';

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

  componentWillReceiveProps(nextProps) {
    this.setState({ user: nextProps.user });
  }

  //去用户详情界面
  goToPersonDetail = () => {
    let path = menuRoute
      .getRouteItem('person-detail', 'key')
      .url.replace(':userOID', this.state.user.userOID);
    this.context.router.push(path);
  };

  //渲染激活状态
  renderActivated = activated => {
    if (activated) {
      return (
        <span>
          {/*已激活*/}
          {messages('org.person.actived')}
        </span>
      );
    } else {
      return (
        <span>
          {/*未激活*/}
          {messages('org.person.no-active')}
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
          {messages('org.person.man')}
        </div>
      );
    } else if (parseInt(gender) === 1) {
      return (
        <div className="content">
          {/*女*/}
          {messages('org.person.woman')}
        </div>
      );
    } else {
      return (
        <div className="content">
          {/*未知*/}
          {messages('org.person.unkown')}
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
          {messages('org.person.unkown')}
        </span>
      );
    }
  };

  renderStatus = status => {
    //在职，离职，待离职
    if (status + '' === '1001') {
      return <span>{messages('org.status.1001')}</span>;
    } else if (status + '' === '1002') {
      return <span>{messages('org.status.1002')}</span>;
    } else if (status + '' === '1003') {
      return <span>{messages('org.status.1003')}</span>;
    } else {
      return (
        <span>
          {/*未知*/}
          {messages('org.person.unkown')}
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
              {messages('org.person.detail')}
            </Button>
          </div>
        </div>

        <div className="person-info-row">
          <div className="title">
            {/*公司*/}
            {messages('org.person.company')}
          </div>
          <div className="content">{this.state.user.companyName}</div>
          <div className="clear" />
        </div>
        <div className="person-info-row">
          <div className="title">
            {/*直属领导*/}
            {messages('org.person.directManager')}
          </div>
          <div className="content">{this.state.user.directManagerName}</div>
          <div className="clear" />
        </div>
        <div className="person-info-row">
          <div className="title">
            {/*部门*/}
            {messages('org.person.dep')}
          </div>
          <div className="content">{this.state.user.departmentName}</div>
          <div className="clear" />
        </div>
        <div className="person-info-row">
          <div className="title">
            {/*邮箱*/}
            {messages('org.person.email')}
          </div>
          <div className="content">{this.state.user.email}</div>
          <div className="clear" />
        </div>
        <div className="person-info-row">
          <div className="title">
            {/*电话*/}

            {messages('org.person.phone')}
          </div>
          <div className="content">{this.state.user.mobile ? this.state.user.mobile : ''}</div>
          <div className="clear" />
        </div>

        <div className="person-info-row">
          <div className="title">
            {/*职务*/}
            {messages('org.person.duty')}
          </div>
          <div className="content">{this.state.user.duty}</div>
          <div className="clear" />
        </div>
        <div className="person-info-row">
          <div className="title">
            {/*职位*/}
            {messages('org.person.title')}
          </div>
          <div className="content">{this.state.user.title}</div>
          <div className="clear" />
        </div>
        <div className="person-info-row">
          <div className="title">
            {/*级别*/}
            {messages('org.person.rank')}
          </div>
          <div className="content">{this.state.user.rank}</div>
          <div className="clear" />
        </div>
        <div className="person-info-row">
          <div className="title">
            {/*入职时间*/}
            {messages('org.person.entrytime')}
          </div>
          <div className="content">{this.renderTime(this.state.user.entryDate)}</div>
          <div className="clear" />
        </div>
        <div className="person-info-row">
          <div className="title">
            {/*状态*/}
            {messages('org.person.status')}
          </div>
          <div className="content">{this.renderStatus(this.state.user.status)}</div>
          <div className="clear" />
        </div>
        <div className="person-info-row">
          <div className="title">
            {/*生日*/}
            {messages('org.person.birthday')}
          </div>
          <div className="content">{this.renderTime(this.state.user.birthday)}</div>
          <div className="clear" />
        </div>

        <div className="person-info-row">
          <div className="title">
            {/*性别*/}
            {messages('org.person.sex')}
          </div>
          {this.renderSex(this.state.user.gender)}
          <div className="clear" />
        </div>
      </div>
    );
  }
}

OrgStructurePersonInfo.propTypes = {
  user: React.PropTypes.object.isRequired,
};
OrgStructurePersonInfo.contextTypes = {
  router: React.PropTypes.object,
};
export default OrgStructurePersonInfo;
