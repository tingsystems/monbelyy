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
        }
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
            }
        })
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
            }
        })
    }

    // Assign factory to module
    angular.module('shop.services', ['ngResource'])
        .factory('BaseUrlShop', BaseUrlShop)
        .factory('CustomerSrv', CustomerSrv)
        .factory('CartsSrv', CartsSrv)
        .factory('OrderSrv', OrderSrv);

    // Inject factory the dependencies
    BaseUrlShop.$inject = [];
    CustomerSrv.$inject = ['$resource', 'BaseUrlShop'];
    CartsSrv.$inject = ['$resource', 'BaseUrlShop'];
    OrderSrv.$inject = ['$resource', 'BaseUrlShop'];

})();
