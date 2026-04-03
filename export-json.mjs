import mysql from 'mysql2/promise';
import fs from 'fs';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const url = new URL(dbUrl);
const connection = await mysql.createConnection({
  host: url.hostname,
  port: parseInt(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1).split('?')[0],
  ssl: { rejectUnauthorized: false }
});

console.log('Connected to database...');

const tables = ['domains', 'criteria', 'indicators', 'evidence', 'users'];
const data = {};

for (const table of tables) {
  try {
    const [rows] = await connection.execute(`SELECT * FROM \`${table}\``);
    data[table] = rows;
    console.log(`✓ ${table}: ${rows.length} rows`);
  } catch (err) {
    console.log(`✗ ${table}: ${err.message}`);
    data[table] = [];
  }
}

await connection.end();

const outputFile = '/home/ubuntu/school-self-evaluation-backup.json';
fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf8');

console.log(`\nJSON exported to: ${outputFile}`);
console.log(`File size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);
