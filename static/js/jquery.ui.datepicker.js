$(function() {
	$('body').on('submit','.ajax-form',function(evento){
        var form = $(this);
        var btn = $(evento.target).find('.submit-btn');
        if( form.data('triggerer') ){
            btn = form.data('triggerer');
        }
        var textBtn = '';
        evento.preventDefault();
        var context = window;
        var func = null;
        var callback = form.attr("callback");
        if(callback){
            var namespaces = callback.split(".");
            func = namespaces.pop();
            for(var i = 0; i < namespaces.length; i++) {
              context = context[namespaces[i]];
            }
        }

        var modal = form.closest(".modal");
        if( btn.length && !btn.find('.btn-spinning').length ){
            btn.addClass('disabled').prop('disabled', 'disabled');
            if(btn.hasClass('only-spinner')){
                textBtn = btn.html();
                btn.html('<i class="fa fa-cog fa-spin btn-spinning"></i>');
            }
            else{
                btn.prepend('<i class="fa fa-cog fa-spin btn-spinning"></i> ');
            }
        }
        var options = {
            success:       function(data, statusText, xhr, $form){
                btn.find('.btn-spinning').remove();
                if(textBtn){
                    btn.html(textBtn);
                }
                if( data.errors && data.errors.fields ){
                    var exists_all = false;
                    for ( var prop in data.errors.fields ) {
                            var exists = false;
                            var id = data.errors.prefix + '_' + prop;
                            var fieldErrors = '';
                            var all_errors = data.errors.fields[prop];
                            $.each(all_errors, function(i, errorText){
                                exists = true;
                                exists_all = true;
                                fieldErrors += '<div class="error">'+errorText+'</div>';
                            });
                            if(exists){
                                var field = $('#'+id);
                                if(field.parent('.input-group').length){
                                    $(fieldErrors).insertAfter(field.parent('.input-group'));
                                }
                                else{
                                    $(fieldErrors).insertAfter(field);
                                }
                            }
                    }
                    if(exists_all){
                        return;
                    }
                }
                btn.removeClass('disabled').removeAttr('disabled');
                if(modal.length && !form.hasClass('keep-modal')){
                    modal.modal('hide');
                    modal.one('hidden.bs.modal', function (event) {
                        form.trigger('form.success',[data,statusText]);

                        if(func && typeof context[func] === 'function') {
                            setTimeout(function(){
                                context[func].apply(context,new Array(data,'success',form));
                            }, 300);
                        }
                    });
                }
                else{
                    if(func && typeof context[func] === 'function') {
                        context[func].apply(context,new Array(data,'success',form));
                    }
                }
            },
            error : function(){
                console.log('throw error ajax form');
            },
            dataType: ( !!form.attr('datatype') ? form.attr('datatype') : 'json'),
            resetForm: ( !!form.attr('reset') ? true : false),
            data    : ( !!form.data('extra') ? form.data('extra'): '')
            // other available options:
            //url:       url         // override for form's 'action' attribute
            //type:      type        // 'get' or 'post', override for form's 'method' attribute
            //dataType:  null        // 'xml', 'script', or 'json' (expected server response type)
            //clearForm: true        // clear all form fields after successful submit
            //        // reset the form after successful submit

            // $.ajax options can be used here too, for example:
            //timeout:   3000
        };
        ajax_global_form = form.ajaxSubmit(options);
        // return false to prevent normal browser submit and page navigation
        return false;
    });
});