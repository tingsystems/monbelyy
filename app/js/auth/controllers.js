(function () {
    'use strict';

    function AccessCtrl(AccessSrv, CustomerSrv, RegisterSrv, $auth, $state, $localStorage, $rootScope, NotificationSrv,
                        PriceListSrv) {
        var self = this;
        self.busy = false;
        self.formData = {};
        self.formDataLogin = {};
        if ($localStorage.appData) {
            $rootScope.user = $localStorage.appData.user;
        }

        self.items = $localStorage.items ? $localStorage.items : [];
        self.itemCount = self.items.length;

        self.processing = false;

        // Logic for save the session
        self.saveSession = function (response) {
            // save user info to local storage
            $localStorage.appData = {user: angular.copy(response.data.user)};
            $rootScope.user = $localStorage.appData.user;
            self.idUser = $localStorage.appData.user.id;
            CustomerSrv.customerByUser({id: self.idUser}).$promise.then(function (data) {
                $localStorage.appData.user.customer = data.id;
                $localStorage.appData.user.firstName = data.firstName;
                self.branchDefault = {branchOffices: [$localStorage.appData.user.branchOffices[0].id]};
                PriceListSrv.customer({customers: $localStorage.appData.user.customer}).$promise.then(function (data) {
                    $localStorage.priceList = data[0].slug;
                });
                // Redirect user here after a successful log in.
                $state.go('dashboard');
            });


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
        self.client_id = 'CKLZaUXlx9ay0437WgsElHxKLMx0ZW4MFFrzNwG3';
        // Login with username and password
        self.login = function () {
            // ajax request to send the formData
            self.processing = true;
            self.formDataLogin.grant_type = 'password';
            self.formDataLogin.client_id = self.client_id;
            $auth.login(self.formDataLogin)
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
            AccessSrv.logout({token: $auth.getToken(), client_id: self.client_id}).$promise.then(function (data) {
                $auth.logout()
                    .then(function () {
                        // delete appData
                        delete $localStorage.appData.user;
                        $localStorage.items = [];
                        $localStorage.total = 0;
                        $localStorage.cart = {};
                        $localStorage.appData.user = self.branchDefault;
                        $localStorage.priceList = '';
                        // Desconectamos al usuario y lo redirijimos
                        if ($state.current.name !== 'register') {
                            NotificationSrv.success("Te esperamos pronto", "Moon's Aquariums");
                            $state.go('home');
                        }
                    })
                    .catch(function (response) {
                        // Handle errors here, such as displaying a notification
                    });
            });
        };

        self.createAccount = function () {
            var account = angular.copy(self.formData);
            self.busy = true;
            account.email = account.contactPersonEmail;
            RegisterSrv.save(account).$promise.then(function (data) {
                NotificationSrv.success('Cuenta creada correctamente', "Ya falto poco para pertenecer a Moon's Aquariums");
                self.busy = false;
                self.formData = {};
                $state.go('success');
            }, function (error) {
                angular.forEach(error.data, function (key, value) {
                    NotificationSrv.error(key, value);
                    self.busy = false;
                })
            });
        };


    }

    function RecoveryPasswordCtrl(RegisterSrv, NotificationSrv, $state, $stateParams) {
        var self = this;
        self.formData = {};
        //self.passwordData = {};
        // 1 is for webSite
        self.formData.client_kind = 1;
        self.recovery = false;
        self.recoveryPassword = function () {
            self.busy = true;
            RegisterSrv.recovery(self.formData).$promise.then(function (data) {
                NotificationSrv.success('Le hemos enviado un email para recuperar su contraseña', data.email);
                self.busy = false;
                //$state.go('register');
            }, function (error) {
                self.busy = false;
                angular.forEach(error.data, function (value, key) {
                    NotificationSrv.error(value);
                });
            });
        };

        if ($state.current.name === 'recovery-password') {
            self.recovery = true;
        }

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
            if (self.formData.password2 !== self.formData.password) {
                NotificationSrv.error('Las contraseñas no coinciden');
                return;
            }
            RegisterSrv.set({token: $stateParams.token}, self.formData).$promise.then(function (data) {
                NotificationSrv.success("Contraseña actualizada correctamente");
                self.busy = false;
                $state.go('register');
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
            var formData = angular.copy(self.formData);
            var id = formData.id ? formData.id : $stateParams.id;
            self.busy = true;
            AddressSrv.update({id: id}, formData).$promise.then(function (response) {
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

        self.getAddresses = function () {
            if ($stateParams.id) {
                AddressSrv.get({id: $stateParams.id}).$promise.then(function (data) {
                    self.formData = data;
                    self.create = false;
                    if (self.formData.state)
                        StateSrv.getCities({
                            state: self.formData.state,
                            ordering: 'name'
                        }).$promise.then(function (response) {
                            self.cities = response;
                            self.busyCity = false;
                        }, function (error) {
                            self.busyCity = false;
                        });
                });
            }
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
        self.initialState = function () {
        };
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
        self.getAddresses = function () {
            AddressSrv.query({customer: self.idUser}).$promise.then(function (data) {
                self.addresses = data;
                return self.addresses;
            });
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
                        AddressSrv.delete({id: id}).$promise.then(function (data) {
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

    function ProfileCtrl(CustomerSrv, StateSrv, NotificationSrv, $localStorage, $rootScope, $stateParams, $state) {
        var self = this;

        self.formData = {};
        self.profileData = {};
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

        var updateCustomer = function () {
            var profileData = angular.copy(self.profileData);
            self.busy = true;
            CustomerSrv.update({id: self.idUser}, profileData).$promise.then(function (response) {
                self.busy = false;
                NotificationSrv.success('Información personal actualizada correctamente');
                $state.go('dashboard');
            }, function (error) {
                angular.forEach(error, function (value, key) {
                    NotificationSrv.error(key + ' ' + value);
                });
                self.busy = false;
            });
        };

        self.submitForm = function () {
            updateCustomer();
        };

        self.getCustomer = function () {
            CustomerSrv.get({id: self.idUser}).$promise.then(function (data) {
                self.profileData = data;
                self.create = false;
                if (self.profileData.state)
                    StateSrv.getCities({
                        state: self.profileData.state,
                        ordering: 'name'
                    }).$promise.then(function (response) {
                        self.cities = response;
                        self.busyCity = false;
                    }, function (error) {
                        self.busyCity = false;
                    });
            });
        };
        self.getCustomer();

    }

    function PurchaseListCtrl(OrderSrv, NotificationSrv, NgTableParams, $timeout, $rootScope, $localStorage) {

        var self = this;
        var timeout = $timeout;
        self.formData = {};
        self.searchTerm = '';
        self.params = {};
        self.sales = [];
        self.create = false;
        self.busy = false;
        self.initialState = function () {
        };

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
            self.params.customer = self.idUser;

            OrderSrv.get(self.params).$promise.then(function (data) {
                params.total(data.count);
                self.sales = data.results;
            }, function (error) {
                angular.forEach(error, function (value, key) {
                    NotificationSrv.error(value + '' + key);
                })
            });
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

    }

    function PurchaseDetailCtrl($stateParams, OrderSrv, Upload, BaseUrlShop, $rootScope, NotificationSrv, AttachmentCmsSrv, $filter) {
        var self = this;
        self.busy = false;

        //aditional keys
        var aditionalKey = function (array) {
            if (self.purchase.metadata) {
                if (self.purchase.metadata.taxInverse === 0) {
                    //apply tax inverse
                    angular.forEach(array, function (obj, ind) {
                        obj.price = (parseFloat(obj.price) / 1.16);
                        obj.subtotal = (parseFloat(obj.price) * parseFloat(obj.qty));
                        obj.promotionFloat = parseFloat(obj.promotion);
                        if (obj.promotionFloat > 0) {
                            obj.subtotalDiscount = obj.subtotal - obj.promotionFloat;
                            obj.subtotalDiscount = (obj.subtotalDiscount / 1.16);
                        }
                    });
                }
                else {
                    angular.forEach(array, function (obj, ind) {
                        obj.subtotal = (parseFloat(obj.price) * parseFloat(obj.qty));
                        obj.promotionFloat = parseFloat(obj.promotion);
                        if (obj.promotionFloat > 0) {
                            obj.subtotalDiscount = obj.subtotal - obj.promotionFloat;
                        }
                    });
                }
            }
            return array;
        };

        if ($stateParams.id) {
            OrderSrv.get({id: $stateParams.id}).$promise.then(function (data) {
                self.purchase = data;
                self.purchase.items = aditionalKey(self.purchase.items);
                getVoucher();
            });
        }

        self.uploadFile = function () {
            //
            Upload.upload({
                url: BaseUrlShop.get() + 'attachments',
                data: {
                    attached_file: self.voucher,
                    reference: self.purchase.id,
                    kind: 'voucher',
                    name: self.voucher.name,
                    project: $rootScope.siteId
                },
                method: 'POST'
            }).then(function (data) {
                // success file upload
                NotificationSrv.success('Archivo cargado correctamente');
                self.voucher = data.data;
            }, function (data) {
                console.log('Error status: ' + data.status);
                self.busy = false;
            });

        };


        var getVoucher = function () {
            AttachmentCmsSrv.get({
                reference: self.purchase.id,
                project: $rootScope.siteId,
                kind: 'voucher',
                page: 1,
                pageSize: 1
            }).$promise.then(function (response) {
                self.voucher = $filter('filter')(response.results, {kind: 'voucher'})[0];
            }, function (error) {
                console.log(error)
            });

        };
    }

    function ProfilePanelCtrl(OrderSrv, NotificationSrv, NgTableParams, PriceListSrv, $timeout, $localStorage) {
        var self = this;
        var timeout = $timeout;
        self.formData = {};
        self.searchTerm = '';
        self.params = {};
        self.sales = [];
        self.create = false;
        self.busy = false;
        self.pending = 0;
        self.processing = 0;
        self.shipped = 0;

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
            self.params.customer = self.idUser;

            OrderSrv.get(self.params).$promise.then(function (data) {
                params.total(data.count);
                self.purchases = data.results;
                self.purchasesCount = self.purchases.length;
                self.purchaseRecent = self.purchases.slice(0, 3);

                angular.forEach(self.purchases, function (value, key) {
                    if (value.paymentType === 9) {
                        self.shipped++;
                    }
                    if (value.paymentType === 1) {
                        self.pending++;
                    }
                    if (value.paymentType === 2) {
                        self.processing++;
                    }
                });

            }, function (error) {
                angular.forEach(error, function (value, key) {
                    NotificationSrv.error(value + '' + key);
                })
            });
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

    }


    // create the module and assign controllers
    angular.module('auth.controllers', ['auth.services'])
        .controller('AccessCtrl', AccessCtrl)
        .controller('RecoveryPasswordCtrl', RecoveryPasswordCtrl)
        .controller('ValidAccountCtrl', ValidAccountCtrl)
        .controller('AddressCtrl', AddressCtrl)
        .controller('AddressListCtrl', AddressListCtrl)
        .controller('ProfileCtrl', ProfileCtrl)
        .controller('PurchaseListCtrl', PurchaseListCtrl)
        .controller('PurchaseDetailCtrl', PurchaseDetailCtrl)
        .controller('ProfilePanelCtrl', ProfilePanelCtrl);


    // inject dependencies to controllers
    AccessCtrl.$inject = ['AccessSrv', 'CustomerSrv', 'RegisterSrv', '$auth', '$state', '$localStorage', '$rootScope', 'NotificationSrv', 'PriceListSrv'];
    RecoveryPasswordCtrl.$inject = ['RegisterSrv', 'NotificationSrv', '$state', '$stateParams'];
    ValidAccountCtrl.$inject = ['UserSrv', 'NotificationSrv', '$state', '$stateParams'];
    AddressCtrl.$inject = ['AddressSrv', 'NotificationSrv', 'StateSrv', '$localStorage', '$rootScope', '$state', '$stateParams'];
    AddressListCtrl.$inject = ['AddressSrv', 'NotificationSrv', 'NgTableParams', 'StateSrv', '$localStorage', '$rootScope', '$timeout', 'SweetAlert'];
    ProfileCtrl.$inject = ['CustomerSrv', 'StateSrv', 'NotificationSrv', '$localStorage', '$rootScope', '$stateParams', '$state'];
    PurchaseListCtrl.$inject = ['OrderSrv', 'NotificationSrv', 'NgTableParams', '$timeout', '$rootScope', '$localStorage'];
    PurchaseDetailCtrl.$inject = ['$stateParams', 'OrderSrv', 'Upload', 'BaseUrlShop', '$rootScope', 'NotificationSrv', 'AttachmentCmsSrv', '$filter'];
    ProfilePanelCtrl.$inject = ['OrderSrv', 'NotificationSrv', 'NgTableParams', 'PriceListSrv', '$timeout', '$localStorage'];
})();
