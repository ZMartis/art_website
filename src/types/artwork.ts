export interface Artwork {
	id: string
	number?: number
	title: string
	subTitle?: string
	image: string
	smallImage?: string
	grouping: 'canvas' | 'paintOnPaper' | 'macro' | 'pixelSort' | 'stripes'
	medium: string
	price: string
	description: string
	size: string
	sold: boolean
}
