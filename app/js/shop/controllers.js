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
            $localStorage.subTtotal = 0;
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
                self.shipmentPrice += parseFloat(value.shipmentPrice);
            });
            if ($localStorage.globalDiscount.isPercentage === 1) {
                applyDiscountPercentage();
            }
            else if ($localStorage.globalDiscount.isPercentage === 0) {
                applyDiscountCash();
            }
            if ($localStorage.ship) {
                $localStorage.shipmentTotal = 0;

            }
            $localStorage.total = self.total;
            $localStorage.subTtotal = self.subTotal;
            $localStorage.promoTotal = self.promoTotal;
            //$localStorage.shipmentTotal = self.shipmentPrice;
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
            var taxonomies = [];
            angular.forEach(self.items, function (obj, ind) {
                taxonomies.concat(obj.taxonomies);
                if (obj.taxonomies.length) {
                    angular.forEach(obj.taxonomies, function (obj, ind) {
                        taxonomies.push({id: obj.id});
                    });
                }
            });
            params.taxonomies = taxonomies;
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
                        self.codeUsed = true;
                    }
                    else {
                        NotificationSrv.error("Cupón no valido, " + data.reason);
                    }
                });
            }
        };

        self.removeCoupon = function () {
            $localStorage.globalDiscount = {amount: 0};
            $localStorage.promoTotal = 0;
            $localStorage.shipmentTotal = 0;
            $localStorage.ship = false;
            self.codeUsed = false;
            getTotal();


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
        self.sendOptions = "0";

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
                $localStorage.appData.user.address = self.address.id;
                $state.go('checkout', {shipping: self.sendOptions});
            }
        };

        self.newShippingAddress = function () {
            var address = angular.copy(self.formData);
            var customer = {};
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
            address.state = self.state.id;
            address.city = self.city.id;
            self.busy = true;
            AddressSrv.save(address).$promise.then(function (data) {
                $localStorage.appData.user.address = data.id;
                NotificationSrv.success('Domicilio agregado correctamente');
                self.busy = false;
                self.formData = {};
                $state.go('checkout', {shipping: self.sendOptions});
            }, function (error) {
                angular.forEach(error.data, function (key, value) {
                    NotificationSrv.error(key, value);
                    self.busy = false;
                });
            });
        };

        self.retriveInStore = function () {
            $state.go('checkout', {shipping: self.sendOptions});

        };


        // get all the states
        self.busyState = true;

        self.getStates = function () {
            if (!self.states) {
                StateSrv.query({country: '573fda4d5b0d6863743020d1', ordering: 'name'}).$promise.then(function (data) {
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
            console.log('lalalalal');
            if (!self.state) {
                return
            }
            self.busyCity = true;
            if (self.cities.length < 1) {
                StateSrv.getCities({state: self.state.id, ordering: 'name'}).$promise.then(function (response) {
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

    function PaymentCtrl(CustomerSrv, OrderSrv, AddressSrv, ErrorSrv, $rootScope, $state, $localStorage, NotificationSrv, $q, $filter, $window, $stateParams, $element) {
        var self = this;
        var user = $localStorage.appData.user;
        self.params = {metadata: {taxInverse: 0, shipping: self.shipping}};
        self.showNext = false;
        self.items = $localStorage.items ? $localStorage.items : [];
        self.total = $localStorage.total;
        self.subTotal = $localStorage.subTtotal;
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
        self.orderPaymentType = '8';
        self.shiping = true;
        self.busyPaypal = false;
        self.paypalBtn = 'Realizar pago';
        self.shipping = angular.copy($stateParams.shipping);
        self.creditCard = true;
        $rootScope.items = self.items;
        $rootScope.idUser = self.idUser;
        self.busyCard = false;
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
            if (self.address) {
                AddressSrv.get({fields: fieldship, id: self.address}).$promise.then(function (data) {
                    self.addresship = data;
                }, function (error) {
                    NotificationSrv.error("Error");
                });
            }

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

        var initialOrder = function () {
            var coupon = '';
            if ('coupon' in $localStorage.globalDiscount) {
                coupon = $localStorage.globalDiscount.coupon;
                self.params.coupon = coupon;
            }
            self.params.kind = 'order';
            // status pendiente
            self.params.status = 'a95bea87-1bec-44b8-9d27-96a1ed00e306';
            self.params.paymentType = parseInt(self.orderPaymentType);
            self.params.isPaid = 2;
            self.params.itemCount = self.itemCount;
            self.params.total = self.total;
            self.params.subTotal = self.subTotal;
            self.params.store = self.defaultbranchOffice.id;
            if (!self.customer.phone) {
                if (self.addresship.phone) {
                    self.customer.phone = self.addresship.phone;
                }
            }
            self.params.customer = self.customer;
            self.params.cartId = $localStorage.cart.id;
            self.params.warehouse = self.defaultWarehouse.id;
            self.params.employee = $localStorage.appData.user.id;
            if (self.addresship) {
                self.params.destination = self.addresship.id;
            }

            if (self.params.paymentType === 8) {
                self.params.status = 'a95bea87-1bec-44b8-9d27-96a1ed00e306';
                self.params.isPaid = 0;
            }

            if (self.params.paymentType === 6) {
                self.params.status = 'a95bea87-1bec-44b8-9d27-96a1ed00e306';
                self.params.isPaid = 2;
            }

            if (self.params.paymentType === 3) {
                self.params.status = 'a95bea87-1bec-44b8-9d27-96a1ed00e306';
                self.params.isPaid = 2;
            }
            self.params.items = self.items;
            self.params.itemCount = self.items.length;
            self.params.promoTotal = $localStorage.promoTotal;
            self.params.shipmentTotal = $localStorage.shipmentTotal;
        };


        var publishKey = self.defaultbranchOffice.metadata.mp.publicKey;
        var setPublishableKey = function () {
            Mercadopago.setPublishableKey(publishKey);
        };

        var successResponseHandler = function (status, response) {
            var data = response;
            initialOrder();
            data.payment_method_id = self.params.paymentMethodId;
            delete self.params.year
            delete self.params.month
            delete self.params.cardNumber
            delete self.params.cvc
            self.params.store = self.defaultbranchOffice;
            self.params.customerName = self.params.customer.businessName;
            self.params.customerEmail = self.params.customer.contactPersonEmail;
            self.params.customer = self.params.customer.id;
            data.preOrder = self.params;
            data.payment_method_id = self.params.paymentMethodId;
            OrderSrv.paidMP({dataPayment: data}).$promise.then(function (response) {
                $state.go('purchase-completed', {orderId: response.id});
            }, function (error) {
                console.log(error);
                NotificationSrv.error('Error al procesar su pago');
            });
        };

        var errorResponseHandler = function (error) {
            console.log(error);
            var deferred = $q.defer();
            deferred.promise.then(function (error) {
                console.log(error);
                NotificationSrv.error(error.message_to_purchaser);
            });
            deferred.resolve(error);
        };

        var setPaymentMethodInfo = function (status, response) {
            self.params.paymentMethodId = response[0].id;
        }

        var getBin = function () {
            Mercadopago.getPaymentMethod({
                bin: self.params.cardNumber
            }, setPaymentMethodInfo);
        }

        self.processPaymentCard = function () {
            setPublishableKey();
            getBin();
            Mercadopago.createToken($element.find('#payment-form'), successResponseHandler, errorResponseHandler);
        };

        self.createOrder = function () {
            //self.promoTotal = $localStorage.promoTotal;
            //self.promoTotal = (Math.round(self.promoTotal * 100) / 100);

            initialOrder();
            OrderSrv.save(self.params).$promise.then(function (data) {
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

        self.paypalSuccess = function (paymentId, token, PayerID) {
            self.params = {};
            self.updateParams = {};
            self.params.id = $localStorage.orderPaypal;
            self.params.fields = 'id,customerName,metadata';

            OrderSrv.get(self.params).$promise.then(function (data) {
                var metadata = data.metadata;
                metadata.payerID = PayerID;
                self.updateParams.isPaid = 0;
                self.updateParams.metadata = metadata;
                OrderSrv.update({id: data.id}, self.updateParams).$promise.then(function (data) {
                    //NotificationSrv.success("Actualizado");
                }, function (error) {
                    ErrorSrv.error(error);
                })
            }, function (error) {
                ErrorSrv.error(error);
            });
        };

        self.paypalCancel = function (token) {
            NotificationSrv.error('Se cancelo la venta');
        };

        if ($stateParams.paymentId && $stateParams.token && $stateParams.PayerID) {
            if ($state.current.name === 'paypal-success') {
                self.paypalSuccess($stateParams.paymentId, $stateParams.token, $stateParams.PayerID);
            }
        }

        if ($stateParams.token) {
            if ($state.current.name === 'paypal-cancel') {
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
            params.status = '412a2c2a-34a5-4986-9059-adafa9af5250';
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

            }, function (e) {
                NotificationSrv.error('No pudimos cargar su detalle de venta, le enviaremos un correo electronico');

            });
        }
        if ($stateParams.kind) {
            self.title = '¡Gracias por escribirnos!';
            self.message = 'Mensaje de gracias';
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
    PaymentCtrl.$inject = ['CustomerSrv', 'OrderSrv', 'AddressSrv', 'ErrorSrv', '$rootScope', '$state', '$localStorage', 'NotificationSrv', '$q', '$filter', '$window', '$stateParams', '$element'];
    PurchaseCompletedCtrl.$inject = ['OrderSrv', '$stateParams', 'NotificationSrv'];
})();
