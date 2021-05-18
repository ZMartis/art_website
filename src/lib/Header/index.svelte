<script lang="ts">
	import Nav from '$lib/Header/nav.svelte';
	import MenuButton from '$lib/Header/menu_button.svelte';

	let navVisible = false;
	function toggleNav() {
		console.log('snth');
		navVisible = !navVisible;
	}
</script>

<header>
	<div class="heading">
		<div class="logo">
			<img src="z_logo.svg" alt="Z Logo" />
			<h1><a href="/">ZACH MARTIS</a></h1>
		</div>
		<MenuButton on:toggleNav={toggleNav} />
	</div>
	<Nav {navVisible} />
</header>

<style>
	header {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.heading {
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}
	.logo {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	img {
		height: 2.5rem;
		margin-right: 5px;
	}
	h1 {
		margin: 0 30px 0 0;
		font-size: 1.5rem;
		letter-spacing: 0.1rem;
		color: var(--primary-text-color);
	}
	@media (min-width: 768px) {
		header {
			flex-direction: row;
		}
		.heading {
			width: unset;
		}
	}

	@media (min-width: 1366px) {
	}
</style>
