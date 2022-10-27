<script lang="ts">
	import NavItem from '$lib/components/header/nav_item.svelte'
	const pages: string[] = ['work', 'about', 'contact'] // TODO: Add 'shows' page when it's completed

	export let navVisible = false
	export let toggleNav: Function
</script>

<nav class={navVisible ? 'activeNav' : ''}>
	{#each pages as link}
		<NavItem {link} {toggleNav} />
	{/each}
</nav>

<style>
	nav {
		display: none;
		flex-direction: column;
		width: 100%;
	}
	.activeNav {
		display: flex;
	}
	@media (min-width: 768px) {
		nav {
			display: flex;
			flex-direction: row;
			width: unset;
		}
	}
	@media (min-width: 1366px) {
	}
</style>
