(function () {
    'use strict';

    function AccessSrv($resource) {
        return $resource('#host#/api/{{apiV}}/auth/token', null, {
            'logout': {method: 'POST', url: '#host#/api/{{apiV}}/auth/revoke-token'}
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
    function BaseUrl() {
        return {
            get: function () {
                return '#host#/api/{{apiV}}/auth/';
            }
        }
    }

    function RegisterSrv($resource, BaseUrl) {
        return $resource('#host#/api/{{apiV}}/' + 'register', null, {
            'recovery': {method: 'POST', url: BaseUrl.get() + 'recovery'},
            'set': {method: 'PATCH', url: BaseUrl.get() + 'recovery/set/:token'},
            'getByToken': {method: 'GET', url: BaseUrl.get() + 'recovery/set/:token'}
        });
    }

    function UserSrv($resource, BaseUrl) {
        return $resource(BaseUrl.get() + 'users/:id', null, {
            'update': {method: 'PUT', url: BaseUrl.get() + 'users/:id'},
            'patch': {method: 'PATCH', url: BaseUrl.get() + 'users/:id'},
            'active': {method: 'PUT', url: BaseUrl.get() + 'active/:token'}
        });
    }

    function GroupSrv($resource, BaseUrl) {
        return $resource(BaseUrl.get() + 'groups/:id', null, {
            'getAll': {method: 'GET', url: BaseUrl.get() + 'groups/:id', isArray: true},
            'update': {method: 'PUT', url: BaseUrl.get() + 'groups/:id'},
            'patch': {method: 'PATCH', url: BaseUrl.get() + 'groups/:id'}
        });
    }

    function PermissionSrv($resource, BaseUrl) {
        return $resource(BaseUrl.get() + 'permissions/:id', null, {
            'getAll': {method: 'GET', url: BaseUrl.get() + 'permissions/:id', isArray: true}
        });
    }

    // service for show notifications with toasty
    function NotificationSrv(sweet) {
        return {
            success: function (msg, title) {
                sweet.show({
                    title: msg,
                    text: title,
                    type: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            },
            error: function (msg, title) {
                sweet.show({
                    title: msg,
                    text: title,
                    type: 'error',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        }
    }

    function FileSrv($resource, BaseUrl) {
        return $resource(BaseUrl.get() + 'files', null, {
            'create': {method: 'POST', url: BaseUrl.get() + 'files/create'},
            'update': {method: 'PUT', url: BaseUrl.get() + 'files/update/:pk'},
            'blockUpdate': {method: 'POST', url: BaseUrl.get() + 'files/update'},
            'delete': {method: 'POST', url: BaseUrl.get() + 'files/delete'}
        });
    }

    function HttpInterceptor($q, NotificationSrv, $rootScope) {
        return {
            // On request success
            request: function (config) {
                // console.log(config); // Contains the data about the request before it is sent.
                // config.url = config.url.replace('{{siteId}}', $rootScope.siteId);
                config.url = config.url.replace('{{apiV}}', $rootScope.apiV);
                config.url = config.url.replace('#host#', $rootScope.host);
                // Return the config or wrap it in a promise if blank.
                return config || $q.when(config);
            },

            // On request failure
            requestError: function (rejection) {
                // console.log(rejection); // Contains the data about the error on the request.
                // Return the promise rejection.
                return $q.reject(rejection);
            },

            // On response success
            response: function (response) {
                // console.log(response); // Contains the data from the response.
                // Return the response or promise.
                return response || $q.when(response);
            },

            // On response failture
            responseError: function (rejection) {
                // console.log(rejection); // Contains the data about the error.

                // net::ERR_CONNECTION_REFUSED
                if (rejection.status == -1) {
                    NotificationSrv.error('Por favor intenta de nuevo hay problemas para establecer la conexión.');
                }
                // UNAUTHORIZED
                if (rejection.status == 401) {
                    // logout the current user and delete the local storage
                    $rootScope.$emit('UNAUTHORIZED');
                }
                // FORBIDDEN
                if (rejection.status == 403) {
                    // redirect the user to forbidden page
                    $rootScope.$emit('FORBIDDEN');
                }

                if (rejection.data) {
                    // show form errors
                    if (rejection.data.form_errors) {
                        // display error messages
                        var messages, form_errors = rejection.data.form_errors;
                        for (var field in form_errors) {
                            messages = form_errors[field];
                            for (var i = 0, len = messages.length; i < len; i++) {
                                NotificationSrv.error(messages[i], field);
                            }
                        }
                    }
                    // show error messages
                    if (rejection.data.messages) {
                        var messages = rejection.data.messages;
                        for (var i = 0; i < messages.length; i++) {
                            NotificationSrv.error(messages[i]);
                        }
                    }
                }
                // 404, 500 error
                if (rejection.status == 404) {
                    $rootScope.$emit('HTTP_ERROR', {error: '404'});
                }
                if (rejection.status == 500) {
                    $rootScope.$emit('HTTP_ERROR', {error: '500'});
                }
                // Return the promise rejection.
                return $q.reject(rejection);
            }
        };
    }

    // Assign factory to module
    angular.module('auth.services', ['ngResource'])
        .factory('BaseUrl', BaseUrl)
        .factory('AccessSrv', AccessSrv)
        .factory('RegisterSrv', RegisterSrv)
        .factory('UserSrv', UserSrv)
        .factory('GroupSrv', GroupSrv)
        .factory('PermissionSrv', PermissionSrv)
        .factory('HttpInterceptor', HttpInterceptor)
        .factory('NotificationSrv', NotificationSrv)
        .factory('FileSrv', FileSrv)
        .factory('AuthorizationSrv', AuthorizationSrv)
        .factory('AuthorizationGroupSrv', AuthorizationGroupSrv);

    // Inject factory the dependencies
    BaseUrl.$inject = [];
    AccessSrv.$inject = ['$resource'];
    UserSrv.$inject = ['$resource', 'BaseUrl'];
    RegisterSrv.$inject = ['$resource', 'BaseUrl'];
    GroupSrv.$inject = ['$resource', 'BaseUrl'];
    PermissionSrv.$inject = ['$resource', 'BaseUrl'];
    HttpInterceptor.$inject = ['$q', 'NotificationSrv', '$rootScope'];
    NotificationSrv.$inject = ['sweet'];
    FileSrv.$inject = ['$resource', 'BaseUrl'];
    AuthorizationSrv.$inject = ['$localStorage', '$filter'];
    AuthorizationGroupSrv.$inject = ['$localStorage', '$filter'];
})();
