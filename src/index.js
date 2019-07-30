const fetch = require('node-fetch');
const jsdom = require('jsdom');
const utils = require('./utils.js');

const { tsvToJSON, writeFile } = utils;
const format = 'tsv';
const href = 'https://docs.google.com/spreadsheets/d';

module.exports = function gsdata(program) {
  const { tableId, file, options = {} } = program;

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

      return Promise.all(P)
        .then(res =>
          j.reduce(
            (acc, { sheetName }, i) => (
              (acc[sheetName] = options.json ? tsvToJSON(res[i]) : res[i]), acc
            ),
            {}
          )
        )
        .then(res => {
          if (file && typeof file == 'string') writeFile(res, file);
          else console.log(res);
        })
        .catch(console.error);
    })
    .catch(console.error);
};

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
