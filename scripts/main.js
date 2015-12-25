/* global readyState */
 // eslint-disable-line no-console

//window.addEventListener('onload', function(){
    var timeStart = new Date();
    
    var file = new muxjs.mp4.CoalesceStream({metadataStream: new muxjs.mp2t.MetadataStream() });
    var mp4 = new muxjs.mp4.VideoSegmentStream({
        width : width,
        height : height,
        minPTS : 0,
        sps : null,
        profileIdc : 100,
        type : 'video',
      levelIdc : 40,
      profileCompatibility : 0,
      timelineStartInfo : { dts : 0, baseMediaDecodeTime : 0 },
      minSegmentDts : 0,
      minSegmentPts : 0,
      samplerate : 25
    });
    var nal = new muxjs.codecs.NalByteStream();
    var h264 = new muxjs.codecs.H264Stream();
    var video = document.getElementById('video');
    var media = new MediaSource();
    video.src = URL.createObjectURL(media);
    
    media.addEventListener('sourceopen', function(){
        //var buffer = media.addSourceBuffer('video/mp4;codecs="avc1"');
        var buffer = media.addSourceBuffer('video/mp4;codecs="avc1.4d001e"');
        //var buffer = media.addSourceBuffer('video/mp4;codecs="avc3.4d401f"');
        //var buffer = media.addSourceBuffer('video/mp4');
        
        buffer.addEventListener("error", function(e){ console.log(e);});
        
        h264
            .pipe(mp4)
            .pipe(file);
            file.numberOfTracks++;
        var queue = [];
        //fileInput.addEventListener('change', function(evt){
            var i = 0;
            var client = new WebSocket(websocketaddress);
            client.onmessage = function(e){
			
				var fileReader     = new FileReader();
				fileReader.onload  = function(progressEvent) {
					var arrayBufferNew = this.result;
					var data = new Uint8Array(arrayBufferNew);

                    
                    
                    //console.log(data)
					
                    if(data[0] == 0 && data[1] == 0 && data[2] == 0 && data[3] == 1)
                    {
                        
                        i++;
                        h264.push({
                            data : new Uint8Array([0x00, 0x00, 0x00, 0x01, 0x09]),
                            trackId : 0,
                            type : 'video',
                            dts : i,
                            pts :  i
                        });
                    }
                    var packet = 
                    { 
                        data : data, 
                        trackId : 0, 
                        type : 'video',
                        dts : i,
                        pts :  i
                    };
                    h264.push(packet);
				};
				fileReader.readAsArrayBuffer(e.data);
            };

           
            video.play();
            window.setInterval(function(){
                if (queue.length > 0 && !buffer.updating) {
				  buffer.appendBuffer(queue.shift());
				}
            }, 1);
            window.setInterval(function(){
                h264.flush();

            }, 1000);
        file.on('data', function (segment) {
            queue.push(segment.data);
        });
    });

    
//});
