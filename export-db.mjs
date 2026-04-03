import { execSync } from 'child_process';
import fs from 'fs';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

console.log('Exporting database...');

try {
  const url = new URL(dbUrl);
  const host = url.hostname;
  const port = url.port || '3306';
  const username = url.username;
  const password = url.password;
  const database = url.pathname.slice(1).split('?')[0];
  
  const dumpFile = '/home/ubuntu/school-self-evaluation-backup.sql';
  
  const cmd = `mysqldump -h ${host} -P ${port} -u ${username} -p'${password}' ${database} --ssl-mode=REQUIRED > ${dumpFile}`;
  
  execSync(cmd, { stdio: 'inherit', shell: '/bin/bash' });
  
  console.log(`Database exported to: ${dumpFile}`);
  console.log(`File size: ${(fs.statSync(dumpFile).size / 1024).toFixed(2)} KB`);
} catch (error) {
  console.error('Export failed:', error.message);
  process.exit(1);
}
