/**
 * Dynamic resizing for VW and VH units in [style] attributes
 * @author  Ryan Boylett <http://boylett.uk/>
 * @version 0.0.2
 */

;(function()
{
	if(!jQuery)
	{
		throw new Error('jQuery not found');
	}

	var width    = window.innerWidth || 0,
		height   = window.innerHeight || 0,
		elements = [],
		ready    = false,
		refresh  = function()
		{
			for(var i = 0; i < elements.length; i ++)
			{
				if(elements[i] && elements[i].el.length > 0)
				{
					elements[i].el.css(elements[i].rule, (((elements[i].unit == 'vw') ? width : height) * (elements[i].scale / 100)) + 'px');
				}
			}
		},
		recalculate = function()
		{
			var new_width  = window.innerWidth || jQuery(window).width();
				new_height = window.innerHeight || jQuery(window).height();

			if(!ready || new_width != width || new_height != height)
			{
				ready  = true;
				width  = new_width;
				height = new_height;

				refresh();
			}
		};

	jQuery.fn.addDynamicViewport = function(rule, scale)
	{
		var unit = scale.match(/(vw|vh)/i) || [];
			unit = (unit.length > 0) ? unit[1].toLowerCase() : 'vw';

		return $(this).each(function()
		{
			elements.push(
			{
				el:    $(this),
				rule:  rule,
				scale: parseFloat(scale),
				unit:  unit
			});
		});
	};

	jQuery.fn.removeDynamicViewport = function(rule, scale)
	{
		var unit = undefined;

		if(scale !== undefined)
		{
			unit = scale.match(/(vw|vh)/i) || [];
			unit = (unit.length > 0) ? unit[1].toLowerCase() : 'vw';
		}

		return $(this).each(function()
		{
			for(var i = 0; i < elements.length; i ++)
			{
				if(elements[i].el.is(this))
				{
					if((unit !== undefined && unit !== elements[i].unit) || (scale !== undefined && scale !== elements[i].scale) || (rule !== undefined && rule !== elements[i].rule))
					{
						continue;
					}

					delete elements[i];
				}
			}
		});
	};

	jQuery(function($)
	{
		$(window).on('orientationchange resize', recalculate);
		$(document).on('scroll', recalculate);

		var regex_strings = /("|')([^\1]+)\1/g,
			regex_props   = /^\s?(.*):\s?(-?([0-9]+(\.[0-9]+)?)(vw|vh))\s?$/i;

		$('*[style*="vw"], *[style*="vh"]').each(function()
		{
			var element = $(this),
				styles  = {};

			styles = (element.attr('style') || '')
				.replace(regex_strings, '')
				.split(';');

			for(var i = 0; i < styles.length; i ++)
			{
				if(styles[i].match(regex_props))
				{
					var rule_prop = styles[i]
							.replace(regex_props, '$1\n$2')
							.split('\n');

					element.addDynamicViewport(rule_prop[0], rule_prop[1]);
				}
			}
		});

		refresh();
	});
})();
