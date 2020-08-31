/**
 * Created by fishergio on 24/03/17.
 */
(function () {
    'use strict';

    // service for build the base url taking the host and siteId
    function BaseUrlShop() {
        return {
            get: function () {
                return '#host#/api/{{apiShop}}/';
            }
        };
    }

    function CustomerSrv($resource, BaseUrlShop) {
        return $resource(BaseUrlShop.get() + 'customers/:id',
            null, {
                'update': {
                    method: 'PUT',
                    url: BaseUrlShop.get() + 'customers/:id'
                },
                'patch': {
                    method: 'PATCH',
                    url: BaseUrlShop.get() + 'customers/:id'
                },
                'customerByUser': {
                    method: 'GET',
                    url: BaseUrlShop.get() + 'customer/user/:id'
                }
            });
    }

    function CartsSrv($resource, BaseUrlShop) {
        return $resource(BaseUrlShop.get() + 'carts/:id', null, {
            'update': {
                method: 'PUT',
                url: BaseUrlShop.get() + 'carts/:id'
            },
            'patch': {
                method: 'PATCH',
                url: BaseUrlShop.get() + 'carts/:id'
            },
            'cartPublic': {
                method: 'GET',
                url: BaseUrlShop.get() + 'public/cart/:id'
            }
        });
    }

    function ShipmentSrv($resource, BaseUrlShop) {
        return $resource(BaseUrlShop.get() + 'utils/', null, {
            'quote': {
                method: 'POST',
                url: BaseUrlShop.get() + 'utils/shipments/quote'
            },
            'purchase': {
                method: 'POST',
                url: BaseUrlShop.get() + 'utils/shipments/purchase'
            }
        });
    }

    function OrderSrv($resource, BaseUrlShop) {
        return $resource(BaseUrlShop.get() + 'orders/:id', null, {
            'update': {
                method: 'PUT',
                url: BaseUrlShop.get() + 'orders/:id'
            },
            'patch': {
                method: 'PATCH',
                url: BaseUrlShop.get() + 'orders/:id'
            },
            'paidMP': {
                method: 'POST',
                url: BaseUrlShop.get() + 'mp/paid'
            },
            'paidPaypal': {
                method: 'POST',
                url: BaseUrlShop.get() + 'paypal/paid'
            },
            'paidCHMP': {
                method: 'POST',
                url: BaseUrlShop.get() + 'platforms/mp/validate'
            }
        });
    }

    function ValidCouponSrv($resource, BaseUrlShop) {
        return $resource(BaseUrlShop.get() + 'valid/coupon/:id', null, {});

    }

    function PriceListSrv($resource, BaseUrlShop) {
        return $resource(BaseUrlShop.get() + 'item/price/lists/:id',
            null, {
                'customer': {
                    method: 'GET',
                    url: BaseUrlShop.get() + 'item/price/lists/:id',
                    isArray: true
                }
            });

    }

    function NotificationTakiSrv($resource, BaseUrlShop) {
        return $resource(BaseUrlShop.get() + 'notifications/:id', null, {});
    }

    function HistoryOrdersSrv($resource, BaseUrlShop) {
        return $resource(BaseUrlShop.get() + 'history/orders/:id', null, {
            'update': {
                method: 'PUT',
                url: BaseUrlShop.get() + 'history/orders/:id'
            },
            'patch': {
                method: 'PATCH',
                url: BaseUrlShop.get() + 'history/orders/:id'
            }
        });
    }


    // Assign factory to module
    angular.module('shop.services', ['ngResource'])
        .factory('BaseUrlShop', BaseUrlShop)
        .factory('CustomerSrv', CustomerSrv)
        .factory('CartsSrv', CartsSrv)
        .factory('OrderSrv', OrderSrv)
        .factory('ValidCouponSrv', ValidCouponSrv)
        .factory('PriceListSrv', PriceListSrv)
        .factory('NotificationTakiSrv', NotificationTakiSrv)
        .factory('ShipmentSrv', ShipmentSrv)
        .factory('HistoryOrdersSrv', HistoryOrdersSrv);

    // Inject factory the dependencies
    BaseUrlShop.$inject = [];
    CustomerSrv.$inject = ['$resource', 'BaseUrlShop'];
    CartsSrv.$inject = ['$resource', 'BaseUrlShop'];
    OrderSrv.$inject = ['$resource', 'BaseUrlShop'];
    ValidCouponSrv.$inject = ['$resource', 'BaseUrlShop'];
    PriceListSrv.$inject = ['$resource', 'BaseUrlShop'];
    NotificationTakiSrv.$inject = ['$resource', 'BaseUrlShop'];
    ShipmentSrv.$inject = ['$resource', 'BaseUrlShop'];
    HistoryOrdersSrv.$inject = ['$resource', 'BaseUrlShop'];

})();
