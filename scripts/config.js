import path from 'path';
import fs from 'fs';
import {rollup} from 'rollup';
import {filesize} from 'filesize';
import chalk from 'chalk';
import {gzipSizeSync} from 'gzip-size';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import flow from 'rollup-plugin-flow';
import pkgJson from '../package.json' assert { type: "json" };
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(import.meta.url);

const version = process.env.VERSION || pkgJson.version;

const commons = {
  banner:
    `/**
  * vee-validate v${version}
  * (c) ${new Date().getFullYear()} Abdelrahman Awad
  * @license MIT
  */`,
  outputFolder: path.join(__dirname, '..', '..', 'dist')
};

const paths = {
  dist: commons.outputFolder
};

const utils = {
  stats ({ path, code }) {
    const { size } = fs.statSync(path);
    const gzipped = gzipSizeSync(code);

    return `| Size: ${filesize(size)} | Gzip: ${filesize(gzipped)}`;
  },
  async writeBundle ({ input, output }, fileName, minify = false) {
    const bundle = await rollup(input);
    const { output: [{ code }] } = await bundle.generate(output);

    let outputPath = path.join(paths.dist, fileName);
    fs.writeFileSync(outputPath, code);
    let stats = this.stats({ code, path: outputPath });
    console.log(`${chalk.green('Output File:')} ${fileName} ${stats}`);

    return true;
  }
};

const builds = {
  umdDev: {
    input: 'src/index.js',
    format: 'umd',
    name: 'VeeValidate',
    env: 'development'
  },
  umdProd: {
    input: 'src/index.js',
    format: 'umd',
    name: 'VeeValidate',
    env: 'production'
  },
  umdMinimalDev: {
    input: 'src/index.minimal.js',
    format: 'umd',
    name: 'VeeValidate',
    env: 'development'
  },
  umdMinimalProd: {
    input: 'src/index.minimal.js',
    format: 'umd',
    name: 'VeeValidate',
    env: 'production'
  },
  esm: {
    input: 'src/index.esm.js',
    format: 'es'
  },
  esmMinimal: {
    input: 'src/index.minimal.esm.js',
    format: 'es'
  },
  rules: {
    input: 'src/rules/index.js',
    format: 'es'
  }
};

function genConfig (options) {
  const config = {
    input: {
      input: options.input,
      plugins: [
        flow({ pretty: true }),
        replace({ __VERSION__: version }),
        resolve(),
        commonjs({
          include: 'node_modules/validator/**',
        })
      ]
    },
    output: {
      banner: commons.banner,
      format: options.format,
      name: options.name
    }
  };

  if (options.env) {
    config.input.plugins.unshift(replace({
      'process.env.NODE_ENV': JSON.stringify(options.env)
    }));
  }

  return config;
};

const configs = Object.keys(builds).reduce((prev, key) => {
  prev[key] = genConfig(builds[key]);

  return prev;
}, {});

export default {
  configs,
  utils,
  paths
};
