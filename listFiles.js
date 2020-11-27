#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const startUsage = process.cpuUsage();

//Affichage des arguments / options

const argv = require('yargs')
    .scriptName('listFiles')
    .usage(
        'Affiche une liste de fichiers, triée par taille décroissant de taille\n' +
            "Les répertoires exlus avec l'option --exclude ne seront pas parcouru sauf si\n" +
            "l'option --directory est présente afin de calculer la taille réèlle des\n" +
            'répertoires',
    )
    .help()
    .option('directory', {
        alias: 'd',
        type: 'boolean',
        description: 'Affiche aussi les répertoire au lieu des fichiers seulement',
    })
    .option('n', {
        type: 'integer',
        description: 'Nombre maximum de fichiers affichés',
    })
    .option('min', {
        type: 'integer',
        description: 'Taille minimale des fichiers affichés',
        default: 0,
    })
    .option('max', {
        type: 'integer',
        description: 'Taille maximale des fichiers affichés',
    })
    .option('reverse', {
        alias: 'r',
        type: 'boolean',
        description: 'Affiche les fichiers par ordre croissant de taille',
        default: false,
    })
    .option('exclude', {
        alias: 'e',
        type: 'string',
        description: "Répertoire(s) à exclure de l'affichage",
    })
    .option('filename', {
        alias: 'f',
        type: 'string',
        description: "Nom du fichier de départ de l'analyse",
        default: process.env.PWD,
    })

    .check(start)
    .strict().argv;

//affichage taille en Giga, Mega, Kilo

function humanFileSize(size) {
    if (size > 1073741824) return (size / 1073741824).toFixed(1) + 'Gi';

    if (size > 1048576) return (size / 1048576).toFixed(1) + 'Mi';

    if (size > 1024) return (size / 1024).toFixed(1) + 'Ki';

    return size;
}

//affichage temps en secondes, minutes, millisecondes
function humanTime(time) {
    if (time > 60000000) return Math.round(time / 60000000) + ' minutes';

    if (time > 1000000) return Math.round(time / 1000000) + ' seconds';

    if (time > 1000) return Math.round(time / 1000) + ' milliseconds';

    return size + ' microseconds';
}

async function computeSize(fileObj) {
    // Ajoute la taille à l'objet
    return fs.lstat(fileObj.path).then(function (stat) {
        fileObj.size = stat.size;
        return fileObj;
    });
}

async function getFiles(dirname, directory, exclude = []) {
    return fs.readdir(dirname, { withFileTypes: true }).then((dirs) => {
        let promises = [];
        dirs.forEach((dir) => {
            if (!(exclude.includes(dir.name) || exclude.includes(dirname) || exclude.includes(path.resolve(dirname, dir.name)))) {
                let fileObj = { directory: dir.isDirectory(), path: path.resolve(dirname, dir.name), name: dir.name };
                if (dir.isDirectory()) {
                    if (directory) {
                        promises.push(computeSize(fileObj));
                    }
                    promises.push(getFiles(fileObj.path, directory, exclude));
                } else {
                    promises.push(computeSize(fileObj));
                }
            }
        });

        return Promise.all(promises);
    });
}

function flatDeep(arr) {
    //
    return arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatDeep(val) : val), []);
}

async function listFiles(directory, n, min, max, reverse, exclude, filename) {
    return getFiles(filename, directory, exclude).then((e) => {
        let files = flatDeep(e)
            .filter((file) => file.size >= min && (file.size <= max || max === -1))
            .sort((a, b) => {
                if (a.size < b.size) {
                    return reverse ? 1 : -1;
                } else if (a.size > b.size) {
                    return reverse ? -1 : 1;
                }
                return 0;
            });
        if (n > -1) {
            files = files.slice(0, n);
        }
        return files;
    });
}

function start(args) {
    // Parametres
    let directory = args.directory || true;
    let n = parseInt(args.n) >= 1 ? parseInt(args.n) : -1;
    let min = parseInt(args.min) >= 0 ? parseInt(args.min) : 0;
    let max = parseInt(args.max) >= 0 ? parseInt(args.max) : -1;
    let reverse = args.reverse || false;
    let exclude = args.exclude ? args.exclude.split(',') || [] : [];
    let filename = args.filename || './';
    listFiles(directory, n, min, max, reverse, exclude, filename).then((files) => {
        files.forEach((file) => {
            console.log(humanFileSize(file.size) + (file.directory ? ' + ' : '   ') + file.path); // Affichage
        });
        console.log("Temps d'execution : " + humanTime(process.cpuUsage(startUsage).user));
    });
    return true;
}
