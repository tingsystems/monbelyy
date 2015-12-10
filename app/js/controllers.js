'use strict';

(function () {
    function HomeCtrl(PostSrv, TaxonomySrv, PostDetailSrv) {
        var self = this; // save reference of the scope

        TaxonomySrv.get({slug: 'skills'}).$promise.then(function(results){
            self.skills = results;
        });

        PostSrv.get({kind: 'project'}).$promise.then(function(results){
            self.projects = results;
        });

        PostDetailSrv.get({slug: 'metodologia-de-trabajo'}).$promise.then(function(results){
           self.featuredPost = results;
        });

        PostSrv.get({kind: 'client'}).$promise.then(function(results){
            self.clients = results;
        });
    }

    function PostCtrl(PostSrv, $stateParams){
        var self = this;

        PostSrv.get({kind: $stateParams.kind}).$promise.then(function(results){
            self.list = results;
        });
    }

    function PostDetailCtrl(PostDetailSrv, $stateParams){
        var self = this;

        PostDetailSrv.get({slug: $stateParams.slug}).$promise.then(function(results){
            self.detail = results;
        });
    }

    // create the module and assign controllers
    angular.module('ts.controllers', ['ts.services'])
        .controller('HomeCtrl', HomeCtrl)
        .controller('PostCtrl', PostCtrl)
        .controller('PostDetailCtrl', PostDetailCtrl);

    // inject dependencies to controllers
    HomeCtrl.$inject = ['PostSrv', 'TaxonomySrv', 'PostDetailSrv'];
    PostCtrl.$inject = ['PostSrv', '$stateParams'];
    PostDetailCtrl.$inject = ['PostDetailSrv', '$stateParams'];
})();