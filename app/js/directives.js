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

    function postImage($rootScope) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                // Listen for errors on the element and if there are any replace the source with the fallback source
                var defaultImage = $rootScope.initConfig.img_default;
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
                        img.onload = function () {
                            attrs.$set('src', obj.url);
                        };
                    }
                })
            }
        }
    }

    function compareGreaterF() {
        return {
            require: "ngModel",
            scope: {
                otherModelValue: "=compareGreater"
            },
            link: function (scope, element, attributes, ngModel) {
                ngModel.$validators.compareGreater = function (modelValue) {
                    if (parseInt(modelValue) <= 0) {
                        return false;
                    }
                    return parseInt(modelValue) <= parseInt(scope.otherModelValue);
                };
                scope.$watch("otherModelValue", function () {
                    ngModel.$validate();
                });

            }
        };

    }

    // create the module and assign controllers
    angular.module('ts.directives', [])
        .directive('postLink', postLink)
        .directive('postImage', postImage)
        .directive('compareGreater', compareGreaterF)
        .directive('owlCarousel', function() {
            return {
                restrict: 'E',
                transclude: false,
                link: function(scope) {
                    scope.initCarousel = function(element) {

                        // provide any default options you want
                        var defaultOptions = {};
                        var customOptions = scope.$eval($(element).attr('data-options'));
                        // combine the two options objects
                        for (var key in customOptions) {
                            defaultOptions[key] = customOptions[key];
                        }
                        // init carousel
                        var curOwl = $(element).data('owlCarousel');
                        if (!angular.isDefined(curOwl)) {
                            $(element).owlCarousel(defaultOptions);
                        }
                        scope.cnt++;
                    };
                }
            };
        })
        .directive('owlCarouselItem', [function() {
            return {
                restrict: 'A',
                transclude: false,
                link: function(scope, element) {
                    // wait for the last item in the ng-repeat then call init
                    if (scope.$last) {
                        scope.initCarousel(element.parent());
                    }
                }
            };
        }])
        .directive('myEnter', function () {
            return function (scope, element, attrs) {
                element.bind("keydown keypress", function (event) {
                    if (event.which === 13) {
                        scope.$apply(function () {
                            scope.$eval(attrs.myEnter);
                        });

                        event.preventDefault();
                    }
                });
            };
        });

    // inject dependencies to controllers
    postLink.$inject = [];
    postImage.$inject = ['$rootScope'];
    compareGreaterF.$inject = [];
})();