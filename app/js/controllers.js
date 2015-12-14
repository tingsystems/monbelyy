(function () {
    'use strict';

    function HomeCtrl(PostSrv, TaxonomySrv, $rootScope) {
        var self = this; // save reference of the scope

        TaxonomySrv.get({slug: 'skills'}).$promise.then(function(results){
            self.skills = results;
        });

        PostSrv.get({kind: 'project'}).$promise.then(function(results){
            self.projects = results;
        });

        PostSrv.get({kind: 'main-post'}).$promise.then(function(results){
           self.featuredPost = results.results[0];
        });

        PostSrv.get({kind: 'partner'}).$promise.then(function(results){
            self.parterns = results;
        });

        PostSrv.get({kind: 'footer-info'}).$promise.then(function(results){
            $rootScope.footerInfo = results;
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

        self.formSubmit = function(){
            // ajax request to send the formData
        };
    }

    // create the module and assign controllers
    angular.module('ts.controllers', ['ts.services'])
        .controller('HomeCtrl', HomeCtrl)
        .controller('PostCtrl', PostCtrl)
        .controller('PostDetailCtrl', PostDetailCtrl)
        .controller('ContactCtrl', ContactCtrl);

    // inject dependencies to controllers
    HomeCtrl.$inject = ['PostSrv', 'TaxonomySrv', '$rootScope'];
    PostCtrl.$inject = ['PostSrv', '$stateParams'];
    PostDetailCtrl.$inject = ['PostDetailSrv', '$stateParams'];
    ContactCtrl.$inject = [];
})();