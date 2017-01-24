'use strict';

exports.exp = saveRoute;

/* ПРОВЕРЯЕТ ЗАГРУЖЕННЫЕ И ЗАГРУЖАЕМЫЕ */
function saveRoute(callback, data,mongodb, COLLECTION){
    let func = function(err, result){
        let res = '';
        if(!err && result && result.ops) res = result.ops;


        if(data && data.route && data.route.forEach){
            let arr = [];
            data.route.forEach(function(val){
                if(val) arr.push(val);
            });
            data.route = arr;
        }

        callback(err, res);
    };

    mongodb.insertList(data, func, COLLECTION);
}
