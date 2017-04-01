(function () {
    'use strict';

    function AccessSrv($resource) {
        return $resource('#host#/api/{{apiShop}}/auth/token', null, {
            'logout': {method: 'POST', url: '#host#/api/{{apiShop}}/auth/revoke-token'}
        });
    }

    function AuthorizationSrv($localStorage, $filter) {
        var auth = {};

        // check if the user is authorized, returns true or false
        auth.authorize = function (permissions) {
            var author = $localStorage.appData.user;
            if (author.is_superuser)return true;
            // if the user does not have permissions return false
            if (author.permissions == undefined)return false;
            if (!author.permissions.length)return false;
            var hasPermission = false;

            // check if the user has the required permissions
            for (var x = 0; x < permissions.length; x++) {
                // get ui view permissions
                var permission = permissions[x];
                for (var y = 0; y < permission.list.length; y++) {
                    // get the required permission codename
                    var required_perm = permission.list[y];
                    // search the required permission in the author permissions
                    var perm_exists = $filter('filter')(author.permissions, {codename: required_perm})[0];
                    // if all permissions are required
                    if (permission.kind == 'AND') {
                        if (!perm_exists) {
                            hasPermission = false;
                            break
                        } else {
                            hasPermission = true;
                        }
                    }
                    // if at least one permission is required
                    if (permission.kind == 'OR') {
                        if (perm_exists) {
                            hasPermission = true;
                            break
                        }
                    }
                }
            }
            return hasPermission;
        };

        return auth;
    }

    function AuthorizationGroupSrv($localStorage, $filter) {
        var auth = {};

        // check if the user is authorized, returns true or false
        auth.authorize = function (permissions) {
            var author = $localStorage.appData.user;
            if (author.is_superuser)return true;
            // if the user does not have permissions return false
            if (author.groups == undefined)return false;
            if (!author.groups.length)return false;
            var hasPermission = false;

            // check if the user has the required permissions
            for (var x = 0; x < permissions.length; x++) {
                // get ui view permissions
                var permission = permissions[x];
                for (var y = 0; y < permission.list.length; y++) {
                    // get the required permission codename
                    var required_perm = permission.list[y];
                    // search the required permission in the author permissions
                    var perm_exists = $filter('filter')(author.groups, {name: required_perm})[0];
                    // if all permissions are required
                    if (permission.kind == 'AND') {
                        if (!perm_exists) {
                            hasPermission = false;
                            break
                        } else {
                            hasPermission = true;
                        }
                    }
                    // if at least one permission is required
                    if (permission.kind == 'OR') {
                        if (perm_exists) {
                            hasPermission = true;
                            break
                        }
                    }
                }
            }
            return hasPermission;
        };

        return auth;
    }

    // service for build the base url taking the host and siteId
    function BaseUrlAuth() {
        return {
            get: function () {
                return '#host#/api/{{apiShop}}/auth/';
            },
            shop: function () {
                return '#host#/api/{{apiShop}}/'
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

    function AddressSrv($resource, BaseUrlAuth) {
        return $resource(BaseUrlAuth.shop() + 'address/:id',
            null, {
                'update': {
                    method: 'PUT',
                    url: BaseUrlAuth.shop() + 'address/:id'
                },
                'patch': {
                    method: 'PATCH',
                    url: BaseUrlAuth.shop() + 'address/:id'
                }
            });
    }



    // Assign factory to module
    angular.module('auth.services', ['ngResource'])
        .factory('BaseUrlAuth', BaseUrlAuth)
        .factory('AccessSrv', AccessSrv)
        .factory('RegisterSrv', RegisterSrv)
        .factory('UserSrv', UserSrv)
        .factory('AuthorizationSrv', AuthorizationSrv)
        .factory('AuthorizationGroupSrv', AuthorizationGroupSrv)
        .factory('AddressSrv', AddressSrv);

    // Inject factory the dependencies
    BaseUrlAuth.$inject = [];
    AccessSrv.$inject = ['$resource'];
    UserSrv.$inject = ['$resource', 'BaseUrlAuth'];
    RegisterSrv.$inject = ['$resource', 'BaseUrlAuth'];
    AuthorizationSrv.$inject = ['$localStorage', '$filter'];
    AuthorizationGroupSrv.$inject = ['$localStorage', '$filter'];
    AddressSrv.$inject = ['$resource', 'BaseUrlAuth'];
})();
