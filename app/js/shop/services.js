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
                }
            });
    }

    // Assign factory to module
    angular.module('shop.services', ['ngResource'])
        .factory('BaseUrlShop', BaseUrlShop)
        .factory('CustomerSrv', CustomerSrv);

    // Inject factory the dependencies
    BaseUrlShop.$inject = [];
    CustomerSrv.$inject = ['$resource', 'BaseUrlShop'];

})();
