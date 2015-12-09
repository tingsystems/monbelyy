'use strict';

(function () {
    angular.module('hq', ['ui.router', 'app.controllers'])
        .config(Routes)
        .run(Run);

    Run.$inject = ['$http'];
    Routes.$inject = ['$stateProvider', '$urlRouterProvider'];
    /**
     * @name Run
     * @desc Update xsrf $http headers to align with Django's defaults
     */
    function Run($http) {
        $http.defaults.xsrfHeaderName = 'X-CSRFToken';
        $http.defaults.xsrfCookieName = 'csrftoken';
    }

    function Routes($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('index', {
                url: '/',
                abstract: true,
                templateUrl: '/static/app/index.html',
                controllerAs: 'home',
                controller: 'HomeCtrl'
            });
        $urlRouterProvider.otherwise('/');
    }
})();
