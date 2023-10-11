import { Texture } from "pixi.js";
import particle from "./particle.png"

export default {
	lifetime: {
		min: 1,
		max: 1
	},
	frequency: 0.001,
	emitterLifetime: 0.1,
	maxParticles: 100,
	pos: {
		x: 0,
		y: 0
	},
	addAtBack: false,
	behaviors: [
		{
			type: 'alpha',
			config: {
				alpha: {
					list: [
						{
							value: 1,
							time: 0
						},
						{
							value: 0,
							time: 1
						}
					],
				},
			}
		},
		{
			type: 'scale',
			config: {
				scale: {
					list: [
						{
							value: 0.2,
							time: 0
						},
						{
							value: 0.001,
							time: 1
						}
					],
				},
			}
		},
		{
			type: 'moveSpeed',
			config: {
				speed: {
					list: [
						{
							value: 200,
							time: 0
						},
						{
							value: 100,
							time: 1
						}
					],
					isStepped: false
				},
			}
		},
		{
			type: 'rotationStatic',
			config: {
				min: 0,
				max: 360
			}
		},
		{
			type: 'spawnShape',
			config: {
				type: 'circle',
				data: {
					x: 0,
					y: 0,
					radius: 15
				}
			}
		},
		{
			type: "textureSingle",
			config: {
				texture: Texture.from(particle)
			}
		}
	]
}