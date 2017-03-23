(function () {
    'use strict';

    function Routes($stateProvider) {
        $stateProvider
            .state('register', {
                url: '/login',
                views: {
                    'content': {
                        templateUrl: '/templates/auth/login.html',
                        controllerAs: 'Access',
                        controller: 'AccessCtrl'
                    }
                }
            })
            .state('success', {
                url: '/account/success',
                views: {
                    'content': {
                        templateUrl: '/templates/auth/validate_account.html'
                    }
                }
            })
            .state('validate', {
                url: '/validate/:token',
                views: {
                    'content': {
                        templateUrl: '/templates/auth/account_activated.html',
                        controllerAs: 'Validate',
                        controller: 'ValidAccountCtrl'
                    }
                }
            });

    }

    angular.module('auth.app', ['ui.router', 'auth.controllers','ngMessages'])
        .config(Routes);

    Routes.$inject = ['$stateProvider'];
})();
