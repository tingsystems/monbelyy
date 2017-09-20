(function () {
    'use strict';

    // service for build the base url taking the host
    function BaseUrl() {
        return {
            get: function () {
                return '#hostAnnalise#/api/{{apiV}}/';
            },
            shop: function(){
                return '#host#/api/{{apiShop}}/public/'
            }

        };
    }

    function urlAttachment() {
        return {
            get: function () {
                return  '#host#/api/v1/';
            }
        };
    }

    function EntrySrv($resource, BaseUrl) {
        return $resource(BaseUrl.get() + 'posts/:slug', null, {});
    }

    function ProductSrv($resource, BaseUrl) {
        return $resource(BaseUrl.shop() + 'items/:slug', null, {});
    }

    function ProductTaxonomySrv($resource, BaseUrl) {
        return $resource(BaseUrl.shop() + 'taxonomies/:slug', null, {});
    }

    function TaxonomySrv($resource, BaseUrl) {
        return $resource(BaseUrl.get() + 'taxonomies/:slug');
    }
    // service for show notifications with toasty
    function NotificationSrv(SweetAlert, $filter) {
        return {
            success: function (title, msg) {
                SweetAlert.swal({
                    title: !title ? 'Mensaje' : title,
                    text: msg,
                    type: "success",
                    timer: 2000,
                    showConfirmButton: false
                });
            },
            error: function (title, msg) {
                SweetAlert.swal({
                    title: !title ? 'Mensaje' : title,
                    text: msg,
                    type: "error",
                    timer: 2500,
                    showConfirmButton: false
                });
            }

        };
    }
    function MessageSrv($resource, BaseUrl) {
        return $resource(BaseUrl.get() + 'notifications/:id', null, {});
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
                config.url = config.url.replace('{{apiShop}}', $rootScope.apiShop);
                config.url = config.url.replace('#host#', $rootScope.host);
                config.url = config.url.replace('#hostAnnalise#', $rootScope.hostAnnalise);
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
                    $rootScope.$emit('HTTP_ERROR', { error: '404' });
                }

                // Return the promise rejection.
                return $q.reject(rejection);
            }
        };
    }

    function AttachmentCmsSrv($resource, urlAttachment) {
        return $resource(urlAttachment.get() + 'attachments/:id', null, {
            'update': { method: 'PUT', url: urlAttachment.get() + 'attachments/:id' },
            'patch': { method: 'PATCH', url: urlAttachment.get() + 'attachments/:id' }
        });
    }

    // get all the states
    function StateSrv($resource) {
        var BaseUrl = 'http://geo.tingsystems.com/api/v1/';
        return $resource(BaseUrl + 'states', null, {
            // get cities, if state param get city by state id, returns an Array
            'getCities': { method: 'GET', url: BaseUrl + 'cities', isArray: true },
            // get cities, if state param get city by state id, returns an object
            'getCitiesObj': { method: 'GET', url: BaseUrl + 'cities' },
            'getState': { method: 'GET', url: BaseUrl + 'states/:id' },
            'getCity': { method: 'GET', url: BaseUrl + 'cities/:id' }
        });
    }
    // access control
    function AccessSrv($resource) {
        return $resource('#host#/{{apiV}}/auth/login', null, {
            'logout': { method: 'POST', url: '#host#/api/{{apiV}}/auth/logout' }
        });
    }
    //error services
    function ErrorSrv(NotificationSrv) {
        return{
            error: function (data) {
                if(data.data.isArray){
                    angular.forEach(data.data, function (value) {
                        NotificationSrv.error(value);
                    });

                }else{
                    angular.forEach(data.data, function (value,key) {
                        NotificationSrv.error(key + ' : '+ value);
                    });
                }
            }
        };
    }

    // Assign factory to module
    angular.module('ts.services', ['ngResource'])
        .factory('BaseUrl', BaseUrl)
        .factory('EntrySrv', EntrySrv)
        .factory('ProductSrv', ProductSrv)
        .factory('ProductTaxonomySrv', ProductTaxonomySrv)
        .factory('TaxonomySrv', TaxonomySrv)
        .factory('MessageSrv', MessageSrv)
        .factory('NotificationSrv', NotificationSrv)
        .factory('HttpInterceptor', HttpInterceptor)
        .factory('StateSrv', StateSrv)
        .factory('AccessSrv', AccessSrv)
        .factory('AttachmentCmsSrv', AttachmentCmsSrv)
        .factory('urlAttachment', urlAttachment)
        .factory('ErrorSrv', ErrorSrv);

    // Inject factory the dependencies
    BaseUrl.$inject = [];
    EntrySrv.$inject = ['$resource', 'BaseUrl'];
    ProductSrv.$inject = ['$resource', 'BaseUrl'];
    ProductTaxonomySrv.$inject = ['$resource', 'BaseUrl'];
    TaxonomySrv.$inject = ['$resource', 'BaseUrl'];
    MessageSrv.$inject = ['$resource', 'BaseUrl'];
    NotificationSrv.$inject = ['SweetAlert', '$filter'];
    HttpInterceptor.$inject = ['$q', 'NotificationSrv', '$rootScope'];
    StateSrv.$inject = ['$resource'];
    AccessSrv.$inject = ['$resource'];
    AttachmentCmsSrv.$inject = ['$resource', 'urlAttachment'];
    urlAttachment.$inject = [];
    ErrorSrv.$inject = ['NotificationSrv'];
})();