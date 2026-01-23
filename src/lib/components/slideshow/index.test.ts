import { render } from '@testing-library/svelte'
import { tick } from 'svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Slideshow from './index.svelte'
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

describe('Slideshow', () => {
	afterEach(() => {
		vi.useRealTimers()
	})

	it('shows the first slide after the start delay', async () => {
		vi.useFakeTimers()

		const slides: Artwork[] = [buildArtwork()]

		const { getByRole } = render(Slideshow, { slides })

		vi.advanceTimersByTime(500)
		await tick()

		const link = getByRole('link')
		const image = getByRole('img', { name: 'Hello World.' })

		expect(link.getAttribute('href')).toMatch(/\/artwork\/Hello_World\+/)
		expect(image.getAttribute('src')).toBe('/images/hello-world.jpg')
	})

	it('advances to the next slide on the interval', async () => {
		vi.useFakeTimers()

		const slides: Artwork[] = [
			buildArtwork(),
			buildArtwork({
				id: '1',
				title: 'Second One.',
				image: '/images/second-one-large.jpg',
				smallImage: '/images/second-one.jpg'
			})
		]

		const { getByRole } = render(Slideshow, { slides })

		vi.advanceTimersByTime(500)
		await tick()

		expect(getByRole('img', { name: 'Hello World.' }).getAttribute('src')).toBe(
			'/images/hello-world.jpg'
		)

		vi.advanceTimersByTime(10000)
		await tick()

		const nextImage = getByRole('img', { name: 'Second One.' })
		const nextLink = nextImage.closest('a')

		expect(nextLink?.getAttribute('href')).toMatch(/\/artwork\/Second_One\+/)
		expect(nextImage.getAttribute('src')).toBe('/images/second-one.jpg')
	})

	it('wraps back to the first slide after the last one', async () => {
		vi.useFakeTimers()

		const slides: Artwork[] = [
			buildArtwork(),
			buildArtwork({
				id: '1',
				title: 'Second One.',
				image: '/images/second-one-large.jpg',
				smallImage: '/images/second-one.jpg'
			})
		]

		const { getByRole } = render(Slideshow, { slides })

		vi.advanceTimersByTime(500)
		await tick()

		vi.advanceTimersByTime(10000)
		await tick()

		vi.advanceTimersByTime(10000)
		await tick()

		const loopedImage = getByRole('img', { name: 'Hello World.' })
		expect(loopedImage.getAttribute('src')).toBe('/images/hello-world.jpg')
	})
})
