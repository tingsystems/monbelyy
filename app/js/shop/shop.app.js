(function () {
    'use strict';

    function Routes($stateProvider) {
        $stateProvider
            .state('shopcart', {
                url: '/shopcart?id',
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
                url: '/shipping/address?intent',
                data: { pageTitle: 'Datos de envío' },
                views: {
                    'content': {
                        templateUrl: '/templates/shop/shipping.html',
                        controllerAs: 'Payment',
                        controller: 'ShippingAddressCtrl'
                    }
                }
            })

            .state('thanks', {
                url: '/thanks?kind',
                data: { pageTitle: 'Gracias' },
                params: {
                    kind: null
                },
                views: {
                    'content': {
                        templateUrl: '/templates/shop/thanks.html',
                        controllerAs: 'Thanks',
                        controller: 'PurchaseCompletedCtrl'
                    }
                }
            })

            .state('checkout', {
                url: '/shipping/checkout?shipping',
                data: { pageTitle: 'Método de pago' },
                params: {
                    shipping: null
                },
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
                    pageTitle: 'Compras - Calzalia - Venta de calzado'
                },
                views: {
                    'content': {
                        templateUrl: '/templates/auth/history-sales.html'
                    }
                }
            })
            .state('purchase-completed', {
                url: '/purchase/completed/:orderId',
                data: { pageTitle: 'Compra completada' },
                views: {
                    'content': {
                        templateUrl: '/templates/shop/partials/purchase-completed.html',
                        controllerAs: 'Purchase',
                        controller: 'PurchaseCompletedCtrl'
                    }
                }
            })
            .state('paypal-success', {
                url: '/paypal/success?paymentId&token&PayerID',
                data: {pageTitle: 'Comprar'},
                views: {
                    'content': {
                        templateUrl: '/templates/shop/partials/paypal-success.html',
                        controllerAs: 'Payment',
                        controller: 'PaymentCtrl'
                    }
                }
            })
            .state('paypal-cancel', {
                url: '/paypal/cancel?token',
                data: {pageTitle: 'Comprar'},
                views: {
                    'content': {
                        templateUrl: '/templates/shop/partials/paypal-cancel.html',
                        controllerAs: 'Payment',
                        controller: 'PaymentCtrl'
                    }
                }
            })
            .state('shopcartRetrive', {
                url: '/shopcart/:id',
                data: { pageTitle: 'Carrito de compras' },
                views: {
                    'content': {
                        templateUrl: '/templates/shop/shopcart.html',
                        controllerAs: 'ShopCart',
                        controller: 'ShopCartCtrl'
                    }
                }
            })
            .state('mp-cancel', {
                url: '/mp/failure?collection_id&collection_status&external_reference&payment_type&merchant_order_id&preference_id&site_id&processing_mode&merchant_account_id',
                data: {pageTitle: 'Estado de tu compra'},
                views: {
                    'content': {
                        templateUrl: '/templates/shop/partials/mp-handler.html',
                        controllerAs: 'Mercado',
                        controller: 'MercadoPagoHandlerCtrl'
                    }
                }
            })
            .state('mp-pending', {
                url: '/mp/pending?collection_id&collection_status&external_reference&payment_type&merchant_order_id&preference_id&site_id&processing_mode&merchant_account_id',
                data: {pageTitle: 'Estado de tu compra'},
                views: {
                    'content': {
                        templateUrl: '/templates/shop/partials/mp-handler.html',
                        controllerAs: 'Mercado',
                        controller: 'MercadoPagoHandlerCtrl'
                    }
                }
            })
            .state('mp-success', {
                url: '/mp/success?collection_id&collection_status&external_reference&payment_type&merchant_order_id&preference_id&site_id&processing_mode&merchant_account_id',
                data: {pageTitle: 'Estado de tu compra'},
                views: {
                    'content': {
                        templateUrl: '/templates/shop/partials/mp-handler.html',
                        controllerAs: 'Mercado',
                        controller: 'MercadoPagoHandlerCtrl'
                    }
                }
            })
            .state('order-pending', {
                url: '/order/pending?external_reference',
                data: {pageTitle: 'Estado de tu compra'},
                views: {
                    'content': {
                        templateUrl: '/templates/shop/partials/mp-handler.html',
                        controllerAs: 'Mercado',
                        controller: 'MercadoPagoHandlerCtrl'
                    }
                }
            })
            .state('payment-cancel', {
                url: '/order/cancel?external_reference',
                data: {pageTitle: 'Estado de tu compra'},
                views: {
                    'content': {
                        templateUrl: '/templates/shop/partials/mp-handler.html',
                        controllerAs: 'Mercado',
                        controller: 'MercadoPagoHandlerCtrl'
                    }
                }
            })
            .state('stripe-cancel', {
                url: 'stripe/cancel?session',
                data: {pageTitle: 'Estado de tu compra'},
                views: {
                    'content': {
                        templateUrl: '/templates/shop/partials/mp-handler.html',
                        controllerAs: 'Mercado',
                        controller: 'MercadoPagoHandlerCtrl'
                    }
                }
            })
            .state('stripe-payment', {
                url: 'stripe?key',
                data: {pageTitle: 'Pago con Stripe'},
                views: {
                    'content': {
                        templateUrl: '/templates/shop/partials/mp-handler.html',
                        controllerAs: 'Mercado',
                        controller: 'MercadoPagoHandlerCtrl'
                    }
                }
            });

    }

    angular.module('shop.app', ['ui.router', 'shop.controllers','ngMessages'])
        .config(Routes);

    Routes.$inject = ['$stateProvider'];
})();
