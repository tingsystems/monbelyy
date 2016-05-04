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
                views: {
                    'title': {template: '<title>Blue Mia - Contacto</title>'},
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
                    'title': {template: '<title>Blue Mia - Blog</title>'},
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
            .state('projects', {
                url: '/projects/:kind',
                views: {
                    'title': {template: '<title>Blue Mia - Projectos</title>'},
                    'content': {
                        templateUrl: '/templates/projects.html',
                        controllerAs: 'project',
                        controller: 'PostCtrl'
                    }
                }
            })
            .state('project_detail', {
                url: '/projects/detail/:slug',
                views: {
                    'title': {template: '<title>{{pageTitle}}</title>'},
                    'content': {
                        templateUrl: '/templates/project_detail.html',
                        controllerAs: 'project',
                        controller: 'PostDetailCtrl'
                    }
                }
            })
            .state('post_category', {
                url: '/category/:slug',
                data: {pageTitle: 'Blue Mia - Especialistas'},
                views: {
                    'content': {
                        templateUrl: '/templates/projects.html',
                        controllerAs: 'Post',
                        controller: 'PostCtrl'
                    }
                }
            })
            .state('category', {
                url: '/cate/:slug',
                data: {pageTitle: 'Blue Mia - Especialistas'},
                views: {
                    'content': {
                        templateUrl: '/templates/categories.html',
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
            });
        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(true);
    }

    function AppConfig(cfpLoadingBarProvider) {
        // turn off the spinner of the loading bar
        cfpLoadingBarProvider.includeSpinner = false;
    }

    /**
     * @name Run
     * @desc Update xsrf $http headers to align with Django's defaults
     */
    function Run($http, $rootScope, $state, $window, $location, TaxonomySrv) {
        $rootScope.$state = $state;
        $http.defaults.headers.common['TS-TOKEN'] = 'bPAUWlNi19ueOvIPac8p8H6GqDy5N93kGjGc1T2T';
        $rootScope.$on('$locationChangeSuccess', function () {
            $('#header-mainmenu').collapse('hide');
        });
        // initialise google analytics
        $window.ga('create', 'UA-47259316-3', 'tingsystems.com');
        // do something when change state
        $rootScope.$on('$stateChangeSuccess', function (event) {
            $window.ga('send', 'pageview', $location.path());
            $window.ga('require', 'displayfeatures');
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
        // intit for page title
        $rootScope.pageTitle = 'Blue Mia - Especialistas en ropa deportiva para Dama'

    }

    angular.module('annalise', ['ui.router', 'ts.controllers', 'ts.directives', 'ngSanitize', 'app.templates', 'angular-loading-bar', 'infinite-scroll', 'ui.bootstrap'])
        .config(Routes)
        .config(AppConfig)
        .run(Run);

    Run.$inject = ['$http', '$rootScope', '$state', '$window', '$location', 'TaxonomySrv'];
    Routes.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];
    AppConfig.$inject = ['cfpLoadingBarProvider'];
})();
