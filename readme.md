# Google Spreadsheets fetcher for node.js & CLI

Lightweight & easy-to-use library to get Google Spreadsheets with Node.js or command-line.

- works ONLY with [shared spreadsheets](https://support.google.com/docs/answer/2494822?hl=en&ref_topic=4671185) (don't be confused with 'Publish to Web')
- easy to start using: simple API gives just neccessary options
- Can be used inside your app via Node.js
- Or CLI when JSON file with sheets data is all you need

## Installation

### For CLI (command-line)

```bash
npm install -g sheets-to-json
```

### For Node.js

```bash
npm install --save sheets-to-json
```

## Before start

You need to get **table-Id** from spreadsheets you want to obtain:

- Go to the page with your spreadsheet
- Check if spreadsheet is [shared and availiable by link](https://support.google.com/docs/answer/2494822?hl=en&ref_topic=4671185)
- How to find ID => **https://docs.google.com/spreadsheets/d/ `**\*\*\*\***\*YOUR**_ID_**GOES\_\_\_HERE\*\***\*\*\*\*\*`\*\* - highlighted is table ID

## Usage

### CLI

```bash
$ gsdata --help
Usage: gsdata <table-id> [filename] [options]

Options:
  -V, --version  output the version number
  -j, --json     Convert TSV to JSON
  -h, --help     output usage information
```

**Notes**

- `table-id` is required. By calling `gsdata 'your-id-goes-here'` result will be printed directly in CLI
- `filename` is optional. Type the `path/to/your/file.json` after `table-id` and result will be written as JSON file.
- Right now `options` consists only of `-j` or `--json`. Can be used instead of or after `filename` - converts obtained sheets' data from TSV to JSON (see **Examples**)

### Node.js

```javascript
import gsdata from 'sheets-to-json';

gsdata({
  // ID from spreadsheet; required.
  tableId: 'your-table-id-goes-here',
  // If you want to save result as file - type in path; optional.
  file: 'path/to/your/data.json',
  // If you want parsed sheet(-s) to be converted from TSV to JSON use this option; optional.
  options: {
    json: true,
  },
});
```

**Notes**

- `tableId` is required. By calling

```javascript
gsdata({ tableId: 'your-table-id-goes-here' });
```

result will be printed in console.

- `filename` is optional.

```javascript
gsdata({
  tableId: 'your-table-id-goes-here',
  file: 'path/to/your/data.json',
});
```

result will be written as JSON file.

- Right now `options` consists only of

```javascript
options: {
  json: true;
}
```

Can be used instead of or after `file`

```javascript
gsdata({
  tableId: 'your-table-id-goes-here',
  options: {
    json: true,
  },
});
```

to convert obtained sheets' data from TSV to JSON (see **Examples**)

### Examples

#### Get JSON with plain TSV data printed into console:

CLI:

```bash
$ gsdata 5G9YfhYY******
```

Node.js:

```javascript
gsdata({ tableId: '5G9YfhYY******' });
```

**+ data converted from TSV to JSON:**
CLI:

```bash
$ gsdata 5G9YfhYY****** -j
```

Node.js:

```javascript
gsdata({
  tableId: '5G9YfhYY******',
  options: {
    json: true,
  },
});
```

#### Write JSON with plain TSV data into file:

CLI:

```bash
$ gsdata 5G9YfhYY****** path/to/file.json
```

Node.js:

```javascript
gsdata({
  tableId: '5G9YfhYY******',
  file: 'path/to/file.json',
});
```

**+ data converted from TSV to JSON:**
CLI:

```bash
$ gsdata 5G9YfhYY****** path/to/file.json -j
```

Node.js:

```javascript
gsdata({
  tableId: '5G9YfhYY******',
  file: 'path/to/file.json',
  options: {
    json: true,
  },
});
```

## Features

- This library is inteneded to work ONLY with [shared spreadsheets](https://support.google.com/docs/answer/2494822?hl=en&ref_topic=4671185) - it doesn't use any side APIs or packages to fetch data, just plain request as if you did in your browser.
- It doesn't need any sort of authentication so you don't have to waste your time doing all those side actions. Great for collaboration teams.
- It's an exporting tool ONLY (can't write anything back to your spreadsheet).
- ... but it's open for new features! [Contact me](mailto:romanshalman@gmail.com) or [send pull request](https://github.com/RShalman/sheets-to-json/pulls) if you have something to bring in.

## Author

Roman Shalman

## License

GNU General Public License v3.0, see LICENSE
