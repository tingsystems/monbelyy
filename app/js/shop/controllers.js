/**
 * Created by fishergio on 24/03/17.
 */
(function () {
    'use strict';

    function ShopCartCtrl(CartsSrv, $rootScope, $auth, $state, $localStorage, $filter, NotificationSrv) {
        var self = this;
        self.items = $localStorage.items ? $localStorage.items : [];
        self.store = $localStorage.appData.user.branchOffices;
        self.customer = $localStorage.appData.user.customer;
        self.total = $localStorage.total;
        $localStorage.items = self.items;
        self.itemCount = self.items.length;
        $localStorage.total = self.total;
        $rootScope.items = $localStorage.items;

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
                CartsSrv.get({ items: self.items, store: self.store, customer : self.customer,
                        customerName: self.firstName,
                        customerEmail: self.email,
                        itemCount: self.itemCount }).$promise.then(function (data) {
                    self.cart = data;
                    console.log(data);
                });
                $state.go('payment-method');
            }
        }

    }

    function PaymentCtrl(CustomerSrv, AddressSrv, $rootScope, $auth, $state, $localStorage, $filter, NotificationSrv, StateSrv) {
        var self = this;
        self.items = $localStorage.items ? $localStorage.items : [];
        self.total = $localStorage.total;
        self.formData = {};
        self.customer = [];
        self.user = $localStorage.appData.user;
        self.idUser = $localStorage.appData.user.customer;
        $localStorage.items = self.items;
        $localStorage.total = self.total;
        $rootScope.items = $localStorage.items;

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
                console.log('Cliente', data);
                self.customer = data;
            });

        };
        self.getCustomer();

        self.getAddress = function () {
            AddressSrv.query().$promise.then(function (data) {
                self.address = data;
            }, function (error) {
                NotificationSrv.error("Error");
            })
        };
        self.getAddress();

        self.processPurchase = function () {
            var purchase = angular.copy(self.formData);
            CustomerSrv.save(purchase).$promise.then(function (data) {
                console.log('Cliente creado', data);
            }, function (error) {
                angular.forEach(error, function (value, key) {
                    NotificationSrv.error(key);
                    console.log('Error', error);

                });
            })
        }
    }

// create the module and assign controllers
    angular.module('shop.controllers', ['shop.services'])
        .controller('ShopCartCtrl', ShopCartCtrl)
        .controller('PaymentCtrl', PaymentCtrl);

    // inject dependencies to controllers
    ShopCartCtrl.$inject = ['CartsSrv', '$rootScope', '$auth', '$state', '$localStorage', '$filter', 'NotificationSrv'];
    PaymentCtrl.$inject = ['CustomerSrv', 'AddressSrv', '$rootScope', '$auth', '$state', '$localStorage', '$filter', 'NotificationSrv'];

})();