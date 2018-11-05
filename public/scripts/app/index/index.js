$(function(){
    $('#getPrivateKey').click(function(){
        $.get('index/getNewPrivateKey', function(data, status, xhr){
            var pk = data.privateKey;
            var add = data.address;
            $('#getPKPrivateKey').val(pk);
            $('#getPKPublicAddress').val(add);
        }, "json");
    });

    $('#getTokens').click(function(){
        var add = $('#getTokenAddress').val().trim();
        var amount = $('#getTokenAmount').val().trim();
        $.post('index/transferTokensTo', {address: add, amount: amount}, function(data, status, xhr){
            var txHash = data.transactionHash;
            var html = '<a target="_blank" href="https://ropsten.etherscan.io/tx/' + txHash + '">View in Etherscan: ' + txHash + '</a>'
            $('#transactionEtherscanLink').html(html);
        }, 'json');
    });

    $('#getTokenBalance').click(function(){
        var add = $('#checkBalanceAddress').val().trim();
        //console.log(add);
        $.post('index/tokenBalance', {
            address: add
        }, function(data, status, xhr){
            var balance = data.balance;
            //console.log(balance);
            $('#checkBalanceBalance').val(balance);
        }, "json");
    });
});