(function () {
    'use strict';

    function HomeCtrl(PostSrv, TaxonomySrv, $rootScope) {
        var self = this; // save reference of the scope
        self.mainSlider = [];
        $rootScope.pageTitle = 'Blue Mia - Especialistas en ropa deportiva para Dama';
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

        self.sports = [];
        //Sports home
        TaxonomySrv.query({
            parent: '974f0e85-3f52-42b5-a059-c492787599c2',
            isActive: 'True',
            ordering: 'order',
            fields: 'name,slug,urlImages'
        }).$promise.then(function (results) {
                self.sports = results;
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
                responsive: {
                    600: {
                        items: 4
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
        $rootScope.pageTitle = 'Blue Mia - Blog';
    }

    function PostDetailCtrl(PostDetailSrv, $stateParams, $rootScope, $sce, PostSrv) {
        var self = this;
        $rootScope.pageTitle = 'Blue Mia - ';

        self.busy = true;
        PostDetailSrv.get({
            slug: $stateParams.slug,
            isActive: 'True',
            fields: 'title,slug,content,urlImages,categories,tags,galleryImages'
        }).$promise.then(function (results) {
                self.detail = results;
                self.detail.content = $sce.trustAsHtml(self.detail.content);
                $rootScope.post = self.detail;
                if (!self.detail.urlImages.original) {
                    self.detail.urlImages.original = 'https://www.tingsystems.com/img/logo.png';
                }
                $rootScope.pageTitle = 'Blue Mia - ' + results.title;
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
        $rootScope.pageTitle = 'Blue Mia - Contacto';

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

    function SportCtrl(TaxonomySrv, $rootScope) {
        var self = this;
        $rootScope.pageTitle = 'Blue Mia - Deportes';
        //Sports home
        TaxonomySrv.query({
            parent: '974f0e85-3f52-42b5-a059-c492787599c2',
            isActive: 'True',
            ordering: 'order',
            fields: 'name,slug,urlImages'
        }).$promise.then(function (results) {
                self.sports = results;
                angular.forEach(self.sports, function (obj, ind) {
                    self.sports[ind].imgXtra = 'img/sports/' + obj.slug + '.jpg';
                });
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
    PostDetailCtrl.$inject = ['PostDetailSrv', '$stateParams', '$rootScope', '$sce', 'PostSrv'];
    ContactCtrl.$inject = ['MessageSrv', 'NotificationSrv', '$rootScope'];
    BlogCtrl.$inject = ['PostSrv', '$rootScope'];
    SportCtrl.$inject = ['TaxonomySrv', '$rootScope'];
})();