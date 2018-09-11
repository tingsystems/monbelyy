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
                data: {pageTitle: 'Hanny Pulido Cosméticos'},
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
                data: {pageTitle: 'Hanny Pulido Cosméticos'},
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
                data: {pageTitle: '$rootScope.initConfig.branchOffice'},
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
                data: {pageTitle: 'Hanny Pulido Cosméticos'},
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

    function AppConfig($httpProvider, blockUIConfig, $uiViewScrollProvider) {
        blockUIConfig.templateUrl = '/templates/partials/block-ui.html';
        // Change the default overlay message
        blockUIConfig.message = 'Cargando...';

        // Change the default delay to 100ms before the blocking is visible
        blockUIConfig.delay = 0;

        // Set interceptor
        $httpProvider.interceptors.push('HttpInterceptor');
        $uiViewScrollProvider.useAnchorScroll();

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
        $rootScope.host = 'https://mercadomovil.com.mx';
        //$rootScope.host = 'http://' + $location.host();
        $rootScope.hostAnnalise = 'https://mercadomovil.com.mx';
        $rootScope.apiV = 'v1';
        $rootScope.apiShop = 'v3';
        $rootScope.projectId = '5d951cfe-9a49-4b05-8708-c680e205d246';
        $http.defaults.headers.common['PROJECT-ID'] = '5d951cfe-9a49-4b05-8708-c680e205d246';
        $rootScope.hidePriceLogin = false;
        $rootScope.createCustomerActive = true;
        $rootScope.registerExtend = true;
        $rootScope.registerInvoiced = false;
        $rootScope.taxnomySearch = 'web1523988132';
        $rootScope.filterBrand = 'Marca';
        $rootScope.filterSize = false;
        $rootScope.filterType = false;
        $rootScope.filterCategory = 'category';

        $rootScope.$on('$locationChangeSuccess', function () {
            $('#header-mainMenu').collapse('hide');

        });
        //various config
        $rootScope.initConfig = {
            googleKey: 'UA-101539944-1',
            meta_color: '#337ab7',
            img_default: '../../img/img-default.jpg',
            email: 'ventas@hannypulidocosméticos.com.mx',
            phone: '33 2257 3971',
            branchOffice: 'Hanny Pulido Cosméticos'

        };
        // initialise google analytics
        $window.ga('create', $rootScope.initConfig.googleKey, '');
        // do something when change state
        $rootScope.$on('$stateChangeSuccess', function (event) {
            $window.ga('send', 'pageview', $location.path());
            $window.ga('require', 'displayfeatures');
            // Init var post for meta tags index
            $rootScope.post = {
                'title': 'Hanny Pulido Cosméticos',
                'excerpt': '',
                'urlImages': {
                    'original': $rootScope.initConfig.img_default
                }
            };
            $anchorScroll();
        });
        // init for page title
        $rootScope.pageTitle = 'Hanny Pulido Cosméticos';

        function showResponsive($window) {
            return $window.innerWidth <= 768;

        }

        $rootScope.showResponsive = showResponsive($window);
        $rootScope.$on('HTTP_ERROR', function (event, args) {
            $state.go(args.error);
        });


        if (!$rootScope.mainNavMenu) {
            TaxonomySrv.query({
                parent: '135876e2-073c-4b78-ba70-ced68dd0bc4c',
                isActive: 'True',
                ordering: 'order'
            }).$promise.then(function (response) {
                $rootScope.mainNavMenu = response;
            }, function (error) {
            });
        }

        if (!$rootScope.fastLink) {
            EntrySrv.get({
                taxonomies: 'enlaces-rapidos',
                isActive: 'True',
                pageSize: 6,
                ordering: 'createdAt',
                fields: 'title,link,excerpt,content'
            }).$promise.then(function (results) {
                $rootScope.fastLink = results.results;
            });

        }

        if (!$rootScope.branchOffices) {
            EntrySrv.get({
                taxonomies: 'sucursales1524609885',
                isActive: 'True',
                pageSize: 5,
                ordering: 'createdAt',
                fields: 'title,link,excerpt,content'
            }).$promise.then(function (results) {
                $rootScope.branchOffices = results.results;
            });

        }

        if (!$rootScope.contactData) {
            EntrySrv.get({
                taxonomies: 'datos-de-contacto1524609897',
                isActive: 'True',
                pageSize: 5,
                ordering: 'createdAt',
                fields: 'title,link,excerpt,content'
            }).$promise.then(function (results) {
                $rootScope.contactData = results.results;
            });

        }

        if (!$rootScope.information) {
            EntrySrv.get({
                taxonomies: 'informacion1524609853',
                isActive: 'True',
                pageSize: 5,
                ordering: 'createdAt',
                fields: 'title,link,excerpt,content,slug'
            }).$promise.then(function (results) {
                $rootScope.information = results.results;
            });
        }

        if (!$rootScope.socialMedia) {
            EntrySrv.get({
                taxonomies: 'redes-sociales1524609908',
                isActive: 'True',
                pageSize: 6,
                ordering: 'createdAt',
                fields: 'title,content,attachments,slug,excerpt,link'
            }).$promise.then(function (results) {
                $rootScope.socialMedia = results.results;
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
                if ($state.current.name !== '500' && $state.current.name !== '400') {
                    $state.go('register');
                }
            }
        });

        //init $localStorage.appData
        if (!angular.isDefined($localStorage.appData)) {
            $localStorage.appData = {};
        }

        //init $localStorage.appData
        if (!angular.isDefined($localStorage.globalDiscount)) {
            $localStorage.globalDiscount = {amount: 0};
        }
        if (!angular.isDefined($localStorage.promoTotal)) {
            $localStorage.promoTotal = 0;
        }
        if (!angular.isDefined($localStorage.ship)) {
            $localStorage.ship = false;
        }

        if (!angular.isDefined($localStorage.priceList)) {
            $localStorage.priceList = '';
        }

        $rootScope.$on('UNAUTHORIZED', function (event, args) {
            if ($state.current.name !== 'register') {
                $auth.logout()
                    .then(function () {
                        // delete appData
                        delete $localStorage.appData;
                        delete $localStorage.cart;
                        delete $localStorage.items;
                        delete $localStorage.total;
                        // Desconectamos al usuario y lo redirijimos
                        if ($state.current.name !== 'register') {
                            //NotificationSrv.error('Tu sesión ha caducado por favor inicia sesión de nuevo');
                            $state.go('register');
                        }
                    })
                    .catch(function (response) {
                        // Handle errors here, such as displaying a notification
                        console.log(response);
                    });
            }
        });

    }

    angular.module('annalise', ['ui.router', 'ts.controllers', 'ts.directives', 'ts.filters', 'ngSanitize', 'app.templates',
        'infinite-scroll', 'akoenig.deckgrid', 'ngAnimate', 'ui.bootstrap', 'ocNgRepeat', 'blockUI',
        'duScroll', 'truncate', 'ngTouch', 'ngStorage', 'ngStorage', 'oitozero.ngSweetAlert', 'satellizer', 'auth.app',
        'shop.app', 'ngMessages', 'ui.select', 'ngTable', 'ngMaterial', 'angulartics.google.analytics', 'ngFileUpload'])
        .config(Routes)
        .config(AppConfig)
        .config(AuthProvider)
        .run(Run);

    Run.$inject = ['$http', '$rootScope', '$state', '$window', '$location', 'TaxonomySrv', '$anchorScroll',
        'EntrySrv', '$auth', '$localStorage'];
    Routes.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];
    AppConfig.$inject = ['$httpProvider', 'blockUIConfig', '$uiViewScrollProvider'];
    AuthProvider.$inject = ['$authProvider'];
})();
