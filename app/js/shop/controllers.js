/**
 * Created by fishergio on 24/03/17.
 */
(function () {
    'use strict';

    function ShopCartCtrl(CartsSrv, OrderSrv, $rootScope, $auth, $state, $localStorage, $filter, NotificationSrv) {
        var self = this;
        var user = $localStorage.appData.user;
        self.params = {};
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

        // get default branch office
        /*self.getDefaulBranchOffice = function () {
            if (!user.branchOffices)
                return
            self.defaultbranchOffice = $filter('filter')(user.branchOffices, {default: true})[0];
            self.defaultWarehouse = $filter('filter')(self.defaultbranchOffice.warehouses, {default: true})[0];
            self.branchOffices = user.branchOffices;
            $rootScope.defaultbranchOffice = self.defaultbranchOffice.name;
            cnsole.log(self.defaultbranchOffice.name);
            return self.defaultbranchOffice;

        };
        self.getDefaulBranchOffice();*/

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
                    NotificationSrv.success("Pedido realizado correctamente");
                    //self.clearCart();
                    $rootScope.items = 0;
                });
                $state.go('payment-method');
            }
        };

        self.createOrder = function () {
            //self.promoTotal = $localStorage.promoTotal;
            //self.promoTotal = (Math.round(self.promoTotal * 100) / 100);
            var params = { metadata: { taxInverse: false } };
            params.kind = 'order';
            params.orderStatus = 0;
            params.paymentType = 0;
            params.isPaid = 2;
            params.warehouse = 11;
            params.itemCount = self.itemCount;
            params.store = self.store;
            params.customer = self.customer;
            params.cartId = $localStorage.cart.id;
            //params.warehouse = self.defaultWarehouse.id;

            OrderSrv.save(params).$promise.then(function (data) {
                console.log(data);
                console.log(params);
            });
            $state.go('checkout');
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
                'number': null,
                'name': '',
                'exp_year': '',
                'exp_month': '',
                'cvc': null
            }
        };

        var publishKey = $rootScope.currentKey;
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
                shop: self.store,
                kind: 'card_payment',
                production: self.charge.production,
                installments: self.charge.production.installments ? self.charge.production.installments : 0
            };
            ChargeSrv.save(params).$promise.then(function (response) {
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
            });
        };

        if ($stateParams.id) {
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
        }

        var successResponseHandlerSharePay = function (token) {
            var charge = angular.copy(self.charge);
            // update charge
            charge.brand = Conekta.card.getBrand(self.payment.card.number);
            charge.cardholder = self.payment.card.name;
            charge.authCode = token.id;
            charge.phone = self.payment.phone;
            charge.email = self.payment.email;
            charge.shop = self.charge.shop.id;

            ChargeSrv.checkout({ id: $stateParams.id }, charge).$promise.then(function (response) {
                NotificationSrv.success('Pago realizado correctamente!');
                $state.go('checkout.success');
            }, function (data) {
                self.busyCard = false;
                angular.forEach(data.data, function (value, key) {
                    NotificationSrv.error(value);
                });
            });
        };

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

        self.processSharePayPayment = function () {
            self.busyCard = true;
            Conekta.token.create(self.payment, successResponseHandlerSharePay, errorResponseHandler);
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

        self.selectedAddress = function(){
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
    PaymentCtrl.$inject = ['CustomerSrv', 'OrderSrv', 'AddressSrv', '$rootScope', '$state', '$localStorage', 'NotificationSrv', '$q', '$stateParams'];

})();