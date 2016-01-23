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
                // Listen for errors on the element and if there are any replace the source with the fallback source
                var defaultImage = 'https://s3-us-west-2.amazonaws.com/annalise-tingsystems/static/img/post-default.jpg';
                // if image error put default
                element.bind('error', function () {
                    attrs.$set('src', defaultImage);
                });
                attrs.$observe('postImage', function (value) {
                    // convert the interpolated value to an object
                    var obj = {url: value};
                    // default image value
                    attrs.$set('src', defaultImage);
                    if (obj.url) {
                        // Load the image source in the background and replace the element source once it's ready
                        var img = new Image();
                        img.src = obj.url;
                        img.onload = function(){
                            attrs.$set('src', obj.url);
                        };
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