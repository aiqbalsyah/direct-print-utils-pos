KTUtil.onDOMContentLoaded(function() {
    var defaultPrinter = localStorage.getItem("printerName");
    if(defaultPrinter  != undefined || defaultPrinter != ''){
        $("#printerName").val(defaultPrinter);
    }
    function newAbortSignal(timeoutMs) {
        const abortController = new AbortController();
        setTimeout(() => abortController.abort(), timeoutMs || 0);
        
        return abortController.signal;
    }
    var urlSocket2 = `ws://localhost:4000`;
    
    const socket2 = io(urlSocket2, {
        transports: ["websocket"],
    });
    socket2.on("connect", () => {
        console.log(socket2.id); // x8WIv7-mJelg7on_ALbx
    });

    socket2.on("disconnect", () => {
        console.log(socket2.id); // undefined
    });

    socket2.on("print", (arg) => {
        // console.log(arg); // world
    });
    socket2.on('print-response', (response) => {
        // console.log(`Respons dari server: ${response.message}`);
        Swal.close()
        if(response.status == 200){
            toastr.success("Struk Berhasil di print.");
        }else{
            toastr.error("Struk gagal di print.");
        }
        // Lakukan tindakan sesuai dengan respons yang diterima dari server
      });
    
    // axios.defaults.timeout = 10000;

    var form = document.querySelector('#form');;
    var dtCart =  $(".table-cart").DataTable({
        "scrollY": "300px",
        ordering: false,
        "scrollCollapse": false,
        "scrollX": true,
        "paging": false,
        "dom": "<'table-responsive'tr>"
    });
    
    var clientPrinters = null;
    Utils.createClock('datetime_order', 'datetime_zone');
    var keyUnit = 0;
    var dataProducts = [];
    var dataCustomers = [];
    var offlineDataForms = localStorage.getItem("offlineDataStorage") ? JSON.parse(localStorage.getItem("offlineDataStorage")) : [];;
    var offlineKeyForms = 0;
    var pageSize = 15;
    var dataSelectKeyFocus = 0;
    var selectedCustomer = null;
    const containerToast = document.getElementById('kt_toast_stack_container');
    const bodyToast = document.getElementById('toast-body-custom');
    const targetElementToast = document.querySelector('[data-kt-toast="stack"]'); // Use CSS class or HTML attr to avoid duplicating ids
    // Remove base element markup
    targetElementToast.parentNode.removeChild(targetElementToast);

    let myAudio = new Audio();
    const playAudio = () =>{
        myAudio.src = '../../sound.wav';
        myAudio.currentTime =0;
        // myAudio.autoplay = true;
        myAudio.loop = false;
        myAudio.play();
    }
    const pauseAudio = () => {
        myAudio.pause();
    }
    const stopAudio = () => {
        myAudio.stop();
    }
    // playAudio();
    const showToast = (html) =>{
        // playAudio();
        bodyToast.innerHTML = html;
        const newToast = targetElementToast.cloneNode(true);
        containerToast.append(newToast);
    
        // Create new toast instance --- more info: https://getbootstrap.com/docs/5.1/components/toasts/#getorcreateinstance
        const toast = bootstrap.Toast.getOrCreateInstance(newToast);
    
        // Toggle toast to show --- more info: https://getbootstrap.com/docs/5.1/components/toasts/#show
        toast.show();
    }

    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toastr-bottom-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };

    var modalUnit = new bootstrap.Modal(document.getElementById('kt_modal_select_unit'), {
        keyboard: false,
        backdrop: 'static'
    })
    

    const showDataModalUnit = (dataProd, key) => {
        // console.log("SHOWMODAL : " + key );
        var modalUnitEl = $("#kt_modal_select_unit");
        modalUnitEl.data("key", key);
        modalUnitEl.find(".modal-title").html(dataProd.name);
        var unitLists = ``;
        var prodUnits = dataProd.products_units;
        // console.log(prodUnits);
        if (prodUnits.length > 0) {
            $.each(prodUnits, (index, item) => {
                var classHighlight = "";
                if (index == 0) {
                    classHighlight = "list-group-item-highlight";
                }
                var nextIndex = index + 1;
                var isiVal = "";
                if(prodUnits[nextIndex] != undefined ){
                    isiVal = `- ${(item.qty_conv / prodUnits[nextIndex].qty_conv)} ${prodUnits[nextIndex].name}`;
                }
                unitLists += `<li class="list-group-item">
            <span class="fs-4 fw-bold lh-1 ">[${item.name}] ${isiVal}</span>
            <ul class="list-group  fs-6 fw-bold list-group-horizontal my-2">`
                unitLists += `<a href="#" class="list-group-item min-w-150px ${classHighlight}" data-price="${item.price_1}" data-index="${index}" data-json=${JSON.stringify(item)} data-json-unit=${JSON.stringify(prodUnits)} data-key="${key}">${Utils.numberLabelFormat(item.price_1)}</a>`;

                if (item.price_2 != null && item.price_2 != 0 && item.price_2 != 0.00) {
                    unitLists += `<a href="#" class="list-group-item min-w-150px" data-price="${item.price_2}" data-json-unit=${JSON.stringify(prodUnits)} data-index="${index}" data-json=${JSON.stringify(item)} data-key="${key}">${Utils.numberLabelFormat(item.price_2)}</a>`;
                }

                if (item.price_3 != null && item.price_3 != 0 && item.price_3 != 0.00) {
                    unitLists += `<a href="#" class="list-group-item min-w-150px" data-price="${item.price_3}" data-index="${index}" data-json=${JSON.stringify(item)} data-json-unit=${JSON.stringify(prodUnits)} data-key="${key}">${Utils.numberLabelFormat(item.price_3)}</a>`;
                }
                unitLists += `</ul></li>`;
            })
        }
        var htmlUnits = `<ul class="list-group">${unitLists}</ul>`;
        modalUnitEl.find(".modal-body").html(htmlUnits);
        modalUnit.show();
        // console.log(dataProd);
    }
    var urlSocket = hostUrl;;
    
    // var urlSocket = hostUrl.replace("https://", "wss://");
    if (urlSocket.startsWith("https://")) {
        urlSocket = hostUrl.replace("https://", "wss://") + "wsapp";
    } else if (hostUrl.startsWith("http://")) {
        urlSocket = hostUrl.replace("http://", "ws://") + "wsapp";
    } else {
        // Handle other cases or use the original hostUrl as needed
        urlSocket = hostUrl + "wsapp";
    }
    function connectWebSocket() {
        try{
            socket = new WebSocket(urlSocket);
    
            socket.onopen = function (e) {
                console.log("WS IS CONNECTED");
            }
        
            socket.onmessage = function (e) {
                if (e.data !== "pong") {
                    checkRadar(JSON.parse(e.data));
                }
            }
        
            socket.onclose = function (e) {
                if (e.wasClean) {
                    console.log(`WS CLOSED CLEANLY, code=${e.code}, reason=${e.reason}`);
                } else {
                    console.log(`CONNECTION DROPPED, code=${e.code}`);
                }
        
                console.log('WS IS CLOSED');
        
                // Reconnect after a timeout (e.g., 5 seconds)
                setTimeout(connectWebSocket, 5000);
            }
        }catch($e){
            console.log(e)
        }
        
    }
    
    // Initial connection
    connectWebSocket();

    // console.log(urlSocket);
    // try{

    //     var socket = new WebSocket(urlSocket);
    //     socket.onopen = function(e) {
    //         console.log("WS IS CONNECTED");
    //     }
    //     socket.onmessage = function(e) {
    //         // alert( e.data );
    //         // console.log(`WS:RESPONSE ${e.data}`);
    //         if(e.data != "pong"){
    //             checkRadar(JSON.parse(e.data));
    //         }
            
    //     }
    //     socket.onclose = function(e) {
    //         // alert( e.data );
    //         console.log('WS IS CLOSED');
    //     }
    // }catch(e){
    //     console.warn(e);
    // }
    
    const checkRadar = async (res) => {
        // console.log(res.name)
        if (res != null) {
            if (res.name == "update_products") {
               getDataProducts();
               
            } else if (res.name == "update_customers") {
                getDataCustomers();
            }else if (res.name == "update_notify_order_in") {
                
                showToast(`<div><b>PEMESANAN BARU MELALUI APLIKASI CUSTOMER.</b></div><br><br><a href='${hostUrl}sales/edit/${res.fk_ref_key}' class='btn btn-edit-sale btn-sm btn-info'>LIHAT</a>`);
                playAudio();
            }

        }
        // checkRadar();
    }

    var alertPo = $(".alert-po");
    const blinkBlinkAlertPo = () =>{
        var countPo = alertPo.data('count');
        // console.log(countPo);
        if(countPo > 0){
            alertPo.show();
            if(alertPo.hasClass("btn-danger")){
                alertPo.removeClass("btn-danger").addClass("btn-success");
            }else{
                alertPo.removeClass("btn-success").addClass("btn-danger");
            }
        }else{
            alertPo.hide();
        }
    }

    const checkOnlineStatus = async () => {
        var alertPo = $(".alert-po");
        var online = await axios.get(`${hostUrl}apis/check-online`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json;charset=UTF-8',
                    // "Access-Control-Allow-Origin": "*",
                    accept: 'application/json',
                    // "timeout": 3000,
                },
                timeout: 3000,
                signal: newAbortSignal(3000),
            })
            .then(async response => {
                if (response.status == 302) {
                    location.reload();
                } else {
                    alertPo.data("count", response.data.result);
                    $(".counter-po").html(response.data.result);
                    // console.log("CHECK OFFLINE DATA");
                    var getOfflineDatas = localStorage.getItem("offlineDataStorage");
                    if (getOfflineDatas != null) {
                        if (getOfflineDatas.length > 0) {
                            // console.log(getOfflineDatas);
                            var parseDataOffline = JSON.parse(getOfflineDatas);
                            var firstData = _.first(parseDataOffline);
                            if(firstData.subtotal != undefined  && firstData.subtotal != 0  && firstData.subtotal != 0.00  && firstData.subtotal != null){
                                var formData = new FormData();
                                $.each(firstData, function(e, val) {
                                    formData.append(e, val);
                                })
                                clearInterval(checkingForOnline);
                                await axios.post(`${form.getAttribute("action")}`, formData, {
                                    headers: {
                                        'X-Requested-With': 'XMLHttpRequest',
                                        'Content-Type': 'application/json;charset=UTF-8',
                                        // "Access-Control-Allow-Origin": "*",
                                        accept: 'application/json',
                                        // "timeout": 6000,
                                    },
                                    timeout: 3000,
                                    signal: newAbortSignal(3000)
                                }).then(function(response) {
                                    if (response.data.code == 200) {
                                        console.log("SAVED OFFLINE DATA SUCCESS");
                                        var index = parseDataOffline.indexOf(firstData);
                                        if (index !== -1) {
                                            parseDataOffline.splice(index, 1);
                                        }
                                        if (parseDataOffline.length > 0) {
                                            offlineDataForms = JSON.stringify(parseDataOffline);
                                            localStorage.setItem("offlineDataStorage", offlineDataForms)
                                        } else {
                                            localStorage.removeItem("offlineDataStorage")
                                        }
                                    }
                                }).catch(function(error) {
                                    console.warn("error saved data offline")
                                });
                                checkingForOnline = setInterval(checkOnlineStatus, 5000);
                            }
                            

                            

                        }
                    }
                    return true;
                }
                return response.status >= 200 && response.status < 300;
            })
            .catch(err => {
                var res = err.response;
                // console.log(res);
                if (res != undefined) {
                    if (res.status == 403) {
                        location.reload();
                    }
                }

                return false;
            })
        return online;
    };
    var checkingForOnline = setInterval(checkOnlineStatus, 5000);
    setInterval(()=>{
        blinkBlinkAlertPo()
    },500);


    const randomChar = (length) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }
    var attemptGetProducts = 0;
    const getDataProducts = async () => {
        var res = await axios.get(`${jsonUrl}json/products.json?id=${randomChar(10)}`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json;charset=UTF-8',
                accept: 'application/json',
            },
            signal: newAbortSignal(200000)
        }).then(function(response) {
            return response.data;
        }).catch(function(error) {
            console.warn(error);
            return false;
        });
        if(res != false){
            attemptGetProducts = 0;
            dataProducts = res;
        }else{
            attemptGetProducts += 1;
            Swal.fire({
                text: "ERRROR FETCHING DATA PRODUCTS",
                icon: "error",
                buttonsStyling: false,
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: "btn btn-primary"
                }
            });
            if(attemptGetProducts < 3){
                getDataProducts();
            }
        }
    }
    const getDataCustomers = async () => {
        var res = await axios.get(`${jsonUrl}json/customers.json?id=${randomChar(10)}`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json;charset=UTF-8',
                accept: 'application/json',
            },
            signal: newAbortSignal(20000)
        }).then(function(response) {
            return response.data;
        }).catch(function(error) {
            console.warn(error);
            return false;
        });
        if(res != false){
            dataCustomers = res;
        }else{
            Swal.fire({
                text: "ERRROR FETCHING DATA CUSTOMERS",
                icon: "error",
                buttonsStyling: false,
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: "btn btn-primary"
                }
            });
        }
    }
    const optionFormat = (item, container) => {
        if (!item.id) {
            return item.text;
        }
        // console.log(container);
        var span = document.createElement('div');
        var template = '';
        var isOutOfStock = !item.status_stock;
        var classBg = isOutOfStock ? 'result-danger' : '';
        
        if (isOutOfStock) {
            $(container).addClass(classBg);
        }
        
        template += `
            <div class="d-flex align-items-center">
                <img src="${item.img}" class="lozad h-40px me-3" alt="${item.name}"/>
                <div class="d-flex flex-column">
                    <span class="fs-2 fw-bold lh-1 text-gray-900">${item.name}</span>
                    <span class="text-primary fs-5">
                        ${item.products_units.map(data => {
                            var price = Utils.numberLabelFormat(data.price_1);
                            return `<span class="fw-bold">[ /${data.name}: ${price} ] </span>`;
                        }).join('')}
                    </span>
                </div>
            </div>`;
        
        // span.className = classBg;
        span.innerHTML = template;
        return $(span);
    }

    const optionFormatCustomer = (item) => {
        if (!item.id) {
            return item.text;
        }

        var span = document.createElement('span');
        var template = '';

        template += '<div class="d-flex align-items-center">';
        template += '<div class="d-flex flex-column">'
        template += '<span class="fs-6 fw-bold lh-1 text-gray-900">' + item.name + '</span>';
        template += '</span>';
        template += '<span class="fw-bolder text-gray-600">NO HANDPHONE : ' + (item.phone == null ? '-' : item.phone) + '</span> ';
        template += '<span class="fw-bolder text-gray-600 ">ALAMAT : ' + (item.address == null ? '-' : item.address) + '</span> ';
        template += '</div>';
        template += '</div>';

        span.innerHTML = template;
        return $(span);
    }
    const optionFormatResult = (item) => {
        if (!item.id) {
            return item.text;
        }
        if (item.name == undefined) {
            item.name = item.text;
        }

        var span = document.createElement('span');
        var template = '';

        template += '<div class="d-flex align-items-center">';
        template += '<div class="d-flex flex-column">'
        template += '<span class="fw-bold text-gray-900 lh-1">' + item.name + '</span>';
        template += '</div>';
        template += '</div>';

        span.innerHTML = template;
        return $(span);
    }

    const optionFormatUnit = (item) => {
        if (!item.id) {
            return item.text;
        }
        if (item.name == undefined) {
            item.name = item.text;
        }

        var span = document.createElement('span');
        var template = '';

        template += '<div class="d-flex align-items-center">';
        template += '<div class="d-flex flex-column">'
        template += '<span class=" fw-bold text-gray-900 lh-1">' + item.name + '</span>';
        template += '</div>';
        template += '</div>';

        span.innerHTML = template;
        return $(span);
    }

    $.fn.select2.amd.define('select2/data/customAdapter', ["select2/data/array", "select2/utils"], function(ArrayData, Utils) {
        function CustomData($element, options) {
            CustomData.__super__.constructor.call(this, $element, options);
        }
        Utils.Extend(CustomData, ArrayData);

        CustomData.prototype.query = function(params, callback) {
            items = dataProducts;
            // console.log(dataProducts);
            results = [];
            if (params.term && params.term !== '') {
                // console.log({"params":params.term});
                if(params.term.includes(' ')){
                    const strSplit = params.term.split(" ");
                    // console.log(strSplit);
                    paramNew = strSplit[0];
                    results = _.filter(items, function(e) {
                        firstText = e.text.toUpperCase();
                        return firstText.includes(paramNew.toUpperCase());

                        // firstText = e.text.substring(0, paramNew.length).toUpperCase();
                        // return firstText.indexOf(paramNew.toUpperCase()) >= 0;
                    });
                    var nextString = "";
                    for(i = 1; i < strSplit.length; i++ ){
                        nextString = `${strSplit[i]}`;

                    // console.log(nextString);
                        if(nextString.length > 0){
                            results = results.filter(function(items) {
                                firstText = items.text.toUpperCase();
                                // console.log({"first" : firstText, "nextString" : nextString});
                                return firstText.includes(nextString.toUpperCase());
                            });
                        }
                    }
                    // console.log(results);
                }else{
                    results = _.filter(items, function(e) {
                        barcodeText = e.barcode.substring(0, params.length).toUpperCase();
                        firstText = e.text.substring(0, params.term.length).toUpperCase();
                        searchByText = firstText.indexOf(params.term.toUpperCase());
                        searchByBarcode = barcodeText.indexOf(params.term.toUpperCase());
                        return ( searchByText >= 0 ||  searchByBarcode >= 0);
                    });
                }

                if(results.length == 0){
                    results = _.filter(items, function(e) {
                        firstText = e.text.toUpperCase();
                        searchByText = firstText.includes(params.term.toUpperCase());
                        return firstText.includes(params.term.toUpperCase());
                    });
                    console.log("SEARCH USING THIS");
                }
                
            } else {
                results = items;
            }

            if (!("page" in params)) {
                params.page = 1;
            }
            var data = {};
            data.results = results.slice((params.page - 1) * pageSize, params.page * pageSize);
            data.pagination = {};
            data.pagination.more = params.page * pageSize < results.length;
            callback(data);
        };
        return CustomData;
    })
    $.fn.select2.amd.define('select2/data/customAdapterCustomer', ["select2/data/array", "select2/utils"], function(ArrayData, Utils) {
        function CustomData($element, options) {
            CustomData.__super__.constructor.call(this, $element, options);
        }
        Utils.Extend(CustomData, ArrayData);

        CustomData.prototype.query = function(params, callback) {
            items = dataCustomers;
            // console.log(dataProducts);
            results = [];
            if (params.term && params.term !== '') {
                results = _.filter(items, function(e) {
                    return e.text.toUpperCase().indexOf(params.term.toUpperCase()) >= 0;
                });
            } else {
                results = items;
            }

            if (!("page" in params)) {
                params.page = 1;
            }
            var data = {};
            data.results = results.slice((params.page - 1) * pageSize, params.page * pageSize);
            data.pagination = {};
            data.pagination.more = params.page * pageSize < results.length;
            callback(data);
        };
        return CustomData;
    })

    var customAdapter = $.fn.select2.amd.require('select2/data/customAdapter');
    var customAdapterCustomer = $.fn.select2.amd.require('select2/data/customAdapterCustomer');

    const initProd = (el) => {
        if (!el.hasClass("select2-hidden-accessible")) {
            el.select2({
                // placeholder : "Pilih Product",
                dataAdapter: customAdapter,
                minimumInputLength: 1,
                templateSelection: optionFormatResult,
                templateResult: optionFormat,
                // scrollAfterSelect: true,
                // selectOnClose: true,
                dropdownParent: $(".select2-dropdown-prod"),
                dropdownAutoWidth: false,
            }).on("select2:select", function(e) {
                // if (e.params.originalSelect2Event != undefined) {
                var dataParams = e.params.data;
                var parentTr = $(`.table-cart tbody tr[data-key="${dataSelectKeyFocus}"]`);
                var parentKey = dataSelectKeyFocus;
                // var unitNameEl = parentTr.find('select.unit-name');
                // var priceNameEl = parentTr.find('select.unit-price');
                var productNameEl = parentTr.find('.product-name');
                var productIdEl = parentTr.find('.product-id');
                var productsVariantIdEl = parentTr.find('.products-variant-id');
                productNameEl.val(dataParams.name);
                productIdEl.val(dataParams.id);
                productsVariantIdEl.val(dataParams.varian_id);
                // var productsUnits = dataParams.products_units;
                // initUnitName(unitNameEl, productsUnits);
                // initUnitPrice(priceNameEl, productsUnits[0]);
                showDataModalUnit(dataParams, parentKey)
                // }
                $(".select2-dropdown-prod").removeClass("select2-dropdown-prod-fixed")

            }).on("select2:close", function(e) {
                $(".select2-dropdown-prod").removeClass("select2-dropdown-prod-fixed")
            }).on("select2:opening", function(e) {
                $("select.prod-id").val(null).trigger("change")
                $("select.select2-hidden-accessible:not(.prod-id)").select2('close');
                $(".select2-dropdown-prod").addClass("select2-dropdown-prod-fixed");
                
            })
        }

    }

    const initUnitName = (el, data, defaultVal = null) => {
        
    }
    $('body').on("click", "#kt_modal_select_unit a.list-group-item", function(e) {
        e.preventDefault();
        var modalUnitEl = $("#kt_modal_select_unit");
        var modalTargetKey = modalUnitEl.data("key");
        var itemHighlighted = $(this);
        var dataHighlighted = itemHighlighted.data();
        var trCart = $(".table-cart tbody").find(`tr[data-key="${modalTargetKey}"]`);
        var priceOrigin = (dataHighlighted.json.price_1 >= dataHighlighted.price ? dataHighlighted.json.price_1 : dataHighlighted.price);
        var discount = (priceOrigin >= dataHighlighted.price ? priceOrigin - dataHighlighted.price : 0);
        initSelectPrice(trCart,dataHighlighted.json,{"price" : dataHighlighted.price,"price_origin" : priceOrigin,"discount" : discount});
        if (trCart.find('.btn-add-unit').length > 0) {
            trCart.find(".btn-add-unit").click();
        } else {
            setTimeout(function() {
                $(`.table-cart tbody tr:last .unit-qty`).focus();
            }, 100);
        }

        modalUnit.hide()
    });
    const initSelectPrice = (el,data,defaultVal = {}) =>{
        // console.log(defaultVal);
        var parentKey = el.data("key");
        var elUnitName = el.find(".unit-name");
        var elUnitPriceOrigin = el.find(".unit-price-origin");
        var elUnitCost = el.find(".unit-cost");
        var elUnitQtyConv = el.find(".unit-qty-conv");
        var elUnitPrice = el.find(".unit-price");
        var elDiscountPrice = el.find(".unit-discount");
        var unitCost = (defaultVal.cost != undefined ? defaultVal.cost : data.unit_cost);
        var unitQtyConv = (defaultVal.qty_conv != undefined ?  defaultVal.qty_conv : data.qty_conv);
        // console.log(unitCost);
        elUnitName.val(data.name);
        elUnitPriceOrigin.val(defaultVal.price_origin);
        elUnitPrice.val(defaultVal.price);
        elDiscountPrice.val(defaultVal.discount);
        elUnitCost.val(unitCost);
        elUnitQtyConv.val(unitQtyConv);
        setSubtotalItem(parentKey);

    }

    const initUnitPrice = (el, data,defaultVal = null) => {
        
    }

    const setSubtotalItem = (key) => {
        var trEl = $(`tr[data-key="${key}"]`);
        var qtyEl = trEl.find(".unit-qty");
        var priceEl = trEl.find(".unit-price");
        var priceOriginEl = trEl.find(".unit-price-origin");
        var costEl = trEl.find(".unit-cost");
        var discountEl = trEl.find(".unit-discount");
        var subTotal = qtyEl.val() * priceEl.val();
        var discount = qtyEl.val() * discountEl.val();
        var subTotalOrigin = qtyEl.val() * priceOriginEl.val();
        var cost = qtyEl.val() * costEl.val();
        // console.log([cost,subTotal])
        var margin = subTotal - cost;
        var subTotalEl = trEl.find(".unit-subtotal");
        var subTotalCostEl = trEl.find(".unit-subtotal-cost");
        var subTotalMarginEl = trEl.find(".unit-subtotal-margin");
        var subTotalOriginEl = trEl.find(".unit-subtotal-origin");
        var subTotalDiscountEl = trEl.find(".unit-subtotal-discount");
        subTotalEl.val(subTotal);
        subTotalCostEl.val(cost);
        subTotalMarginEl.val(margin);
        subTotalOriginEl.val(subTotalOrigin);
        subTotalDiscountEl.val(discount);
        subtotalSumPrice();
    }

    const clearSubtotal = (elKey) => {
        var trEl = $(".table-cart").find(`tbody tr:eq(${elKey})`);
        var qtyEl = trEl.find(".unit-qty");
        var qtyConvEl = trEl.find(".unit-qty-conv");
        var priceEl = trEl.find(".unit-price");
        var originEl = trEl.find(".unit-price-origin");
        var discountEl = trEl.find(".unit-price-discount");
        var costEl = trEl.find(".unit-cost");
        var unitName = trEl.find(".unit-name");
        var prodEl = trEl.find(".product-id");
        var productNameEl = trEl.find('.product-name');
        var subTotalEl = trEl.find(".unit-subtotal");
        var subTotalCostEl = trEl.find(".unit-subtotal-cost");
        var subTotalMarginEl = trEl.find(".unit-subtotal-margin");
        var subTotalOriginEl = trEl.find(".unit-subtotal-origin");
        var subTotalDiscountEl = trEl.find(".unit-subtotal-discount");
        qtyEl.val(1);
        subTotalEl.val(0);
        qtyConvEl.val(0);;
        costEl.val(0);
        originEl.val(0);
        discountEl.val(0);
        subTotalCostEl.val(0);
        subTotalMarginEl.val(0);
        subTotalOriginEl.val(0);
        subTotalDiscountEl.val(0);
        productNameEl.val(null);
        priceEl.empty();
        unitName.empty();
        prodEl.val(null);
        modalUnit.hide();
        // console.log(KTDrawer);
        KTDrawer.hideAll();
        setTimeout(function() {
            qtyEl.focus();
        }, 100);
        subtotalSumPrice();
    }

    const subtotalSumPrice = () => {
        var tableCartEl = $(".table-cart");
        var trEl = tableCartEl.find("tbody tr");
        var subTotalSum = 0;
        var subTotalCostSum = 0;
        var subTotalMarginSum = 0;
        var subTotalOriginSum = 0;
        var subTotalDiscountSum = 0;
        trEl.each(function(index, el) {
            var subTotal = $(el).find(".unit-subtotal").val() * 1
            var cost = $(el).find(".unit-subtotal-cost").val() * 1
            var margin = $(el).find(".unit-subtotal-margin").val() * 1
            var origin = $(el).find(".unit-subtotal-origin").val() * 1
            var discount = $(el).find(".unit-subtotal-discount").val() * 1
            subTotalSum = subTotalSum + subTotal;
            subTotalCostSum = subTotalCostSum + cost;
            subTotalMarginSum = subTotalMarginSum + margin;
            subTotalOriginSum = subTotalOriginSum + origin;
            subTotalDiscountSum = subTotalDiscountSum + discount;
        })
        $(".subtotal").val(subTotalSum);
        $(".subtotal-cost").val(subTotalCostSum);
        $(".subtotal-margin").val(subTotalMarginSum);
        $(".subtotal-origin").val(subTotalOriginSum);
        $(".subtotal-discount").val(subTotalDiscountSum);
        sumGrandTotal();
    }

    const sumGrandTotal = () => {
        var subTotal = $(".subtotal").val() * 1;
        var debt = $(".debt").val() * 1;
        var rateCost = $(".rate-cost").val() * 1;
        var gt = subTotal + debt + rateCost;
        var grandTotal = $(".grandtotal");
        grandTotal.val(gt);
        $(".span-grandtotal").html(Utils.numberLabelFormat(gt));
        returnCash();
    }

    const returnCash = () => {
        var grandTotal = $(".grandtotal").val() * 1;
        var cash = $(".cash").val() * 1;
        var returnCashEl = $(".return-cash");
        var returnValD = 0;
        if (cash != 0) {
            returnValD = cash - grandTotal;
        }
        // console.log(/returnValD);
        returnCashEl.val(returnValD);
    }

    const btnDeleteDetail = `<a href="#" class="btn btn-danger btn-sm btn-remove-unit p-2">
    <span class="svg-icon svg-icon-3 m-0"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 9C5 8.44772 5.44772 8 6 8H18C18.5523 8 19 8.44772 19 9V18C19 19.6569 17.6569 21 16 21H8C6.34315 21 5 19.6569 5 18V9Z" fill="currentColor"/><path opacity="0.5" d="M5 5C5 4.44772 5.44772 4 6 4H18C18.5523 4 19 4.44772 19 5V5C19 5.55228 18.5523 6 18 6H6C5.44772 6 5 5.55228 5 5V5Z" fill="currentColor"/><path opacity="0.5" d="M9 4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V4H9V4Z" fill="currentColor"/></svg></span>
                </a>`;
    const btnAddDetail = `<a href="#" class="btn btn-primary btn-sm btn-add-unit p-2">
                    <span class="svg-icon svg-icon-3 m-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect opacity="0.5" x="11.364" y="20.364" width="16" height="2" rx="1" transform="rotate(-90 11.364 20.364)" fill="currentColor"></rect>
                            <rect x="4.36396" y="11.364" width="16" height="2" rx="1" fill="currentColor"></rect>
                        </svg>
                    </span>
                </a>`;
    const addUnitTr = (keyUnit, withData = null) => {
        var tableTbodyEl = $(".table-cart tbody");
        var elAdd = `<tr data-key="${keyUnit}">
            <td class="p-0">
                <input type="hidden" class="form-control text-gray-900 form-control sunit-id text-end" value="" name="sales_details[${keyUnit}][id]" id="sales-details-${keyUnit}-id" autocomplete="off">
                <input type="text" class="form-control text-gray-900 form-control unit-qty text-end" value="1" name="sales_details[${keyUnit}][qty]" id="sales-details-${keyUnit}-qty" autocomplete="off">
            </td>
            <td class="p-0">
                <input type="text" class="form-control text-gray-900 form-control product-name " value="" name="sales_details[${keyUnit}][product_name]" id="sales-details-${keyUnit}-product-name" autocomplete="off">
                <input type="hidden" class="form-control text-gray-900 form-control product-id " value="" name="sales_details[${keyUnit}][product_id]" id="sales-details-${keyUnit}-product-id" autocomplete="off">
                <input type="hidden" class="form-control text-gray-900 form-control products-variant-id " value="" name="sales_details[${keyUnit}][products_variant_id]" id="sales-details-${keyUnit}-products-variant-id" autocomplete="off">
            </td>
            <td class="p-0">
                <input type="text" class="form-control text-gray-900 form-control unit-name" value="" name="sales_details[${keyUnit}][unit_name]" id="sales-details-${keyUnit}-name" autocomplete="off" readonly="true">
                <input type="hidden" class="form-control text-gray-900 form-control unit-cost text-end" value="0" name="sales_details[${keyUnit}][cost]" id="sales-details-${keyUnit}-cost" autocomplete="off">
                <input type="hidden" class="form-control text-gray-900 form-control unit-qty-conv text-end" value="0" name="sales_details[${keyUnit}][unit_qty]" id="sales-details-${keyUnit}-unit-qty" autocomplete="off">
                
                
            </td>
            <td class="p-0">
                <input type="text" class="form-control text-gray-900 form-control unit-price-origin text-end" value="0" name="sales_details[${keyUnit}][price_origin]" id="sales-details-${keyUnit}-price-origin" autocomplete="off" readonly="true">
                <input type="hidden" class="form-control text-gray-900 form-control unit-price text-end" value="0" name="sales_details[${keyUnit}][price]" id="sales-details-${keyUnit}-price" autocomplete="off" readonly="true">
                    
            </td>
            <td class="p-0">
                <input type="text" class="form-control text-gray-900 form-control unit-discount text-end" value="0" name="sales_details[${keyUnit}][discount]" id="sales-details-${keyUnit}-discount" autocomplete="off" readonly="true">
            </td>
            <td class="p-0">
                <input type="text" class="form-control text-gray-900 form-control unit-subtotal text-end" value="0" name="sales_details[${keyUnit}][subtotal_price]" id="sales-details-${keyUnit}-subtotal-price" readonly>

                <input type="hidden" class="form-control text-gray-900 form-control unit-subtotal-cost text-end" value="0" name="sales_details[${keyUnit}][subtotal_cost]" id="sales-details-${keyUnit}-subtotal-cost" readonly>

                <input type="hidden" class="form-control text-gray-900 form-control unit-subtotal-margin text-end" value="0" name="sales_details[${keyUnit}][subtotal_margin]" id="sales-details-${keyUnit}-subtotal-margin" readonly>
                <input type="hidden" class="form-control text-gray-900 form-control unit-subtotal-origin text-end" value="0" name="sales_details[${keyUnit}][subtotal_origin]" id="sales-details-${keyUnit}-subtotal-origin" readonly>
                <input type="hidden" class="form-control text-gray-900 form-control unit-subtotal-discount text-end" value="0" name="sales_details[${keyUnit}][subtotal_discount]" id="sales-details-${keyUnit}-subtotal-discount" readonly>
            </td>
            <td class="p-0 text-center">
                ${(withData != null ? btnDeleteDetail : btnAddDetail)}
            </td>
        </tr>`;
        dtCart.row.add($(elAdd)).draw();

        // tableTbodyEl.append(elAdd);
        var trEl = tableTbodyEl.find(`tr[data-key="${keyUnit}"]`);
        var prodEl = trEl.find('.product-id');
        var prodVariantEl = trEl.find('.products-variant-id');
        var prodNameEl = trEl.find('.product-name');
        var saleDetailIdEl = trEl.find('.sunit-id');
        var unitNameEl = trEl.find('.unit-name');
        var unitPriceEl = trEl.find('.unit-price');
        var unitCostEl = trEl.find('.unit-cost');
        var qtyEl = trEl.find('.unit-qty');
        var qtyConvEl = trEl.find('.unit-qty-conv');
        var subtotalEl = trEl.find('.unit-subtotal');
        var subtotalCostEl = trEl.find('.unit-subtotal-cost');
        var priceOriginEl = trEl.find('.unit-price-origin');
        var discountEl = trEl.find('.unit-discount');
        var subtotalMarginEl = trEl.find('.unit-subtotal-margin');
        var subtotalOriginEl = trEl.find('.unit-subtotal-origin');
        var subtotalDiscountEl = trEl.find('.unit-subtotal-discount');
        qtyEl.number(true, 2);
        discountEl.number(true, 0);
        subtotalEl.number(true, 0);
        priceOriginEl.number(true, 0);
        if (withData != null) {
            saleDetailIdEl.val(withData.id);
            qtyEl.val(withData.qty);
            qtyConvEl.val(withData.unit_qty);
            prodNameEl.val(withData.product_name);
            prodEl.val(withData.product_id);
            prodVariantEl.val(withData.products_variant_id);
            priceOriginEl.val(withData.price_origin);
            discountEl.val(withData.discount);
            unitCostEl.val(withData.cost);
            unitPriceEl.val(withData.price);
            unitNameEl.val(withData.unit_name);

            // initUnitName(unitNameEl, dataSetProductsUnits, withData.unit_name);
            // initUnitPrice(unitPriceEl,dataPriceSet,withData.price );
            subtotalEl.val(withData.subtotal_price);
            subtotalCostEl.val(withData.subtotal_cost);
            subtotalMarginEl.val(withData.subtotal_margin);
            subtotalOriginEl.val(withData.subtotal_origin);
            subtotalDiscountEl.val(withData.subtotal_discount);
        } else {
            setTimeout(function() {
                qtyEl.focus();
            }, 100);
        }


    }

    const resetForm = () => {
        console.log("RESETED");
        keyUnit = 0;
        dtCart.rows().remove().draw();

        $("select.customer-id").val(null).trigger("change");
        $("select.shipping_method").val(0).trigger("change");
        $(".table-summary input").val(0);
        $(".rate-cost").val(0);
        addUnitTr(keyUnit);
        clearSubtotal(keyUnit);
        selectedCustomer = null;
        $("#kt_drawer_add_customer_toggle").html('<i class="fa fa-plus"></i>');
        $("#kt_drawer_add_customer_toggle").removeClass('btn-info').addClass('btn-primary');
        $(".customer-name-dummy").val("UMUM");
        $(".id-deleted-detail").val(null);
        $(".id-sales").val(null);
        $("#status_process").val(3);
        $("#status_payment").val(2);
        $("#payment_method").val(0);
        $("select#driver-id").val("").trigger('change');;
        $("#clear-customer").hide();
        setTimeout(function() {
            $(`.unit-qty`).focus();
        }, 100);
    }

    const submitForm = async (status_order) => {
        var validateDataDetail = false;
        $(".table-cart tbody tr").each((index, el) => {
            var qtyEl = $(el).find(".unit-qty");
            var prodIdEl = $(el).find(".product-id");
            if (prodIdEl.val() != null && qtyEl.val() != null && qtyEl.val() != 0 && qtyEl.val() != 0.00) {
                validateDataDetail = true;
                return false;
            }
        })
        if (validateDataDetail) {
            Swal.fire({
                text: "Harap Menunggu Menyimpan Data!",
                allowOutsideClick: false,
                allowEscapeKey: false,
                icon: "info",
                buttonsStyling: false,
                showConfirmButton: true,
                customClass: {
                    confirmButton: "btn btn-primary"
                }
            });

            var formData = new FormData(form);
            var d = new Date();
            let dateOrderM = moment(d, "YYYY-MM-DD hh:mm:ss");
            var dateOrder = dateOrderM.format("YYYY-MM-DD hh:mm:ss"); 
            // var tz = moment.tz.guess();
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            console.log([dateOrderM,d,timezone]);
            formData.append("status", status_order);
            formData.append("datetimeorder", dateOrder);
            formData.append("tz", timezone);
            const online = await checkOnlineStatus();
            // console.log(online);
            if (online) {
                const signalPostSubmit = newAbortSignal(5000);
                axios.post(`${form.getAttribute("action")}`, formData, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Content-Type': 'application/json;charset=UTF-8',
                        // "Access-Control-Allow-Origin": "*",
                        accept: 'application/json'
                    },
                    "timeout": 5000,
                    signalPostSubmit,
                }).then(async function(response)  {
                    if (response.data.code == 200) {
                        if (response.data.record.status == 1) {
                            swal.fire({
                                title: "TRANSAKSI BERHASIL DISIMPAN!",
                                text: "Apakah anda ingin mencetak struk?",
                                icon: "success",
                                showCancelButton: !0,
                                focusConfirm: true,
                                confirmButtonText: "IYA",
                                cancelButtonText: "TIDAK"
                            }).then(e => {
                                if (e.value) {
                                    printStruk(response.data.record.id);
                                    resetForm();
                                } else {
                                    resetForm();
                                }
                                setTimeout(function() {
                                    $(`.unit-qty`).focus();
                                }, 100)
                            });
                            var cust = response.data.record.customer;
                            if(cust != null){
                                
                                console.log(response.data);
                                if(Utils.validatePhoneNumber(cust.phone)){
                                    var thisData = response.data.record;
                                    var url = `${jsonUrl}/sales/view/${thisData.id}`;
                                    var textCopied = `HALO *${cust.name}*,\nNO TRANSAKSI : ${thisData.code}\nTGL TRANSAKSI : ${Utils.dateIndonesia(thisData.date_temp,true,true)} \nTOTAL : *${Utils.numberLabelFormat(thisData.total_amount)}*\nTERIMAKASIH TELAH BERBELANJA.\nKLIK LINK DIBAWAH UNTUK MELIHAT STRUK\n${url}`;
                                    try {
                                        await navigator.clipboard.writeText(textCopied);
                                        showToast("Whats App Berhasil Di Salin.");
                                    } catch (err) {
                                        console.warn('Failed to copy: ', err);
                                    }
                                }
                            }
                            // resetForm();
                        } else {
                            Swal.fire({
                                title: "TRANSAKSI BERHASIL DISIMPAN!",
                                icon: "success",
                                buttonsStyling: false,
                                confirmButtonText: "OK",
                                customClass: {
                                    confirmButton: "btn btn-primary"
                                },
                            });
                            resetForm();

                            setTimeout(function() {
                                $(`.unit-qty`).focus();
                            }, 100)
                        }
                    } else {
                        Swal.fire({
                            text: response.data.message,
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "OK",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            }
                        });
                    }
                }).catch(function(error) {
                    if (signal.aborted) {
                        Swal.fire({
                            text: "REQUEST GAGAL SILAHKAN ULANGI KEMBALI",
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "OK",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            }
                        });
                    }else{
                        Swal.fire({
                            text: error.message,
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "OK",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            }
                        });
                    }
                    
                });
            } else {
                var unindexed_array = $(".form-sales").serializeArray();
                var getData = {};

                $.map(unindexed_array, function(n, i) {
                    getData[n['name']] = n['value'];
                });
                getData['status'] = status_order;
                // JSON.stringify
                if (offlineDataForms.length > 0) {
                    offlineDataForms = JSON.parse(offlineDataForms);
                }
                // var stringData = JSON.stringify(getData);
                offlineDataForms.push(getData)
                var stringData = JSON.stringify(offlineDataForms);
                // console.log(offlineDataForms)
                // offlineKeyForms++;
                localStorage.setItem("offlineDataStorage", stringData);
                offlineDataForms = stringData;
                Swal.fire({
                    text: "DATA DISIMPAN SECARA OFFLINE",
                    icon: "error",
                    buttonsStyling: false,
                    confirmButtonText: "OK",
                    customClass: {
                        confirmButton: "btn btn-primary"
                    }
                });
                var emptyString = ``;
                var $contentPrint = `OFFLINE MODE` + "\x0A";
                $contentPrint += `${emptyString.padEnd('40','-')}` + "\x0A";
                var tglRow = `TGL TRX`;
                var customerRow = `PELANGGAN`;
                var dateTimeOrder = formData.get('datetimeorder');
                var customerId = formData.get('customer_id');
                var customerName = 'UMUM';
                if (customerId != null) {
                    customerName = $(`#customer-id option[value=${customerId}]`).text()
                }
                $contentPrint += `${tglRow.padEnd('12',' ')} : ${dateTimeOrder}` + "\x0A";
                $contentPrint += `${customerRow.padEnd('12',' ')} : ${customerName}` + "\x0A";
                $contentPrint += `${emptyString.padEnd('40','-')}` + "\x0A";
                $.each($(".table-cart tbody tr:not(:last)"), function(index, item) {
                    var thisTr = $(this)
                    var prodName = thisTr.find(".product-name").val();
                    var prodQty = thisTr.find(".unit-qty").val();
                    var unitName = `[${thisTr.find(".unit-name").val()}]`;
                    var price = Utils.numberLabelFormat(thisTr.find(".unit-price").val());
                    var subtotalP = Utils.numberLabelFormat(thisTr.find(".unit-subtotal").val());
                    $contentPrint += `${prodName}` + "\x0A";
                    $contentPrint += emptyString.padStart(3, " ");
                    $contentPrint += prodQty.padStart(3, " ") + " ";
                    $contentPrint += unitName.padEnd(6, " ");
                    $contentPrint += price.padStart(12, " ");
                    $contentPrint += subtotalP.padStart(15, " ");
                    $contentPrint += "\x0A";
                })
                $contentPrint += `${emptyString.padEnd('40','-')}` + "\x0A";
                var subTotalAmount = Utils.numberLabelFormat(formData.get('subtotal'));
                var grandTotalAmount = Utils.numberLabelFormat(formData.get('total_amount'));
                var debt = Utils.numberLabelFormat(formData.get('debt'));
                var cash = Utils.numberLabelFormat(formData.get('cash'));
                var return_cash = Utils.numberLabelFormat(formData.get('return_cash'));
                $contentPrint += "\x0A";
                var subTotalLabel = "SUB TOTAL";
                $contentPrint += subTotalLabel.padEnd(20, " ");
                $contentPrint += subTotalAmount.padStart(20, " ") + "\x0A";
                var subTotalLabel = "TOTAL";
                $contentPrint += subTotalLabel.padEnd(20, " ");
                $contentPrint += grandTotalAmount.padStart(20, " ") + "\x0A";
                $contentPrint += `${emptyString.padEnd('40','-')}` + "\x0A\x0A\x0A\x0A\x0A\x0A\x0A\x0A\x0A\x1B\x6D";
                
                var esc = '\x1B'; //ESC byte in hex notation
                var contentData = $contentPrint;
                var cmds = esc + "@";
                cmds += contentData;
                
                Swal.fire({
                    text: "Harap Menunggu Mencetak Struk!",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    icon: "info",
                    buttonsStyling: false,
                    showConfirmButton: false,
                    customClass: {
                        confirmButton: "btn btn-primary"
                    }
                });
                socket2.emit("print", {printerType : $("#printerName").val(),dataPrint:cmds},(response) => {
                    Swal.close()
                    if(response.status == 200){
                        toastr.success("Struk Berhasil di print.");
                    }else{
                        toastr.error("Struk gagal di print.");
                    }
                });

                Swal.fire({
                    text: "Transaksi Tersimpan Dalam Mode Offline",
                    icon: "success",
                    buttonsStyling: false,
                    confirmButtonText: "OK",
                    customClass: {
                        confirmButton: "btn btn-primary"
                    },
                    timer: 10000,

                }).then((e) => {
                    resetForm()
                    
                });

            }

        } else {
            Swal.fire({
                text: "Error, Harap masukan data barang",
                icon: "error",
                buttonsStyling: false,
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: "btn btn-primary"
                }
            });
        }

    }

    const handleSubmitBtn = (status) => {
        var message = `APAKAH ANDA YAKIN INGIN ${(status == 1 ? "MENYELESAIKAN" : "MENUNDA")} TRANSAKSI INI?`;
        swal.fire({
            title: message,
            icon: "success",
            showCancelButton: !0,
            focusConfirm: true,
            confirmButtonText: "IYA",
            cancelButtonText: "TIDAK"
        }).then(e => {
            if (e.value) {
                submitForm(status);
            }
        });

    };

    const printStruk = (idTrx,type="true") => {
        $.get({
            url: `${hostUrl}sales/view/${idTrx}.txt?printerType=${$("#printerName").val()}&struckType=${type}`,
        }).done(function(data) {
            Swal.fire({
                text: "Harap Menunggu Mencetak Struk!",
                allowOutsideClick: false,
                allowEscapeKey: false,
                icon: "info",
                buttonsStyling: false,
                showConfirmButton: false,
                customClass: {
                    confirmButton: "btn btn-primary"
                }
            });
            socket2.emit("print", {printerType : $("#printerName").val(),dataPrint:data});
        });
    }


    //END OF FUNCTION SALES//
    //ELEMENT HANDLING///
    //HANDLE ADD UNIT
    $("body").on("click", ".btn-add-unit", function(e) {
        e.preventDefault();
        var parentTr = $(this).closest('tr');
        var prodId = parentTr.find(".product-id");
        var unitName = parentTr.find(".unit-name");
        var unitQty = parentTr.find(".unit-qty");
        if (prodId.val() == null || unitName.val() == null || unitQty.val() == null || unitQty.val() == 0 || unitQty.val() == 0.00) {
            Swal.fire({
                text: "Harap masukan data lengkap",
                icon: "error",
                buttonsStyling: false,
                confirmButtonText: "Ok",
                customClass: {
                    confirmButton: "btn btn-primary"
                }
            });
            return false;
        }
        keyUnit++;
        var tdEl = $(this).closest('td');
        tdEl.html(`<a href="#" class="btn btn-danger btn-sm btn-remove-unit p-2">
    <span class="svg-icon svg-icon-3 m-0"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 9C5 8.44772 5.44772 8 6 8H18C18.5523 8 19 8.44772 19 9V18C19 19.6569 17.6569 21 16 21H8C6.34315 21 5 19.6569 5 18V9Z" fill="currentColor"/><path opacity="0.5" d="M5 5C5 4.44772 5.44772 4 6 4H18C18.5523 4 19 4.44772 19 5V5C19 5.55228 18.5523 6 18 6H6C5.44772 6 5 5.55228 5 5V5Z" fill="currentColor"/><path opacity="0.5" d="M9 4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V4H9V4Z" fill="currentColor"/></svg></span>
                </a>`)
        addUnitTr(keyUnit);

    });
    //HANDLE REMOVE UNIT
    $("body").on("click", ".btn-remove-unit", function(e) {
        e.preventDefault();
        var parentTr = $(this).closest('tr');
        var deleteDetailData = $(".id-deleted-detail");
        var checkPuId = parentTr.find(".sunit-id");
        if(checkPuId != undefined){
            if(deleteDetailData.val() == ""){
                deleteDetailData.val(checkPuId.val());
            }else{
                deleteDetailData.val(`${deleteDetailData.val()},${checkPuId.val()}`);
            }
        }
        // parentTr.remove();
        dtCart.row(parentTr).remove().draw();

        subtotalSumPrice();
    });

    $("body").on("keyup", ".unit-qty", function(e) {
        var parentTr = $(this).closest('tr');
        var parentKey = parentTr.data("key");
        setSubtotalItem(parentKey);
        if (e.keyCode == 27) {
            clearSubtotal(keyUnit)
            $("select.select2-hidden-accessible").select2('close');
            modalUnit.hide();
            return false;
        }

    })

    $("body").on("keyup", ".unit-discount", function(e) {
        var parentTr = $(this).closest('tr');
        var parentKey = parentTr.data("key");
        var priceOriginEl = parentTr.find(".unit-price-origin");
        var priceEl = parentTr.find(".unit-price");
        var subx = priceOriginEl.val() - $(this).val();
        priceEl.val(subx);
        setSubtotalItem(parentKey);
        if (e.keyCode == 27) {
            clearSubtotal(keyUnit)
            $("select.select2-hidden-accessible").select2('close');
            modalUnit.hide();
            return false;
        }

    })
    $("body").on("keypress", ".unit-qty", function(e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            var parentTr = $(this).closest('tr');
            var prodNameEl = parentTr.find(".product-name");
            prodNameEl.focus()

        }
    })
    $("body").on("focus", ".product-name", function(e) {
        var prodEl = $("select.prod-id");
        var parentTr = $(this).closest('tr');
        var parentKey = parentTr.data("key");
        dataSelectKeyFocus = parentKey;
        setTimeout(function(e) {
            prodEl.focus();
            prodEl.select2('open');
        }, 100)

    })
    $(document).on('select2:open', e => {
        const id = e.target.id;
        const target = document.querySelector(`[aria-controls=select2-${id}-results]`);
        target.focus();
    });
    $("body").on("focus", ".unit-qty,.debt,.cash", function() {
        $(this).select();
    });
    $(".debt").on("keyup", function(e) {
        sumGrandTotal()
    })
    $(".rate-cost").on("keyup", function(e) {
        sumGrandTotal()
    })
    $(".debt").on("keypress", function(e) {
        if (e.keyCode == 13) {
            $(".cash").focus()
            return false;
        } else if (e.keyCode == 92 || e.keyCode == 27) {
            modalUnit.hide();
            setTimeout(function() {
                $(`.table-cart tbody tr:last .unit-qty`).focus();
            }, 100);
            return false;
        }

    })
    $(".cash").on("keyup", function(e) {
        returnCash()
    })

    $(".cash").on("keypress", function(e) {
        if (e.keyCode == 13) {
            // $(".cash").focus()
            handleSubmitBtn(1);
            return false;
        } else if (e.keyCode == 92 || e.keyCode == 27) {
            setTimeout(function() {
                $(`.table-cart tbody tr:last .unit-qty`).focus();
            }, 100);
            return false;
        }

    })
    $("body").on("keypress", function(e) {
        if (e.keyCode == 92 || e.keyCode == 27) {
            clearSubtotal(keyUnit);
            $("select.select2-hidden-accessible").select2('close');
            modalUnit.hide();
            return false;
        }
    })
    //HANDLE SUBMIT
    $(".btn-submit").on("click", function(e) {
        e.preventDefault();
        var status = $(this).data('value');
        handleSubmitBtn(status);
    });

    $(".btn-void").on("click", function(e) {
        e.preventDefault();
        resetForm();
    })
    
    $('body').on("keydown", function(e) {
        //check modal price unit is active//
        var modalUnitEl = $("#kt_modal_select_unit");
        if (modalUnitEl.hasClass("show")) {
            var modalTargetKey = modalUnitEl.data("key");
            // console.log(modalUnitEl.data());
            var itemHighlighted = $(".list-group-item-highlight");
            var getIndexHighlighted = itemHighlighted.index();
            var parentListGroup = itemHighlighted.closest('ul');
            var nextItem = itemHighlighted.next();
            var prevItem = itemHighlighted.prev();
            var parentListGroupMaster = parentListGroup.closest('li');
            var parentListGroupMasterNext = parentListGroupMaster.next();
            var parentListGroupMasterPrev = parentListGroupMaster.prev();
            if (e.keyCode == 39) {
                if (nextItem.length > 0) {
                    itemHighlighted.removeClass('list-group-item-highlight');
                    nextItem.addClass('list-group-item-highlight');
                }
            } else if (e.keyCode == 37) {
                if (prevItem.length > 0) {
                    itemHighlighted.removeClass('list-group-item-highlight');
                    prevItem.addClass('list-group-item-highlight');
                }
                //action keydown
            } else if (e.keyCode == 40) {
                if (parentListGroupMasterNext.length > 0) {
                    itemHighlighted.removeClass('list-group-item-highlight');
                    var elTarget = parentListGroupMasterNext.find(`.list-group-item:eq(${getIndexHighlighted})`);
                    if (elTarget == undefined) {
                        elTarget = parentListGroupMasterNext.find(`.list-group-item:eq(0)`);
                    }
                    elTarget.addClass('list-group-item-highlight');
                }
            } else if (e.keyCode == 38) {
                if (parentListGroupMasterPrev.length > 0) {
                    itemHighlighted.removeClass('list-group-item-highlight');
                    var elTarget = parentListGroupMasterPrev.find(`.list-group-item:eq(${getIndexHighlighted})`);
                    if (elTarget == undefined) {
                        elTarget = parentListGroupMasterPrev.find(`.list-group-item:eq(0)`);
                    }
                    elTarget.addClass('list-group-item-highlight');
                } else {
                    itemHighlighted.removeClass('list-group-item-highlight');
                    var groupIems = parentListGroupMaster.closest('ul');
                    var lastItems = groupIems.children('li').last();
                    var elTarget = lastItems.find(`.list-group-item:eq(${getIndexHighlighted})`);
                    if (elTarget == undefined) {
                        elTarget = lastItems.find(`.list-group-item:eq(0)`);
                    }
                    elTarget.addClass('list-group-item-highlight');
                }
            } else if (e.keyCode == 13) {
                itemHighlighted.trigger("click");
            } else if (e.keyCode == 27) {
                if (modalTargetKey == keyUnit) {
                    clearSubtotal(modalTargetKey);
                } else {
                    setSubtotalItem(modalTargetKey);
                    setTimeout(function() {
                        $(`.table-cart tbody tr[data-key="${modalTargetKey}"] .unit-qty`).focus();
                    }, 100)
                }

            }
        }
    })
    $(document).on("keydown", function(e) {

        // console.log("DOCUMENT KEYDOWN ; " + e.keyCode);
        if (e.keyCode == 123) {
            handleSubmitBtn(1);
            return false;
        }
        if (e.keyCode == 121) {
            handleSubmitBtn(2);
            return false;
        }
        if (e.keyCode == 27) {
            var modalUnitEl = $("#kt_modal_select_unit");
            if (!modalUnitEl.hasClass("show")) {
                clearSubtotal(keyUnit)
                return false;
            } else {

            }
        }
        if (e.keyCode == 187) {
            $(".cash").focus()
            return false;
        }
        if (e.keyCode == 191) {
            $("select.customer-id").focus();
            $("select.customer-id").select2('open');
            return false;
        }
    })
    $("body").on("focus", ".customer-name-dummy", function(e) {
        // console.log($(this));
        var customerEl = $("select.customer-id");
        setTimeout(function(e) {
            customerEl.focus();
            customerEl.select2('open');
        }, 500)

    })
    $("#clear-customer").on("click", function(e) {
        e.preventDefault();
        $(".customer-id").val(null).trigger('change');
        $(".customer-id").trigger('select2:clear');
    })
    $(".customer-id").select2({
        placeholder: "Pilih Customer",
        dataAdapter: customAdapterCustomer,
        // minimumInputLength : 1,
        // templateSelection: optionFormatResult,
        dropdownParent: $(".select2-dropdown-prod"),
        dropdownAutoWidth: false,
        templateResult: optionFormatCustomer,
        scrollAfterSelect: true,
        allowClear: true,
        dropdownAutoWidth: false,
    }).on("select2:select", function(e) {
        var dataParams = e.params.data;
        selectedCustomer = dataParams;
        console.log("select custr",selectedCustomer);
        $("#clear-customer").show();
        $(".customer-name-dummy").val(selectedCustomer.name);
        $("#kt_drawer_add_customer_toggle").html('<i class="fa fa-edit"></i>');
        $("#kt_drawer_add_customer_toggle").removeClass('btn-primary').addClass('btn-info');
        setTimeout(function() {
            $(`.table-cart tbody tr:last .unit-qty`).focus();
        }, 100);
    }).on("select2:clear", function(e) {
        selectedCustomer = null;
        $("#clear-customer").hide();
        $(".customer-name-dummy").val("UMUM");
        $("#kt_drawer_add_customer_toggle").html('<i class="fa fa-plus"></i>');
        $("#kt_drawer_add_customer_toggle").removeClass('btn-info').addClass('btn-primary');
    }).on("select2:close", function(e) {
        $(".select2-dropdown-prod").removeClass("select2-dropdown-prod-fixed")
    }).on("select2:opening", function(e) {
        $("select.select2-hidden-accessible:not(#customer-id)").select2('close');
        $(".select2-dropdown-prod").addClass("select2-dropdown-prod-fixed");
        // console.log(dataSelectKeyFocus);
    })

    var drawerCusEl = document.querySelector("div#kt_drawer_add_customer");
    var drawerCust = KTDrawer.getInstance(drawerCusEl);
    drawerCust.on("kt.drawer.show", function() {
        console.log(selectedCustomer);
        if (selectedCustomer != null) {
            $("#drawer-customer-id").val(selectedCustomer.id);
            $("#customer-name").val(selectedCustomer.name);
            $("#customer-phone").val(selectedCustomer.phone);
            $("#customer-address").val(selectedCustomer.address);
            $("#customer-verified-customer").val(selectedCustomer.verified_customer ? "1" : "0");
        }
    });
    drawerCust.on("kt.drawer.hide", function() {
        $("#drawer-customer-id").val("");
        $("#customer-name").val("");
        $("#customer-phone").val("");
        $("#customer-address").val("");
        $("#customer-verified-customer").val("0");
    });;

    $("body").on("click", ".kt_submit_add_customer", function(e) {
        e.preventDefault()
        var btn = this;
        var formCustomer = document.querySelector('#customer-form');;
        btn.disabled = true;
        Swal.fire({
            text: "Harap Menunggu Menyimpan Data!",
            allowOutsideClick: false,
            allowEscapeKey: false,
            icon: "info",
            buttonsStyling: false,
            showConfirmButton: false,
            customClass: {
                confirmButton: "btn btn-primary"
            }
        });
        var formData = new FormData(formCustomer);
        axios.post(`${formCustomer.getAttribute("action")}`, formData, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json;charset=UTF-8',
                // "Access-Control-Allow-Origin": "*",
                accept: 'application/json',
            }
        }).then(function(response) {
            btn.disabled = false;
            if (response.data.code == 200) {
                Swal.close()

                toastr.success("Customer berhasil disimpan");
                var newOption = new Option(response.data.record.name, response.data.record.id, true, true);
                $('select.customer-id').append(newOption).trigger('change');
                formCustomer.reset();
                drawerCust.hide();
                selectedCustomer = response.data.record;
                // if(selectedCustomer == null){
                //     selectedCustomer = {};
                // }
                // selectedCustomer.id = response.data.record.id;
                // selectedCustomer.name = response.data.record.name;
                // selectedCustomer.phone = response.data.record.phone;
                // selectedCustomer.address = response.data.record.address;
                $("#clear-customer").show();
                $(".customer-name-dummy").val(selectedCustomer.name);
                $("#kt_drawer_add_customer_toggle").html('<i class="fa fa-edit"></i>');
                $("#kt_drawer_add_customer_toggle").removeClass('btn-primary').addClass('btn-info');

                setTimeout(function() {
                    $(`.table-cart tbody tr:last .unit-qty`).focus();
                }, 100);
            } else {
                Swal.fire({
                    text: response.data.message,
                    icon: "error",
                    buttonsStyling: false,
                    confirmButtonText: "OK",
                    customClass: {
                        confirmButton: "btn btn-primary"
                    }
                });
            }
        }).catch(function(error) {
            console.log(error)
            btn.disabled = false;
            Swal.fire({
                text: "ERRROR SEND CUSTOMER",
                icon: "error",
                buttonsStyling: false,
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: "btn btn-primary"
                }
            });
        });
        return false;
    })


    //INIT ON FIRST LOAD//
    getDataProducts();
    getDataCustomers();
    setTimeout(function() {
        $(".unit-qty").focus();
    }, 100)

    $(".unit-qty").number(true, 2);
    $(".unit-subtotal").number(true, 0);
    $(".unit-discount").number(true, 0);
    $(".unit-price-origin").number(true, 2);
    initProd($("select.prod-id"));
    // initUnitName($("select.unit-name"), []);
    // initUnitPrice($("select.unit-price"), null);
    //END INIT

    $("body").on("click", ".btn-reprint", function(e) {
        e.preventDefault();
        var dataId = $(this).data("id");
        var dataType = $(this).data("type");
        printStruk(dataId,dataType);
    })

    $("body").on("click",".btn-copy", async function(e){
        e.preventDefault();
        var thisData = $(this).data();
        var url = `${jsonUrl}${$(this).attr('href')}`;
        var textCopied = `HALO *${thisData.custName}*,\nNO TRANSAKSI : ${thisData.trxCode}\nTGL TRANSAKSI : ${thisData.trxDate} \nTOTAL : *${thisData.trxAmount}*\nTERIMAKASIH TELAH BERBELANJA.\nKLIK LINK DIBAWAH UNTUK MELIHAT STRUK\n${url}`;
        try {
            await navigator.clipboard.writeText(textCopied);
            showToast("Whats App Berhasil Di Salin.");
        } catch (err) {
            console.warn('Failed to copy: ', err);
        }

    });

    $("body").on("click",".btn-send-wa-driver", async function(e){
        e.preventDefault();
        
            // Get the text fieldx
        var thisData = $(this).data();
        // var url = `${jsonUrl}${$(this).attr('href')}`;
        var url = `https://www.google.com/maps/search/?api=1&query=${thisData.custAddrLat}%2C${thisData.custAddrLng}`;
        var waTextString = `HALO *${thisData.driverName}*,\n\n*PENGIRIMAN PEMESANAN*\n\nNO TRANSAKSI : ${thisData.trxCode}\nCustomer : ${thisData.custName}\nNO.HP : ${thisData.phone}\nTGL TRANSAKSI : ${thisData.trxDate}\n--------------------------\nPENERIMA : ${thisData.custAddrReceipt}\nALAMAT : *${thisData.custAddrName}*\n${thisData.custAddress}\n*${thisData.custAddrDesc}*\n------------------------\nONGKIR : *${thisData.rateCost}*\n------------------------\n${url}`;
    try {
        await navigator.clipboard.writeText(waTextString);
        showToast("Whats App Berhasil Di Salin.");
        // toastr.success("Whats App Berhasil Di Salin.");
        // console.log('Content copied to clipboard');
        /* Resolved - text copied to clipboard successfully */
    } catch (err) {
        console.warn('Failed to copy: ', err);
        /* Rejected - text failed to copy to the clipboard */
    }

    });

    $("body").on("click", ".btn-send-wa", function(e) {
        e.preventDefault();
        var url = $(this).attr('href');
        var thisData = $(this).data();
        var waTextString = `HALO *${thisData.custName}*,\nNO TRANSAKSI : ${thisData.trxCode}\nTGL TRANSAKSI : ${thisData.trxDate} \nTOTAL : *${thisData.trxAmount}*\nTERIMAKASIH TELAH BERBELANJA.\nKLIK LINK DIBAWAH UNTUK MELIHAT STRUK\n${url}
        `;
        var phoneNumber = thisData.phone;
        var formData = new FormData;
        formData.append("phone_number", phoneNumber);
        formData.append("cust_name", thisData.custName);
        formData.append("trx_code", thisData.trxCode);
        formData.append("trx_date", thisData.trxDate);
        formData.append("trx_amount", thisData.trxAmount);
        formData.append("trx_id", thisData.id);
        axios.post(`${hostUrl}apis/send-wa-notify-order`, formData, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json;charset=UTF-8',
                // "Access-Control-Allow-Origin": "*",
                accept: 'application/json',
                // "timeout": 5000,
            }
        }).then(function(response) {
            if (response.status == 200) {
                var drawerEl = document.querySelector("#kt_drawer_search_trx");
                var drawer = KTDrawer.getInstance(drawerEl);
                drawer.hide();
                showToast("Notifikasi Whats App Berhasil Dikirim.");
                // toastr.success("Notifikasi Whats App Berhasil Dikirim.");
                // console.log("WA SEND SUCCESS");
            }
        }).catch(function(error) {
            showToast("Notifikasi Whats App Gagal Dikirim.");
            // toastr.error("Notifikasi Whats App Gagal Dikirim");
            console.warn("Notifikasi Whats App Gagal Dikirim")
        });
        // var waUrl = `https://wa.me/${phoneNumber}?text=${encodeURI(waTextString)}`;
        // var winOp = window.open(waUrl,"_blank","width=100,height=100,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,left=0,top=0");
        // setTimeout (winOp.close, 3000);
    });
    $("body").on("click", ".btn-edit-sale", function(e) {
        e.preventDefault();
        //GET DATA TO EDIT//
        var url = $(this).attr('href');
        axios.get(`${url}`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json;charset=UTF-8',
                // "Access-Control-Allow-Origin": "*",
                accept: 'application/json',
                // "timeout": 3000,
            }
        }).then(function(response) {
            if (response.status == 200) {
                resetForm();;
                var record = response.data.record;
                // console.log(record);
                if (record.customer != null) {
                    
                    var newOption = new Option(response.data.record.name, response.data.record.customer_id, true, true);
                    $('select.customer-id').append(newOption).trigger('change');
                    $("#customer-name-dummy").val(record.customer.name);
                    selectedCustomer = record.customer;
                    $("#kt_drawer_add_customer_toggle").html('<i class="fa fa-edit"></i>');
                    $("#kt_drawer_add_customer_toggle").removeClass('btn-primary').addClass('btn-info');
                    $("#clear-customer").show();
                } else {
                    $("select.customer-id").val(null).trigger('change');
                    $("select.customer-id").trigger('select2:clear');
                }
                var salesDetails = record.sales_details;
                keyUnit = 0;
                dtCart.clear().draw();
                // console.log(salesDetails);
                var salesDetailsLength = salesDetails.length - 1;
                $.each(salesDetails, function(index, item) {
                    var newUnit = addUnitTr(keyUnit, item);

                    keyUnit++;
                })
                addUnitTr(keyUnit);
                $(".debt").val(record.debt)
                $(".id-sales").val(record.id)
                $(".cash").val(record.cash)
                $(".return-cash").val(record.return_cash);
                $(".subtotal").val(record.subtotal);
                $(".subtotal-cost").val(record.subtotal_cost);
                $(".subtotal-margin").val(record.subtotal_margin);
                $(".subtotal-origin").val(record.subtotal_origin);
                $(".subtotal-discount").val(record.subtotal_discount);
                $(".grandtotal").val(record.total_amount);
                $(".rate-cost").val(record.rate_cost);
                $("select#driver-id").val(record.driver_id).trigger('change');;
                $(".span-grandtotal").html(Utils.numberLabelFormat(record.total_amount));
                $("select#shipping-method").val(record.shipping_method).trigger('change');

                $("#status_process").val(record.status_process);
                $("#status_payment").val(record.status_payment);
                $("#payment_method").val(record.payment_method);

                var drawerEl = document.querySelector("#kt_drawer_search_trx");
                var drawer = KTDrawer.getInstance(drawerEl);
                drawer.hide();
            }
        }).catch(function(error) {
            console.warn(error)
        });
    })
    $("body").on("change", "#printerName", function(e) {
        var val = $(this).val();
        localStorage.setItem("printerName", val);

    });

});