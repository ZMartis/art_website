export interface Artwork {
	id: string;
	number?: number;
	title: string;
	subTitle?: string;
	image: string;
	smallImage?: string;
	medium: 'canvas' | 'paintOnPaper' | 'macro' | 'pixelSort' | 'stripes';
	price: string;
	description: string;
	sold: boolean;
}
