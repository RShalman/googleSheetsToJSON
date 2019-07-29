#!/usr/bin/env node

import fetch from 'node-fetch';
import jsdom from 'jsdom';
import utils from './utils.mjs';
import config from '../package.json';
import program from 'commander';

const {
  tsvToJSON,
  writeFile
} = utils;
const format = 'tsv';
const href = 'https://docs.google.com/spreadsheets/d';

program
  .version(config.version)
  .usage(`<table-id> [filename] [options]`)
  .option('-j, --json', 'Convert TSV to JSON')
  .parse(process.argv);

export default function gsdata(program) {
  const {
    tableId,
    file,
    ...options
  } = program;

  return fetch(`${href}/${tableId}`)
    .then(res => res.text())
    .then(res => {
      const dom = new jsdom.JSDOM(res, {
        includeNodeLocations: true,
      });
      const scriptText = dom.window.document
        .getElementById('docs-editor-container')
        .nextSibling.textContent.toString();

      const jsonFromScriptText = getScriptObject(scriptText);
      const j = getMetaData(jsonFromScriptText);

      const P = j
        .map(x => url(tableId, x.sheetId, format))
        .map(url => fetch(url).then(d => d.text()));

      return Promise.all(P).then(res =>
        j.reduce(
          (acc, {
            sheetName
          }, i) => ((acc[sheetName] = options.json ? tsvToJSON(res[i]) : res[i]), acc), {}
        )
      ).then(res => {
        if (file) writeFile(res, file);
        else console.log(res);
      }).catch(err => console.log(err));
    }).catch(err => console.log(err));
}

// Example on how to export a Google sheet to various formats:
// https://gist.github.com/Spencer-Easton/78f9867a691e549c9c70
function url(tableId, sheetId, format) {
  return `${href}/${tableId}/export?format=${format}&gid=${sheetId}`;
}

function getScriptObject(scriptText) {
  const sheetsData = scriptText
    .match(/=\s{.* var/gi)
    .toString()
    .replace(/=\s|;| var/gi, '');
  return JSON.parse(sheetsData);
}

function getMetaData(obj) {
  return obj.changes.topsnapshot
    .filter(x => typeof x[1][3] == 'string')
    .map(x => ({
      sheetId: getSheetID(x[1]),
      sheetName: getSheetName(x[1]),
    }));
}

function getSheetID(arr) {
  return arr.find(x => typeof x == `string`);
}

function getSheetName(arr) {
  const O = arr.find(x => x != null && typeof x == `object`);
  return Object.values(O)[0]
    .find(Array.isArray)
    .find(x => typeof x == `string`);
}
