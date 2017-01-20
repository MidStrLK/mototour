//import mapMultiroute from './scripts/mapMultiroute';
import mapRouteCreate from './scripts/mapRouteCreate';
import mapCreate from './scripts/mapCreate';
import angular from 'angular';
import './scripts/mapCustomView';
import menu from './scripts/angMenuController';
import './style.scss';

let app = menu(angular, mapRouteCreate);

ymaps.ready(function(){

    app.ymap = mapCreate();

});


