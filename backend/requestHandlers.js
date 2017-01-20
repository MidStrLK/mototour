var fs      = require("fs"),
    index   = fs['readFileSync']('./index.html'),
    mongodb = require("./mongodb"),
    menu    = require("./menu"),
    save    = require("./save");

function submitRequest(response, handle, pathname, postData, COLLECTION) {
    console.info('pathname - ',pathname);

    if (!pathname || !response) {
        response['writeHead'](500, {'Content-Type': 'application/json', 'charset': 'utf-8'});
        response.write('Ошибка в запросе ' + pathname);
        response.end();
    } else {
        if (pathname === '/') {
            response['writeHead'](200, {'Content-Type': 'text/html; charset=utf8'});
            response.end(index);
        } else {
            var path = pathname.replace(/\//g, ''),
                func = function (err, result) {
                    var res = 0,
                        httpsc = 200;
                    if (err) {
                        res = err;
                        httpsc = 500;
                    } else {
                        if (result || result === 0) res = result;
                    }

                    response['writeHead'](httpsc, {'Content-Type': 'application/json', 'charset': 'utf-8'});
                    response.write(JSON.stringify(res));
                    response.end();
                };

            if(postData) postData = JSON.parse(postData);

            if (pathname === '/getmenu') {
                mongodb.selectList(func, COLLECTION);
                //menu.exp(func, mongodb, COLLECTION);
            }else if (pathname === '/save') {
                mongodb.insertList(postData, func, COLLECTION);
                //save.exp(func, postData, mongodb, COLLECTION, menu);
            }else if (pathname === '/remove') {
                //console.info('postData - ',postData);
                mongodb.removeId(postData._id, func, COLLECTION);
                //save.exp(func, mongodb, COLLECTION);
            }else {
                response['writeHead'](500, {'Content-Type': 'application/json', 'charset': 'utf-8'});
                response.write('Ошибка в запросе к БД ' + path);
                response.end();
            }
        }
    }
}

exports.submitRequest       = submitRequest;