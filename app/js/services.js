(function () {
    'use strict';

    var siteId = '167b5b84-2df8-46b1-b1fa-af42ad6432de';
    var baseUrl = 'http://localhost:8000/api/v1/site/' + siteId + '/';

    function PostSrv($resource) {
        return $resource(baseUrl + 'posts');
    }

    function PostDetailSrv($resource){
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