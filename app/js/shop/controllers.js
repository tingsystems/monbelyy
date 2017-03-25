/**
 * Created by fishergio on 24/03/17.
 */
(function () {
    'use strict';

    function ShopCartCtrl($rootScope, $auth, $state, $localStorage, $filter, NotificationSrv) {
        var self = this;
        self.items = $localStorage.items ? $localStorage.items : [];
        self.total = $localStorage.total;
        $localStorage.items = self.items;
        $localStorage.total = self.total;
        $rootScope.items = $localStorage.items;

        self.setItem = function (item, qty) {
            var find_item = $filter('filter')(self.items, { id: item.id })[0];
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
            var find_item = $filter('filter')(self.items, { id: item.id })[0];
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

        self.processPurchase = function() {
            if(!$auth.isAuthenticated()){
                $state.go('register');
            }else{
                $state.go('payment');

            }
        }

    }

    function PaymentCtrl(CustomerSrv, $rootScope, $auth, $state, $localStorage, $filter, NotificationSrv) {
        var self = this;
        self.items = $localStorage.items ? $localStorage.items : [];
        self.total = $localStorage.total;
        self.formData = {};
        self.user = $localStorage.appData.user;
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
            console.log('Usuario', self.user);
            CustomerSrv.get({user : self.user.id }).$promise.then(function (data) {
                console.log(data);
            }, function (error) {

            })
        };
        self.getCustomer();

        self.processPurchase = function(){
            var purchase = angular.copy(self.formData);
            CustomerSrv.save(purchase).$promise.then(function(data){
                console.log('Cliente creado', data);
            }, function(error){
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
    ShopCartCtrl.$inject = ['$rootScope', '$auth', '$state', '$localStorage', '$filter', 'NotificationSrv'];
    PaymentCtrl.$inject = ['CustomerSrv', '$rootScope', '$auth', '$state', '$localStorage', '$filter', 'NotificationSrv'];

})();