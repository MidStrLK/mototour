'use strict';

let mongodb = require("./mongodb");

exports.exp = saveRoute;

/* ПРОВЕРЯЕТ ЗАГРУЖЕННЫЕ И ЗАГРУЖАЕМЫЕ */
function saveRoute(callback, data, COLLECTION){
    console.info('data - ',data);

    mongodb.insertList(data, callback, COLLECTION);
}
