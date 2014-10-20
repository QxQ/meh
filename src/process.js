// this file is meant to be run in a new thread, so the main thread doesn't lock up while this is running
// this code isn't actually ran directly. it is offuscated, created into a string, and put into main.js.
// this is done manually, so any changes to this module after go through that process.
// look for instructions in main.js

onmessage = function (oEvent) {
	images = oEvent.data['images'];
	JSZip = oEvent.data['JSZip'];
	jic = oEvent.data['jic'];
       
	var zip = new JSZip();
	var root = zip.folder("images");
	
	callback_count=0;
	function finish() {
		postMessage({'func':'loadingMessage','args':'finishing'});
		var content = zip.generate();
		
		var duration = new Date().getTime() - time_start;
		   
		console.log('process finished...');
		console.log('Processed in: ' + duration + 'ms');
		
		navigate = "data:application/zip;base64,"+content;
		postMessage({'func':'loadingMessage','args':navigate});
	}
	postMessage({'func':'loadingMessage','args':'0/'+images.length});
	for (var i=0;i<images.length;++i) {
		var image = images[i];
		var src = jic.compress(image,quality).src;
		resize(src, maxSize, function(src, image) {
			src = src.split('data:image/jpeg;base64,')[1] //we don't want a full url, just the content of it, so we cut of the beggining of it.
			var filename = image.parentNode.getElementsByClassName('imagelist-title')[0].title;
			filename = filename.split('.');
			filename[filename.length-1]='jpg';
			filename = filename.join('.');
			root.file(filename, src, {base64: true});
			
			callback_count+=1;
			postMessage({'func':'loadingMessage','args':callback_count+'/'+images.length});
			if (callback_count==images.length) {
				finish();
			}
		}, image);
	}
}
