基于浏览器的缓存策略（browser-storage）
==========================

### 简介
```javascript
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
	 */
 ```

### 详细api文档
http://www.baidufe.com/component/browser-storage/index.html