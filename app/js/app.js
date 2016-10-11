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
                url: '/page/:slug',
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
                data: {pageTitle: 'NOVA VET LABS'},
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
            .state('products', {
                url: '/products',
                data: {pageTitle: 'NOVA VET LABS'},
                views: {
                    'content': {
                        templateUrl: '/templates/products.html',
                        controllerAs: 'Product',
                        controller: 'ProductsCtrl'
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
        blockUIConfig.delay = 110;

        // Set interceptor
        $httpProvider.interceptors.push('HttpInterceptor');

    }

    /**
     * @name Run
     * @desc Update xsrf $http headers to align with Django's defaults
     */
    function Run($http, $rootScope, $state, $window, $location, TaxonomySrv, $anchorScroll, translate, $localStorage) {
        $rootScope.$state = $state;
        $rootScope.host = 'https://www.tingsystems.com';
        //$rootScope.host = 'http://192.168.1.149';
        $rootScope.apiV = 'v1';
        $rootScope.siteId = '7d6c7854-386e-4506-a1f8-31855081efde';
        $http.defaults.headers.common['TS-TOKEN'] = 'thGQqd7ymgRIq1pJ6DQtjV97DJOx1J9cERDwygAd';

        $rootScope.$on('$locationChangeSuccess', function () {
            $('#header-mainMenu').collapse('hide');
        });
        // initialise google analytics
        //$window.ga('create', 'UA-53555832-36', '');
        // do something when change state
        $rootScope.$on('$stateChangeSuccess', function (event) {
            $window.ga('send', 'pageview', $location.path());
            $window.ga('require', 'displayfeatures');
            // Init var post for meta tags index
            $rootScope.post = {
                'title': 'Novavet Labs',
                'excerpt': 'Somos una compañía farmacéutica dedica a la producción de hormonales sintéticos para el desempeño físico, bajo estrictas normas y controles de calidad.',
                'urlImages': {
                    'original': 'http://www.novavetlabs.com/img/img-default.jpg'
                }
            };
            $anchorScroll();
        });
        // init for page title
        $rootScope.pageTitle = 'Novavet Labs';
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

        //config translate's
        $rootScope.words = translate.words;
        // init language
        $rootScope.app = {
            name: 'Novavetlabs',
            version: '1.0.0',
            data: {
                lang: 'espanol'
            }
        };
        // function to change language
        $rootScope.changeLang = function (lang) {
            if ($rootScope.lang != lang) {
                $rootScope.lang = lang;
                $localStorage.appData.lang = lang;
                $window.location.href = '/';
            }
        };
        // save data app including language in local storage
        if (angular.isDefined($localStorage.appData)) {
            $rootScope.app.data = $localStorage.appData;
            // retrieve language from local storage
            if ($rootScope.app.data.lang) {
                $rootScope.lang = $rootScope.app.data.lang;
            }
        } else {
            $localStorage.appData = $rootScope.app.data;
        }
        if (!$rootScope.mainNavMenu) {
            if ($rootScope.lang == 'espanol') {
                TaxonomySrv.query({
                    parent: 'ae4f23b4-2e3f-44c8-a5d3-5ec5594d06e3',
                    isActive: 'True',
                    ordering: 'order'
                }).$promise.then(function (response) {
                        $rootScope.mainNavMenu = response;
                    }, function (error) {
                    });
            } else if ($rootScope.lang == 'ingles') {
                TaxonomySrv.query({
                    parent: '918a6587-083f-430f-94b3-bb2cdb7e2b1a',
                    isActive: 'True',
                    ordering: 'order'
                }).$promise.then(function (response) {
                        $rootScope.mainNavMenu = response;
                    }, function (error) {
                    });
            } else {
                TaxonomySrv.query({
                    parent: '6fc54e64-2f20-4962-a8ec-9973d1fc15e4',
                    isActive: 'True',
                    ordering: 'order'
                }).$promise.then(function (response) {
                        $rootScope.mainNavMenu = response;
                    }, function (error) {
                    });
            }


        }

    }

    angular.module('annalise', ['ui.router', 'ts.controllers', 'ts.directives', 'ts.filters', 'ngSanitize', 'app.templates',
        'infinite-scroll', 'akoenig.deckgrid', 'ngAnimate', 'ui.bootstrap', 'ocNgRepeat', 'blockUI', 'angular-toasty',
        'duScroll', 'truncate', 'ngTouch', 'ngStorage'])
        .config(Routes)
        .config(AppConfig)
        .run(Run);

    Run.$inject = ['$http', '$rootScope', '$state', '$window', '$location', 'TaxonomySrv', '$anchorScroll',
        'translate', '$localStorage'];
    Routes.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];
    AppConfig.$inject = ['$httpProvider', 'blockUIConfig'];
})();
