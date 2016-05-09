import * as fs from 'fs';
import * as path from 'path';

import {denodeify} from '../lib/denodeify';
import {Config} from '../config/config';

const access = denodeify(fs.access);

/**
 * The path is not referring to any Project.
 */
export class ProjectRootNotFoundError extends Error {}

export const kAngularCliJsonFileName = 'angular-cli.json';

/**
 * Find the root of a project by looking for `angular-cli.json` in every ancestor
 * paths of the path passed in.
 * @private
 */
function _findProjectRoot(current: string): Promise<string> {
  if (!current || current == '/' || current == process.env['HOME']) {
    throw new ProjectRootNotFoundError;
  }

  const p = path.join(current, kAngularCliJsonFileName);
  return access(p, fs.R_OK | fs.W_OK)
    .then(() => p).catch(() => _findProjectRoot(path.dirname(current)));
}

/**
 * An Angular project.
 *
 * Projects are delimited by an `angular-cli.json`. They can include multiple apps, and
 * contain various config, packages, addons, etc.
 * The only restriction is that an `angular-cli.json` corresponds to a single project,
 * and a project can only include one `angular-cli.json`.
 */
export class AngularProject {
  constructor(private _configPath: string, private _config: Config) {}

  get config(): any { return this._config.config; }

  /**
   * Return the AngularProject that could
   * @param filePath
   * @returns {Promise<AngularProject>}
   */
  static fromPath(filePath: string): Promise<AngularProject> {
    return _findProjectRoot(filePath)
      .then((configPath: string) => {
        return Config.fromConfigPath(configPath)
          .then((config: Config) => new AngularProject(configPath, config));
      });
  }
}
