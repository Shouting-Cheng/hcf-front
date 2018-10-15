import 'rc-drawer/assets/index.css';
import React from 'react';
import DrawerMenu from 'rc-drawer';
import SiderMenu from './SiderMenu';

const SiderMenuWrapper = props => {
  const { isMobile, collapsed, activeKey } = props;

  return isMobile ? (
    <DrawerMenu
      getContainer={null}
      level={null}
      handleChild={<i className="drawer-handle-icon" />}
      onHandleClick={() => {
        props.onCollapse(!collapsed);
      }}
      open={!collapsed}
      onMaskClick={() => {
        props.onCollapse(true);
      }}
      activeKey={activeKey}
    >
      <SiderMenu {...props} collapsed={isMobile ? false : collapsed} />
    </DrawerMenu>
  ) : (
    <SiderMenu {...props} />
  );
};

export default SiderMenuWrapper;