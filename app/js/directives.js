(function () {
    'use strict';

    function postLink() {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                // observe the postLink directive
                attrs.$observe('postLink', function (value) {
                    // convert the interpolated value to an object.
                    var obj = scope.$eval(value);
                    if (obj.link.url) {
                        // if there are link url change the href attribute of the element to the link url value
                        attrs.$set('href', obj.link.url);
                        attrs.$set('target', obj.link.target);
                        attrs.$set('title', '');
                    }
                });
            }
        };
    }

    // create the module and assign controllers
    angular.module('ts.directives', [])
        .directive('postLink', postLink);

    // inject dependencies to controllers
    postLink.$inject = [];
})();