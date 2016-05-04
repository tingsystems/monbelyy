(function () {
    'use strict';

    function HomeCtrl(PostSrv, TaxonomySrv, $rootScope) {
        var self = this; // save reference of the scope
        self.sliders = [];
        // Controller for slider
        PostSrv.get({
            category : 'slider',
            isActive: 'True',
            sizePage: 10,
            ordering: '-createdAt',
            fields: 'urlImages,title,link,slug'
        }).$promise.then(function (results) {
                self.sliders = results.results;
            });

        self.sports = [];
        //Sports home
        TaxonomySrv.query({
            parent: '974f0e85-3f52-42b5-a059-c492787599c2',
            isActive: 'True',
            ordering: 'order',
            fields: 'name,slug,urlImages'
        }).$promise.then(function (results) {
                self.sports = results;
            })
    }

    function PostCtrl(PostSrv, $stateParams, TaxonomySrv, $rootScope) {
        var self = this;

        self.list = [];
        self.page = 0;
        self.next = true;
        self.busy = false;

        // get post by category
        if ($stateParams.slug) {
            TaxonomySrv.get({
                slug: $stateParams.slug,
                isActive: 'True',
                sizePage: 1
            }).$promise.then(function (results) {
                    if (results.results.length) {
                        self.categoryName = results.results[0].name;
                        $rootScope.pageTitle = 'Blue Mia - ' + self.categoryName;
                    }
                });
        }

        self.getMorePosts = function () {
            if (self.busy || !self.next)return;
            self.page += 1;
            self.busy = true;

            PostSrv.get({
                category: $stateParams.slug,
                isActive: 'True',
                sizePage: 10,
                ordering: '-createdAt',
                page: self.page
            }).$promise.then(function (results) {
                    self.list = self.list.concat(results.results);
                    if (self.list.length) {
                        self.singlePost = self.list[0];
                    }
                    self.busy = false;
                    self.next = results.next;
                });
        };

        self.getMorePosts();
    }

    function BlogCtrl(PostSrv) {
        var self = this;

        self.list = [];
        self.page = 0;
        self.next = true;
        self.busy = false;

        self.getMorePosts = function () {
            if (self.busy || !self.next)return;
            self.page += 1;
            self.busy = true;

            PostSrv.get({
                kind: 'post',
                isActive: 'True',
                sizePage: 10,
                ordering: '-createdAt',
                page: self.page
            }).$promise.then(function (results) {
                    self.list = self.list.concat(results.results);
                    if (self.list.length) {
                        self.singlePost = self.list[0];
                    }
                    self.busy = false;
                    self.next = results.next;
                });
        };

        self.getMorePosts();
    }

    function PostDetailCtrl(PostDetailSrv, $stateParams, $rootScope, $sce) {
        var self = this;
        $rootScope.pageTitle = 'Blue Mia - ';

        self.busy = true;
        PostDetailSrv.get({slug: $stateParams.slug, isActive: 'True'}).$promise.then(function (results) {
            self.detail = results;
            self.detail.content = $sce.trustAsHtml(self.detail.content);
            $rootScope.post = self.detail;
            if (!self.detail.urlImages.original) {
                self.detail.urlImages.original = 'https://www.tingsystems.com/img/logo.png';
            }
            $rootScope.pageTitle = 'Blue Mia - ' + results.title;
            self.busy = false;
        });
    }

    function ContactCtrl(MessageSrv, NotificationSrv) {
        var self = this;

        self.contactInitialState = function () {
            self.notification = {};
            self.notification.name = '';
            self.notification.email = '';
            self.notification.message = '';
            self.notification.phone = '';
            //Notification kind
            self.notification.kind = '';
            self.context = {};

        };
        self.contactInitialState();
        self.createNotification = function (kind) {
            // ajax request to send the formData
            self.notification.kind = kind;
            self.context.context = angular.copy(self.notification);
            var context = self.context;
            MessageSrv.create(context).$promise.then(function (data) {
                    self.contactInitialState();
                    NotificationSrv.success('Gracias,' + ' en breve nos comunicaremos contigo');
                },
                function (data) {
                    //error
                    NotificationSrv.error('Hubo ' + ' un error al procesar el formulario, intenta más tarde por favor');
                });
        };
    }

    function SportCtrl(TaxonomySrv) {
        var self = this;
        //Sports home
        TaxonomySrv.query({
            parent: '974f0e85-3f52-42b5-a059-c492787599c2',
            isActive: 'True',
            ordering: 'order',
            fields: 'name,slug,urlImages'
        }).$promise.then(function (results) {
                self.sports = results;
            })
    }


    // create the module and assign controllers
    angular.module('ts.controllers', ['ts.services'])
        .controller('HomeCtrl', HomeCtrl)
        .controller('PostCtrl', PostCtrl)
        .controller('PostDetailCtrl', PostDetailCtrl)
        .controller('ContactCtrl', ContactCtrl)
        .controller('SportCtrl', SportCtrl)
        .controller('BlogCtrl', BlogCtrl);
    // inject dependencies to controllers
    HomeCtrl.$inject = ['PostSrv', 'TaxonomySrv', '$rootScope'];
    PostCtrl.$inject = ['PostSrv', '$stateParams', 'TaxonomySrv', '$rootScope'];
    PostDetailCtrl.$inject = ['PostDetailSrv', '$stateParams', '$rootScope', '$sce'];
    ContactCtrl.$inject = [];
    BlogCtrl.$inject = ['PostSrv'];
    SportCtrl.$inject = ['TaxonomySrv'];
})();