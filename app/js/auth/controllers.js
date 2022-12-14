(function () {
    'use strict';

    function AccessCtrl(AccessSrv, CustomerSrv, RegisterSrv, $auth, $state, $localStorage, $rootScope, NotificationSrv,
        PriceListSrv, StateSrv, CartsSrv, $anchorScroll, $stateParams, $filter) {
        $anchorScroll();
        var self = this;
        self.busy = false;
        self.formData = {};
        self.formDataLogin = {};
        if ($localStorage.appData) {
            $rootScope.user = $localStorage.appData.user;
        }
        self.cities = [];
        self.user = $stateParams.user;
        self.wholesale = $stateParams.wholesale;
        self.activeTab = 0;
        if($stateParams.action === 'register'){
            self.activeTab = 1;
        }
        if($stateParams.action === 'login'){
            self.activeTab = 0;
        }

        if ($stateParams.wholesale === true) {
            self.activeTab = 2;
        }
        if ($stateParams.user === true) {
            self.activeTab = 1;
        }

        self.items = $localStorage.items ? $localStorage.items.length : [];
        self.itemCount = self.items.length;
        
        self.processing = false;

        // Logic for save the session
        self.saveSession = function (response) {
            // save user info to local storage
            self.items = $localStorage.items ? $localStorage.items : [];
            self.itemCount = self.items.length;
            $localStorage.appData = { user: angular.copy(response.data.user) };
            $localStorage.appData.token = {
                expires_in: response.data.expires_in, token_type: response.data.token_type,
                refresh_token: response.data.refresh_token, scope: response.data.scope,
                user_last_login: Math.round((new Date().getTime() / 1000))
            };
            $rootScope.user = $localStorage.appData.user;
            self.idUser = response.data.user.id;
            CustomerSrv.customerByUser({ id: self.idUser }).$promise.then(function (data) {
                self.customer = data;
                $localStorage.appData.user.customer = data.id;
                $localStorage.appData.user.firstName = data.firstName;
                if(data.sellers.length){
                    $localStorage.appData.ref = data.sellers[0];
                }

                self.branchDefault = { branchOffices: [$localStorage.appData.user.branchOffices[0].id] };
                PriceListSrv.customer({ customers: $localStorage.appData.user.customer }).$promise.then(function (data) {
                    var list = '';
                    try {
                        list = data[0].slug;
                        $localStorage.priceList = list;
                    }
                    catch (err) {
                    }
                    self.retriveCart(self.customer.id);
                });
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
                    NotificationSrv.error('Usuario o contrase??a incorrectos');
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
                        $localStorage.items = [];
                        $localStorage.total = 0;
                        $localStorage.cart = {};
                        $localStorage.appData.user = self.branchDefault;
                        $localStorage.priceList = '';
                        $localStorage.shipmentTotal = 0;
                        $localStorage.ship = false;
                        $localStorage.subTtotal = 0;
                        $localStorage.taxTotal = 0;
                        $localStorage.promoTotal = 0;
                        $localStorage.shipmentTotal = 0;
                        delete $localStorage.appData.ref;
                        // Desconectamos al usuario y lo redirijimos
                        if ($state.current.name !== 'register') {
                            NotificationSrv.success("Te esperamos pronto", $rootScope.initConfig.branchOffice);
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
            if ($rootScope.createCustomerActive) {
                account.isActive = false;
            }
            var address = {};
            self.busy = true;
            account.email = account.contactPersonEmail;
            account.priceListId = 'dfc502f3-ed7c-4a12-bf33-62e336e33caa';
            account.isActive = true;
            address.zip = self.address.zip;
            address.neighborhood = self.address.neighborhood;
            address.phone = account.contactPersonPhone;
            address.city = self.city.id;
            address.state = self.state.id;
            address.address = self.address.address;
            account.address = self.address.address;
            account.dataAddress = address;
            account.city = self.city.id;
            account.state = self.state.id;
            if($localStorage.refSeller){
                account.sellers = [$localStorage.refSeller]
            }
            RegisterSrv.save(account).$promise.then(function (data) {
                NotificationSrv.success('Cuenta creada correctamente', "Ya falto poco para pertenecer a", $rootScope.initConfig.branchOffice);
                self.busy = false;
                self.formData = {};
                delete $localStorage.refSeller;
                $state.go('success');
            }, function (error) {
                angular.forEach(error.data, function (key, value) {
                    NotificationSrv.error(key, value);
                    self.busy = false;
                })
            });
        };

        // get all the states
        self.busyState = true;

        self.getStates = function () {
            StateSrv.query({ country: '573fda4d5b0d6863743020d1', ordering: 'name' }).$promise.then(function (data) {
                self.states = data;
                self.busyState = false;
                self.disableCity = false;
                self.cities = [];
            }, function (error) {
                self.busyState = false;
            });

        };

        self.clearCities = function () {
            self.cities = [];
        };

        // get the cities by state
        self.getCitiesByState = function () {
            if (!self.state) {
                return
            }
            self.busyCity = true;
            if (self.cities.length < 1) {
                StateSrv.getCities({ state: self.state.id, ordering: 'name' }).$promise.then(function (response) {
                    self.cities = response;
                    self.busyCity = false;
                }, function (error) {
                    self.busyCity = false;
                });
            }
            else {
                self.busyCity = false;
            }

        };

        //
        self.optionsForbusinessType = [{ 'name': 'Veterinaria', 'id': '1' }, { 'name': 'Hospital Veterinario', 'id': '2' },
        { 'name': 'Cl??nica Veterinaria', 'id': '3' }, { 'name': 'Tienda', 'id': '4' }, { 'name': 'Pet Shop', 'id': '5' },
        { 'name': 'Venta de alimentos', 'id': '6' }, { 'name': 'Acuario', 'id': '7' },
        { 'name': 'Entrenador', 'id': '8' },
        { 'name': 'Distribuidor', 'id': '9' }, { 'name': 'Est??tica canina', 'id': '10' },
        { 'name': 'Est??tica canina m??vil', 'id': '11' }, { 'name': 'Comerciante independiente', 'id': '12' },
        { 'name': 'Otro', 'id': '13' }];

        self.peopleServe = [{ 'name': 'Alejandra Mercado', 'id': '1' }, { 'name': 'Alejandro Casas', 'id': '2' },
        { 'name': 'Angel Rodriguez', 'id': '3' }, { 'name': 'Argenis R??os', 'id': '4' },
        { 'name': 'Ariadna Sanchez de Tagle', 'id': '5' },
        { 'name': 'Donovan Diaz', 'id': '6' }, { 'name': 'Erica Merlos', 'id': '7' },
        { 'name': 'Israel Covarrubias', 'id': '8' },
        { 'name': 'Ivette Rojo', 'id': '9' }, { 'name': 'Mario Aupart', 'id': '10' }, {
            'name': 'Oscar Luna',
            'id': '11'
        },
        { 'name': 'Roberto Sanchez de Tagle', 'id': '12' }, { 'name': 'Samanda Santos', 'id': '13' },
        { 'name': 'Otro', 'id': '14' }];


        self.guest = {dataAddress: {city: null, state: null}};


        self.purchaseGuestLogin = function () {
            self.guest.dataAddress.city = self.city.id;
            self.guest.dataAddress.state = self.state.id;
            self.guest.email = self.guest.contactPersonEmail;
            self.guest.priceListId = 'dfc502f3-ed7c-4a12-bf33-62e336e33caa';
            RegisterSrv.save(self.guest).$promise.then(function (data) {
                self.busy = false;
                self.guest = data;
                $auth.login({
                    "grant_type": 'password',
                    "client_id": self.client_id,
                    "username": data.metadata.series,
                    "password": data.metadata.token
                })
                    .then(function (response) {
                        $localStorage.appData = {user: angular.copy(response.data.user)};
                        $localStorage.appData.user.customer = self.guest.id;
                        $localStorage.appData.user.address = self.guest.metadata.addressId;
                        $localStorage.appData.user.branchId = self.guest.metadata.branchId;
                        $localStorage.appData.user.warehouseID = self.guest.metadata.warehouseDefault.id;
                        $localStorage.appData.user.id = self.guest.metadata.employee;
                        $localStorage.appData.user.mpPublicKey = self.guest.metadata.mpPublicKey;
                        $localStorage.appData.user.saleGuest = true;
                        // crear el carrito
                        var itemsLocal = $localStorage.items;
                        var items = [];
                        var itemCount = itemsLocal.length;
                        angular.forEach(itemsLocal, function (obj, ind) {
                            items[ind] = {
                                id: obj.id,
                                qty: obj.qty,
                                promotion: parseFloat(obj.discount.discount),
                                price: parseFloat(obj.price)
                            };

                        });
                        CartsSrv.save({
                            items: items, store: self.guest.metadata.branchId, customer: self.guest.id,
                            customerName: self.guest.contactPersonName,
                            customerEmail: self.guest.contactPersonEmail,
                            itemCount: itemCount, fromWeb: true, metadata: {}
                        }).$promise.then(function (cart) {
                            $localStorage.cart = cart;
                            $localStorage.shipmentTotal = cart.shipmentCost;
                            $localStorage.total = cart.total;
                            $localStorage.cartId = cart.id;
                            $state.go('shipping-address', {address: self.guest.metadata.addressId, intent: null});
                        });
                    })
                    .catch(function (response) {
                        // Handle errors here, such as displaying a notification
                        // for invalid email and/or password.
                        self.processing = false;
                        NotificationSrv.error('Usuario o contrase??a incorrectos');
                    });


            }, function (error) {
                angular.forEach(error.data, function (key, value) {
                    NotificationSrv.error(key, value);
                    self.busy = false;
                })
            });
        }

        var parseItemsCart = function(items){
            var itemsReturn = [];
            angular.forEach(items, function(item){
                //get featureImage
                angular.forEach(item.attachments, function (obj, ind) {
                    var image = $filter('filter')(item.attachments, { kind: 'featuredImage' })[0];
                    if('url' in image){
                        item.image = image.url;
                    }
                    
                });
                delete item.stock;
                item.stock = item.inventory;
                item.discount = {
                    "value": 0,
                    "isPercentage": "0",
                    "discount": "0"
                }
                item.import = item.qty * parseFloat(item.price);
                itemsReturn.push(item)
            })
            return itemsReturn;
        
        }
            
        self.retriveCart = function(id){
            CartsSrv.get({customer: id, pageSize: 10, page: 1, kind: 'cart'}).$promise.then(function (data) {
                if(data.count > 0){
                    if(data.results[0].id){
                        self.cart = data.results[0];
                        $localStorage.cart = self.cart;
                        $localStorage.items = parseItemsCart(self.cart.items);
                        $rootScope.items = 0;
                        // Redirect user here after a successful log in.
                        self.items = $localStorage.items ? $localStorage.items : [];
                        self.itemCount = self.items.length;
                        if (self.itemCount > 0) {
                            $state.go('shopcart');
                        }else{
                            $state.go('dashboard');
                        }
                    }
                }else{
                    self.items = $localStorage.items ? $localStorage.items : [];
                    self.itemCount = self.items.length;
                    if (self.itemCount > 0) {
                        $state.go('shopcart');
                    }else{
                        $state.go('dashboard');
                    }
                }

            }, function(error){
                if(error.status === 404){
                    delete $localStorage.cartId;
                }
                self.items = $localStorage.items ? $localStorage.items : [];
                self.itemCount = self.items.length;
                if (self.itemCount > 0) {
                    $state.go('shopcart');
                }else{
                    $state.go('dashboard');
                }
            });
        }

        if($stateParams.username && $stateParams.token && $stateParams.cart){
            // ajax request to send the formData
            self.processing = true;
            self.formDataLogin.username = $stateParams.username;
            self.formDataLogin.password = $stateParams.token;
            self.formDataLogin.grant_type = 'password';
            self.formDataLogin.client_id = self.client_id;
            $localStorage.cartId = $stateParams.cart;
            $auth.login(self.formDataLogin)
                .then(function (response) {
                    self.saveSession(response);
                })
                .catch(function (response) {
                    // Handle errors here, such as displaying a notification
                    // for invalid email and/or password.
                    self.processing = false;
                    NotificationSrv.error('Usuario o contrase??a incorrectos');
                });
        }


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
                NotificationSrv.success('Le hemos enviado un email para recuperar su contrase??a', data.email);
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
            if (self.formData.password2 !== self.formData.password) {
                NotificationSrv.error('Las contrase??as no coinciden');
                return;
            }
            RegisterSrv.set({ token: $stateParams.token }, self.formData).$promise.then(function (data) {
                NotificationSrv.success("Contrase??a actualizada correctamente");
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
        UserSrv.active({ token: $stateParams.token }, { 'is_active': true }).$promise.then(function (data) {
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
        StateSrv.query({ country: '573fda4d5b0d6863743020d1', ordering: 'name' }).$promise.then(function (data) {
            self.states = data;
            self.busyState = false;
        }, function (error) {
            self.busyState = false;
        });

        var createAddress = function () {
            var address = angular.copy(self.formData);
            address.customer = self.idUser;
            self.busy = true;
            if (!self.city || !self.state) {
                NotificationSrv.error('Por favor llena todos los campos');
                self.busy = false;
                return;
            }
            address.city = self.city.id;
            address.state = self.state.id;
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
            if (self.city) {
                formData.city = self.city.id;
            }
            if (self.state) {
                formData.state = self.state.id;
            }
            self.busy = true;
            AddressSrv.update({ id: id }, formData).$promise.then(function (response) {
                self.busy = false;
                NotificationSrv.success('Direcci??n actualizada correctamente');
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
                AddressSrv.get({ id: $stateParams.id }).$promise.then(function (data) {
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

        // get all the states
        self.busyState = true;

        self.getStates = function () {
            if (!self.states) {
                StateSrv.query({ country: '573fda4d5b0d6863743020d1', ordering: 'name' }).$promise.then(function (data) {
                    self.states = data;
                    self.busyState = false;
                    self.disableCity = false;
                }, function (error) {
                    self.busyState = false;
                });
            }

        };

        self.clearCities = function () {
            self.cities = [];
        };

        // get the cities by state
        self.getCitiesByState = function () {
            if (!self.state) {
                return
            }
            self.busyCity = true;
            if (self.cities.length < 1) {
                StateSrv.getCities({ state: self.state.id, ordering: 'name' }).$promise.then(function (response) {
                    self.cities = response;
                    self.busyCity = false;
                }, function (error) {
                    self.busyCity = false;
                });
            }
            else {
                self.busyCity = false;
            }

        };

        self.editCity = function () {
            self.editCityForm = !self.editCityForm;

        }

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
            AddressSrv.query({ customer: self.idUser }).$promise.then(function (data) {
                self.addresses = data;
                return self.addresses;
            });
        };

        self.deleteAddress = function (id) {
            SweetAlert.swal({
                title: 'Confirmar',
                text: 'Se eliminar?? esta direcci??n. ??Est?? seguro que desea continuar?',
                type: 'warning',
                showCancelButton: true,
                showConfirmButton: true,
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
                            NotificationSrv.success("Acci??n realizada correctamente");
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

    function ProfileCtrl(CustomerSrv, StateSrv, NotificationSrv, $localStorage, $rootScope, $stateParams, $state, $filter) {
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
        StateSrv.query({ country: '573fda4d5b0d6863743020d1', ordering: 'name' }).$promise.then(function (data) {
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
            StateSrv.getCities({ state: state_id, ordering: 'name' }).$promise.then(function (response) {
                self.cities = response;
                self.busyCity = false;
            }, function (error) {
                self.busyCity = false;
            });
        };

        var updateCustomer = function () {
            var profileData = angular.copy(self.profileData);
            self.busy = true;
            profileData.state = self.state.id;
            profileData.city = self.city.id;
            console.log(profileData);
            CustomerSrv.update({ id: self.idUser }, profileData).$promise.then(function (response) {
                self.busy = false;
                NotificationSrv.success('Informaci??n personal actualizada correctamente');
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
            CustomerSrv.get({ id: self.idUser }).$promise.then(function (data) {
                self.profileData = data;
                self.create = false;
                if (self.profileData.state)
                    StateSrv.getCities({
                        state: self.profileData.state,
                        ordering: 'name'
                    }).$promise.then(function (response) {
                        self.cities = response;
                        self.city = $filter('filter')(self.cities, { id: self.profileData.city })[0];
                        self.state = $filter('filter')(self.states, { id: self.profileData.state })[0];
                        self.busyCity = false;
                    }, function (error) {
                        self.busyCity = false;
                    });
            });
        };
        self.getCustomer();

        // get all the states
        self.busyState = true;

        self.getStates = function () {
            if (!self.states) {
                StateSrv.query({ country: '573fda4d5b0d6863743020d1', ordering: 'name' }).$promise.then(function (data) {
                    self.states = data;
                    self.busyState = false;
                    self.disableCity = false;
                }, function (error) {
                    self.busyState = false;
                });
            }

        };

        self.clearCities = function () {
            self.cities = [];
        };

        // get the cities by state
        self.getCitiesByState = function () {
            if (!self.state) {
                return
            }
            self.busyCity = true;
            if (self.cities.length < 1) {
                StateSrv.getCities({ state: self.state.id, ordering: 'name' }).$promise.then(function (response) {
                    self.cities = response;
                    self.busyCity = false;
                }, function (error) {
                    self.busyCity = false;
                });
            }
            else {
                self.busyCity = false;
            }

        };

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

    function PurchaseDetailCtrl($stateParams, OrderSrv, Upload, BaseUrlShop, $rootScope, NotificationSrv, AttachmentCmsSrv,
        HistoryOrdersSrv, $filter, $element, ErrorSrv) {
        var self = this;
        self.purchase = {
            amount: 0,
            name: '',
            email: '',
            phone: '',
            cardNumber: ''
        };
        self.busy = false;
        self.isPaypal = false;
        self.error = false;
        self.PaypalUrl = '';
        self.DoPayment = false;
        self.params = {};
        self.errorMessage = '';
        var publishKey = '';
        var setPublishableKey = function () {
            Mercadopago.setPublishableKey(publishKey);
        };

        var successResponseHandler = function (status, response) {
            var data = response;
            data.payment_method_id = self.purchase.paymentMethodId;
            $http.defaults.headers.common['PROJECT-ID'] = $stateParams.project;
            OrdersSrv.paidMP({ dataPayment: data, orderId: self.purchase.id, amount: self.purchase.amount }).$promise.then(function (response) {
                self.busy = true;
                $state.go('public.success', { data: response });
            }, function (error) {
                NotificationSrv.error('Error al procesar su pago, contacte a ' + self.purchase.storeInfo.businessName);
                self.busy = false;
            });
        };

        var errorResponseHandler = function (error) {
            var deferred = $q.defer();
            deferred.promise.then(function (error) {
                NotificationSrv.error(error.message_to_purchaser);
            });
            deferred.resolve(error);
        };

        var setPaymentMethodInfo = function (status, response) {
            self.purchase.paymentMethodId = response[0].id;
        }

        var getBin = function () {
            Mercadopago.getPaymentMethod({
                bin: self.purchase.cardNumber
            }, setPaymentMethodInfo);
        }

        self.processPaymentCard = function () {
            self.busy = true;
            setPublishableKey();
            getBin();
            Mercadopago.createToken($element.find('#pay'), successResponseHandler, errorResponseHandler);
        };

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
            OrderSrv.get({ id: $stateParams.id }).$promise.then(function (data) {
                self.purchase = data;
                if (self.purchase.isPaid === 2 && self.purchase.paymentType === 3 && self.purchase.orderStatus === 0 && self.purchase.statusInfo.code !== 6) {
                    self.isPaypal = true;
                    self.PaypalUrl = self.purchase.metadata.approvalUrl
                }
                publishKey = data.storeInfo.metadata.mp.publicKey;
                self.purchase.items = aditionalKey(self.purchase.items);
                getVoucher();
                getComments(self.purchase);
            });
        }

        self.uploadFile = function () {
            //
            Upload.upload({
                url: 'https://mercadomovil.com.mx/api/v1/' + 'attachments',
                data: {
                    attached_file: self.voucher,
                    reference: self.purchase.id,
                    kind: 'voucher',
                    name: self.voucher.name,
                    project: $rootScope.projectId
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
                project: $rootScope.projectId,
                kind: 'voucher',
                page: 1,
                pageSize: 1
            }).$promise.then(function (response) {
                self.voucher = $filter('filter')(response.results, { kind: 'voucher' })[0];
            }, function (error) {
                console.log(error)
            });

        };

        var getComments = function (order) {
            self.busy = true;
            HistoryOrdersSrv.query({ order: order.id, kind: 'comment', isActive: true }).$promise.then(function (resp) {
                self.comments = resp;
            }, function (error) {
                self.busy = false;
            });
        };
        self.dataShipmentTracking = {};
        self.getShipmentTracking = function() {
            if(self.purchase.shipmentLabel.label_url) {
                OrderSrv.getShipmentTracking({
                    trackingNumber: self.purchase.shipmentLabel.tracking_number,
                    provider: self.purchase.shipmentLabel.rate.provider
                }).$promise.then(function (data) {
                    self.dataShipmentTracking = data;
                }, function (data) {
                    ErrorSrv.error(data);
                });
            }
        };
    }

    function ProfilePanelCtrl(OrderSrv, NotificationSrv, NgTableParams, PriceListSrv, $timeout, $localStorage, CustomerSrv) {
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
        self.purchasesCount = 0;
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

        CustomerSrv.customerByUser({ id: $localStorage.appData.user.id }).$promise.then(function (data) {
            self.customer = data;
        });

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
                // self.purchasesCount = self.purchases.length;
                self.purchaseRecent = self.purchases.slice(0, 3);

                angular.forEach(self.purchases, function (value, key) {
                    if (value.paymentType === 9) {
                        self.shipped++;
                    }
                    if (value.isPaid === 2 || value.isPaid === 1) {
                        self.pending++;
                    }
                    if (value.statusInfo.code !== 4 && value.statusInfo.code !== 6) {
                        self.processing++;
                    }
                    if (value.orderStatusName !== "Cancelada") {
                        self.purchasesCount++;
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
    AccessCtrl.$inject = ['AccessSrv', 'CustomerSrv', 'RegisterSrv', '$auth', '$state', '$localStorage', '$rootScope',
        'NotificationSrv', 'PriceListSrv', 'StateSrv', 'CartsSrv', '$anchorScroll', '$stateParams', '$filter'];
    RecoveryPasswordCtrl.$inject = ['RegisterSrv', 'NotificationSrv', '$state', '$stateParams'];
    ValidAccountCtrl.$inject = ['UserSrv', 'NotificationSrv', '$state', '$stateParams'];
    AddressCtrl.$inject = ['AddressSrv', 'NotificationSrv', 'StateSrv', '$localStorage', '$rootScope', '$state', '$stateParams'];
    AddressListCtrl.$inject = ['AddressSrv', 'NotificationSrv', 'NgTableParams', 'StateSrv', '$localStorage', '$rootScope', '$timeout', 'SweetAlert'];
    ProfileCtrl.$inject = ['CustomerSrv', 'StateSrv', 'NotificationSrv', '$localStorage', '$rootScope', '$stateParams', '$state', '$filter'];
    PurchaseListCtrl.$inject = ['OrderSrv', 'NotificationSrv', 'NgTableParams', '$timeout', '$rootScope', '$localStorage'];
    PurchaseDetailCtrl.$inject = ['$stateParams', 'OrderSrv', 'Upload', 'BaseUrlShop', '$rootScope', 'NotificationSrv', 'AttachmentCmsSrv', 'HistoryOrdersSrv', '$filter', '$element', 'ErrorSrv'];
    ProfilePanelCtrl.$inject = ['OrderSrv', 'NotificationSrv', 'NgTableParams', 'PriceListSrv', '$timeout', '$localStorage', 'CustomerSrv'];
})();
