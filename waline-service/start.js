const path = require('path');

process.env.SQL_TYPE = 'sqlite';
process.env.SQLITE_PATH = __dirname.replace(/\\/g, '/');
process.env.SQLITE_DB = 'waline';
process.env.JWT_TOKEN = 'random_token_123'; // Replace with a secure random string in production
process.env.PORT = '8360';

console.log('Starting Waline server...');
console.log(`SQLITE_PATH: ${process.env.SQLITE_PATH}`);
console.log(`SQLITE_DB: ${process.env.SQLITE_DB}`);
console.log(`Full Path: ${path.join(process.env.SQLITE_PATH, process.env.SQLITE_DB)}`);

require('@waline/vercel/vanilla.js');
