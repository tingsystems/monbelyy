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

    function postImage() {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                // observe the post image directive
                attrs.$observe('postImage', function (value) {
                    // convert the interpolated value to an object
                    var obj = scope.$eval(value);
                    // default image value
                    attrs.$set('src', 'https://s3-us-west-2.amazonaws.com/annalise-tingsystems/static/img/post-default.jpg');
                    if (obj.url) {
                        // if there are url image add the src of the image
                        attrs.$set('src', obj.url);
                    }
                })
            }
        }
    }

    // create the module and assign controllers
    angular.module('ts.directives', [])
        .directive('postLink', postLink)
        .directive('postImage', postImage);

    // inject dependencies to controllers
    postLink.$inject = [];
    postImage.$inject = [];
})();