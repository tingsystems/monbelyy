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
                data: {pageTitle: 'Blue Mia - Especialistas en ropa deportiva para Dama'},
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
                data: {pageTitle: 'Blue Mia - Contactanos'},
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
                data: {pageTitle: 'Blue Mia - Blog'},
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
            .state('product_detail', {
                url: '/detail/:slug',
                views: {
                    'title': {template: '<title>{{pageTitle}}</title>'},
                    'content': {
                        templateUrl: '/templates/product_detail.html',
                        controllerAs: 'Item',
                        controller: 'PostDetailCtrl'
                    }
                }
            })
            .state('category', {
                url: '/category/:slug',
                data: {pageTitle: 'Blue Mia - Especialistas'},
                views: {
                    'content': {
                        templateUrl: '/templates/products.html',
                        controllerAs: 'Post',
                        controller: 'PostCtrl'
                    }
                }
            })
            .state('sports', {
                url: '/sports/:slug',
                views: {
                    'title': {template: '<title>{{pageTitle}}</title>'},
                    'content': {
                        templateUrl: '/templates/sports.html',
                        controllerAs: 'Sport',
                        controller: 'SportCtrl'
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
            });

        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(false);
    }

    function AppConfig(cfpLoadingBarProvider) {
        // turn off the spinner of the loading bar
        cfpLoadingBarProvider.includeSpinner = false;
    }

    /**
     * @name Run
     * @desc Update xsrf $http headers to align with Django's defaults
     */
    function Run($http, $rootScope, $state, $window, $location, TaxonomySrv, PostSrv) {
        $rootScope.$state = $state;
        $http.defaults.headers.common['TS-TOKEN'] = 'bPAUWlNi19ueOvIPac8p8H6GqDy5N93kGjGc1T2T';
        $rootScope.$on('$locationChangeSuccess', function () {
            $('#header-mainmenu').collapse('hide');
        });
        // initialise google analytics
        //$window.ga('create', 'UA-47259316-3', 'tingsystems.com');
        // do something when change state
        $rootScope.$on('$stateChangeSuccess', function (event) {
            //$window.ga('send', 'pageview', $location.path());
            //$window.ga('require', 'displayfeatures');
            // Init var post for meta tags index
            $rootScope.post = {
                'title': 'Tingsystems',
                'excerpt': 'Tingsystems: Tu consultor tecnológico',
                'urlImages': {
                    'original': 'https://www.tingsystems.com/img/logo.png'
                }
            };
        });
        // Get options for "accesorios"
        TaxonomySrv.query({
            parent: '387a3351-3ac6-4bbb-93da-6103d9a8fd8d',
            isActive: 'True',
            fields: 'name,slug'
        }).$promise.then(function (response) {
                $rootScope.accesorios = response;
            });
        // Get options for "ropa"
        TaxonomySrv.query({
            parent: 'c30c8b8a-e19e-4ac4-bfee-8524c3a02d31',
            isActive: 'True',
            fields: 'name,slug'
        }).$promise.then(function (response) {
                $rootScope.ropa = response;
            });
        // Get destacadas
        PostSrv.get({
            category: 'destacado',
            isActive: 'True',
            sizePage: 5,
            ordering: '-createdAt',
            fields: 'title,link,slug,urlImages'
        }).$promise.then(function (results) {
                $rootScope.outstandings = results.results;
            });
        // init for page title
        $rootScope.pageTitle = 'Blue Mia - Especialistas en ropa deportiva para Dama';
        $rootScope.ShopMode = false;

    }

    angular.module('annalise', ['ui.router', 'ts.controllers', 'ts.directives', 'ngSanitize', 'app.templates',
        'angular-loading-bar', 'infinite-scroll', 'akoenig.deckgrid', 'ngAnimate', 'ui.bootstrap', 'ocNgRepeat'])
        .config(Routes)
        .config(AppConfig)
        .run(Run);

    Run.$inject = ['$http', '$rootScope', '$state', '$window', '$location', 'TaxonomySrv', 'PostSrv'];
    Routes.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];
    AppConfig.$inject = ['cfpLoadingBarProvider'];
})();
