/**
 * Created by fishergio on 24/03/17.
 */
(function () {
    'use strict';

    function ShopCartCtrl(CartsSrv, $rootScope, $auth, $state, $localStorage, $filter, NotificationSrv) {
        var self = this;
        var user = $localStorage.appData.user;
        self.params = {};
        self.branchOffice = '';
        self.items = $localStorage.items ? $localStorage.items : [];
        self.defaultbranchOffice = '';
        self.customer = $localStorage.appData.user.customer;
        self.email = $localStorage.appData.user.email;
        self.customerName = $localStorage.appData.user.firstName;
        self.total = $localStorage.total;
        var items = [];
        $localStorage.items = self.items;
        self.items = $localStorage.items;
        self.itemCount = self.items.length;
        $localStorage.total = self.total;
        $rootScope.items = $localStorage.items;
        self.tax = false;
        self.taxInverse = false;

        if ($auth.isAuthenticated()) {
            // get default branch office
            self.getDefaulBranchOffice = function () {
                if (!user.branchOffices)
                    return;
                self.defaultbranchOffice = $filter('filter')(user.branchOffices, {default: true})[0];
                self.defaultWarehouse = $filter('filter')(self.defaultbranchOffice.warehouses, {default: true})[0];
                self.branchOffices = user.branchOffices;
                $rootScope.defaultbranchOffice = self.defaultbranchOffice.name;
                return self.defaultbranchOffice;
            };
            self.getDefaulBranchOffice();
        }

        self.setItem = function (item, qty) {
            var find_item = $filter('filter')(self.items, {id: item.id})[0];
            if (find_item) {
                if (qty < 1) {
                    // Remove item from cart
                    self.items.splice([self.items.indexOf(find_item)], 1)
                } else {
                    if (qty) {
                        self.items[self.items.indexOf(find_item)].qty = qty;
                    }
                }
            }
            getTotal();
            calculeTax();
        };

        var calculeTax = function () {
            self.subTotal = self.total;
            self.subTotal = (Math.round(self.subTotal * 100) / 100);
            //for tax
            self.subTotal2 = parseFloat(self.total);
            //for tax inverse
            self.subTotal2 = (Math.round(self.subTotal2 * 100) / 100);
            self.subTotal3 = parseFloat(self.total);
            self.subTotal3 = (Math.round(self.subTotal2 * 100) / 100);
            if (self.tax) {
                self.taxTotal = (parseFloat(self.subTotal) * 0.16);
                //round taxTotal
                self.taxTotal = (Math.round(self.taxTotal * 100) / 100);
                self.total = (parseFloat(self.subTotal) + parseFloat(self.taxTotal));
                //round total
                self.total = (Math.round(self.total * 100) / 100);
            }
            else if (self.taxInverse) {
                self.taxTotal2 = (parseFloat(self.subTotal) * 0.16);
                //round taxTotal
                self.taxTotal2 = (Math.round(self.taxTotal2 * 100) / 100);
                self.subTotal3 = (parseFloat(self.subTotal) - parseFloat(self.taxTotal2));
                //round total
                self.total2 = self.subTotal;
                self.total2 = (Math.round(self.total * 100) / 100);
                self.subTotal3 = (Math.round(self.subTotal3 * 100) / 100);
            }
            else {
                self.taxTotal = 0;
                self.total = (parseFloat(self.subTotal) + parseFloat(self.taxTotal));
                self.total = (Math.round(self.total * 100) / 100);
            }

        };

        self.itemInCart = function (item) {
            var find_item = $filter('filter')(self.items, {id: item.id})[0];
            return !!find_item;
        };

        self.clearCart = function () {
            self.items = [];
            self.total = 0;
            $localStorage.items = [];
            $localStorage.total = 0;
            //$localStorage.promoTotal = 0;
        };

        self.removeItem = function (item) {
            var find_item = $filter('filter')(self.items, {id: item.id})[0];
            if (find_item) {
                self.items.splice([self.items.indexOf(find_item)], 1);
                NotificationSrv.error('Eliminado del carrito', item.name);
                getTotal();

            }
        };

        var getTotal = function () {
            self.total = 0;
            angular.forEach(self.items, function (value, key) {
                //first Time calcule
                //value.import = parseFloat(value.price) * value.qty;
                self.total += parseFloat(value.price) * value.qty;
            });
            $localStorage.total = self.total;
        };
        getTotal();

        self.isAuthenticated = function () {
            return $auth.isAuthenticated();
        };

        self.processPurchase = function () {
            if (!$auth.isAuthenticated()) {
                $state.go('register');
            } else {
                angular.forEach(self.items, function (obj, ind) {
                    items[ind] = {
                        id: obj.id,
                        qty: obj.qty,
                        promotion: parseFloat(obj.discount.discount),
                        price: parseFloat(obj.price)
                    };

                });
                CartsSrv.save({
                    items: items, store: self.defaultbranchOffice.id, customer: self.customer,
                    customerName: self.customerName,
                    customerEmail: self.email,
                    itemCount: self.itemCount
                }).$promise.then(function (data) {
                    console.log("Carrito", data.id);
                    self.cart = data;
                    $localStorage.cart = self.cart;
                    NotificationSrv.success("Pedido realizado correctamente");
                    //self.clearCart();
                    $rootScope.items = 0;
                });
                $state.go('shipping-address');
            }
        };

    }

    function ShippingAddressCtrl(AddressSrv, NotificationSrv, StateSrv, $localStorage, $rootScope, $state) {
        var self = this;
        var user = $localStorage.appData.user;
        self.branchOffice = '';
        self.params = [];
        self.formDataShip = {};
        self.formData = {};
        self.address = '';
        self.busy = false;
        self.addAddress = false;
        self.items = $localStorage.items ? $localStorage.items : [];
        self.defaultbranchOffice = '';
        self.customer = $localStorage.appData.user.customer;
        self.total = $localStorage.total;
        $localStorage.items = self.items;
        self.items = $localStorage.items;
        $localStorage.total = self.total;
        $rootScope.items = $localStorage.items;

        self.params.customer = self.customer;

        console.log(self.formDataShip);

        self.selectedAddress = function () {
            console.log(self.address);
        };

        AddressSrv.query().$promise.then(function (data) {
            self.addresses = data;
        }, function (error) {
            angular.forEach(error, function (key, value) {
                NotificationSrv.error("Error", value);
            });
        });

        self.saveShippingAddress = function () {
            console.log(self.address);
            if (!self.address) {
                console.log("nueva");
                newShippingAddress();
            } else {
                console.log(self.address);
                console.log("Exxistente");
                $localStorage.appData.user.address = self.address;
                $state.go('checkout');
            }
        };

        var newShippingAddress = function () {
            console.log("Nueva direccion, agregada");
            var address = angular.copy(self.formData);
            address.customer = self.customer;
            self.busy = true;
            AddressSrv.save(address).$promise.then(function (data) {
                console.log(data);
                NotificationSrv.success('Domicilio agregado correctamente');
                self.busy = false;
                self.formData = {};
                //$state.go('address');
            }, function (error) {
                angular.forEach(error.data, function (key, value) {
                    NotificationSrv.error(key, value);
                    self.busy = false;
                })
            })
        };

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
    }

    function PaymentCtrl(CustomerSrv, OrderSrv, AddressSrv, $rootScope, $state, $localStorage, NotificationSrv, $q, $stateParams) {
        var self = this;
        self.items = $localStorage.items ? $localStorage.items : [];
        self.total = $localStorage.total;
        self.formDataPay = {};
        self.customer = [];
        self.addresses = [];
        self.user = $localStorage.appData.user;
        self.idUser = $localStorage.appData.user.customer;
        self.order = $localStorage.cart.id;
        self.store = $localStorage.appData.user.branchOffices[0];
        self.email = $localStorage.appData.user.email;
        $localStorage.items = self.items;
        $localStorage.total = self.total;
        $rootScope.items = $localStorage.items;
        $rootScope.idUser = self.idUser;
        self.busyCard = false;
        self.payment = {
            'card': {
                number: null,
                name: '',
                exp_year: '',
                exp_month: '',
                cvc: null
            },
            email: self.email,
            amount: $localStorage.total,
            items: $localStorage.items
        };

        var publishKey = 'key_B34Yd1rcLM2Pyxpg';
        var setPublishableKey = function () {
            Conekta.setLanguage('es');
            Conekta.setPublishableKey(publishKey);
        };

        var initialGateway = function () {
            var deferred = $q.defer();
            $.getScript("https://conektaapi.s3.amazonaws.com/v0.3.2/js/conekta.js")
                .done(function (script, textStatus) {
                    deferred.promise.then(function (response) {
                        // Conekta Public Key
                        setPublishableKey();
                    });
                    deferred.resolve(textStatus);
                })
                .fail(function (jqxhr, settings, exception) {
                    console.log("Triggered ajaxError handler.");
                });
        };

        initialGateway();
        var successResponseHandler = function (token) {
            var params = {
                brand: Conekta.card.getBrand(self.payment.card.number),
                cardholder: self.payment.card.name,
                authCode: token.id,
                //phone: self.payment.phone,
                email: self.email,
                items: $localStorage.items,
                amount: $localStorage.total,
                shop: self.store
                //kind: 'card_payment'
                /*production: self.charge.production,
                 installments: self.charge.production.installments ? self.charge.production.installments : 0*/
            };
            console.log(params);
            /* ChargeSrv.save(params).$promise.then(function (response) {
             NotificationSrv.success('Cargo creado correctamente!');
             $localStorage.items = [];
             $localStorage.total = 0;
             $localStorage.shipmentPrice = 0;
             $state.go('app.dashboard');
             }, function (data) {
             self.busyCard = false;
             angular.forEach(data.data, function (value, key) {
             NotificationSrv.error(value);
             });
             });*/

        };

        /*if ($stateParams.id) {
         self.busy = true;
         var params = {
         id: $stateParams.id,
         fields: 'id,createdAt,kind,status,message,amount,items,client,shop'
         };
         ChargeSrv.checkoutGet(params).$promise.then(function (data) {
         self.charge = data;
         self.busy = false;
         }, function (error) {
         self.busy = false;
         });
         }*/

        var errorResponseHandler = function (error) {
            var deferred = $q.defer();
            deferred.promise.then(function (error) {
                self.busyCard = false;
                NotificationSrv.error(error.message_to_purchaser);
            });
            deferred.resolve(error);
        };

        self.processPayment = function () {
            self.busyCard = true;
            Conekta.token.create(self.payment, successResponseHandler, errorResponseHandler);
        };

        self.cancelPayment = function () {
            $localStorage.items = [];
            $localStorage.total = 0;
            $state.go('app.dashboard');
        };

        var getTotal = function () {
            self.total = 0;
            angular.forEach(self.items, function (value, key) {
                //first Time calcule
                //value.import = parseFloat(value.price) * value.qty;
                self.total += parseFloat(value.price) * value.qty;
            });
            $localStorage.total = self.total;
        };
        getTotal();

        self.getCustomer = function () {
            CustomerSrv.customerByUser({id: self.user.id}).$promise.then(function (data) {
                self.customer = data;
                console.log(self.customer);
            });

        };
        self.getCustomer();

        AddressSrv.query().$promise.then(function (data) {
            self.addresses = data;

        }, function (error) {
            NotificationSrv.error("Error");
        });

        self.selectedAddress = function () {
            console.log(self.formDataPay);
            console.log(self.addresses);
        };

        self.processPurchase = function () {
            var purchase = angular.copy(self.formData);
            CustomerSrv.save(purchase).$promise.then(function (data) {
            }, function (error) {
                angular.forEach(error, function (value, key) {
                    NotificationSrv.error(key);
                    console.log('Error', error);

                });
            })
        };

    }

    function OrderCtrl(OrderSrv, AddressSrv, NotificationSrv, $localStorage, $rootScope, $state, $filter) {
        var self = this;
        var user = $localStorage.appData.user;
        self.params = {};
        self.branchOffice = '';
        self.formData = {};
        self.idUser = $localStorage.appData.user.customer;
        self.items = $localStorage.items ? $localStorage.items : [];
        //self.store = $localStorage.appData.user.branchOffices[0];
        self.customer = $localStorage.appData.user.customer;
        self.email = $localStorage.appData.user.email;
        self.customerName = $localStorage.appData.user.firstName;
        self.total = $localStorage.total;
        $localStorage.items = self.items;
        self.items = $localStorage.items;
        self.itemCount = self.items.length;
        $localStorage.total = self.total;
        $rootScope.items = $localStorage.items;
        $rootScope.idUser = self.idUser;
        $rootScope.defaultbranchOffice = '';
        self.tax = false;
        self.taxInverse = false;
        self.saveAddressNew = false;

        // get default branch office
        self.getDefaulBranchOffice = function () {
            if (!user.branchOffices)
                return;
            self.defaultbranchOffice = $filter('filter')(user.branchOffices, {default: true})[0];
            self.defaultWarehouse = $filter('filter')(self.defaultbranchOffice.warehouses, {default: true})[0];
            self.branchOffices = user.branchOffices;
            $rootScope.defaultbranchOffice = self.defaultbranchOffice.name;
            return self.defaultbranchOffice;

        };
        self.getDefaulBranchOffice();


        self.createOrder = function () {
            //self.promoTotal = $localStorage.promoTotal;
            //self.promoTotal = (Math.round(self.promoTotal * 100) / 100);
            var params = {metadata: {taxInverse: false}};
            params.kind = 'order';
            params.orderStatus = 0;
            params.paymentType = 0;
            params.isPaid = 2;
            params.itemCount = self.itemCount;
            params.store = self.defaultbranchOffice.id;
            params.customer = self.customer;
            params.cartId = $localStorage.cart.id;
            params.warehouse = self.defaultWarehouse.id;
            params.employee = $localStorage.appData.user.id;

            console.log('Wareho', self.defaultWarehouse.id);


            if (self.taxInverse) {
                params.taxTotal = self.taxTotal2;
            }
            else {
                params.taxTotal = self.taxTotal;
            }
            if (self.taxInverse) {
                params.subTotal = self.subTotal3;
            }
            else {
                params.subTotal = self.subTotal2;
                params.metadata.taxInverse = false;
            }
            if (self.taxInverse) {
                params.total = self.total2;
            }
            else {
                params.total = self.total;
            }

            OrderSrv.save(params).$promise.then(function (data) {
                console.log(data);
                console.log(params);
            });
            $state.go('checkout');
        };

        var createAddress = function () {
            var address = angular.copy(self.formData);
            address.customer = self.idUser;
            self.busy = true;
            AddressSrv.save(address).$promise.then(function (data) {
                self.busy = false;
                self.formData = {};
            }, function (error) {
                angular.forEach(error.data, function (key, value) {
                    NotificationSrv.error(key, value);
                    self.busy = false;
                })
            })
        };

        self.shippingProcess = function () {
            console.log("Proceso de envio iniciado");
            if (self.saveAddressNew) {
                createAddress();
            }
            console.log(self.saveAddressNew);

        };

        AddressSrv.query().$promise.then(function (data) {
            self.addresses = data;

        }, function (error) {
            NotificationSrv.error("Error");
        });

    }

// create the module and assign controllers
    angular.module('shop.controllers', ['shop.services'])
        .controller('ShopCartCtrl', ShopCartCtrl)
        .controller('ShippingAddressCtrl', ShippingAddressCtrl)
        .controller('PaymentCtrl', PaymentCtrl)
        .controller('OrderCtrl', OrderCtrl);

    // inject dependencies to controllers
    ShopCartCtrl.$inject = ['CartsSrv', '$rootScope', '$auth', '$state', '$localStorage', '$filter', 'NotificationSrv'];
    ShippingAddressCtrl.$inject = ['AddressSrv', 'NotificationSrv', 'StateSrv', '$localStorage', '$rootScope', '$state'];
    OrderCtrl.$inject = ['OrderSrv', 'AddressSrv', 'NotificationSrv', '$localStorage', '$rootScope', '$state', '$filter'];
    PaymentCtrl.$inject = ['CustomerSrv', 'OrderSrv', 'AddressSrv', '$rootScope', '$state', '$localStorage', 'NotificationSrv', '$q', '$stateParams'];
})();