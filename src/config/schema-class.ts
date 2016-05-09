export class InvalidSchema extends Error {}

interface PropertyMetaData {
  config: any;  //
  proto: any;  // The prototype on which we're applying the property.
  name: string;  // The name of the property.
  path: string[];  // A path to the property.
  parentProto: any;  // The parent prototype, or null if root.
  readOnly: boolean;  // Whether the property is readonly or not.
  root: any;  // The root prototype.
  rootSchema: any;  // The original root schema.
  schema: any;  // The section schema related to this property.
}

function _resolveValue(metaData: PropertyMetaData) {
  let returnValue: any = metaData.config;
  for (const key of metaData.path) {
    returnValue = returnValue[key];
  }
  return returnValue;
}

function _setStringProperty(metaData: PropertyMetaData) {
  const {proto, name, schema} = metaData;
  Object.defineProperty(proto, name, {
    get: function() {
      return _resolveValue(metaData);
    },
    set: function(value: any) {
      this._config[name] = value;
    }
  })
}

function _setProperty(metaData: PropertyMetaData) {
  const {schema} = metaData;
  switch(schema['type']) {
    case 'object': _setObjectProperty(metaData); break;
    case 'string': _setStringProperty(metaData); break;
  }
}

function _setObjectProperty(metaData: PropertyMetaData, isRoot: boolean = false): void {
  const {name, schema} = metaData;
  let {proto} = metaData;
  if (schema['type'] != 'object') {
    throw new InvalidSchema();
  }

  if (!isRoot) {
    proto = proto[name] = {
      _config: metaData.root._config
    };
  }
  for (const name of Object.keys(schema['properties'])) {
    const metaDataCopy = Object.assign({}, metaData);

    metaDataCopy.proto = proto;
    metaDataCopy.schema = schema['properties'][name];
    metaDataCopy.name = name;
    metaDataCopy.parentProto = metaData.proto;
    metaDataCopy.path = [...metaData.path, name];

    _setProperty(metaDataCopy);
  }
}


export function SchemaClassBuilder(schema: any): any {
  const SchemaClass = function(config: any) {
    this._config = config;

    _setObjectProperty({
      config: this._config,
      proto: SchemaClass.prototype,
      name: null,
      path: [],
      parentProto: null,
      readOnly: false,
      root: SchemaClass.prototype,
      rootSchema: schema,
      schema
    }, true);
  };

  return SchemaClass;
}
