(function () {
    'use strict';

    function trustHtml($sce) {
        return $sce.trustAsHtml;
    }

    // create the module and assign functions
    angular.module('ts.filters', [])
        .filter('trustHtml', trustHtml);

    // inject dependencies to controllers
    trustHtml.$inject = ['$sce'];
})();