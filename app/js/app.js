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
                data: {pageTitle: 'Laredo y Asociados - Inicio'},
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
                data: {pageTitle: 'Laredo y Asociados - Contacto'},
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
                data: {pageTitle: 'Laredo y Asociados - Blog'},
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
                data: {pageTitle: 'Laredo y Asociados'},
                views: {
                    'content': {
                        templateUrl: '/templates/categories.html',
                        controllerAs: 'Post',
                        controller: 'PostCtrl'
                    }
                }
            })
            .state('category_project', {
                url: '/project/category/:slug',
                data: {pageTitle: 'Laredo y Asociados'},
                views: {
                    'content': {
                        templateUrl: '/templates/project.html',
                        controllerAs: 'Post',
                        controller: 'PostCtrl'
                    }
                }
            })
            .state('project_detail', {
                url: '/project/:slug',
                views: {
                    'title': {template: '<title>{{pageTitle}}</title>'},
                    'content': {
                        templateUrl: '/templates/project_detail.html',
                        controllerAs: 'Item',
                        controller: 'PostDetailCtrl'
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
        $locationProvider.html5Mode(true);
    }

    function AppConfig(blockUIConfig) {
        // Change the default overlay message
        blockUIConfig.message = 'Cargando...';

        // Change the default delay to 100ms before the blocking is visible
        blockUIConfig.delay = 90;

    }

    /**
     * @name Run
     * @desc Update xsrf $http headers to align with Django's defaults
     */
    function Run($http, $rootScope, $state, $window, $location, TaxonomySrv, PostSrv, $anchorScroll) {
        $rootScope.$state = $state;
        $http.defaults.headers.common['TS-TOKEN'] = 'uOVTXJTCEQ7EDNpGlzvlJvDTv0NY1OF1OWCEtk3P';
        $rootScope.$on('$locationChangeSuccess', function () {
            $('#header-mainmenu').collapse('hide');
        });
        // initialise google analytics
        //$window.ga('create', 'UA-53555832-27', '');
        // do something when change state
        $rootScope.$on('$stateChangeSuccess', function (event) {
            //$window.ga('send', 'pageview', $location.path());
            //$window.ga('require', 'displayfeatures');
            // Init var post for meta tags index
            $rootScope.post = {
                'title': 'Laredo y Asociados',
                'excerpt': 'Somos una una solución efectiva de gestión de cobro concebida por profesionales del derecho y del recobro con experiencia en el sector de recuperación de deudas.',
                'urlImages': {
                    'original': 'http://www.viveenarmonia.com.mx/img/img-default.jpg'
                }
            };
            $anchorScroll();
        });
        // init for page title
        $rootScope.pageTitle = 'Laredo y Asociados';
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

    }

    angular.module('annalise', ['ui.router', 'ts.controllers', 'ts.directives', 'ts.filters', 'ngSanitize', 'app.templates',
        'infinite-scroll', 'akoenig.deckgrid', 'ngAnimate', 'ui.bootstrap', 'ocNgRepeat', 'blockUI', 'angular-toasty','duScroll'])
        .config(Routes)
        .config(AppConfig)
        .run(Run);

    Run.$inject = ['$http', '$rootScope', '$state', '$window', '$location', 'TaxonomySrv', 'PostSrv', '$anchorScroll'];
    Routes.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];
    AppConfig.$inject = ['blockUIConfig'];
})();
