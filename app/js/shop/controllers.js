/**
 * Created by fishergio on 24/03/17.
 */
(function () {
    'use strict';

    function ShopCartCtrl(CartsSrv, $rootScope, $auth, $state, $localStorage, $filter, NotificationSrv, ValidCouponSrv) {
        var self = this;
        self.total = $localStorage.total;
        self.params = {};
        var items = [];
        self.items = $localStorage.items ? $localStorage.items : [];
        $localStorage.items = self.items;
        self.items = $localStorage.items;
        self.itemCount = self.items.length;
        $localStorage.total = self.total;
        $rootScope.items = $localStorage.items;
        self.tax = false;
        self.taxInverse = false;
        $localStorage.globalDiscount = {amount: 0};
        $localStorage.shipmentTotal = 0;
        $localStorage.ship = false;

        if ($auth.isAuthenticated()) {
            var user = $localStorage.appData.user;
            self.branchOffice = '';
            self.defaultbranchOffice = '';
            self.customer = $localStorage.appData.user.customer ? $localStorage.appData.user.customer : '';
            self.email = $localStorage.appData.user.email ? $localStorage.appData.user.email : '';
            self.customerName = $localStorage.appData.user.firstName ? $localStorage.appData.user.firstName : '';
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
            $localStorage.globalDiscount = {amount: 0};
            $localStorage.promoTotal = 0;
            $localStorage.shipmentTotal = 0;
            $localStorage.ship = false;
        };

        self.removeItem = function (item) {
            var find_item = $filter('filter')(self.items, {id: item.id})[0];
            if (find_item) {
                self.items.splice([self.items.indexOf(find_item)], 1);
                NotificationSrv.error('Eliminado del carrito', item.name);
                getTotal();

            }
        };

        var applyDiscountPercentage = function () {
            if ($localStorage.globalDiscount.amount === 0)
                return;
            // get fraction value discount
            $localStorage.globalDiscount.discount = (parseFloat($localStorage.globalDiscount.amount) / 100) * self.total;
            // subtract import and discount
            self.total = self.total - $localStorage.globalDiscount.discount;
            self.promoTotal += parseFloat($localStorage.globalDiscount.discount);
            $localStorage.total = self.total;
            $localStorage.promoTotal = self.promoTotal;
        };
        // calculate discount cash global
        var applyDiscountCash = function () {
            if ($localStorage.globalDiscount.amount === 0)
                return;
            $localStorage.globalDiscount.discount = $localStorage.globalDiscount.amount;
            self.total = (self.total - parseFloat($localStorage.globalDiscount.discount));
            self.promoTotal += parseFloat($localStorage.globalDiscount.discount);
            $localStorage.total = self.total;
            $localStorage.promoTotal = self.promoTotal;
        };

        var getTotal = function () {
            self.total = 0;
            self.import = 0;
            self.subTotal = 0;
            self.promoTotal = 0;
            angular.forEach(self.items, function (value, key) {
                //first Time calcule
                self.import = parseFloat(value.price) * value.qty;
                self.total += parseFloat(value.price) * value.qty;
                self.subTotal += self.import;
            });
            if ($localStorage.globalDiscount.isPercentage === 0) {
                applyDiscountPercentage();
            }
            else {
                applyDiscountCash();
            }
            if ($localStorage.ship) {
                $localStorage.shipmentTotal = 0;

            }
            self.shipmentTotal = $localStorage.shipmentTotal;
            $localStorage.total = self.total;
            $localStorage.promoTotal = self.promoTotal;
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
                    self.cart = data;
                    $localStorage.cart = self.cart;
                    $rootScope.items = 0;
                });
                $state.go('shipping-address');
            }
        };

        self.validCoupon = function () {
            var params = {};
            self.idUser = $localStorage.appData.user.customer;
            params.code = self.coupon;
            params.customer = self.idUser;
            params.items = self.items;
            if (params.code && params.customer) {
                ValidCouponSrv.save(params).$promise.then(function (data) {
                    self.code = data;
                    if (self.code.isValid) {
                        if (!self.code.shipmentFree) {
                            $localStorage.globalDiscount.isPercentage = self.code.discountType;
                            $localStorage.globalDiscount.amount = self.code.amount;
                            $localStorage.globalDiscount.coupon = self.code.id;
                            getTotal();
                            NotificationSrv.success(" Cupón aplicado correctamente");
                        }
                        else {
                            $localStorage.ship = true;
                            $localStorage.globalDiscount.coupon = self.code.id;
                            getTotal();
                            NotificationSrv.success(" Felicidades, tienes envio gratis");
                        }
                    }
                    else {
                        NotificationSrv.error("Cupón no valido, " + data.reason);
                    }
                });
            }
        };

    }

    function ShippingAddressCtrl(AddressSrv, NotificationSrv, StateSrv, CustomerSrv, $localStorage, $rootScope, $state) {
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
        AddressSrv.query({customer: self.customer}).$promise.then(function (data) {
            self.addresses = data;
        }, function (error) {
            angular.forEach(error, function (key, value) {
                NotificationSrv.error("Error", value);
            });
        });

        self.saveShippingAddress = function () {
            if (!self.address) {
                newShippingAddress();
            } else {
                $localStorage.appData.user.address = self.address;
                $state.go('checkout');
            }
        };

        self.newShippingAddress = function () {
            var address = angular.copy(self.formData);
            var customer = {};
            console.log(self.customer);
            CustomerSrv.get({id: self.customer}).$promise.then(function (data) {
                customer = data;
                //if user has not phone add the shipmet phone
                if (!customer.phone || !customer.state || !customer.city) {
                    customer.phone = address.phone;
                    customer.state = address.state;
                    customer.city = address.city;
                    CustomerSrv.update({id: customer.id}, customer).$promise.then(function (data) {
                    });
                }
            });
            address.customer = self.customer;
            self.busy = true;
            AddressSrv.save(address).$promise.then(function (data) {
                $localStorage.appData.user.address = data.id;
                NotificationSrv.success('Domicilio agregado correctamente');
                self.busy = false;
                self.formData = {};
                $state.go('checkout');
            }, function (error) {
                angular.forEach(error.data, function (key, value) {
                    NotificationSrv.error(key, value);
                    self.busy = false;
                });
            });
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

    function PaymentCtrl(CustomerSrv, OrderSrv, AddressSrv, ErrorSrv, $rootScope, $state, $localStorage, NotificationSrv, $q, $filter, $window, $stateParams) {
        var self = this;
        var user = $localStorage.appData.user;
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
        self.address = $localStorage.appData.user.address;
        self.phone = ''; //$localStorage.appData.user.phone;
        self.orderPaymentType = '';
        self.shiping = true;
        self.busyPaypal = false;
        self.paypalBtn = 'Realizar pago';

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
            //phone: self.customer.phone,
            amount: $localStorage.total,
            items: $localStorage.items
        };
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

        var clearCart = function () {
            self.items = [];
            self.total = 0;
            $localStorage.items = [];
            $localStorage.cart = [];
            $localStorage.total = 0;
            $localStorage.promoTotal = 0;
            delete $localStorage.appData.user.address;
            self.promoTotal = 0;
            self.typeTax = false;
        };

        var publishKey = 'key_B34Yd1rcLM2Pyxpg';
        //var publishKey = $rootScope.currentKey;
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
            var coupon = '';
            var params = {
                brand: Conekta.card.getBrand(self.payment.card.number),
                cardholder: self.payment.card.name,
                token: token.id,
                email: self.email,
                items: $localStorage.items,
                total: $localStorage.total,
                shop: self.store,
                promoTotal: $localStorage.promoTotal,
                shipmentTotal: $localStorage.shipmentTotal
            };
            if ('coupon' in $localStorage.globalDiscount) {
                params.coupon = $localStorage.globalDiscount.coupon;
            }
            params.kind = 'order';
            params.paymentType = parseInt(self.orderPaymentType);
            params.itemCount = self.itemCount;
            if (!self.customer.phone) {
                if (self.addresship.phone) {
                    self.customer.phone = self.addresship.phone
                }
            }
            params.customer = self.customer;
            params.cartId = $localStorage.cart.id;
            params.warehouse = self.defaultWarehouse.id;
            params.employee = $localStorage.appData.user.id;
            params.destination = self.addresship.id;
            params.orderStatus = 1;
            params.isPaid = 0;
            params.token = token.id;
            params.phone = self.phone;


            OrderSrv.save(params).$promise.then(function (data) {
                clearCart();
                $state.go('purchase-completed', {orderId: data.id});
            }, function (data) {
                ErrorSrv.error(data);
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
                self.phone = data.phone;
            });

        };
        self.getCustomer();

        var shippingAddress = function () {
            var fieldship = 'id,address,phone,zip,cityName,neighborhood,phone,stateName';
            var address = {};
            AddressSrv.get({fields: fieldship, id: self.address}).$promise.then(function (data) {
                self.addresship = data;
            }, function (error) {
                NotificationSrv.error("Error");
            });
        };
        shippingAddress();


        self.processPurchase = function () {
            var purchase = angular.copy(self.formData);
            CustomerSrv.save(purchase).$promise.then(function (data) {
            }, function (error) {
                angular.forEach(error, function (value, key) {
                    NotificationSrv.error(key);
                });
            });
        };

        self.createOrder = function () {
            //self.promoTotal = $localStorage.promoTotal;
            //self.promoTotal = (Math.round(self.promoTotal * 100) / 100);
            var coupon = '';
            var params = {metadata: {taxInverse: false}};
            if ('coupon' in $localStorage.globalDiscount) {
                coupon = $localStorage.globalDiscount.coupon;

                params.coupon = coupon;
            }
            params.kind = 'order';
            params.orderStatus = 1;
            params.paymentType = parseInt(self.orderPaymentType);
            params.isPaid = 2;
            params.itemCount = self.itemCount;
            params.store = self.defaultbranchOffice.id;
            if (!self.customer.phone) {
                if (self.addresship.phone) {
                    self.customer.phone = self.addresship.phone;
                }
            }
            params.customer = self.customer;
            params.cartId = $localStorage.cart.id;
            params.warehouse = self.defaultWarehouse.id;
            params.employee = $localStorage.appData.user.id;
            params.destination = self.addresship.id;
            if (params.paymentType === 8) {
                params.orderStatus = 1;
                params.isPaid = 0;
                params.token = token.id;
            }

            if (params.paymentType === 6) {
                params.orderStatus = 1;
                params.isPaid = 2;
            }

            if (params.paymentType === 3) {
                params.orderStatus = 1;
                params.isPaid = 2;
            }

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
            params.promoTotal = $localStorage.promoTotal;
            params.shipmentTotal = $localStorage.shipmentTotal;

            OrderSrv.save(params).$promise.then(function (data) {
                clearCart();
                if (data.paymentType === 3) {
                    self.busyPaypal = true;
                    self.paypalBtn = self.busyPaypal ? 'Procesando' : 'Realizar pago';
                    $localStorage.orderPaypal = data.id;
                    $window.location.href = data.metadata.approvalUrl;
                } else {
                    $state.go('purchase-completed', {orderId: data.id});
                }
            }, function (data) {
                ErrorSrv.error(data);
            });
        };

        self.paypalSuccess = function(paymentId, token, PayerID){
            self.params = {};
            self.updateParams = {};
            self.params.id = $localStorage.orderPaypal;
            self.params.fields = 'id,customerName,metadata';

            OrderSrv.get(self.params).$promise.then(function(data){
                var metadata = data.metadata;
                metadata.payerID = PayerID;
                self.updateParams.isPaid = 0;
                self.updateParams.metadata = metadata;
                OrderSrv.update({id:data.id},self.updateParams).$promise.then(function(data){
                    //NotificationSrv.success("Actualizado");
                }, function(error){
                    ErrorSrv.error(error);
                })
            }, function (error) {
                ErrorSrv.error(error);
            });
        };

        self.paypalCancel = function(token){
            NotificationSrv.error('Se cancelo la venta');
        };

        if ($stateParams.paymentId && $stateParams.token && $stateParams.PayerID) {
            if ($state.current.name == 'paypal-success') {
                self.paypalSuccess($stateParams.paymentId, $stateParams.token, $stateParams.PayerID);
            }
        }

        if ($stateParams.token) {
            if ($state.current.name == 'paypal-cancel') {
                self.paypalCancel($stateParams.token);
            }
        }
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

        };

        AddressSrv.query().$promise.then(function (data) {
            self.addresses = data;

        }, function (error) {
            NotificationSrv.error("Error");
        });

    }

    function PurchaseCompletedCtrl(OrderSrv, $stateParams, NotificationSrv) {
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


        if ($stateParams.orderId) {
            OrderSrv.get({id: $stateParams.orderId}).$promise.then(function (data) {
                self.purchase = data;
                self.purchase.items = aditionalKey(self.purchase.items);

            });
        } else {
            NotificationSrv.error('No pudimos cargar su detalle de venta, le enviaremos un correo electronico');
        }

    }

// create the module and assign controllers
    angular.module('shop.controllers', ['shop.services'])
        .controller('ShopCartCtrl', ShopCartCtrl)
        .controller('ShippingAddressCtrl', ShippingAddressCtrl)
        .controller('PaymentCtrl', PaymentCtrl)
        .controller('OrderCtrl', OrderCtrl)
        .controller('PurchaseCompletedCtrl', PurchaseCompletedCtrl);

    // inject dependencies to controllers
    ShopCartCtrl.$inject = ['CartsSrv', '$rootScope', '$auth', '$state', '$localStorage', '$filter', 'NotificationSrv', 'ValidCouponSrv'];
    ShippingAddressCtrl.$inject = ['AddressSrv', 'NotificationSrv', 'StateSrv', 'CustomerSrv', '$localStorage', '$rootScope', '$state'];
    OrderCtrl.$inject = ['OrderSrv', 'AddressSrv', 'NotificationSrv', '$localStorage', '$rootScope', '$state', '$filter'];
    PaymentCtrl.$inject = ['CustomerSrv', 'OrderSrv', 'AddressSrv', 'ErrorSrv', '$rootScope', '$state', '$localStorage', 'NotificationSrv', '$q', '$filter', '$window', '$stateParams'];
    PurchaseCompletedCtrl.$inject = ['OrderSrv', '$stateParams', 'NotificationSrv'];
})();
