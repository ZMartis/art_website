<script lang="ts">
	import { page } from '$app/stores';
	import Nav from '$lib/components/Header/nav.svelte';
	import MenuButton from '$lib/components/Header/menu_button.svelte';
	import greenLogo from '$lib/images/z_logo_green.svg';
	import blackLogo from '$lib/images/z_logo_black.svg';

	let navVisible = false;
	function toggleNav() {
		navVisible = !navVisible;
	}

	$: logo = $page.path === '/' ? greenLogo : blackLogo;
</script>

<header>
	<div class="heading">
		<div class="logo">
			<img src={logo} alt="Z Logo" />
			<h1><a href="/">ZACH MARTIS</a></h1>
		</div>
		<MenuButton on:toggleNav={toggleNav} />
	</div>
	<Nav {navVisible} {toggleNav} />
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
		margin: 0.8rem;
		height: 1.3rem;
	}
	h1 {
		margin: 0 30px 0 0;
		letter-spacing: 0.1rem;
		color: var(--primary-text-color);
	}
	a {
		position: relative;
	}
	@media (min-width: 768px) {
		header {
			flex-direction: row;
		}
		.heading {
			width: unset;
		}
		a:hover:after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			height: var(--hover-menu-indicator-size);
			background: var(--accent-color);
			border-radius: 50rem;
		}
	}

	@media (min-width: 1366px) {
	}
</style>
