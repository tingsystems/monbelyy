/**
 * Created by fishergio on 24/03/17.
 */
(function () {
    'use strict';

    function ShopCartCtrl(CartsSrv, $rootScope, $auth, $state, $localStorage, $filter, NotificationSrv, ValidCouponSrv, $window, $stateParams) {
        var self = this;
        self.total = $localStorage.total;
        $window.scrollTo(0, 0);
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
        self.shipmentTotal = $localStorage.shipmentTotal ? $localStorage.shipmentTotal : 0;
        $localStorage.ship = false;
        try {
            self.minimumPurchase = parseFloat($localStorage.appData.user.branchOffices[0].metadata.minusMount);
            if (self.minimumPurchase === undefined) {
                self.minimumPurchase = 0;


            }
        }
        catch (err) {
            self.minimumPurchase = 0;
            console.log(err);
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

        if($stateParams.id){
            CartsSrv.cartPublic({id: $stateParams.id, fields:'id,attachments,items'} ).$promise.then(function (data) {
                if(data.id){
                    self.cart = data;
                    $localStorage.cart = self.cart;
                    $localStorage.items = parseItemsCart(self.cart.items);
                }
                // Redirect user here after a successful log in.
                self.items = $localStorage.items ? $localStorage.items : [];
                self.itemCount = self.items.length;
                $rootScope.items = self.items.length;
                getTotal();
            }, function(error){
                if(error.status === 404){
                    NotificationSrv.error("Lo sentimos, no pudimos encontrar lo que buscas");
                }
                $state.go('home');
            });
        }


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

        self.setItem = function (item, qty, operation) {
            if(!qty){
                return;
            }
            qty = parseInt(qty);
            if(operation === 'plus'){
                qty += 1;

            }else if(operation === 'minus'){
                qty -= 1;

            }
            if('stock' in item){
                //validar inventario
                if(qty > item.stock){
                    NotificationSrv.error('Lo sentimos, no contamos con suficiente inventario');
                    return;

                }
            }
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
                if ($auth.isAuthenticated()){
                    angular.forEach(self.items, function (obj, ind) {
                        items[ind] = {
                            id: obj.id,
                            qty: parseInt(obj.qty),
                            promotion: parseFloat(obj.discount.discount),
                            price: parseFloat(obj.price)
                        };
    
                    });
    
                    var update = false;
                    if ( 'cart' in  $localStorage) {
                        if ('id' in $localStorage.cart) {
                            update = true;
                        }
                    }
    
                    if (update) {
                        CartsSrv.update({id: $localStorage.cart.id}, {
                            items: items,
                            store: self.defaultbranchOffice.id,
                            customer: self.customer,
                            customerName: self.customerName,
                            customerEmail: self.email,
                            itemCount: self.itemCount,
                            fromWeb: true,
                            metadata: {}
                        }).$promise.then(function (data) {
                            self.cart = data;
                            $localStorage.shipmentTotal = parseFloat(data.shipmentCost);
                            $localStorage.cart = self.cart;
                            $localStorage.cartId = self.cart.id;
                            $rootScope.items = 0;
                        });
                    } else {
                        CartsSrv.save({
                            items: items,
                            store: self.defaultbranchOffice.id,
                            customer: self.customer,
                            customerName: self.customerName,
                            customerEmail: self.email,
                            itemCount: self.itemCount,
                            fromWeb: true,
                            metadata: {}
                        }).$promise.then(function (data) {
                            self.cart = data;
                            $localStorage.shipmentTotal = parseFloat(data.shipmentCost);
                            $localStorage.cart = self.cart;
                            $rootScope.items = 0;
                            $localStorage.cartId = self.cart.id;
                        });
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
            $localStorage.taxInverse = 0;
            var update = false;
            if ( 'cart' in  $localStorage) {
                if ('id' in $localStorage.cart) {
                    update = true;
                }
            }

            if (update && $auth.isAuthenticated()) {
                CartsSrv.update({id: $localStorage.cart.id}, {
                    items: self.items,
                    store: self.defaultbranchOffice.id,
                    customer: self.customer,
                    customerName: self.customerName,
                    customerEmail: self.email,
                    itemCount: self.itemCount,
                    fromWeb: true,
                    metadata: {}
                }).$promise.then(function (data) {
                    self.cart = data;
                    if ('shipmentCost' in self.cart){
                        self.cart.shipmentCost = $localStorage.shipmentTotal;
                    }
                    if ('metadata' in self.cart){
                        if ('shipment' in self.cart.metadata){
                            delete self.cart.metadata.shipment;
                        }
                    }
                    $localStorage.cart = self.cart;
                    $localStorage.cartId = self.cart.id;
                    $rootScope.items = 0;
                    delete $localStorage.cartId;

                });
            }
            $localStorage.cart = {};

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
            $localStorage.globalDiscount.discount = (parseFloat(self.code.amount) / 100) * self.total;
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

        var getTotal = function (tax) {
            self.total = 0;
            self.import = 0;
            self.subTotal = 0;
            self.promoTotal = 0;
            self.shipmentPrice = 0;
            self.taxTotal = 0;
            self.tax = tax;
            angular.forEach(self.items, function (value, key) {
                if(parseFloat(value.offerPrice) > 0){
                    value.price = value.offerPrice;
                }
                if($rootScope.multiplePrices){
                    if(!value.priceCopy){
                        value.priceCopy = angular.copy(value.price);
                    }
                    if(value.qty < $rootScope.multiplePricesConfig.limit){
                        // priceList va a ser price
                        value.price = value.priceList;
                    }else{
                        value.price = value.priceCopy;

                    }
                }

                //first Time calcule
                if (value.typeTax === 0) {
                    var price = (parseFloat(value.price) / 1.16);
                    value.import = (parseFloat(price) * value.qty);
                    value.tax = (parseFloat(value.import) * 0.16);
                    $localStorage.taxInverse = 0;

                } else if (value.typeTax === 1) {
                    value.import = (parseFloat(value.price) * value.qty);
                    value.tax = (parseFloat(value.import) * 0.16);
                    $localStorage.taxInverse = 1;

                }
                else if (value.typeTax === 2) {
                    value.import = (parseFloat(value.price) * value.qty);
                    value.tax = 0;
                    $localStorage.taxInverse = 2;


                }
                self.import += parseFloat(value.import);
                self.taxTotal += parseFloat(value.tax);
                if(self.tax){
                    self.taxTotal = (parseFloat(self.import) * 0.16);
                }

            });
            if ($localStorage.ship) {
                $localStorage.shipmentTotal = 0;
                self.shipmentPrice = 0;
            }

            self.subTotal = self.import;
            self.subTotal = (Math.round(self.subTotal * 100) / 100);
            self.taxTotal = (Math.round(self.taxTotal * 100) / 100);
            self.shipmentTotal = $localStorage.shipmentTotal;
            self.total = parseFloat(self.import) + parseFloat(self.taxTotal);
            if (self.shipmentTotal) {
                self.total = parseFloat(self.import) + parseFloat(self.taxTotal) + parseFloat(self.shipmentTotal);
            }
            self.total = (Math.round(self.total * 100) / 100);
            $localStorage.total = self.total;
            $localStorage.subTtotal = self.subTotal;
            $localStorage.promoTotal = (Math.round(self.promoTotal * 100) / 100);
            $localStorage.taxTotal = self.taxTotal;

            if ($localStorage.globalDiscount.isPercentage === 0) {
                applyDiscountPercentage();
            }
            else if ($localStorage.globalDiscount.isPercentage === 1) {
                applyDiscountCash();
            }

        };
        getTotal();

        self.isAuthenticated = function () {
            return $auth.isAuthenticated();
        };

        self.processPurchase = function () {
            if (!$auth.isAuthenticated()) {
                $state.go('register',{'action':'register'});
            } else {
                angular.forEach(self.items, function (obj, ind) {
                    items[ind] = {
                        id: obj.id,
                        qty: parseInt(obj.qty),
                        promotion: parseFloat(obj.discount.discount),
                        price: parseFloat(obj.price)
                    };

                });

                var update = false;
                if ( 'cart' in  $localStorage) {
                    if ('id' in $localStorage.cart) {
                        update = true;
                    } 
                } 

                if (update) {
                    CartsSrv.update({id: $localStorage.cart.id}, {
                        items: items, 
                        store: self.defaultbranchOffice.id, 
                        customer: self.customer,
                        customerName: self.customerName,
                        customerEmail: self.email,
                        itemCount: self.itemCount,
                        fromWeb: true,
                        metadata: {}
                    }).$promise.then(function (data) {
                        self.cart = data;
                        if ('shipmentCost' in self.cart){
                            self.cart.shipmentCost = $localStorage.shipmentTotal;
                        }
                        if ('metadata' in self.cart){
                            if ('shipment' in self.cart.metadata){
                                delete self.cart.metadata.shipment;
                            }
                        }
                        $localStorage.cart = self.cart;
                        $rootScope.items = 0;
                        $localStorage.cartId = self.cart.id;
                    });
                } else {
                    CartsSrv.save({
                        items: items, 
                        store: self.defaultbranchOffice.id, 
                        customer: self.customer,
                        customerName: self.customerName,
                        customerEmail: self.email,
                        itemCount: self.itemCount,
                        fromWeb: true,
                        metadata: {}
                    }).$promise.then(function (data) {
                        self.cart = data;
                        $localStorage.shipmentTotal = data.shipmentCost;
                        $localStorage.cart = self.cart;
                        $rootScope.items = 0;
                        $localStorage.cartId = self.cart.id;
                    });
                }
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
                            NotificationSrv.success(" Cup??n aplicado correctamente");
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
                        NotificationSrv.error("Cup??n no valido, " + data.reason);
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

        $rootScope.$on('newTotals', function (event, data) {
            $localStorage.ship = data.data;
            getTotal()
        });
        $rootScope.$on('newTotalsTax', function (event, data) {
            getTotal(data.data)
        });

        self.goToPurchaseGuest = function () {
            $state.go('shipping-address', {intent: 'guest'});
        };

    }

    function ShippingAddressCtrl(AddressSrv, ShipmentSrv, NotificationSrv, StateSrv, CustomerSrv, $localStorage, $rootScope, $state, $filter, CartsSrv, $timeout, $stateParams) {
        var self = this;
        
        try {
            var user = $localStorage.appData.user;
        }
        catch (err) {
            console.log('compra como invitado');
        }

        try {
            self.defaultbranchOffice = $filter('filter')(user.branchOffices, {default: true})[0];
        }
        catch (err) {
            console.log('compra como invitado');
        }

        try {
            self.customer = $localStorage.appData.user.customer;
            self.params.customer = self.customer;
        }
        catch (err) {
            console.log('compra como invitado');
        }

        self.branchOffice = '';
        self.params = [];
        self.formDataShip = {};
        self.formData = {};
        self.address = '';
        self.cart = $localStorage.cart ? $localStorage.cart : {};
        self.busy = false;
        self.addAddress = false;
        self.items = $localStorage.items ? $localStorage.items : [];
        self.total = $localStorage.total;
        $localStorage.items = self.items;
        self.items = $localStorage.items;
        $localStorage.total = self.total;
        $rootScope.items = $localStorage.items;
        self.params.customer = self.customer;
        self.sendOptions = "0";
        self.busyAddresses = true;
        self.addresses = [];


        
        if('metadata' in self.cart){
            if('shipments' in self.cart.metadata){
                delete self.cart.metadata.shipments;
            }
            if('rate' in self.cart.metadata){
                delete self.cart.metadata.rate;

            }
            $localStorage.cart = self.cart;
        }
        if('shipmentCost' in self.cart){
            self.cart.shipmentCost = 0;

        }

        try {
            self.lowerPrividerShip = self.defaultbranchOffice.metadata.lowerPrividerShip === true ? self.defaultbranchOffice.metadata.lowerPrividerShip : false;
        }
        catch (err) {
            self.askProvider = false;
        }

        if ($stateParams.intent === 'guest') {
            self.purchaseGuest = true;
        }


        self.getAddresses = function () {
            self.busyAddresses = true;
            AddressSrv.query({customer: self.customer}).$promise.then(function (data) {
                self.addresses = data;
                self.busyAddresses = false;
                if (self.addresses.length === 0) {
                    NotificationSrv.confirm("Error", "Aun no tienes una direccion de envio, por favor agrega una para continuar")
                }
            }, function (error) {
                self.busyAddresses = false;
                angular.forEach(error, function (key, value) {
                    NotificationSrv.error("Error", value);
                });
            });

        };

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
                self.addAddress = false;
                self.formData = {};
                self.addresses[0] = data;
                self.address = data;
                self.addAddress = false;
                self.state = null;
                self.city = null;
                self.quoteShipment();
                // $state.go('checkout', {shipping: self.sendOptions});

            }, function (error) {
                angular.forEach(error.data, function (key, value) {
                    NotificationSrv.error(key, value);
                    self.busy = false;
                });
            });
        };

        self.retriveInStore = function () {
            $localStorage.appData.user.address = self.address.id;
            $localStorage.appData.getShop = self.shop;
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

        self.changeShippingOptions = function () {
            if (self.sendOptions === '1') {
                // retrive in store
                $rootScope.$emit('newTotals', {data: true});
                if ('shipmentCost' in self.cart){
                    self.cart.shipmentCost = $localStorage.shipmentTotal;
                }
                if ('metadata' in self.cart){
                    if ('shipment' in self.cart.metadata){
                        delete self.cart.metadata.shipment;
                    }
                }
            }
            else {
                // shipment
                self.address = {};
                self.validRetriveInStore = false;
                $rootScope.$emit('newTotals', {data: false});
            }
        };

        self.saveShippingAddressValidate = function () {
            var address = angular.copy(self.formData);
            var customer = {};
            self.addresses = [];
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
                self.addresses[0] = data;
                self.address = data;
                self.addAddress = false;
                self.state = null;
                self.city = null;
                self.quoteShipment();

            }, function (error) {
                angular.forEach(error.data, function (key, value) {
                    NotificationSrv.error(key, value);
                    self.busy = false;
                });
            });
        };

        self.showAddress = function () {
            self.addAddress = !self.addAddress;
        };

        self.quoteShipment =  function() {
            var branchOffice = $localStorage.appData.user.branchOffices[0];
            if('metadata' in branchOffice){
                if('mienvio' in branchOffice.metadata){
                    ShipmentSrv.quote({
                        cartId: $localStorage.cart.id,
                        addressId: self.address.id
                    }).$promise.then(function (data) {
                        self.busyAddresses = false;
                        $localStorage.cart = data;
                        self.cart = data;
                        self.total = data.total;
                        $localStorage.shipmentTotal = data.shipmentCost;
                        $localStorage.total = data.total;
                        $rootScope.$emit('newTotals', {data: false});            
                        // validar si es mayor a 1500 y si no esta en lista de precio actualizar el carrito
                        updateCartSetProvider(self.cart);
                        if(self.lowerPrividerShip){
                            getCheaperProvider();
                        }
                        
                        
                    }, function (error) {
                        self.busyAddresses = false;
                        angular.forEach(error, function (key, value) {
                            NotificationSrv.error("Error", value);
                        });
                    });
                }
                else if('shipmentCost' in  branchOffice.metadata) {
                    $localStorage.shipmentTotal = $localStorage.cart.shipmentCost;
                    $localStorage.total = $localStorage.cart.total;
                    $rootScope.$emit('newTotals', {data: false});
                    // validar si es mayor a 1500 y si no esta en lista de precio
                    if('retailShipment' in branchOffice.metadata){
                        console.log('if validar si es mayor a 1500 y si no esta en lista de precio')
                        var retailShipment = parseFloat(branchOffice.metadata.retailShipment)
                        if($localStorage.total >= retailShipment && $localStorage.priceList ===''){
                            console.log('if validar si es mayor a 1500 y si no esta en lista de precio')
                            $rootScope.$emit('newTotals', {data: true});
                            // updateCartWeightZero(setWeightZero(self.cart))
                        }
                        else {
                            console.log('else validar si es mayor a 1500 y si no esta en lista de precio ')
                        }
                    }
                    else{
                        console.log('else retailShipment')
                    }
                }
            }

        };

        var contains = function(arr, element){
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] === element) {
                    return true;
                }
            }
            return false;
        };

        self.validAddress = function(address){
            self.validRetriveInStore = false;
            if('zip' in address){
                self.validRetriveInStore = contains(self.defaultbranchOffice.metadata.codeGetShop.array, address.zip)
            }

        };

        self.changeTabServicelevel = function(){
            self.providerRate = {};
        };

        self.setProvider = function(providerRate){            
            // meter en el metadata una key llamada rate
            if('rate' in self.cart.metadata){
                delete self.cart.metadata.rate;
            }
            self.cart.metadata.rate = angular.copy(providerRate);
            updateCart(self.cart)
            //actualizar el carrito
            $timeout(function () {
                self.providerRate = providerRate;
              }, 500);
        };

        var updateCart = function(cart){
            CartsSrv.update({id: $localStorage.cart.id}, cart).$promise.then(function (data) {
                self.cart.shipmentCost = data.shipmentCost;
                if('freeShipping' in self.cart.metadata){
                    delete self.cart.metadata.freeShipping;
                }
                self.cart.metadata.freeShipping = data.metadata.freeShipping;
                self.cart.items = data.items;
                $localStorage.shipmentTotal = data.shipmentCost;
                $localStorage.cart = data;
                $rootScope.$emit('newTotals', {data: false});     
            });
        }

        var updateCartSetProvider = function(){
            self.providerRate = $filter('filter')(self.cart.metadata.shipments, {servicelevel: 'estandar'})[0];
            self.setProvider(self.providerRate)
        }

        var getCheaperProvider = function(){
            self.minimum = Object.keys(self.cart.metadata.shipments).map(function(key){
                return {
                    "key": key,
                    "value": self.cart.metadata.shipments[key]
                }
            }).sort(function(a, b){
                return a.value - b.value
            })[0];
            self.cart.metadata.rate = angular.copy(self.minimum.value);
            CartsSrv.update({id: $localStorage.cart.id}, self.cart).$promise.then(function (data) {
                self.cart.shipmentCost = data.shipmentCost;
                $localStorage.shipmentTotal = data.shipmentCost;
            });
        }

        if($stateParams.address){
            AddressSrv.get({id: $stateParams.address}).$promise.then(function(response){
                self.address = response;
                self.addresses[0] = self.address;
                self.quoteShipment();
            })
            
        }
    }

    function PaymentCtrl(CustomerSrv, OrderSrv, AddressSrv, ErrorSrv, $rootScope, $state, $localStorage, NotificationSrv, $q, $filter, $window, $stateParams, $element, StateSrv, StripeElements) {
        var self = this;
        var user = $localStorage.appData.user;
        var taxInverse = $localStorage.taxInverse ? $localStorage.taxInverse : 0;
        self.params = {metadata: {taxInverse: taxInverse, shipping: self.shipping}};
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
        self.orderPaymentType = '10';
        self.busyPaypal = false;
        self.paypalBtn = 'Realizar pago';
        self.shipping = angular.copy($stateParams.shipping);
        self.creditCard = false;
        $rootScope.items = self.items;
        $rootScope.idUser = self.idUser;
        self.busyCard = false;
        self.shippingOption = angular.copy($stateParams.shipping);
        self.shiping = true;

        self.elements = StripeElements.elements();
        console.log(self.elements);
        self.element = self.elements.create('card', {})
        console.log(self.element);
        self.cardErrors = null;

        self.element.on('change', handleChange)

        function handleChange (e) {
            self.cardErrors = e.error ? e.error.message : ''
            console.log(self.cardErrors);
        }


        var getPaymentType = function (branchOffice) {
            self.notReady = true;
            if ('mp' in branchOffice.metadata) {
                if ('publicKey' in branchOffice.metadata.mp) {
                    self.creditCardMethod = true;
                    self.notReady = false;
                }
            }
            if ('paypal' in branchOffice.metadata) {
                if ('clientId' in branchOffice.metadata.paypal) {
                    self.paypalMethod = true;
                    self.notReady = false;
                }
            }
            if ('bankAccount' in branchOffice.metadata) {
                if ('account' in branchOffice.metadata.bankAccount) {
                    self.depositMethod = true;
                    self.notReady = false;
                }
            }
            if ('bankAccounts' in branchOffice.metadata){
                self.depositMethods = true;
            }

        };

        // get default branch office
        self.getDefaulBranchOffice = function () {
            if (!user.branchOffices) {
                self.defaultbranchOffice = {"id": null};
                return;
            }
            try {
                self.defaultbranchOffice = $filter('filter')(user.branchOffices, {default: true})[0];

            } catch (err) {
                self.defaultbranchOffice = {"id": $localStorage.appData.user.branchId}

            }

            try {
                self.defaultWarehouse = $filter('filter')(self.defaultbranchOffice.warehouses, {default: true})[0];

            }
            catch (err) {
                self.defaultWarehouse = {"id": $localStorage.appData.user.warehouseID}

            }
            try {
                self.branchOffices = user.branchOffices;
                $rootScope.defaultbranchOffice = self.defaultbranchOffice.name;

            }
            catch (err) {
                console.log(err)
            }

            try {
                publishKey = self.defaultbranchOffice.metadata.mp.publicKey;
            }
            catch (err) {
                publishKey = $localStorage.appData.user.mpPublicKey;
            }

            getPaymentType(self.defaultbranchOffice);
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
            $localStorage.shipmentTotal = 0;
            $localStorage.subTtotal = 0;
            $localStorage.ship = false;
            delete $localStorage.appData.user.address;
            self.promoTotal = 0;
            self.typeTax = false;
            $localStorage.taxInverse = 0;
            $localStorage.globalDiscount = {amount: 0};
        };

        self.cancelPayment = function () {
            $localStorage.items = [];
            $localStorage.total = 0;
            $state.go('app.dashboard');
        };


        self.getCustomer = function () {
            CustomerSrv.customerByUser({id: self.user.id}).$promise.then(function (data) {
                self.customer = data;
                self.phone = data.phone;
                if (self.customer.state) {
                    StateSrv.getCities({
                        state: self.customer.state,
                        ordering: 'name'
                    }).$promise.then(function (response) {
                        self.cities = response;
                        self.city = $filter('filter')(self.cities, {id: self.customer.city})[0];
                        self.state = $filter('filter')(self.states, {id: self.customer.state})[0];
                        self.busyCity = false;
                    }, function (error) {
                        self.busyCity = false;
                    });
                }

                if (self.shippingOption === '1') {
                    $rootScope.$emit('newTotals', {data: true});
                }
                else {
                    $rootScope.$emit('newTotals', {data: false});

                }
                shippingAddress();
            });

        };

        self.getCustomer();

        var shippingAddress = function () {
            var fieldship = 'id,address,phone,zip,cityName,neighborhood,phone,stateName,metadata';
            if (self.address) {
                AddressSrv.get({fields: fieldship, id: self.address}).$promise.then(function (data) {
                    self.addresship = data;
                    if ('metadata' in self.addresship) {
                        if(self.addresship.metadata !== null){
                            if ('codeFreeShip' in self.addresship.metadata) {
                                if (self.addresship.metadata.codeFreeShip === true) {
                                    $rootScope.$emit('newTotals', {data: true});
                                }
                            }
                        }

                    }
                }, function (error) {
                    NotificationSrv.error("Error");
                });
            }

        };

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
            self.params.paymentType = parseInt(self.orderPaymentType);
            self.params.isPaid = 2;
            self.params.itemCount = self.itemCount;
            self.params.total = $localStorage.total;
            self.params.subTotal = $localStorage.subTtotal;
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
                self.params.isPaid = 0;
            }

            if (self.params.paymentType === 6) {
                self.params.isPaid = 2;
            }

            if (self.params.paymentType === 3) {
                self.params.isPaid = 2;
            }
            self.params.items = self.items;
            self.params.itemCount = self.items.length;
            self.params.promoTotal = (Math.round($localStorage.promoTotal * 100) / 100);
            self.params.shipmentTotal = $localStorage.shipmentTotal;
            self.params.taxTotal = $localStorage.taxTotal;
            if ($localStorage.appData.getShop) {
                self.params.metadata.getShop = $localStorage.appData.getShop
            }
            self.params.metadata.sendInvoice = self.isInvoiced;
            if(self.isInvoiced === '1'){
                self.params.metadata.taxInverse = 1;
            }
            if($localStorage.appData.ref){
                self.params.seller = $localStorage.appData.ref;
            }
        };


        var publishKey = self.defaultbranchOffice.metadata.mp.publicKey;
        var setPublishableKey = function () {
            Mercadopago.setPublishableKey(publishKey);
        };

        var successResponseHandler = function (status, response) {
            if(status === 200 || status === 201){
                var data = response;
                initialOrder();
                self.busyCreditCard = true;
                data.payment_method_id = self.params.paymentMethodId;
                delete self.params.year;
                delete self.params.month;
                delete self.params.cardNumber;
                delete self.params.cvc;
                self.params.store = self.defaultbranchOffice ? self.defaultbranchOffice : $localStorage.appData.user.branchId;
                self.params.customerName = self.params.customer.businessName;
                self.params.customerEmail = self.params.customer.contactPersonEmail;
                self.params.customer = self.params.customer.id;
                data.preOrder = self.params;
                data.payment_method_id = self.params.paymentMethodId;
                OrderSrv.paidMP({dataPayment: data}).$promise.then(function (response) {
                    self.creditCard = false;
                    self.busyCreditCard = false;
                    clearCart();
                    NotificationSrv.confirmSuccess(response.message ? response.message : 'Compra completada correctamente');
                    $state.go('purchase-completed', {orderId: response.id});
                    delete $localStorage.cartId;
                }, function (error) {
                    console.log('successResponseHandler error')
                    NotificationSrv.confirm('Error al procesar su pago, ' + error.data[0]);
                    self.creditCard = false;
                    self.busyCreditCard = false;
                    Mercadopago.clearSession();
                });
            }
            else{
                NotificationSrv.confirm('Por el momento no se puede completar su pago con esta tarjeta, intente m??s tarde o con una nueva, por favor.');
                self.creditCard = false;
                Mercadopago.clearSession();
                $state.reload();
            }
        };

        var errorResponseHandler = function (error) {
            var deferred = $q.defer();
            deferred.promise.then(function (error) {
                NotificationSrv.error(error.message_to_purchaser);
            });
            deferred.resolve(error);
        };

        var setPaymentMethodInfo = function (status, response) {
            self.params.paymentMethodId = response[0].id;
        };

        var getBin = function () {
            Mercadopago.getPaymentMethod({
                bin: self.params.cardNumber
            }, setPaymentMethodInfo);
        };

        self.processPaymentCard = function () {
            self.creditCard = true;
            setPublishableKey();
            getBin();
            Mercadopago.createToken(document.getElementById('pay'), successResponseHandler, errorResponseHandler);
        };

        self.createOrder = function () {
            initialOrder();
            OrderSrv.save(self.params).$promise.then(function (data) {
                clearCart();
                if(data.paymentType === 10){
                    try {
                        $window.location.href = data.metadata.mp.init_point;
                        
                    } catch (error) {
                        console.log(error)
                        
                    }
                    console.log(data);
                    return
                }
                if (data.paymentType === 3) {
                    self.busyPaypal = true;
                    self.paypalBtn = self.busyPaypal ? 'Procesando' : 'Realizar pago';
                    $localStorage.orderPaypal = data.id;
                    $window.location.href = data.metadata.approvalUrl;
                } else {
                    delete $localStorage.cartId;
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

            OrderSrv.paidPaypal({paymentId: paymentId, payerId: PayerID}).$promise.then(function (data) {
                delete $localStorage.cartId;
                $state.go('purchase-completed', {orderId: data.id});
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


        // get all the states
        self.busyState = true;

        StateSrv.query({country: '573fda4d5b0d6863743020d1', ordering: 'name'}).$promise.then(function (data) {
            self.states = data;
            self.busyState = false;
            self.disableCity = false;
        }, function (error) {
            self.busyState = false;
        });

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

        // update customer
        self.updateCustomer = function () {
            var customerInvoice = angular.copy(self.customer);
            self.busy = true;
            CustomerSrv.update({id: self.customer.id}, customerInvoice).$promise.then(function (data) {
                self.customer = data;
                NotificationSrv.success('Informacion actualizada correctamente');
                self.busy = false;
            });
        }

        self.addTax = function () {
            if(self.isInvoiced === "1"){
                $rootScope.$emit('newTotalsTax', {data: true});
            }else {
                $rootScope.$emit('newTotalsTax', {data: false});
            }

        }



        self.createOrderStripe = function () {
            initialOrder();
            OrderSrv.save(self.params).$promise.then(function (data) {
                console.log(data);
                StripeElements.redirectToCheckout({sessionId: data.metadata.stripe.id})
                clearCart();
            }, function (data) {
                ErrorSrv.error(data);
            });
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
            self.title = '??Gracias por escribirnos!';
            self.message = 'Mensaje de gracias';
        }

    }

    function MercadoPagoHandlerCtrl(OrderSrv, $stateParams, NotificationSrv, $state, ErrorSrv, StripeElements){
        var self = this;
        var makePayment = function (collection_id, collection_status, external_reference, preference_id) {
            var params = {
                data: {
                    collection_id: collection_id, 
                    collection_status: collection_status, 
                    external_reference: external_reference, 
                    preference_id: preference_id}
                }
            OrderSrv.paidCHMP(params).$promise.then(function (data) {
                if(data.collection_status === 'approved'){
                    $state.go('purchase-completed', {orderId: data.external_reference});
                }else if( data.collection_status === 'in_process'){
                    $state.go('order-pending', {external_reference: $stateParams.external_reference});
                }
                
            }, function (error) {
                $state.go('order-pending', {external_reference: $stateParams.external_reference});
            });
        };

        if ($state.current.name === 'mp-success') {
            makePayment($stateParams.collection_id, $stateParams.collection_status, $stateParams.external_reference, $stateParams.preference_id);
        }

        if ($state.current.name === 'mp-pending') {
            makePayment($stateParams.collection_id, $stateParams.collection_status, $stateParams.external_reference, $stateParams.preference_id);
            
        }

        if ($state.current.name === 'order-pending') {
            self.statusPending = true;
            self.orderId = $stateParams.external_reference;
        }

        if ($state.current.name === 'mp-cancel') {
            $state.go('payment-cancel', {external_reference: $stateParams.external_reference});

        }
        if($state.current.name === 'payment-cancel'){
            OrderSrv.get({id: $stateParams.external_reference}).$promise.then(function (data) {
                self.purchase = data;
            }, function (e) {
                NotificationSrv.error('No pudimos cargar su detalle de venta, le enviaremos un correo electronico');
            });
        }
        if ($state.current.name === 'stripe-cancel'){
            var session = $stateParams.session;
            //StripeElements.redirectToCheckout({sessionId: session})

        }
        if ($state.current.name === 'stripe-payment'){
            var key = $stateParams.key;
            StripeElements.redirectToCheckout({sessionId: key})
        }

    }


// create the module and assign controllers
    angular.module('shop.controllers', ['shop.services'])
        .controller('ShopCartCtrl', ShopCartCtrl)
        .controller('ShippingAddressCtrl', ShippingAddressCtrl)
        .controller('PaymentCtrl', PaymentCtrl)
        .controller('OrderCtrl', OrderCtrl)
        .controller('PurchaseCompletedCtrl', PurchaseCompletedCtrl)
        .controller('MercadoPagoHandlerCtrl', MercadoPagoHandlerCtrl);

    // inject dependencies to controllers
    ShopCartCtrl.$inject = ['CartsSrv', '$rootScope', '$auth', '$state', '$localStorage', '$filter', 'NotificationSrv', 'ValidCouponSrv', '$window','$stateParams'];
    ShippingAddressCtrl.$inject = ['AddressSrv', 'ShipmentSrv', 'NotificationSrv', 'StateSrv', 'CustomerSrv', '$localStorage', '$rootScope', '$state', '$filter','CartsSrv', '$timeout', '$stateParams'];
    OrderCtrl.$inject = ['OrderSrv', 'AddressSrv', 'NotificationSrv', '$localStorage', '$rootScope', '$state', '$filter'];
    PaymentCtrl.$inject = ['CustomerSrv', 'OrderSrv', 'AddressSrv', 'ErrorSrv', '$rootScope', '$state', '$localStorage', 'NotificationSrv', '$q', '$filter', '$window', '$stateParams', '$element', 'StateSrv', 'StripeElements'];
    PurchaseCompletedCtrl.$inject = ['OrderSrv', '$stateParams', 'NotificationSrv'];
    MercadoPagoHandlerCtrl.$inject = ['OrderSrv', '$stateParams', 'NotificationSrv', '$state', 'ErrorSrv', 'StripeElements'];
})();
