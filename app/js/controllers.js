'use strict';

(function () {
    function HomeCtrl(HomeSrv) {
        var self = this; // save reference of the scope

        HomeSrv.get().$promise.then(function (results) {
            self.posts = results;
        });
    }

    // create the module and assign controllers
    angular.module('ts.controllers', ['ts.services'])
        .controller('HomeCtrl', HomeCtrl);
    // inject dependencies to controllers
    HomeCtrl.$inject = ['HomeSrv'];

})();