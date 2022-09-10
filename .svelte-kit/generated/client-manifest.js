export { matchers } from './client-matchers.js';

			export const nodes = [() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13')];

			export const server_loads = [];

			export const dictionary = {
	"": [3],
	"about": [4],
	"contact": [6],
	"submitted": [7],
	"work": [8,[2]],
	"work/canvas": [9,[2]],
	"work/macro": [10,[2]],
	"work/paint_on_paper": [11,[2]],
	"work/pixel_sort": [12,[2]],
	"work/stripes": [13,[2]],
	"artwork/[title]": [5]
};

			export const hooks = {
				handleError: (({ error }) => { console.error(error); return { message: 'Internal Error' }; }),
			};