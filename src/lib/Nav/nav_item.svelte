<script lang="ts">
	import { page } from '$app/stores';
	import { capitalize } from 'lodash';
	export let link: string;
	const display = capitalize(link);
</script>

<a href="/{link}" class:active={$page.path === `/${link}`}>{display}</a>

<style>
	a {
		margin-right: 20px;
	}
	a.active {
		text-decoration: underline var(--primary-color);
	}
	a:hover {
		text-decoration-color: var(--primary-color);
	}
</style>
