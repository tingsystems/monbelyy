(function () {
    'use strict';

    function HomeCtrl(PostSrv, TaxonomySrv, $rootScope) {
        var self = this; // save reference of the scope

        TaxonomySrv.get({slug: 'skills', isActive: 'True', sizePage: 10}).$promise.then(function (results) {
            self.skills = results;
        });

        PostSrv.get({kind: 'project', isActive: 'True', sizePage: 10, ordering: '-createdAt'}).$promise.then(function (results) {
            self.projects = results;
        });

        PostSrv.get({kind: 'main-post', isActive: 'True', sizePage: 1}).$promise.then(function (results) {
            self.featuredPost = results.results[0];
        });

        PostSrv.get({kind: 'partner', isActive: 'True', sizePage: 10}).$promise.then(function (results) {
            self.parterns = results;
        });

        PostSrv.get({kind: 'footer-info', isActive: 'True', sizePage: 10}).$promise.then(function (results) {
            $rootScope.footerInfo = results;
        });
    }

    function PostCtrl(PostSrv, $stateParams) {
        var self = this;

        PostSrv.get({kind: $stateParams.kind, isActive: 'True', sizePage: 10, ordering: '-createdAt'}).$promise.then(function (results) {
            self.list = results;
        });
    }

    function BlogCtrl(PostSrv) {
        var self = this;

        PostSrv.get({kind: 'post', isActive: 'True', sizePage: 10, ordering: '-createdAt'}).$promise.then(function (results) {
            self.list = results;
            if(self.list.results){
                self.singlePost = self.list.results[0];
            }
        });
    }

    function PostDetailCtrl(PostDetailSrv, $stateParams, $rootScope) {
        var self = this;
        $rootScope.pageTitle = 'Tingsystems - ';

        PostDetailSrv.get({slug: $stateParams.slug, isActive: 'True'}).$promise.then(function (results) {
            self.detail = results;
            $rootScope.pageTitle = 'Tingsystems - ' + results.title;
        });
    }

    function ContactCtrl() {
        var self = this;

        self.formSubmit = function () {
            // ajax request to send the formData
        };
    }



    // create the module and assign controllers
    angular.module('ts.controllers', ['ts.services'])
        .controller('HomeCtrl', HomeCtrl)
        .controller('PostCtrl', PostCtrl)
        .controller('PostDetailCtrl', PostDetailCtrl)
        .controller('ContactCtrl', ContactCtrl)
        .controller('BlogCtrl', BlogCtrl);
    // inject dependencies to controllers
    HomeCtrl.$inject = ['PostSrv', 'TaxonomySrv', '$rootScope'];
    PostCtrl.$inject = ['PostSrv', '$stateParams'];
    PostDetailCtrl.$inject = ['PostDetailSrv', '$stateParams', '$rootScope'];
    ContactCtrl.$inject = [];
    BlogCtrl.$inject = ['PostSrv'];
})();