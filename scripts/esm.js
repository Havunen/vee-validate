import chalk from 'chalk';
import {mkdirpNative} from 'mkdirp';
import config from './config.js';
const {configs, paths, utils} = config

async function build () {
  await mkdirpNative(paths.dist);
  console.log(chalk.cyan('Generating esm build...'));
  await utils.writeBundle(configs.esm, 'vee-validate.esm.js');
  await utils.writeBundle(configs.esmMinimal, 'vee-validate.minimal.esm.js');
  await utils.writeBundle(configs.rules, 'rules.esm.js');
}

build();
