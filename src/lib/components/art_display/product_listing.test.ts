import { fireEvent, render } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import ProductListing from './product_listing.svelte'
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

describe('ProductListing', () => {
	it('renders the artwork link and image details', () => {
		const artwork = buildArtwork({
			id: '1',
			title: 'Sunrise Day.',
			subTitle: 'Morning',
			image: '/images/sunrise-large.jpg',
			smallImage: '/images/sunrise.jpg'
		})

		const { getByRole } = render(ProductListing, { artwork })

		const link = getByRole('link')
		const image = getByRole('img', { name: 'Sunrise Day. (Morning)' })

		expect(link.getAttribute('href')).toBe('/artwork/Sunrise_Day+')
		expect(image.getAttribute('src')).toBe('/images/sunrise.jpg')
	})

	it('falls back to the full image when no small image exists', () => {
		const artwork = buildArtwork({
			id: '2',
			title: 'Night Sky.',
			image: '/images/night-sky.jpg',
			smallImage: undefined
		})

		const { getByRole } = render(ProductListing, { artwork })

		const image = getByRole('img', { name: 'Night Sky.' })
		expect(image.getAttribute('src')).toBe('/images/night-sky.jpg')
	})

	it('shows the price overlay on hover when unsold', async () => {
		const artwork = buildArtwork({
			id: '3',
			title: 'Priced Piece.',
			price: '$250',
			sold: false
		})

		const { getByRole, getByText } = render(ProductListing, { artwork })

		await fireEvent.mouseEnter(getByRole('link'))

		expect(getByText('$250')).toBeInTheDocument()
	})

	it('shows the sold overlay when artwork is sold', async () => {
		const artwork = buildArtwork({
			id: '4',
			title: 'Sold Piece.',
			sold: true
		})

		const { getByRole, getByText } = render(ProductListing, { artwork })

		await fireEvent.mouseEnter(getByRole('link'))

		expect(getByText('Sold')).toBeInTheDocument()
	})

	it('renders title with number and subtitle', () => {
		const artwork = buildArtwork({
			id: '5',
			title: 'Numbered Piece.',
			number: 12,
			subTitle: 'Edition A'
		})

		const { getAllByRole, getByText } = render(ProductListing, { artwork })

		const [titleHeading, subtitleHeading] = getAllByRole('heading', { level: 3 })
		expect(titleHeading.textContent).toContain('12.Numbered Piece.')
		expect(subtitleHeading).toHaveClass('subTitle')
		expect(getByText('(Edition A)')).toBeInTheDocument()
	})

	it('converts the title to the artwork route', () => {
		const artwork = buildArtwork({
			id: '6',
			title: 'Hello.World'
		})

		const { getByRole } = render(ProductListing, { artwork })

		expect(getByRole('link').getAttribute('href')).toBe('/artwork/Hello+World')
	})

	it('removes the overlay on mouse leave', async () => {
		const artwork = buildArtwork({
			id: '7',
			title: 'Hover Toggle.',
			price: '$400'
		})

		const { getByRole, getByText, queryByText } = render(ProductListing, { artwork })
		const link = getByRole('link')

		await fireEvent.mouseEnter(link)
		expect(getByText('$400')).toBeInTheDocument()

		await fireEvent.mouseLeave(link)
		expect(queryByText('$400')).not.toBeInTheDocument()
	})

	it('does not render a subtitle when missing', () => {
		const artwork = buildArtwork({
			id: '8',
			title: 'No Subtitle.',
			subTitle: undefined
		})

		const { container, queryByText } = render(ProductListing, { artwork })

		expect(queryByText('No Subtitle.')).toBeInTheDocument()
		expect(container.querySelector('h3.subTitle')).toBeNull()
	})
})
