#!env node
import {AngularProject} from '../src/project/project';

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
