import {rollup} from 'rollup';
import fs from 'fs';
import path from 'path';
import {mkdirpNative} from 'mkdirp';

import chalk from 'chalk';
import resolve from '@rollup/plugin-node-resolve';
import config from './config.js';
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(import.meta.url);

const { paths} = config

const localesDir = path.join(__dirname, '..', '..', 'locale');
const files = fs.readdirSync(localesDir);
let cache;

async function build () {
  await mkdirpNative(path.join(paths.dist, 'locale'));
  console.log(chalk.cyan('Building locales...'));

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    process.stdout.write(`${chalk.green(`Output File ${i}/${files.length}: `)} ${file}`);

    // ignore utils file.
    if (/utils/.test(file)) continue;

    const input = path.join(__dirname, '..', '..', 'locale', file);
    const outputPath = path.join(paths.dist, 'locale', file);

    const bundle = await rollup({
      cache,
      input,
      external: ['VeeValidate'],
      plugins: [resolve()],
    });
    const { output } = await bundle.generate({
      format: 'esm',
      name: `__vee_validate_locale__${file}`,
    });

    fs.writeFileSync(outputPath, output[0].code);
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
  }
}

build();
