ymaps.modules.define('MultiRouteCustomView', [
        'util.defineClass'
    ], function (provide, defineClass) {
    // Класс простого текстового отображения модели мультимаршрута.
    function CustomView(multiRouteModel, multiRoute) {

        multiRoute.getRoute = this.getRoute;

        let html =  '<div>' +
                        '<span id="custom-view-span"></span>' +
                        '<table id="custom-view-table">' +
                        '</table>' +
                    '</div>';

        this.multiRouteModel = multiRouteModel;
        this.multiRoute = multiRoute;
        // Объявляем начальное состояние.
        this.state = "init";
        this.stateChangeEvent = null;
        // Элемент, в который будет выводиться текст.
        this.outputElement = $(html).appendTo('#viewContainer');

        this.rebuildOutput();
        // Подписываемся на события модели, чтобы
        // обновлять текстовое описание мультимаршрута.
        multiRouteModel.events
            .add(["requestsuccess", "requestfail", "requestsend", "activeroutechange"], this.onModelStateChange, this);

        multiRoute.events
            .add(["activeroutechange"], this.activeroutechange, this);
    }

    // Таблица соответствия идентификатора состояния имени его обработчика.
    CustomView.stateProcessors = {
        init: "processInit",
        requestsend: "processRequestSend",
        requestsuccess: "processSuccessRequest",
        requestfail: "processFailRequest"
    };

    // Таблица соответствия типа маршрута имени его обработчика.
    CustomView.routeProcessors = {
        "driving": "processDrivingRoute"
    };

    defineClass(CustomView, {
        // Обработчик событий модели.
        onModelStateChange: function (e) {
            // Запоминаем состояние модели и перестраиваем текстовое описание.
            this.state = e.get("type");

            this.stateChangeEvent = e;
            this.rebuildOutput();
        },

        rebuildOutput: function () {
            // Берем из таблицы обработчик для текущего состояния и исполняем его.
            let processorName = CustomView.stateProcessors[this.state],
                htmlData = this[processorName](this.multiRouteModel, this.multiRoute, this.stateChangeEvent);

            this.outputElement.find('#custom-view-span').html(htmlData.label);
            this.outputElement.find('#custom-view-table').html(htmlData.table);

        },

        processInit: function () {
            return "Инициализация ...";
        },

        processRequestSend: function () {
            return "Запрос данных ...";
        },

        processSuccessRequest: function (multiRouteModel, multiRoute, e) {
            var routes = multiRouteModel.getRoutes(),
                activeRoute = multiRoute.getActiveRoute(),
                result,// = ["Данные успешно получены."],
                activeIndex = activeRoute.properties._data.index;

            if (routes.length) {
                //result.push("Всего маршрутов: " + routes.length + ".");
                //result.push(this.processRoute(activeIndex, routes[activeIndex]));
                result = this.processRoute(activeIndex, routes[activeIndex]);

            } else {
                result = "Нет маршрутов.";
            }
            return result;
        },

        processFailRequest: function (multiRouteModel, e) {
            return e.get("error").message;
        },

        activeroutechange: function (e) {
            this.state = 'requestsuccess';
            this.stateChangeEvent = e;
            this.rebuildOutput();
        },

        processRoute: function (index, route) {
            // Берем из таблицы обработчик для данного типа маршрута и применяем его.
            var processorName = CustomView.routeProcessors[route.properties.get("type")];

            return this[processorName](route);
        },

        processDrivingRoute: function (route) {
            return {
                label: this.createCommonRouteOutput(route),
                table: this.createMasstransitRouteOutput(route)
            };

            /*var result = ["Автомобильный маршрут."];
            result.push(this.createCommonRouteOutput(route));
            result.push("Описание маршута: <ul>" + this.createMasstransitRouteOutput(route) + "</ul>");
            return result.join("<br/>");*/
        },

        // Метод, формирующий общую часть описания для всех типов маршрутов.
        createCommonRouteOutput: function (route) {
            return "Маршрут: <strong>" + route.properties.get("distance").text +
                "</strong>  Время: <strong>" + route.properties.get("duration").text + "</strong>";
        },

        createTableRow: function(path, i, distance, duration, calc, bg){
            var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                durationArr = duration.split(' '),
                res = '<tr class="one_day_' + bg + '">' +
                    '<td class="custom-view-table-number">' + (i + 1) + '</td>' +
                    '<td class="custom-view-table-alphabet">' + alphabet[i] + ' 一 ' + alphabet[i + 1] + '</td>' +
                    '<td class="custom-view-table-distance">' + distance + '</td>' +
                    '<td class="custom-view-table-duration-hour">' + (durationArr[1] ? durationArr[0] : '') + '</td>' +
                    '<td class="custom-view-table-duration-minute">' + (durationArr[1] ? durationArr[1] : durationArr[0]) + '</td>' +
                    '<td class="custom-view-table-calc">' + calc + '</td>' +
                    '<td class="custom-view-table-delay"><input ng-model="route.tabledelay_' + i + '"';

            if(ymaps.table_delay && ymaps.table_delay[i]) res += ' value="' + ymaps.table_delay[i] + '"';

            res += '></td><td class="custom-view-table-text"><input ng-model="route.tabletext_' + i + '"';

            if(ymaps.table_note && ymaps.table_note[i]) res += ' value="' + ymaps.table_note[i] + '"';

            res += '></td></tr>';

            return res;
        },

        durationCalculate: function(time, durationValue){

            var begin = this.createShowTime(time),
                end   = this.createShowTime(time + durationValue);

            return begin + ' - ' + end;
        },

        createShowTime: function(time){
            var inMinutes = Math.round(time/60),
                minutes = inMinutes%60,
                showMinutes = Math.round(minutes/10)*10,
                hours = (inMinutes - minutes)/60;

            if(hours > 23) hours = hours - 24;

            if(showMinutes <10) showMinutes = '0' + showMinutes;
            if(hours <10) hours = '&nbsp;' + hours;

            return hours + '<sup>' + showMinutes + '</sup>';
        },

        // Метод строящий список текстовых описаний для
        // всех сегментов маршрута на общественном транспорте.
        createMasstransitRouteOutput: function (route) {
            var result = [],
                points = route.multiRoute.getPoints(),
                time = 9*60*60,
                background = 0;

            ymaps.myMultiRoute = route.multiRoute;

            //this.saveRoutes(route.multiRoute);

            points[0].properties._data.name = 'СТАРТ';

            for (var i = 0, l = route.getPaths().length; i < l; i++) {
                var path = route.getPaths()[i],
                    distance =      (path._json.properties.distance) ? path._json.properties.distance.text : '',
                    duration =      (path._json.properties.duration) ? path._json.properties.duration.text : '',
                    durationValue = ((path._json.properties.duration) ? path._json.properties.duration.value : 0),
                    durationCalc = this.durationCalculate(time, durationValue),
                    delay = (ymaps.table_delay && ymaps.table_delay[i]) ? ymaps.table_delay[i] : 0;

                result.push(this.createTableRow(path, i, distance, duration, durationCalc, background));

                if(isFinite(delay)){
                    time = time +  durationValue + delay*60*60;
                }else{
                    time = 9*60*60;
                    if(background === 0){
                        background = 1;
                    }else{
                        background = 0;
                    }
                }

                if(time > 24*60*60) time = time - 24*60*60;



                if (points[i + 1]) points[i + 1].properties._data.name = distance + ' - ' + duration;
            }
            return result.join("");
        },

        /*saveRoutes: function (multiRoute) {
            var way = multiRoute.getWayPoints(),
            //via = multiRoute.getViaPoints(),
                wayArr = [];
            //viaArr = [],
            //viaIndexes = [],
            //res = {};

            if (way && way.forEach) way.forEach(function (valWay) {
                wayArr.push(valWay._referencePoint);
            });
            //if(via && via.forEach) via.forEach(function(valVia, keyVia){
            //    viaArr.push(valVia._referencePoint);
            //    viaIndexes.push(keyVia)
            //});

            //res = {
            //    referencePoints: viaArr.concat(wayArr),
            //    viaIndexes: viaIndexes
            //};

            localStorage.route = JSON.stringify(wayArr);

        },*/

        getRoute: function (/*multiRoute*/) {
            let way = ymaps.myMultiRoute.getPoints(),
                wayArr = [];

            if (way && way.forEach) way.forEach(function (valWay) {
                wayArr.push(valWay._referencePoint);
            });

            return wayArr;
        },

        destroy: function () {
            this.outputElement.remove();
            this.multiRouteModel.events
                .remove(["requestsuccess", "requestfail", "requestsend"], this.onModelStateChange, this);
        }
    });

    provide(CustomView);
});
