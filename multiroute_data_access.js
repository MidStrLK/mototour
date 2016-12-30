function init () {
    // Создаем модель мультимаршрута.
    var localStorageRoute = JSON.parse(localStorage.route),
        isTestData = false,
        referencePoints = (isTestData) ? [
            "Москва, Ленинский проспект",
            "Москва, Льва Толстого, 16",
            "Москва, Кремлевская набережная",
            "Москва, парк Сокольники"
        ] : localStorageRoute,
        //viaIndexes = (isTestData) ? [2] : localStorageRoute.viaIndexes,
        multiRouteModel = new ymaps.multiRouter.MultiRouteModel(
            referencePoints,{}/*,{viaIndexes: viaIndexes}*/
        ),

    buttonEditor = new ymaps.control.Button({
        data: {content: "Режим редактирования"}
    });

    buttonEditor.events.add("select", function () {
        /**
         * Включение режима редактирования.
         * В качестве опций может быть передан объект с полями:
         * addWayPoints - разрешает добавление новых путевых точек при клике на карту. Значение по умолчанию: false.
         * dragWayPoints - разрешает перетаскивание уже существующих путевых точек. Значение по умолчанию: true.
         * removeWayPoints - разрешает удаление путевых точек при двойном клике по ним. Значение по умолчанию: false.
         * dragViaPoints - разрешает перетаскивание уже существующих транзитных точек. Значение по умолчанию: true.
         * removeViaPoints - разрешает удаление транзитных точек при двойном клике по ним. Значение по умолчанию: true.
         * addMidPoints - разрешает добавление промежуточных транзитных или путевых точек посредством перетаскивания маркера, появляющегося при наведении курсора мыши на активный маршрут. Тип добавляемых точек задается опцией midPointsType. Значение по умолчанию: true
         * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/multiRouter.MultiRoute.xml#editor
         */
        multiRoute.editor.start({
            editorMidPointsType: "via",
            editorDrawOver: false,
            viaPointDraggable: true,
            viaPointVisible:true,
            addWayPoints: true,
            removeWayPoints: true
        });
    });

    buttonEditor.events.add("deselect", function () {
        // Выключение режима редактирования.
        multiRoute.editor.stop();
    });



    ymaps.modules.require([
        'MultiRouteCustomView'
    ], function (MultiRouteCustomView) {
        // Создаем экземпляр текстового отображения модели мультимаршрута.
        // см. файл custom_view.js
        new MultiRouteCustomView(multiRouteModel, multiRoute);
    });

    var searchControl = new ymaps.control.SearchControl({
        options: {
            provider: 'yandex#search'
        }
    });


    // Создаем карту с добавленной на нее кнопкой.
    var myMap = new ymaps.Map('map', {
            center: [55.750625, 37.626],
            zoom: 7,
            controls: [buttonEditor, searchControl]
        }, {
            buttonMaxWidth: 300
        });


    // Создаем на основе существующей модели мультимаршрут.
        var multiRoute = new ymaps.multiRouter.MultiRoute(multiRouteModel, {
            editorMidPointsType: "via",
            editorDrawOver: false,
            wayPointDraggable: false,
            boundsAutoApply: true
        });
    console.info('MultiRoute - ',multiRoute);
    // Добавляем мультимаршрут на карту.
    myMap.geoObjects.add(multiRoute);

}

ymaps.ready(init);
