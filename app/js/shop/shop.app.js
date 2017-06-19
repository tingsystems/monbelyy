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
            .state('shipping-address', {
                url: '/shipping/address',
                data: { pageTitle: 'Datos de envío' },
                views: {
                    'content': {
                        templateUrl: '/templates/shop/shipping.html',
                        controllerAs: 'Payment',
                        controller: 'ShippingAddressCtrl'
                    }
                }
            })
            .state('checkout', {
                url: '/shipping/checkout',
                data: { pageTitle: 'Método de pago' },
                views: {
                    'content': {
                        templateUrl: '/templates/shop/checkout.html',
                        controllerAs: 'Payment',
                        controller: 'PaymentCtrl'
                    }
                }
            })
            .state('sale', {
                url: '/history/sales',
                data: {
                    requiredLogin : true,
                    pageTitle: 'Compras - Moons'
                },
                views: {
                    'content': {
                        templateUrl: '/templates/auth/history-sales.html'
                    }
                }
            })
            .state('purchase-completed', {
                url: '/purchase/completed',
                data: { pageTitle: 'Compra completada' },
                views: {
                    'content': {
                        templateUrl: '/templates/shop/partials/purchase-completed.html',
                        controllerAs: 'Purchase',
                        controller: 'PaymentCtrl'
                    }
                }
            });

    }

    angular.module('shop.app', ['ui.router', 'shop.controllers','ngMessages'])
        .config(Routes);

    Routes.$inject = ['$stateProvider'];
})();
