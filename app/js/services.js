'use strict';

(function () {

    var siteId = '167b5b84-2df8-46b1-b1fa-af42ad6432de';
    var baseUrl = 'http://localhost:8000/api/v1/site/' + siteId + '/';

    function HomeSrv($resource) {
        return $resource(baseUrl + 'posts');
    }

    // Assign factory to module
    angular.module('ts.services', ['ngResource'])
        .factory('HomeSrv', HomeSrv);

    // Inject factory the dependencies
    HomeSrv.$inject = ['$resource'];
})();