(function () {
    'use strict';

    function HomeCtrl(EntrySrv, ProductSrv, TaxonomySrv, $rootScope, $filter, $localStorage) {
        var self = this; // save reference of the scope
        self.mainSlider = [];
        self.active = 0;
        $rootScope.pageTitle = $rootScope.initConfig.branchOffice;
        var list = $localStorage.priceList ? $localStorage.priceList : '';

        $rootScope.toggleSidebar = function () {
            $rootScope.visible = !$rootScope.visible;
        };

        EntrySrv.get({
            taxonomies: 'slider1541463701',
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

        var paramsProducts = {};
        paramsProducts.taxonomies = 'web1523988132';
        paramsProducts.isActive = 'True';
        paramsProducts.pageSize = 9;
        paramsProducts.ordering = 'createdAt';
        if (list !== '') {
            paramsProducts.fields = 'name,description,attachments,slug,code,taxonomy,price,id,priceList,shipmentPrice,typeTax';
            paramsProducts.priceList = list;
        }
        else {
            paramsProducts.fields = 'name,description,attachments,slug,code,taxonomy,price,id,shipmentPrice,typeTax';
        }


        ProductSrv.get(paramsProducts).$promise.then(function (results) {
            self.products = results.results;
            //get featureImage
            angular.forEach(self.products, function (obj, ind) {
                obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
            });
        });

        EntrySrv.get({
            taxonomies: 'lo-nuevo',
            isActive: 'True',
            pageSize: 6,
            ordering: 'createdAt',
            fields: 'title,content,attachments,slug,excerpt,link'
        }).$promise.then(function (results) {
            self.categoryProd = results.results;
            //get featureImage
            angular.forEach(self.categoryProd, function (obj, ind) {
                obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
            });
        });

        EntrySrv.get({
            taxonomies: 'blog1541459822',
            isActive: 'True',
            pageSize: 1,
            ordering: '-createdAt',
            fields: 'title,content,attachments,slug,excerpt,link'
        }).$promise.then(function (results) {
            self.blogHome = results.results;
            //get featureImage
            angular.forEach(self.blogHome, function (obj, ind) {
                obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
            });
        });

        /*
                EntrySrv.get({
                    taxonomies: 'patrocinadores',
                    isActive: 'True',
                    pageSize: 8,
                    ordering: '-createdAt',
                    fields: 'title,content,attachments,slug,excerpt'
                }).$promise.then(function (results) {
                    self.brands = results.results;
                    //get featureImage
                    angular.forEach(self.brands, function (obj, ind) {
                        obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
                    });
                });
                */
        /* Carousel slider */
        self.carouselInitializerSlider = function () {
            $(".owl-theme-slider").owlCarousel({
                //get items to proportionate num of items
                navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
                navigation: true,
                //pagination: false,
                autoplay: true,
                items: 2,
                loop: true,
                margin: 0,
                center: true,
                responsiveClass: true,
                responsive: {
                    0: {
                        items: 1,
                        nav: true
                    },
                    600: {
                        items: 1,
                        nav: false
                    },
                    1000: {
                        items: 1,
                        nav: true,
                        loop: false
                    }
                }

            });
        }

        /* Carousel brands */
        self.carouselInitializer = function () {
            $(".owl-carousel").owlCarousel({
                //get items to proportionate num of items
                navText: ['<', '>'],
                navigation: true,
                //pagination: false,
                autoplay: true,
                items: 2,
                loop: true,
                margin: 20,
                responsiveClass: true,
                responsive: {
                    0: {
                        items: 1,
                        nav: true
                    },
                    600: {
                        items: 3,
                        nav: false
                    },
                    1000: {
                        items: 4,
                        nav: true,
                        loop: false
                    }
                }
            });
        }


        /*
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
        });*/

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
                    $rootScope.pageTitle = self.categoryName + ' - ' + $rootScope.initConfig.branchOffice;
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
                taxonomies: 'blog1541459822',
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
        $rootScope.pageTitle = 'Blog' + ' - ' + $rootScope.initConfig.branchOffice;
    }

    function PostDetailCtrl(EntrySrv, $stateParams, $rootScope, $filter) {
        var self = this;
        $rootScope.pageTitle = $rootScope.initConfig.branchOffice;

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
            $rootScope.pageTitle = results.title + ' - ' + $rootScope.initConfig.branchOffice;
            self.busy = false;
        });
    }

    function ContactCtrl(NotificationTakiSrv, NotificationSrv, $rootScope, $state) {
        var self = this;
        if ($state.current.name === 'home') {
            $rootScope.pageTitle = $rootScope.initConfig.branchOffice;
        } else if ($state.current.name === 'contact') {
            $rootScope.pageTitle = 'Contacto' + ' - ' + $rootScope.initConfig.branchOffice;
        }

        self.contactInitialState = function () {
            self.notification = {name: '', email: '', message: '', phone: '', kind: '', city: ''};
            self.context = {};

        };
        self.contactInitialState();

        self.createNotification = function (kind) {
            self.notification = {
                metadata: {
                    to: [{'fromName': 'Hola', 'email': $rootScope.initConfig.email}],
                    kind: kind,
                    prefix: 'default',
                    fromName: self.notification.name,
                    city: self.notification.city,
                    replyTo: {"email": self.notification.email, "phone": self.notification.phone},
                    siteName: $rootScope.initConfig.siteName,
                    message: self.notification.message
                },
                queue: 'notifications'
            };
            self.busy = true;
            NotificationTakiSrv.save(self.notification).$promise.then(function (data) {
                    self.contactInitialState();
                    $state.go('thanks', {kind: 1});
                    //NotificationSrv.success('Gracias,' + ' en breve nos comunicaremos contigo');
                    // enviar al estado de gracias
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
            self.searchTerm = '';
        };
    }

    function SearchCtrl(EntrySrv, ProductSrv, $filter, $stateParams, $localStorage, $rootScope, NgTableParams, $scope,
                        ngTableEventsChannel, $location, $anchorScroll) {
        var self = this;

        self.listSearch = [];
        self.searchTerm = angular.copy($stateParams.q);
        self.kindTerm = angular.copy($stateParams.kind);
        self.isPost = true;
        self.params = {ordering: 'name'};

        self.getData = function (params) {
            var sorting = '-createdAt';
            // parser for ordering params
            angular.forEach(params.sorting(), function (value, key) {
                sorting = value === 'desc' ? '-' + key : key;
            });
            self.busy = true;

            if ($stateParams.q) {
                if (self.kindTerm === 'product') {
                    self.isPost = false;
                    var list = $localStorage.priceList ? $localStorage.priceList : '';
                    self.params.isActive = 'True';
                    self.params.ordering = '-createdAt';
                    self.params.page = params.page();
                    self.params.pageSize = params.count();
                    self.params.search = self.searchTerm;
                    if (list !== '') {
                        self.params.fields = 'id,attachments,description,name,price,slug,priceList,shipmentPrice,typeTax';
                        self.params.priceList = list;
                    }
                    else {
                        self.params.fields = 'id,attachments,description,name,price,slug,shipmentPrice,typeTax';
                    }

                    return ProductSrv.get(self.params).$promise.then(function (results) {
                        self.listSearch = results.results;
                        console.log(self.listSearch);
                        //get featureImage
                        angular.forEach(self.listSearch, function (obj, ind) {
                            obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
                        });
                        params.total(results.count);
                        self.busy = false;
                        return results.results
                    });

                }
                else {
                    return EntrySrv.get({
                        kind: 'post',
                        isActive: 'True',
                        fields: 'attachments,title,link,slug,excerpt',
                        pageSize: 10,
                        ordering: '-createdAt',
                        search: self.searchTerm,
                        page: self.page
                    }).$promise.then(function (results) {
                        self.listSearch = results.results;
                        self.listSearch = $filter('filter')(results.results, {'slug': '!slider'});
                        //get featureImage
                        angular.forEach(self.listSearch, function (obj, ind) {
                            obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
                        });
                        params.total(results.count);
                        self.busy = false;
                        return results.results;
                    });

                }
            }
        };

        var tableEvents = [];

        function subscribeToTable(tableParams) {
            var logAfterCreatedEvent = logEvent(tableEvents, "afterCreated");
            ngTableEventsChannel.onAfterCreated(logAfterCreatedEvent, $scope, $scope.tableParams);
            var logAfterReloadDataEvent = logEvent(tableEvents, "afterReloadData");
            ngTableEventsChannel.onAfterReloadData(logAfterReloadDataEvent, $scope, $scope.tableParams);
        }

        function logEvent(list, name) {
            var listLocal = list;
            var nameLocal = name;
            return function () {
                console.log(">>>>>>> " + nameLocal);

                $location.hash('top');

                // call $anchorScroll()
                $anchorScroll();

            };
        }

        $scope.$watch("tableParams", subscribeToTable);

        $scope.tableParams = new NgTableParams({
            // default params
            page: 1, // The page number to show
            count: 9 // The number of items to show per page
        }, {
            // default settings
            // page size buttons (right set of buttons in demo)
            counts: [],
            // determines the pager buttons (left set of buttons in demo)
            paginationMaxBlocks: 13,
            paginationMinBlocks: 2,
            getData: self.getData
        });


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

    function ProductDetailCtrl(ProductSrv, $stateParams, $rootScope, $filter, $localStorage) {
        var self = this;
        $rootScope.pageTitle = $rootScope.initConfig.branchOffice;
        var list = $localStorage.priceList ? $localStorage.priceList : '';

        var paramsProducts = {};
        paramsProducts.slug = $stateParams.slug;
        paramsProducts.isActive = 'True';
        if (list !== '') {
            paramsProducts.fields = 'attachments,id,name,price,slug,description,code,taxonomies,priceList,shipmentPrice,typeTax';
            paramsProducts.priceList = list;
        }
        else {
            paramsProducts.fields = 'attachments,id,name,price,slug,description,code,taxonomies,shipmentPrice,typeTax';
        }

        self.busy = true;
        ProductSrv.get(paramsProducts).$promise.then(function (results) {
            self.detail = results;
            self.detail.galleryImages = [];
            // get featureImage
            self.detail.featuredImage = $filter('filter')(self.detail.attachments, {kind: 'featuredImage'})[0];
            // add gallery image and featured image
            self.detail.galleryImages.push(self.detail.featuredImage);
            console.log(self.detail.galleryImages);
            console.log(self.detail.featuredImage);
            //get galeries
            angular.forEach($filter('filter')(self.detail.attachments, {kind: 'gallery_image'}),function (value) {
                self.detail.galleryImages.push(value);
            });

            console.log(self.detail.galleryImages);


            if (!self.detail.featuredImage) {
                self.detail.featuredImage = {};
                self.detail.featuredImage.url = $rootScope.initConfig.img_default;
            }

            $rootScope.post = self.detail;
            $rootScope.pageTitle = results.name + ' - ' + $rootScope.initConfig.branchOffice;
            self.busy = false;
            self.detail.qty = 1;
        });

        /* Carousel slider */
        self.carouselDetailProduct = function () {
            $(".owl-carousel").owlCarousel({
                //get items to proportionate num of items
                navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
                navigation: true,
                //pagination: false,
                autoplay: true,
                items: 2,
                autoplayHoverPause:true,
                autoplayTimeout:1000,
                margin: 0,
                responsiveClass: true,
                responsive: {
                    0: {
                        items: 1,
                        nav: true
                    },
                    600: {
                        items: 1,
                        nav: false
                    },
                    1000: {
                        items: 1,
                        nav: true,
                        loop: false
                    }
                }
            });
        }

    }

    function ProductsByCategoryCtrl(ProductSrv, ProductTaxonomySrv, NotificationSrv, NgTableParams, $stateParams, $rootScope, $localStorage, $filter, $timeout) {
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
        var list = $localStorage.priceList ? $localStorage.priceList : '';
        self.selectFilter = '1';
        self.slugItem = $stateParams.slug;
        self.lines = [];
        self.brands = [];
        self.sizes = [];
        self.categories = [];
        self.ready = false;
        self.taxonomies = [];
        self.taxBrand = [];
        self.taxSize = [];
        self.taxType = [];
        self.taxCat = [];
        self.params = {ordering: 'name'};
        self.changeParams = false;
        self.filterType = $rootScope.filterType ? $rootScope.filterType : 'Tipo';
        self.filterBrand = $rootScope.filterBrand ? $rootScope.filterBrand : 'Marca';
        self.filterSize = $rootScope.filterSize ? $rootScope.filterSize : 'MEDIDA';
        self.filterCategory = $rootScope.filterCategory ? $rootScope.filterCategory : 'Tipo';
        var timeout = $timeout;
        self.filterOrderingOptions = [{'option': 'name', 'name': 'Alfabeticamente de A-Z'},
            {'option': 'price', 'name': 'Precio menor'}, {'option': '-price', 'name': 'Precio mayor'}];

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
                    $rootScope.pageTitle = self.categoryName + ' - ' + $rootScope.initConfig.branchOffice;
                }
                ProductTaxonomySrv.query({
                    parent: results.id,
                    isActive: 'True'
                }).$promise.then(function (data) {
                    self.childrens = data;
                    angular.forEach(self.childrens, function (obj, ind) {
                        self.categories.push(obj);
                    });
                    self.ready = true;
                });
            });
        }
        self.busyBrands = false;
        self.searchBrands = function (open) {
            if (open) {
                var indexTax = self.taxonomies.indexOf(self.taxBrand[0]);
                if (indexTax > -1) {
                    self.taxonomies.splice(indexTax, 1);
                }
            }
            self.brands = [];
            ProductTaxonomySrv.get({
                page: 1,
                pageSize: 30,
                fields: 'id,slug,name',
                search: self.searchTerBrand,
                parent: '4106'
            }).$promise.then(function (data) {
                self.brands = data.results;
                self.busyBrands = false;
            })
        };
        self.clearBrands = function () {
            self.searchTerBrand = '';
            self.busyBrands = true;
        };
        self.timeOutBrand = function () {
            $timeout.cancel(timeout);
            // Get the elements after half second
            timeout = $timeout(function () {
                self.searchBrands(false);
            }, 1000);

        };

        self.busySize = true;
        self.searchSizes = function (open) {
            if (open) {
                var indexSize = self.taxonomies.indexOf(self.taxSize[0]);
                if (indexSize > -1) {
                    self.taxonomies.splice(indexSize, 1);
                }
            }
            self.sizes = [];
            ProductTaxonomySrv.get({
                page: 1,
                pageSize: 10,
                fields: 'id,slug,name',
                search: self.searchTerSize,
                kind: self.filterSize
            }).$promise.then(function (data) {
                self.sizes = data.results;
                self.busySize = false;
            })
        };
        self.clearSizes = function () {
            self.searchTerSize = '';
            self.busySize = true;
        };
        self.timeOutSize = function () {
            $timeout.cancel(timeout);
            // Get the elements after half second
            timeout = $timeout(function () {
                self.searchSizes(false);
            }, 1000);

        };

        self.busyType = true;
        self.searchTypes = function (open) {
            if (open) {
                var indexType = self.taxonomies.indexOf(self.taxType[0]);
                if (indexType > -1) {
                    self.taxonomies.splice(indexType, 1);
                }
            }
            self.types = [];
            ProductTaxonomySrv.get({
                page: 1,
                pageSize: 10,
                fields: 'id,slug,name',
                search: self.searchTerType,
                kind: self.filterType
            }).$promise.then(function (data) {
                self.types = data.results;
                self.busyType = false;
            })
        };
        self.clearTypes = function () {
            self.searchTerType = '';
            self.busyType = true;
        };
        self.timeOutType = function () {
            $timeout.cancel(timeout);
            // Get the elements after half second
            timeout = $timeout(function () {
                self.searchType(false);
            }, 1000);

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
                    self.items.splice([self.items.indexOf(find_item)], 1);
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


        self.getProductsBrand = function () {
            self.changeParams = true;
            var index = null;
            if (self.brandSelected) {
                if (typeof self.brandSelected === 'object') {
                    index = self.taxBrand.indexOf(self.brandSelected.slug);

                    if (index > -1) {
                        self.taxBrand.splice(index, 1);

                    } else {
                        self.taxBrand = [];
                        self.taxBrand.push(self.brandSelected.slug);
                    }

                }
            }

            if (self.taxBrand[0]) {
                var indexTax = self.taxonomies.indexOf(self.brandSelected.slug);
                if (indexTax > -1) {
                    self.taxonomies.splice(indexTax, 1);
                } else {
                    self.taxonomies.push(self.taxBrand[0])
                }
            }

            self.tableParams.reload();
        };

        self.getProductsSize = function () {
            var index = null;
            if (self.sizeSelected) {
                if (typeof self.sizeSelected === 'object') {
                    index = self.taxSize.indexOf(self.sizeSelected.slug);

                    if (index > -1) {
                        self.taxSize.splice(index, 1);

                    } else {
                        self.taxSize = [];
                        self.taxSize.push(self.sizeSelected.slug);
                    }

                }
            }

            if (self.taxSize[0]) {
                var indexSize = self.taxonomies.indexOf(self.sizeSelected.slug);
                if (indexSize > -1) {
                    self.taxonomies.splice(indexSize, 1);

                } else {
                    self.taxonomies.push(self.taxSize[0])
                }
            }

            self.tableParams.reload();

        };

        self.getProductsType = function () {
            var index = null;
            if (self.typeSelected) {
                if (typeof self.typeSelected === 'object') {
                    index = self.taxSize.indexOf(self.typeSelected.slug);

                    if (index > -1) {
                        self.taxType.splice(index, 1);

                    } else {
                        self.taxType = [];
                        self.taxType.push(self.typeSelected.slug);
                    }

                }
            }

            if (self.taxType[0]) {
                var indexType = self.taxonomies.indexOf(self.typeSelected.slug);
                if (indexType > -1) {
                    self.taxonomies.splice(indexType, 1);

                } else {
                    self.taxonomies.push(self.taxType[0])
                }
            }

            self.tableParams.reload();


        };

        self.getProductsCategory = function () {
            self.taxCat.push(self.catSelected.slug);
            if (self.catSelected) {
                if (typeof self.catSelected === 'object') {
                    for (var i = 0; i < self.taxCat.length; i++) {
                        var indexCat = self.taxonomies.indexOf(self.taxCat[i]);
                        if (indexCat > -1) {
                            self.taxonomies.splice(indexCat, 1);
                        } else {
                            self.taxonomies.push(self.taxCat[i]);
                        }
                    }

                }
            }

            self.tableParams.reload();


        };

        self.deleteFilter = function (obj) {
            var idx = self.taxonomies.indexOf(obj.slug);
            if (idx > -1) {
                self.taxonomies.splice(idx, 1);
            }
            self.catSelected = null;
            self.taxCat = [];
            self.tableParams.reload();

        };


        self.getData = function (params) {
            var sorting = '-createdAt';
            // parser for ordering params
            angular.forEach(params.sorting(), function (value, key) {
                sorting = value === 'desc' ? '-' + key : key;
            });
            self.params.page = params.page();
            self.params.pageSize = params.count();
            self.busy = true;
            if (self.taxonomies.length > 0) {
                self.params.taxonomies = $stateParams.slug + ',' + self.taxonomies.join();
            }
            else {
                self.params.taxonomies = $stateParams.slug;
            }
            self.params.isActive = 'True';
            self.params.pageSize = 9;
            if (list !== '') {
                self.params.fields = 'name,description,attachments,slug,code,taxonomy,price,id,shipmentPrice,typeTax,priceList';
                self.params.priceList = list;
            }
            else {
                self.params.fields = 'id,attachments,description,name,price,slug,shipmentPrice,typeTax';
            }
            if (self.optionSelected) {
                self.params.ordering = self.optionSelected.option;
            }
            else {
                self.params.ordering = '-createdAt';
            }
            return ProductSrv.get(self.params).$promise.then(function (data) {
                params.total(data.count);
                self.busy = false;
                angular.forEach(data.results, function (obj, ind) {
                    obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
                });
                return data.results;

            }, function (error) {
                angular.forEach(error, function (value, key) {
                    NotificationSrv.error(value + '' + key);
                    self.busy = false;
                });
            });
        };

        self.tableParams = new NgTableParams({
            // default params
            page: 1, // The page number to show
            count: 10 // The number of items to show per page
        }, {
            // default settings
            // page size buttons (right set of buttons in demo)
            counts: [],
            // determines the pager buttons (left set of buttons in demo)
            paginationMaxBlocks: 13,
            paginationMinBlocks: 2,
            getData: self.getData
        });

        self.deleteFilters = function () {
            self.catSelected = false;
            self.optionSelected = false;
            self.brandSelected = false;
            self.brandSelected = false;
            self.sizeSelected = false;
            self.typeSelected = false;
            self.taxonomies = [];
            self.tableParams.reload();

        }


    }

    function ShoppingCtrl($rootScope, $auth, $state, $localStorage, $filter, NotificationSrv, SweetAlert) {
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
                self.shipmentPrice += parseFloat(value.shipmentPrice);
                // afected discount global in self.total
            });
            $localStorage.total = self.total;
            $localStorage.shipmentTotal = self.shipmentPrice;
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
                    SweetAlert.swal({
                            title: "Producto agregado al carrito",
                            text: item.name,
                            type: "success",
                            showCancelButton: true,
                            cancelButtonText: "Ir al carrito",
                            confirmButtonColor: "#D32F2F",
                            confirmButtonText: "Seguir comprando",
                            closeOnConfirm: true,
                            closeOnCancel: true
                        },
                        function (isConfirm) {
                            if (!isConfirm) {
                                $state.go('shopcart')
                            }
                        });

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
    HomeCtrl.$inject = ['EntrySrv', 'ProductSrv', 'TaxonomySrv', '$rootScope', '$filter', '$localStorage'];
    PostCtrl.$inject = ['EntrySrv', '$stateParams', 'TaxonomySrv', '$rootScope', '$filter'];
    BlogCtrl.$inject = ['EntrySrv', '$rootScope', '$filter'];
    PostDetailCtrl.$inject = ['EntrySrv', '$stateParams', '$rootScope', '$filter'];
    ContactCtrl.$inject = ['NotificationTakiSrv', 'NotificationSrv', '$rootScope', '$state'];
    GetQuerySearchCtrl.$inject = ['$state'];
    SearchCtrl.$inject = ['EntrySrv', 'ProductSrv', '$filter', '$stateParams', '$localStorage', '$rootScope',
        'NgTableParams', '$scope', 'ngTableEventsChannel', '$location', '$anchorScroll'];
    NavBarCtrl.$inject = [];
    ProductsCtrl.$inject = ['ProductSrv', 'ProductTaxonomySrv', 'AttachmentCmsSrv', '$filter', '$rootScope'];
    TabsCtrl.$inject = ['EntrySrv', 'TaxonomySrv'];
    ProductDetailCtrl.$inject = ['ProductSrv', '$stateParams', '$rootScope', '$filter', '$localStorage'];
    ProductsByCategoryCtrl.$inject = ['ProductSrv', 'ProductTaxonomySrv', 'NotificationSrv', 'NgTableParams',
        '$stateParams', '$rootScope', '$localStorage', '$filter', '$timeout'];
    ShoppingCtrl.$inject = ['$rootScope', '$auth', '$state', '$localStorage', '$filter', 'NotificationSrv',
        'SweetAlert'];
})();