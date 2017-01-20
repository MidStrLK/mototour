//import buttonEditor from "./mapButtons";

export default function(route) {
    /* Поиск на карте */
    var searchControl = new ymaps.control.SearchControl({
            options: {
                provider: 'yandex#search'
            }
        }),

    /* Создаем карту с добавленной на нее кнопкой и поиском */
        myMap = new ymaps.Map('map', {
            center: [55.750625, 37.626],
            zoom: 7,
            controls: [searchControl]
        }, {
            buttonMaxWidth: 300
        });

    /* Добавляем модуль построения и рассчета */
    /*ymaps.modules.require([
        'MultiRouteCustomView'
    ]);*/

    return myMap;

}
