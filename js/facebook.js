if(isFirefoxOS){
	window.fbAsyncInit = function() {
		FB.init({
			appId      : '492072877534695',
			channelUrl : '//vaichover.adrielcafe.com/channel.php',
			status     : true,
			cookie     : true,
			xfbml      : false
		});
	};

	(function(d, s, id){
	 	var js, fjs = d.getElementsByTagName(s)[0];
	    if (d.getElementById(id)) {return;}
	    js = d.createElement(s); js.id = id;
	    js.src = "//connect.facebook.net/en_US/all.js";
	    fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));
}

function fbLogin(callback, msgToPost){
	FB.login(function(response) {
		if (response.authResponse) {
			FB.api('/me', function(response) {
				if(callback)
					callback(msgToPost);
				return true;
			});
		} else
			return false;
	}, {scope: 'publish_stream'});
}

function fbNewAlert(msg){
	$.mobile.loading('show');

	FB.getLoginStatus(function(response){
		if(response.authResponse && response.status == 'connected')
			fbPost(msg);
		else
			fbLogin(fbPost, msg);
	});
	
	$.mobile.loading('hide');
}

function fbPost(msg){
	FB.api('/me/feed', 'post', {
		message: msg, 
		link: 'http://vaichover.adrielcafe.com', 
		picture: 'http://vaichover.adrielcafe.com/images/icon_128.png' 
	}, function(response) {
		if (!response || response.error)
		 	showMessage("Não foi possível conectar com o Facebook");
		else
 			showMessage("Alerta compartilhado com sucesso!");
	});
}