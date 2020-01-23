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
  let sheetsData = data
    .match(/=\s{".*};\s(var|let|const)/gi)
    .toString()
    .replace(/=\s|;|\s(var|let|const)/gi, '');

  const parseData = JSON.parse(sheetsData);
  const snapshotData = parseData.changes.topsnapshot.slice(1);
  const arrOfSnapshotElements = snapshotData.map(x => {
    // For some reason JSON.parse not always parse the furthermentioned string
    // array so that we need to check and do it once again accurately
    x[1] = typeof x[1] == 'string' ? JSON.parse(x[1]) : x[1];
    return x;
  });

  return arrOfSnapshotElements;
}

function getMetaData(arr) {
  // Each element of "topsnapshot"'s value has some kind of numeric code that
  // certainly depends on type of further data. Such element has further pattern -
  // [12345678, "some_data" OR [ elements_with_sheetID_and_name_inside]].
  // First element is that type of code that I further use while filtering. 21350203 is a code for blocks
  // with those sheetID & sheetName data
  return arr
    .filter(x => x[0] == 21350203)
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
  const arrWithSheetName = Array.isArray(O)
    ? Object.values(O[0])[0]
    : Object.values(O)[0];
  return arrWithSheetName.find(Array.isArray).find(x => typeof x == `string`);
}
