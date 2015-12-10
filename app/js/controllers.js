'use strict';

(function () {
    function HomeCtrl(PostSrv) {
        var self = this; // save reference of the scope

        PostSrv.get({kind: 'post'}).$promise.then(function (results) {
            self.list = results;
        });
    }

    function PostCtrl(PostSrv){
        var self = this;

        PostSrv.get({kind: 'post'}).$promise.then(function(results){
            self.list = results;
        });
    }

    function PageCtrl(PostSrv){
        var self = this;

        PostSrv.get({kind: 'page'}).$promise.then(function(results){
            self.list = results;
        });
    }

    // create the module and assign controllers
    angular.module('ts.controllers', ['ts.services'])
        .controller('HomeCtrl', HomeCtrl)
        .controller('PostCtrl', PostCtrl)
        .controller('PageCtrl', PageCtrl);
    // inject dependencies to controllers
    HomeCtrl.$inject = ['PostSrv'];
    PostCtrl.$inject = ['PostSrv'];
    PageCtrl.$inject = ['PostSrv'];
})();