(function () {
    'use strict';

    function HomeCtrl(PostSrv, PostDetailSrv, $rootScope) {
        var self = this; // save reference of the scope
        self.mainSlider = [];
        $rootScope.pageTitle = 'Viajes Coral - Inicio';

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
            category: 'paquetes',
            isActive: 'True',
            sizePage: 10,
            ordering: '-createdAt',
            fields: 'urlImages,title,link,slug'
        }).$promise.then(function (results) {
                self.packages = results.results;
            });

        PostSrv.get({
            category: 'excursiones',
            isActive: 'True',
            sizePage: 10,
            ordering: '-createdAt',
            fields: 'urlImages,title,link,slug'
        }).$promise.then(function (results) {
                self.excursion = results.results;
            });

        PostSrv.get({
            category: 'destinos',
            isActive: 'True',
            sizePage: 10,
            ordering: '-createdAt',
            fields: 'urlImages,title,link,slug'
        }).$promise.then(function (results) {
                self.destinations = results.results;
            });

        PostSrv.get({
            category: 'blog',
            isActive: 'True',
            sizePage: 4,
            ordering: '-createdAt',
            fields: 'urlImages,title,link,slug,createdAt,excerpt'
        }).$promise.then(function (results) {
                self.news = results.results;
            });
        /*
         PostDetailSrv.get({
         slug: 'presencia',
         isActive: 'True',
         fields: 'title,excerpt,slug,urlImages'
         }).$promise.then(function (results) {
         self.presence = results;
         });
         */

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
                        $rootScope.pageTitle = 'Viajes Coral - ' + self.categoryName;
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
        $rootScope.pageTitle = 'Viajes Coral - Blog';
    }

    function PostDetailCtrl(PostDetailSrv, $stateParams, $rootScope, PostSrv, $filter) {
        var self = this;
        $rootScope.pageTitle = 'Viajes Coral - ';

        self.busy = true;
        PostDetailSrv.get({
            slug: $stateParams.slug,
            isActive: 'True',
            fields: 'title,slug,content,urlImages,categories,tags,galleryImages'
        }).$promise.then(function (results) {
                self.detail = results;
                $rootScope.post = self.detail;
                if (!self.detail.urlImages.original) {
                    self.detail.urlImages.original = 'http://www.viveenarmonia.com.mx/img/img-default.jpg';
                }
                self.isBlog = $filter('filter')(self.detail.categories, {'slug': 'blog'})[0];
                $rootScope.pageTitle = 'Viajes Coral- ' + results.title;
                self.busy = false;
            });
        // Controller for slider
        PostSrv.get({
            category: 'blog',
            isActive: 'True',
            sizePage: 4,
            ordering: '-createdAt',
            fields: 'urlImages,title,link,slug,excerpt,createdAt'
        }).$promise.then(function (results) {
                self.blog = results.results;
            });
    }

    function ContactCtrl(MessageSrv, NotificationSrv, $rootScope, $state) {
        var self = this;
        if ($state.current.name == 'home') {
            $rootScope.pageTitle = 'Viajes Coral - Inicio';
        } else {
            $rootScope.pageTitle = 'Viajes Coral - Contacto';
        }


        self.contactInitialState = function () {
            self.notification = {name: '', email: '', message: '', phone: '', kind: ''};
            self.context = {};

        };
        self.contactInitialState();

        self.createNotification = function (kind) {
            // ajax request to send the formData
            self.notification.kind = kind;
            self.notification.send_from = 'info@viajescoral.com';
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

    }

    function TabsCtrl(PostSrv) {
        var self = this;
        self.category_1 = 'paquetes';
        self.category_2 = 'excursiones';
        self.category_3 = 'destinos';

        self.Tab1 = function () {
            self.list1 = [];
            PostSrv.get({
                category: self.category_1,
                isActive: 'True',
                sizePage: 10,
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
                sizePage: 10,
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
                sizePage: 10,
                ordering: '-createdAt',
                fields: 'urlImages,title,link,slug,categories,excerpt'
            }).$promise.then(function (results) {
                    self.list3 = results.results;
                });
        };

    }

    // create the module and assign controllers
    angular.module('ts.controllers', ['ts.services'])
        .controller('HomeCtrl', HomeCtrl)
        .controller('PostCtrl', PostCtrl)
        .controller('PostDetailCtrl', PostDetailCtrl)
        .controller('ContactCtrl', ContactCtrl)
        .controller('GetQuerySearchCtrl', GetQuerySearchCtrl)
        .controller('SearchCtrl', SearchCtrl)
        .controller('BlogCtrl', BlogCtrl)
        .controller('NavBarCtrl', NavBarCtrl)
        .controller('TabsCtrl', TabsCtrl);
    // inject dependencies to controllers
    HomeCtrl.$inject = ['PostSrv', 'PostDetailSrv', '$rootScope'];
    PostCtrl.$inject = ['PostSrv', '$stateParams', 'TaxonomySrv', '$rootScope'];
    PostDetailCtrl.$inject = ['PostDetailSrv', '$stateParams', '$rootScope', 'PostSrv', '$filter'];
    ContactCtrl.$inject = ['MessageSrv', 'NotificationSrv', '$rootScope', '$state'];
    BlogCtrl.$inject = ['PostSrv', '$rootScope'];
    GetQuerySearchCtrl.$inject = ['$rootScope', '$state', '$filter'];
    SearchCtrl.$inject = ['PostSrv', '$rootScope', '$scope'];
    NavBarCtrl.$inject = [];
    TabsCtrl.$inject = ['PostSrv'];
})();