(function () {
    'use strict';

    // service for build the base url taking the host and siteId
    function BaseUrl() {
        return {
            get: function () {
                return '#host#/api/{{apiV}}/site/{{siteId}}/';
            },
            shop: function () {
                return '#host#/api/{{apiV}}/shop/{{siteId}}/';
            }
        }
    }

    function PostSrv($resource, BaseUrl) {
        return $resource(BaseUrl.get() + 'posts');
    }

    function PostDetailSrv($resource, BaseUrl) {
        return $resource(BaseUrl.get() + 'posts/detail/:slug');
    }

    function TaxonomySrv($resource, BaseUrl) {
        return $resource(BaseUrl.get() + 'taxonomies');
    }

    function MessageSrv($resource, BaseUrl) {
        return $resource(BaseUrl.get() + 'notifications', null, {
            'create': {method: 'POST', url: BaseUrl.get() + 'notifications/create'}
        })
    }

    function ProductSrv($resource, BaseUrl) {
        return $resource(BaseUrl.shop() + 'products', null);
    }

    function ProductDetailSrv($resource, BaseUrl) {
        return $resource(BaseUrl.shop() + 'products/detail/:slug');
    }

    // service for show notifications with toasty
    function NotificationSrv(toasty) {
        return {
            success: function (msg, title) {
                toasty.success({
                    title: !title ? 'Mensaje' : title,
                    msg: msg,
                    showClose: true,
                    clickToClose: true,
                    timeout: 5000,
                    sound: false,
                    theme: 'material'
                });
            },
            error: function (msg, title) {
                toasty.error({
                    title: !title ? 'Error' : title,
                    msg: msg,
                    showClose: true,
                    clickToClose: true,
                    timeout: 5000,
                    sound: false,
                    theme: 'material'
                });
            }
        }
    }


    // Add interceptor
    function HttpInterceptor($q, NotificationSrv, $rootScope) {
        return {
            // On request success
            request: function (config) {
                // console.log(config); // Contains the data about the request before it is sent.
                if (config.url.match('#host#/api/{{apiV}}/auth/login/tw') || '#host#/api/{{apiV}}/auth/login/fb') {
                    $rootScope.socialAuthData = config.data;
                }
                config.url = config.url.replace('{{siteId}}', $rootScope.siteId);
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
                // FORBIDDEN, UNAUTHORIZED
                if (rejection.status == 403 || rejection.status == 401) {
                    // logout the current user and delete the local storage
                    $rootScope.$emit('UNAUTHORIZED');
                }

                // 404, 500 error
                if (rejection.status == 404) {
                    $rootScope.$emit('HTTP_ERROR', {error: '404'});
                }

                // Return the promise rejection.
                return $q.reject(rejection);
            }
        };
    }

    // Assign factory to module
    angular.module('ts.services', ['ngResource'])
        .factory('BaseUrl', BaseUrl)
        .factory('PostSrv', PostSrv)
        .factory('PostDetailSrv', PostDetailSrv)
        .factory('TaxonomySrv', TaxonomySrv)
        .factory('MessageSrv', MessageSrv)
        .factory('ProductSrv', ProductSrv)
        .factory('ProductDetailSrv', ProductDetailSrv)
        .factory('NotificationSrv', NotificationSrv)
        .factory('HttpInterceptor', HttpInterceptor);

    // Inject factory the dependencies
    PostSrv.$inject = ['$resource', 'BaseUrl'];
    PostDetailSrv.$inject = ['$resource', 'BaseUrl'];
    TaxonomySrv.$inject = ['$resource', 'BaseUrl'];
    MessageSrv.$inject = ['$resource', 'BaseUrl'];
    ProductSrv.$inject = ['$resource', 'BaseUrl'];
    ProductDetailSrv.$inject = ['$resource', 'BaseUrl'];
    NotificationSrv.$inject = ['toasty'];
    HttpInterceptor.$inject = ['$q', 'NotificationSrv', '$rootScope'];
})();