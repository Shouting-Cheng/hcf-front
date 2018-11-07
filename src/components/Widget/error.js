import React from 'react';
import 'styles/components/error.scss';
import errorImg from 'images/error.png';
import { Button } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';

class Error extends React.Component {
  skipTo = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: this.props.skip,
      })
    );
  };

  render() {
    return (
      <div className="error">
        <img src={errorImg} />
        <div className="error-message">
          <div className="error-title">{this.props.title}</div>
          <div className="error-text">{this.props.text}</div>
          {this.props.hasButton ? (
            <Button onClick={this.skipTo} type="primary">
              {this.props.buttonText}
            </Button>
          ) : null}
        </div>
      </div>
    );
  }
}

Error.PropTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  skip: PropTypes.string,
  buttonText: PropTypes.string,
  hasButton: PropTypes.bool,
};

Error.defaultProps = {
  title: '出错啦',
  text: '请重试操作或联系管理员:(',
  skip: '/',
  buttonText: '',
  hasButton: false,
};

export default connect()(Error);
