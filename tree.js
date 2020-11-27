const fs = require('fs');
const path = require('path');

function printFilename(filename, isDirectory, indent) {
    console.log(indent + (isDirectory ? '+' : ' ') + ' ' + filename);
}

function printDirFiles(dirname, indent) {
    for (let entity of fs.readdirSync(dirname, { withFileTypes: true })) {
        if (entity.isFile()) {
            printFilename(entity.name, false, indent);
        }
        if (entity.isDirectory()) {
            printFilename(entity.name, true, indent);
            printDirFiles(path.resolve(dirname, entity.name), indent + '  ');
        }
    }
}

function start(startFilename) {
    printFilename(startFilename, true, '');
    printDirFiles(startFilename, '  ');
}

if (process.argv.length < 3) {
    console.log('error');
} else {
    start(process.argv[2]);
}
