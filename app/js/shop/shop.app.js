(function () {
    'use strict';

    function Routes($stateProvider) {
        $stateProvider
            .state('shopcart', {
                url: '/shopcart',
                data: { pageTitle: 'Carrito de compras' },
                views: {
                    'content': {
                        templateUrl: '/templates/shop/shopcart.html',
                        controllerAs: 'ShopCart',
                        controller: 'ShopCartCtrl'
                    }
                }
            })
            .state('payment-method', {
                url: '/payment',
                data: { pageTitle: 'Proceso de pago' },
                views: {
                    'content': {
                        templateUrl: '/templates/shop/payment-method.html',
                        controllerAs: 'Payment',
                        controller: 'PaymentCtrl'
                    }
                }
            })
            .state('shipping', {
                url: '/shipping/address',
                data: { pageTitle: 'Proceso de envio' },
                views: {
                    'content': {
                        templateUrl: '/templates/shop/shipping-address.html',
                        controllerAs: 'Payment',
                        controller: 'PaymentCtrl'
                    }
                }
            });

    }

    angular.module('shop.app', ['ui.router', 'shop.controllers','ngMessages'])
        .config(Routes);

    Routes.$inject = ['$stateProvider'];
})();
