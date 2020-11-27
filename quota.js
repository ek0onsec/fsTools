#!/usr/bin/env node

const fs = require('fs').promises;
const cliProgress = require('cli-progress');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
    .command(
        '[options]',
        "Calcul le quota utilisé par le compte de l'utilisateur courant ou du répertoire précisé par l'option -d. Une barre de progression s'affichera par défaut.",
        (yargs) => {
            yargs;
        },
        (argv) => {
            // ???
        },
    )
    .option('size', {
        alias: 's',
        type: 'number',
        default: 5000,
        description: 'Quota maximum en Mo',
    })
    .option('quiet', {
        alias: 'q',
        type: 'boolean',
        default: false,
        description: 'Supprime la barre de progession',
    })
    .option('dir', {
        alias: 'd',
        type: 'string',
        default: process.env.HOME,
        description: 'Répertoire de départ du quota',
    }).argv;

const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

let quota = 0;

function humanFileSize(size) {
    if (size > 1073741824) return (size / 1073741824).toFixed(1) + 'Gi';

    if (size > 1048576) return (size / 1048576).toFixed(1) + 'Mi';

    if (size > 1024) return (size / 1024).toFixed(1) + 'Ki';

    return size;
}

function humanTime(time) {
    if (time > 60000000) return Math.round(time / 60000000) + ' minutes';

    if (time > 1000000) return Math.round(time / 1000000) + ' seconds';

    if (time > 1000) return Math.round(time / 1000) + ' milliseconds';

    return size + ' microseconds';
}

async function computeSize(dirname, dirent) {
    if (dirent.isFile()) {
        return fs
            .lstat(`${dirname}/${dirent.name}`)
            .then((stats) => {
                quota += stats.size;
                if (!argv.quiet) bar.update(quota);
            })
            .catch((error) => console.log(error.message));
    } else if (dirent.isDirectory()) {
        return computeDirectorySize(`${dirname}/${dirent.name}`);
    }
}

function computeDirectorySize(dirname) {
    return fs
        .readdir(dirname, { withFileTypes: true })
        .then((files) => Promise.all(files.map((file) => computeSize(dirname, file))))
        .catch((error) => console.log(error.message));
}

function start(startDirname) {
    const startUsage = process.cpuUsage();
    if (!argv.quiet) bar.start(argv.size * 1048576, 0);
    computeDirectorySize(startDirname)
        .then(() => {
            if (!argv.quiet) bar.stop();
            console.log(`Size     : ${humanFileSize(quota)} bytes`);
            console.log(`CPU Usage: ${humanTime(process.cpuUsage(startUsage).user)}`);
        })
        .catch((error) => console.log(error.message));
}

start(argv.dir);
