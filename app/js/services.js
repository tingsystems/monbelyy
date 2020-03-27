(function () {
    'use strict';

    // service for build the base url taking the host
    function BaseUrl() {
        return {
            get: function () {
                return '#hostAnnalise#/api/{{apiV}}/';
            },
            shop: function(){
                return '#host#/api/{{apiShop}}/public/';
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
        return $resource(BaseUrl.shop() + 'items/:slug', null, {
            'group': {
                method: 'GET',
                isArray: true,
                url: BaseUrl.shop() + 'items'
            }
        });
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
            },
            confirm: function (title, msg) {
                SweetAlert.swal({
                    title: !title ? 'Mensaje' : title,
                    text: msg,
                    type: "error",
                    showConfirmButton: true
                });

            }

        };
    }
    function MessageSrv($resource, BaseUrl) {
        return $resource(BaseUrl.get() + 'notifications/:id', null, {});
    }

    // service for status project in MMCB
    function MMOrderSrv($resource) {
        var BaseUrl = 'https://mercadomovil.com.mx/api/v3/reports/project/';
        return $resource(BaseUrl + 'status', null, {
            'status': {
                method: 'POST',
                url: BaseUrl + 'status',
                isArray: true
            }
        });
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
                if (rejection.status === -1) {
                    NotificationSrv.error('Por favor intenta de nuevo hay problemas para establecer la conexión.');
                }
                // FORBIDDEN, UNAUTHORIZED
                if (rejection.status === 403 || rejection.status === 401) {
                    // logout the current user and delete the local storage
                    $rootScope.$emit('UNAUTHORIZED');
                }

                // 404, 500 error
                if (rejection.status === 404) {
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
        var BaseUrl = 'https://www.tingsystems.com/api/v1/geo/';
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
    
    function PagerService() {
        // service definition
        var service = {};

        service.GetPager = GetPager;

        return service;

        // service implementation
        function GetPager(totalItems, currentPage, pageSize) {
            // default to first page
            currentPage = currentPage || 1;

            // default page size is 5
            pageSize = pageSize || 3;

            // calculate total pages
            var totalPages = Math.ceil(totalItems / pageSize);

            var startPage, endPage;
            if (totalPages <= 3) {
                // less than 5 total pages so show all
                startPage = 1;
                endPage = totalPages;
            } else {
                // more than 5 total pages so calculate start and end pages
                if (currentPage <= 2) {
                    startPage = 1;
                    endPage = 3;
                } else if (currentPage + 2 >= totalPages) {
                    startPage = totalPages - 1;
                    endPage = totalPages;
                } else {
                    startPage = currentPage - 2;
                    endPage = currentPage + 1;
                }
            }

            // calculate start and end item indexes
            var startIndex = (currentPage - 1) * pageSize;
            var endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

            // create an array of pages to ng-repeat in the pager control
            var pages = _.range(startPage, endPage + 1);

            // return object with all pager properties required by the view
            return {
                totalItems: totalItems,
                currentPage: currentPage,
                pageSize: pageSize,
                totalPages: totalPages,
                startPage: startPage,
                endPage: endPage,
                startIndex: startIndex,
                endIndex: endIndex,
                pages: pages
            };
        }
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
        .factory('ErrorSrv', ErrorSrv)
        .factory('MMOrderSrv', MMOrderSrv)
        .factory('PagerService', PagerService);

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
    MMOrderSrv.$inject = ['$resource'];
    PagerService.$inject = [];
})();