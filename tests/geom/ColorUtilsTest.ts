import ColorTransform			from "awayjs-core/lib/geom/ColorTransform";
import ColorUtils				from "awayjs-core/lib/utils/ColorUtils";

class ColorUtilsTest
{
	constructor()
	{
		/*
		constructor(    inRedMultiplier:number = 1.0,  inGreenMultiplier:number = 1.0, inBlueMultiplier:number = 1.0,  inAlphaMultiplier:number = 1.0,
						inRedOffset:number = 0.0,      inGreenOffset:number = 0.0,     inBlueOffset:number = 0.0,      inAlphaOffset:number = 0.0)
		*/

		var ct_RED = new ColorTransform(1, 0, 0, 1, 255, 0, 0, 255);

		console.log("ct_RED - ARGB: ", ColorUtils.float32ColorToARGB( ct_RED.color));

		var ct_GREEN = new ColorTransform(0, 1, 0, 1, 0, 255, 0, 255);

		console.log("ct_GREEN - ARGB: ", ColorUtils.float32ColorToARGB( ct_GREEN.color));

		var ct_BLUE = new ColorTransform(0, 0, 1, 1, 0, 0, 255, 255);

		console.log("ct_BLUE - ARGB: ", ColorUtils.float32ColorToARGB(ct_BLUE.color));

		var ct_RED_a = new ColorTransform(.5, 0, 0, 1, 255, 0, 0, 255);

		console.log("ct_RED_a - ARGB: ", ColorUtils.float32ColorToARGB(ct_RED_a.color));

		var ct_GREEN_a = new ColorTransform(0, .5, 0, 1, 0, 255, 0, 255);

		console.log("ct_GREEN_a - ARGB: ", ColorUtils.float32ColorToARGB(ct_GREEN_a.color));

		var ct_BLUE_a = new ColorTransform(0, 0, .5, 1, 0, 0, 255, 255);

		console.log("ct_BLUE_a - ARGB: ", ColorUtils.float32ColorToARGB( ct_BLUE_a.color));


		console.log('--------------------------------------------------------------------------------');

		ct_RED.color = 0xff0000;
		console.log("SET - ct_RED - ARGB: ", ColorUtils.float32ColorToARGB(ct_RED.color));

		ct_GREEN.color = 0x00ff00;
		console.log("SET - ct_GREEN - ARGB: ", ColorUtils.float32ColorToARGB(ct_GREEN.color));

		ct_BLUE.color = 0x0000ff;
		console.log("SET - ct_BLUE - ARGB: ", ColorUtils.float32ColorToARGB(ct_BLUE.color));
	}
}