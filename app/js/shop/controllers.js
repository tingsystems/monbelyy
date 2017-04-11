/**
 * Created by fishergio on 24/03/17.
 */
(function () {
    'use strict';

    function ShopCartCtrl(CartsSrv, OrderSrv, $rootScope, $auth, $state, $localStorage, $filter, NotificationSrv) {
        var self = this;
        var user = $localStorage.appData.user;
        var params = {};
        self.branchOffice = '';
        self.items = $localStorage.items ? $localStorage.items : [];
        self.store = $localStorage.appData.user.branchOffices[0];
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
                    items: items, store: self.store, customer: self.customer,
                    customerName: self.customerName,
                    customerEmail: self.email,
                    itemCount: self.itemCount
                }).$promise.then(function (data) {
                    console.log("Carrito", data.id)
                    self.cart = data;
                    $localStorage.cart = self.cart;
                    createOrder(data);
                    NotificationSrv.success("Pedido realizado correctamente");
                    self.clearCart();
                    $rootScope.items = 0;
                });
                $state.go('payment-method');
            }
        };

        var createOrder = function (cart) {
            var params = { metadata: { taxInverse: true } };
            params.kind = 'invoice';
            params.orderStatus = 4;
            params.paymentType = 0;
            params.isPaid = 0;
            params.cartId = cart.id;
            //params.warehouse = self.defaultWarehouse.id;
            params.employee = user.id;
            params.comments = self.comments;
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
            });
        }

    }

    function PaymentCtrl(CustomerSrv, CartsSrv, OrderSrv, AddressSrv, $rootScope, $auth, $state, $localStorage, $filter, NotificationSrv, StateSrv) {
        var self = this;
        self.items = $localStorage.items ? $localStorage.items : [];
        self.total = $localStorage.total;
        self.formDataPay = {};
        self.customer = [];
        self.addresses = [];
        self.user = $localStorage.appData.user;
        self.idUser = $localStorage.appData.user.customer;
        self.order = $localStorage.cart.id;
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
                self.customer = data;
            });

        };
        self.getCustomer();

        AddressSrv.query().$promise.then(function (data) {
            self.addresses = data;

        }, function (error) {
            NotificationSrv.error("Error");
        });

        self.selectedAddress = function(){
            console.log('Adios perro!');
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

// create the module and assign controllers
    angular.module('shop.controllers', ['shop.services'])
        .controller('ShopCartCtrl', ShopCartCtrl)
        .controller('PaymentCtrl', PaymentCtrl);

    // inject dependencies to controllers
    ShopCartCtrl.$inject = ['CartsSrv', 'OrderSrv', '$rootScope', '$auth', '$state', '$localStorage', '$filter', 'NotificationSrv'];
    PaymentCtrl.$inject = ['CustomerSrv', 'CartsSrv', 'OrderSrv', 'AddressSrv', '$rootScope', '$auth', '$state', '$localStorage', '$filter', 'NotificationSrv', 'StateSrv'];

})();