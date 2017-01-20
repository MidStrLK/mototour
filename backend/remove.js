var mongodb  = require("../mongo/mongodb");

/* передача на сервер функции */
exports.exp = remove;

/* УДАЛИТЬ ЗАПИСЬ ИЗ БАЗЫ С ИД */
function remove(id, callback, COLLECTION){
    mongodb.removeDB(id, callback, COLLECTION)
}