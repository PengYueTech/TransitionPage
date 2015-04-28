;(function($) {
    var Amour = {
        _getFullpath : function(src) {
			// 如果路径不完整，此处可做处理
            return src;
        },
        loadImage : function(img, src, options) {
            if (!src) return;
            options = options || {};
            var image = new Image(), image_src = Amour._getFullpath(src);
            image.onload = function() {
                img.attr('src', image_src);
                options.success && options.success();
            };
            image.onerror = function() {
                img.attr('src', null);
                options.error && options.error();
            };
            image.src = image_src;
        },
        loadBgImage : function(el, src, options) {
            if (!src) return;
            options = options || {};
            el.css('background-image', 'url(' + '../common/image/loading.gif' + ')');
            var image = new Image(), image_src = Amour._getFullpath(src);
            image.onload = function() {
                el.removeClass('img-loading');
                el.css('background-image', 'url(' + image_src + ')');
                options.success && options.success();
            };
            image.onerror = function() {
                el.removeClass('img-loading');
                el.css('background-image', null);
                options.error && options.error();
            };
            el.addClass('img-loading');
            image.src = image_src;
        },
        loadResources : function() {
            //“1”是为了确保没有图片的情况下也有一次触发的机会
            var count = 1 + $('img[data-src]').length + $('[data-bg-src]').length;
            //所有图片+背景图都加载完成后触发
            var resourceLoad = _.after(count, function() {
                $('body').trigger('ResourcesLoaded');
            });
            resourceLoad();
            $('img[data-src]').each(function() {
                var src = $(this).data('src');
                src && Amour.loadImage($(this), src, {
                    success: resourceLoad, error: resourceLoad
                });
            });
            $('[data-bg-src]').each(function() {
                var src = $(this).data('bg-src');
                src && Amour.loadBgImage($(this), src, {
                    success: resourceLoad, error: resourceLoad
                });
            });
        }
    };
    //APP处理
    var $load = $('.loading-screen');
    $load.find('img[data-src]').each(function() {
        var src = $(this).data('src');
        src && Amour.loadImage($(this), src);
    });
    var o = _.once(function() {
            $('.views-wrapper').removeClass('hidden');
            _.delay(function() {
                $load.animate({
                    opacity: 0
                }, 1e3, function() {
                    $(this).css({
                        opacity: 1
                    }).addClass('hidden')
                });
                if (typeof window.loadCallback == 'function') window.loadCallback();
            }, 500);
        }),
        u = new function() {
            var e = $load.find('.loading-text>span'),
                t = 1,
                r = 200,
                i = this.start = function() {
                    t <= 100 ? (e.text(t++), _.delay(i, r)) : o()
                };
            this.rush = function() {
                r = 10
            }
        };
    _.defer(u.start);
    //监听，当图片都加载完成后，加快“加载百分数”的自增
    $('body').on('ResourcesLoaded', u.rush);
    //加载图片
    Amour.loadResources();
})(window.jQuery || window.Zepto);