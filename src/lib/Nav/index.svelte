<script lang="ts">
	import NavItem from './nav_item.svelte';
	const pages: string[] = ['work', 'about', 'contact', 'shows'];

	export let navVisible = false;
</script>

<nav class={navVisible ? 'activeNav' : ''}>
	{#each pages as link}
		<NavItem {link} />
	{/each}
</nav>

<style>
	nav {
		display: none;
		flex-direction: column;
	}
	.activeNav {
		display: flex;
	}
	@media (min-width: 768px) {
		nav {
			display: flex;
			flex-direction: row;
		}
	}
	@media (min-width: 1366px) {
	}
</style>
