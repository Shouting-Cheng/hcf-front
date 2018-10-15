import React from 'react';
import { Drawer } from 'antd';

class SlideFrame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount() {
    if (this.props.getRef) {
      this.props.getRef(this);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible != this.props.visible) {
      this.setState({ visible: nextProps.visible });
    }
  }

  onClose = () => {
    this.setState({ visible: false }, () => {
      this.props.close && this.props.close();
    });
  };

  show = values => {
    this.setState({ visible: true }, () => {
      this.props.onShow && this.props.onShow(values);
    });
  };

  close = () => {
    this.setState({ visible: false }, () => {
      this.props.onClose && this.props.onClose();
    });
  };

  render() {
    const { title, width = '50vw' } = this.props;
    const { visible } = this.state;

    return (
      <div>
        <Drawer
          title={this.$t(title)}
          placement="right"
          onClose={this.onClose}
          visible={visible}
          width={width}
        >
          {this.props.children}
        </Drawer>
      </div>
    );
  }
}

export default SlideFrame;
