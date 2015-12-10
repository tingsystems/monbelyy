'use strict';

(function () {
    /**
     * @name Run
     * @desc Update xsrf $http headers to align with Django's defaults
     */
    function Run($http) {
        $http.defaults.headers.common['TS-TOKEN'] = 'AjFPLkeDMc5InbYZE2gbQiUtzi5F7LxHJE0sPAPb';
    }

    function Routes($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('index', {
                url: '/',
                abstract: true,
                templateUrl: '/static/app/index.html',
                controllerAs: 'home',
                controller: 'HomeCtrl'
            })
            .state('home', {
                url: '/',
                views: {
                    'content': {
                        templateUrl: '/templates/home.html',
                        controllerAs: 'home',
                        controller: 'HomeCtrl'
                    }
                }
            });
        $urlRouterProvider.otherwise('/');
    }

    angular.module('annalise', ['ui.router', 'ts.controllers'])
        .config(Routes)
        .run(Run);

    Run.$inject = ['$http'];
    Routes.$inject = ['$stateProvider', '$urlRouterProvider'];
})();
