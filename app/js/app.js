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
            .state('category-content', {
                url: '/content/category/:slug',
                data: {pageTitle: 'Moons'},
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
                data: {pageTitle: 'Moons'},
                views: {
                    'content': {
                        templateUrl: '/templates/categories.html',
                        controllerAs: 'Product',
                        controller: 'ProductsByCategoryCtrl'
                    }
                }
            })
            .state('search', {
                url: '/busqueda?q&kind',
                params: {
                    q: null,
                    kind: null
                },
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
                data: {pageTitle: 'Moons'},
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
                data: {pageTitle: 'Moons'},
                views: {
                    'content': {
                        templateUrl: '/templates/product-detail.html',
                        controllerAs: 'Product',
                        controller: 'ProductDetailCtrl'
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
        blockUIConfig.delay = 100;

        // Set interceptor
        $httpProvider.interceptors.push('HttpInterceptor');

    }

    function AuthProvider($authProvider) {
        // config params
        $authProvider.loginUrl = '#host#/api/{{apiShop}}/auth/token';
        $authProvider.tokenName = 'access_token';
        $authProvider.tokenPrefix = 'ca';
    }

    /**
     * @name Run
     * @desc Update xsrf $http headers to align with Django's defaults
     */
    function Run($http, $rootScope, $state, $window, $location, TaxonomySrv, $anchorScroll, EntrySrv, $auth, $localStorage) {
        $rootScope.$state = $state;
        $rootScope.host = 'http://api.moons.mx';
        //$rootScope.host = 'http://192.168.1.67';
        $rootScope.apiV = 'v2';
        $rootScope.apiShop = 'v1';
        $rootScope.siteId = '622a3b57-c996-4b1a-aa98-d8474a9a6db3';
        $http.defaults.headers.common['PROJECT-ID'] = '37ef6c92-5fba-4688-845b-2cd938a9f2fc';

        $rootScope.$on('$locationChangeSuccess', function () {
            $('#header-mainMenu').collapse('hide');
        });
        //various config
        $rootScope.initConfig = {
            googleKey: 'UA-53555832-43',
            meta_color: '#eee7de',
            //img_default: ' http://www.corriente-alterna.com/img/img-default-ca.png',
            img_default: '../../img/img-default.jpg',
            email: 'info@moons.mx',
            phone: '01 (55) 55 58 98 99'

        };
        // initialise google analytics
        $window.ga('create', $rootScope.initConfig.googleKey, '');
        // do something when change state
        $rootScope.$on('$stateChangeSuccess', function (event) {
            $window.ga('send', 'pageview', $location.path());
            $window.ga('require', 'displayfeatures');
            // Init var post for meta tags index
            $rootScope.post = {
                'title': 'Moons',
                'excerpt': '',
                'urlImages': {
                    'original': $rootScope.initConfig.img_default
                }
            };
            $anchorScroll();
        });
        // init for page title
        $rootScope.pageTitle = 'Moons';
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
                parent: 'ac3a5d0e-9faa-475b-adbe-9f91be15b92f',
                isActive: 'True',
                ordering: 'order'
            }).$promise.then(function (response) {
                $rootScope.mainNavMenu = response;
            }, function (error) {
            });
        }

        if (!$rootScope.NavMenuSocial) {
            TaxonomySrv.query({
                parent: '61265a3d-c57f-41a1-9a92-7db5458a3cde',
                isActive: 'True',
                ordering: 'order'
            }).$promise.then(function (response) {
                $rootScope.NavMenuSocial = response;
            }, function (error) {
            });
        }

        if (!$rootScope.footerNavMenuConact) {
            TaxonomySrv.query({
                parent: 'a0734bc0-6325-4f4a-b6cf-f8181db71e12',
                isActive: 'True',
                ordering: 'order'
            }).$promise.then(function (response) {
                $rootScope.footerNavMenuConact = response;
            }, function (error) {
            });
        }
        if (!$rootScope.contactHelp) {
            TaxonomySrv.query({
                parent: 'f2d48db9-e7ac-4dfc-aeeb-da6ca4aaec19',
                isActive: 'True',
                ordering: 'order'
            }).$promise.then(function (response) {
                $rootScope.contactHelp = response;
            }, function (error) {
            });
        }

        if (!$rootScope.contactMenuData) {
            EntrySrv.get({
                taxonomies: 'contactanos',
                isActive: 'True',
                pageSize: 5,
                ordering: '-createdAt',
                fields: 'title,link,excerpt,content'
            }).$promise.then(function (results) {
                $rootScope.contactMenuData = results.results;
            });
        }

        $rootScope.ecommerce = true;

        $rootScope.$on('$stateChangeStart', function (event, toState) {
            var requiredLogin = false;
            // check if this state need login
            if (toState.data && toState.data.requiredLogin)
                requiredLogin = true;

            // if yes and if this user is not logged in, redirect him to login page
            if (requiredLogin && !$auth.isAuthenticated()) {
                event.preventDefault();
                if ($state.current.name != '500' && $state.current.name != '400') {
                    $state.go('register');
                }
            }
        });

        //init $localStorage.appData
        if (!angular.isDefined($localStorage.appData)) {
            $localStorage.appData = {};
        }
    }

    angular.module('annalise', ['ui.router', 'ts.controllers', 'ts.directives', 'ts.filters', 'ngSanitize', 'app.templates',
        'infinite-scroll', 'akoenig.deckgrid', 'ngAnimate', 'ui.bootstrap', 'ocNgRepeat', 'blockUI',
        'duScroll', 'truncate', 'ngTouch', 'ngStorage', 'ngStorage', 'oitozero.ngSweetAlert', 'satellizer', 'auth.app', 'shop.app', 'ngMessages', 'ui.select', 'ngTable'])
        .config(Routes)
        .config(AppConfig)
        .config(AuthProvider)
        .run(Run);

    Run.$inject = ['$http', '$rootScope', '$state', '$window', '$location', 'TaxonomySrv', '$anchorScroll',
        'EntrySrv', '$auth', '$localStorage'];
    Routes.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];
    AppConfig.$inject = ['$httpProvider', 'blockUIConfig'];
    AuthProvider.$inject = ['$authProvider'];
})();
