(function () {
    'use strict';

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

        PostSrv.get({kind: 'partner'}).$promise.then(function(results){
            self.parterns = results;
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

    function ContactCtrl(){
        var self = this;
    }

    // create the module and assign controllers
    angular.module('ts.controllers', ['ts.services'])
        .controller('HomeCtrl', HomeCtrl)
        .controller('PostCtrl', PostCtrl)
        .controller('PostDetailCtrl', PostDetailCtrl)
        .controller('ContactCtrl', ContactCtrl);

    // inject dependencies to controllers
    HomeCtrl.$inject = ['PostSrv', 'TaxonomySrv', 'PostDetailSrv'];
    PostCtrl.$inject = ['PostSrv', '$stateParams'];
    PostDetailCtrl.$inject = ['PostDetailSrv', '$stateParams'];
    ContactCtrl.$inject = [];
})();