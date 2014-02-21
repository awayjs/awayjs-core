///<reference path="../_definitions.ts"/>

/**
 * The Billboard class represents display objects that represent bitmap images.
 * These can be images that you load with the <code>flash.Assets</code> or 
 * <code>flash.display.Loader</code> classes, or they can be images that you 
 * create with the <code>Billboard()</code> constructor.
 *
 * <p>The <code>Billboard()</code> constructor allows you to create a Billboard
 * object that contains a reference to a BitmapData object. After you create a
 * Billboard object, use the <code>addChild()</code> or <code>addChildAt()</code>
 * method of the parent DisplayObjectContainer instance to place the bitmap on
 * the display list.</p>
 *
 * <p>A Billboard object can share its BitmapData reference among several Billboard
 * objects, independent of translation or rotation properties. Because you can
 * create multiple Billboard objects that reference the same BitmapData object,
 * multiple display objects can use the same complex BitmapData object without
 * incurring the memory overhead of a BitmapData object for each display
 * object instance.</p>
 *
 * <p>A BitmapData object can be drawn to the screen by a Billboard object in one
 * of two ways: by using the default hardware renderer with a single hardware surface, 
 * or by using the slower software renderer when 3D acceleration is not available.</p>
 * 
 * <p>If you would prefer to perform a batch rendering command, rather than using a
 * single surface for each Billboard object, you can also draw to the screen using the
 * <code>drawTiles()</code> or <code>drawTriangles()</code> methods which are
 * available to <code>flash.display.Tilesheet</code> and <code>flash.display.Graphics
 * objects.</code></p>
 *
 * <p><b>Note:</b> The Billboard class is not a subclass of the InteractiveObject
 * class, so it cannot dispatch mouse events. However, you can use the
 * <code>addEventListener()</code> method of the display object container that
 * contains the Billboard object.</p>
 */
module away.entities
{
	export class Billboard extends away.base.DisplayObject implements IEntity, away.base.IMaterialOwner, away.library.IAsset
	{
		private _animator:away.animators.IAnimator;
		private _bitmapMatrix:away.geom.Matrix3D;
		private _material:away.materials.IMaterial;
		private _uvTransform:away.geom.UVTransform;

		/**
		 * Defines the animator of the mesh. Act on the mesh's geometry. Defaults to null
		 */
		public get animator():away.animators.IAnimator
		{
			return this._animator;
		}

		/**
		 *
		 */
		public get assetType():string
		{
			return away.library.AssetType.BILLBOARD;
		}

		/**
		 * The BitmapData object being referenced.
		 */
		public bitmapData:away.base.BitmapData; //TODO

		/**
		 *
		 */
		public get material():away.materials.IMaterial
		{
			return this._material;
		}

		public set material(value:away.materials.IMaterial)
		{
			if (value == this._material)
				return;

			if (this._material)
				this._material.iRemoveOwner(this);

			this._material = value;

			if (this._material)
				this._material.iAddOwner(this);
		}

		/**
		 * Controls whether or not the Billboard object is snapped to the nearest pixel.
		 * This value is ignored in the native and HTML5 targets.
		 * The PixelSnapping class includes possible values:
		 * <ul>
		 *   <li><code>PixelSnapping.NEVER</code> - No pixel snapping occurs.</li>
		 *   <li><code>PixelSnapping.ALWAYS</code> - The image is always snapped to
		 * the nearest pixel, independent of transformation.</li>
		 *   <li><code>PixelSnapping.AUTO</code> - The image is snapped to the
		 * nearest pixel if it is drawn with no rotation or skew and it is drawn at a
		 * scale factor of 99.9% to 100.1%. If these conditions are satisfied, the
		 * bitmap image is drawn at 100% scale, snapped to the nearest pixel.
		 * When targeting Flash Player, this value allows the image to be drawn as fast 
		 * as possible using the internal vector renderer.</li>
		 * </ul>
		 */
		public pixelSnapping:string; //TODO
	
		/**
		 * Controls whether or not the bitmap is smoothed when scaled. If
		 * <code>true</code>, the bitmap is smoothed when scaled. If
		 * <code>false</code>, the bitmap is not smoothed when scaled.
		 */
		public smoothing:boolean; //TODO

		/**
		 *
		 */
		public get uvTransform():away.geom.UVTransform
		{
			return this._uvTransform;
		}

		constructor(material:away.materials.IMaterial, width:number, height:number, pixelSnapping:string = "auto", smoothing:boolean = false)
		{
			super();

			this._pIsEntity = true;

			this.material = material;

			//TODO don't rely on scaling for the width and height of the billboard
			this.width = width;
			this.height = height;

			this.pivotPoint = new away.geom.Vector3D(0.5, 0.5, 0);

			this._bitmapMatrix = new away.geom.Matrix3D();

			this._uvTransform = new away.geom.UVTransform(this);
		}

		/**
		 * @protected
		 */
		public pCreateEntityPartitionNode():away.partition.EntityNode
		{
			return new away.partition.EntityNode(this);
		}

		/**
		 * @protected
		 */
		public pUpdateBounds()
		{
			this._pBounds.fromExtremes(0, 0, 0, 1, 1, 0);

			super.pUpdateBounds();
		}

		/**
		 * @protected
		 */
		public pInvalidateBounds()
		{
			super.pInvalidateBounds();

			if (this._iAssignedPartition)
				this._iAssignedPartition.iMarkForUpdate(this);
		}

		/**
		 * @internal
		 */
		public _iSetUVMatrixComponents(offsetU:number, offsetV:number, scaleU:number, scaleV:number, rotationUV:number)
		{

		}
	}
}