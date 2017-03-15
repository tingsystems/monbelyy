(function () {
    'use strict';

    function Routes($stateProvider, $urlRouterProvider, $locationProvider) {

        $stateProvider
            .state('index', {
                url: '/',
                abstract: true,
                templateUrl: '/static/app/index.html',
                controllerAs: 'Home',
                controller: 'HomeCtrl'
            })
            .state('home', {
                url: '/',
                views: {
                    'content': {
                        templateUrl: '/templates/home.html',
                        controllerAs: 'Home',
                        controller: 'HomeCtrl'
                    }
                }
            })
            .state('contact', {
                url: '/contact',
                views: {
                    'content': {
                        templateUrl: '/templates/contact.html',
                        controllerAs: 'Contact',
                        controller: 'ContactCtrl'
                    }
                }
            })
            .state('blog', {
                url: '/blog',
                views: {
                    'content': {
                        templateUrl: '/templates/blog.html',
                        controllerAs: 'Post',
                        controller: 'BlogCtrl'
                    }
                }
            })
            .state('login', {
                url: '/login',
                views: {
                    'content': {
                        templateUrl: '/templates/login.html',
                        controllerAs: 'Login',
                        controller: 'LoginCtrl'
                    }
                }
            })
            .state('post_detail', {
                url: '/:slug\.html',
                views: {
                    'title': { template: '<title>{{pageTitle}}</title>' },
                    'content': {
                        templateUrl: '/templates/single.html',
                        controllerAs: 'Post',
                        controller: 'PostDetailCtrl'
                    }
                }
            })
            .state('page', {
                url: '/page/:slug',
                views: {
                    'title': { template: '<title>{{pageTitle}}</title>' },
                    'content': {
                        templateUrl: '/templates/page.html',
                        controllerAs: 'Page',
                        controller: 'PostDetailCtrl'
                    }
                }
            })
            .state('category-content', {
                url: '/content/category/:slug',
                data: { pageTitle: 'Corriente Alterna' },
                views: {
                    'content': {
                        templateUrl: '/templates/categories.html',
                        controllerAs: 'Product',
                        controller: 'PostCtrl'
                    }
                }
            })
            .state('category', {
                url: '/category/:slug',
                data: { pageTitle: 'Corriente Alterna' },
                views: {
                    'content': {
                        templateUrl: '/templates/categories.html',
                        controllerAs: 'Product',
                        controller: 'ProductsByCategoryCtrl'
                    }
                }
            })
            .state('search', {
                url: '/busqueda',
                views: {
                    'content': {
                        templateUrl: '/templates/search.html',
                        controllerAs: 'Search',
                        controller: 'SearchCtrl'
                    }
                }
            })
            .state('404', {
                url: '/404',
                views: {
                    'content': {
                        templateUrl: '/templates/404.html'
                    }
                }
            })
            .state('products', {
                url: '/products',
                data: { pageTitle: 'Corriente Alterna' },
                views: {
                    'content': {
                        templateUrl: '/templates/products.html',
                        controllerAs: 'Product',
                        controller: 'ProductsCtrl'
                    }
                }
            })
            .state('product-detail', {
                url: '/product/detail/:slug\.html',
                data: { pageTitle: 'Corriente Alterna' },
                views: {
                    'content': {
                        templateUrl: '/templates/product-detail.html',
                        controllerAs: 'Product',
                        controller: 'ProductDetailCtrl'
                    }
                }
            })
            .state('shopcart', {
                url: '/shopcart',
                data: { pageTitle: 'Carrito de compras' },
                views: {
                    'content': {
                        templateUrl: '/templates/shopcart.html',
                        controllerAs: 'Shopcart',
                        controller: 'ShopCartCtrl'
                    }
                }
            })
            .state('payment', {
                url: '/payment',
                data: { pageTitle: 'Proceso de pago' },
                views: {
                    'content': {
                        templateUrl: '/templates/payment.html',
                        controllerAs: 'Payment',
                        controller: 'PaymentCtrl'
                    }
                }
            });


        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(true);
    }

    function AppConfig($httpProvider, blockUIConfig) {
        blockUIConfig.templateUrl = '/templates/partials/block-ui.html';
        // Change the default overlay message
        blockUIConfig.message = 'Cargando...';

        // Change the default delay to 100ms before the blocking is visible
        blockUIConfig.delay = 100;

        // Set interceptor
        $httpProvider.interceptors.push('HttpInterceptor');

    }

    /**
     * @name Run
     * @desc Update xsrf $http headers to align with Django's defaults
     */
    function Run($http, $rootScope, $state, $window, $location, TaxonomySrv, $anchorScroll, translate, $localStorage, PostSrv) {
        $rootScope.$state = $state;
        $rootScope.host = 'https://www.tingsystems.com';
        //$rootScope.host = 'http://192.168.1.149';
        $rootScope.apiV = 'v1';
        $rootScope.siteId = '622a3b57-c996-4b1a-aa98-d8474a9a6db3';
        $http.defaults.headers.common['TS-TOKEN'] = 'qg4AkRlXmMV3viERPyYFkiVrpfWd8ZymK7KosHiY';

        $rootScope.$on('$locationChangeSuccess', function () {
            $('#header-mainMenu').collapse('hide');
        });
        //various config
        $rootScope.initConfig = {
            googleKey: 'UA-53555832-43',
            meta_color: '#eee7de',
            img_default: ' https://www.corriente-alterna.com/img/img-default.jpg',
            email: 'info@corriente-alterna.com',
            phone: '353 110 1895'

        };
        // initialise google analytics
        $window.ga('create', $rootScope.initConfig.googleKey, '');
        // do something when change state
        $rootScope.$on('$stateChangeSuccess', function (event) {
            $window.ga('send', 'pageview', $location.path());
            $window.ga('require', 'displayfeatures');
            // Init var post for meta tags index
            $rootScope.post = {
                'title': 'Corriente Alterna',
                'excerpt': '',
                'urlImages': {
                    'original': $rootScope.initConfig.img_default
                }
            };
            $anchorScroll();
        });
        // init for page title
        $rootScope.pageTitle = 'Corriente Alterna';
        function showResponsive($window) {
            if ($window.innerWidth <= 768) {
                return true
            }
            return false
        }

        $rootScope.showResponsive = showResponsive($window);
        $rootScope.$on('HTTP_ERROR', function (event, args) {
            $state.go(args.error);
        });


        if (!$rootScope.mainNavMenu) {
            TaxonomySrv.query({
                parent: 'b27b4218-8285-4b44-b9a7-f04a96108dd1',
                isActive: 'True',
                ordering: 'order'
            }).$promise.then(function (response) {
                $rootScope.mainNavMenu = response;
            }, function (error) {
            });
        }

        if (!$rootScope.NavMenuSocial) {
            TaxonomySrv.query({
                parent: '924838a3-4f24-40e5-8d4f-f9aaf406ab9a',
                isActive: 'True',
                ordering: 'order'
            }).$promise.then(function (response) {
                $rootScope.NavMenuSocial = response;
            }, function (error) {
            });
        }

        if (!$rootScope.footerNavMenuConact) {
            TaxonomySrv.query({
                parent: 'ee529e2b-1315-4e57-a269-981ee999c0a5',
                isActive: 'True',
                ordering: 'order'
            }).$promise.then(function (response) {
                $rootScope.footerNavMenuConact = response;
            }, function (error) {
            });
        }
        if (!$rootScope.contactHelp) {
            TaxonomySrv.query({
                parent: 'b41db416-2beb-42ae-83d8-af19be924097',
                isActive: 'True',
                ordering: 'order'
            }).$promise.then(function (response) {
                $rootScope.contactHelp = response;
            }, function (error) {
            });
        }

        if (!$rootScope.contactMenuData) {
            PostSrv.get({
                category: 'datos-de-contacto',
                isActive: 'True',
                sizePage: 5,
                ordering: '-createdAt',
                fields: 'title,link,excerpt,content'
            }).$promise.then(function (results) {
                $rootScope.contactMenuData = results.results;
            });
        }

        $rootScope.ecommerce = false;

    }

    angular.module('annalise', ['ui.router', 'ts.controllers', 'ts.directives', 'ts.filters', 'ngSanitize', 'app.templates',
        'infinite-scroll', 'akoenig.deckgrid', 'ngAnimate', 'ui.bootstrap', 'ocNgRepeat', 'blockUI', 'angular-toasty',
        'duScroll', 'truncate', 'ngTouch', 'ngStorage', 'uiGmapgoogle-maps'])
        .config(Routes)
        .config(AppConfig)
        .run(Run);

    Run.$inject = ['$http', '$rootScope', '$state', '$window', '$location', 'TaxonomySrv', '$anchorScroll',
        'translate', '$localStorage', 'PostSrv'];
    Routes.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];
    AppConfig.$inject = ['$httpProvider', 'blockUIConfig'];
})();
