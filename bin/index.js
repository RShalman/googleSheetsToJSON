#!/usr/bin/env node

const gsdata = require('../src/index.js');
const program = require('commander');
const config = require('../package.json');

program
  .version(config.version)
  .usage('<table-id> [filename] [options]')
  .option('-j, --json', 'Convert TSV to JSON')
  .action(function(...args) {
    const params = {
      tableId: args[0],
      file: args[1],
      options: args[2],
    };
    gsdata(params);
  });

program.parse(process.argv);
