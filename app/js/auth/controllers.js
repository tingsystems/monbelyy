(function () {
    'use strict';

    function AccessCtrl(AccessSrv, $auth, $state, $localStorage, $scope, $rootScope, $filter, NotificationSrv, $http, AuthorizationGroupSrv) {
        var self = this;
        self.processing = false;

        // Logic for save the session
        self.saveSession = function (response) {
            // save user info to local storage
            $localStorage.appData = { user: angular.copy(response.data.user) };
            $scope.app.data = $localStorage.appData;
            // Redirect user here after a successful log in.
            // save the site list and the current site in the localStorage and the scope
            var group = AuthorizationGroupSrv.authorize([{ list: ['admin'], kind: 'OR' }]);
            var editor = AuthorizationGroupSrv.authorize([{ list: ['editor'], kind: 'OR' }]);
            // logic for save project see 635 controller annalise
            var projects = $localStorage.appData.user.projects;
            $rootScope.projects = projects;
            var project = $filter('filter')(projects, { 'default': true });
            if (projects.length > 1) {
                $rootScope.projectAccess = project[0].level;
                $rootScope.projectId = project[0].id;
                $http.defaults.headers.common['PROJECT-ID'] = $rootScope.projectId;
                $localStorage.appData.curentProject = project[0];
                $state.go('app.projects.list');
            } else {
                // if there are not default site redirect to sites list
                $rootScope.projectAccess = project[0].level;
                $rootScope.projectId = project[0].id;
                $http.defaults.headers.common['PROJECT-ID'] = $rootScope.projectId;
                $localStorage.appData.curentProject = project[0];
                if (editor) {
                    $state.go('app.content.list');
                }
                else {
                    $state.go('app.pos.pos');
                }
            }
        };

        // Social auth
        self.authenticate = function (provider) {
            $auth.authenticate(provider).then(function (response) {
                self.saveSession(response);
            }).catch(function (response) {
                // Handle errors here, such as displaying a notification
                // for invalid email and/or password.
                self.processing = false;
            });

        };
        // Application for oauth authorization
        self.client_id = '6JxWPajUJCd4GW7o3oTfuysw8HJfnl6V6AGWWdLR';
        // Login with username and password
        self.login = function () {
            // ajax request to send the formData
            self.processing = true;
            self.formData.grant_type = 'password';
            self.formData.client_id = self.client_id;
            $auth.login(self.formData)
                .then(function (response) {
                    self.saveSession(response);
                })
                .catch(function (response) {
                    // Handle errors here, such as displaying a notification
                    // for invalid email and/or password.
                    self.processing = false;
                    NotificationSrv.error('Usuario o contraseña incorrectos');
                });
        };

        self.isAuthenticated = function () {
            return $auth.isAuthenticated();
        };

        self.logout = function () {
            AccessSrv.logout({ token: $auth.getToken(), client_id: self.client_id }).$promise.then(function (data) {
                $auth.logout()
                    .then(function () {
                        // delete appData
                        delete $localStorage.appData;
                        $rootScope.myApps = {};
                        // Desconectamos al usuario y lo redirijimos
                        if ($state.current.name != 'access.signin') {
                            $state.go('access.signin');
                        }
                    })
                    .catch(function (response) {
                        // Handle errors here, such as displaying a notification
                        console.log(response);
                    });
            });
        };
    }

    function RegisterCtrl(RegisterSrv, StateSrv, NotificationSrv, $state) {
        var self = this;
        self.busy = false;
        self.formData = {};

        self.createAccount = function() {
            var account = angular.copy(self.formData);
            RegisterSrv.save(account).$promise.then(function(data){
                NotificationSrv.success('Cuenta creada correctamente', 'Ya falto poco para pertenecer a Corrinte Alterna');
                self.formData = {};
                $state.go('success');
            }, function(error){
                angular.forEach(error.data, function(key, value){
                    NotificationSrv.error(key,value);
                })
            })
        }
    }

    function RecoveryPasswordCtrl(RegisterSrv, NotificationSrv, $state, $stateParams) {
        var self = this;
        self.formData = {};
        self.recoveryPassword = function () {
            self.busy = true;
            RegisterSrv.recovery(self.formData).$promise.then(function (data) {
                NotificationSrv.success('Le hemos enviado un email para recuperar su contraseña');
                self.busy = false;
                $state.go('access.signin');
            }, function (error) {
                self.busy = false;
                angular.forEach(error.data, function (value, key) {
                    NotificationSrv.error(value);
                });
            });
        };

        if ($stateParams.token) {
            self.busy = true;
            RegisterSrv.getByToken({ token: $stateParams.token }).$promise.then(function (data) {
                self.busy = false;
            }, function (error) {
                self.busy = false;
                angular.forEach(error.data, function (value, key) {
                    NotificationSrv.error(value);
                });
            });
        }

        self.setPassword = function () {
            self.busy = true;
            if (self.formData.password2 != self.formData.password) {
                NotificationSrv.error('Las contraseñas no coinciden');
                return
            }
            RegisterSrv.set({ token: $stateParams.token }, self.formData).$promise.then(function (data) {
                NotificationSrv.success("Contraseña actualizada correctamente");
                self.busy = false;
                $state.go('access.signin');
            }, function (error) {
                self.busy = false;
                angular.forEach(error.data, function (value, key) {
                    NotificationSrv.error(value);
                });
            });
        };
    }

    function ValidAccountCtrl(UserSrv, NotificationSrv, $state, $stateParams) {
        UserSrv.active({ token: $stateParams.token }, { 'is_active': true }).$promise.then(function (data) {
            console.log(data);
            NotificationSrv.success('Cuenta activada correctamente!');
        }, function (error) {
        });
    }

    // create the module and assign controllers
    angular.module('auth.controllers', ['auth.services'])
        .controller('AccessCtrl', AccessCtrl)
        .controller('RegisterCtrl', RegisterCtrl)
        .controller('RecoveryPasswordCtrl', RecoveryPasswordCtrl)
        .controller('ValidAccountCtrl', ValidAccountCtrl);

    // inject dependencies to controllers
    AccessCtrl.$inject = ['AccessSrv', '$auth', '$state', '$localStorage', '$scope', '$rootScope', '$filter', 'NotificationSrv', '$http', 'AuthorizationGroupSrv'];
    RegisterCtrl.$inject = ['RegisterSrv', 'StateSrv', 'NotificationSrv', '$state'];
    RecoveryPasswordCtrl.$inject = ['RegisterSrv', 'NotificationSrv', '$state', '$stateParams'];
    ValidAccountCtrl.$inject = ['UserSrv', 'NotificationSrv', '$state', '$stateParams'];
})();
