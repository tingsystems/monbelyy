/**
 * Created by fishergio on 24/03/17.
 */
(function () {
    'use strict';
    
    // service for build the base url taking the host and siteId
    function BaseUrlAuth() {
        return {
            get: function () {
                return '#host#/api/{{apiShop}}/auth/';
            }
        }
    }

    function RegisterSrv($resource, BaseUrlAuth) {
        return $resource( BaseUrlAuth.get() + 'register', null, {
            'recovery': {method: 'POST', url: BaseUrlAuth.get() + 'recovery'},
            'set': {method: 'PATCH', url: BaseUrlAuth.get() + 'recovery/set/:token'},
            'getByToken': {method: 'GET', url: BaseUrlAuth.get() + 'recovery/set/:token'}
        });
    }

    function UserSrv($resource, BaseUrlAuth) {
        return $resource(BaseUrlAuth.get() + 'users/:id', null, {
            'update': {method: 'PUT', url: BaseUrlAuth.get() + 'users/:id'},
            'patch': {method: 'PATCH', url: BaseUrlAuth.get() + 'users/:id'},
            'active': {method: 'PUT', url: BaseUrlAuth.get() + 'active/:token'}
        });
    }



    // Assign factory to module
    angular.module('auth.services', ['ngResource'])
        .factory('BaseUrlAuth', BaseUrlAuth)
        .factory('AccessSrv', AccessSrv)
        .factory('RegisterSrv', RegisterSrv)
        .factory('UserSrv', UserSrv)
        .factory('AuthorizationSrv', AuthorizationSrv)
        .factory('AuthorizationGroupSrv', AuthorizationGroupSrv);

    // Inject factory the dependencies
    BaseUrlAuth.$inject = [];
    AccessSrv.$inject = ['$resource'];
    UserSrv.$inject = ['$resource', 'BaseUrlAuth'];
    RegisterSrv.$inject = ['$resource', 'BaseUrlAuth'];
    AuthorizationSrv.$inject = ['$localStorage', '$filter'];
    AuthorizationGroupSrv.$inject = ['$localStorage', '$filter'];
})();
