'use strict';

/* передача на сервер функции */
exports.exp = function(callback, mongodb, COLLECTION){
    mongodb.selectList(callback, COLLECTION);
};
