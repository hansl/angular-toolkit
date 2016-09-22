#!env node
import {AngularProject} from '../src/project/project';

const p = process.argv[2];
AngularProject.fromPath(p)
  .then((project: AngularProject) => {
    console.log('success!');
    project.config.project.version = '123';
    console.log(project.config.project.version);
  })
  .catch((error: any) => {
    console.error('Error', error);
    console.error(error.message);
    console.error(error.stack);
  });
