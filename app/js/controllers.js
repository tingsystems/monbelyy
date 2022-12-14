(function () {
    'use strict';

    function HomeCtrl(EntrySrv, ProductSrv, TaxonomySrv, $rootScope, $filter, $localStorage, $stateParams) {
        var self = this; // save reference of the scope
        self.mainSlider = [];
        self.active = 0;
        $rootScope.pageTitle = $rootScope.initConfig.branchOffice;
        var list = $localStorage.priceList ? $localStorage.priceList : '';
        if($stateParams.seller){
            $localStorage.refSeller = $stateParams.seller;
        }

        $rootScope.toggleSidebar = function () {
            $rootScope.visible = !$rootScope.visible;
        };

        EntrySrv.get({
            taxonomies: 'slider',
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

        EntrySrv.get({
            taxonomies: 'promociones-home',
            isActive: 'True',
            pageSize: 5,
            ordering: '-createdAt',
            fields: 'attachments,title,link,slug,excerpt,content'
        }).$promise.then(function (results) {
            self.promoHome = results.results;
            //get featureImage
            angular.forEach(self.promoHome, function (obj, ind) {
                obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
            });
        });

        EntrySrv.get({
            taxonomies: 'categorias-de-producto',
            isActive: 'True',
            pageSize: 5,
            ordering: 'createdAt',
            fields: 'attachments,title,link,slug,excerpt,content'
        }).$promise.then(function (results) {
            self.categoryProducts = results.results;
            //get featureImage
            angular.forEach(self.categoryProducts, function (obj, ind) {
                obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
            });
        });


        var paramsProducts = {};
        paramsProducts.isActive = 'True';
        if($rootScope.showWeb){
            paramsProducts.showWeb = 'True';
        }
        paramsProducts.pageSize = 20;
        paramsProducts.kind = 'product';
        paramsProducts.ordering = '-sales';
        if (list !== '') {
            paramsProducts.fields = 'name,description,attachments,slug,code,taxonomy,price,id,priceList,shipmentPrice,typeTax,kind,metadata,offerPrice,expiredOffer,showWeb,sales';
            if($rootScope.multiplePrices){
                paramsProducts.priceList = '';

            } else {
                paramsProducts.priceList = list;

            }

        }
        else {
            paramsProducts.fields = 'name,description,attachments,slug,code,taxonomy,price,id,shipmentPrice,typeTax,kind,metadata,offerPrice,expiredOffer,showWeb,sales';
        }
        paramsProducts.kind = $rootScope.itemsKind;
        ProductSrv.get(paramsProducts).$promise.then(function (results) {
            self.products = results.results;
            //get featureImage
            angular.forEach(self.products, function (obj, ind) {
                if($rootScope.priceList){
                    if('priceList' in obj){
                        obj.price = obj.priceList;
                    }
                }
                obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
                obj.colors = $filter('filter')(obj.taxonomies, {kind: 'color'});
                obj.offerPrice = parseFloat(obj.offerPrice);
                obj.shipmentPrice = parseFloat(obj.shipmentPrice);
                
            });
        });

        EntrySrv.get({
            taxonomies: 'informacion-de-compra',
            isActive: 'True',
            pageSize: 6,
            ordering: 'createdAt',
            fields: 'title,content,attachments,slug,excerpt,link'
        }).$promise.then(function (results) {
            self.infoShipping = results.results;
            //get featureImage
            angular.forEach(self.infoShipping, function (obj, ind) {
                obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
            });
        });

        EntrySrv.get({
            taxonomies: 'blog',
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

        /* Carousel slider */

        self.owlOptionsSlider = {
            items:1,
            loop:true,
            margin:10,
            autoplay:true,
            autoplayTimeout:5000,
            autoplayHoverPause:true,
            animateOut: 'slideOutDown',
            animateIn: 'flipInX'

        };

        self.owlOptionsProducts = {
            items:4,
            loop:true,
            margin:0,
            autoplay:true,
            autoplayTimeout:5000,
            autoplayHoverPause:true

        }

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
                pageSize: $rootScope.itemsByPage,
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
                pageSize: $rootScope.itemsByPage,
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

    function PostDetailCtrl(EntrySrv, $stateParams, $rootScope, $filter, MetaTagsService) {
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
            $rootScope.post.title = self.detail.name;
            $rootScope.post.urlImages.original = self.detail.featuredImage.url;
            $rootScope.pageTitle = results.title + ' - ' + $rootScope.initConfig.branchOffice;
            self.busy = false;
            MetaTagsService.setTags({
                'title': results.title,
                // OpenGraph
                'og:title': results.title + ' - ' + $rootScope.initConfig.branchOffice,
                'og:url': 'https://www.monbelyy.mx' + $rootScope.$state.href($rootScope.$state.current.name),
                'og:image': self.detail.featuredImage.url,
            })
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
                    NotificationSrv.error('Hubo ' + ' un error al procesar el formulario, intenta m??s tarde por favor');
                    self.busy = false;
                });
        };
    }

    function GetQuerySearchCtrl($state) {
        var self = this;
        self.globalSearch = function (kind) {
            $state.go('search', {q: self.searchTerm, kind: kind, page:1, pageSize: 12});
            self.searchTerm = '';
        };
    }

    function SearchCtrl(EntrySrv, ProductSrv, $filter, $stateParams, $localStorage, $rootScope, NgTableParams, $scope,
                        ngTableEventsChannel, $location, $anchorScroll, PagerService, $state, MetaTagsService) {
        var self = this;

        self.listSearch = [];
        self.searchTerm = angular.copy($stateParams.q);
        self.kindTerm = angular.copy($stateParams.kind);
        self.isPost = true;
        self.params = {ordering: 'name'};
        MetaTagsService.setTags({
            'title': 'Resultados de la b??squeda ' + self.searchTerm ,
            // OpenGraph
            'og:title': 'Resultados de la b??squeda ' + self.searchTerm,
        })

        // init for pagination and ordering
        self.totalResults = 0;
        self.next = null;
        self.previous = null;
        self.numberPages = 1;
        self.pageSizes = [
            { 'id': '0', 'name': '12', 'size': 12 },
            { 'id': '1', 'name': '24', 'size': 24 },
            { 'id': '1', 'name': '36', 'size': 36 },
            { 'id': '2', 'name': '64', 'size': 64 },
            { 'id': '3', 'name': '128', 'size': 128 }
        ];
        self.filterOrderingOptions = [{'property': 'name', 'name': 'Alfabeticamente de A-Z'},{'property': '-name', 'name': 'Alfabeticamente de Z-A'},
        {'property': 'price', 'name': 'Precio menor'}, {'property': '-price', 'name': 'Precio mayor'}, {'property': '-createdAt', 'name': 'Recientes'}, {'property': 'createdAt', 'name': 'Antiguos'}];
        self.sorterOptionSelect = self.filterOrderingOptions[0];
        self.page = $stateParams.page ? parseInt($stateParams.page) : 1;
        self.pageSize = $stateParams.pageSize ? parseInt($stateParams.pageSize) : 12;
        angular.forEach(self.pageSizes, function (obj) {
            if (obj.size === self.pageSize) {
                self.pageSizesSelect = obj;
            }
        });
        self.ordering = $stateParams.ordering ? $stateParams.ordering: self.sorterOptionSelect.property;
        angular.forEach(self.filterOrderingOptions, function (obj) {
            if (obj.property === self.ordering) {
                self.optionSelected = obj;
            }
        });
        self.pager = {};
        self.setPage = setPage;

        self.getData = function () {
            self.params.page = self.page;
            self.params.pageSize = $stateParams.pageSize ? $stateParams.pageSize : self.pageSize;
            self.params.ordering = '-createdAt';
            self.busy = true;
            if ($stateParams.q) {
                if (self.kindTerm === 'product') {
                    self.isPost = false;
                    var list = $localStorage.priceList ? $localStorage.priceList : '';
                    self.params.isActive = 'True';
                    if($rootScope.showWeb){
                        self.params.showWeb = 'True';
                    }
                    self.params.search = self.searchTerm;
                    if (list !== '') {
                        self.params.fields = 'id,attachments,description,name,price,slug,priceList,shipmentPrice,typeTax,kind,metadata,code,offerPrice,expiredOffer,sales';
                        self.params.priceList = list;
                    }
                    else {
                        self.params.fields = 'id,attachments,description,name,price,slug,shipmentPrice,typeTax,kind,metadata,code,offerPrice,expiredOffer,sales';
                    }
                    self.params.kind = $rootScope.itemsKind;
                    ProductSrv.get(self.params).$promise.then(function (results) {
                        self.totalResults = results.count;
                        self.next = results.next;
                        self.previous = results.previous;
                        //get featureImage
                        angular.forEach(results.results, function (obj, ind) {
                            if($rootScope.priceList){
                                if('priceList' in obj){
                                    obj.price = obj.priceList;
                                }
                            }
                            obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
                            obj.colors = $filter('filter')(obj.taxonomies, {kind: 'color'});
                            obj.offerPrice = parseFloat(obj.offerPrice);
                            obj.shipmentPrice = parseFloat(obj.shipmentPrice);
                            
                        });
                        self.busy = false;
                        self.listSearch = results.results;
                        self.setPage(self.page);
                    });

                }
                else {
                    EntrySrv.get({
                        kind: 'post',
                        isActive: 'True',
                        fields: 'attachments,title,link,slug,excerpt',
                        pageSize: self.params.pageSize,
                        ordering: '-createdAt',
                        search: self.searchTerm,
                        page: self.params.page
                    }).$promise.then(function (results) {
                        self.totalResults = results.count;
                        self.next = results.next;
                        self.previous = results.previous;

                        self.listSearch = $filter('filter')(results.results, {'slug': '!slider'});
                        //get featureImage
                        angular.forEach(self.listSearch, function (obj, ind) {
                            obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
                        });
                        self.busy = false;
                        self.listSearch = results.results;
                        self.setPage(self.page);
                    });

                }
            }
        };

        self.getData();

        function setPage(page) {
            if (page < 1 || page > self.pager.totalPages) {
                return;
            }
            // get pager object from service
            self.pager = PagerService.GetPager(self.totalResults, page, self.pageSize);
            // get current page of items
            $state.go('.', {q:self.searchTerm, kind: self.kindTerm , page: parseInt(page), pageSize: self.pageSize, ordering: self.optionSelected.property});
        }
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

    function ProductDetailCtrl(ProductSrv, $stateParams, $rootScope, $filter, $localStorage, $timeout, NotificationSrv, $state, MetaTagsService) {
        var self = this;
        $rootScope.pageTitle = $rootScope.initConfig.branchOffice;
        var list = $localStorage.priceList ? $localStorage.priceList : '';
        self.optionSelected = {};

        //CAROUSEL TE PUEDE INTERESAR
        self.owlOptionsProducts = {
            items:4,
            loop:false,
            margin:15,
            autoplay:false,
            autoplayTimeout:5000,
            autoplayHoverPause:true,
            responsive:{
                0:{
                    items:2,
                    nav:true
                },
                600:{
                    items:3,
                    nav:false
                },
                1000:{
                    items:4,
                    nav:true,
                    loop:false
                }
            }

        }

        function removeTags(str) {
            if ((str===null) || (str===''))
            return false;
            else
            str = str.toString();
            return str.replace( /(<([^>]+)>)/ig, '');
        }

        var getAvailability = function(item) {
            // must return in_stock or out_of_stock
            // si es grupo validad que este activo en web
            // si es producto validar con el inventory
            var status_stock = "out_of_stock"
            if(item.kind === 'product'){
                if(item.inventory > 0){
                    status_stock = "in_stock";
                }
            }else if (item.kind === 'group'){
                if(item.showWeb){
                    status_stock = "in_stock";
                }
            }
            return status_stock;
        }

        var getRelated = function(taxonomies){
        //TE PUEDE INTERESAR
        var taxonomiesLocal = [];
        var exclude = ['', 'botas-calzalia']
        angular.forEach(taxonomies, function(tax){
            if(tax.slug !== 'otono-invierno-2020'){
                taxonomiesLocal.push(tax.slug) 
            }

        })
        var paramsProductsCat = {};
        paramsProductsCat.isActive = 'True';
        if($rootScope.showWeb){
            paramsProductsCat.showWeb = 'True';
        }
        paramsProductsCat.pageSize = 5
        paramsProductsCat.ordering = 'ordering';
        if (list !== '') {
            paramsProductsCat.fields = 'name,description,attachments,slug,code,taxonomy,price,id,priceList,shipmentPrice,typeTax,kind,metadata,offerPrice,expiredOffer,showWeb,sales';
            if($rootScope.multiplePrices){
                paramsProductsCat.priceList = '';

            } else {
                paramsProductsCat.priceList = list;
            }
        }
        else {
            paramsProductsCat.fields = 'name,description,attachments,slug,code,taxonomy,price,id,shipmentPrice,typeTax,kind,metadata,offerPrice,expiredOffer,showWeb,sales';
        }
        paramsProductsCat.kind = 'group';
        paramsProductsCat.related = taxonomiesLocal.join();
        ProductSrv.get(paramsProductsCat).$promise.then(function (results) {
            self.product = results.results;
            //get featureImage
            angular.forEach(self.product, function (obj, ind) {
                if($rootScope.priceList){
                    if('priceList' in obj){
                        obj.price = obj.priceList;
                    }
                }
                obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
                obj.offerPrice = parseFloat(obj.offerPrice);
                obj.shipmentPrice = parseFloat(obj.shipmentPrice);
                obj.colors = $filter('filter')(obj.taxonomies, {kind: 'color'});
            });
        });
            
        }

        var paramsProducts = {};
        paramsProducts.slug = $stateParams.slug;
        paramsProducts.isActive = 'True';
        if (list !== '') {
            paramsProducts.fields = 'attachments,id,name,price,slug,description,code,taxonomies,priceList,shipmentPrice,typeTax,kind,metadata,offerPrice,expiredOffer,sales';
            if($rootScope.multiplePrices){
                paramsProducts.priceList = '';

            }else {
                paramsProducts.priceList = list;
            }
        }
        else {
            paramsProducts.fields = 'attachments,id,name,price,slug,description,code,taxonomies,shipmentPrice,typeTax,kind,metadata,offerPrice,expiredOffer,sales';
        }

        self.busy = true;
        ProductSrv.get(paramsProducts).$promise.then(function (results) {
            self.group = angular.copy(results);
            self.parent = results.id;
            self.detail = results;
            self.detail.galleryImages = [];
            self.detail.optionsZoom = {
                zoomEnable          : $rootScope.showResponsive ? false : true,
                defaultIndex        : 0, // Order of the default selected Image
                images              : [],
                style               : 'box', // inner or box
                boxPos              : 'right-top', // e.g., right-top, right-middle, right-bottom, top-center, top-left, top-right ...
                boxW                : 350, // Box width
                boxH                : 350, // Box height
                method              : 'lens', // fallow 'lens' or 'pointer'
                cursor              : 'crosshair', // 'none', 'default', 'crosshair', 'pointer', 'move'
                lens                : true, // Lens toggle
                zoomLevel           : 3, // 0: not scales, uses the original large image size, use 1 and above to adjust.
                immersiveMode       : '', // false or 0 for disable, always, max width(px) for trigger
                immersiveModeOptions: {}, // can extend immersed mode options
                immersiveModeMessage: '', // Immersive mode message
                prevThumbButton     : '&#9665;', // Prev thumb button (html)
                nextThumbButton     : '&#9655;', // Next thumb button (html)
                thumbsPos           : 'bottom', // Thumbs position: 'top', 'bottom'
                thumbCol            : 3, // 769Thumb column count
                thumbColPadding     : 4 // Padding between thumbs
            };
            // get featureImage
            self.detail.featuredImage = $filter('filter')(self.detail.attachments, {kind: 'featuredImage'})[0];
            if (!self.detail.featuredImage) {
                self.detail.featuredImage = {};
                self.detail.featuredImage.url = $rootScope.initConfig.img_default;
            }
            // add gallery image and featured image
            self.detail.optionsZoom.images.push({"thumb":self.detail.featuredImage.url, "medium": self.detail.featuredImage.url, "large": self.detail.featuredImage.url});
            //get galeries
            angular.forEach($filter('filter')(self.detail.attachments, {kind: 'gallery_image'}), function (value) {
                self.detail.optionsZoom.images.push({"thumb":value.url, "medium": value.url, "large": value.url})
            });
            self.detail.colors = $filter('filter')(self.detail.taxonomies, {kind: 'color'});
            self.detail.sizes = $filter('filter')(self.detail.taxonomies, {kind: 'size'});
            self.categories = $filter('filter')(self.detail.taxonomies, {kind: 'category'});
            if(self.detail.kind === 'group' && self.detail.colors.length === 1){
                var levelColor = $filter('filter')(self.detail.metadata.groups, {kind: 'color'})[0];
                try {
                    self.optionSelected[levelColor.level] = self.detail.colors[0];
                    
                } catch (error) {
                    self.optionSelected = {};
                }
            }

            self.detail.offerPrice = parseFloat(self.detail.offerPrice);
            self.detail.shipmentPrice = parseFloat(self.detail.shipmentPrice);
            
            if($rootScope.priceList){
                if('priceList' in self.detail) {
                    self.detail.price = self.detail.priceList;
                }

            }
            $rootScope.post = self.detail;
            $rootScope.post.title = self.detail.name;
            $rootScope.post.urlImages = {};
            $rootScope.post.urlImages.original = self.detail.featuredImage.url;
            $rootScope.post.price = self.detail.price;
            $rootScope.post.id = self.detail.id;
            $rootScope.post.description = self.detail.description;
            $rootScope.pageTitle = results.name + ' - ' + $rootScope.initConfig.branchOffice;
            self.busy = false;
            self.detail.qty = 1;
            getRelated(self.categories);
            MetaTagsService.setTags({
                'title': self.group.name,
                // OpenGraph
                'og:type': 'product',
                'og:title': self.group.name,
                'og:description': removeTags(self.detail.description),
                'og:image': self.detail.featuredImage.url,
                'og:url': 'https://www.monbelyy.mx' + $rootScope.$state.href($rootScope.$state.current.name),
                'product:brand':'Monbelyy',
                'product:condition':'new',
                'product:price:amount': self.detail.price,
                'product:price:currency': 'MXN',
                'product:availability': getAvailability(self.detail),
            })
        });

        self.getProductFromGroup = function () {
            self.itemFromGroup = {};
            // self.detail = {};
            var taxonomies = [];
            self.detail.galleryImages = [];
            angular.forEach(self.optionSelected, function (obj) {
                taxonomies.push(obj.slug)
            });
            var taxonomiesJoin = taxonomies.join();
            var paramsItemGroup = {
                parent: self.parent,
                taxonomies: taxonomiesJoin,
                fields: paramsProducts.fields,
                priceList: paramsProducts.priceListlist,
                isActive : 'True'
            };
            ProductSrv.group(paramsItemGroup).$promise.then(function (results) {
                if(results.length){
                    self.itemFromGroup = results[0];
                    self.detail.stock = self.itemFromGroup.stock;
                    self.detail.price = self.itemFromGroup.price;
                    self.detail.id = self.itemFromGroup.id;
                    self.detail.name = self.itemFromGroup.name;
                    self.detail.shipmentPrice = self.itemFromGroup.shipmentPrice;
                    self.detail.typeTax = self.itemFromGroup.typeTax;
                    self.detail.code = self.itemFromGroup.code;
                    self.detail.kind = self.itemFromGroup.kind;
                    self.detail.inventory = self.itemFromGroup.inventory;
                    self.detail.description = self.itemFromGroup.description;
                    self.detail.colors = $filter('filter')(self.itemFromGroup.taxonomies, {kind: 'color'});
                    self.detail.offerPrice = parseFloat(self.itemFromGroup.offerPrice);
                    self.detail.shipmentPrice = parseFloat(self.detail.shipmentPrice);                    
                    self.detail.optionsZoom = {
                        zoomEnable          : $rootScope.showResponsive ? false : true,
                        defaultIndex        : 0, // Order of the default selected Image
                        images              : [],
                        style               : 'box', // inner or box
                        boxPos              : 'right-top', // e.g., right-top, right-middle, right-bottom, top-center, top-left, top-right ...
                        boxW                : 300, // Box width
                        boxH                : 300, // Box height
                        method              : 'lens', // fallow 'lens' or 'pointer'
                        cursor              : 'crosshair', // 'none', 'default', 'crosshair', 'pointer', 'move'
                        lens                : true, // Lens toggle
                        zoomLevel           : 3, // 0: not scales, uses the original large image size, use 1 and above to adjust.
                        immersiveMode       : false, // false or 0 for disable, always, max width(px) for trigger
                        immersiveModeOptions: {}, // can extend immersed mode options
                        immersiveModeMessage: '', // Immersive mode message
                        prevThumbButton     : '&#9665;', // Prev thumb button (html)
                        nextThumbButton     : '&#9655;', // Next thumb button (html)
                        thumbsPos           : 'bottom', // Thumbs position: 'top', 'bottom'
                        thumbCol            : 3, // Thumb column count
                        thumbColPadding     : 4 // Padding between thumbs
                    };
                    if($rootScope.priceList) {
                        if('priceList' in self.itemFromGroup){
                            self.detail.price = self.itemFromGroup.priceList;
                        }
                    }
                    self.detail.featuredImage = $filter('filter')(self.itemFromGroup.attachments, {kind: 'featuredImage'})[0];    
                    if (!self.detail.featuredImage) {
                        self.detail.featuredImage = {};
                        self.detail.featuredImage.url = $rootScope.initConfig.img_default;
                    }
                    // add gallery image and featured image
                    self.detail.optionsZoom.images.push({"thumb":self.detail.featuredImage.url, "medium": self.detail.featuredImage.url, "large": self.detail.featuredImage.url});
                    //get galeries
                    angular.forEach($filter('filter')(self.detail.attachments, {kind: 'gallery_image'}), function (value) {
                        self.detail.optionsZoom.images.push({"thumb":value.url, "medium": value.url, "large": value.url})
                    });
                    self.detail.colors = $filter('filter')(self.detail.taxonomies, {kind: 'color'});
                    self.detail.offerPrice = parseFloat(self.detail.offerPrice);
                    self.detail.shipmentPrice = parseFloat(self.detail.shipmentPrice);
                    
                    $rootScope.post = self.detail;
                    $rootScope.post.title = self.detail.name;
                    $rootScope.post.urlImages = {};
                    $rootScope.post.urlImages.original = self.detail.featuredImage.url;
                    $rootScope.post.price = self.detail.price;
                    $rootScope.post.id = self.detail.id;
                    $rootScope.post.description = self.detail.description;
                    $rootScope.pageTitle = self.detail.name + ' - ' + $rootScope.initConfig.branchOffice;
                    self.busy = false;
                    self.detail.qty = 1;

                } else {
                    NotificationSrv.error("Lo sentimos, no hay ningun producto con los criterios que estas buscando")
                    $state.reload();
                }
            });
        };

    }

    function ProductsByCategoryCtrl(ProductSrv, ProductTaxonomySrv, NotificationSrv, NgTableParams, $stateParams,
                                    $rootScope, $localStorage, $filter, $timeout, $location, $anchorScroll, $scope,
                                    ngTableEventsChannel, $state, PagerService, MetaTagsService) {
        var self = this;

        self.list = [];
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
        // init for pagination and ordering
        self.totalResults = 0;
        self.next = null;
        self.previous = null;
        self.numberPages = 1;
        self.pageSizes = [
            { 'id': '0', 'name': '12', 'size': 12 },
            { 'id': '1', 'name': '24', 'size': 24 },
            { 'id': '1', 'name': '36', 'size': 36 },
            { 'id': '2', 'name': '64', 'size': 64 },
            { 'id': '3', 'name': '128', 'size': 128 }
        ];
        self.filterOrderingOptions = [
            {'property': 'ordering', 'name': 'Por pagina del cat??logo'},
            {'property': '-sales', 'name': 'M??s vendidos'},
            {'property': 'name', 'name': 'Alfabeticamente de A-Z'},
            {'property': '-name', 'name': 'Alfabeticamente de Z-A'},
            {'property': 'price', 'name': 'Precio menor'}, 
            {'property': '-price', 'name': 'Precio mayor'}
            ,
        ];
        self.sorterOptionSelect = self.filterOrderingOptions[0];
        self.page = $stateParams.page ? parseInt($stateParams.page) : 1;
        self.pageSize = $stateParams.pageSize ? parseInt($stateParams.pageSize) : 12;
        angular.forEach(self.pageSizes, function (obj) {
            if (obj.size === self.pageSize) {
                self.pageSizesSelect = obj;
            }
        });
        self.ordering = $stateParams.ordering ? $stateParams.ordering: self.sorterOptionSelect.property;
        angular.forEach(self.filterOrderingOptions, function (obj) {
            if (obj.property === self.ordering) {
                self.optionSelected = obj;
            }
        });
        self.pager = {};
        self.setPage = setPage;
        // get post by category
        if($stateParams.slug && $stateParams.cat){
            ProductTaxonomySrv.get({
                slug: $stateParams.slug,
                isActive: 'True'
            }).$promise.then(function (results) {
                if (results) {
                    self.categoryName = results.name;
                    self.categoryId = results.id;
                    self.category = results;
                    self.taxonomies.push($stateParams.cat);
                    ProductTaxonomySrv.get({slug: $stateParams.cat}).$promise.then(function (data) {
                        self.catSelected = data;
                        self.titleCategories = self.categoryName + ' ' + data.name
                        MetaTagsService.setTags({
                            'title': self.titleCategories,
                            // OpenGraph
                            'og:title': self.titleCategories + ' - ' + 'Monbelyy',
                            'og:url': 'https://www.monbelyy.mx' + $rootScope.$state.href($rootScope.$state.current.name),
                        })
                    })
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


        } else if ($stateParams.slug) {
            ProductTaxonomySrv.get({
                slug: $stateParams.slug,
                isActive: 'True'
            }).$promise.then(function (results) {
                if (results) {
                    self.categoryName = results.name;
                    self.categoryId = results.id;
                    self.category = results;
                    MetaTagsService.setTags({
                        'title': self.categoryName,
                        // OpenGraph
                        'og:title': self.categoryName + ' - ' + 'Monbelyy',
                        'og:url': 'https://www.monbelyy.mx' + $rootScope.$state.href($rootScope.$state.current.name),
                    })
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
        if($stateParams.brand){
            self.taxonomies.push($stateParams.brand);
            self.brands = [];
            ProductTaxonomySrv.get({slug: $stateParams.brand}).$promise.then(function (data) {
                self.brandSelected = data;
                self.brands[0] = self.brandSelected;
            })
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
                pageSize: 150,
                fields: 'id,slug,name',
                search: self.searchTerBrand,
                kind: self.filterBrand
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
                pageSize: $rootScope.itemsByPage,
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
                pageSize: $rootScope.itemsByPage,
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


        self.getProductsBrand = function (slug) {
            $state.go('.', {ordering: self.optionSelected.property, page: 1, pageSize: self.pageSize, brand : slug });
            
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

            self.getData();

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

            self.getData();


        };

        self.getProductsCategory = function (cat) {
            $state.go('.', {ordering: self.optionSelected.property, page: 1, pageSize: self.pageSize, cat : cat  });

        };

        self.deleteFilter = function () {
            $state.go('.', {page: 1, pageSize: self.pageSize, ordering: self.optionSelected.property, cat : null});
        };


        self.getData = function () {
            self.params.page = self.page;
            self.params.pageSize = $stateParams.pageSize ? $stateParams.pageSize : self.pageSize;
            self.params.ordering = $stateParams.ordering ? $stateParams.ordering: self.sorterOptionSelect.property;
            self.params.search = $stateParams.search ? $stateParams.search : self.globalSearchTerm;
            self.busy = true;
            if (self.taxonomies.length > 0) {
                if($rootScope.taxnomySearch){
                    self.params.taxonomies = $rootScope.taxnomySearch + ',' + $stateParams.slug + ',' + self.taxonomies.join();

                }else {
                    self.params.taxonomies = $stateParams.slug + ',' + self.taxonomies.join();
                }

            }
            else {
                if($rootScope.taxnomySearch){
                    self.params.taxonomies = $rootScope.taxnomySearch + ',' + $stateParams.slug
                }
                else {
                    self.params.taxonomies = $stateParams.slug;
                }

            }
            self.params.isActive = 'True';
            if($rootScope.showWeb){
                self.params.showWeb = 'True';
            }
            if (list !== '') {
                self.params.fields = 'name,description,attachments,slug,code,taxonomy,price,id,shipmentPrice,typeTax,kind,metadata,priceList,taxonomiesInfo,offerPrice,expiredOffer,sales';
                self.params.priceList = list;
            }
            else {
                self.params.fields = 'id,attachments,description,name,price,slug,shipmentPrice,typeTax,code,kind,metadata,taxonomiesInfo,offerPrice,expiredOffer,sales';
            }
            if (self.optionSelected) {
                self.params.ordering = self.optionSelected.property;
            }
            else {
                self.params.ordering = '-createdAt';
            }
            self.params.kind = $rootScope.itemsKind;
            ProductSrv.get(self.params).$promise.then(function (data) {
                self.totalResults = data.count;
                self.next = data.next;
                self.previous = data.previous;
                self.busy = false;
                angular.forEach(data.results, function (obj) {
                    if($rootScope.priceList){
                        if('priceList' in obj){
                            obj.price = obj.priceList;
                        }
                    }
                    obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
                    obj.colors = $filter('filter')(obj.taxonomies, {kind: 'color'});
                    obj.offerPrice = parseFloat(obj.offerPrice);
                    obj.shipmentPrice = parseFloat(obj.shipmentPrice);
                    
                });
                self.items = data.results;
                self.setPage(self.page);
            }, function (error) {
                angular.forEach(error, function (value, key) {
                    NotificationSrv.error(value + '' + key);
                    self.busy = false;
                });
            });
        };

        self.getData();

        // funciones para controlar las acciones de la paginacion y ordenamiento
        self.orderingChange = function () {
            $state.go('.', {ordering: self.optionSelected.property, page: 1, pageSize: self.pageSize });
        };
        self.changePageSize = function () {
            self.pageSize = self.pageSizesSelect.size;
            $state.go('.', {page: 1, pageSize: self.pageSize, ordering: self.optionSelected.property});
        };

        function setPage(page) {
            if (page < 1 || page > self.pager.totalPages) {
                return;
            }
            // get pager object from service
            self.pager = PagerService.GetPager(self.totalResults, page, self.pageSize);
            // get current page of items
            $state.go('.', {page: parseInt(page), pageSize: self.pageSize, ordering: self.optionSelected.property});
        }

        self.deleteFilters = function () {
            self.catSelected = false;
            self.optionSelected = false;
            self.brandSelected = false;
            self.brandSelected = false;
            self.sizeSelected = false;
            self.typeSelected = false;
            self.taxonomies = [];
            $state.go('.', {page: 1, pageSize: self.pageSize, ordering: self.optionSelected.property, cat : null, brand: null});

        }
    }

    function ShoppingCtrl($rootScope, $auth, $state, $localStorage, $filter, NotificationSrv, SweetAlert, ProductSrv, $mdDialog, $scope, CartsSrv, $window) {
        var self = this;
        self.items = $localStorage.items ? $localStorage.items : [];
        self.total = $localStorage.total;
        var list = $localStorage.priceList ? $localStorage.priceList : '';
        var paramsProducts = {};
        paramsProducts.isActive = 'True';
        if (list !== '') {
            paramsProducts.fields = 'attachments,id,name,price,slug,description,code,taxonomies,priceList,shipmentPrice,typeTax,kind,metadata,offerPrice,expiredOffer';
            paramsProducts.priceList = list;
        }
        else {
            paramsProducts.fields = 'attachments,id,name,price,slug,description,code,taxonomies,shipmentPrice,typeTax,kind,metadata,offerPrice,expiredOffer';
        }

        $localStorage.items = self.items;
        $localStorage.total = self.total;
        $rootScope.items = $localStorage.items;

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

        // items in localStorage
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
            $localStorage.cart = {};
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
        var cartCreateOrUpdate = function(){
            if ($auth.isAuthenticated()){
                self.isAuthenticated = true;
                var items = [];
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
                        fromWeb: true
                    }).$promise.then(function (data) {
                        self.cart = data;
                        $localStorage.cart = self.cart;
                        $rootScope.items = 0;
                        $localStorage.cartId = self.cart.id;
                    });
                }
    
            }
        }

        self.setItem = function (item, qty, goShiping) {
            if(!qty){
                return;
            }
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
                if (item.qty && item.qty > 0) {
                    self.items.push(item);
                    $localStorage.items = self.items;
                    cartCreateOrUpdate();

                    if(goShiping){
                        if(self.isAuthenticated){
                            $state.go('shipping-address');
                        }else{
                            $state.go('shipping-address', {intent: 'guest'});
                        }
                    }else{
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
                                if(isConfirm){
                                    $window.history.back();
                                }
                                if(!isConfirm) {
                                    $state.go('shopcart')
                                }
                        });
                    }

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

        self.showPreviewItem = function (ev, item) {
            self.parentId = item.id;
            self.detail = angular.copy(item);
            $mdDialog.show({
                templateUrl: '/templates/partials/product-preview.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                scope: $scope,        // use parent scope in template
                preserveScope: true,  // do not forget this if use parent scope
                controllerAs: 'Shop'
            }).then(function (response) {
                if (response === 'cancel') return;
            }, function (error) {
                console.log(error);
            });
        };

        self.getProductFromGroup = function () {
            var taxonomies = [];
            angular.forEach(self.optionSelected, function (obj) {
                taxonomies.push(obj.slug)
            });
            var taxonomiesJoin = taxonomies.join();
            var paramsItemGroup = {
                parent: self.parentId,
                taxonomies: taxonomiesJoin,
                fields: paramsProducts.fields,
                priceList: list

            };
            ProductSrv.group(paramsItemGroup).$promise.then(function (results) {
                self.itemFromGroup = results[0];
                self.detail.stock = self.itemFromGroup.stock;
                self.detail.price = self.itemFromGroup.price;
                self.detail.id = self.itemFromGroup.id;
                self.detail.name = self.itemFromGroup.name;
                self.detail.shipmentPrice = self.itemFromGroup.shipmentPrice;
                self.detail.typeTax = self.itemFromGroup.typeTax;
                self.detail.code = self.itemFromGroup.code;
                // get featureImage
                self.detail.featuredImage = $filter('filter')(self.itemFromGroup.attachments, {kind: 'featuredImage'})[0];
                //get galeries
                self.detail.galleryImages = $filter('filter')(self.itemFromGroup.attachments, {kind: 'gallery_image'});

                if (!self.detail.featuredImage) {
                    self.detail.featuredImage = {};
                    self.detail.featuredImage.url = $rootScope.initConfig.img_default;
                }

                $rootScope.post = self.itemFromGroup;
                $rootScope.pageTitle = results.name + ' - ' + $rootScope.initConfig.branchOffice;
                self.busy = false;
                self.detail.qty = 1;
            });
        };
    }

    function ServiceCtrl(ProductSrv, NotificationSrv, $stateParams, $rootScope, $localStorage, $filter, $state, PagerService) {
        var self = this;

        var getDetail = function(slug){
            var paramsProducts = {};
            paramsProducts.slug = slug;
            paramsProducts.isActive = 'True';
            if (list !== '') {
                paramsProducts.fields = 'attachments,id,name,price,slug,description,code,taxonomies,priceList,shipmentPrice,typeTax,kind,metadata,offerPrice,expiredOffer';
                if($rootScope.multiplePrices){
                    paramsProducts.priceList = '';
    
                }else {
                    paramsProducts.priceList = list;
                }
            }
            else {
                paramsProducts.fields = 'attachments,id,name,price,slug,description,code,taxonomies,shipmentPrice,typeTax,kind,metadata,offerPrice,expiredOffer';
            }
    
            self.busy = true;
            ProductSrv.get(paramsProducts).$promise.then(function (results) {
                self.parent = results.id;
                self.detail = results;
                self.detail.galleryImages = [];
                self.detail.optionsZoom = {
                    zoomEnable          : $rootScope.showResponsive ? false : true,
                    defaultIndex        : 0, // Order of the default selected Image
                    images              : [],
                    style               : 'box', // inner or box
                    boxPos              : 'right-top', // e.g., right-top, right-middle, right-bottom, top-center, top-left, top-right ...
                    boxW                : 300, // Box width
                    boxH                : 300, // Box height
                    method              : 'lens', // fallow 'lens' or 'pointer'
                    cursor              : 'crosshair', // 'none', 'default', 'crosshair', 'pointer', 'move'
                    lens                : true, // Lens toggle
                    zoomLevel           : 3, // 0: not scales, uses the original large image size, use 1 and above to adjust.
                    immersiveMode       : '769', // false or 0 for disable, always, max width(px) for trigger
                    immersiveModeOptions: {}, // can extend immersed mode options
                    immersiveModeMessage: '', // Immersive mode message
                    prevThumbButton     : '&#9665;', // Prev thumb button (html)
                    nextThumbButton     : '&#9655;', // Next thumb button (html)
                    thumbsPos           : 'bottom', // Thumbs position: 'top', 'bottom'
                    thumbCol            : 3, // Thumb column count
                    thumbColPadding     : 4 // Padding between thumbs
                };
                // get featureImage
                self.detail.featuredImage = $filter('filter')(self.detail.attachments, {kind: 'featuredImage'})[0];
                if (!self.detail.featuredImage) {
                    self.detail.featuredImage = {};
                    self.detail.featuredImage.url = $rootScope.initConfig.img_default;
                }
                // add gallery image and featured image
                self.detail.optionsZoom.images.push({"thumb":self.detail.featuredImage.url, "medium": self.detail.featuredImage.url, "large": self.detail.featuredImage.url});
                //get galeries
                angular.forEach($filter('filter')(self.detail.attachments, {kind: 'gallery_image'}), function (value) {
                    self.detail.optionsZoom.images.push({"thumb":value.url, "medium": value.url, "large": value.url})
                });
                self.detail.colors = $filter('filter')(self.detail.taxonomies, {kind: 'color'});
                self.detail.offerPrice = parseFloat(self.detail.offerPrice);
                
                if($rootScope.priceList){
                    if('priceList' in self.detail){
                        self.detail.price = self.detail.priceList;
                    }
    
                }
                $rootScope.post.title = self.detail.name;
                $rootScope.post.urlImages.original = self.detail.featuredImage.url;
                $rootScope.pageTitle = results.name + ' - ' + $rootScope.initConfig.branchOffice;
                self.busy = false;
            });

        }

        self.list = [];
        self.busy = false;
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
        // init for pagination and ordering
        self.totalResults = 0;
        self.next = null;
        self.previous = null;
        self.numberPages = 1;
        self.pageSizes = [
            { 'id': '0', 'name': '12', 'size': 12 },
            { 'id': '1', 'name': '24', 'size': 24 },
            { 'id': '1', 'name': '36', 'size': 36 },
            { 'id': '2', 'name': '64', 'size': 64 },
            { 'id': '3', 'name': '128', 'size': 128 }
        ];
        self.filterOrderingOptions = [{'property': 'name', 'name': 'Alfabeticamente de A-Z'},{'property': '-name', 'name': 'Alfabeticamente de Z-A'},
            {'property': 'price', 'name': 'Precio menor'}, {'property': '-price', 'name': 'Precio mayor'}];
        self.sorterOptionSelect = self.filterOrderingOptions[0];
        self.page = $stateParams.page ? parseInt($stateParams.page) : 1;
        self.pageSize = $stateParams.pageSize ? parseInt($stateParams.pageSize) : 12;
        angular.forEach(self.pageSizes, function (obj) {
            if (obj.size === self.pageSize) {
                self.pageSizesSelect = obj;
            }
        });
        self.ordering = $stateParams.ordering ? $stateParams.ordering: self.sorterOptionSelect.property;
        angular.forEach(self.filterOrderingOptions, function (obj) {
            if (obj.property === self.ordering) {
                self.optionSelected = obj;
            }
        });
        self.pager = {};
        self.setPage = setPage;
    

        self.getData = function () {
            self.params.page = self.page;
            self.params.pageSize = $stateParams.pageSize ? $stateParams.pageSize : self.pageSize;
            self.params.ordering = $stateParams.ordering ? $stateParams.ordering: self.sorterOptionSelect.property;
            self.params.search = $stateParams.search ? $stateParams.search : self.globalSearchTerm;
            self.busy = true;
            if (self.taxonomies.length > 0) {
                if($rootScope.taxnomySearch){
                    self.params.taxonomies = $rootScope.taxnomySearch + ',' + $stateParams.slug + ',' + self.taxonomies.join();

                }else {
                    self.params.taxonomies = $stateParams.slug + ',' + self.taxonomies.join();
                }

            }
            else {
                if($rootScope.taxnomySearch){
                    self.params.taxonomies = $rootScope.taxnomySearch + ',' + $stateParams.slug
                }
                else {
                    self.params.taxonomies = $stateParams.slug;
                }

            }
            self.params.isActive = 'True';
            if($rootScope.showWeb){
                self.params.showWeb = 'True';
            }
            if (list !== '') {
                self.params.fields = 'name,description,attachments,slug,code,taxonomy,price,id,shipmentPrice,typeTax,kind,metadata,priceList,taxonomiesInfo,offerPrice,expiredOffer';
                self.params.priceList = list;
            }
            else {
                self.params.fields = 'id,attachments,description,name,price,slug,shipmentPrice,typeTax,code,kind,metadata,taxonomiesInfo,offerPrice,expiredOffer';
            }
            if (self.optionSelected) {
                self.params.ordering = self.optionSelected.property;
            }
            else {
                self.params.ordering = '-createdAt';
            }
            self.params.kind = 'service';
            ProductSrv.get(self.params).$promise.then(function (data) {
                self.totalResults = data.count;
                self.next = data.next;
                self.previous = data.previous;
                self.busy = false;
                angular.forEach(data.results, function (obj) {
                    if($rootScope.priceList){
                        if('priceList' in obj){
                            obj.price = obj.priceList;
                        }
                    }
                    obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
                    obj.colors = $filter('filter')(obj.taxonomies, {kind: 'color'});
                    obj.offerPrice = parseFloat(obj.offerPrice);
                    ;
                });
                self.items = data.results;
                self.setPage(self.page);
            }, function (error) {
                angular.forEach(error, function (value, key) {
                    NotificationSrv.error(value + '' + key);
                    self.busy = false;
                });
            });
        };

        if($stateParams.slug){
            getDetail($stateParams.slug)

        }else{
            self.getData();
        }

        // funciones para controlar las acciones de la paginacion y ordenamiento
        self.orderingChange = function () {
            $state.go('.', {ordering: self.optionSelected.property, page: 1, pageSize: self.pageSize });
        };
        self.changePageSize = function () {
            self.pageSize = self.pageSizesSelect.size;
            $state.go('.', {page: 1, pageSize: self.pageSize, ordering: self.optionSelected.property});
        };

        function setPage(page) {
            if (page < 1 || page > self.pager.totalPages) {
                return;
            }
            // get pager object from service
            self.pager = PagerService.GetPager(self.totalResults, page, self.pageSize);
            // get current page of items
            $state.go('.', {page: parseInt(page), pageSize: self.pageSize, ordering: self.optionSelected.property});
        }
    }

    function BestSellerCtrl(ProductSrv, EntrySrv, $rootScope, $filter, $localStorage, $stateParams) {
        var self = this; // save reference of the scope
        self.mainSlider = [];
        self.active = 0;
        $rootScope.pageTitle = $rootScope.initConfig.branchOffice;
        var list = $localStorage.priceList ? $localStorage.priceList : '';
        if($stateParams.seller){
            $localStorage.refSeller = $stateParams.seller;
        }

        $rootScope.toggleSidebar = function () {
            $rootScope.visible = !$rootScope.visible;
        };


        var paramsProducts = {};
        paramsProducts.isActive = 'True';
        if($rootScope.showWeb){
            paramsProducts.showWeb = 'True';
        }
        paramsProducts.pageSize = 20;
        paramsProducts.kind = 'group';
        paramsProducts.taxonomies = 'mujer-tiendas-fisicas-calzalia';
        paramsProducts.ordering = '-sales';
        if (list !== '') {
            paramsProducts.fields = 'name,description,attachments,slug,code,taxonomy,price,id,priceList,shipmentPrice,typeTax,kind,metadata,offerPrice,expiredOffer,showWeb,sales';
            if($rootScope.multiplePrices){
                paramsProducts.priceList = '';

            } else {
                paramsProducts.priceList = list;

            }

        }
        else {
            paramsProducts.fields = 'name,description,attachments,slug,code,taxonomy,price,id,shipmentPrice,typeTax,kind,metadata,offerPrice,expiredOffer,showWeb,sales';
        }
        paramsProducts.kind = $rootScope.itemsKind;
        ProductSrv.get(paramsProducts).$promise.then(function (results) {
            self.products = results.results;
            //get featureImage
            angular.forEach(self.products, function (obj, ind) {
                if($rootScope.priceList){
                    if('priceList' in obj){
                        obj.price = obj.priceList;
                    }
                }
                obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
                obj.colors = $filter('filter')(obj.taxonomies, {kind: 'color'});
                obj.offerPrice = parseFloat(obj.offerPrice);
                obj.shipmentPrice = parseFloat(obj.shipmentPrice);
                
            });
        });

        var paramsItemProducts = {};
        paramsItemProducts.taxonomies = 'hombre-tiendas-fisicas-calzalia';
        paramsItemProducts.isActive = 'True';
        if($rootScope.showWeb){
            paramsItemProducts.showWeb = 'True';
        }
        paramsItemProducts.pageSize = $rootScope.itemsByPage;
        paramsItemProducts.ordering = '-sales';
        if (list !== '') {
            paramsItemProducts.fields = 'name,description,attachments,slug,code,taxonomy,price,id,priceList,shipmentPrice,typeTax,kind,metadata,offerPrice,expiredOffer,showWeb,sales';
            if($rootScope.multiplePrices){
                paramsItemProducts.priceList = '';

            }else {
                paramsItemProducts.priceList = list;
            }

        }
        else {
            paramsItemProducts.fields = 'name,description,attachments,slug,code,taxonomy,price,id,shipmentPrice,typeTax,kind,metadata,offerPrice,expiredOffer,showWeb,sales';
        }
        paramsItemProducts.kind = $rootScope.itemsKind;
        ProductSrv.get(paramsItemProducts).$promise.then(function (results) {
            self.productsItem = results.results;
            //get featureImage
            angular.forEach(self.productsItem, function (obj, ind) {
                if($rootScope.priceList){
                    if('priceList' in obj){
                        obj.price = obj.priceList;
                    }
                }
                obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
                obj.colors = $filter('filter')(obj.taxonomies, {kind: 'color'});
                obj.offerPrice = parseFloat(obj.offerPrice);
                obj.shipmentPrice = parseFloat(obj.shipmentPrice);
                
            });
        });

        var paramsItemsForChildren = {};
        paramsItemsForChildren.taxonomies = 'home-nino-y-nina';
        paramsItemsForChildren.isActive = 'True';
        if($rootScope.showWeb){
            paramsItemProducts.showWeb = 'True';
        }
        paramsItemsForChildren.pageSize = $rootScope.itemsByPage;
        paramsItemsForChildren.ordering = '-sales';
        if (list !== '') {
            paramsItemsForChildren.fields = 'name,description,attachments,slug,code,taxonomy,price,id,priceList,shipmentPrice,typeTax,kind,metadata,offerPrice,expiredOffer,showWeb,sales';
            if($rootScope.multiplePrices){
                paramsItemsForChildren.priceList = '';

            }else {
                paramsItemsForChildren.priceList = list;
            }

        }
        else {
            paramsItemsForChildren.fields = 'name,description,attachments,slug,code,taxonomy,price,id,shipmentPrice,typeTax,kind,metadata,offerPrice,expiredOffer,showWeb,sales';
        }
        paramsItemsForChildren.kind = $rootScope.itemsKind;
        ProductSrv.get(paramsItemsForChildren).$promise.then(function (results) {
            self.productsChildren = results.results;
            //get featureImage
            angular.forEach(self.productsChildren, function (obj, ind) {
                if($rootScope.priceList){
                    if('priceList' in obj){
                        obj.price = obj.priceList;
                    }
                }
                obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
                obj.colors = $filter('filter')(obj.taxonomies, {kind: 'color'});
                obj.offerPrice = parseFloat(obj.offerPrice);
                obj.shipmentPrice = parseFloat(obj.shipmentPrice);
                
            });
        });

        EntrySrv.get({
            taxonomies: 'informacion-de-compra',
            isActive: 'True',
            pageSize: 6,
            ordering: 'createdAt',
            fields: 'title,content,attachments,slug,excerpt,link'
        }).$promise.then(function (results) {
            self.infoShipping = results.results;
            //get featureImage
            angular.forEach(self.infoShipping, function (obj, ind) {
                obj.featuredImage = $filter('filter')(obj.attachments, {kind: 'featuredImage'})[0];
            });
        });

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
        .controller('ShoppingCtrl', ShoppingCtrl)
        .controller('ServiceCtrl', ServiceCtrl)
        .controller('BestSellerCtrl', BestSellerCtrl);

    // inject dependencies to controllers
    HomeCtrl.$inject = ['EntrySrv', 'ProductSrv', 'TaxonomySrv', '$rootScope', '$filter', '$localStorage', '$stateParams'];
    PostCtrl.$inject = ['EntrySrv', '$stateParams', 'TaxonomySrv', '$rootScope', '$filter'];
    BlogCtrl.$inject = ['EntrySrv', '$rootScope', '$filter'];
    PostDetailCtrl.$inject = ['EntrySrv', '$stateParams', '$rootScope', '$filter','MetaTagsService'];
    ContactCtrl.$inject = ['NotificationTakiSrv', 'NotificationSrv', '$rootScope', '$state'];
    GetQuerySearchCtrl.$inject = ['$state'];
    SearchCtrl.$inject = ['EntrySrv', 'ProductSrv', '$filter', '$stateParams', '$localStorage', '$rootScope',
        'NgTableParams', '$scope', 'ngTableEventsChannel', '$location', '$anchorScroll', 'PagerService', '$state','MetaTagsService'];
    NavBarCtrl.$inject = [];
    ProductsCtrl.$inject = ['ProductSrv', 'ProductTaxonomySrv', 'AttachmentCmsSrv', '$filter', '$rootScope'];
    TabsCtrl.$inject = ['EntrySrv', 'TaxonomySrv'];
    ProductDetailCtrl.$inject = ['ProductSrv', '$stateParams', '$rootScope', '$filter', '$localStorage', '$timeout','NotificationSrv','$state','MetaTagsService'];
    ProductsByCategoryCtrl.$inject = ['ProductSrv', 'ProductTaxonomySrv', 'NotificationSrv', 'NgTableParams',
        '$stateParams', '$rootScope', '$localStorage', '$filter', '$timeout', '$location', '$anchorScroll', '$scope',
        'ngTableEventsChannel', '$state', 'PagerService','MetaTagsService'];
    ShoppingCtrl.$inject = ['$rootScope', '$auth', '$state', '$localStorage', '$filter', 'NotificationSrv',
        'SweetAlert', 'ProductSrv', '$mdDialog', '$scope', 'CartsSrv', '$window'];
    ServiceCtrl.$inject = ['ProductSrv', 'NotificationSrv', '$stateParams', '$rootScope', '$localStorage', '$filter', '$state', 'PagerService'];
    BestSellerCtrl.$inject = ['ProductSrv', 'EntrySrv', '$rootScope', '$filter', '$localStorage', '$stateParams'];
})();