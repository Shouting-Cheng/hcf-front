import React, { Component } from 'react';
import { Button, Modal, Form, Input, message, Card } from 'antd';
import service from './service';
import CustomTable from '../../components/Template/custom-table';
import moment from 'moment';
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
        en_US: englishImg,
        zh_CN: chinaImg,
      },
    };
  }

  toModuleList = record => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/setting/language/language-modules/' + record.language,
      })
    );
    // this.context.router.push("/main/language-manager/module-list/" + 1);
  };

  render() {
    const {
      languages: { languageType },
    } = this.props;
    return (
      <div>
        {languageType.map(item => (
          <Card
            key={item.id}
            hoverable
            style={{ width: 240, display: 'inline-block', marginRight: 20 }}
            onClick={() => this.toModuleList(item)}
            cover={
              <div style={{ textAlign: 'center', height: 200, marginTop: 70 }}>
                <img style={{ width: 100, height: 100 }} src={this.state.images[item.language]} />
              </div>
            }
          >
            <Card.Meta title={item.languageName} />
          </Card>
        ))}
      </div>
    );
  }
}

export default connect(({ languages }) => ({
  languages,
}))(Form.create()(LanguageManager));
