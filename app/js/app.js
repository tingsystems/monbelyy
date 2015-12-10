'use strict';

(function () {
    /**
     * @name Run
     * @desc Update xsrf $http headers to align with Django's defaults
     */
    function Run($http) {
        $http.defaults.headers.common['TS-TOKEN'] = 'AjFPLkeDMc5InbYZE2gbQiUtzi5F7LxHJE0sPAPb';
    }

    function Routes($stateProvider, $urlRouterProvider) {

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
                    'content': {
                        templateUrl: '/templates/contact.html',
                        controllerAs: 'contact',
                        controller: 'ContactCtrl'
                    }
                }
            })
            .state('blog', {
                url: '/blog/:kind',
                views: {
                    'content': {
                        templateUrl: '/templates/blog.html',
                        controllerAs: 'post',
                        controller: 'PostCtrl'
                    }
                }
            })
            .state('post_detail', {
                url: '/:slug\.html',
                views: {
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
                    'content': {
                        templateUrl: '/templates/projects.html',
                        controllerAs: 'post',
                        controller: 'PostCtrl'
                    }
                }
            });
        $urlRouterProvider.otherwise('/');
    }

    angular.module('annalise', ['ui.router', 'ts.controllers'])
        .config(Routes)
        .run(Run);

    Run.$inject = ['$http'];
    Routes.$inject = ['$stateProvider', '$urlRouterProvider'];
})();
