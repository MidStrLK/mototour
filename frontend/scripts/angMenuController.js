
export default function(angular, mapRouteCreate){
    var app = angular.module('app', []);

    app.controller('TableController',
        function TableController($scope, $http) {

            /* Типы маршрутов для меню и сохранения */
            $scope.typelist = {
                combo: ['Запланированные', 'Фестивали', 'Завершенные'],
                conver:{
                    'Запланированные':  'plan',
                    'Фестивали':        'fest',
                    'Завершенные':      'done',
                    'plan':             'Запланированные',
                    'fest':             'Фестивали',
                    'done':             'Завершенные'
                }
            };

            /* Получить все маршруты и построить меню */
            $scope.getRoutes = function(){
                $http.get('/api/getmenu').then(function (response) {
                    if (response && typeof response === 'string') response = JSON.parse(response);
                    let data = response.data;

                    if(!data || !data.forEach) return;

                    data.sort(function(left, right){
                        let l = left.date,
                            r = right.date,
                            res = 0;

                        if(r>l){
                            res = -1;
                        }else if(r<l){
                            res = 1;
                        }

                        return res;
                    });

                    $scope.donelist = [];
                    $scope.planlist = [];
                    $scope.festlist = [];

                    data.forEach(function(val){
                        val.showdate = $scope.getTrueDate(val.date);
                        if(val.type && $scope[val.type + 'list']) $scope[val.type + 'list'].push(val);
                    });
                });
            };

            $scope.getTrueDate = function(dateUTC){
                if(!dateUTC) return '';

                let date = new Date(dateUTC),
                    year = date.getFullYear(),
                    month = date.getMonth() + 1,
                    day = date.getDate();

                if(month < 10) month = '0' + String(month);
                if(day < 10) day = '0' + String(day);

                return [day, month, year].join('.');
                //const date = dateUTC.split('T')[0].split('-');
                //return [date[2], date[1], date[0]].join('.');
            };

            /* Новый маршрут */
            $scope.newRoute = function () {
                $scope.route = {
                    id:     null,
                    name:   '',
                    text:   '',
                    date:   null,
                    type:   $scope.typelist.conver['plan']
                };

                $('#viewData').show();

                if(app && app.ymap && mapRouteCreate){
                    mapRouteCreate(app.ymap);
                }
            };

            /* Открыть маршрут */
            $scope.openRoute = function (data) {

                $scope.route = {
                    id:     data.id,
                    name:   data.name,
                    text:   data.text,
                    date:   data.date ? (new Date(data.date)) : null,
                    type:   $scope.typelist.conver[data.type]
                };

                $('#viewData').show();

                if(app && app.ymap && mapRouteCreate){
                    mapRouteCreate(app.ymap, JSON.parse(data.route), data.note, data.delay);
                }
            };

            /* Сохранить маршрут */
            $scope.saveRoute = function (data) {

                let $tablenote = $('.custom-view-table-text input'),
                    $tabledelay = $('.custom-view-table-delay input'),
                    tabledelay = [],
                    tablenote = [],
                    route = app.ymap.multiRoute.getRoute(app.ymap.multiRoute);

                if(route && route.forEach){
                    let arr = [];
                    route.forEach(function(val){
                        if(val) arr.push(val);
                    });
                    route = arr;
                }

                let res = {
                        id:     data.id || createId(),
                        date:   data.date,
                        name:   data.name,
                        type:   $scope.typelist.conver[data.type],
                        text:   data.text || null,
                        route:  JSON.stringify(route)
                    };

                $tablenote.each(function(t,a){tablenote.push($(a).val())});
                res.note = tablenote;

                $tabledelay.each(function(t,a){tabledelay.push($(a).val())});
                res.delay = tabledelay;

                $http.post('/api/save', res).then(function (result) {
                    $scope.getRoutes();

                    if(result && result.data) $scope.openRoute(result.data[0]);
                });
            };

            $scope.removeRoute = function(data){
                $http.post('/api/remove', JSON.stringify({id: data.id})).then(function(){
                    $scope.getRoutes();
                });
            };

            function createId(){
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for( var i=0; i < 10; i++ )
                    text += possible.charAt(Math.floor(Math.random() * possible.length));

                return text;
            };

            $scope.getRoutes();
        });
return app;
}
