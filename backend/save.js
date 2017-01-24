'use strict';

exports.exp = saveRoute;

/* ПРОВЕРЯЕТ ЗАГРУЖЕННЫЕ И ЗАГРУЖАЕМЫЕ */
function saveRoute(callback, data,mongodb, COLLECTION){
    let func = function(err, result){
        let res = '';
        if(!err && result && result.ops) res = result.ops;

        callback(err, res);
    };

    mongodb.insertList(data, func, COLLECTION);
}
