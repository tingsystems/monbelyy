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
                url: '/account/dashboard',
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
                url: '/account/sales',
                data: {
                    requiredLogin : true
                },
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
            .state('address', {
                url: '/account/addresses',
                data: {
                    requiredLogin : true,
                    pageTitle: 'Direcciones - Corriente Alterna'
                },
                views: {
                    'content': {
                        templateUrl: '/templates/auth/addresses.html',
                        controllerAs: 'Address',
                        controller: 'AddressListCtrl'
                    }
                }
            })
            .state('address-add', {
                url: '/account/address',
                data: {
                    requiredLogin : true,
                    pageTitle: 'Direcciones - Corriente Alterna'
                },
                views: {
                    'content': {
                        templateUrl: '/templates/auth/address-new.html',
                        controllerAs: 'Address',
                        controller: 'AddressCtrl'
                    }
                }
            })
            .state('address-update', {
                url: '/account/address/update/:id',
                data: {
                    requiredLogin : true,
                    pageTitle: 'Direcciones - Corriente Alterna'
                },
                views: {
                    'content': {
                        templateUrl: '/templates/auth/address-new.html',
                        controllerAs: 'Address',
                        controller: 'AddressCtrl'
                    }
                }
            })

    }

    angular.module('auth.app', ['ui.router', 'auth.controllers','ngMessages'])
        .config(Routes);

    Routes.$inject = ['$stateProvider'];
})();
