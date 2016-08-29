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
            .state('post_detail', {
                url: '/:slug\.html',
                views: {
                    'title': {template: '<title>{{pageTitle}}</title>'},
                    'content': {
                        templateUrl: '/templates/single.html',
                        controllerAs: 'Post',
                        controller: 'PostDetailCtrl'
                    }
                }
            })
            .state('page', {
                url: '/doc/page/:slug',
                views: {
                    'title': {template: '<title>{{pageTitle}}</title>'},
                    'content': {
                        templateUrl: '/templates/page.html',
                        controllerAs: 'Page',
                        controller: 'PostDetailCtrl'
                    }
                }
            })
            .state('category', {
                url: '/category/:slug',
                data: {pageTitle: 'Mercado Móvil'},
                views: {
                    'content': {
                        templateUrl: '/templates/categories.html',
                        controllerAs: 'Post',
                        controller: 'PostCtrl'
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
            .state('docs', {
                url: '/doc',
                views: {
                    'content': {
                        templateUrl: '/templates/docs.html',
                        controllerAs: 'Post',
                        controller: 'DocsCtrl'
                    }
                }
            })
            .state('doc_detail', {
                url: '/doc/:slug\.html',
                views: {
                    'title': {template: '<title>{{pageTitle}}</title>'},
                    'content': {
                        templateUrl: '/templates/single.html',
                        controllerAs: 'Post',
                        controller: 'PostDetailCtrl'
                    }
                }
            })
            .state('category_doc', {
                url: '/doc/category/:slug',
                data: {pageTitle: 'Mercado Móvil'},
                views: {
                    'content': {
                        templateUrl: '/templates/categories.html',
                        controllerAs: 'Post',
                        controller: 'PostCtrl'
                    }
                }
            });

        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(false);
    }

    function AppConfig($httpProvider, blockUIConfig) {
        blockUIConfig.templateUrl = '/templates/partials/block-ui.html';
        // Change the default overlay message
        blockUIConfig.message = 'Cargando...';

        // Change the default delay to 100ms before the blocking is visible
        blockUIConfig.delay = 90;

        // Set interceptor
        $httpProvider.interceptors.push('HttpInterceptor');

    }

    /**
     * @name Run
     * @desc Update xsrf $http headers to align with Django's defaults
     */
    function Run($http, $rootScope, $state, $window, $location, TaxonomySrv, PostSrv, $anchorScroll) {
        $rootScope.$state = $state;
        $rootScope.host = 'https://www.tingsystems.com';
        //$rootScope.host = 'http://192.168.1.149';
        $rootScope.apiV = 'v1';
        $rootScope.siteId = 'e1ea14e5-785c-49a7-89da-4a1f822b9a35';
        $http.defaults.headers.common['TS-TOKEN'] = 'fJftxWD2732B6vgd538zvxfCrQVJTEmqO8wdRKou';
        $rootScope.$on('$locationChangeSuccess', function () {
            $('#header-mainMenu').collapse('hide');
        });
        // initialise google analytics
        $window.ga('create', 'UA-53555832-7', '');
        // do something when change state
        $rootScope.$on('$stateChangeSuccess', function (event) {
            $window.ga('send', 'pageview', $location.path());
            $window.ga('require', 'displayfeatures');
            // Init var post for meta tags index
            $rootScope.post = {
                'title': 'Mercado Móvil',
                'excerpt': 'Tu aliado estratégico en comercio móvil y procesamiento de pagos electrónicos',
                'urlImages': {
                    'original': 'https://mercadomovil.com.mx/img/img-default.jpg'
                }
            };
            $anchorScroll();
        });
        // init for page title
        $rootScope.pageTitle = 'Mercado Móvil';
        if (!$rootScope.mainNavMenu) {
            TaxonomySrv.query({
                parent: '5bb6cb73-1a97-4c97-b4f6-0c9cb3a687af',
                isActive: 'True',
                ordering: 'order'
            }).$promise.then(function (response) {
                    $rootScope.mainNavMenu = response;
                }, function (error) {
                });
        }
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

    }

    angular.module('annalise', ['ui.router', 'ts.controllers', 'ts.directives', 'ts.filters', 'ngSanitize', 'app.templates',
        'infinite-scroll', 'akoenig.deckgrid', 'ngAnimate', 'ui.bootstrap', 'ocNgRepeat', 'blockUI', 'angular-toasty',
        'duScroll', 'truncate', 'ngTouch'])
        .config(Routes)
        .config(AppConfig)
        .run(Run);

    Run.$inject = ['$http', '$rootScope', '$state', '$window', '$location', 'TaxonomySrv', 'PostSrv', '$anchorScroll'];
    Routes.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];
    AppConfig.$inject = ['$httpProvider', 'blockUIConfig'];
})();
