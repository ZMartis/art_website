<script lang="ts">
	import { page } from '$app/stores';
	import { capitalize, includes } from 'lodash-es';
	export let link: string;
	const display = capitalize(link);
	export let toggleNav: Function;
</script>

<a
	href="/{link}"
	class:active={$page.path === `/${link}`}
	on:click={toggleNav()}
>
	<span class:active={includes($page.path, `/${link}`)}>{display}</span>
</a>

<style>
	a {
		width: 100%;
		font-size: 0.9rem;
		text-align: center;
		letter-spacing: 0.1rem;
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		position: relative;
		padding: 0.1rem 0;
	}

	span {
		display: flex;
		flex-direction: row;
		align-items: center;
		position: relative;
	}

	span.active:before {
		content: '';
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50rem;
		background: var(--primary-color);
		left: -1rem;
		position: absolute;
	}

	@media (min-width: 768px) {
		a {
			width: unset;
			margin-right: 20px;
			text-align: left;
		}
		a:hover:after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			height: var(--hover-menu-indicator-size);
			background: var(--primary-color);
			border-radius: 50rem;
		}
		.active:after {
			content: '';
			position: absolute;
			height: 0;
			bottom: 0;
			left: 0;
			right: 0;
			height: var(--active-menu-indicator-size);
			background: var(--primary-color);
			border-radius: 50rem;
		}
		span {
			all: unset;
		}
		span.active:before {
			all: unset;
		}
	}

	@media (min-width: 1366px) {
	}
</style>
