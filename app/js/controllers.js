(function () {
    'use strict';

    function HomeCtrl(PostSrv, PostDetailSrv, TaxonomySrv, $rootScope) {
        var self = this; // save reference of the scope
        self.mainSlider = [];
        $rootScope.pageTitle = 'Servicio Prados Verdes';

        PostSrv.get({
            category: 'slider',
            isActive: 'True',
            sizePage: 10,
            ordering: '-createdAt',
            fields: 'content'
        }).$promise.then(function (results) {
                self.mainSlider = results.results;
            });
            
        PostSrv.get({
            category: 'costos-gasolina',
            isActive: 'True',
            sizePage: 3,
            ordering: 'createdAt',
            fields: 'title,excerpt,keywords'
        }).$promise.then(function (results) {
                self.kpis = results.results;
            });

        PostSrv.get({
            category: 'inicio-nosotros',
            isActive: 'True',
            sizePage: 1,
            ordering: 'createdAt',
            fields: 'title,content,slug'
        }).$promise.then(function (results) {
                self.about = results.results[0];
            });

        self.map = {center: {latitude:20.0573362, longitude: -102.7263114}, zoom: 13};

        self.closeClick = function () {
            self.windowOptions.visible = true;
        };
        self.windowOptions = {
            visible: true
        };

        self.marker0 = {
            id: 1,
            coords: {
                latitude: 20.064054000000024,
                longitude: -102.71605299999999
            },
            options: {},
            events: {
                click: function (marker, eventName, args) {
                    self.windowOptions.visible = !self.windowOptions.visible;
                }
            }
        };

        self.marker1 = {
            id: 1,
            coords: {
                latitude: 20.041982,
                longitude: -102.71684600000003
            },
            options: {},
            events: {
                click: function (marker, eventName, args) {
                    self.windowOptions.visible = !self.windowOptions.visible;
                }
            }
        };
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
                        $rootScope.pageTitle = self.categoryName + ' - Servicio Prados Verdes';
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
                category: 'noticias',
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
        $rootScope.pageTitle = 'Blog - Servicio Prados Verdes';
    }

    function PostDetailCtrl(PostDetailSrv, $stateParams, $rootScope) {
        var self = this;
        $rootScope.pageTitle = 'Servicio Prados Verdes';

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
                $rootScope.pageTitle = results.title + ' - Servicio Prados Verdes';
                self.busy = false;
            });
    }

    function ContactCtrl(MessageSrv, NotificationSrv, $rootScope, $state) {
        var self = this;
        if ($state.current.name == 'home') {
            $rootScope.pageTitle = 'Servicio Prados Verdes';
        } else if ($state.current.name == 'contact') {
            $rootScope.pageTitle = 'Contacto - Servicio Prados Verdes';
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

    function ProductsCtrl(PostSrv) {
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
                category: 'productos',
                isActive: 'True',
                sizePage: 20,
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

    function TabsCtrl(PostSrv, TaxonomySrv) {
        var self = this;
        self.category_1 = 'artesanal';
        self.category_2 = 'dama';
        self.category_3 = 'caballero';
        self.category_4 = 'infantil';
        self.Tab1 = function () {
            self.list1 = [];
            PostSrv.get({
                category: self.category_1,
                isActive: 'True',
                sizePage: 9,
                ordering: '-createdAt',
                fields: 'urlImages,title,link,slug,categories,excerpt'
            }).$promise.then(function (results) {
                    self.list1 = results.results;
                });
        };
        self.Tab2 = function () {
            self.list2 = [];
            PostSrv.get({
                category: self.category_2,
                isActive: 'True',
                sizePage: 9,
                ordering: '-createdAt',
                fields: 'urlImages,title,link,slug,categories,excerpt'
            }).$promise.then(function (results) {
                    self.list2 = results.results;
                });
        };
        self.Tab3 = function () {
            self.list3 = [];
            PostSrv.get({
                category: self.category_3,
                isActive: 'True',
                sizePage: 9,
                ordering: '-createdAt',
                fields: 'urlImages,title,link,slug,categories,excerpt'
            }).$promise.then(function (results) {
                    self.list3 = results.results;
                });
        };
        self.Tab4 = function () {
            self.list4 = [];
            PostSrv.get({
                category: self.category_4,
                isActive: 'True',
                sizePage: 9,
                ordering: '-createdAt',
                fields: 'urlImages,title,link,slug,categories,excerpt'
            }).$promise.then(function (results) {
                    self.list4 = results.results;
                });
        };
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
        .controller('ProductsCtrl', ProductsCtrl)
        .controller('TabsCtrl', TabsCtrl);

    // inject dependencies to controllers
    HomeCtrl.$inject = ['PostSrv', 'PostDetailSrv', 'TaxonomySrv', '$rootScope'];
    PostCtrl.$inject = ['PostSrv', '$stateParams', 'TaxonomySrv', '$rootScope'];
    BlogCtrl.$inject = ['PostSrv', '$rootScope'];
    PostDetailCtrl.$inject = ['PostDetailSrv', '$stateParams', '$rootScope'];
    ContactCtrl.$inject = ['MessageSrv', 'NotificationSrv', '$rootScope', '$state'];
    GetQuerySearchCtrl.$inject = ['$rootScope', '$state', '$filter'];
    SearchCtrl.$inject = ['PostSrv', '$rootScope', '$scope'];
    NavBarCtrl.$inject = [];
    ProductsCtrl.$inject = ['PostSrv'];
    TabsCtrl.$inject = ['PostSrv', 'TaxonomySrv'];
})();