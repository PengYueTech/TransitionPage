;(function($) {
	var f = {
		//当前页面
		currentPage: null,
		//默认配置
		options: {
			name: 'default',//跳转效果名称
			initPage: '#index',
			callback: function() {},//回调操作
			myClass: ''
		},
		/**
		 * 跳转方法
		 * to:目标页面
		 * from:跳转页面
		 */
		init: function(toPageObj, fromPage) {
			var $toPageObj = $(toPageObj);
			var to = $toPageObj.attr('href');
			//...
			if ($toPageObj.is('[data-ajax]')) {//异步加载内容
				this._loadToPage($toPageObj);
			}
			this._animationend(to);
			this._animationend(fromPage);
			this._transition(this.options.name, to, fromPage);
			return to;
		},
		//转场动画
		_transition: function(name, to, from) {
			$('div'+from).addClass(name + ' out');
			$('div'+to).addClass(name + ' in');
			$('div'+to).addClass('show');
			setTimeout(function() {
				$('div'+to).removeClass('hide');
			}, 0);
		},
		// 加载页面
		_loadToPage : function($pageObj) {
			if (!$pageObj.is('[get]')) {
				var html = this._urlLoadContent($pageObj.attr('data-ajax'));
				$('script' + $pageObj.attr('href')).html(html);
				$pageObj.attr('get', 1);
			}
		},
		// 通过url加载html内容
		_urlLoadContent : function(url) {
			var content = '';
			$.ajax( {
				url : url,
				type : 'GET',
				dataType : 'html',
				async : false,
				cache: false,
				success : function(html, textStatus, xhr) {
					content = html;
				},
				error : function(xhr, textStatus, errorThrown) {
					content = '';
				}
			});
			return content;
		},
		//渲染DOM结构
		_rander : function(page) {
			var $obj = $('div'+page);
			if (!$obj.length) {
				$obj = $($(page).html().replace(/script_x/g, 'script'));
				$obj.attr('id', page.slice(1));
				$(page).after($obj).remove();
			}
			return $obj;
		},
		// 绑定动画结束后事件
		_animationend : function(page) {
			var $page = this._rander(page);
			// 解绑事件
			$page.off('animationend webkitAnimationEnd mozAnimationEnd');
			// 绑定事件
			$page.one('animationend webkitAnimationEnd mozAnimationEnd', function(e) {
				if ($(this).hasClass('in')) {
					$(this).removeClass();
					$(this).addClass('ui-mobile-viewport-transitioning ui-page'+' '+f.options.myClass);
				} else {
					$(this).removeClass();
					$(this).addClass('ui-mobile-viewport-transitioning ui-page hide');
				}
			});
		}
	};
	//过度动画
	$.fn.goTo = function(options) {
		f.options = $.extend(f.options, options);
		//当前页面
		f.currentPage = f.options.initPage;
		//过度监听
		this.each(function() {
			$(this).on('click', function(event, callback) {
				var from = f.currentPage;
				to = f.init($(this), from);
				$(this).attr('href', to);
				// console.log(from+'->'+to);
				f.currentPage = to;
				//回调操作
				if ($.type(callback) == 'function') {
					callback();
				} else if ($.type(f.options.callback) == 'function') {
					f.options.callback();
				}
				return false;
			});
		});
		//监听手势动作
		var currentIndex = 0;
		var $aObj = $(this);
		$('body')
			.on('swipeUp', function() {
				if (currentIndex == $aObj.length - 1) {
					currentIndex = 0;
				} else {
					currentIndex++;
				}
				// console.log(currentIndex);
				$aObj.eq(currentIndex).trigger('click', function() {});
				return false;
			})
			.on('swipeDown', function() {
				if (currentIndex == 0) {
					currentIndex = $aObj.length - 1;
				} else {
					currentIndex--;
				}
				// console.log(currentIndex);
				$aObj.eq(currentIndex).trigger('click', function() {});
				return false;
			})
		;
		//初始化加载
		$(this).filter('[href="' + f.currentPage + '"]').trigger('click', function() {});
	};
})(Zepto);