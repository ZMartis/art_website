<script>
	import NavItem from './nav_item.svelte';
	const pages = ['work', 'about', 'contact', 'shows'];
</script>

<nav>
	{#each pages as link}
		<NavItem {link} />
	{/each}
</nav>

<style>
	nav {
		margin-left: 30px;
	}
</style>
