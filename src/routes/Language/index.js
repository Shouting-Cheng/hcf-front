import React, { Component } from 'react';
import { Form, Card } from 'antd';

import chinaImg from '../../assets/china.png';
import englishImg from '../../assets/english.png';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';

class LanguageManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      languages: [],
      images: {
        en_us: englishImg,
        zh_cn: chinaImg,
      },
    };
  }

  toModuleList = record => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/setting/language/language-modules/' + record.code,
      })
    );
  };

  render() {
    const {
      languages: { languageType },
    } = this.props;
    return (
      <div>
        {languageType.map(item => (
          <Card
            key={item.code}
            hoverable
            style={{ width: 240, display: 'inline-block', marginRight: 20 }}
            onClick={() => this.toModuleList(item)}
            cover={
              <div style={{ textAlign: 'center', height: 200, marginTop: 70 }}>
                <img style={{ width: 100, height: 100 }} src={this.state.images[item.code]} />
              </div>
            }
          >
            <Card.Meta title={item.value} />
          </Card>
        ))}
      </div>
    );
  }
}

export default connect(({ languages }) => ({
  languages,
}))(Form.create()(LanguageManager));
