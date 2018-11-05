$(function(){
    $('#getPrivateKey').click(function(){
        $.get('index/getNewPrivateKey', function(data, status, xhr){
            var pk = data.privateKey;
            var add = data.address;
            $('#getPKPrivateKey').val(pk);
            $('#getPKPublicAddress').val(add);
        }, "json")
    });

    $('#getTokens').click(function(){
        console.log("called mommy");
    });

    $('#getTokenBalance').click(function(){
        console.log("called baby");
    });
});