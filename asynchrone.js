/* eslint-disable no-undef */
/* eslint-disable no-console */
function resolveAfter2Seconds(start) {
    console.log('Initialisation de la promesse lente');
    return new Promise(resolve => {
        setTimeout(function() {
            resolve('lente');
            console.log('La promesse lente est terminée ' + temps(start));
        }, 2000);
    });
}

function resolveAfter1Second(start) {
    console.log('Initialisation de la promesse rapide');
    return new Promise(resolve => {
        setTimeout(function() {
            resolve('rapide');
            console.log('La promesse rapide est terminée ' + temps(start));
        }, 1000);
    });
}

function temps(start) {
    return Math.floor((Date.now() - start) / 1000) + ' s';
}

async function sequentialStart() {
    console.log();
    console.log('==Déroulement et traitement de la réponse séquentiel==');
    let start = Date.now();

    // 1. L'exécution atteint ce point quasi-instantanément
    const lente = await resolveAfter2Seconds(start);
    console.log('Traitement de ' + lente + ' après ' + temps(start)); // 2. cela s'exécute 2s après 1.

    const rapide = await resolveAfter1Second(start);
    console.log('Traitement de ' + rapide + ' après ' + temps(start)); // 3. cela s'exécute 3s après 1.
}

async function concurrentStart() {
    console.log();
    console.log('==Déroulement concurrentiel et traitement de la réponse séquentiel avec await==');
    let start = Date.now();

    const lente = resolveAfter2Seconds(start); // le minuteur démarre immédiatement
    const rapide = resolveAfter1Second(start); // le minuteur démarre immédiatement

    // 1. L'exécution atteint ce point quasi-instantanément
    console.log('Traitement de ' + (await lente) + ' après ' + temps(start)); // 2. s'exécute 2s après 1.
    console.log('Traitement de ' + (await rapide) + ' après ' + temps(start)); // 3. s'exécute 2s après 1., immédiatement après 2.,
    // car "rapide" est déjà résolue
}

function concurrentPromise() {
    console.log();
    console.log('==Déroulement et traitement de la réponse concurrentiel avec Promise.then()==');
    let start = Date.now();

    resolveAfter2Seconds(start).then(lente => {
        console.log('Traitement de ' + lente + ' après ' + temps(start)); // 2. s'exécute 2s après 1.
    }); // le minuteur démarre immédiatement
    resolveAfter1Second(start).then(rapide => {
        console.log('Traitement de ' + rapide + ' après ' + temps(start)); // 3. s'exécute 2s après 1., immédiatement après 2.,
    }); // le minuteur démarre immédiatement

    // 1. L'exécution atteint ce point quasi-instantanément
}

function concurrentPromiseAll() {
    console.log();
    console.log('==Déroulement concurrentiel et traitement de la réponse séquentiel avec Promise.all==');
    let start = Date.now();

    return Promise.all([resolveAfter2Seconds(start), resolveAfter1Second(start)]).then(([lente, rapide]) => {
        console.log('Traitement de ' + lente + ' après ' + temps(start)); // lente
        console.log('Traitement de ' + rapide + ' après ' + temps(start)); // rapide
    });
}

sequentialStart();
// on attend que l'étape précédente soit terminée
setTimeout(concurrentStart, 4000);
// on attend à nouveau
setTimeout(concurrentPromise, 7000);
// on attend à nouveau
setTimeout(concurrentPromiseAll, 10000); // identique à concurrentStart
