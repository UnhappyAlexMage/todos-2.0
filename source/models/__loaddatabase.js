import { join } from 'node:path';
import { readFileSync } from 'node:fs';

import { currentDir } from '../utility.js';
import { writeFile } from 'node:fs/promises';

const dataFileName = join(currentDir, 'data', 'todos.json');

const dataFile = readFileSync(dataFileName, 'utf-8');
const database = JSON.parse(dataFile);
export { database };

export function saveDatabase() {
    const s = JSON.stringify(database);
    writeFile(dataFileName, s, 'utf-8');
}

export function getObjectId() {
    const timestamp = (new Date().getTime() / 1000 | 0).toLocaleString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
        return (Math.random() * 16 | 0 ).toString(16);
    }).toLowerCase();
}