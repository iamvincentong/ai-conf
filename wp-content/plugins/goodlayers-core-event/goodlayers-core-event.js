/* start page builder */
(function($){
	"use strict";

	var gdlr_core_event = function(event_item){

		this.event_item = event_item;
		this.ajax_url = event_item.attr('data-ajax-url');
		this.ajax_settings = event_item.data('value');
		this.category = '';
		this.room = '';

		this.init();

		if( event_item.is('.gdlr-core-style-multi-date, .gdlr-core-style-multi-room') ){
			this.event_table = event_item.find('.gdlr-core-event-table-wrap');
			this.event_nav = this.event_table.siblings('.gdlr-core-event-table-nav');
			this.event_controls = this.event_table.siblings('.gdlr-core-event-table-controls');
			if( this.event_nav.length || this.event_controls.length ){
				this.set_event_table();
			}
		}
		
	}
	gdlr_core_event.prototype = {

		init: function(){

			var t = this;

			t.event_item.find('.gdlr-core-event-g-category .gdlr-core-item.gdlr-core-active').each(function(){
				t.category = $(this).data('value');
			});
			t.event_item.on('click', '.gdlr-core-event-g-category .gdlr-core-item', function(){
				if( t.event_item.hasClass('gdlr-now-loading') ) return; 
				
				$(this).addClass('gdlr-core-active').siblings().removeClass('gdlr-core-active');
				t.event_item.addClass('gdlr-now-loading');

				t.category = $(this).data('value');
				t.room = '';

				var item_holder = $(this).closest('.gdlr-core-event-g-category').siblings('.gdlr-core-event-g-holder');
				t.get_ajax('category', item_holder);
			});
			t.event_item.on('click', '.gdlr-core-event-g-room .gdlr-core-item', function(){
				if( t.event_item.hasClass('gdlr-now-loading') ) return; 
				
				$(this).addClass('gdlr-core-active').siblings().removeClass('gdlr-core-active');
				t.event_item.addClass('gdlr-now-loading');

				t.room = $(this).data('value');

				var item_holder = $(this).closest('.gdlr-core-event-g-room').siblings('.gdlr-core-event-g-holder');
				t.get_ajax('room', item_holder);
			});

		},

		get_ajax: function( type, item_holder ){

			var t = this;

			$.ajax({
				type: 'POST',
				url: t.ajax_url,
				data: { 
					'action': 'gdlr_core_event_g_ajax', 
					'type': type,
					'settings': t.ajax_settings, 
					'category': t.category, 
					'room': t.room,
					'mobile-style': item_holder.hasClass('gdlr-core-mobile')? 1: 0
				},
				dataType: 'json',
				beforeSend: function(jqXHR, settings){

					//var item_holder = t.event_item.find('.gdlr-core-event-g-holder');
					item_holder.animate({opacity: 0.3});

					if( type == 'category' ){
						var room_filter = t.event_item.find('.gdlr-core-event-g-room');
						room_filter.animate({opacity: 0.3});
					}

				},
				error: function(jqXHR, textStatus, errorThrown){
					console.log(jqXHR, textStatus, errorThrown);
				},
				success: function(data){

					if( data.status == 'success' ){

						if( data.room_filter ){
							var room = $(data.room_filter);
							var room_filter = t.event_item.find('.gdlr-core-event-g-room');
							room_filter.replaceWith(room);
						}

						if( data.content ){
							var content = $(data.content);
							//var item_holder = t.event_item.find('.gdlr-core-event-g-holder');
							item_holder.replaceWith(content);

							new gdlr_core_sync_height(content);

							// refresh 
							t.event_table = content.find('.gdlr-core-event-table-wrap');
							t.event_nav = t.event_table.siblings('.gdlr-core-event-table-nav');
							t.event_controls = t.event_table.siblings('.gdlr-core-event-table-controls');
							if( t.event_nav.length && t.event_controls.length ){
								t.set_event_table();
							}
						}
						
						t.event_item.removeClass('gdlr-now-loading');
					}

				}
			});

		},

		set_event_table: function(){

			var t = this;
			var column_pos = 0;
			var column_size = t.event_table.children('.gdlr-core-event-table-row').children('.gdlr-core-event-table-column').outerWidth();


			var max_col = t.event_nav.attr('data-column');
			t.event_nav.children().on('click', function(){

				if( $(this).is('.gdlr-core-left') ){
					if( column_pos > 0 ){
						column_pos -= 1;
						t.animate_event_table(column_pos, column_size);
					}
				}else if( $(this).is('.gdlr-core-right') ){
					if( column_pos < max_col - 1 ){
						column_pos += 1;
						t.animate_event_table(column_pos, column_size);
					}
				}

			});

			t.event_controls.children().on('click', function(){
				column_pos = $(this).attr('data-pos');
				t.animate_event_table(column_pos, column_size);
			});

			$(window).on('resize', function(){
				column_size = t.event_table.children('.gdlr-core-event-table-row').children('.gdlr-core-event-table-column').outerWidth();
			});
		},

		animate_event_table: function( pos, column_size ){
			var t = this;

			pos = parseInt(pos);

			// animate
			t.event_table.children().animate({ 'margin-left': - (pos * column_size) }, { duration: 400, easing: 'easeOutQuad' });
			
			// set control active
			t.event_controls.find('[data-pos="' + pos + '"]').addClass('gdlr-core-active').siblings().removeClass('gdlr-core-active');

			// set style
			if( typeof(t.event_table_style) == 'undefined' ){
				t.event_table_style = $('<style></style>');
				$('body').append(t.event_table_style);
			}

			var item_id = '#' + t.event_item.attr('id');
			t.event_table_style.html(item_id + ' .gdlr-core-event-table-wrap .gdlr-core-event-table-column{ opacity: 0.2; }');
			for( var i = 0; i < 4; i++ ){
				t.event_table_style.append(item_id + ' .gdlr-core-event-table-wrap .gdlr-core-col-' + (pos + i) + '{ opacity: 1; }');
			}
			

		}

	}

	$(document).ready(function(){
		
		$('.gdlr-core-event-g-item').each(function(){
			new gdlr_core_event($(this));
		});

	});

})(jQuery);