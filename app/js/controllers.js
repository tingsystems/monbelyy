(function () {
    'use strict';

    function HomeCtrl(PostSrv, $rootScope) {
        var self = this; // save reference of the scope
        self.mainSlider = [];
        $rootScope.pageTitle = 'Remolques Magu - Trabajo y material de calidad';
        // Controller for slider
        PostSrv.get({
            category: 'slide',
            isActive: 'True',
            sizePage: 10,
            ordering: '-createdAt',
            fields: 'urlImages,title,link,slug'
        }).$promise.then(function (results) {
                self.mainSlider = results.results;
            });
        PostSrv.get({
            category: 'product',
            isActive: 'True',
            sizePage: 10,
            ordering: '-createdAt',
            fields: 'urlImages,title,link,slug,categories'
        }).$promise.then(function (results) {
                self.products = results.results;
            });

        self.carouselInitializer = function () {
            $(".owl-carousel").owlCarousel({
                //get items to proportionate num of items
                //items: 4,
                //navigation: true,
                //pagination: false,
                autoplay: true,
                items: 2,
                loop: true,
                margin: 10,
                responsiveClass: true,
                responsive: {
                    0: {
                        items: 1,
                        nav: true
                    },
                    600: {
                        items: 3,
                        nav: false
                    },
                    1000: {
                        items: 4,
                        nav: true,
                        loop: false
                    }
                }
            });
        }
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
                        $rootScope.pageTitle = 'Remolques Magu - ' + self.categoryName;
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
                    self.busy = false;
                    self.next = results.next;
                });
        };

        self.getMorePosts();

    }

    function BlogCtrl(PostSrv, $rootScope) {
        var self = this;

        self.list = [];
        self.page = 0;
        self.next = true;
        self.busy = false;

        self.errorRecovery = function () {
            self.page -= 1;
            self.next = true;
            self.busy = false;
            self.loadPostError = false;
            self.getMorePosts();
        };

        self.getMorePosts = function () {
            if (self.busy || !self.next)return;
            self.page += 1;
            self.busy = true;
            self.loadPosts = self.page % 3 == 0;

            PostSrv.get({
                kind: 'post',
                category: 'blog',
                isActive: 'True',
                fields: 'title,slug,excerpt,urlImages,createdAt',
                sizePage: 9,
                ordering: '-createdAt',
                page: self.page
            }).$promise.then(function (results) {
                    self.list = self.list.concat(results.results);
                    self.busy = false;
                    self.next = results.next;
                });
        };

        self.getMorePosts();
        $rootScope.pageTitle = 'Remolques Magu - Blog';
    }

    function PostDetailCtrl(PostDetailSrv, $stateParams, $rootScope, PostSrv) {
        var self = this;
        $rootScope.pageTitle = 'Blue Mia - ';

        self.busy = true;
        PostDetailSrv.get({
            slug: $stateParams.slug,
            isActive: 'True',
            fields: 'title,slug,content,urlImages,categories,tags,galleryImages'
        }).$promise.then(function (results) {
                self.detail = results;
                $rootScope.post = self.detail;
                if (!self.detail.urlImages.original) {
                    self.detail.urlImages.original = 'http://www.remolquesmagu.com/img/img-default.jpg';
                }
                $rootScope.pageTitle = 'Remolques Magu - ' + results.title;
                self.busy = false;
            });
        // Controller for slider
        PostSrv.get({
            category: 'slider',
            isActive: 'True',
            sizePage: 10,
            ordering: '-createdAt',
            fields: 'urlImages,title,link,slug'
        }).$promise.then(function (results) {
                self.mainSlider = results.results;
            });
    }

    function ContactCtrl(MessageSrv, NotificationSrv, $rootScope) {
        var self = this;
        $rootScope.pageTitle = 'Remolques Magu - Contacto';

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
            self.notification.send_from = 'clientes@remolquesmagu.com';
            self.notification.subject = 'Nuevo formulario de contacto';
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

    function GetQuerySearchCtrl($rootScope, $state) {
        var self = this;

        $rootScope.searchTerm = '';

        self.globalSearch = function () {
            $rootScope.searchTerm = angular.copy(self.searchTerm);
            $state.go('search');
            self.searchTerm = '';
        };

    }

    function SearchCtrl(PostSrv, $rootScope, $scope) {
        var self = this;

        self.listSearch = [];
        self.page = 0;
        self.next = true;
        self.busy = false;
        self.searchTerm = angular.copy($rootScope.searchTerm);
        $rootScope.searchTerm = '';

        // watch for global search term
        $scope.$watch(function () {
            return $rootScope.searchTerm;
        }, function (value) {
            if (value != '') {
                self.searchTerm = angular.copy($rootScope.searchTerm);
                $rootScope.searchTerm = '';
                PostSrv.get({
                    kind: 'post',
                    isActive: 'True',
                    fields: 'urlImages,title,link,slug',
                    sizePage: 10,
                    ordering: '-createdAt',
                    search: self.searchTerm,
                    page: self.page
                }).$promise.then(function (results) {
                        self.listSearch = results.results;
                    });
            }
        });

        self.errorRecovery = function () {
            self.page -= 1;
            self.next = true;
            self.busy = false;
            self.loadPostError = false;
            self.getMorePosts();
        };

        self.getMorePosts = function () {
            if (self.busy || !self.next)return;
            self.page += 1;
            self.busy = true;

            PostSrv.get({
                kind: 'post',
                isActive: 'True',
                sizePage: 10,
                fields: 'urlImages,title,link,slug',
                ordering: '-createdAt',
                search: self.searchTerm,
                page: self.page
            }).$promise.then(function (results) {
                    self.listSearch = self.listSearch.concat(results.results);
                    self.busy = false;
                    self.next = results.next;
                    self.loadPostError = false;
                }, function (error) {
                    self.loadPostError = false;
                });
        };

        self.getMorePosts();


    }


    // create the module and assign controllers
    angular.module('ts.controllers', ['ts.services'])
        .controller('HomeCtrl', HomeCtrl)
        .controller('PostCtrl', PostCtrl)
        .controller('PostDetailCtrl', PostDetailCtrl)
        .controller('ContactCtrl', ContactCtrl)
        .controller('GetQuerySearchCtrl', GetQuerySearchCtrl)
        .controller('SearchCtrl', SearchCtrl)
        .controller('BlogCtrl', BlogCtrl);
    // inject dependencies to controllers
    HomeCtrl.$inject = ['PostSrv', 'TaxonomySrv', '$rootScope'];
    PostCtrl.$inject = ['PostSrv', '$stateParams', 'TaxonomySrv', '$rootScope'];
    PostDetailCtrl.$inject = ['PostDetailSrv', '$stateParams', '$rootScope', 'PostSrv'];
    ContactCtrl.$inject = ['MessageSrv', 'NotificationSrv', '$rootScope'];
    BlogCtrl.$inject = ['PostSrv', '$rootScope'];
    GetQuerySearchCtrl.$inject = ['$rootScope', '$state'];
    SearchCtrl.$inject = ['PostSrv', '$rootScope', '$scope'];
})();