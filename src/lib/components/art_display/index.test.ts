import { render } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import ArtDisplay from './index.svelte'
import type { Artwork } from '$lib/types/artwork'

const buildArtwork = (overrides: Partial<Artwork> = {}): Artwork => ({
	id: '0',
	title: 'Hello World.',
	image: '/images/hello-world-large.jpg',
	smallImage: '/images/hello-world.jpg',
	grouping: 'canvas',
	medium: 'Oil',
	price: '$100',
	description: 'Test description.',
	size: '10x10',
	sold: false,
	...overrides
})

describe('ArtDisplay', () => {
	it('renders a product listing for each artwork', () => {
		const artworks: Artwork[] = [
			buildArtwork(),
			buildArtwork({
				id: '1',
				title: 'Second Piece.',
				image: '/images/second-piece-large.jpg',
				smallImage: '/images/second-piece.jpg'
			})
		]

		const { getAllByRole, getByText } = render(ArtDisplay, { artworks })

		expect(getAllByRole('link')).toHaveLength(2)
		expect(getByText('Hello World.')).toBeInTheDocument()
		expect(getByText('Second Piece.')).toBeInTheDocument()
	})
})
