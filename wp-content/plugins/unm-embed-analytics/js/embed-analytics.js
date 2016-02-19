jQuery(function($){
    $('input[name="date_range"]').daterangepicker({
        datepickerOptions : {
            numberOfMonths : 2,
            changeYear: true
        },
        onChange: function(){
            $('#embed-analytics').submit();
        }
    });
});