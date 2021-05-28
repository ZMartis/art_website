export interface Artwork {
	id: string;
	number?: number;
	title: string;
	subTitle?: string;
	url: string;
	medium: 'canvas' | 'paintOnPaper' | 'macro' | 'pixelSort' | 'stripes';
	price: string;
	description: string;
	sold: boolean;
}
