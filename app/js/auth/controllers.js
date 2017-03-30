(function () {
    'use strict';

    function AccessCtrl(AccessSrv, RegisterSrv, $auth, $state, $localStorage, $rootScope, NotificationSrv) {
        var self = this;
        self.busy = false;
        self.formData = {};
        self.formDataLogin = {};
        self.user = $localStorage.appData.user ? $localStorage.appData.user : {};
        $rootScope.user = $localStorage.appData.user;
        self.processing = false;

        // Logic for save the session
        self.saveSession = function (response) {
            // save user info to local storage
            $localStorage.appData = { user: angular.copy(response.data.user) };
            $rootScope.user = $localStorage.appData.user;
            delete $localStorage.appData.user.groups;
            delete $localStorage.appData.user.permissions;
            delete $localStorage.appData.user.branchOffices;
            delete $localStorage.appData.user.projects;
            delete $localStorage.appData.user.is_superuser;
            //$scope.app.data = $localStorage.appData;
            // Redirect user here after a successful log in.
            $state.go('dashboard');
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
        self.client_id = 'ppUsGThJxz4Oip9nfG1hfmg6dzOQ8f5SH3NDEjkU';
        // Login with username and password
        self.login = function () {
            // ajax request to send the formData
            self.processing = true;
            self.formDataLogin.grant_type = 'password';
            self.formDataLogin.client_id = self.client_id;
            $auth.login(self.formDataLogin)
                .then(function (response) {
                    self.saveSession(response);
                    console.log(response);
                })
                .catch(function (response) {
                    // Handle errors here, such as displaying a notification
                    // for invalid email and/or password.
                    self.processing = false;
                    console.log(response);
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
                        delete $localStorage.appData.user;
                        // Desconectamos al usuario y lo redirijimos
                        if ($state.current.name != 'register') {
                            NotificationSrv.success("Te esperamos pronto", "Corriente Alterna");
                            $state.go('home');
                        }
                    })
                    .catch(function (response) {
                        // Handle errors here, such as displaying a notification
                        console.log(response);
                    });
            });
        };

        self.createAccount = function() {
            var account = angular.copy(self.formData);
            self.busy = true;
            RegisterSrv.save(account).$promise.then(function(data){
                NotificationSrv.success('Cuenta creada correctamente', 'Ya falto poco para pertenecer a Corriente Alterna');
                self.busy = false;
                self.formData = {};
                $state.go('success');
            }, function(error){
                angular.forEach(error.data, function(key, value){
                    NotificationSrv.error(key,value);
                    self.busy = false;
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
        .controller('RecoveryPasswordCtrl', RecoveryPasswordCtrl)
        .controller('ValidAccountCtrl', ValidAccountCtrl);

    // inject dependencies to controllers
    AccessCtrl.$inject = ['AccessSrv', 'RegisterSrv', '$auth', '$state', '$localStorage', '$rootScope', 'NotificationSrv'];
    RecoveryPasswordCtrl.$inject = ['RegisterSrv', 'NotificationSrv', '$state', '$stateParams'];
    ValidAccountCtrl.$inject = ['UserSrv', 'NotificationSrv', '$state', '$stateParams'];
})();
