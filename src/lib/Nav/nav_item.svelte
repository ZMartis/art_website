<script lang="ts">
	import { page } from '$app/stores';
	import { capitalize } from 'lodash';
	export let link: string;
	const display = capitalize(link);
</script>

<a href="/{link}" class:active={$page.path === `/${link}`}>{display}</a>

<style>
	a {
		width: 100%;
		text-align: center;
		letter-spacing: 0.1rem;
	}
	a:hover {
		text-decoration-color: var(--primary-color);
	}
	.active {
		text-decoration: underline var(--primary-color) 0.2rem;
	}
	@media (min-width: 768px) {
		a {
			width: unset;
			margin-right: 20px;
			text-align: left;
		}
	}

	@media (min-width: 1366px) {
	}
</style>
