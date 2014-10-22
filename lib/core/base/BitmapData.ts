import ColorTransform			= require("awayjs-core/lib/core/geom/ColorTransform");
import Matrix					= require("awayjs-core/lib/core/geom/Matrix");
import Rectangle				= require("awayjs-core/lib/core/geom/Rectangle");
import Point					= require("awayjs-core/lib/core/geom/Point");
import ByteArray				= require("awayjs-core/lib/utils/ByteArray");
import ColorUtils				= require("awayjs-core/lib/utils/ColorUtils");

/**
 *
 */
class BitmapData
{
	private _imageCanvas:HTMLCanvasElement;
	private _context:CanvasRenderingContext2D;
	private _imageData:ImageData;
	private _rect:Rectangle;
	private _transparent:boolean;
	private _alpha:number = 0;
	private _locked:boolean = false;


	/**
	 *
	 * @param width
	 * @param height
	 * @param transparent
	 * @param fillColor
	 */
	constructor(width:number, height:number, transparent:boolean = true, fillColor:number = null)
	{

		this._transparent = transparent;
		this._imageCanvas = <HTMLCanvasElement> document.createElement("canvas");
		this._imageCanvas.width = width;
		this._imageCanvas.height = height;
		this._context = this._imageCanvas.getContext("2d");
		this._rect = new Rectangle(0, 0, width, height);

		if (fillColor != null) {

			if (this._transparent) {
				this._alpha = ColorUtils.float32ColorToARGB(fillColor)[0]/255;
			} else {
				this._alpha = 1;
			}

			this.fillRect(this._rect, fillColor);

		}

	}

	/**
	 *
	 */
	public dispose()
	{
		this._context = null;
		this._imageCanvas = null;
		this._imageData = null;
		this._rect = null;
		this._transparent = null;
		this._locked = null;
	}

	/**
	 *
	 */
	public lock()
	{
		this._locked = true;
		this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);
	}

	/**
	 *
	 */
	public unlock()
	{
		this._locked = false;

		if (this._imageData) {
			this._context.putImageData(this._imageData, 0, 0); // at coords 0,0
			this._imageData = null;
		}
	}

	/**
	 *
	 * @param x
	 * @param y
	 * @param color
	 */
	public getPixel(x, y):number
	{
		var r:number;
		var g:number;
		var b:number;
		var a:number;

		if (!this._locked) {
			var pixelData:ImageData = this._context.getImageData(x, y, 1, 1);

			r = pixelData.data[0];
			g = pixelData.data[1];
			b = pixelData.data[2];
			a = pixelData.data[3];

		} else {
			var index:number = (x + y*this._imageCanvas.width)*4;

			if (!this._imageData)
				this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);

			r = this._imageData.data[index + 0];
			g = this._imageData.data[index + 1];
			b = this._imageData.data[index + 2];
			a = this._imageData.data[index + 3];

		}

		if (!this._locked) {
			this._imageData = null;
		}

		return (a << 24) | (r << 16) | (g << 8) | b;
	}

	/**
	 *
	 * @param x
	 * @param y
	 * @param color
	 */
	public setPixel(x, y, color:number)
	{
		var argb:number[] = ColorUtils.float32ColorToARGB(color);

		if (!this._locked)
			this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);

		if (this._imageData) {
			var index:number = (x + y*this._imageCanvas.width)*4;

			this._imageData.data[index + 0] = argb[1];
			this._imageData.data[index + 1] = argb[2];
			this._imageData.data[index + 2] = argb[3];
			this._imageData.data[index + 3] = 255;
		}

		if (!this._locked) {
			this._context.putImageData(this._imageData, 0, 0);
			this._imageData = null;
		}
	}

	/**
	 *
	 * @param rect
	 * @param inputByteArray
	 */
	public setPixels(rect:Rectangle, inputByteArray:ByteArray)
	{
		if (!this._locked)
			this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);

		if (this._imageData) {
			inputByteArray.position = 0;
			var i:number /*uint*/, j:number /*uint*/, index:number /*uint*/;
			for (i = 0; i < rect.width; ++i) {
				for (j = 0; j < rect.height; ++j) {
					index = (i + rect.x + (j + rect.y)*this._imageCanvas.width)*4;

					this._imageData.data[index + 0] = inputByteArray.readUnsignedInt();
					this._imageData.data[index + 1] = inputByteArray.readUnsignedInt();
					this._imageData.data[index + 2] = inputByteArray.readUnsignedInt();
					this._imageData.data[index + 3] = inputByteArray.readUnsignedInt();
				}
			}
		}

		if (!this._locked) {
			this._context.putImageData(this._imageData, 0, 0);
			this._imageData = null;
		}
	}

	/**
	 *
	 * @param x
	 * @param y
	 * @param color
	 */
	public setPixel32(x, y, color:number)
	{
		var argb:number[] = ColorUtils.float32ColorToARGB(color);

		if (!this._locked)
			this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);

		if (this._imageData) {
			var index:number = (x + y*this._imageCanvas.width)*4;

			this._imageData.data[index + 0] = argb[1];
			this._imageData.data[index + 1] = argb[2];
			this._imageData.data[index + 2] = argb[3];
			this._imageData.data[index + 3] = argb[0];
		}

		if (!this._locked) {
			this._context.putImageData(this._imageData, 0, 0);
			this._imageData = null;
		}
	}

	public setVector(rect:Rectangle, inputVector:Array<number>)
	{
		if (!this._locked)
			this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);

		if (this._imageData) {
			var i:number /*uint*/, j:number /*uint*/, index:number /*uint*/, argb:number[] /*uint*/;
			for (i = 0; i < rect.width; ++i) {
				for (j = 0; j < rect.height; ++j) {
					argb = ColorUtils.float32ColorToARGB(inputVector[i + j*rect.width]);
					index = (i + rect.x + (j + rect.y)*this._imageCanvas.width)*4;

					this._imageData.data[index + 0] = argb[1];
					this._imageData.data[index + 1] = argb[2];
					this._imageData.data[index + 2] = argb[3];
					this._imageData.data[index + 3] = argb[0];
				}
			}
		}

		if (!this._locked) {
			this._context.putImageData(this._imageData, 0, 0);
			this._imageData = null;
		}
	}

	/**
	 * Copy an HTMLImageElement or BitmapData object
	 *
	 * @param img {BitmapData} / {HTMLImageElement}
	 * @param sourceRect - source rectange to copy from
	 * @param destRect - destinatoin rectange to copy to
	 */
	public drawImage(img:BitmapData, sourceRect:Rectangle, destRect:Rectangle);
	public drawImage(img:HTMLImageElement, sourceRect:Rectangle, destRect:Rectangle);
	public drawImage(img:any, sourceRect:Rectangle, destRect:Rectangle)
	{
		if (this._locked) {
			// If canvas is locked:
			//
			//      1) copy image data back to canvas
			//      2) draw object
			//      3) read _imageData back out

			if (this._imageData) {
				this._context.putImageData(this._imageData, 0, 0); // at coords 0,0
			}

			this._drawImage(img, sourceRect, destRect);

			if (this._imageData) {
				this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);
			}

		} else {
			this._drawImage(img, sourceRect, destRect)
		}
	}

	private _drawImage(img:BitmapData, sourceRect:Rectangle, destRect:Rectangle);
	private _drawImage(img:HTMLImageElement, sourceRect:Rectangle, destRect:Rectangle);
	private _drawImage(img:any, sourceRect:Rectangle, destRect:Rectangle)
	{
		if (img instanceof BitmapData)
			this._context.drawImage(img.canvas, sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height, destRect.x, destRect.y, destRect.width, destRect.height);
		else if (img instanceof HTMLImageElement)
			this._context.drawImage(img, sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height, destRect.x, destRect.y, destRect.width, destRect.height);
	}

	/**
	 *
	 * @param bmpd
	 * @param sourceRect
	 * @param destRect
	 */
	public copyPixels(bmpd:BitmapData, sourceRect:Rectangle, destRect:Rectangle);
	public copyPixels(bmpd:HTMLImageElement, sourceRect:Rectangle, destRect:Rectangle);
	public copyPixels(bmpd:any, sourceRect:Rectangle, destRect:Rectangle)
	{

		if (this._locked) {

			// If canvas is locked:
			//
			//      1) copy image data back to canvas
			//      2) draw object
			//      3) read _imageData back out

			if (this._imageData) {
				this._context.putImageData(this._imageData, 0, 0); // at coords 0,0
			}

			this._copyPixels(bmpd, sourceRect, destRect);

			if (this._imageData) {
				this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);
			}
		} else {
			this._copyPixels(bmpd, sourceRect, destRect);
		}

	}

	private _copyPixels(bmpd:BitmapData, sourceRect:Rectangle, destRect:Rectangle);
	private _copyPixels(bmpd:HTMLImageElement, sourceRect:Rectangle, destRect:Rectangle);
	private _copyPixels(bmpd:any, sourceRect:Rectangle, destRect:Rectangle)
	{

		if (bmpd instanceof BitmapData) {
			this._context.drawImage(bmpd.canvas, sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height, destRect.x, destRect.y, destRect.width, destRect.height);
		} else if (bmpd instanceof HTMLImageElement) {
			this._context.drawImage(bmpd, sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height, destRect.x, destRect.y, destRect.width, destRect.height);
		}

	}

	/**
	 *
	 * @param rect
	 * @param color
	 */
	public fillRect(rect:Rectangle, color:number)
	{
		if (this._locked) {

			// If canvas is locked:
			//
			//      1) copy image data back to canvas
			//      2) apply fill
			//      3) read _imageData back out

			if (this._imageData)
				this._context.putImageData(this._imageData, 0, 0); // at coords 0,0

			this._context.fillStyle = this.hexToRGBACSS(color);
			this._context.fillRect(rect.x, rect.y, rect.width, rect.height);

			if (this._imageData)
				this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);
		} else {
			this._context.fillStyle = this.hexToRGBACSS(color);
			this._context.fillRect(rect.x, rect.y, rect.width, rect.height);
		}
	}

	/**
	 *
	 * @param source
	 * @param matrix
	 */
	public draw(source:BitmapData, matrix?:Matrix);
	public draw(source:HTMLImageElement, matrix?:Matrix);
	public draw(source:any, matrix?:Matrix)
	{
		if (this._locked) {

			// If canvas is locked:
			//
			//      1) copy image data back to canvas
			//      2) draw object
			//      3) read _imageData back out

			if (this._imageData)
				this._context.putImageData(this._imageData, 0, 0); // at coords 0,0

			this._draw(source, matrix);

			if (this._imageData)
				this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);
		} else {
			this._draw(source, matrix);
		}
	}

	private _draw(source:BitmapData, matrix:Matrix);
	private _draw(source:HTMLImageElement, matrix:Matrix);
	private _draw(source:any, matrix:Matrix)
	{
		if (source instanceof BitmapData) {
			this._context.save();

			if (matrix != null)
				this._context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);

			this._context.drawImage(source.canvas, 0, 0)
			this._context.restore();

		} else if (source instanceof HTMLImageElement) {
			this._context.save();

			if (matrix != null)
				this._context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);

			this._context.drawImage(source, 0, 0)
			this._context.restore();
		}

	}

	public copyChannel(sourceBitmap:BitmapData, sourceRect:Rectangle, destPoint:Point, sourceChannel:number, destChannel:number)
	{
		var imageData:ImageData = sourceBitmap.imageData;

		if (!this._locked)
			this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);

		if (this._imageData) {
			var sourceData:Array<number> = sourceBitmap.imageData.data;
			var destData:Array<number> = this._imageData.data;

			var sourceOffset:number = Math.round(Math.log(sourceChannel)/Math.log(2));
			var destOffset:number = Math.round(Math.log(destChannel)/Math.log(2));

			var i:number /*uint*/, j:number /*uint*/, sourceIndex:number /*uint*/, destIndex:number /*uint*/;
			for (i = 0; i < sourceRect.width; ++i) {
				for (j = 0; j < sourceRect.height; ++j) {
					sourceIndex = (i + sourceRect.x + (j + sourceRect.y)*sourceBitmap.width)*4;
					destIndex = (i + destPoint.x + (j + destPoint.y)*this.width)*4;

					destData[destIndex + destOffset] = sourceData[sourceIndex + sourceOffset];
				}
			}
		}

		if (!this._locked) {
			this._context.putImageData(this._imageData, 0, 0);
			this._imageData = null;
		}
	}

	public colorTransform(rect:Rectangle, colorTransform:ColorTransform)
	{
		if (!this._locked)
			this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);

		if (this._imageData) {
			var data:Array<number> = this._imageData.data;

			var i:number /*uint*/, j:number /*uint*/, index:number /*uint*/;
			for (i = 0; i < rect.width; ++i) {
				for (j = 0; j < rect.height; ++j) {
					index = (i + rect.x + (j + rect.y)*this.width)*4;

					data[index] = data[index]*colorTransform.redMultiplier + colorTransform.redOffset;
					data[index + 1] = data[index + 1]*colorTransform.greenMultiplier + colorTransform.greenOffset;
					data[index + 2] = data[index + 2]*colorTransform.blueMultiplier + colorTransform.blueOffset;
					data[index + 3] = data[index + 3]*colorTransform.alphaMultiplier + colorTransform.alphaOffset;
				}
			}
		}

		if (!this._locked) {
			this._context.putImageData(this._imageData, 0, 0);
			this._imageData = null;
		}
	}

	/**
	 *
	 * @param {ImageData}
	 */
	public set imageData(value:ImageData)
	{
		this._context.putImageData(value, 0, 0);
	}

	/**
	 *
	 * @returns {ImageData}
	 */
	public get imageData():ImageData
	{
		return this._context.getImageData(0, 0, this._rect.width, this._rect.height)
	}

	/**
	 *
	 * @returns {number}
	 */
	public get width():number
	{
		return <number> this._imageCanvas.width;
	}

	/**
	 *
	 * @param {number}
	 */
	public set width(value:number)
	{
		this._rect.width = value;
		this._imageCanvas.width = value;
	}

	/**
	 *
	 * @returns {number}
	 */
	public get height():number
	{
		return <number> this._imageCanvas.height;
	}

	/**
	 *
	 * @param {number}
	 */
	public set height(value:number)
	{
		this._rect.height = value;
		this._imageCanvas.height = value;
	}

	/**
	 *
	 * @param {Rectangle}
	 */
	public get rect():Rectangle
	{
		return this._rect;
	}

	/**
	 *
	 * @returns {HTMLCanvasElement}
	 */
	public get canvas()
	{
		return this._imageCanvas;
	}

	/**
	 *
	 * @returns {HTMLCanvasElement}
	 */
	public get context():CanvasRenderingContext2D
	{
		return this._context;
	}

	// Private

	/**
	 * convert decimal value to Hex
	 */
	private hexToRGBACSS(d:number):string
	{
		var argb:number[] = ColorUtils.float32ColorToARGB(d);

		if (this._transparent == false) {
			argb[0] = 1;

			return 'rgba(' + argb[1] + ',' + argb[2] + ',' + argb[3] + ',' + argb[0] + ')';
		}

		return 'rgba(' + argb[1] + ',' + argb[2] + ',' + argb[3] + ',' + argb[0]/255 + ')';
	}
}

export = BitmapData;