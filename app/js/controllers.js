(function () {
    'use strict';

    function HomeCtrl(PostSrv, TaxonomySrv, $rootScope) {
        var self = this; // save reference of the scope
        self.slider = [];
        // Controller for slider
        PostSrv.get({
            category : 'slider',
            isActive: 'True',
            sizePage: 10,
            ordering: '-createdAt',
            fields: 'urlImages,title,link,slug'
        }).$promise.then(function (results) {
                self.slider = results.results;
            });


    }

    function PostCtrl(PostSrv, $stateParams) {
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
                kind: $stateParams.kind,
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
    PostDetailCtrl.$inject = ['PostDetailSrv', '$stateParams', '$rootScope', '$sce'];
    ContactCtrl.$inject = [];
    BlogCtrl.$inject = ['PostSrv'];
})();