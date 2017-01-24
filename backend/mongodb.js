// default to a 'localhost' configuration:
var connection_string = '127.0.0.1:27017/motoroute';
// if OPENSHIFT env variables are present, use the available connection info:

var mongo = require('mongodb').MongoClient,
    formatDate = require('./formatdate'),
    opendb,
    openconnection = [],
    name = 'motoroute';

exports.selectList           = selectList;
exports.insertList           = insertList;


//exports.requestMDB       = requestMDB;
exports.getCollectionMDB     = collectionMongo;


exports.selectListOnce       = selectListOnce;
exports.selectListRemembered = selectListRemembered;
exports.updateMD             = updateMD;


exports.removeId = removeId;
exports.removeDB = removeDB;


/*-------------------------------------------------------------------------------------------------------------------*/

/*--- ВЫСШИЙ УРОВЕНЬ ---*/

function selectListOnce(callback, COLLECTION){
    selectDB({type: 'once'}, callback, COLLECTION)
}

function selectListRemembered(callback, COLLECTION){
    selectDB({type: 'period'}, callback, COLLECTION)
}

function insertList(data, callback, COLLECTION){
    console.info('data - ',data);
    if(data.id){
        updateDB(data.id, data, callback, COLLECTION)
    }else{
        insertDB(data, callback, COLLECTION)
    }

}

function updateMD(id, data, COLLECTION){
    updateDB(id, data, COLLECTION)
}

function selectList(callback, COLLECTION){
    selectDB(null, callback, COLLECTION)
}

function removeId(id, callback, COLLECTION){
    removeDB({id: id}, callback, COLLECTION)
}

/*--- ВЫСШИЙ УРОВЕНЬ ---*/

/*-------------------------------------------------------------------------------------------------------------------*/

/*--- СРЕДНИЙ УРОВЕНЬ ---*/

/* Вставляем данные в БД */
function insertDB(data, callback, COLLECTION){
    if(!COLLECTION && openconnection[name]) COLLECTION = openconnection[name];

    if(!COLLECTION || !COLLECTION.insert){
        collectionMongo(function(){
            insertDB(name, data);
        })
    }else{
        if(!callback) callback = function(err, result){
            if(err) console.info(formatDate.dateToLocal(), '-MDB_reply- insert - err:', err, ', result: ', (result && result.length) ? result.length : '');
        };
        COLLECTION.insert(data, callback);
    }
}

/* Заменяем данные в БД */
function updateDB(id, data, callback, COLLECTION){
    if(!COLLECTION && openconnection[name]) COLLECTION = openconnection[name];

    if(!COLLECTION || !COLLECTION.update){
        collectionMongo(function(){
            updateDB(id, data, callback);
        })
    }else{
        //COLLECTION.update({_id: _id}, data);

        removeDB({id: id},function(err, result){
            if(!err){
                insertDB(data, callback, COLLECTION)
            }else{
                console.info('err - ',err);
            }

        }, COLLECTION);
    }
}

/* Получаем данные из БД */
function selectDB(data, callback, COLLECTION){
    if(!COLLECTION && openconnection[name]) COLLECTION = openconnection[name];
    if(!COLLECTION || !COLLECTION.find){
        collectionMongo(function(){
            selectDB(data, callback);
        })
    }else {
        var cursor = COLLECTION.find(data);
        cursor.toArray(function (err, result) {
            if(err) console.info(formatDate.dateToLocal(), '-MDB_reply- select - err:', err, ', result: ', (result && result.length) ? result.length : '');
            if (callback) callback(err, result);
        });

    }
}

/* Удаление записей из БД */
function removeDB(data, callback, COLLECTION){
    if(!COLLECTION && openconnection[name]) COLLECTION = openconnection[name];

    if(!COLLECTION || !COLLECTION.remove){
        collectionMongo(function(){
            removeDB(data, callback);
        })
    }else{


        if(data.id){
            COLLECTION.remove({id: data.id}, callback)
        }else {
            COLLECTION.remove(callback)
        }
    }
}

/*--- СРЕДНИЙ УРОВЕНЬ ---*/

/*-------------------------------------------------------------------------------------------------------------------*/

/*--- НИЗКИЙ УРОВЕНЬ ---*/

/* Подсчет кол-ва записей */
function countCategory(cursor, callback){
    var res = {error: []};
    cursor.each(function(err, val){
        if(val === null){
            callback(null, res);
        }else if(!val || !val.name || !val.daykey || err){
            res.error.push(val)
        }else{
            if(!res[val.name]) res[val.name] = {};
            if(!res[val.name][val.daykey]) res[val.name][val.daykey] = 0;
            res[val.name][val.daykey]++
        }
    });

}

/* Находим БД */
function connectMongo(callback){
    mongo.connect('mongodb://'+connection_string, function(err, db) {												// connect to database server
        if(err) console.info(formatDate.dateToLocal(), '-MDB- db connect - err:', err, ', result: ', !!db);
        if(!err) {
            opendb = db;
            callback();
        }
    });
}

/* Находим нужную коллекцию */
function collectionMongo(callback){

    if(!opendb){
        connectMongo(function(){
            collectionMongo(callback);
        })
    }else{
        opendb.collection(name, function(err, collectionref) {		// ссылки на коллекции
            if(err) console.info(formatDate.dateToLocal(), '-MDB- collection connect - err:', err, ', result: ', !!collectionref);
            if(!err){
                openconnection[name] = collectionref;
                callback(collectionref);
            }
        });
    }
}

/* Отключаемся от БД */
function disconnectMongo(db){
    db.close();															// close a database connection
}

/*--- НИЗКИЙ УРОВЕНЬ ---*/
