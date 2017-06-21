(function () {
    'use strict';

    function HomeCtrl(EntrySrv, ProductSrv, TaxonomySrv, $rootScope, $filter) {
        var self = this; // save reference of the scope
        self.mainSlider = [];
        $rootScope.pageTitle = 'Moons Aquariums';

        EntrySrv.get({
            taxonomies: 'slider1497888818',
            isActive: 'True',
            pageSize: 5,
            ordering: '-createdAt',
            fields: 'attachments,title,link,slug,excerpt,content'
        }).$promise.then(function (results) {
            self.mainSlider = results.results;
            //get featureImage
            angular.forEach(self.mainSlider, function (obj, ind) {
                obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
            });
        });

        ProductSrv.get({
            taxonomies: 'productos-inicio',
            isActive: 'True',
            pageSize: 6,
            ordering: '-createdAt',
            fields: 'name,description,attachments,slug,code,taxonomy,price,id'
        }).$promise.then(function (results) {
            self.products = results.results;
            //get featureImage
            angular.forEach(self.products, function (obj, ind) {
                obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
            });
        });

        EntrySrv.get({
            taxonomies: 'promocion',
            isActive: 'True',
            pageSize: 20,
            ordering: 'createdAt',
            fields: 'title,content,attachments,slug,excerpt,link'
        }).$promise.then(function (results) {
            self.promoHome = results.results;
            //get featureImage
            angular.forEach(self.promoHome, function (obj, ind) {
                obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
            });
        });

        EntrySrv.get({
            taxonomies: 'ultimas-noticias',
            isActive: 'True',
            pageSize: 4,
            ordering: '-createdAt',
            fields: 'title,content,attachments,slug,excerpt'
        }).$promise.then(function (results) {
            self.newsHome = results.results;
            //get featureImage
            angular.forEach(self.newsHome, function (obj, ind) {
                obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
            });
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
                    $rootScope.pageTitle = self.categoryName + ' - Moons';
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
                    obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
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
                taxonomies: 'blog',
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
                    obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
                });
            });
        };

        self.getMorePosts();
        $rootScope.pageTitle = 'Blog - Moons';
    }

    function PostDetailCtrl(EntrySrv, $stateParams, $rootScope, $filter) {
        var self = this;
        $rootScope.pageTitle = 'Moons';

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
            $rootScope.pageTitle = results.title + ' - Moons';
            self.busy = false;
        });
    }

    function ContactCtrl(MessageSrv, NotificationSrv, $rootScope, $state) {
        var self = this;
        if ($state.current.name == 'home') {
            $rootScope.pageTitle = 'Moons';
        } else if ($state.current.name == 'contact') {
            $rootScope.pageTitle = 'Contacto - Moons';
        }

        self.contactInitialState = function () {
            self.notification = {name: '', email: '', message: '', phone: '', kind: ''};
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

    function GetQuerySearchCtrl($state) {
        var self = this;
        self.globalSearch = function (kind) {
            $state.go('search', {q: self.searchTerm, kind: kind});
        };
    }

    function SearchCtrl(EntrySrv, ProductSrv, $filter, $stateParams) {
        var self = this;

        self.listSearch = [];
        self.page = 0;
        self.next = true;
        self.busy = false;
        self.searchTerm = angular.copy($stateParams.q);
        self.kindTerm = angular.copy($stateParams.kind);

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

            if ($stateParams.q) {
                if (self.kindTerm === 'product') {
                    ProductSrv.get({
                        isActive: 'True',
                        pageSize: 9,
                        fields: 'id,attachments,description,name,price,slug',
                        ordering: '-createdAt',
                        page: self.page,
                        search: self.searchTerm
                    }).$promise.then(function (results) {
                        self.listSearch = self.listSearch.concat(results.results);
                        //get featureImage
                        angular.forEach(self.listSearch, function (obj, ind) {
                            obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
                        });
                        self.busy = false;
                        self.next = results.next;
                    });

                }
                else {
                    EntrySrv.get({
                        kind: 'post',
                        isActive: 'True',
                        fields: 'attachments,title,link,slug,excerpt',
                        pageSize: 10,
                        ordering: '-createdAt',
                        search: self.searchTerm,
                        page: self.page
                    }).$promise.then(function (results) {
                        self.listSearch = self.listSearch.concat(results.results);
                        self.listSearch = $filter('filter')(results.results, {'slug': '!slider'});
                        //get featureImage
                        angular.forEach(self.listSearch, function (obj, ind) {
                            obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
                        });
                        self.busy = false;
                        self.next = results.next;
                    });

                }
            }
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

    function ProductsCtrl(ProductSrv, ProductTaxonomySrv, AttachmentCmsSrv, $filter, $rootScope) {
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
                fields: 'id,attachments,name,slug,createdAt',
                ordering: '-createdAt',
                page: self.page
            }).$promise.then(function (results) {
                self.list = self.list.concat(results.results);
                self.busy = false;
                self.next = results.next;

                getAttachmentByTaxonomy(self.list);
            });
        };

        var getAttachmentByTaxonomy = function (array) {
            angular.forEach(array, function (obj, ind) {
                AttachmentCmsSrv.get({
                    pageSize: 1,
                    page: 1,
                    project: $rootScope.projectId,
                    reference: obj.id,
                    kind: 'featuredImage'
                }).$promise.then(function (results) {
                    obj.featuredImage = $filter('filter')(results.results, {kind: 'featuredImage'})[0];

                }, function (error) {
                    console.log(error)
                })
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

    function ProductDetailCtrl(ProductSrv, $stateParams, $rootScope, $filter) {
        var self = this;
        $rootScope.pageTitle = 'Moons';

        self.busy = true;
        ProductSrv.get({
            slug: $stateParams.slug,
            isActive: 'True',
            fields: 'attachments,id,name,price,slug,description,code,taxonomies'
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
            $rootScope.pageTitle = results.name + ' - Moons';
            self.busy = false;
        });

    }

    function ProductsByCategoryCtrl(ProductSrv, ProductTaxonomySrv, NotificationSrv, $stateParams, $rootScope, $localStorage, $filter) {
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
                    $rootScope.pageTitle = self.categoryName + ' - Moons';
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
                fields: 'id,attachments,description,name,price,slug',
                ordering: '-createdAt',
                page: self.page
            }).$promise.then(function (results) {
                self.list = self.list.concat(results.results);
                self.busy = false;
                self.next = results.next;
                //get featureImage
                angular.forEach(self.list, function (obj, ind) {
                    obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
                });
            });
        };

        self.itemInCart = function (item) {
            var find_item = $filter('filter')(self.items, {id: item.id})[0];
            return !!find_item;
        };

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
            var find_item = $filter('filter')(self.items, {id: item})[0];
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
            var find_item = $filter('filter')(self.items, {id: item.id})[0];
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
                if (item.qty && item.qty > 0) {
                    self.items.push(item);
                    NotificationSrv.success('Producto agregado al carrito', item.name);
                    $localStorage.items = self.items;
                } else {
                    NotificationSrv.error("Ingresa la cantidad, para poder  agregar", item.name)
                }
            }
            getTotal();
        };
        // remove item from cart
        self.removeItem = function (item) {
            var find_item = $filter('filter')(self.items, {id: item.id})[0];
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
    PostCtrl.$inject = ['EntrySrv', '$stateParams', 'TaxonomySrv', '$rootScope', '$filter'];
    BlogCtrl.$inject = ['EntrySrv', '$rootScope', '$filter'];
    PostDetailCtrl.$inject = ['EntrySrv', '$stateParams', '$rootScope', '$filter'];
    ContactCtrl.$inject = ['MessageSrv', 'NotificationSrv', '$rootScope', '$state'];
    GetQuerySearchCtrl.$inject = ['$state'];
    SearchCtrl.$inject = ['EntrySrv', 'ProductSrv', '$filter', '$stateParams'];
    NavBarCtrl.$inject = [];
    ProductsCtrl.$inject = ['ProductSrv', 'ProductTaxonomySrv', 'AttachmentCmsSrv', '$filter', '$rootScope'];
    TabsCtrl.$inject = ['EntrySrv', 'TaxonomySrv'];
    ProductDetailCtrl.$inject = ['ProductSrv', '$stateParams', '$rootScope', '$filter'];
    ProductsByCategoryCtrl.$inject = ['ProductSrv', 'ProductTaxonomySrv', 'NotificationSrv', '$stateParams', '$rootScope', '$localStorage', '$filter'];
    ShoppingCtrl.$inject = ['$rootScope', '$auth', '$state', '$localStorage', '$filter', 'NotificationSrv'];
})();