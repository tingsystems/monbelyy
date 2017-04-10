(function () {
    'use strict';

    function HomeCtrl(EntrySrv, ProductSrv, TaxonomySrv, $rootScope, $filter) {
        var self = this; // save reference of the scope
        self.mainSlider = [];
        $rootScope.pageTitle = 'Corriente Alterna';

        EntrySrv.get({
            taxonomies: 'slider1489619194',
            isActive: 'True',
            pageSize: 5,
            ordering: '-createdAt',
            fields: 'attachments,title,link,slug,excerpt,content'
        }).$promise.then(function (results) {
            self.mainSlider = results.results;
            //get featureImage
            angular.forEach(self.mainSlider, function (obj, ind) {
                obj.featuredImage = $filter('filter')(obj.attachments, { kind: 'featuredImage' })[0];
            });
        });

        ProductSrv.get({
            taxonomies: 'lo-mas-buscado1490803659',
            isActive: 'True',
            pageSize: 20,
            ordering: '-createdAt',
            fields: 'name,description,attachments,slug,code,taxonomy,price,id'
        }).$promise.then(function (results) {
            self.products = results.results;
            //get featureImage
            angular.forEach(self.products, function (obj, ind) {
                obj.featuredImage = $filter('filter')(obj.attachments, { kind: 'featuredImage' })[0];
            });
        });

        EntrySrv.get({
            taxonomies: 'servicios1489618796',
            isActive: 'True',
            pageSize: 20,
            ordering: '-createdAt',
            fields: 'title,content,attachments,slug,excerpt'
        }).$promise.then(function (results) {
            self.services = results.results;
        });

    }

    function PostCtrl(EntrySrv, $stateParams, TaxonomySrv, $rootScope, $filter) {
        var self = this;

        self.list = [];
        self.page = 0;
        self.next = true;
        self.busy = false;
        self.isPost = true;

        // get post by category
        if ($stateParams.slug) {
            TaxonomySrv.get({
                slug: $stateParams.slug,
                isActive: 'True',
                pageSize: 1
            }).$promise.then(function (results) {
                if (results.results) {
                    self.categoryName = results.results[0].name;
                    $rootScope.pageTitle = self.categoryName + ' - Corriente Alterna';
                }
            });
        }

        self.getMorePosts = function () {
            if (self.busy || !self.next) return;
            self.page += 1;
            self.busy = true;

            EntrySrv.get({
                taxonomies: $stateParams.slug,
                isActive: 'True',
                pageSize: 9,
                fields: 'attachments,title,slug,excerpt,createdAt',
                ordering: '-createdAt',
                page: self.page
            }).$promise.then(function (results) {
                self.list = self.list.concat(results.results);
                self.busy = false;
                self.next = results.next;
                //get featureImage
                angular.forEach(self.list, function (obj, ind) {
                    obj.featuredImage = $filter('filter')(obj.attachments, { kind: 'featuredImage' })[0];
                });
            });
        };

        self.getMorePosts();

    }

    function BlogCtrl(EntrySrv, $rootScope, $filter) {
        var self = this;

        self.list = [];
        self.page = 0;
        self.next = true;
        self.busy = false;

        self.errorRecovery = function () {
            self.page -= 1;
            self.next = true;
            self.busy = false;
            self.loadPostError = false;
            self.getMorePosts();
        };

        self.getMorePosts = function () {
            if (self.busy || !self.next) return;
            self.page += 1;
            self.busy = true;
            self.loadPosts = self.page % 3 == 0;

            EntrySrv.get({
                kind: 'post',
                taxonomies: 'blog1489621339',
                isActive: 'True',
                fields: 'title,slug,excerpt,attachments,createdAt',
                pageSize: 9,
                ordering: '-createdAt',
                page: self.page
            }).$promise.then(function (results) {
                self.list = self.list.concat(results.results);
                self.busy = false;
                self.next = results.next;
                //get featureImage
                angular.forEach(self.list, function (obj, ind) {
                    obj.featuredImage = $filter('filter')(obj.attachments, { kind: 'featuredImage' })[0];
                });
            });
        };

        self.getMorePosts();
        $rootScope.pageTitle = 'Blog - Corriente Alterna';
    }

    function PostDetailCtrl(EntrySrv, $stateParams, $rootScope) {
        var self = this;
        $rootScope.pageTitle = 'Corriente Alterna';

        self.busy = true;
        EntrySrv.get({
            slug: $stateParams.slug,
            isActive: 'True',
            fields: 'title,slug,content,attachments,categories,tags,galleryImages'
        }).$promise.then(function (results) {
            self.detail = results;
            // get featureImage
            self.detail.featuredImage = $filter('filter')(self.detail.attachments, {kind: 'featuredImage'})[0];
            //get galeries
            self.detail.galleryImages = $filter('filter')(self.detail.attachments, {kind: 'gallery_image'});

            if (!self.detail.featuredImage) {

                self.detail.featuredImage = {};
                self.detail.featuredImage.url = $rootScope.initConfig.img_default;
            }
            $rootScope.post = self.detail;
            $rootScope.pageTitle = results.title + ' - Corriente Alterna';
            self.busy = false;
        });
    }

    function ContactCtrl(MessageSrv, NotificationSrv, $rootScope, $state) {
        var self = this;
        if ($state.current.name == 'home') {
            $rootScope.pageTitle = 'Corriente Alterna';
        } else if ($state.current.name == 'contact') {
            $rootScope.pageTitle = 'Contacto - Corriente Alterna';
        }

        self.contactInitialState = function () {
            self.notification = { name: '', email: '', message: '', phone: '', kind: '' };
            self.context = {};

        };
        self.contactInitialState();

        self.createNotification = function (kind) {
            // ajax request to send the formData
            self.notification.kind = kind;
            self.notification.send_from = $rootScope.initConfig.email;
            self.context.context = angular.copy(self.notification);
            self.busy = true;
            MessageSrv.create(self.context).$promise.then(function (data) {
                self.contactInitialState();
                NotificationSrv.success('Gracias,' + ' en breve nos comunicaremos contigo');
                self.busy = false;
            },
                function (data) {
                    //error
                    NotificationSrv.error('Hubo ' + ' un error al procesar el formulario, intenta más tarde por favor');
                    self.busy = false;
                });
        };
    }

    function GetQuerySearchCtrl($rootScope, $state) {
        var self = this;

        $rootScope.searchTerm = '';

        self.globalSearch = function () {
            $rootScope.searchTerm = angular.copy(self.searchTerm);
            $state.go('search');
            self.searchTerm = '';
        };

    }

    function SearchCtrl(EntrySrv, $rootScope, $scope, $filter) {
        var self = this;

        self.listSearch = [];
        self.page = 0;
        self.next = true;
        self.busy = false;
        self.searchTerm = angular.copy($rootScope.searchTerm);
        $rootScope.searchTerm = '';

        // watch for global search term
        $scope.$watch(function () {
            return $rootScope.searchTerm;
        }, function (value) {
            if (value != '') {
                self.searchTerm = angular.copy($rootScope.searchTerm);
                $rootScope.searchTerm = '';
                EntrySrv.get({
                    kind: 'post',
                    isActive: 'True',
                    fields: 'attachments,title,link,slug,excerpt',
                    pageSize: 10,
                    ordering: '-createdAt',
                    search: self.searchTerm,
                    page: self.page
                }).$promise.then(function (results) {
                    //self.listSearch = $filter('filter')(results.results, {'slug': '!slider'});
                    self.listSearch = results.results;
                });
            }
        });

        self.errorRecovery = function () {
            self.page -= 1;
            self.next = true;
            self.busy = false;
            self.loadPostError = false;
            self.getMorePosts();
        };

        self.getMorePosts = function () {
            if (self.busy || !self.next) return;
            self.page += 1;
            self.busy = true;

            EntrySrv.get({
                kind: 'post',
                isActive: 'True',
                pageSize: 10,
                fields: 'attachments,title,link,slug,excerpt',
                ordering: '-createdAt',
                search: self.searchTerm,
                page: self.page
            }).$promise.then(function (results) {
                //self.responseResults = $filter('filter')(results.results, {'slug': '!slider'});
                self.listSearch = self.listSearch.concat(results.results);
                self.busy = false;
                self.next = results.next;
                self.loadPostError = false;
            }, function (error) {
                self.loadPostError = false;
            });
        };

        self.getMorePosts();


    }

    function NavBarCtrl() {
        var self = this;
        self.isCollapsed = false;
        self.close = function () {
            $('#header-mainMenu').collapse('hide');
        }

    }

    function ProductsCtrl(ProductSrv, ProductTaxonomySrv, EntrySrv, $stateParams, $rootScope) {
        var self = this;
        self.children = [];
        self.list = [];
        self.page = 0;
        self.next = true;
        self.busy = false;

        self.getMorePosts = function () {
            if (self.busy || !self.next) return;
            self.page += 1;
            self.busy = true;
            ProductTaxonomySrv.get({
                isActive: 'True',
                pageSize: 3,
                fields: 'attachments,name,slug,createdAt',
                ordering: '-createdAt',
                page: self.page
            }).$promise.then(function (results) {
                self.list = self.list.concat(results.results);
                self.busy = false;
                self.next = results.next;
            });
        };

        self.getMorePosts();
    }

    function TabsCtrl(EntrySrv, TaxonomySrv) {
        var self = this;
        self.category_1 = 'artesanal';
        self.category_2 = 'dama';
        self.category_3 = 'caballero';
        self.category_4 = 'infantil';
        self.Tab1 = function () {
            self.list1 = [];
            EntrySrv.get({
                taxonomies: self.category_1,
                isActive: 'True',
                pageSize: 9,
                ordering: '-createdAt',
                fields: 'attachments,title,link,slug,categories,excerpt'
            }).$promise.then(function (results) {
                self.list1 = results.results;
            });
        };
        self.Tab2 = function () {
            self.list2 = [];
            EntrySrv.get({
                taxonomies: self.category_2,
                isActive: 'True',
                pageSize: 9,
                ordering: '-createdAt',
                fields: 'attachments,title,link,slug,categories,excerpt'
            }).$promise.then(function (results) {
                self.list2 = results.results;
            });
        };
        self.Tab3 = function () {
            self.list3 = [];
            EntrySrv.get({
                taxonomies: self.category_3,
                isActive: 'True',
                pageSize: 9,
                ordering: '-createdAt',
                fields: 'attachments,title,link,slug,categories,excerpt'
            }).$promise.then(function (results) {
                self.list3 = results.results;
            });
        };
        self.Tab4 = function () {
            self.list4 = [];
            EntrySrv.get({
                taxonomies: self.category_4,
                isActive: 'True',
                pageSize: 9,
                ordering: '-createdAt',
                fields: 'attachments,title,link,slug,categories,excerpt'
            }).$promise.then(function (results) {
                self.list4 = results.results;
            });
        };
    }

    function ProductDetailCtrl(ProductSrv, $stateParams, $rootScope, $filter){
        var self = this;
        $rootScope.pageTitle = 'Corriente Alterna';

        self.busy = true;
        ProductSrv.get({
            slug: $stateParams.slug,
            isActive: 'True',
            fields: 'attachments,id,name,price,slug,description,code,taxonomies'
        }).$promise.then(function (results) {
            self.detail = results;
            // get featureImage
            self.detail.featuredImage = $filter('filter')(self.detail.attachments, { kind: 'featuredImage' })[0];
            //get galeries
            self.detail.galleryImages = $filter('filter')(self.detail.attachments, { kind: 'gallery_image' });

            if (!self.detail.featuredImage) {
                self.detail.featuredImage = {};
                self.detail.featuredImage.url = $rootScope.initConfig.img_default;
            }
            $rootScope.post = self.detail;
            $rootScope.pageTitle = results.title + ' - Corriente Alterna';
            self.busy = false;
        });

    }

    function ProductsByCategoryCtrl(ProductSrv, ProductTaxonomySrv, NotificationSrv, $stateParams, $rootScope, $localStorage, $filter){
        var self = this;

        self.list = [];
        self.page = 0;
        self.next = true;
        self.busy = false;
        self.items = $localStorage.items ? $localStorage.items : [];
        self.total = $localStorage.total;
        $localStorage.items = self.items;
        $localStorage.total = self.total;
        $rootScope.items = $localStorage.items;

        // get post by category
        if ($stateParams.slug) {
            ProductTaxonomySrv.get({
                slug: $stateParams.slug,
                isActive: 'True'
            }).$promise.then(function (results) {
                if (results) {
                    self.categoryName = results.name;
                    self.categoryId = results.id;
                    self.category = results;
                    self.getMorePosts();
                    $rootScope.pageTitle = self.categoryName + ' - Corriente Alterna';
                }
            });
        }

        self.getMorePosts = function () {
            if (self.busy || !self.next || !self.category) return;
            self.page += 1;
            self.busy = true;

            ProductSrv.get({
                taxonomies: self.category.slug,
                isActive: 'True',
                pageSize: 9,
                fields: 'attachments,description,name,price,id,slug',
                ordering: '-createdAt',
                page: self.page
            }).$promise.then(function (results) {
                self.list = self.list.concat(results.results);
                self.busy = false;
                self.next = results.next;
                //get featureImage
                angular.forEach(self.list, function (obj, ind) {
                    obj.featuredImage = $filter('filter')(obj.attachments, { kind: 'featuredImage' })[0];
                });
            });
        };

        self.itemInCart = function (item) {
            var find_item = $filter('filter')(self.items, { id: item.id })[0];
            return !!find_item;
        };

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
            else {
                item.discount = {
                    value: 0,
                    isPercentage: "0",
                    discount: "0"
                };
                self.items.push(item);
                NotificationSrv.success('Producto agregado al carrito', item.name);
                $localStorage.items = self.items;
            }
        };

    }

    function ShoppingCtrl($rootScope, $auth, $state, $localStorage, $filter, NotificationSrv) {
        var self = this;
        self.items = $localStorage.items ? $localStorage.items : [];
        self.total = $localStorage.total;
        $localStorage.items = self.items;
        $localStorage.total = self.total;
        $rootScope.items = $localStorage.items;
        // items in localStorage
        self.clearCart = function () {
            self.items = [];
            self.total = 0;
            $localStorage.items = [];
            $localStorage.total = 0;
        };
        self.itemInCart = function (item) {
            var find_item = $filter('filter')(self.items, { id: item })[0];
            return !!find_item;
        };
        // we calculate the total from items on the cart
        var getTotal = function () {
            self.total = 0;
            self.promoTotal = 0;
            angular.forEach(self.items, function (value, key) {
                // add two new attr in item, import and discount
                // first Time calcule
                value.import = parseFloat(value.price) * value.qty;
                self.total += parseFloat(value.price) * value.qty;
                // afected discount global in self.total
            });
            $localStorage.total = self.total;
        };
        self.setItem = function (item, qty) {
            var find_item = $filter('filter')(self.items, { id: item.id })[0];
            if (find_item) {
                NotificationSrv.error("Este producto ya esta en el carrito.", item.name);
                if (qty < 1) {
                    // Remove item from cart
                    self.items.splice([self.items.indexOf(find_item)], 1)
                } else {
                    if (qty) {
                        self.items[self.items.indexOf(find_item)].qty = qty;
                    }
                }
            } else {
                item.discount = {
                    value: 0,
                    isPercentage: "0",
                    discount: "0"
                };
                if(item.qty && item.qty>0){
                    self.items.push(item);
                    NotificationSrv.success('Producto agregado al carrito', item.name);
                    $localStorage.items = self.items;
                }else{
                    NotificationSrv.error("Ingresa la cantidad, para poder  agregar", item.name)
                }
            }
            getTotal();
        };
        // remove item from cart
        self.removeItem = function (item) {
            var find_item = $filter('filter')(self.items, { id: item.id })[0];
            if (find_item) {
                self.items.splice([self.items.indexOf(find_item)], 1)
            }
            getTotal();
        };
    }


    // create the module and assign controllers
    angular.module('ts.controllers', ['ts.services'])
        .controller('HomeCtrl', HomeCtrl)
        .controller('PostCtrl', PostCtrl)
        .controller('BlogCtrl', BlogCtrl)
        .controller('PostDetailCtrl', PostDetailCtrl)
        .controller('ContactCtrl', ContactCtrl)
        .controller('GetQuerySearchCtrl', GetQuerySearchCtrl)
        .controller('SearchCtrl', SearchCtrl)
        .controller('NavBarCtrl', NavBarCtrl)
        .controller('ProductsCtrl', ProductsCtrl)
        .controller('TabsCtrl', TabsCtrl)
        .controller('ProductDetailCtrl', ProductDetailCtrl)
        .controller('ProductsByCategoryCtrl', ProductsByCategoryCtrl)
        .controller('ShoppingCtrl', ShoppingCtrl);

    // inject dependencies to controllers
    HomeCtrl.$inject = ['EntrySrv', 'ProductSrv', 'TaxonomySrv', '$rootScope', '$filter'];
    PostCtrl.$inject = ['EntrySrv', '$stateParams', 'TaxonomySrv', '$rootScope','$filter'];
    BlogCtrl.$inject = ['EntrySrv', '$rootScope', '$filter'];
    PostDetailCtrl.$inject = ['EntrySrv', '$stateParams', '$rootScope'];
    ContactCtrl.$inject = ['MessageSrv', 'NotificationSrv', '$rootScope', '$state'];
    GetQuerySearchCtrl.$inject = ['$rootScope', '$state', '$filter'];
    SearchCtrl.$inject = ['EntrySrv', '$rootScope', '$scope'];
    NavBarCtrl.$inject = [];
    ProductsCtrl.$inject = ['ProductSrv','ProductTaxonomySrv', 'EntrySrv', '$stateParams', '$rootScope'];
    TabsCtrl.$inject = ['EntrySrv', 'TaxonomySrv'];
    ProductDetailCtrl.$inject = ['ProductSrv', '$stateParams', '$rootScope', '$filter'];
    ProductsByCategoryCtrl.$inject = ['ProductSrv', 'ProductTaxonomySrv', 'NotificationSrv', '$stateParams', '$rootScope', '$localStorage', '$filter'];
    ShoppingCtrl.$inject = ['$rootScope', '$auth', '$state', '$localStorage', '$filter', 'NotificationSrv'];
})();