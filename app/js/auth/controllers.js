(function () {
    'use strict';

    function AccessCtrl(AccessSrv, CustomerSrv, RegisterSrv, $auth, $state, $localStorage, $rootScope, NotificationSrv) {
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
            $localStorage.appData = {user: angular.copy(response.data.user)};
            $rootScope.user = $localStorage.appData.user;
            delete $localStorage.appData.user.groups;
            delete $localStorage.appData.user.permissions;
            delete $localStorage.appData.user.branchOffices;
            delete $localStorage.appData.user.projects;
            delete $localStorage.appData.user.is_superuser;
            self.idUser = $localStorage.appData.user.id;
            //$scope.app.data = $localStorage.appData;
            // Redirect user here after a successful log in.
            self.getCustomer();
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
            AccessSrv.logout({token: $auth.getToken(), client_id: self.client_id}).$promise.then(function (data) {
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

        self.createAccount = function () {
            var account = angular.copy(self.formData);
            self.busy = true;
            RegisterSrv.save(account).$promise.then(function (data) {
                NotificationSrv.success('Cuenta creada correctamente', 'Ya falto poco para pertenecer a Corriente Alterna');
                self.busy = false;
                self.formData = {};
                $state.go('success');
            }, function (error) {
                angular.forEach(error.data, function (key, value) {
                    NotificationSrv.error(key, value);
                    self.busy = false;
                })
            })
        };

        self.getCustomer = function(){
            CustomerSrv.customerByUser({id: self.idUser}).$promise.then(function (data) {
                $localStorage.appData.user.customer = data.id;
            });
        };

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
            RegisterSrv.getByToken({token: $stateParams.token}).$promise.then(function (data) {
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
            RegisterSrv.set({token: $stateParams.token}, self.formData).$promise.then(function (data) {
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
        UserSrv.active({token: $stateParams.token}, {'is_active': true}).$promise.then(function (data) {
            console.log(data);
            NotificationSrv.success('Cuenta activada correctamente!');
        }, function (error) {
        });
    }

    function AddressCtrl(AddressSrv, NotificationSrv, StateSrv, $localStorage, $rootScope, $state, $stateParams) {

        var self = this;
        self.formData = {};
        self.busy = false;
        self.create = true;
        self.user = $localStorage.appData.user ? $localStorage.appData.user : {};
        $rootScope.user = $localStorage.appData.user;
        self.idUser = $localStorage.appData.user.customer;


        // get all the states
        self.busyState = true;
        StateSrv.query({country: '573fda4d5b0d6863743020d1', ordering: 'name'}).$promise.then(function (data) {
            self.states = data;
            self.busyState = false;
        }, function (error) {
            self.busyState = false;
        });

        self.getCitiesByState = function (state_id) {
            if (!state_id) {
                console.log(state_id);
                self.city = null;
                self.cities = [];
                return
            }
            self.busyCity = true;
            StateSrv.getCities({state: state_id, ordering: 'name'}).$promise.then(function (response) {
                self.cities = response;
                self.busyCity = false;
            }, function (error) {
                self.busyCity = false;
            });
        };

        var createAddress = function () {
            console.log("Crear");
            var address = angular.copy(self.formData);
            address.customer = self.idUser;
            self.busy = true;
            AddressSrv.save(address).$promise.then(function (data) {
                NotificationSrv.success('Domicilio agregado correctamente');
                self.busy = false;
                self.formData = {};
                $state.go('address');
            }, function (error) {
                angular.forEach(error.data, function (key, value) {
                    NotificationSrv.error(key, value);
                    self.busy = false;
                })
            })
        };

        var updateAddress = function () {
            console.log("Actualizar");
            var formData = angular.copy(self.formData);
            var id = formData.id ? formData.id : $stateParams.id;
            self.busy = true;
            AddressSrv.update({ id: id }, formData).$promise.then(function (response) {
                self.busy = false;
                NotificationSrv.success('Dirección actualizada correctamente');
                $state.go('address');
            }, function (error) {
                angular.forEach(error, function (value, key) {
                    NotificationSrv.error(key + ' ' + value);
                });
                self.busy = false;
            });
        };

        self.submitForm = function () {
            self.create ? createAddress() : updateAddress();
        };

        self.getAddresses = function(){
            AddressSrv.get({ id: $stateParams.id}).$promise.then(function (data) {
                self.formData = data;
                self.create = false;
                if(self.formData.state)
                    StateSrv.getCities({ state: self.formData.state, ordering: 'name' }).$promise.then(function (response) {
                            self.cities = response;
                            self.busyCity = false;
                    }, function (error) {
                        self.busyCity = false;
                });
            });
        };
        self.getAddresses();

    }

    function AddressListCtrl(AddressSrv, NotificationSrv, NgTableParams, StateSrv, $localStorage, $rootScope, $timeout, SweetAlert) {

        var self = this;
        var timeout = $timeout;
        self.formData = {};
        self.searchTerm = '';
        self.params = {};
        self.addresses = [];
        self.create = false;
        self.busy = false;
        self.initialState = function () {};
        self.user = $localStorage.appData.user ? $localStorage.appData.user : {};
        $rootScope.user = $localStorage.appData.user;
        self.idUser = $localStorage.appData.user.customer;

        self.globalSearch = function () {
            // Cancels a task associated with the promise
            $timeout.cancel(timeout);
            // Get the products after half second
            timeout = $timeout(function () {
                self.tableParams.page(1);
                self.tableParams.reload();
            }, 500);
        };

        self.getData = function (params) {
            var sorting = '-createdAt';
            // parser for ordering params
            angular.forEach(params.sorting(), function (value, key) {
                sorting = value === 'desc' ? '-' + key : key;
            });

            self.params.page = params.page();
            self.params.pageSize = params.count();
            self.params.ordering = sorting;
            self.params.search = self.searchTerm;

            self.getAddresses();
        };

        self.tableParams = new NgTableParams({
            // default params
            page: 1, // The page number to show
            count: 10 // The number of items to show per page
        }, {
            // default settings
            // page size buttons (right set of buttons in demo)
            //counts: [],
            // determines the pager buttons (left set of buttons in demo)
            paginationMaxBlocks: 13,
            paginationMinBlocks: 2,
            getData: self.getData
        });

        self.getAddresses = function(){
            AddressSrv.query().$promise.then(function (data) {
                self.addresses = data;
                angular.forEach(self.addresses, function (value, key) {
                    if(value.state && value.city){
                        self.getStateName(value.state, key);
                        self.getCityName(value.city, key);
                    }
                })
            });
            //return self.addresses;
        };

        self.getStateName = function(id, ind){
            StateSrv.getState({ id : id}).$promise.then(function (data) {
                self.addresses[ind]["stateName"] = data;
            })
        };

        self.getCityName = function(id, ind){
            StateSrv.getCity({ id : id }).$promise.then(function (data) {
                self.addresses[ind]["cityName"] = data;
            })
        };

        self.deleteAddress = function (id) {
            SweetAlert.swal({
                    title: 'Confirmar',
                    text: 'Se eliminará esta dirección. ¿Está seguro que desea continuar?',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',

                    confirmButtonText: 'Si',
                    cancelButtonText: 'Cancelar',
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                function (isConfirm) {
                    if (isConfirm) {
                        AddressSrv.delete({ id: id }).$promise.then(function (data) {
                            self.tableParams.page(1);
                            self.tableParams.reload();
                            NotificationSrv.success("Acción realizada correctamente");
                        });
                    } else {
                        NotificationSrv.error("Cancelado");
                    }
                })
        };

        self.cancelEdit = function () {
            self.showCustomerForm = false;
            self.create = true;
            self.clearCustomerForm();
        };
    }

    // create the module and assign controllers
    angular.module('auth.controllers', ['auth.services'])
        .controller('AccessCtrl', AccessCtrl)
        .controller('RecoveryPasswordCtrl', RecoveryPasswordCtrl)
        .controller('ValidAccountCtrl', ValidAccountCtrl)
        .controller('AddressCtrl', AddressCtrl)
        .controller('AddressListCtrl', AddressListCtrl);


    // inject dependencies to controllers
    AccessCtrl.$inject = ['AccessSrv', 'CustomerSrv', 'RegisterSrv', '$auth', '$state', '$localStorage', '$rootScope', 'NotificationSrv'];
    RecoveryPasswordCtrl.$inject = ['RegisterSrv', 'NotificationSrv', '$state', '$stateParams'];
    ValidAccountCtrl.$inject = ['UserSrv', 'NotificationSrv', '$state', '$stateParams'];
    AddressCtrl.$inject = ['AddressSrv', 'NotificationSrv', 'StateSrv', '$localStorage', '$rootScope', '$state', '$stateParams'];
    AddressListCtrl.$inject = ['AddressSrv', 'NotificationSrv', 'NgTableParams', 'StateSrv', '$localStorage', '$rootScope', '$timeout', 'SweetAlert'];
})();
