import buttonEditor from "./mapButtons";

export default function(map, route, note, delay) {
    /* Массив с точками маршрута */
    var localStorageRoute = route || [
            "Мытищи, рождественская, 11",
            "Москва, архитектора власова, 41"
            ],

    /* Модель маршрута с точками */
        multiRouteModel = new ymaps.multiRouter.MultiRouteModel(
            localStorageRoute,{}/*,{viaIndexes: viaIndexes}*/
        ),

    /* Создаем на основе существующей модели мультимаршрут. */
        multiRoute = new ymaps.multiRouter.MultiRoute(multiRouteModel, {
            editorMidPointsType: "via",
            editorDrawOver: false,
            wayPointDraggable: false,
            boundsAutoApply: true
        }),
        editBtn = buttonEditor(map);

    ymaps.table_note = note;
    ymaps.table_delay = delay;

    if(map.multiRoute) map.geoObjects.remove(map.multiRoute);
    map.multiRoute = multiRoute;

    if(map.editBtn) map.controls.remove(map.editBtn);
    map.editBtn = editBtn;

    map.controls.add(editBtn);

    $('#viewContainer div').remove();

    ymaps.modules.require([
        'MultiRouteCustomView'
    ], function (MultiRouteCustomView) {
        // Создаем экземпляр текстового отображения модели мультимаршрута.
        // см. файл custom_view.js
        new MultiRouteCustomView(multiRouteModel, multiRoute);
    });

    // Добавляем мультимаршрут на карту.
    map.geoObjects.add(multiRoute);
}
