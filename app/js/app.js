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
                data: {pageTitle: ' Monbelyy - Ceramic Tiles'},
                views: {
                    'content': {
                        templateUrl: '/templates/blog.html',
                        controllerAs: 'Post',
                        controller: 'PostCtrl'
                    }
                }
            })
            .state('category', {
                url: '/category/:slug?page&pageSize&ordering&cat&brand&search',
                data: {pageTitle: ' Monbelyy - Ceramic Tiles'},
                views: {
                    'content': {
                        templateUrl: '/templates/categories.html',
                        controllerAs: 'Product',
                        controller: 'ProductsByCategoryCtrl',
                        params: {page: null, pageSize: null, sort: null, search: null}
                    }
                }
            })
            .state('search', {
                url: '/busqueda?q&kind&page&pageSize',
                params: {
                    q: null,
                    kind: null,
                    page: null,
                    pageSize: null
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
                data: {pageTitle: 'Monbelyy - Ceramic Tiles'},
                views: {
                    'content': {
                        templateUrl: '/templates/product-detail.html',
                        controllerAs: 'Product',
                        controller: 'ProductDetailCtrl'
                    }
                }
            })
            .state('suspended', {
                url: '/suspended',
                views: {
                    'suspended': {
                        templateUrl: '/templates/suspended.html'
                    }
                }
            })
            .state('building', {
                url: '/building',
                views: {
                    'building': {
                        templateUrl: '/templates/building.html'
                    }
                }
            })
            .state('referrer', {
                url: '/ref/seller/:project/:seller',
                data: {pageTitle: ' Monbelyy - Ceramic Tiles'},
                views: {
                    'content': {
                        templateUrl: '/templates/home.html',
                        controllerAs: 'Home',
                        controller: 'HomeCtrl'
                    }
                }
            }).state('services',{
                url: '/services',
                data: {pageTitle: ' Monbelyy - Ceramic Tiles'},
                views: {
                    'content': {
                        templateUrl: '/templates/services.html',
                        controllerAs: 'Service',
                        controller: 'ServiceCtrl'
                    }
                }

            })
            .state('service-detail', {
                url: '/service/detail/:slug\.html',
                data: {pageTitle: ' Monbelyy - Ceramic Tiles'},
                views: {
                    'content': {
                        templateUrl: '/templates/service-detail.html',
                        controllerAs: 'Service',
                        controller: 'ServiceCtrl'
                    }
                }
            })
            .state('best-seller', {
                url: '/best-seller',
                data: {},
                views: {
                    'content': {
                        templateUrl: '/templates/best-seller.html',
                        controllerAs: 'Home',
                        controller: 'BestSellerCtrl'

                    }
                }
            });

        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(true);
    }

    function AppConfig($httpProvider, blockUIConfig, $uiViewScrollProvider, StripeElementsProvider) {
        blockUIConfig.templateUrl = '/templates/partials/block-ui.html';
        // Change the default overlay message
        blockUIConfig.message = 'Cargando...';

        // Change the default delay to 100ms before the blocking is visible
        blockUIConfig.delay = 0;

        // Set interceptor
        $httpProvider.interceptors.push('HttpInterceptor');
        $uiViewScrollProvider.useAnchorScroll();

        // Stripe provider
        StripeElementsProvider.setAPIKey('pk_live_51HfDHWKc0VAeqCwdpYga0Jky5Epq1iGJLecR0l3ayGr8Bq1iBKdFIMnpKxjW2P7cti6aLzoIv2443wnWx8K3QBlN00RssQuZXo')

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
    function Run($http, $rootScope, $state, $window, $location, TaxonomySrv, $anchorScroll, EntrySrv, $auth,
                 $localStorage, MMOrderSrv, $sessionStorage) {
        $rootScope.$state = $state;
        $rootScope.host = 'https://mercadomovil.com.mx';
        $rootScope.hostAnnalise = 'https://mercadomovil.com.mx';
        $rootScope.apiV = 'v1';
        $rootScope.apiShop = 'v3'

        var projectId = '2e04ff91-ba48-49d8-93ac-5d695bb2fb33';
        $rootScope.projectId = projectId;
        $http.defaults.headers.common['PROJECT-ID'] = projectId;
        $rootScope.hidePriceLogin = false;
        $rootScope.createCustomerActive = true;
        $rootScope.registerExtend = true;
        $rootScope.registerInvoiced = false;
        $rootScope.taxnomySearch = false;
        $rootScope.filterBrand = false;
        $rootScope.filterSize = false;
        $rootScope.filterType = false;
        $rootScope.filterCategory = 'category';
        $rootScope.itemsKind = 'product';
        $rootScope.showWeb = true;
        $rootScope.priceList = true;
        $rootScope.multiplePrices = false;
        $rootScope.guestPurchase = false;
        //cambiar el slug de las listas
        $rootScope.multiplePricesConfig = {
            "limit": 1, "prices": {
                "price": "tienda-en-linea",
                "priceList": "tienda-en-linea"
            }
        };
        $rootScope.itemsByPage = 12;
        $rootScope.curentyear = new Date().getFullYear();
        var checkStatus = function () {
            MMOrderSrv.status({'projectId': $rootScope.projectId}).$promise.then(function (data) {
            }, function (error) {
                $rootScope.hideIndex = false;
                if (error.status === 402) {
                    $state.go('suspended');
                    $rootScope.hideIndex = true;
                }
                else if (error.status === 307) {
                    $state.go('building');
                    $rootScope.hideIndex = true;
                }
                else {
                    $rootScope.hideIndex = false;
                }
            });

        };

        $rootScope.$on('$locationChangeSuccess', function () {
            $('#header-mainMenu').collapse('hide');
            //checkStatus();
        }); 
        //various config
        $rootScope.initConfig = {
            googleKey: 'G-S7HJ8BR1XK',
            meta_color: '#337ab7',
            img_default: '../img/img-default.jpg',
            logo: '../img/logo.jpg',
            email: 'ventas@monbelyy.mx',
            phone: '353 123 71 64',
            branchOffice: 'Monbelyy - Ceramic Tiles'

        };

        $rootScope.post = {
            'title': 'Monbelyy - Ceramic Tiles',
            'excerpt': '',
            'urlImages': {
                'original': "../img/img-default.jpg"
            }
        };
        // always we must do a request on init app to know current status of project
        // can be two status 307 && 402

        // do something when change state
        $rootScope.$on('$stateChangeSuccess', function (event) {
            $window.ga('send', 'pageview', $location.path());
            $window.ga('require', 'displayfeatures');
            // Init var post for meta tags index
            $rootScope.post = {
                'title': ' Monbelyy - Ceramic Tiles',
                'excerpt': '',
                'urlImages': {
                    'original': $rootScope.initConfig.img_default
                }
            };
            $anchorScroll();
        });
        // init for page title
        $rootScope.pageTitle = ' Monbelyy - Ceramic Tiles';

        function showResponsive($window) {
            return $window.innerWidth <= 768;

        }

        $rootScope.showResponsive = showResponsive($window);
        $rootScope.$on('HTTP_ERROR', function (event, args) {
            $state.go(args.error);
        });


        if (!angular.isDefined($sessionStorage.mainNavMenu)) {
            TaxonomySrv.query({
                parent: '79fe98e9-7538-4a8f-9210-196aded69430',
                isActive: 'True',
                ordering: 'order'
            }).$promise.then(function (response) {
                $rootScope.mainNavMenu = response;
                $sessionStorage.mainNavMenu = response;
            }, function (error) {
            });
        }
        else{
            $rootScope.mainNavMenu = $sessionStorage.mainNavMenu;
        }

        if (!angular.isDefined($sessionStorage.mainNavMenuHelp)) {
            TaxonomySrv.query({
                parent: 'db0a79d5-b467-47ac-aa8a-d574e33945de',
                isActive: 'True',
                ordering: 'order'
            }).$promise.then(function (response) {
                $rootScope.mainNavMenuHelp = response;
                $sessionStorage.mainNavMenuHelp = response;
            }, function (error) {
            });
        }else{
            $rootScope.mainNavMenuHelp = $sessionStorage.mainNavMenuHelp;
        }

        if (!angular.isDefined($sessionStorage.clientService)) {
            EntrySrv.get({
                taxonomies: 'servicio-al-cliente',
                isActive: 'True',
                pageSize: 5,
                ordering: 'createdAt',
                fields: 'title,link,excerpt,content'
            }).$promise.then(function (results) {
                $rootScope.clientService = results.results;
                $sessionStorage.clientService = results.results;
            });

        }else{
            $rootScope.clientService = $sessionStorage.clientService;
        }

        if (!angular.isDefined($sessionStorage.categoryProducts)) {
            EntrySrv.get({
                taxonomies: 'categorias-de-producto',
                isActive: 'True',
                pageSize: 4,
                ordering: 'createdAt',
                fields: 'title,link,excerpt,content'
            }).$promise.then(function (results) {
                $rootScope.categoryProducts = results.results;
                $sessionStorage.categoryProducts = results.results;
                //get featureImage
                angular.forEach(self.categoryProducts, function (obj, ind) {
                    obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
                });
            });

        }else{
            $rootScope.categoryProducts = $sessionStorage.categoryProducts;
        }

        if (!angular.isDefined($sessionStorage.contactData)) {
            EntrySrv.get({
                taxonomies: 'datos-de-contacto',
                isActive: 'True',
                pageSize: 5,
                ordering: 'createdAt',
                fields: 'title,link,excerpt,content'
            }).$promise.then(function (results) {
                $rootScope.contactData = results.results;
                $sessionStorage.contactData = results.results;
            });

        }else{
            $rootScope.contactData = $sessionStorage.contactData;
        }

        if (!angular.isDefined($sessionStorage.information)) {
            EntrySrv.get({
                taxonomies: 'informacion',
                isActive: 'True',
                pageSize: 5,
                ordering: 'createdAt',
                fields: 'title,link,excerpt,content,slug'
            }).$promise.then(function (results) {
                $rootScope.information = results.results;
                $sessionStorage.information = results.results;
            });
        }

        if (!angular.isDefined($sessionStorage.socialMedia)) {
            EntrySrv.get({
                taxonomies: 'redes-sociales',
                isActive: 'True',
                pageSize: 6,
                ordering: 'createdAt',
                fields: 'title,content,attachments,slug,excerpt,link'
            }).$promise.then(function (results) {
                $rootScope.socialMedia = results.results;
                $sessionStorage.socialMedia = results.results;
            });
        }else{
            $rootScope.socialMedia = $sessionStorage.socialMedia;
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
        if (!angular.isDefined($localStorage.cartId)) {
            $localStorage.cartId = '';
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
        'akoenig.deckgrid', 'ngAnimate', 'ui.bootstrap', 'blockUI', 'duScroll', 'truncate', 'ngTouch', 'ngStorage',
        'ngStorage', 'oitozero.ngSweetAlert', 'satellizer', 'auth.app', 'shop.app', 'ngMessages', 'ui.select',
        'ngTable', 'ngMaterial', 'angulartics.google.analytics', 'ngFileUpload', 'wipImageZoom', 'angularjs-stripe-elements'])
        .config(Routes)
        .config(AppConfig)
        .config(AuthProvider)
        .run(Run);

    Run.$inject = ['$http', '$rootScope', '$state', '$window', '$location', 'TaxonomySrv', '$anchorScroll',
        'EntrySrv', '$auth', '$localStorage', 'MMOrderSrv', '$sessionStorage'];
    Routes.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];
    AppConfig.$inject = ['$httpProvider', 'blockUIConfig', '$uiViewScrollProvider', 'StripeElementsProvider'];
    AuthProvider.$inject = ['$authProvider'];
})();
