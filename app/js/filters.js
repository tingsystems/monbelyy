(function () {
    'use strict';

    function trustHtml($sce) {
        return $sce.trustAsHtml;
    }

    function Translate($rootScope) {
        // In the return function, we must pass in a single parameter which will be the data we will work on.
        // We have the ability to support multiple other parameters that can be passed into the filter optionally
        return function (input, optional1, optional2) {
            // optional language
            if (optional1) {
                if ($rootScope.words[input]) {
                    return $rootScope.words[input][optional1];
                }
            }
            // try to get the language
            if ($rootScope.words[input]) {
                return $rootScope.words[input][$rootScope.lang];
            }
            // if the language  was not found return the text in english
            if ($rootScope.words[input]) {
                return $rootScope.words[input]['ingles'];
            }
            return input;
        }
    }

    // create the module and assign functions
    angular.module('ts.filters', [])
        .filter('trustHtml', trustHtml)
        .filter('translate', Translate);

    // inject dependencies to filters
    trustHtml.$inject = ['$sce'];
    Translate.$inject = ['$rootScope'];
})();