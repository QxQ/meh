$(function() {

	String.prototype.trunc = String.prototype.trunc ||
      function(n){
          return this.length>n ? this.substr(0,n-1)+'&hellip;' : this;
      };
      
    //check if compression level is between 1 and 100
    var compress_box = document.getElementById('jpeg_encode_quality');
    compress_box.addEventListener('focus', function(event) {
    	compress_box.style.background = '#fff';
    });
    compress_box.addEventListener('blur', function(event) {
    	numb = parseInt( compress_box.value )
    	if (isNaN(numb) || numb<1 || numb>100) {
    		compress_box.style.background = '#f44';
    		return;
    	}
    	$("#slider-range-min").slider('setValue', 5 )
    });
	
    //Slider init
    $("#slider-range-min").slider({
        range: "min",
        value: 65,
        min: 5,
        max: 100,
        step: 5,
        slide: function(event, ui) {
            $("#jpeg_encode_quality").val(ui.value);
        }
    });
    $("#jpeg_encode_quality").val($("#slider-range-min").slider("value"));

    /** DRAG AND DROP STUFF WITH FILE API **/
    var holder = document.getElementById('holder');
    
    holder.ondragover = function() {
        this.className = 'is_hover';
        return false;
    };
    holder.ondragleave = holder.ondragend = function() {
        this.className = '';
        return false;
    };
    holder.ondrop = function(e) {
        this.className = '';
        e.preventDefault();
        
        var files = e.dataTransfer.files;
        reader_onload = function(event,file) {
        	var images = document.getElementById('imagelist');
        		var item = document.createElement('div');
        		item.className = 'imagelist-item';
        			var image = document.createElement('img');
	        		image.className = 'imagelist-image';
    	    		item.appendChild(image);
    	    		
    	    		var panel = document.createElement('div');
    	    		panel.className = 'imagelist-panel';
    	    			var closeButton = document.createElement('button');
    	    			closeButton.className = 'imagelist-close';
    	    			closeButton.innerHTML = 'X';
    	    			closeButton.title = 'remove image';
    	    			closeButton.onclick = function(event) {
    	    				item.parentNode.removeChild(item);
    	    			}
    	    			panel.appendChild(closeButton);
    	    			
    	    			var title = document.createElement('p');
    	    			title.className = 'imagelist-title';
    	    			title.innerHTML = this.file.name.trunc(16)
    	    			title.title = this.file.name
    	    			panel.appendChild(title)
    	    		item.appendChild(panel);
    	    		
    	    	images.appendChild(item);
        	image.src = event.target.result;
        };
        for (var i=0;i<files.length;++i) {
        	var reader = new FileReader();
        	file = files[i];
        	reader.file = file;
        	reader.onload = reader_onload
        	console.log("Filename:" + file.name);
        	console.log("Filesize:" + (parseInt(file.size) / 1024) + " Kb");
	        console.log("Type:" + file.type);
    	    reader.readAsDataURL(file);
    	}
    	return false;
    };
    
    var encodeButton = document.getElementById('jpeg_encode_button');
    var encodeQuality = document.getElementById('jpeg_encode_quality');
    var maxImageSize = document.getElementById('max_image_size');

    //HANDLE COMPRESS BUTTON
    encodeButton.addEventListener('click', function(e) {

        var quality = parseFloat(encodeQuality.value / 100);
        console.log("Quality >>" + quality);
        
        var maxSize = parseFloat(maxImageSize.value);
        console.log("Max size >>" + maxSize);

        console.log("process start...");
        var time_start = new Date().getTime();
        var images = document.getElementById('imagelist').getElementsByClassName('imagelist-image');
        
        var zip = new JSZip();
        var root = zip.folder("images");
        
        callback_count=0;
        function finish() {
        	var content = zip.generate();
		    location.href="data:application/zip;base64,"+content;
		    
	        var duration = new Date().getTime() - time_start;
	        
	        console.log('process finished...');
	        console.log('Processed in: ' + duration + 'ms');
        }
        for (var i=0;i<images.length;++i) {
        	var image = images[i]
        	var src = jic.compress(image,quality).src;
        	resize(src, maxSize, function(src, image) {
	        	src = src.split('data:image/jpeg;base64,')[1] //we don't want a full url, just the content of it, so we cut of the beggining of it.
	
	        	var filename = image.parentNode.getElementsByClassName('imagelist-title')[0].title;
	        	filename = filename.split('.');
	        	filename[filename.length-1]='jpg';
	        	filename = filename.join('.');
	        	root.file(filename, src, {base64: true});
	        	
	        	callback_count+=1;
	        	if (callback_count==images.length) {
	        		finish();
	        	}
        	}, image);
	    }
    
    }, false);
    
	function resize(src, maxSize, callback, callbackParams) { //recises the image from the src url. maxSize is the maximum size that it will be. callback is the callback to get the new image url. callbackParams are additional params to go in the callback after src.
		
		var fake_img = document.createElement('img');
		fake_img.src = src;
		
		//got the code snippit to find the size of an image from: http://stackoverflow.com/questions/318630/get-real-image-width-and-height-with-javascript-in-safari-chrome
		$(fake_img).load(function() { // Make in memory copy of image to avoid css issuess
				//code to resize an image from: http://www.codeforest.net/html5-image-upload-resize-and-crop
		        width = this.width; // Note: $(this).width() will not work for in memory images.
		        height = this.height;
		        
		        if (width > height) {
		            if (width > maxSize) {
		               height *= maxSize / width;
		               width = maxSize;
		            }
		        } else {
		            if (height > maxSize) {
		               width *= maxSize / height;
		               height = maxSize;
		            }
		        }
		 
		        var canvas = document.createElement('canvas');
		        canvas.width = width;
		        canvas.height = height;
		        var ctx = canvas.getContext("2d");
		        ctx.drawImage(fake_img, 0, 0, width, height);
		        callback( canvas.toDataURL('image/jpeg'), callbackParams );
        	});
	}

});

function updateMessage() {
	message = '\
if you can e-mail, but can\'t access any other website, you can e-mail updateMeh@gmail.com, and a message will automaticly be replied with an updated version attached.\n\n\
if you have internet, then just go to http://evacle.com/meh to use the latest version. however this website not reliable and is down a lot.\n\n\
another option would be to go to https://github.com/QxQ/meh. just click the "download zip" at the right of the webpage. this site also has all the code to make the project.\
'
	alert( message );
}
