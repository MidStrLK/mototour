
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
                    const data = response.data;

                    $scope.donelist = [];
                    $scope.planlist = [];
                    $scope.festlist = [];

                    data.forEach(function(val){
                        if(val.type && $scope[val.type + 'list']) $scope[val.type + 'list'].push(val);
                    });
                });
            };

            /* Новый маршрут */
            $scope.newRoute = function () {
                $scope.route = {
                    name: '',
                    text: '',
                    type: $scope.typelist.conver['plan']
                };

                $('#viewData').show();

                if(app && app.ymap && mapRouteCreate){
                    mapRouteCreate(app.ymap);
                }
            };

            /* Открыть маршрут */
            $scope.openRoute = function (data) {
console.info('open - ',data);
                $scope.route = {
                    _id:    data._id,
                    name:   data.name,
                    text:   data.text,
                    date:   data.date ? (new Date(data.date)) : null,
                    type:   $scope.typelist.conver[data.type]
                };

                $('#viewData').show();

                if(app && app.ymap && mapRouteCreate){
                    mapRouteCreate(app.ymap, JSON.parse(data.route), data.note);
                }
            };

            /* Сохранить маршрут */
            $scope.saveRoute = function (data) {
console.info('save - ',data);
                let $tablenote = $('.custom-view-table-text'),
                    tablenote = [],
                    route = app.ymap.multiRoute.getRoute(app.ymap.multiRoute),
                    res = {
                        _id:    data._id || null,
                        date:   data.date,
                        name:   data.name,
                        type:   $scope.typelist.conver[data.type],
                        text:   data.text || null,
                        route:  JSON.stringify(route)
                    };

                $tablenote.each(function(t,a){tablenote.push($(a).val())});
                res.note = tablenote;
console.info('save res - ',res);
                $http.post('/api/save', res).then(function () {
                    $scope.getRoutes();
                });
            };

            $scope.removeRoute = function(data){
                $http.post('/api/remove', JSON.stringify({_id: data._id})).then(function(){
                    $scope.getRoutes();
                });
            };


            $scope.getRoutes();
        });
return app;
}
