(function () {
    'use strict';

    function Routes($stateProvider) {
        $stateProvider
            .state('register', {
                url: '/login?username&token&cart&action',
                data: {pageTitle: 'Monbelly'},
                views: {
                    'content': {
                        templateUrl: '/templates/auth/login.html',
                        controllerAs: 'Access',
                        controller: 'AccessCtrl'
                    }
                },
                params: {user: null, wholesale: null}
            })
            .state('success', {
                url: '/account/success',
                data: {pageTitle: 'Monbelly'},
                views: {
                    'content': {
                        templateUrl: '/templates/auth/partials/validate_account.html'
                    }
                }
            })
            .state('validate', {
                url: '/validate/:token',
                data: {pageTitle: 'Monbelly'},
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
                    requiredLogin: true,
                    pageTitle: 'Mobbelly'
                },
                views: {
                    'content': {
                        templateUrl: '/templates/auth/dashboard.html',
                        controllerAs: 'Panel',
                        controller: 'ProfilePanelCtrl'
                    }
                }
            })
            .state('sales', {
                url: '/account/history-sales',
                data: {
                    requiredLogin: true
                },
                views: {
                    'content': {
                        templateUrl: '/templates/auth/history-sales.html',
                        controllerAs: 'Sale',
                        controller: 'PurchaseListCtrl'
                    }
                }
            })
            .state('purchase-detail', {
                url: '/account/purchase-detail/:id',
                data: {
                    requiredLogin: true
                },
                views: {
                    'content': {
                        templateUrl: '/templates/auth/purchase-detail.html',
                        controllerAs: 'Purchase',
                        controller: 'PurchaseDetailCtrl'
                    }
                }
            })
            .state('profile', {
                url: '/account/profile',
                data: {
                    requiredLogin: true,
                    pageTitle: 'Perfil - Monbelyy'
                },
                views: {
                    'content': {
                        templateUrl: '/templates/auth/account-profile.html',
                        controllerAs: 'Profile',
                        controller: 'ProfileCtrl'
                    }
                }
            })
            .state('address', {
                url: '/account/addresses',
                data: {
                    requiredLogin: true,
                    pageTitle: 'Direcciones - Monbelyy'
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
                    requiredLogin: true,
                    pageTitle: 'Direcciones - Monbelyy'
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
                    requiredLogin: true,
                    pageTitle: 'Direcciones - Monbelyy'
                },
                views: {
                    'content': {
                        templateUrl: '/templates/auth/address-new.html',
                        controllerAs: 'Address',
                        controller: 'AddressCtrl'
                    }
                }
            })
            .state('recovery-password', {
                url: '/account/recovery/password',
                data: {
                    pageTitle: 'Recuperar contrase??a - Monbelyy'
                },
                views: {
                    'content': {
                        templateUrl: '/templates/auth/recovery-password.html',
                        controllerAs: 'Recovery',
                        controller: 'RecoveryPasswordCtrl'
                    }
                }
            })
            .state('new-password', {
                url: '/account/new/password/:token',
                data: {
                    pageTitle: 'Reestablecer contrase??a - Monbelyy'
                },
                views: {
                    'content': {
                        templateUrl: '/templates/auth/recovery-password.html',
                        controllerAs: 'Recovery',
                        controller: 'RecoveryPasswordCtrl'
                    }
                }
            });
    }

    angular.module('auth.app', ['ui.router', 'auth.controllers','ngMessages'])
        .config(Routes);

    Routes.$inject = ['$stateProvider'];
})();
