function defaultFromPoster() {
    var form = $(this);
    $('.alert', form).hide();
    $(":submit", form).button("loading");

    $.ajax({
        url: form.attr("action"),
        method: "POST",
        data: form.serialize(),
        complete: function() {
            $(":submit", form).button("reset");
        },
        success: function(data) {
            if (data.userId)
                window.location.href = "/your";
            else
                window.location.href = "/";
        },
        error: function(jqXHR) {
            var error = JSON.parse(jqXHR.responseText);
            $('.alert', form).html(error.message).show();
        }
    });
    return false;
}

$(document.forms['formLogin']).on('submit', defaultFromPoster);
$(document.forms['formLogout']).on('submit', defaultFromPoster);
$(document.forms['formRegister']).on('submit', defaultFromPoster);