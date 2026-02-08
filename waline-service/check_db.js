const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'waline.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.each("SELECT sql FROM sqlite_master WHERE type='table' AND name='wl_Comment'", (err, row) => {
    if (err) {
      console.error(err.message);
    }
    console.log(row.sql);
  });
});

db.close();
