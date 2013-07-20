var manifest = 'http://vaichover.adrielcafe.com/manifest.webapp';
var apacService = 'http://www.apac.pe.gov.br/servicos/dados-abertos/avisos-hidrometeorologicos.php';
var lastAlert;

var isMobileBrowser = (function() {
	var check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
	return check; 
})();

// Config
var updateFrequency; // int
var lastAlertNumber; // string
var notify; // bool
var ffosAlarmId; // string

function getConfig(){
	ffosAlarmId = localStorage.ffosAlarmId;
	updateFrequency = isNaN(localStorage.alertaChuva_updateFrequency) ? 240 : parseInt(localStorage.alertaChuva_updateFrequency);
	lastAlertNumber = localStorage.alertaChuva_lastAlertNumber;
	if(localStorage.alertaChuva_notify != "true" && localStorage.alertaChuva_notify != "false"){
		notify = true;
		updateService();
	} else
		notify = localStorage.alertaChuva_notify == 'true' ? true : false;
	
	if(!notify)
		$('#form-cfg #cfg-update-frequency input[type=radio]').each(function() {
		    $(this).prop('disabled', 'disabled');
	  	});
	$("#form-cfg #cfg-notify").prop("checked", notify);
	$('#cfg-update-frequency-' + updateFrequency).prop("checked", true);

	//if(isPhoneGap)
	//	updateServiceConfig();
}

function setConfig(){
	notify = $("#form-cfg #cfg-notify").is(':checked');
	updateFrequency = $("#form-cfg :radio:checked").val();

	localStorage.setItem('alertaChuva_notify', notify);
	localStorage.setItem('alertaChuva_updateFrequency', updateFrequency);
	localStorage.setItem('alertaChuva_lastAlertNumber', lastAlertNumber);
	localStorage.setItem('alertaChuva_ffosAlarmId', ffosAlarmId);

	//if(isPhoneGap)
	//	updateServiceConfig();
}

function updateService(){
	if(isPhoneGap){
		try {
			if(notify){
				enableTimer(updateFrequency * 60000);
				registerForBootStart();
				startService();
			} else {
				disableTimer();
				deregisterForBootStart();
				stopService();
			}
		} catch(e) { }
	} else if(isFirefoxOS){
		try {
			if(notify){
				var request = navigator.mozAlarms.add(new Date().getTime() + (updateFrequency * 60000), "ignoreTimezone", { });
 				request.onsuccess = function (e) { 
 					ffosAlarmId = e.target.result; 
 					setConfig();
 					updateService();
 				};
			} else {
				
			}
		} catch(e) { }
	}
}

function verifyAlert(){
	if(!isOnline()){
		showMessage('Conecte-se a internet');
		return;
	}

	try {
		$.get(apacService, function(data) {
			try {
				var dataAtual = new Date();
				dataAtual.setHours(0, 0, 0, 0);

				data = data.substring(data.indexOf('{'), data.indexOf('}') + 1);
			   	data = $.parseJSON(data);
				
				lastAlert = data;
				lastAlert.criadoEm = new Date(lastAlert.criadoEm.replace(/-/g,"/").replace(/[TZ]/g," "));
				lastAlert.validoAte = new Date(lastAlert.validoAte.replace(/-/g,"/").replace(/[TZ]/g," "));
				lastAlert.validoAte.setHours(0, 0, 0, 0);

				if(dataAtual <= lastAlert.validoAte)
					$('#alertaExpirado').css('display', 'none');
				else
					$('#alertaExpirado').css('display', 'block');

				lastAlertNumber = lastAlert.numero;
				setConfig();
				showAlert(lastAlert);
			} catch(e) { }
		});
	} catch(e) {
		showMessage('Nenhum alerta de chuva foi emitido pela APAC recentemente');
	}
}

function showNotification(){
	if(isFirefoxOS)
		try {
			var notification = navigator.mozNotification.createNotification("Vai Chover! Recife", "Corram para as colinas, vai chover no Recife!", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo0ODQxQzlCODRDOTBFMDExODFDM0E1ODM5QkM2OTBDNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo4NkNGODlBQUU4QjUxMUUyQThCMUZEN0QwMDk2RTQ3QSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo4NkNGODlBOUU4QjUxMUUyQThCMUZEN0QwMDk2RTQ3QSIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M0IFdpbmRvd3MiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpmOGEzNTc5Zi1mMDBkLWZjNGQtODY0Ni1jYTM0YjFlN2E2YjQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NDg0MUM5Qjg0QzkwRTAxMTgxQzNBNTgzOUJDNjkwQzciLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4TJrTQAAAMbElEQVR42rRZa4wkVRU+t15d3V39mMcuzLCL8lgCKkFiYgj8UCQE0Rj/IERiNBJJRCJogiEajUF/GUEQQU2UHxINPyRiIGrWGA2SEGQDGNgfuzALu8Luzs7szPRMv+p17/U799bMNPtgmumZzpxUd0911fnO+c6zhNaaNvPqZ0RzbSLhQIQVR9jPTvGeWLT5I8VHVRwLOe1VnLv6mqoR+e576+HRJl//Oazp1t/lFFUFBaGgsEIUQWpVonrFoWrJ3PwKKLynn+on2zFRu6eoC4kTojwVJKUAIGGA0QAoBsnY//xVly7buU0Aspzo5LKmBDcvSSLoThLWEoFDbibI8TTlmm6Xmj7dS+lP7ViqVk9Sp6Oo18fvGUDuQHnHgFAMQlkPMBD2ZC431mPTAPiFe5CLW7qwl4sPHnjDwm73HRoPXLolz/WkR/J6R+V7RQbepdASHtApFM/xa+VCeQYirAe0wWEAkN5OAHr1BgL81xCHHCjvQnnP1QBCt+HtpDZmlffqLN2r0pRknEME5YlLee6vxYM2IOx7VXhA8xtDpm3ygDDK2wB2WRiAo/kYeYLucgWrL0mo7FqQ/hM6i59VqSSZgDKxTwoxoOFHwLeK47PxgBow0hAsGAEB31oVHoAqQlsqCboNHtjtOgo3AACZctT+gPKMjwRvkAKdtJEc7yXopOEoCGJLQXR2lky1dQC0jTpjQygKZVlhKF6D3GM8IfC9Zg/k5OTpdSJPrwd3EMGchlgyA4ZBUKaM8izAbL2wrQBgHpXDelBOQUmYDx5gAPobnku7AQKBjFjg7wDQtVT6EUlEr4yhtBVKEwQ0rsHBzQA0KKURPVoMnUg2l4FAl9DNqeyxSKr4iqq+3ukJfQ8Hsc8AEBg+3pSAxvc5O+mrhM5vkQxAdxGkKzgu42qtNRFiGQGM9yLdMIBHCuKrL/bolR/WyYGxnELZx/bn33ttSU+aNAqFPcE53kGRc6kCCUsOB/mPe5Q9rUpZV5TiIhnod6mKCkEquQReiLbPA+WA6MIdDn1w3KHzmw71pf7wS8fzO6ISKrMBYEGUq1C+DqkBACp2JdAX4atv61Py2amymlK3NwsNhPPDL8YP5KjD5UBQybcShg4AoK2A8pXINe9LZYfqPt3ra33Re+onvGEYtDUA/nIgufml4/KGiQh0AYAAeZRjIIAXArQWAThVKXlUjTx4wgegUlQLvAfOrjxc2J8hkfe2H8BCV4396sXe/WNQvgKOhz4DQFFj4SD2bLMXlF2qVn2KGiWqNkNqNKqfL3vBTWekiQDy9itIqa3tB/Czf7d/0sr07jFQpMJdKQevbwEYXVCmXc5CiI2wDC+AP1ETIGoBjTXqD7mOO6nPREqm0BAcGgnA3gP9G/9xKL5917hPNbTQzH8/4F6Imzw7E7gIRl9wd4q2AxLCPVXQqAIA1cg/rx7VHzxbwRqmEnhD1CtCpTe0GHwdX5GTjz7f/vWuHQE1EKS1kPnPOR+tNTxQKyR0helXO06JTqC8zqDidhKNgNbUxzGKql+Ks+yv/X77CfbWGbrF0TyQw4K9RL3rO4mPv3hu5ZeVinf+eNOnRtUzypcxxFRDAMDRgycSXH0Z57bQVfahW4TzPjJdpcvPrVAUulSqeFSG5xr15iOeV7pwM9Phhh4wWfkUXz71Wu+brYy+cM5EQA7zGsqUQwuA+Z+BP9Kx3QAPKzm6zD6ELZ/2FZWQni6d9jAMZdw9oA3KxuvZ2ONLS3PX2jaOhm5H33cM7J/Nrj64kN9/3mRAouRSA1bkVNnASBYG1iQuji6DWRPXcL8cBKTxz5MY3SSC5eLpiOrjFSo3y6jU4TXVUu2neqs9sFYc8Vrqq+Yrx9LHz58Mgv0YJ+uwvouInaoJ2lMn6uK8E8ICcFxrHsHDipl9QRkcxxVqASK70+M64dAFxGOpTykGnXInuDtN/WcTrZ4aqhUd1gNOwSFY/77ppn/RImZeF8XJh2VLSJ3TFatwR9j0afojd3XIgfic2tEX4Td9DwMm+owINcEPPTonCmgnakPYqJJXCShQ9DDyVfP9jLUbuwnKzHbUpaiwXxfQaA4TVRm895A2oQPNgrWH0Tz2tFXcrFoKx9m52YLgVOqgJvTwzSLmYcVdIFDu5BoShRTWI/xe7HKT/FunBd5mAYgi6yz21F1TdTeYWUFShDU931Zd7jy58U31wC5InB6GZl/k0Fr3ilimOQCPjYGEoWNYYy+UScTxHULq5pYA4JstJ6oBZW9KlKDZWCOLOLbXdwuKCKvz2vJK2VlNDcxtgwstXWQ20J5aQM9pJ4SHSkhjQVTF4CN3UpJ91lpkCzzQSfXVE2Vnx9GOokwL0+N4nlXcWHlVaRQ8DGlWtBmwrGg7QUp8kMW4qIvlVR/f9aRdEPiwSFAFAFhFiMrnTFM3ahZSJk/TVRXw/RhIDo7a7cNApWbFlVjnPGceIYvVCFmFDSiYWmV2aFcD2zj2hN3GYZIrBXYnRN6V5PBUQdlIAJj/cPclrBy7m3c/a55lqzsFPfJ1vrDyJoU665s2BpAxXTLrBT5f5sX/cIFM2x9zxmN66VxOCeFP4MvZkXuhsu+MSRy5mho7F0tbubqIIqsQg9GOPYqBYNbFroeXD2lmPWGUl/Ya5n94o4pdogAglcZlrVV9ZAC2JbaqyEJ5XVheF9QxHGdlGJQoQAxgXdtQ59YDaWo9Ig0wKIsLKmUBmN2QWbUkYmuGelyjl9MSr0m4HrASUllNdRGgvBFJpe1aufljO+oBAGZ7V2SovDjPrILYAHCPxj9hbbNKlLiA7HUYWV8Ipz0yAM9y/A3OOBHy/gJvlXWRTXDkRpWDMB5QKlcD+Z/Wnx04q+25sufxdXgFxOiUo3kXQTLNKW+vmI4dZ5wcGYBjQbzAN51C6zvT1lZBaJLCC7GyDzs4HcaZBZEPrMlXH3a4xQ5VDNYFzjGuMJ8lQEhwL+10AWAZFdv9r1ZptiV7oVognm8ltHBJgyaem7UW5OBLwJ8ebtFDb8THGJ/TXKx5Z3W3zAC81YJXZCdO8QaQtx5DHB/x/CzxAthp+s8Yvo5ayNjNzZJYamf05K4q0SSaN7Y0c56p08+0GXhY+ihWMXoKBpLg+yS1R/6ux71SZn/DbUcOxTWGH1nm+QHAwam4nVLvyGFy6jvnRD16Zn1NPWIzxysSjLAP4ubJx3dYujBVkkLiQtkU0Zzl2lZckx4FuG6FAXO8pPzkBTOCquEcSOYpXENSH0Wy884sJUtL5DTqj+q83RpGvaEAsBd2hHQQheznl48jFmC5rilKbOEiq0DJXNtVoqbBFFRMZpzB8DuNzK7GIFUGA8Vhje5CRt0TPerOzGBIit6UCy8/pBbe5vZ1awCsjqoYZe+Dl1++cTcCDyZmy+dSm5HRPKzjjoa7TW6dA35eZo8OzwsNCBSnJisPbyHn9FcyWjmaUPvtlFYOHKGsm+Iy81/TsrMizES0xSMlZvJe5NPNjUAdvWE3eI1gSMElCTCmOXPtTkqUrPJG+D0DAF0o4lkZyieSessZKJNQB4NEd2aO4tkWKDd3t4rf+ZfdCW3hQDP4mgzpEMbgz1zWpMOf2gUKIXIzZDuFjk6zD9wz7GrZlvCURM7NoHh8DMH6VkydNxPq/W+Z4rkW/nf4Htk9+EjRyQ29GBoO6ikXmqo6r6I5/eRV5zqPdXriur9DkQR50yMfAFyITfpcK7R5EALBBJMjurNORtlSSvliTmkLHpxbnI/n9t2ZrRz8o1hDr0+fjEbqhc7w3UTFOXJlENyAyfKuQCTf2XsomZpvS/IzwOD9OgcuWx30Mu0B0lUOyuUdKA7uZyuxTuZff6J/7IXvy/jkW4IDZ3CME1vpgbO8Qk/IK6dLD14w5v/hY1PJl58+mH5x39H4ipNL5HK/pDmlIkZypCrZh9W7fYqXFt/xerN/S+YP/jY5cehF22d4xehD64/qXc/0SRs/Z9zgJG0HGgqGjJa5nrps//Hso2/MZ3tanXxSS+W5Wi5ncXokXp5/LWmdePXi6agtMKu+fvgkcpGLYqjMRGZLs+3FmYrf/co1dN5EeTQAG732vRnToROpwGBubo1ZmbcnrAMXBM/SQHAnLvkMpEcPqde2RMJRH5j01YemNn//kSjEr9/8cwnSCuqhw1uESS4XHOccJvwkqjgNTQa1iyd5/FSP281WO1bHb72msfL7O6dHeFQ9ogeOIpssduXgAuHU8BOnbFjW1s5M9WbFpd0Tm7fj/wUYAJpHXIa5J4XFAAAAAElFTkSuQmCC");
		 	notification.onclick = function () {
	            navigator.mozApps.getSelf().onsuccess = function(evt) {
	                var app = evt.target.result;
	                app.launch();
	            };
	        };
			notification.show();
		} catch(e){ }
}

function showAlert(info){  	
	var regioesAtingidas = "";
	for(var i = 0; i < info.regioesAtingidas.length; i++)
		regioesAtingidas += "<li>" + info.regioesAtingidas[i] + "</li>";

	$('#dlgAlerta #alert-number').html(info.numero);
	$('#dlgAlerta #alert-date').html($.format.date(info.criadoEm, "dd/MM/yyyy HH:mm:ss"));
	$('#dlgAlerta #alert-rainForce').html(info.forcaChuva);
	$('#dlgAlerta #alert-detail').html(info.detalhe);
	$('#dlgAlerta #alert-regions').html(regioesAtingidas);

	$.mobile.changePage($("#dlgAlerta"), {transition: 'flip'});
}

function showMessage(msg){
	$('#dlgMsg #msg').html(msg);

	$.mobile.changePage($("#dlgMsg"), {transition: 'flip'});
}

function isOnline(){
	if(isFirefoxOS)
		return navigator.onLine;
	else if(isPhoneGap)
		return navigator.connection.type != Connection.NONE;
	return true;
}

if(isPhoneGap)
	document.addEventListener('deviceready', function() {
		document.addEventListener("backbutton", function(e){
	       e.preventDefault();
	       navigator.app.exitApp();
	    }, false);

		try {
			FB.init({ appId: "492072877534695", nativeInterface: CDV.FB, useCachedDialogs: false });
		} catch (e) { }
		
		getConfig();
		//updateServiceConfig();
	}, true);

$(document).ready(function (){
	if(isPhoneGap)
		$('a[href="#dlgConfig"]').css('display', 'block');
	else if(isFirefoxOS)
		try {
			var appInstalledFFOS = navigator.mozApps.checkInstalled(manifest);
			appInstalledFFOS.onsuccess = function() {
		  		if(!appInstalledFFOS.result)
		  			$('#installFirefoxOS').css('display', 'block');
			};
			appInstalledFFOS.onerror = function() {
	  			$('#installFirefoxOS').css('display', 'none');
			};

			var appGetSelf = window.navigator.mozApps.getSelf();
			appGetSelf.onsuccess = function() {
			  	if (appGetSelf.result)
					$('#installFirefoxOS').css('display', 'none');
			};
		} catch(e) { }
		
	if(!isMobileBrowser && !isFirefoxOS)
		$('#popInstall').popup('open');

	$('a[href="#pageRegions"]').click(function(){
		if(!isOnline()){
			showMessage('Conecte-se a internet');
			return;
		}

		$.mobile.loading('show');
		resetMap();
	});

	$('#shareFacebook').click(function(){
		if(!isOnline()){
			showMessage('Conecte-se a internet');
			return;
		}
		
		try {
			var regioesAtingidas = "";
			for(var i = 0; i < lastAlert.regioesAtingidas.length; i++)
				regioesAtingidas += "\n- " + lastAlert.regioesAtingidas[i];

			var msg = 'Corram para as colinas, vai chover no Recife!';
			msg += '\n\nAVISO HIDROMETEOROLÓGICO N° ' + lastAlert.numero;
			msg += '\nElaborado em ' + $.format.date(lastAlert.criadoEm, "dd/MM/yyyy HH:mm:ss");
			msg += '\n\nForça da Chuva: ' + lastAlert.forcaChuva;
			msg += '\n\n' + lastAlert.detalhe;
			msg += '\n\nREGIÕES ATINGIDAS:' + regioesAtingidas;
			msg += '\n\nAlerta Oficial: ' + lastAlert.enderecoAviso;
			msg += '\n\nFonte: APAC - Agência Pernambucana de Águas e Clima';

			fbNewAlert(msg);
		} catch(e) { }
	});
	
	$('#shareTwitter').click(function(){
		if(!isOnline()){
			showMessage('Conecte-se a internet');
			return;
		}
		
		var msg = 'Corram para as colinas, vai chover no Recife! Vejam o aviso da APAC: ';
		window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(lastAlert.enderecoAviso) + '&text=' + msg + "&via=VaiChoverRecife", isPhoneGap ? '_blank' : '');
		showMessage("Alerta compartilhado com sucesso!");
	});

	$('#openPDF').click(function(){
		if(!isOnline()){
			showMessage('Conecte-se a internet');
			return;
		}
		
		window.open(lastAlert.enderecoAviso, '_system');
	});

	$('#openDlgAlerta').click(function(){
		$.mobile.loading('show');

		verifyAlert();
	});

	$('#installFirefoxOS').click(function(){
		if(isFirefoxOS){
			var installFFOS = navigator.mozApps.install(manifest);
			installFFOS.onsuccess = function() {
	  			$('#installFirefoxOS').css('display', 'none');
			};
		}
	});

	// OPEN CONFIG DIALOG
	$('a[href="#dlgConfig"]').click(function(){
		getConfig();
	});

	// CFGNOTIFY CLICK
	$('#form-cfg #cfg-notify').bind('change', function(event, ui) {
  		var isChecked = $(this).is(':checked');  		
  		$('#form-cfg #cfg-update-frequency input[type=radio]').each(function() {
		    $(this).checkboxradio(isChecked ? 'enable' : 'disable');
	  	});
	});

	// CONFIG FORM SUBMIT
	$('#form-cfg').submit(function() {
		setConfig();

		updateService();

  		$('#dlgConfig').dialog('close');
  		return false;
	});
});