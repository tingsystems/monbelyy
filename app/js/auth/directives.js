'use strict';

angular.module('auth.app')
    .directive('permission', ['AuthorizationSrv', function (AuthorizationSrv) {
        return {
            // restrict attribute only
            restrict: 'A',
            bindToController: {
                list: '=?permissionsList',
                strategy: '=?permissionsStrategy'
            },
            controllerAs: 'permission',
            controller: ['$scope', '$element', function ($scope, $element) {
                var self = this;

                $scope.$watch('self.list',
                    function () {
                        var permissions = self.list;
                        if (AuthorizationSrv.authorize(permissions)) {
                            onAuthorizedAccess();
                        } else {
                            onUnauthorizedAccess();
                        }
                    });

                function onAuthorizedAccess() {
                    if (self.strategy == 'hide') {
                        $element.removeClass('ng-hide');
                    }
                    if (self.strategy == 'disable') {
                        $element.removeAttr('disabled');
                    }
                }

                function onUnauthorizedAccess() {
                    if (self.strategy == 'hide') {
                        $element.addClass('ng-hide');
                    }
                    if (self.strategy == 'disable') {
                        $element.attr('disabled', 'disabled');
                    }
                }
            }]
        };
    }])
    .directive('compareTo', function () {
        return {
            require: "ngModel",
            scope: {
                otherModelValue: "=compareTo"
            },
            link: function (scope, element, attributes, ngModel) {
                ngModel.$validators.compareTo = function (modelValue) {
                    return modelValue == scope.otherModelValue;
                };
                scope.$watch("otherModelValue", function () {
                    ngModel.$validate();
                });

            }
        }
    });


angular.module('auth.app')
    .directive('permissionGroup', ['AuthorizationGroupSrv', function (AuthorizationGroupSrv) {
        return {
            // restrict attribute only
            restrict: 'A',
            bindToController: {
                list: '=?permissionsList',
                strategy: '=?permissionsStrategy'
            },
            controllerAs: 'permission',
            controller: ['$scope', '$element', function ($scope, $element) {
                var self = this;

                $scope.$watch('self.list',
                    function () {
                        var permissions = self.list;
                        if (AuthorizationGroupSrv.authorize(permissions)) {
                            onAuthorizedAccess();
                        } else {
                            onUnauthorizedAccess();
                        }
                    });

                function onAuthorizedAccess() {
                    if (self.strategy == 'hide') {
                        $element.removeClass('ng-hide');
                    }
                    if (self.strategy == 'disable') {
                        $element.removeAttr('disabled');
                    }
                }

                function onUnauthorizedAccess() {
                    if (self.strategy == 'hide') {
                        $element.addClass('ng-hide');
                    }
                    if (self.strategy == 'disable') {
                        $element.attr('disabled', 'disabled');
                    }
                }
            }]
        };
    }]);
