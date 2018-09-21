export default {
  namespace: 'user',

  state: {
    user: [],
    selectedId: 0,
    changes: [],
    version: {},
  },

  reducers: {
    addComponent(state, action) {
      let components = state.components;

      return {
        ...state,
        components: [
          ...components,
          {
            ...action.payload,
            props: { id: action.payload.id, style: {} },
            events: {},
          },
        ],
        selectedId: action.payload.id,
        changes: [
          ...state.changes,
          {
            type: 'ADD',
            id: action.payload.id,
          },
        ],
      };
    },
    selectedComponent(state, action) {
      return {
        ...state,
        selectedId: action.payload,
      };
    },
    updateComponent(state, action) {
      const { id, key, value } = action.payload;
      let components = state.components;

      let component = components.find(o => o.id == id);
      let oldValue = '';

      if (String(key).indexOf('.') >= 0) {
        let keys = String(key).split('.');
        let temp = component;
        keys.map(item => {
          if (typeof temp[item] == 'object') {
            temp = temp[item];
          }
        });
        oldValue = temp[keys[keys.length - 1]];
        temp[keys[keys.length - 1]] = value;
      } else {
        oldValue = component[key];
        component[key] = value;
      }

      return {
        ...state,
        components,
        changes: [
          ...state.changes,
          {
            type: 'UPDATE',
            id: action.payload.id,
            key,
            newValue: value,
            oldValue,
          },
        ],
      };
    },
    deleteComponent(state, action) {
      let selectedId = action.payload;
      let components = state.components;

      let index = components.findIndex(o => o.id == selectedId);

      if (index >= 0) {
        components.splice(index, 1);
      }

      return {
        ...state,
        components,
        selectedId: 0,
      };
    },
    back(state, action) {
      let changes = state.changes;
      let components = state.components;

      var component = changes.pop();

      if (!component) {
        return state;
      }

      let index = components.findIndex(o => o.id === component.id);

      if (component.type === 'ADD') {
        components.splice(index, 1);
      } else if (component.type === 'UPDATE') {
        if (String(component.key).indexOf('.') >= 0) {
          let keys = String(component.key).split('.');
          let temp = components[index];
          keys.map(item => {
            if (typeof temp[item] == 'object') {
              temp = temp[item];
            }
          });
          temp[keys[keys.length - 1]] = component.oldValue;
        } else {
          components[index][component.key] = component.oldValue;
        }
      }

      return {
        ...state,
        components,
        selectedId: 0,
        changes,
        // backups
      };
    },
    replace(state, action) {
      return {
        ...state,
        components: action.payload.components,
        selectedId: 0,
        version: action.payload.version,
      };
    },
    reset(state, action) {
      return {
        ...state,
        components: [],
        selectedId: 0,
        version: {},
      };
    },
    update(state, action) {
      return {
        ...state,
        components: action.payload.components,
        selectedId: 0,
      };
    },
  },
};
