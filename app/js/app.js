(function () {
    'use strict';

    function Routes($stateProvider, $urlRouterProvider, $locationProvider) {

        $stateProvider
            .state('index', {
                url: '/',
                abstract: true,
                templateUrl: '/static/app/index.html',
                controllerAs: 'home',
                controller: 'HomeCtrl'
            })
            .state('home', {
                url: '/',
                views: {
                    'title': {template: '<title>Tingsystems - Tu consultor tecnológico</title>'},
                    'content': {
                        templateUrl: '/templates/home.html',
                        controllerAs: 'home',
                        controller: 'HomeCtrl'
                    }
                }
            })
            .state('contact', {
                url: '/contact',
                views: {
                    'title': {template: '<title>Tingsystems - Contacto</title>'},
                    'content': {
                        templateUrl: '/templates/contact.html',
                        controllerAs: 'contact',
                        controller: 'ContactCtrl'
                    }
                }
            })
            .state('blog', {
                url: '/blog',
                views: {
                    'title': {template: '<title>Tingsystems - Blog</title>'},
                    'content': {
                        templateUrl: '/templates/blog.html',
                        controllerAs: 'post',
                        controller: 'BlogCtrl'
                    }
                }
            })
            .state('post_detail', {
                url: '/:slug\.html',
                views: {
                    'title': { template: '<title>{{pageTitle}}</title>' },
                    'content': {
                        templateUrl: '/templates/single.html',
                        controllerAs: 'post',
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
                        controllerAs: 'page',
                        controller: 'PostDetailCtrl'
                    }
                }
            })
            .state('projects', {
                url: '/projects/:kind',
                views: {
                    'title': {template: '<title>Tingsystems - Projectos</title>'},
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
                    'title': { template: '<title>{{pageTitle}}</title>' },
                    'content': {
                        templateUrl: '/templates/project_detail.html',
                        controllerAs: 'project',
                        controller: 'PostDetailCtrl'
                    }
                }
            });
        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(true);
    }

    function AppConfig(cfpLoadingBarProvider){
        // turn off the spinner of the loading bar
        cfpLoadingBarProvider.includeSpinner = false;
    }
    
    /**
     * @name Run
     * @desc Update xsrf $http headers to align with Django's defaults
     */
    function Run($http, $rootScope) {
        $http.defaults.headers.common['TS-TOKEN'] = 'MTej3ZSvJquIbp2gByoFBUJKeS7mtOJ05GOt9dqx';
        $rootScope.$on('$locationChangeSuccess', function () {
            $('#header-mainmenu').collapse('hide');
        });
    }

    angular.module('annalise', ['ui.router', 'ts.controllers', 'ts.directives','ngSanitize', 'app.templates', 'angular-loading-bar', 'infinite-scroll'])
        .config(Routes)
        .config(AppConfig)
        .run(Run);

    Run.$inject = ['$http', '$rootScope'];
    Routes.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];
    AppConfig.$inject = ['cfpLoadingBarProvider'];
})();
