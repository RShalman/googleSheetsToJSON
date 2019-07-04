## Install

```bash
npm i
```

## Usage

1. In `App/googleSheetsToJSON.js` put your google sheets's ID into appropriate variable (\_How to find ID => https://docs.google.com/spreadsheets/d/ `*********YOUR___ID___GOES___HERE*********`\_ - highlighted is table ID). After that save file.

2. ```bash
    #run script
    npm run data
   ```

**NOTE!**

- As a result of running this script, it creates separate **_'named-as-sheets-in-your-table'_** JSONs and put it into `App/` folder (by default).
- This script **ONLY** works with google sheet tables that are availiable by link (you can check this [FAQ](https://support.google.com/docs/answer/2494822?hl=en&ref_topic=4671185) to learn how to share your tables by link). Any private table won't be downloaded and you will get an error when you try. As a benefit of that script, however, you're not obliged to login via your google account to fetch data.
