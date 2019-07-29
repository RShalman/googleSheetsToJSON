import fs from 'fs';

function tsvToJSON(data, options = {
  headers: true
}) {
  const d = data.replace(/\r/g, '').split('\n');
  const headers = d[0].split('\t');
  const body = d.slice(options.headers ? 1 : 0);

  let result = body.map(str => str.split('\t'));

  if (options.headers) {
    result = result.map(line => {
      return headers.reduce((acc, key, i) => {
        acc[key] = line[i];
        return acc;
      }, {});
    });
  }

  return result;
}

function writeFile(data, file) {
  fs.writeFile(
    file,
    JSON.stringify(data, null, 2),
    'utf-8',
    err =>
    void console.log(
      '\x1b[33m%s\x1b[0m',
      err || `JSON successfully generated. ${file} written`
    )
  )
}

export default {
  tsvToJSON,
  writeFile
}
