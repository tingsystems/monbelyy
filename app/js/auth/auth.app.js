(function () {
    'use strict';

    function Routes($stateProvider) {
        $stateProvider
            .state('register', {
                url: '/login',
                data: { pageTitle: 'Corriente Alterna' },
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
                data: { pageTitle: 'Corriente Alterna' },
                views: {
                    'content': {
                        templateUrl: '/templates/auth/partials/validate_account.html'
                    }
                }
            })
            .state('validate', {
                url: '/validate/:token',
                data: { pageTitle: 'Corriente Alterna' },
                views: {
                    'content': {
                        templateUrl: '/templates/auth/partials/account_activated.html',
                        controllerAs: 'Validate',
                        controller: 'ValidAccountCtrl'
                    }
                }
            })
            .state('dashboard', {
                url: '/dashboard',
                data: {
                    requiredLogin : true,
                    pageTitle: 'Corriente Alterna'
                },
                views: {
                    'content': {
                        templateUrl: '/templates/auth/dashboard.html'
                    }
                }
            })
            .state('sales', {
                url: '/sales',
                data: {requiredLogin : true},
                views: {
                    'content': {
                        templateUrl: '/templates/auth/history-sales.html'
                    }
                }
            })
            .state('profile', {
                url: '/account/profile',
                data: {
                    requiredLogin : true,
                    pageTitle: 'Perfil - Corriente Alterna'
                },
                views: {
                    'content': {
                        templateUrl: '/templates/auth/account-profile.html'
                    }
                }
            })

    }

    angular.module('auth.app', ['ui.router', 'auth.controllers','ngMessages'])
        .config(Routes);

    Routes.$inject = ['$stateProvider'];
})();
