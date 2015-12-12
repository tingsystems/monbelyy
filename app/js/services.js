(function () {
    'use strict';

    var siteId = '57091aee-863f-4acf-972f-5b24fbe98d1f';
    var baseUrl = 'http://api.tingsystems.com/api/v1/site/' + siteId + '/';

    function PostSrv($resource) {
        return $resource(baseUrl + 'posts');
    }

    function PostDetailSrv($resource) {
        return $resource(baseUrl + 'posts/:slug');
    }

    function TaxonomySrv($resource) {
        return $resource(baseUrl + 'taxonomies');
    }

    // Assign factory to module
    angular.module('ts.services', ['ngResource'])
        .factory('PostSrv', PostSrv)
        .factory('PostDetailSrv', PostDetailSrv)
        .factory('TaxonomySrv', TaxonomySrv);

    // Inject factory the dependencies
    PostSrv.$inject = ['$resource'];
    PostDetailSrv.$inject = ['$resource'];
    TaxonomySrv.$inject = ['$resource'];
})();