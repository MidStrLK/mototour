var utils     = require('./utils'),
    mongodb   = require("../mongo/mongodb");

/* передача на сервер функции */
exports.exp   = check;
exports.runCheck = checkInterval;

/* ПРОВЕРЯЕТ ЗАГРУЖЕННЫЕ И ЗАГРУЖАЕМЫЕ */
function check(callback, COLLECTION, isBot, TELEGRAM, isRemove){
    console.info('isRemove - ',isRemove);
    var func = function(actualArr, doneArr, periodicArr){

        var res = '';

        if(isBot){
            //var arr = siteArr.concat(doneArr);

            actualArr.forEach(function(val){
                res += '\n ' + val.name + ' ' + val.status + ' '  + (val.percent || '');
            })

        }else{

            var bot = !!(TELEGRAM && TELEGRAM.messageChatId);

            res = {
                actual:     actualArr,
                done:       doneArr.reverse(),
                periodic:   periodicArr.reverse(),
                telegram:   bot
            }
        }

        if(callback && typeof callback === 'function') callback(0, res);
    };

    checkOnce(func, COLLECTION, isRemove);
}

function checkInterval(COLLECTION, TELEGRAM){
    var interval = setInterval(function(){
        var func = function(actualArr, doneArr, periodicArr, removeArr){
            if(removeArr && removeArr instanceof Array && removeArr.length){
                removeArr.forEach(function(val){
                    sendDoneMessage(val, TELEGRAM);
                })
            }

            if((!actualArr || !actualArr.length) && (doneArr && doneArr instanceof Array && !doneArr.length)){
                clearInterval(interval)
            }
        };

        checkOnce(func, COLLECTION, true);
    }, 10*1000);

    return interval;
}

function sendDoneMessage(data, TELEGRAM){
    utils.setTelegramDone(data, TELEGRAM);
}

/* ПРОВЕРЯЕТ ЗАГРУЖЕННЫЕ И ЗАГРУЖАЕМЫЕ */
/* -> checkTorrents -> checkCallback*/
function checkOnce(callback, COLLECTION, isRemove){
    var body = JSON.stringify({
        "method": "torrent-get",
        "arguments": {
            "fields": [
                "percentDone",
                "id",
                "error",
                "doneDate",
                "name",
                "status",
                "errorString",
                "eta",
                "downloadDir"
            ]
        }
    });

    utils.submitRequest(body, function(error, response, body){
        checkCallback(body, callback, COLLECTION, isRemove)
    });
}

/* ПРОВЕРЯЕТ ДАННЫЕ - ЕСТЬ ЛИ АКТИВНЫЕ ИЛИ НЕТ  */
/* checkDoneTr || getResponceList */
function checkCallback(body, callback, COLLECTION, isRemove){
    if(body && typeof body === 'string') body = JSON.parse(body);

    // Есть ли актуальные  файлы
    if(body && body.arguments && body.arguments['torrents'] && body.arguments['torrents'].forEach){
        checkDoneTr(body.arguments['torrents'], callback, COLLECTION, isRemove);
    }else{
        getResponceList(null, callback, COLLECTION)
    }
}

/* ПРОВЕРЯЕТ, НАДО ЛИ УДАЛЯТЬ ЗАВЕРШЕННЫЕ
 * НАДО - СОХРАНИМ В БАЗУ
 * getResponceList || submitRequest(remove),  setMD -> getResponceList */
function checkDoneTr(data, callback, COLLECTION, isRemove){
    var ids = getRemoveIds(data);
console.info('remove - ',ids);
    if(isRemove && ids && ids.length && ids.forEach){
    // Удаляем
        var removeBody = JSON.stringify({
            method: "torrent-remove",
            arguments: {
                ids: ids
            }
        }),
            func = function(){
                getResponceList(data, callback, COLLECTION);
            };

        mongodb.insertList(getRemoveList(data), func, COLLECTION);

        utils.submitRequest(removeBody);
    }else{
    // Нечего удалять
        getResponceList(data, callback);
    }
}

/* ГОТОВИТ ДАННЫЕ ДЛЯ ОТПРАВКИ ОБРАТНО */
/* getActualList, getMD -> manageResponceList */
function getResponceList(data, callback, COLLECTION){
    // data - актуальные, возможно удаленные файлы

    var actual = getActualList(data),    // Еще актуальные
        remove  = getRemoveList(data);    // Окончившиеся
    mongodb.selectListOnce(function(errO, resultO){
        mongodb.selectListRemembered(function(errR, resultR){
            manageResponceList(actual, remove, resultO, resultR, callback)
        }, COLLECTION)
    }, COLLECTION)
}

/* КОМБИНИРУЕТ ДАННЫЕ ДЛЯ ПОКАЗА И ОТПРАВЛЯЕТ ОБРАТНО */
function manageResponceList(actualArr, removeArr, doneArr, periodicArr, callback){

    if(!actualArr || !(actualArr instanceof Array)) actualArr = [];
    if(!doneArr || !(doneArr instanceof Array)) doneArr = [];
    if(!periodicArr || !(periodicArr instanceof Array)) periodicArr = [];

    callback(actualArr, doneArr, periodicArr, removeArr);
}

function getRemoveIds(data){
    var res = [];
    data.forEach(function(val){
        if(val['doneDate'] && val['status'] > 5){
            res.push(val.id);
        }
    });
    return res;
}

function getActualList(data){
    var res = [],
        statuscode = {
            0:  'Stop',
            2:  'Check',
            4:  'Download',
            6:  'Check sid',
            8:  'Siding',
            16: 'Pause'
        };

    if(data && data.forEach) {
        data.forEach(function (val) {
            if (!val['doneDate'] && val['status'] < 5) {
                res.push({
                    date: val['doneDate'] || '',
                    name: val['name'] || '',
                    percent: (val['percentDone'] * 100).toFixed(2),
                    status: statuscode[val['status']] || '',
                    type: 'once',
                    directory: val['downloadDir'] || ''
                });
            }
        });
    }

    return res;
}

function getRemoveList(data){
    var res = [];

    data.forEach(function(val){
        if(val['doneDate'] && val['status'] > 5) {
            res.push({
                date:       val['doneDate'] || '',
                name:       val['name'] || '',
                status:     'Done',
                type:       'once',
                directory:  val['downloadDir'] || ''
            });
        }
    });

    return res;
}
