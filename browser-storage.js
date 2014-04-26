/**
 * 全浏览器支持的本地存储方案：browser-storage.js
 *
 * @detail
 * 1、支持HTML5的浏览器，采用原生localStorage进行存储
 * 2、IE7及其以下版本，采用UserData进行存储
 * 3、在以上两种都不支持的浏览器中，采用cookie进行存储
 *
 * @API
 * 1、BrowserStorage.api.setUserDataEnabled //设置IE中是否采用UserData存储
 * 2、BrowserStorage.api.set //设置本地存储
 * 3、BrowserStorage.api.get //获取本地存储
 * 4、BrowserStorage.api.remove //移除本地存储
 * 5、BrowserStorage.api.clearAll //清空所有本地存储
 * 6、BrowserStorage.api.getAllKeys //获取所有本地存储的key
 *
 * @homepage    http://www.baidufe.com/component/browser-storage/index.html
 * @author zhaoxianlie (xianliezhao@foxmail.com)
 */
var BrowserStorage = window.BrowserStorage || {
    version : '1.1'
};

/**
 * ====================================================================
 * window.localStorage的相关处理
 *
 * 1、存储一个内容到本地
 * 2、读取一个本地存储
 * 3、移除一个本地存储
 * 4、移除全部本地存储
 * 5、获取所有本地存储的key
 * ====================================================================
 */
BrowserStorage.localStorage = (function(){

    /**
     * 将数据进行本地存储（只能存储字符串信息）
     */
    function _set(storageInfo){
        //待存储的数据
        var storageInfo = storageInfo || {};
        window.localStorage.setItem(storageInfo.key,storageInfo.value);

        // 如果指定了生命周期，则单独作为一个key来存储
        if(storageInfo.expires) {
            var expires;
            //如果设置项里的expires为数字，则表示数据的能存活的毫秒数
            if ('number' == typeof storageInfo.expires) {
                expires = new Date();
                expires.setTime(expires.getTime() + storageInfo.expires);
            }

            window.localStorage.setItem(storageInfo.key + ".expires",expires);
        }
    }

    /**
     * 提取本地存储的数据
     */
    function _get(config){
        //结果
        var result = null;
        if(typeof config === "string") config = {key : config};

        result = window.localStorage.getItem(config.key);
        //过期时间判断，如果过期了，则移除该项
        if(result) {
            var expires = window.localStorage.getItem(config.key + ".expires");
            result = {
                value : result,
                expires : expires ? new Date(expires) : null
            };
            if(result && result.expires && result.expires < new Date()) {
                result = null;
                window.localStorage.removeItem(config.key);
                window.localStorage.removeItem(config.key + ".expires");
            }
        }
        return result ? result.value : null;
    }

    /**
     * 移除某一项本地存储的数据
     */
    function _remove(config){
        window.localStorage.removeItem(config.key);
        window.localStorage.removeItem(config.key + ".expires");
    }

    /**
     * 清除所有本地存储的数据
     */
    function _clearAll(){
        window.localStorage.clear();
    }

    /**
     * 获取所有的本地存储数据对应的key
     */
    function _getAllKeys(){
        var result = [],key;
        for(var i = 0,len = window.localStorage.length;i < len;i++){
            key = window.localStorage.key(i);
            if(!/.+\.expires$/.test(key)) {
                result.push(key);
            }
        }
        return result;
    }

    return {
        get : _get,
        set : _set,
        remove : _remove,
        clearAll : _clearAll,
        getAllKeys : _getAllKeys
    };
})();


/**
 * ====================================================================
 * userData的相关处理
 *
 * 1、存储一个内容到本地
 * 2、读取一个本地存储
 * 3、移除一个本地存储
 * 4、移除全部本地存储
 * 5、获取所有本地存储的key
 * ====================================================================
 */
BrowserStorage.userData = (function(){

    //所有的key
    var _clearAllKey = "_baidu.ALL.KEY_";

    /**
     * 创建并获取这个input:hidden实例
     * @return {HTMLInputElement} input:hidden实例
     * @private
     */
    function _getInstance(){
        //把UserData绑定到input:hidden上
        var _input = null;
        //是的，不要惊讶，这里每次都会创建一个input:hidden并增加到DOM树种
        //目的是避免数据被重复写入，提早造成“磁盘空间写满”的Exception
        _input = document.createElement("input");
        _input.type = "hidden";
        _input.addBehavior("#default#userData");
        document.body.appendChild(_input);
        return _input;
    }

    /**
     * 将数据通过UserData的方式保存到本地，文件名为：文件名为：config.key[1].xml
     * @param {Object} config 待存储数据相关配置
     * @cofnig {String} key 待存储数据的key
     * @config {String} value 待存储数据的内容
     * @config {String|Object} [expires] 数据的过期时间，可以是数字，单位是毫秒；也可以是日期对象，表示过期时间
     * @private
     */
    function __setItem(config){
        try {
            var input = _getInstance();
            //创建一个Storage对象
            var storageInfo = config || {};
            //设置过期时间
            if(storageInfo.expires) {
                var expires;
                //如果设置项里的expires为数字，则表示数据的能存活的毫秒数
                if ('number' == typeof storageInfo.expires) {
                    expires = new Date();
                    expires.setTime(expires.getTime() + storageInfo.expires);
                }
                input.expires = expires.toUTCString();
            }

            //存储数据
            input.setAttribute(storageInfo.key,storageInfo.value);
            //存储到本地文件，文件名为：storageInfo.key[1].xml
            input.save(storageInfo.key);
        } catch (e) {
        }
    }

    /**
     * 将数据通过UserData的方式保存到本地，文件名为：文件名为：config.key[1].xml
     * @param {Object} config 待存储数据相关配置
     * @cofnig {String} key 待存储数据的key
     * @config {String} value 待存储数据的内容
     * @config {String|Object} [expires] 数据的过期时间，可以是数字，单位是毫秒；也可以是日期对象，表示过期时间
     * @private
     */
    function _set(config){
        //保存有效内容
        __setItem(config);

        //下面的代码用来记录当前保存的key，便于以后clearAll
        var result = _get({key : _clearAllKey});
        if(result) {
            result = { key : _clearAllKey, value : result };
        } else {
            result = { key : _clearAllKey, value : "" };
        }

        if(!(new RegExp("(^|\\|)" + config.key + "(\\||$)",'g')).test(result.value)) {
            result.value += "|" + config.key;
            //保存键
            __setItem(result);
        }
    }

    /**
     * 提取本地存储的数据
     * @param {String} config 待获取的存储数据相关配置
     * @cofnig {String} key 待获取的数据的key
     * @return {String} 本地存储的数据，获取不到时返回null
     * @example
     * qext.LocalStorage.get({
     *      key : "username"
     * });
     * @private
     */
    function _get(config){
        try {
            var input = _getInstance();
            //载入本地文件，文件名为：config.key[1].xml
            input.load(config.key);
            //取得数据
            return input.getAttribute(config.key) || null;
        } catch (e) {
            return null;
        }
    }

    /**
     * 移除某项存储数据
     * @param {Object} config 配置参数
     * @cofnig {String} key 待存储数据的key
     * @private
     */
    function _remove(config){
        try {
            var input = _getInstance();
            //载入存储区块
            input.load(config.key);
            //移除配置项
            input.removeAttribute(config.key);
            //强制使其过期
            var expires = new Date();
            expires.setTime(expires.getTime() - 1);
            input.expires = expires.toUTCString();
            input.save(config.key);

            //从allkey中删除当前key
            //下面的代码用来记录当前保存的key，便于以后clearAll
            var result = _get({key : _clearAllKey});
            if(result) {
                result = result.replace(new RegExp("(^|\\|)" + config.key + "(\\||$)",'g'),'');
                result = { key : _clearAllKey, value : result };
                //保存键
                __setItem(result);
            }

        } catch (e) {
        }
    }

    //移除所有的本地数据
    function _clearAll(){
        result = _get({key : _clearAllKey});
        if(result) {
            var allKeys = result.split("|");
            var count = allKeys.length;
            for(var i = 0;i < count;i++){
                if(!!allKeys[i]) {
                    _remove({key:allKeys[i]});
                }
            }
        }
    }

    /**
     * 获取所有的本地存储数据对应的key
     * @return {Array} 所有的key
     * @private
     */
    function _getAllKeys(){
        var result = [];
        var keys = _get({key : _clearAllKey});
        if(keys) {
            keys = keys.split('|');
            for(var i = 0,len = keys.length;i < len;i++){
                if(!!keys[i]) {
                    result.push(keys[i]);
                }
            }
        }
        return result ;
    }

    return {
        get : _get,
        set : _set,
        remove : _remove,
        clearAll : _clearAll,
        getAllKeys : _getAllKeys
    };
})();


/**
 * ====================================================================
 * cookie的相关处理
 *
 * 1、存储一个内容到本地
 * 2、读取一个本地存储
 * 3、移除一个本地存储
 * 4、移除全部本地存储
 * 5、获取所有本地存储的key
 * ====================================================================
 */
BrowserStorage.cookie = (function(){
    /**
     * 判断某key是否合法
     * @param key
     * @return {Boolean}
     * @private
     */
    var _isValidKey = function(key) {
        return (new RegExp("^[^\\x00-\\x20\\x7f\\(\\)<>@,;:\\\\\\\"\\[\\]\\?=\\{\\}\\/\\u0080-\\uffff]+\x24")).test(key);
    };

    /**
     * 获取存储在cookie中的内容
     * @param config 存储信息
     * @config key cookie-key
     * @config decode 是否进行decode处理
     * @return {String}
     * @private
     */
    var _get = function(config) {
        var value = null;
        if (_isValidKey(config.key)) {
            var reg = new RegExp("(^| )" + config.key + "=([^;\/]*)([^;\x24]*)(;|\x24)"), result = reg.exec(document.cookie);

            if (result) {
                value = result[2] || null;
            }
        }
        if (('string' == typeof value) && config.decode != false) {
            value = decodeURIComponent(value);
            return value;
        }
        return null;
    };

    /**
     * 存储cookie
     *
     * @param options {
     *     key : "",
     *     value : "",
     *     path : "",       // 默认存储在当前域名的根目录，如果要设置到每个页面的单独目录，请设置为："./"
     *     domain : "",
     *     expires : Date,
     *     secure : "secure",
     *     encode : true
     * }
     * @private
     */
    var _set = function(config) {
        if (!_isValidKey(config.key)) {
            return;
        }

        config = config || {};
        if(config.encode != false){
            config.value = encodeURIComponent(config.value);
        }

        // 计算cookie过期时间
        var expires = config.expires;
        if(!(expires instanceof Date)) {
            expires = new Date();
            if ('number' == typeof config.expires) {
                expires.setTime(expires.getTime() + config.expires);
            }else{
                // 在没有设置过期时间的情况下，默认：30day
                expires.setTime(expires.getTime() + 86400000*30);
            }
        }

        document.cookie = config.key + "=" + config.value
            + (config.path ? "; path=" + (config.path == './' ? '' : config.path) : "/")
            + ( expires ? "; expires=" + expires.toGMTString() : "")
            + (config.domain ? "; domain=" + config.domain : "")
            + (config.secure ? "; secure" : '');
    };

    /**
     * 移除掉某一个存储
     * @param config
     * @config key
     * @private
     */
    var _remove = function(config){
        var obj = _get(config);
        if(obj != null) {
            config.value = null;
            config.expires = -1;
            _set(config);
        }
    };

    /**
     * 清除掉所有
     * @private
     */
    var _clearAll = function(){
        document.cookie = '';
    };

    /**
     * 获取所有的存储key
     * @private
     */
    var _getAllKeys = function(){
        var keys = [];
        var reg = /(^| )([^=; ]+)=([^;]*)(;|\x24)/igm;
        var localCookies = (document.cookie || '').match(reg);
        if(localCookies) {
            var items;
            for(var i= 0,len=localCookies.length;i<len;i++){
                items = reg.exec(localCookies[i]);
                keys.push(items[2]); //第二项是key，第三项是value
            }
        }
        return keys;
    };

    return {
        get : _get,
        set : _set,
        remove : _remove,
        clearAll : _clearAll,
        getAllKeys : _getAllKeys
    };

})();


BrowserStorage.api = (function(){

    /**
     * 获取浏览器信息
     * @type {Object}
     */
    var _browserInfo = (function(){
        // Figure out what browser is being used
        var userAgent = navigator.userAgent.toLowerCase();
        return {
            version: (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[1],
            safari: /webkit/.test( userAgent ),
            opera: /opera/.test( userAgent ),
            msie: /msie/.test( userAgent ) && !/opera/.test( userAgent ),
            mozilla: /mozilla/.test(userAgent)&&!/(compatible|webkit)/.test(userAgent)
        };
    })();

    /**
     * 判断当前浏览器是否支持本地存储：window.localStorage
     * @return {Boolean} true：支持；false：不支持
     */
    var _isSupportLocalStorage = function(){
        var isSupport = false;
        try{
            // IE 下可能会出现 window.localStorage 拒绝访问的情况
            isSupport = ('localStorage' in window) && (window.localStorage.getItem);
        }catch(e){
            isSupport = false;
        }
        return isSupport;
    };

    /**
     * 判断当前浏览器是否支持userData
     * @type {*}
     * @private
     */
    var _isSupportUserData = function(){
        // 是IE浏览器，并且用户承诺将userData开启
        return _browserInfo.msie;
    };

    /**
     * 验证字符串是否合法的键名
     * @param {Object} key 待验证的key
     * @return {Boolean} true：合法，false：不合法
     * @private
     */
    var _isValidKey = function(key) {
        return (new RegExp("^[^\\x00-\\x20\\x7f\\(\\)<>@,;:\\\\\\\"\\[\\]\\?=\\{\\}\\/\\u0080-\\uffff]+\x24")).test(key);
    };

    /**
     * 将数据进行本地存储（只能存储字符串信息）
     *
     * @example
     * BrowserStorage.api.set({
     * 		key : "username",
     * 		value : "baiduie",
     * 		expires : 3600 * 1000
     * });
     * //保存对个对象
     * BrowserStorage.api.set([{
     * 		key : "username",
     * 		value : "baiduie",
     * 		expires : 3600 * 1000
     * },{
     * 		key : "password",
     * 		value : "zxlie",
     * 		expires : 3600 * 1000
     * }]);
     *
     * @param    {Object/Array} obj     待存储数据相关配置，可以是单个JSON对象，也可以是由多个JSON对象组成的数组
     * @p-config {String}       key     待存储数据的key，如：baidu.username
     * @p-config {String}       value   待存储数据的内容
     * @p-config {String}       path    cookie专用，默认为：根目录："/"，要设置到当前目录，则是："./"
     * @p-config {String}       domain  cookie专用，默认为：当前域名
     * @p-config {Number/Date}  expires 数据的过期时间，可以是数字，单位是毫秒；也可以是日期对象，表示过期时间，
     *                                  如果未设置expires，或设置不合法时，组件会默认将其设置为30天
     * @param    {Boolean} enableUD     参数可选；是否在IE7及其以下版本中启用UserData，默认：false
     */
    var _set = function(obj, enableUD){
        //保存单个对象
        var _set_ = function(config){
            //key校验
            if(!_isValidKey(config.key)) {return;}

            // 计算cookie过期时间
            var expires = config.expires;
            if(!(expires instanceof Date)) {
                expires = new Date();
                if ('number' == typeof config.expires) {
                    expires.setTime(expires.getTime() + config.expires);
                }else{
                    // 在没有设置过期时间的情况下，默认：30day
                    expires.setTime(expires.getTime() + 86400*30);
                }
            }
            config.expires = expires;

            if(_isSupportLocalStorage()) {
                BrowserStorage.localStorage.set(config);
            } else if(_isSupportUserData() && enableUD) {
                BrowserStorage.userData.set(config);
            } else {
                BrowserStorage.cookie.set(config);
            }
        };

        //判断传入的参数是否为数组
        if(obj && obj.constructor === Array && obj instanceof Array){
            for(var i = 0,len = obj.length;i < len;i++){
                _set_(obj[i]);
            }
        }else if(obj){
            _set_(obj);
        }
    };

    /**
     * 提取本地存储的数据
     *
     * @example
     * //获取某一个本地存储，返回值为：{key:"",value:""}，未取到值时，对应value为空
     * var rst = BrowserStorage.api.get({
     * 		key : "username"
     * });
     * //获取多个本地存储，返回值为：[{key:"",value:""},{key:"",value:""}]
     * BrowserStorage.api.get([{
     * 		key : "username"
     * },{
     * 		key : "password"
     * }]);
     *
     * @param    {String/Object/Array} obj  待获取的存储数据相关配置，支持单个对象传入，同样也支持多个对象封装的数组格式
     * @p-config {String}       key         待存储数据的key
     * @param    {Boolean}      enableUD    参数可选；是否在IE7及其以下版本中启用UserData，默认：false
     * @return   {Object/Array}   本地存储的数据，传入为单个对象时，返回单个对象；传入为数组时，返回为数组
     */
    var _get = function(obj, enableUD){
        //获取某一个本地存储
        var _get_ = function(config){
            //结果
            var result = null;
            if(typeof config === "string") config = {key : config};
            //key校验
            if(!_isValidKey(config.key)) {return result;}

            if(_isSupportLocalStorage()) {
                result = BrowserStorage.localStorage.get(config);
            } else if(_isSupportUserData() && enableUD) {
                result =BrowserStorage.userData.get(config);
            } else {
                result =BrowserStorage.cookie.get(config);
            }

            return {key:config.key,value:result} ;
        };

        var rst = null;
        //判断传入的参数是否为数组
        if(obj && obj.constructor === Array && obj instanceof Array){
            rst = [];
            for(var i = 0,len = obj.length;i < len;i++){
                rst.push(_get_(obj[i]));
            }
        }else if(obj){
            rst = _get_(obj);
        }
        return rst;
    };

    /**
     * 移除本地存储的数据
     *
     * @example
     * //删除一个本地存储项
     * BrowserStorage.api.remove({
     * 		key : "username"
     * });
     *
     * BrowserStorage.api.remove("username");
     *
     * //删除多个本地存储项目 *
     * BrowserStorage.api.remove([{
     * 		key : "username"
     * },{
     * 		key : "password"
     * },{
     * 		key : "sex"
     * }]);
     *
     * @param    {String/Object/Array} obj  待移除的存储数据相关配置，支持移除某一个本地存储，也支持数组形式的批量移除
     * @p-config {String}       key         待移除数据的key
     * @p-config {String}       path        cookie专用，默认为：根目录："/"，要设置到当前目录，则是："./"
     * @p-config {String}       domain      cookie专用，默认为：当前域名
     * @param    {Boolean}      enableUD    参数可选；是否在IE7及其以下版本中启用UserData，默认：false
     */
    var _remove = function(obj, enableUD){
        //移除某一项本地存储的数据
        var _remove_ = function(config){

            if(typeof config === "string") config = {key : config};
            //key校验
            if(!_isValidKey(config.key)) {return result;}

            if(_isSupportLocalStorage()) {
                BrowserStorage.localStorage.remove(config);
            } else if(_isSupportUserData() && enableUD) {
                BrowserStorage.userData.remove(config);
            } else {
                BrowserStorage.cookie.remove(config);
            }
        };

        //判断传入的参数是否为数组
        if(obj && obj.constructor === Array && obj instanceof Array){
            for(var i = 0,len = obj.length;i < len;i++){
                _remove_(obj[i]);
            }
        }else if(obj){
            _remove_(obj);
        }
    };

    /**
     * 清除所有本地存储的数据
     *
     * @example
     * BrowserStorage.api.clearAll();
     *
     * @param    {Boolean} enableUD     参数可选；是否在IE7及其以下版本中启用UserData，默认：false
     */
    var _clearAll = function(enableUD){
        if(_isSupportLocalStorage()) {
            BrowserStorage.localStorage.clearAll();
        } else if(_isSupportUserData() && enableUD) {
            BrowserStorage.userData.clearAll();
        } else {
            BrowserStorage.cookie.clearAll();
        }
    };

    /**
     * 获取所有的本地存储数据对应的key
     *
     * @example
     * var keys = BrowserStorage.api.getAllKeys();
     *
     * @param   {Boolean} enableUD  参数可选；是否在IE7及其以下版本中启用UserData，默认：false
     * @return  {Array}             所有的key
     */
    var _getAllKeys = function(enableUD){
        var result = null;

        if(_isSupportLocalStorage()) {
            result = BrowserStorage.localStorage.getAllKeys();
        } else if(_isSupportUserData() && enableUD) {
            result = BrowserStorage.userData.getAllKeys();
        } else {
            result = BrowserStorage.cookie.getAllKeys();
        }

        return result;
    };

    return {
        get : _get,
        set : _set,
        remove : _remove,
        clearAll : _clearAll,
        getAllKeys : _getAllKeys
    };

})();