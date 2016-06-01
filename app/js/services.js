(function () {
    'use strict';

    var siteId = '0feaf01e-402c-402c-8c05-ee9f00fd496e';
    var baseUrl = 'https://www.tingsystems.com/api/v1/site/' + siteId + '/';

    function PostSrv($resource) {
        return $resource(baseUrl + 'posts');
    }

    function PostDetailSrv($resource) {
        return $resource(baseUrl + 'posts/detail/:slug');
    }

    function TaxonomySrv($resource) {
        return $resource(baseUrl + 'taxonomies');
    }

    function MessageSrv($resource) {
        return $resource(baseUrl + 'notifications', null, {
            'create': {method: 'POST', url: baseUrl + 'notifications/create'}
        })
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

    // Assign factory to module
    angular.module('ts.services', ['ngResource'])
        .factory('PostSrv', PostSrv)
        .factory('PostDetailSrv', PostDetailSrv)
        .factory('TaxonomySrv', TaxonomySrv)
        .factory('MessageSrv', MessageSrv)
        .factory('NotificationSrv', NotificationSrv);

    // Inject factory the dependencies
    PostSrv.$inject = ['$resource'];
    PostDetailSrv.$inject = ['$resource'];
    TaxonomySrv.$inject = ['$resource'];
    MessageSrv.$inject = ['$resource'];
    NotificationSrv.$inject = ['toasty'];
})();