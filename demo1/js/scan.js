	var videoElement = document.querySelector('video');
	var videoSelect = document.querySelector('.videoSource');
	var canvas = window.canvas = document.querySelector('canvas');
	var button = document.querySelector('button');
	var selectors = [videoSelect];
	var videoSource = "";
	var localStream;
	var resultadosImg = new Array(2);
	var file1, file2;
	


	/* PARA UPLOAD FOTO */

	$(document).ready(function(){
		$('.image-editor').cropit({
		  imageBackground: true,
		  imageBackgroundBorderWidth: 20
		});

		$('.export').click(function() {
			var imageData = $('.image-editor').cropit('export', {
				type: 'image/jpeg',
				quality: .9
			});

          	$('#comparacion > #imagen_comparacion').attr('src',imageData);

          	guardarComparar();
        });

        $.fancybox(
        	'#ejemploFoto',
        	{
        		padding:0,
				fitToView:false,
				wrapCSS : 'customCloseLayer',
				autoCenter: false
        	}
        	);
	});

	/* FIN UPLOAD FOTO */


	/* PARA COMPARAR LAS IMAGENES */

		function onComplete(data,cont){

			var diffImage = new Image();
			diffImage.src = data.getImageDataUrl();

			$('#image-diff').html(diffImage);

			resultadosImg[cont-1] = parseFloat(data.misMatchPercentage);

			if(data.misMatchPercentage == 0){
				

				$('#thesame').show();
				$('#diff-results').hide();

			} else {

				$('#mismatch'+cont).text(data.misMatchPercentage);
				
				if(!data.isSameDimensions){
					$('#differentdimensions').show();
				} else {
					$('#differentdimensions').hide();
				}
				
				$('#diff-results').show();
				$('#thesame').hide();
			}

			if(cont == 1)
				resemble(file1).compareTo(file2).ignoreAntialiasing().onComplete(function(data){onComplete(data,'2')});
			else if(cont == 2)
			{
				if(resultadosImg[0] != undefined && resultadosImg[1] != undefined)
				{
					if(resultadosImg[0] < 80 && resultadosImg[1] < 40)
						alert('Contenidos desbloqueados!')
					else
						alert('Vuelve a intentarlo!')
				}
			}
		}

	/* FIN DE COMPARAR IMAGENES */

	function gotDevices(deviceInfos) {
	  // Handles being called several times to update labels. Preserve values.

	  selectors.forEach(function(input) {
	    while (input.firstChild) {
	      input.removeChild(input.firstChild);
	    }
	  });

	  for (var i = 0; i !== deviceInfos.length; ++i) {
	    var deviceInfo = deviceInfos[i];
	    /*var option = document.createElement('option');
	    option.value = deviceInfo.deviceId;
		*/
	    if (deviceInfo.kind === 'videoinput') {
	      //option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
	      $('.videoSource').append('<input value="'+deviceInfo.deviceId+'" class="btnCamera" name="cameraType[]">'+deviceInfo.label);
	    } 

	  }

	}

	function errorCallback(error) {
	  console.log('navigator.getUserMedia error: ', error);
	}

	function start() {

		if (window.stream) {
			window.stream.getTracks().forEach(function(track) {
		  		track.stop();
			});
		}


		var constraints = {
			video: {deviceId: videoSource ? {exact: videoSource} : undefined}
		};

		navigator.mediaDevices.getUserMedia(constraints)
		.then(function(stream) {

			window.stream = stream; // make stream available to console
			videoElement.srcObject = stream;
			// Refresh button list in case labels have become available
			return navigator.mediaDevices.enumerateDevices();
		})
		.then(gotDevices)
		.catch(errorCallback);
	}

	function hilo(){

		if($('.btnCamera').last().length > 0)
		{
			videoSource = $('.btnCamera').last().val();
			start();
			$('#tomaFoto').show();
			$('#uploadFoto').hide();
		}
		else
			setTimeout(hilo,20);

	}

	function stop(){

		if (window.stream) {
	    	window.stream.getTracks().forEach(function(track) {
	      	track.stop();
	    });
	  }
	}

	function guardarComparar(){
		
		file1 = $('#real').children('img').attr('src');
		file2 = $('#comparacion').children('img').attr('src');

		resemble(file1).compareTo(file2).ignoreColors().onComplete(function(data){onComplete(data,'1')});
	}

	$(document).on('click','#capturar',function(event){
		event.preventDefault();

		canvas.getContext('2d').
	    drawImage(video, 0, 0, canvas.width, canvas.height);

	    $('#comparacion > #imagen_comparacion').attr('src',canvas.toDataURL());

	    guardarComparar();

		$('#capturar').hide();
		$('#cancelar').show();
		stop();
	});
	
	$(document).on('click','#cancelar',function(event){
		event.preventDefault();
		
		start()
		$('#capturar').show();
		$('#cancelar').hide();
	});

/*	$(document).on('click','#guardar',function(event){
		event.preventDefault();
		
		var file1 = $('#real').children('img').attr('src');
		var file2 = $('#comparacion').children('img').attr('src');

		resembleControl1 = resemble(file1).compareTo(file2).ignoreColors().onComplete(function(data){onComplete(data,'1')});
		resembleControl2 = resemble(file1).compareTo(file2).ignoreAntialiasing().onComplete(function(data){onComplete(data,'2')});

	});*/


	hasCamera = (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ? 
		navigator.mediaDevices : ((navigator.mozGetUserMedia || navigator.webkitGetUserMedia) ? true : false);

	if (hasCamera){
		start();
		hilo();
	}
	else {
		//alert('No sirves!');
		$('#tomaFoto').hide();
		$('#uploadFoto').show();
	}