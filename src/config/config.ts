import * as fs from 'fs';
import * as path from 'path';

import {SchemaClassBuilder} from '../config/schema-class';
import {denodeify} from '../lib/denodeify';

const readFile = denodeify(fs.readFile);
const writeFile = denodeify(fs.writeFile);

const DEFAULT_CONFIG_SCHEMA_PATH = path.join(path.dirname(__filename), 'schema.json');

export class InvalidConfigError extends Error {
  constructor(err: Error) {
    super(err.message);
  }
}

export class Config {
  private _config: any;

  private constructor(private _configPath: string, private _configJson: any, private _schema: any) {
    this._config = new (SchemaClassBuilder(_schema))(_configJson);
  }

  get config(): any { return this._config; }

  save(path: string = this._configPath): Promise<void> {
    return writeFile(path, JSON.stringify(this._config, null, 2), 'utf-8');
  }

  static fromConfigPath(configPath: string): Promise<Config> {
    return Promise.all([
      readFile(configPath, 'utf-8'),
      readFile(DEFAULT_CONFIG_SCHEMA_PATH, 'utf-8')
    ]).then(([content, schema]) => [JSON.parse(content), JSON.parse(schema)])
      .catch((err: Error) => { throw new InvalidConfigError(err) })
      .then(([content, schema]) => new Config(configPath, content, schema));
  }
}
