const fetch = require('node-fetch');
const log = require('loglevel');
const path = require('path');
const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const format = 'tsv'; // Format you'd like to parse. `tsv` or `csv`
const ID = '';
const tableUrl = `https://docs.google.com/spreadsheets/d/${ID}`;

checkIfPageExists(tableUrl)
  .then(notExist => {
    notExist ? exceptionError() : fetchTableAndCreateJSONs();
  })
  .catch(err => log.warn(err));

const exceptionError = () => {
  throw `--- WARNING! ID (currently - ${ID}) SHOULD NOT be empty and 'tableURL' (currently - ${tableUrl}) SHOULD lead to existing table ---`;
};

function checkIfPageExists(url) {
  return fetch(url)
    .then(res => res.text())
    .then(res => res.match(/errorMessage/gi));
}

function fetchTableAndCreateJSONs() {
  fetch(tableUrl)
    .then(res => res.text())
    .then(res => {
      const dom = new JSDOM(res, { includeNodeLocations: true });
      let scriptText = dom.window.document
        .getElementById('docs-editor-container')
        .nextSibling.textContent.toString();

      const jsonFromScriptText = getScriptObject(scriptText);
      const jsonWithIDandName = getIDandNameFromObject(jsonFromScriptText);

      for (let i = 0; i < jsonWithIDandName.length; i++) {
        fetch(sheetUrlForExport(jsonWithIDandName[i].sheetId))
          .then(res => res.text())
          .then(res => {
            const r = convertToJSON(res);
            wFile({ data: r }, `./${jsonWithIDandName[i].sheetName}.json`);
          });
      }
    });
}

const sheetUrlForExport = sheetId =>
  `https://docs.google.com/spreadsheets/d/${ID}/export?format=${format}&ID=${ID}
&gID=${sheetId}`.toString();

function getScriptObject(scriptText) {
  let sheetsData = scriptText
    .match(/=\s{.* var/gi)
    .toString()
    .replace(/=\s|;| var/gi, '');
  return JSON.parse(sheetsData);
}

function getIDandNameFromObject(obj) {
  const resultObj = obj.changes.topsnapshot
    .filter(x => {
      if (typeof x[1][3] == 'string') return x;
    })
    .map(x => ({
      sheetId: getSheetID(x[1]),
      sheetName: getSheetName(x[1]),
    }));

  return resultObj;
}

function getSheetID(arr) {
  let sheetID;
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] == `string`) sheetID = arr[i];
  }
  return sheetID;
}

function getSheetName(arr) {
  let chapterName;
  const objectWithName = arr.find(x => {
    if (typeof x == `object`) return x;
  });

  const key = Object.keys(objectWithName)[0];
  const objectWithNameValues = objectWithName[key];
  const arrWithNameFromObject = objectWithNameValues.find(x =>
    Array.isArray(x)
  );
  chapterName = arrWithNameFromObject.find(x => {
    if (typeof x == `string`) return x;
  });

  return chapterName;
}

// General utils for obj manipulation
//  Converts TSV/CSV to JSON
const convertToJSON = data => {
  const d = data.replace(/\r/g, '').split('\n');
  const headers = d[0].split('\t');
  const mainBody = d.slice(1);

  let result = mainBody.map(str =>
    str.split('\t').reduce((acc, x, i) => {
      if (x == '') {
        return acc;
      }

      return Object.assign(acc, {
        [headers[i]]: x,
      });
    }, {})
  );

  return result;
};

// Create / overwrite json
const wFile = (data, pathToFile) =>
  fs.writeFile(
    path.resolve(__dirname, pathToFile),
    JSON.stringify(data, null, 2),
    'utf-8',
    function(err) {
      // eslint-disable-next-line no-console
      err ? console.log(err) : console.log('JSON successfully generated!');
    }
  );
