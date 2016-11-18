(function () {
    'use strict';

    function HomeCtrl(PostSrv, PostDetailSrv, TaxonomySrv, $rootScope, $localStorage) {
        var self = this; // save reference of the scope
        self.mainSlider = [];
        $rootScope.pageTitle = 'Luissa Shoes';

        PostSrv.get({
            category: 'slider',
            isActive: 'True',
            sizePage: 10,
            ordering: '-createdAt',
            fields: 'urlImages,title,link,slug,excerpt'
        }).$promise.then(function (results) {
                self.mainSlider = results.results;
            });
        PostSrv.get({
            category: 'destacados',
            isActive: 'True',
            sizePage: 10,
            ordering: '-createdAt',
            fields: 'title,urlImages,slug,excerpt'
        }).$promise.then(function (results) {
                self.featured = results.results;
            });

        self.products = [{
            "title": "Modelo a124",
            "urlImages": {
                "original": "http://media.tingsystems.com/media/calzado-ramses/jose/2016/1510/14725411_1188067711231612_1087592932_o-medium.jpeg"
            }

        },
        {
            "title": "Modelo 222",
            "urlImages": {
                "original": "http://media.tingsystems.com/media/calzado-ramses/jose/2016/1510/14725411_1188067711231612_1087592932_o-medium.jpeg"
            }

        }];

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

    function PostCtrl(PostSrv, $stateParams, TaxonomySrv, $rootScope, $localStorage) {
        var self = this;

        self.list = [];
        self.page = 0;
        self.next = true;
        self.busy = false;
        self.lenguage = $localStorage.appData.lang ? $localStorage.appData.lang : 'espanol';

        // get post by category
        if ($stateParams.slug) {
            TaxonomySrv.get({
                slug: '&&,' + $stateParams.slug + ',' + self.lenguage,
                isActive: 'True',
                sizePage: 1
            }).$promise.then(function (results) {
                    if (results.results.length) {
                        self.categoryName = results.results[0].name;
                        $rootScope.pageTitle = self.categoryName + ' - Novavet Labs';
                    }
                });
        }

        self.getMorePosts = function () {
            if (self.busy || !self.next)return;
            self.page += 1;
            self.busy = true;

            PostSrv.get({
                category: '&&,' + $stateParams.slug + ',' + self.lenguage,
                isActive: 'True',
                sizePage: 9,
                fields: 'title,slug,excerpt,urlImages,createdAt',
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

    function BlogCtrl(PostSrv, $rootScope, $localStorage) {
        var self = this;

        self.list = [];
        self.page = 0;
        self.next = true;
        self.busy = false;
        self.lenguage = $localStorage.appData.lang ? $localStorage.appData.lang : 'espanol';

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
                category: '&&,noticias,' + self.lenguage,
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
        $rootScope.pageTitle = 'Blog - Novavet Labs';
    }

    function PostDetailCtrl(PostDetailSrv, $stateParams, $rootScope) {
        var self = this;
        $rootScope.pageTitle = 'Novavet Labs';

        self.busy = true;
        PostDetailSrv.get({
            slug: $stateParams.slug,
            isActive: 'True',
            fields: 'title,slug,content,urlImages,categories,tags,galleryImages'
        }).$promise.then(function (results) {
                self.detail = results;
                $rootScope.post = self.detail;
                if (!self.detail.urlImages.original) {
                    self.detail.urlImages.original = $rootScope.initConfig.img_default;
                }
                $rootScope.pageTitle = results.title + ' - Novavet Labs';
                self.busy = false;
            });
    }

    function ContactCtrl(MessageSrv, NotificationSrv, $rootScope, $state) {
        var self = this;
        if ($state.current.name == 'home') {
            $rootScope.pageTitle = 'Novavet Labs';
        } else if ($state.current.name == 'contact') {
            $rootScope.pageTitle = 'Contacto - Novavet Labs';
        }


        self.contactInitialState = function () {
            self.notification = {name: '', email: '', message: '', phone: '', kind: ''};
            self.context = {};

        };
        self.contactInitialState();

        self.createNotification = function (kind) {
            // ajax request to send the formData
            self.notification.kind = kind;
            self.notification.send_from = $rootScope.initConfig.email;
            self.context.context = angular.copy(self.notification);
            self.busy = true;
            MessageSrv.create(self.context).$promise.then(function (data) {
                    self.contactInitialState();
                    NotificationSrv.success('Gracias,' + ' en breve nos comunicaremos contigo');
                    self.busy = false;
                },
                function (data) {
                    //error
                    NotificationSrv.error('Hubo ' + ' un error al procesar el formulario, intenta más tarde por favor');
                    self.busy = false;
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

    function SearchCtrl(PostSrv, $rootScope, $scope, $filter) {
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
                    fields: 'urlImages,title,link,slug,excerpt',
                    sizePage: 10,
                    ordering: '-createdAt',
                    search: self.searchTerm,
                    page: self.page
                }).$promise.then(function (results) {
                        //self.listSearch = $filter('filter')(results.results, {'slug': '!slider'});
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
                fields: 'urlImages,title,link,slug,excerpt',
                ordering: '-createdAt',
                search: self.searchTerm,
                page: self.page
            }).$promise.then(function (results) {
                    //self.responseResults = $filter('filter')(results.results, {'slug': '!slider'});
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

    function NavBarCtrl() {
        var self = this;
        self.isCollapsed = false;
        self.close = function () {
            $('#header-mainMenu').collapse('hide');
        }

    }

    function ProductsCtrl(TaxonomySrv) {
        var self = this;
        TaxonomySrv.query({
            parent: '9af40914-fc27-41d3-a882-06481996b176',
            isActive: 'True',
            ordering: 'order'
        }).$promise.then(function (response) {
                self.list = response;
            }, function (error) {
            });
    }


    // create the module and assign controllers
    angular.module('ts.controllers', ['ts.services'])
        .controller('HomeCtrl', HomeCtrl)
        .controller('PostCtrl', PostCtrl)
        .controller('BlogCtrl', BlogCtrl)
        .controller('PostDetailCtrl', PostDetailCtrl)
        .controller('ContactCtrl', ContactCtrl)
        .controller('GetQuerySearchCtrl', GetQuerySearchCtrl)
        .controller('SearchCtrl', SearchCtrl)
        .controller('NavBarCtrl', NavBarCtrl)
        .controller('ProductsCtrl', ProductsCtrl);
    // inject dependencies to controllers
    HomeCtrl.$inject = ['PostSrv', 'PostDetailSrv', 'TaxonomySrv', '$rootScope', '$localStorage'];
    PostCtrl.$inject = ['PostSrv', '$stateParams', 'TaxonomySrv', '$rootScope', '$localStorage'];
    BlogCtrl.$inject = ['PostSrv', '$rootScope', '$localStorage'];
    PostDetailCtrl.$inject = ['PostDetailSrv', '$stateParams', '$rootScope'];
    ContactCtrl.$inject = ['MessageSrv', 'NotificationSrv', '$rootScope', '$state'];
    GetQuerySearchCtrl.$inject = ['$rootScope', '$state', '$filter'];
    SearchCtrl.$inject = ['PostSrv', '$rootScope', '$scope'];
    NavBarCtrl.$inject = [];
    ProductsCtrl.$inject = ['TaxonomySrv'];
})();