import {NgToolkitError} from '../lib/error';

export class InvalidSchema extends NgToolkitError {}
export class InvalidPropertyAccess extends NgToolkitError {}

interface PropertyMetaData {
  config: any;  // The actual JSON object.
  proto: any;  // The prototype on which we're applying the property.
  name: string;  // The name of the property.
  path: string[];  // A path to the property.
  root: any;  // The root prototype.
  rootSchema: any;  // The original root schema.
  schema: any;  // The section schema related to this property.
}


/**
 * Get a value from the config metadata, based on its path.
 * @returns {any}
 * @private
 */
function _getValue(metaData: PropertyMetaData): any {
  let returnValue: any = metaData.config;
  for (const key of metaData.path) {
    if (key in returnValue) {
      returnValue = returnValue[key];
    } else {
      if ('default' in metaData.schema) {
        returnValue = metaData.schema['default'];
      } else {
        return undefined;
      }
    }
  }
  return returnValue;
}


/**
 * Set a value in the config, and the dirty flag if the value differs..
 * @private
 */
function _setValue(metaData: PropertyMetaData, value: any): void {
  const {schema} = metaData;
  let parentObject: any = metaData.config;
  for (const key of metaData.path.slice(0, -1)) {
    if (key in parentObject) {
      parentObject = parentObject[key];
    } else {
      if ((typeof schema == 'object') && ('default' in schema)) {
        parentObject = schema['default'];
      } else {
        throw new InvalidPropertyAccess();
      }
    }
  }
  parentObject[metaData.path[metaData.path.length -1]] = value;
}


function _defineProperty(metaData: PropertyMetaData, options: any): void {
  const {proto, name, schema} = metaData;

  if ((typeof schema == 'object') && schema['readOnly']) {
    Object.defineProperty(proto, name, {
      enumerable: true,
      get: options.get
    });
  } else {
    Object.defineProperty(proto, name, {
      enumerable: true,
      get: options.get,
      set: options.set
    });
  }
}


function _setPrimitiveProperty<T>(metaData: PropertyMetaData) {
  _defineProperty(metaData, {
    get(): T { return _getValue(metaData); },
    set(value: T) { _setValue(metaData, value); }
  });
}

function _setConstraintPrimitiveProperty<T>(metaData: PropertyMetaData,
                                            constraintFn: (_: T) => T) {
  _defineProperty(metaData, {
    get(): T { return _getValue(metaData); },
    set(value: T) { _setValue(metaData, constraintFn(value)); }
  });
}

function _setTypedProperty<T>(metaData: PropertyMetaData, type: Constructor) {
  _defineProperty(metaData, {
    get(): T { return new type(_getValue(metaData)); },
    set(value: T) { _setValue(metaData, value.toString()); }
  });
}

function _setProperty(metaData: PropertyMetaData) {
  const {schema} = metaData;
  const type = (typeof schema == 'string') ? schema : schema['type'];
  switch(type) {
    case 'object': _setObjectProperty(metaData); break;
    case 'string': _setPrimitiveProperty(metaData); break;
    case 'boolean': _setPrimitiveProperty(metaData); break;
    case 'integer': _setConstraintPrimitiveProperty(metaData, (x) => Math.floor(x)); break;
    case 'number': _setPrimitiveProperty(metaData); break;

    case 'version': _setTypedProperty(metaData, function(x) => {
        return version
      });
      break;
  }
}

function _setProperties(metaData: PropertyMetaData, proto: any) {
  const {schema} = metaData;
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

function _setObjectProperty(metaData: PropertyMetaData): void {
  const {name, schema, proto} = metaData;
  if (schema['type'] != 'object') {
    throw new InvalidSchema();
  }

  const newObject = {};
  Object.defineProperty(proto, name, {
    enumerable: true,
    get: function() {
      return newObject;
    }
  });

  _setProperties(metaData, newObject);

  if (!schema['additionalProperties']) {
    Object.freeze(newObject);
  }
}


export function SchemaClassBuilder(schema: any): any {
  const SchemaClass = function(config: any) {
    _setProperties({
      config: config,
      proto: SchemaClass.prototype,
      name: null,
      path: [],
      root: SchemaClass.prototype,
      rootSchema: schema,
      schema
    }, SchemaClass.prototype);
  };

  return SchemaClass;
}
