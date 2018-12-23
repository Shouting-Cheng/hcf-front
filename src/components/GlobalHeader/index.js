import React from 'react';
import { Menu, Icon, Spin, Tag, Dropdown, Avatar, Divider, Tooltip, Select } from 'antd';
import moment from 'moment';
import groupBy from 'lodash/groupBy';
import Debounce from 'lodash-decorators/debounce';
import { Link } from 'dva/router';
import NoticeIcon from '../NoticeIcon';
import HeaderSearch from '../HeaderSearch';
import styles from './index.less';
import { connect } from 'dva';
import fetch from '../../utils/fetch';
import zh_CN from "../../i18n/zh_CN/index"
import en_US from "../../i18n/en_US/index"

@connect(({ components, languages }) => ({
  components,
  languages,
}))
export default class GlobalHeader extends React.Component {
  componentWillUnmount() {
    this.triggerResizeEvent.cancel();
  }

  getNoticeData() {
    const { notices } = this.props;
    if (notices == null || notices.length === 0) {
      return {};
    }
    const newNotices = notices.map(notice => {
      const newNotice = { ...notice };
      if (newNotice.datetime) {
        newNotice.datetime = moment(notice.datetime).fromNow();
      }
      // transform id to item key
      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }
      if (newNotice.extra && newNotice.status) {
        const color = {
          todo: '',
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        }[newNotice.status];
        newNotice.extra = (
          <Tag color={color} style={{ marginRight: 0 }}>
            {newNotice.extra}
          </Tag>
        );
      }
      return newNotice;
    });
    return groupBy(newNotices, 'type');
  }

  toggle = () => {
    const { collapsed, onCollapse } = this.props;
    onCollapse(!collapsed);
    this.triggerResizeEvent();
  };
  /* eslint-disable*/
  @Debounce(600)
  triggerResizeEvent() {
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }

  langChange = value => {
    const { dispatch } = this.props;

    fetch.get('/api/frontKey/query/keyword?lang=' + value, { page: 0, size: 99999 }).then(res => {
      let languages = {};

      res.map(item => {
        languages[item.keyCode] = item.descriptions;
      });

      window.localStorage.setItem('local', value);

      if (value == "zh_cn") {
        languages = { ...languages, ...zh_CN };
      } else {
        languages = { ...languages, ...en_US };
      }

      dispatch({
        type: 'languages/selectLanguage',
        payload: { languages: languages, local: value },
      });

      fetch.post('/api/users/language/' + value);
    });
  };

  render() {
    const {
      currentUser = {},
      collapsed,
      fetchingNotices,
      isMobile,
      logo,
      onNoticeVisibleChange,
      onMenuClick,
      onNoticeClear,
      languages: { local, languageType },
    } = this.props;

    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
        <Menu.Item disabled>
          <Icon type="user" />个人中心
        </Menu.Item>
        <Menu.Item disabled>
          <Icon type="setting" />设置
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="logout">
          <Icon type="logout" />退出登录
        </Menu.Item>
      </Menu>
    );

    return (
      <div className={styles.header}>
        {isMobile && [
          <Link to="/" className={styles.logo} key="logo">
            <img src={logo} alt="logo" width="32" />
          </Link>,
          <Divider type="vertical" key="line" />,
        ]}
        <Icon
          className={styles.trigger}
          type={collapsed ? 'menu-unfold' : 'menu-fold'}
          onClick={this.toggle}
        />
        <div className={styles.right}>
          <Select width={200} value={local} onChange={this.langChange}>
            {languageType.map(item => (
              <Select.Option key={item.id} value={item.language}>
                {item.languageName}
              </Select.Option>
            ))}
          </Select>
          <Dropdown overlay={menu}>
            <span className={`${styles.action} ${styles.account}`}>
              <Avatar
                size="small"
                className={styles.avatar}
                src="https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png"
              />
              <span className={styles.name}>{currentUser.fullName}</span>
            </span>
          </Dropdown>
        </div>
      </div>
    );
  }
}
