var BitmapImage2D = require("awayjs-core/lib/image/BitmapImage2D");
var Matrix = require("awayjs-core/lib/geom/Matrix");
var Rectangle = require("awayjs-core/lib/geom/Rectangle");
var URLLoader = require("awayjs-core/lib/net/URLLoader");
var URLLoaderDataFormat = require("awayjs-core/lib/net/URLLoaderDataFormat");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var URLLoaderEvent = require("awayjs-core/lib/events/URLLoaderEvent");
var ParserUtils = require("awayjs-core/lib/parsers/ParserUtils");
var ColorUtils = require("awayjs-core/lib/utils/ColorUtils");
var BitmapImage2DTest = (function () {
    function BitmapImage2DTest() {
        var _this = this;
        var transparent = true;
        var initcolour = 0xffffffff;
        //---------------------------------------
        // Load a PNG
        this.urlRequest = new URLRequest('assets/256x256.png');
        this.urlLoader = new URLLoader();
        this.urlLoader.dataFormat = URLLoaderDataFormat.BLOB;
        this.urlLoader.load(this.urlRequest);
        this.urlLoader.addEventListener(URLLoaderEvent.LOAD_COMPLETE, function (event) { return _this.imgLoaded(event); });
        this.urlLoader.addEventListener(URLLoaderEvent.LOAD_ERROR, function (event) { return _this.imgLoadedError(event); });
        //---------------------------------------
        // BitmapImage2D Object - 1
        this.bitmapData = new BitmapImage2D(256, 256, transparent, initcolour);
        document.body.appendChild(this.bitmapData.getCanvas());
        //---------------------------------------
        // BitmapImage2D Object - 2
        this.bitmapDataB = new BitmapImage2D(256, 256, transparent, initcolour);
        this.bitmapDataB.getCanvas().style.position = 'absolute';
        this.bitmapDataB.getCanvas().style.left = '540px';
        document.body.appendChild(this.bitmapDataB.getCanvas());
        //---------------------------------------
        // BitmapImage2D - setPixel test
        console['time']("bitmapdata"); // start setPixel operation benchmark ( TypeScript does not support console.time - so hacking it in ) .
        this.bitmapDataB.lock();
        for (var i = 0; i < 10000; i++) {
            var x = Math.random() * this.bitmapDataB.width | 0; // |0 to truncate to Int32
            var y = Math.random() * this.bitmapDataB.height | 0;
            this.bitmapDataB.setPixel(x, y, Math.random() * 0xffFFFFFF); // 255 opaque
        }
        this.bitmapDataB.unlock();
        console['timeEnd']("bitmapdata"); // benchmark the setPixel operation
        document.onmousedown = function (event) { return _this.onMouseDown(event); };
    }
    BitmapImage2DTest.prototype.onMouseDown = function (event) {
        if (this.bitmapData.width === 512) {
            if (this.image.complete) {
                this.bitmapDataB.lock(); // Lock bitmap - speeds up setPixelOperations
                //---------------------------------------
                // Resize BitmapImage2D
                this.bitmapData.width = 256;
                this.bitmapData.height = 256;
                //---------------------------------------
                // copy loaded image to first BitmapImage2D
                var rect = new Rectangle(0, 0, this.image.width, this.image.height);
                this.bitmapData.draw(this.image);
                //---------------------------------------
                // copy image into second bitmap data ( and scale it up 2X )
                rect.width = rect.width * 2;
                rect.height = rect.height * 2;
                this.bitmapDataB.copyPixels(this.bitmapData, this.bitmapData.rect, rect);
                for (var d = 0; d < 1000; d++) {
                    var x = Math.random() * this.bitmapDataB.width | 0; // |0 to truncate to Int32
                    var y = Math.random() * this.bitmapDataB.height | 0;
                    this.bitmapDataB.setPixel(x, y, Math.random() * 0xFFFFFFFF); // 255 opaque
                }
                this.bitmapDataB.unlock(); // Unlock bitmapdata
            }
            else {
                //---------------------------------------
                // image is not loaded - fill bitmapdata with red
                this.bitmapData.width = 256;
                this.bitmapData.height = 256;
                this.bitmapData.fillRect(this.bitmapData.rect, 0xffff0000);
            }
        }
        else {
            //---------------------------------------
            // resize bitmapdata;
            this.bitmapData.lock();
            this.bitmapData.width = 512;
            this.bitmapData.height = 512;
            this.bitmapData.fillRect(this.bitmapData.rect, 0xffff0000); // fill it RED
            for (var d = 0; d < 1000; d++) {
                var x = Math.random() * this.bitmapData.width | 0; // |0 to truncate to Int32
                var y = Math.random() * this.bitmapData.height | 0;
                this.bitmapData.setPixel(x, y, Math.random() * 0xFFFFFFFF);
            }
            this.bitmapData.unlock();
            //---------------------------------------
            // copy bitmapdata
            var targetRect = this.bitmapDataB.rect.clone();
            targetRect.width = targetRect.width / 2;
            targetRect.height = targetRect.height / 2;
            this.bitmapDataB.copyPixels(this.bitmapData, this.bitmapDataB.rect, targetRect); // copy first bitmapdata object into the second one
        }
        var m = new Matrix(.5, .08, .08, .5, this.image.width / 2, this.image.height / 2);
        this.bitmapData.draw(this.bitmapData, m);
        this.bitmapData.setPixel32(0, 0, 0xccff0000);
        this.bitmapData.setPixel32(1, 0, 0xcc00ff00);
        this.bitmapData.setPixel32(2, 0, 0xcc0000ff);
        this.bitmapDataB.draw(this.bitmapData, m);
        console.log('GetPixel 0,0: ', ColorUtils.ARGBToHexString(ColorUtils.float32ColorToARGB(this.bitmapData.getPixel(0, 0))));
        console.log('GetPixel 1,0: ', ColorUtils.ARGBToHexString(ColorUtils.float32ColorToARGB(this.bitmapData.getPixel(1, 0))));
        console.log('GetPixel 2,0: ', ColorUtils.ARGBToHexString(ColorUtils.float32ColorToARGB(this.bitmapData.getPixel(2, 0))));
    };
    BitmapImage2DTest.prototype.imgLoadedError = function (event) {
        console.log('error');
    };
    BitmapImage2DTest.prototype.imgLoaded = function (event) {
        var _this = this;
        var loader = event.target;
        this.image = ParserUtils.blobToImage(loader.data);
        this.image.onload = function (event) { return _this.onImageLoad(event); };
    };
    BitmapImage2DTest.prototype.onImageLoad = function (event) {
        this.bitmapData.draw(this.image, null, null, null, new Rectangle(0, 0, this.image.width / 2, this.image.height / 2));
        this.bitmapData.draw(this.bitmapData, new Matrix(.5, .08, .08, .5, this.image.width / 2, this.image.height / 2));
    };
    return BitmapImage2DTest;
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRhdGEvQml0bWFwSW1hZ2UyRFRlc3QudHMiXSwibmFtZXMiOlsiQml0bWFwSW1hZ2UyRFRlc3QiLCJCaXRtYXBJbWFnZTJEVGVzdC5jb25zdHJ1Y3RvciIsIkJpdG1hcEltYWdlMkRUZXN0Lm9uTW91c2VEb3duIiwiQml0bWFwSW1hZ2UyRFRlc3QuaW1nTG9hZGVkRXJyb3IiLCJCaXRtYXBJbWFnZTJEVGVzdC5pbWdMb2FkZWQiLCJCaXRtYXBJbWFnZTJEVGVzdC5vbkltYWdlTG9hZCJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBTyxhQUFhLFdBQWEscUNBQXFDLENBQUMsQ0FBQztBQUN4RSxJQUFPLE1BQU0sV0FBZSw2QkFBNkIsQ0FBQyxDQUFDO0FBQzNELElBQU8sU0FBUyxXQUFjLGdDQUFnQyxDQUFDLENBQUM7QUFDaEUsSUFBTyxTQUFTLFdBQWMsK0JBQStCLENBQUMsQ0FBQztBQUMvRCxJQUFPLG1CQUFtQixXQUFZLHlDQUF5QyxDQUFDLENBQUM7QUFDakYsSUFBTyxVQUFVLFdBQWMsZ0NBQWdDLENBQUMsQ0FBQztBQUNqRSxJQUFPLGNBQWMsV0FBYSx1Q0FBdUMsQ0FBQyxDQUFDO0FBQzNFLElBQU8sV0FBVyxXQUFjLHFDQUFxQyxDQUFDLENBQUM7QUFDdkUsSUFBTyxVQUFVLFdBQWMsa0NBQWtDLENBQUMsQ0FBQztBQUVuRSxJQUFNLGlCQUFpQjtJQVF0QkEsU0FSS0EsaUJBQWlCQTtRQUF2QkMsaUJBOEpDQTtRQXBKQ0EsSUFBSUEsV0FBV0EsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFDL0JBLElBQUlBLFVBQVVBLEdBQVVBLFVBQVVBLENBQUNBO1FBRW5DQSxBQUdBQSx5Q0FIeUNBO1FBQ3pDQSxhQUFhQTtRQUViQSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxJQUFJQSxVQUFVQSxDQUFDQSxvQkFBb0JBLENBQUNBLENBQUNBO1FBQ3ZEQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxJQUFJQSxTQUFTQSxFQUFFQSxDQUFDQTtRQUNqQ0EsSUFBSUEsQ0FB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Q0FBQ0EsVUFBVUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsSUFBSUEsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0E7WUFDNURBLENBQUNBO1FBQ0ZBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ1BBLEFBR0FBLHlDQUh5Q0E7WUFDekNBLHFCQUFxQkE7WUFFckJBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO1lBRXZCQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxHQUFJQSxHQUFHQSxDQUFDQTtZQUM3QkEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0E7WUFDN0JBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLFVBQVVBLENBQUNBLEVBQUVBLGNBQWNBO1lBRTFFQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxJQUFJQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtnQkFDL0JBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLEdBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLEVBQUVBLDBCQUEwQkE7Z0JBQzNFQSxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxHQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQTtnQkFDakRBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLEdBQUNBLFVBQVVBLENBQUNBLENBQUNBO1lBQzFEQSxDQUFDQTtZQUVEQSxJQUFJQSxDQUFD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QUNBLEtBQUtBLEdBQUdBLFdBQVdBLENBQUNBLFdBQVdBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ2xEQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxHQUFHQSxVQUFDQSxLQUFXQSxJQUFLQSxPQUFBQSxLQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxLQUFLQSxDQUFDQSxFQUF2QkEsQ0FBdUJBLENBQUNBO0lBQzlEQSxDQUFDQTtJQUVPSix1Q0FBV0EsR0FBbkJBLFVBQW9CQSxLQUFXQTtRQUU5QkssSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsSUFBSUEsRUFBRUEsSUFBSUEsRUFBRUEsSUFBSUEsRUFBRUEsSUFBSUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsR0FBQ0EsQ0FBQ0EsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsR0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFFakhBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLElBQUlBLE1BQU1BLENBQUNBLEVBQUVBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLEdBQUNBLENBQUNBLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLEdBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQzlHQSxDQUFDQTtJQUNGTCx3QkFBQ0E7QUFBREEsQ0E5SkEsQUE4SkNBLElBQUEiLCJmaWxlIjoiZGF0YS9CaXRtYXBJbWFnZTJEVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuL3Rlc3RzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJpdG1hcEltYWdlMkRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvaW1hZ2UvQml0bWFwSW1hZ2UyRFwiKTtcbmltcG9ydCBNYXRyaXhcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vTWF0cml4XCIpO1xuaW1wb3J0IFJlY3RhbmdsZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vUmVjdGFuZ2xlXCIpO1xuaW1wb3J0IFVSTExvYWRlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL25ldC9VUkxMb2FkZXJcIik7XG5pbXBvcnQgVVJMTG9hZGVyRGF0YUZvcm1hdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbmV0L1VSTExvYWRlckRhdGFGb3JtYXRcIik7XG5pbXBvcnQgVVJMUmVxdWVzdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL25ldC9VUkxSZXF1ZXN0XCIpO1xuaW1wb3J0IFVSTExvYWRlckV2ZW50XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9VUkxMb2FkZXJFdmVudFwiKTtcbmltcG9ydCBQYXJzZXJVdGlsc1x0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3BhcnNlcnMvUGFyc2VyVXRpbHNcIik7XG5pbXBvcnQgQ29sb3JVdGlsc1x0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3V0aWxzL0NvbG9yVXRpbHNcIik7XG5cbmNsYXNzIEJpdG1hcEltYWdlMkRUZXN0XG57XG5cdHByaXZhdGUgYml0bWFwRGF0YTpCaXRtYXBJbWFnZTJEO1xuXHRwcml2YXRlIGJpdG1hcERhdGFCOkJpdG1hcEltYWdlMkQ7XG5cdHByaXZhdGUgdXJsTG9hZGVyOlVSTExvYWRlcjtcblx0cHJpdmF0ZSB1cmxSZXF1ZXN0OlVSTFJlcXVlc3Q7XG5cdHByaXZhdGUgaW1hZ2U6SFRNTEltYWdlRWxlbWVudDtcblxuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0XHR2YXIgdHJhbnNwYXJlbnQ6Ym9vbGVhbiA9IHRydWU7XG5cdFx0dmFyIGluaXRjb2xvdXI6bnVtYmVyID0gMHhmZmZmZmZmZjtcblxuXHRcdC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdFx0Ly8gTG9hZCBhIFBOR1xuXG5cdFx0dGhpcy51cmxSZXF1ZXN0ID0gbmV3IFVSTFJlcXVlc3QoJ2Fzc2V0cy8yNTZ4MjU2LnBuZycpO1xuXHRcdHRoaXMudXJsTG9hZGVyID0gbmV3IFVSTExvYWRlcigpO1xuXHRcdHRoaXMudXJsTG9hZGVyLmRhdGFGb3JtYXQgPSBVUkxMb2FkZXJEYXRhRm9ybWF0LkJMT0I7XG5cblx0XHR0aGlzLnVybExvYWRlci5sb2FkKHRoaXMudXJsUmVxdWVzdCk7XG5cdFx0dGhpcy51cmxMb2FkZXIuYWRkRXZlbnRMaXN0ZW5lcihVUkxMb2FkZXJFdmVudC5MT0FEX0NPTVBMRVRFLCAoZXZlbnQ6VVJMTG9hZGVyRXZlbnQpID0+IHRoaXMuaW1nTG9hZGVkKGV2ZW50KSk7XG5cdFx0dGhpcy51cmxMb2FkZXIuYWRkRXZlbnRMaXN0ZW5lcihVUkxMb2FkZXJFdmVudC5MT0FEX0VSUk9SLCAoZXZlbnQ6VVJMTG9hZGVyRXZlbnQpID0+IHRoaXMuaW1nTG9hZGVkRXJyb3IoZXZlbnQpKTtcblxuXHRcdC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdFx0Ly8gQml0bWFwSW1hZ2UyRCBPYmplY3QgLSAxXG5cdFx0dGhpcy5iaXRtYXBEYXRhID0gbmV3IEJpdG1hcEltYWdlMkQoMjU2LCAgMjU2LCB0cmFuc3BhcmVudCwgaW5pdGNvbG91cik7XG5cdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmJpdG1hcERhdGEuZ2V0Q2FudmFzKCkpO1xuXG5cdFx0Ly8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0XHQvLyBCaXRtYXBJbWFnZTJEIE9iamVjdCAtIDJcblx0XHR0aGlzLmJpdG1hcERhdGFCID0gbmV3IEJpdG1hcEltYWdlMkQoMjU2LCAyNTYsIHRyYW5zcGFyZW50LCBpbml0Y29sb3VyKTtcblx0XHR0aGlzLmJpdG1hcERhdGFCLmdldENhbnZhcygpLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcblx0XHR0aGlzLmJpdG1hcERhdGFCLmdldENhbnZhcygpLnN0eWxlLmxlZnQgPSAnNTQwcHgnO1xuXHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5iaXRtYXBEYXRhQi5nZXRDYW52YXMoKSk7XG5cblx0XHQvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRcdC8vIEJpdG1hcEltYWdlMkQgLSBzZXRQaXhlbCB0ZXN0XG5cdFx0Y29uc29sZVsndGltZSddKFwiYml0bWFwZGF0YVwiKTsgLy8gc3RhcnQgc2V0UGl4ZWwgb3BlcmF0aW9uIGJlbmNobWFyayAoIFR5cGVTY3JpcHQgZG9lcyBub3Qgc3VwcG9ydCBjb25zb2xlLnRpbWUgLSBzbyBoYWNraW5nIGl0IGluICkgLlxuXG5cdFx0dGhpcy5iaXRtYXBEYXRhQi5sb2NrKCk7XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IDEwMDAwOyBpKyspIHtcblx0XHRcdHZhciB4ID0gTWF0aC5yYW5kb20oKSAqIHRoaXMuYml0bWFwRGF0YUIud2lkdGggfCAwOyAvLyB8MCB0byB0cnVuY2F0ZSB0byBJbnQzMlxuXHRcdFx0dmFyIHkgPSBNYXRoLnJhbmRvbSgpICogdGhpcy5iaXRtYXBEYXRhQi5oZWlnaHQgfCAwO1xuXHRcdFx0dGhpcy5iaXRtYXBEYXRhQi5zZXRQaXhlbCh4LCB5LCBNYXRoLnJhbmRvbSgpICogMHhmZkZGRkZGRiApOyAvLyAyNTUgb3BhcXVlXG5cdFx0fVxuXG5cdFx0dGhpcy5iaXRtYXBEYXRhQi51bmxvY2soKTtcblx0XHRjb25zb2xlWyd0aW1lRW5kJ10oXCJiaXRtYXBkYXRhXCIpOyAvLyBiZW5jaG1hcmsgdGhlIHNldFBpeGVsIG9wZXJhdGlvblxuXG5cdFx0ZG9jdW1lbnQub25tb3VzZWRvd24gPSAoZXZlbnQ6TW91c2VFdmVudCkgPT4gdGhpcy5vbk1vdXNlRG93bihldmVudCk7XG5cdH1cblxuXHRwcml2YXRlIG9uTW91c2VEb3duKGV2ZW50Ok1vdXNlRXZlbnQpXG5cdHtcblx0XHRpZiAoIHRoaXMuYml0bWFwRGF0YS53aWR0aCA9PT0gNTEyICkgey8vIFRlc3QgdG8gdG9nZ2xlIHJlc2l6ZSBvZiBiaXRtYXBEYXRhXG5cdFx0XHRpZiAoIHRoaXMuaW1hZ2UuY29tcGxldGUgKSB7Ly8gSWYgaW1hZ2UgaXMgbG9hZGVkIGNvcHkgdGhhdCB0byB0aGUgQml0bWFwSW1hZ2UyRCBvYmplY3Rcblx0XHRcdFx0dGhpcy5iaXRtYXBEYXRhQi5sb2NrKCk7IC8vIExvY2sgYml0bWFwIC0gc3BlZWRzIHVwIHNldFBpeGVsT3BlcmF0aW9uc1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0XHRcdFx0Ly8gUmVzaXplIEJpdG1hcEltYWdlMkRcblx0XHRcdFx0dGhpcy5iaXRtYXBEYXRhLndpZHRoICA9IDI1Njtcblx0XHRcdFx0dGhpcy5iaXRtYXBEYXRhLmhlaWdodCA9IDI1NjtcblxuXHRcdFx0XHQvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRcdFx0XHQvLyBjb3B5IGxvYWRlZCBpbWFnZSB0byBmaXJzdCBCaXRtYXBJbWFnZTJEXG5cblx0XHRcdFx0dmFyIHJlY3Q6UmVjdGFuZ2xlID0gbmV3IFJlY3RhbmdsZSgwLCAwLCB0aGlzLmltYWdlLndpZHRoLCB0aGlzLmltYWdlLmhlaWdodCk7XG5cdFx0XHRcdHRoaXMuYml0bWFwRGF0YS5kcmF3KHRoaXMuaW1hZ2UpO1xuXG5cdFx0XHRcdC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdFx0XHRcdC8vIGNvcHkgaW1hZ2UgaW50byBzZWNvbmQgYml0bWFwIGRhdGEgKCBhbmQgc2NhbGUgaXQgdXAgMlggKVxuXHRcdFx0XHRyZWN0LndpZHRoID0gcmVjdC53aWR0aCAqIDI7XG5cdFx0XHRcdHJlY3QuaGVpZ2h0ID0gcmVjdC5oZWlnaHQgKiAyO1xuXG5cdFx0XHRcdHRoaXMuYml0bWFwRGF0YUIuY29weVBpeGVscyh0aGlzLmJpdG1hcERhdGEsIHRoaXMuYml0bWFwRGF0YS5yZWN0LCByZWN0KTtcblxuXHRcdFx0XHQvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRcdFx0XHQvLyBkcmF3IHJhbmRvbSBwaXhlbHNcblxuXHRcdFx0XHRmb3IgKHZhciBkID0gMDsgZCA8IDEwMDA7IGQrKykge1xuXHRcdFx0XHRcdHZhciB4ID0gTWF0aC5yYW5kb20oKSp0aGlzLmJpdG1hcERhdGFCLndpZHRoIHwgMDsgLy8gfDAgdG8gdHJ1bmNhdGUgdG8gSW50MzJcblx0XHRcdFx0XHR2YXIgeSA9IE1hdGgucmFuZG9tKCkqdGhpcy5iaXRtYXBEYXRhQi5oZWlnaHQgfCAwO1xuXHRcdFx0XHRcdHRoaXMuYml0bWFwRGF0YUIuc2V0UGl4ZWwoeCwgeSwgTWF0aC5yYW5kb20oKSoweEZGRkZGRkZGKTsgLy8gMjU1IG9wYXF1ZVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy5iaXRtYXBEYXRhQi51bmxvY2soKTsgLy8gVW5sb2NrIGJpdG1hcGRhdGFcblxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0XHRcdFx0Ly8gaW1hZ2UgaXMgbm90IGxvYWRlZCAtIGZpbGwgYml0bWFwZGF0YSB3aXRoIHJlZFxuXHRcdFx0XHR0aGlzLmJpdG1hcERhdGEud2lkdGggID0gMjU2O1xuXHRcdFx0XHR0aGlzLmJpdG1hcERhdGEuaGVpZ2h0ID0gMjU2O1xuXHRcdFx0XHR0aGlzLmJpdG1hcERhdGEuZmlsbFJlY3QodGhpcy5iaXRtYXBEYXRhLnJlY3QsIDB4ZmZmZjAwMDApO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRcdFx0Ly8gcmVzaXplIGJpdG1hcGRhdGE7XG5cblx0XHRcdHRoaXMuYml0bWFwRGF0YS5sb2NrKCk7XG5cblx0XHRcdHRoaXMuYml0bWFwRGF0YS53aWR0aCAgPSA1MTI7XG5cdFx0XHR0aGlzLmJpdG1hcERhdGEuaGVpZ2h0ID0gNTEyO1xuXHRcdFx0dGhpcy5iaXRtYXBEYXRhLmZpbGxSZWN0KHRoaXMuYml0bWFwRGF0YS5yZWN0LCAweGZmZmYwMDAwKTsgLy8gZmlsbCBpdCBSRURcblxuXHRcdFx0Zm9yICh2YXIgZCA9IDA7IGQgPCAxMDAwOyBkKyspIHtcblx0XHRcdFx0dmFyIHggPSBNYXRoLnJhbmRvbSgpKnRoaXMuYml0bWFwRGF0YS53aWR0aCB8IDA7IC8vIHwwIHRvIHRydW5jYXRlIHRvIEludDMyXG5cdFx0XHRcdHZhciB5ID0gTWF0aC5yYW5kb20oKSp0aGlzLmJpdG1hcERhdGEuaGVpZ2h0IHwgMDtcblx0XHRcdFx0dGhpcy5iaXRtYXBEYXRhLnNldFBpeGVsKHgsIHksIE1hdGgucmFuZG9tKCkqMHhGRkZGRkZGRik7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuYml0bWFwRGF0YS51bmxvY2soKTtcblx0XHRcdC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdFx0XHQvLyBjb3B5IGJpdG1hcGRhdGFcblxuXHRcdFx0dmFyIHRhcmdldFJlY3QgPSB0aGlzLmJpdG1hcERhdGFCLnJlY3QuY2xvbmUoKTtcblx0XHRcdFx0dGFyZ2V0UmVjdC53aWR0aCA9IHRhcmdldFJlY3Qud2lkdGgvMjtcblx0XHRcdFx0dGFyZ2V0UmVjdC5oZWlnaHQgPSB0YXJnZXRSZWN0LmhlaWdodC8yO1xuXG5cdFx0XHR0aGlzLmJpdG1hcERhdGFCLmNvcHlQaXhlbHModGhpcy5iaXRtYXBEYXRhLCB0aGlzLmJpdG1hcERhdGFCLnJlY3QsIHRhcmdldFJlY3QpOyAvLyBjb3B5IGZpcnN0IGJpdG1hcGRhdGEgb2JqZWN0IGludG8gdGhlIHNlY29uZCBvbmVcblx0XHR9XG5cblx0XHR2YXIgbSA6IE1hdHJpeCA9IG5ldyBNYXRyaXgoLjUsIC4wOCwgLjA4LCAuNSwgdGhpcy5pbWFnZS53aWR0aC8yLCB0aGlzLmltYWdlLmhlaWdodC8yKTtcblx0XHR0aGlzLmJpdG1hcERhdGEuZHJhdyh0aGlzLmJpdG1hcERhdGEsIG0pO1xuXG5cdFx0dGhpcy5iaXRtYXBEYXRhLnNldFBpeGVsMzIoMCwgMCwgMHhjY2ZmMDAwMCkgO1xuXHRcdHRoaXMuYml0bWFwRGF0YS5zZXRQaXhlbDMyKDEsIDAsIDB4Y2MwMGZmMDApIDtcblx0XHR0aGlzLmJpdG1hcERhdGEuc2V0UGl4ZWwzMigyLCAwLCAweGNjMDAwMGZmKSA7XG5cblx0XHR0aGlzLmJpdG1hcERhdGFCLmRyYXcodGhpcy5iaXRtYXBEYXRhLCBtKTtcblxuXHRcdGNvbnNvbGUubG9nKCdHZXRQaXhlbCAwLDA6ICcsIENvbG9yVXRpbHMuQVJHQlRvSGV4U3RyaW5nKENvbG9yVXRpbHMuZmxvYXQzMkNvbG9yVG9BUkdCKHRoaXMuYml0bWFwRGF0YS5nZXRQaXhlbCgwLCAwKSkpKTtcblx0XHRjb25zb2xlLmxvZygnR2V0UGl4ZWwgMSwwOiAnLCBDb2xvclV0aWxzLkFSR0JUb0hleFN0cmluZyhDb2xvclV0aWxzLmZsb2F0MzJDb2xvclRvQVJHQih0aGlzLmJpdG1hcERhdGEuZ2V0UGl4ZWwoMSwgMCkpKSk7XG5cdFx0Y29uc29sZS5sb2coJ0dldFBpeGVsIDIsMDogJywgQ29sb3JVdGlscy5BUkdCVG9IZXhTdHJpbmcoQ29sb3JVdGlscy5mbG9hdDMyQ29sb3JUb0FSR0IodGhpcy5iaXRtYXBEYXRhLmdldFBpeGVsKDIsIDApKSkpO1xuXG5cblxuXHR9XG5cblx0cHJpdmF0ZSBpbWdMb2FkZWRFcnJvcihldmVudDpVUkxMb2FkZXJFdmVudClcblx0e1xuXHRcdGNvbnNvbGUubG9nKCdlcnJvcicpO1xuXHR9XG5cblx0cHJpdmF0ZSBpbWdMb2FkZWQoZXZlbnQ6VVJMTG9hZGVyRXZlbnQpXG5cdHtcblx0XHR2YXIgbG9hZGVyIDpVUkxMb2FkZXIgPSA8VVJMTG9hZGVyPiBldmVudC50YXJnZXQ7XG5cdFx0dGhpcy5pbWFnZSA9IFBhcnNlclV0aWxzLmJsb2JUb0ltYWdlKGxvYWRlci5kYXRhKTtcblx0XHR0aGlzLmltYWdlLm9ubG9hZCA9IChldmVudDpFdmVudCkgPT4gdGhpcy5vbkltYWdlTG9hZChldmVudCk7XG5cdH1cblxuXHRwcml2YXRlIG9uSW1hZ2VMb2FkKGV2ZW50OkV2ZW50KVxuXHR7XG5cdFx0dGhpcy5iaXRtYXBEYXRhLmRyYXcodGhpcy5pbWFnZSwgbnVsbCwgbnVsbCwgbnVsbCwgbmV3IFJlY3RhbmdsZSgwLCAwLCB0aGlzLmltYWdlLndpZHRoLzIsIHRoaXMuaW1hZ2UuaGVpZ2h0LzIpKTtcblxuXHRcdHRoaXMuYml0bWFwRGF0YS5kcmF3KHRoaXMuYml0bWFwRGF0YSwgbmV3IE1hdHJpeCguNSwgLjA4LCAuMDgsIC41LCB0aGlzLmltYWdlLndpZHRoLzIsIHRoaXMuaW1hZ2UuaGVpZ2h0LzIpKTtcblx0fVxufSJdfQ==