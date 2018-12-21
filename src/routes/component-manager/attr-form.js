import React, { Component } from 'react';
import { connect } from 'dva';

import TableColumnAttrForm from './attr/table-column-attr-form';
import TableAttrForm from './attr/table-attr-form';
import ButtonAttrForm from './attr/button-attr-form';
import SearchFormAtrr from './attr/search-form-attr';
import FormItemAtrr from './attr/form-item-attr';
import SlideFrameAttr from './attr/slide-frame-attr';
import FormAttr from './attr/form-attr';
import RowAttr from './attr/row-attr';
import SwitchAttr from "./attr/root-attr"

import './attr-form.less';

const componentMap = {
  column: TableColumnAttrForm,
  button: ButtonAttrForm,
  table: TableAttrForm,
  'search-form': SearchFormAtrr,
  'form-item': FormItemAtrr,
  'slide-frame': SlideFrameAttr,
  form: FormAttr,
  row: RowAttr,
  "switch": SwitchAttr
};

@connect(({ components }) => ({
  components,
}))

class AttrForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() { }

  handleSubmit = () => { };

  //
  nameChange = e => {
    const {
      components: { selected },
      dispatch,
    } = this.props;
    selected.text = e.target.value;

    dispatch({
      type: 'components/updateComponent',
      payload: selected,
    });
  };

  typeChange = value => {
    const {
      components: { selected },
      dispatch,
    } = this.props;

    selected.props = selected.props || {};
    selected.props.type = value;

    dispatch({
      type: 'components/updateComponent',
      payload: selected,
    });
  };

  render() {
    const {
      components: { selectedId },
      components: { components },
    } = this.props;

    let selected = components.find(o => o.id == selectedId);

    let Atrr = componentMap[selected.type];

    return (
      <div style={{ position: 'relative' }} id="attr-form">
        {Atrr && <Atrr />}
      </div>
    );
  }
}

export default AttrForm;
// Export the wrapped component:
// export default ComponentManager;
