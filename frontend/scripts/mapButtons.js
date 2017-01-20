export default function(map) {
    let btn = new ymaps.control.Button({
        data: {content: "Режим редактирования"}
    });

    btn.events.add("select", function () {
        /**
         * ---------------------------------------------------------------------------------------
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
        map.multiRoute.editor.start({
            editorMidPointsType: "via",
            editorDrawOver: false,
            viaPointDraggable: true,
            viaPointVisible:true,
            addWayPoints: true,
            removeWayPoints: true
        });

    });

    btn.events.add("deselect", function () {
        // Выключение режима редактирования.
        map.multiRoute.editor.stop();
    });

    return btn;
}