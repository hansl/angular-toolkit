#!/usr/bin/env -S TS_NODE_PROJECT=./scripts/tsconfig.json node -r ts-node/register
import {AngularProject} from '@angular/services/project/project';

const p = process.argv[2];
AngularProject.fromPath(p)
  .then((project: AngularProject) => {
    console.log('success!');
    console.log(project.config.project.name);
  })
  .catch((error: any) => {
    console.error(error);
    console.error(error.stack)
  });
