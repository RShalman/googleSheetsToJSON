const fetch = require('node-fetch');
const utils = require('./utils.js');

const { tsvToJSON, writeFile } = utils;
const FORMAT = 'tsv';
const HREF = 'https://docs.google.com/spreadsheets/d';

module.exports = function gsdata(program) {
  const { tableId, file, options = {} } = program;

  return fetch(`${HREF}/${tableId}`)
    .then(res => res.text())
    .then(res => {
      const dataObj = parseDataObject(res);
      const sheetsMetaData = getMetaData(dataObj);

      const P = sheetsMetaData
        .map(x => url(tableId, x.sheetId))
        .map(url => fetch(url).then(d => d.text()));

      return Promise.all(P)
        .then(res =>
          sheetsMetaData.reduce(
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
function url(tableId, sheetId) {
  return `${HREF}/${tableId}/export?format=${FORMAT}&gid=${sheetId}`;
}

function parseDataObject(data) {
  const sheetsData = data
    .match(/=\s{".*};\s(var|let|const)/gi)
    .toString()
    .replace(/=\s|;|\s(var|let|const)/gi, '');
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
