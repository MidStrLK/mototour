var request     = require("request"),
    cheerio     = require('cheerio'),
    telegrambot = require('./telegrambot'),
    options     = require("../options"),
    sessionId   = null;

exports.findParameter       = findParameter;
exports.getTrOptions        = getTrOptions;
exports.submitRequest       = submitRequest;
exports.getFromSite         = getFromSite;
exports.getOptions          = getOptions;
exports.setTelegramDone     = setTelegramDone;
exports.getPeriodicInterval = getPeriodicInterval;
exports.isTestMode          = isTestMode;
//exports.getSessionId  = getSessionId;

function isTestMode(){
    return options.testMode || false;
}

function findParameter($, type, parameter, text, callback) {

    if (!parameter || !$ || typeof $ !== 'function') {
        callback(1, 'Неправильная ссылка');
        return;
    }

    var $res = $(parameter),
        res = null;

    if($res && $res instanceof Object){
        for(var key in $res) {
            if ($res.hasOwnProperty(key)) {
                var val = $res[key];

                if (type === 'magnet') {
                    if (val && val.attribs && val.attribs.href && val.attribs.href.indexOf(text) !== -1) {
                        res = val.attribs.href;
                    }
                } else if (type === 'count') {
                    if(val && val.children && val.children[0] && val.children[0].data && val.children[0].data.indexOf(text) !== -1){
                        res = parseInt(val.children[0].data.replace(/\D+/g,""));
                    }
                }else if (type === 'name') {
                    if(val && val.children && val.children[0] && val.children[0].data){
                        res = val.children[0].data;
                    }
                }
            }
        }
    }


    callback(res);
}

function getTrOptions(link) {
    var linkOptions = options.linkOptions,
        res = {};

    linkOptions.forEach(function (val) {
        if (val.alias && val.alias.forEach) {
            val.alias.forEach(function (valAlias) {
                if (link.indexOf(valAlias)) res = val;
            })
        }
    });

    return res;
}

function submitRequest(body, callback) {

    if(options.testMode && options.transmissionAnswer){
        if(callback && typeof callback === 'function'){
            callback(0, 0, JSON.stringify(options.transmissionAnswer));
        }
        return;
    }

    if (body && body instanceof Object) body = JSON.stringify(body);

    if(sessionId){
        request({
            method: 'POST',
            url: options.url,
            headers: {
                'X-Transmission-Session-Id': sessionId
            },
            body: body
        }, function (error, response, bodyk) {

            if(bodyk && typeof bodyk === 'string' && bodyk.indexOf('X-Transmission-Session-Id: ') !== -1){
                sessionId = bodyk.slice(bodyk.indexOf('X-Transmission-Session-Id: ') + 27);
                sessionId = sessionId.substr(0, sessionId.indexOf('</'));

                submitRequest(body, callback);
            }else{
                if(callback && typeof callback === 'function'){
                    callback(error, response, bodyk);
                }
            }
        });
    }else{
        request({
            method: 'POST',
            url: options.url,
            headers: {
                'X-Transmission-Session-Id': sessionId
            },
            body: '{"method": "torrent-get"}'
        }, function (error, response, bodys) {
            if(bodys && bodys.indexOf('X-Transmission-Session-Id: ') !== -1){
                sessionId = bodys.slice(bodys.indexOf('X-Transmission-Session-Id: ') + 27);
                sessionId = sessionId.substr(0, sessionId.indexOf('</'));

                submitRequest(body, callback);
            }
        });


        //submitRequest('{"method": "torrent-get"}', func)

    }


}

function getFromSite(link, type, parameter, text, callback){

    request({
        uri: link
    }, function(error, response, body) {
        var $;

        if(body) $ = cheerio.load(body);

        findParameter($, type, parameter, text, callback);
    });
}

function getOptions(name){
    var res = options;

    if(res && name && res[name]) res = res[name];

    return res;
}

function setTelegramDone(data, TELEGRAM){
    telegrambot.done(data, TELEGRAM)
}

function getPeriodicInterval(){
    return (options.periodicInterval || 60)*60*1000;
}