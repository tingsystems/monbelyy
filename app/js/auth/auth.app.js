(function () {
    'use strict';

    function Routes($stateProvider) {
        $stateProvider
            .state('login', {
                url: 'auth/login',
                templateUrl: '/templates/auth/login.html',
                controllerAs: 'Register',
                controller: 'RegisterCtrl'
            })
    }

    angular.module('auth.app', ['ui.router', 'auth.controllers'])
        .config(Routes);

    Routes.$inject = ['$stateProvider'];
})();
