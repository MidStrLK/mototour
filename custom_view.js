ymaps.modules.define('MultiRouteCustomView', [
    'util.defineClass'
], function (provide, defineClass) {
    // Класс простого текстового отображения модели мультимаршрута.
    function CustomView (multiRouteModel, multiRoute) {
        this.multiRouteModel = multiRouteModel;
        this.multiRoute = multiRoute;
        // Объявляем начальное состояние.
        this.state = "init";
        this.stateChangeEvent = null;
        // Элемент, в который будет выводиться текст.
        this.outputElement = $('<div></div>').appendTo('#viewContainer');

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

            console.log('state',e.get("type"));

            this.stateChangeEvent = e;
            this.rebuildOutput();
        },

        rebuildOutput: function () {
            // Берем из таблицы обработчик для текущего состояния и исполняем его.
            var processorName = CustomView.stateProcessors[this.state];
            this.outputElement.html(
                this[processorName](this.multiRouteModel, this.multiRoute, this.stateChangeEvent)
            );
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
                result = ["Данные успешно получены."],
                activeIndex = activeRoute.properties._data.index;

            if (routes.length) {
                result.push("Всего маршрутов: " + routes.length + ".");
                //for (var i = 0, l = routes.length; i < l; i++) {
                //    result.push(this.processRoute(i, routes[i]));
                //}

                result.push(this.processRoute(activeIndex, routes[activeIndex]));

            } else {
                result.push("Нет маршрутов.");
            }
            return result.join("<br/>");
        },

        processFailRequest: function (multiRouteModel, e) {
            return e.get("error").message;
        },

        activeroutechange: function(e){
            this.state = 'requestsuccess';
            this.stateChangeEvent = e;
            this.rebuildOutput();
        },

        processRoute: function (index, route) {
            // Берем из таблицы обработчик для данного типа маршрута и применяем его.
            var processorName = CustomView.routeProcessors[route.properties.get("type")];

            return (index + 1) + ". " + this[processorName](route);
        },

        processDrivingRoute: function (route) {
            var result = ["Автомобильный маршрут."];
            result.push(this.createCommonRouteOutput(route));
            result.push("Описание маршута: <ul>" + this.createMasstransitRouteOutput(route) + "</ul>");
            return result.join("<br/>");
        },

        // Метод, формирующий общую часть описания для всех типов маршрутов.
        createCommonRouteOutput: function (route) {
            return "Протяженность маршрута: " + route.properties.get("distance").text + "<br/>" +
                "Время в пути: " + route.properties.get("duration").text;
        },

        // Метод строящий список текстовых описаний для
        // всех сегментов маршрута на общественном транспорте.
        createMasstransitRouteOutput: function (route) {
            var result = [],
                alphabet = 'ABCDEFJHIJKLMNOPQRSTUVWXYZ',
                points = route.multiRoute.getWayPoints();

            this.saveRoutes(route.multiRoute);

            points[0].properties._data.name = 'СТАРТ';

            for (var i = 0, l = route.getPaths().length; i < l; i++) {
                var path = route.getPaths()[i];
                var distance = (path._json.properties.distance) ? path._json.properties.distance.text : '',
                    duration = (path._json.properties.duration) ? path._json.properties.duration.text : '';

                result.push("<li>" + alphabet[i] + '-' + alphabet[i+1] + ': ' + distance + ' - ' + duration + "</li>");

                if(points[i+1]) points[i+1].properties._data.name = distance + ' - ' + duration;

                /*for (var j = 0, k = path.getSegments().length; j < k; j++) {
                    result.push("<li>" + path.getSegments()[j].properties.get("text") + "</li>");
                }*/
            }
            return result.join("");
        },

        saveRoutes: function(multiRoute){
            var way = multiRoute.getWayPoints(),
                //via = multiRoute.getViaPoints(),
                wayArr = [];
                //viaArr = [],
                //viaIndexes = [],
                //res = {};

            if(way && way.forEach) way.forEach(function(valWay){
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

        },

        destroy: function () {
            this.outputElement.remove();
            this.multiRouteModel.events
                .remove(["requestsuccess", "requestfail", "requestsend"], this.onModelStateChange, this);
        }
    });

    provide(CustomView);
});
