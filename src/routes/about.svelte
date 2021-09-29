<script lang="ts">
	import { fade } from 'svelte/transition';
</script>

<div
	in:fade={{ duration: 1000, delay: 1001 }}
	out:fade={{ duration: 1000 }}
	class="container"
>
	<div class="card">
		<h1>Artist Statement</h1>
		<p>
			But I must explain to you how all this mistaken idea of denouncing
			pleasure and praising pain was born and I will give you a complete account
			of the system, and expound the actual teachings of the great explorer of
			the truth, the master-builder of human happiness. No one rejects,
			dislikes, or avoids pleasure itself, because it is pleasure, but because
			those who do not know how to pursue pleasure rationally encounter
			consequences that are extremely painful. Nor again is there anyone who
			loves or pursues or desires to obtain pain of itself, because it is pain,
			but because occasionally circumstances occur in which toil and pain can
			procure him some great pleasure. To take a trivial example, which of us
			ever undertakes laborious physical exercise, except to obtain some
			advantage from it? But who has any right to find fault with a man who
			chooses to enjoy a pleasure that has no annoying consequences, or one who
			avoids a pain that produces no resultant pleasure?
		</p>
	</div>

	<div class="card">
		<h1>About Zach</h1>
		<p>
			But I must explain to you how all this mistaken idea of denouncing
			pleasure and praising pain was born and I will give you a complete account
			of the system, and expound the actual teachings of the great explorer of
			the truth, the master-builder of human happiness. No one rejects,
			dislikes, or avoids pleasure itself, because it is pleasure, but because
			those who do not know how to pursue pleasure rationally encounter
			consequences that are extremely painful. Nor again is there anyone who
			loves or pursues or desires to obtain pain of itself, because it is pain,
			but because occasionally circumstances occur in which toil and pain can
			procure him some great pleasure. To take a trivial example, which of us
			ever undertakes laborious physical exercise, except to obtain some
			advantage from it? But who has any right to find fault with a man who
			chooses to enjoy a pleasure that has no annoying consequences, or one who
			avoids a pain that produces no resultant pleasure?
		</p>
	</div>
</div>

<style>
	/* your mobile styles go here */
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-bottom: 4rem;
		width: 100%;
	}
	.card {
		width: 80%;
		max-width: 60rem;
		background-color: white;
		box-shadow: 20px 18px 37px 1px rgba(0, 0, 0, 0.15);
		border: 1px solid #eee;
		padding: 2rem;
		margin: 2rem 0;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	h1 {
		margin-bottom: 0;
		max-width: 40rem;
		text-align: left;
		width: 100%;
	}
	p {
		max-width: 40rem;
	}
	@media (min-width: 768px) {
		/* your tablet styles go here */
		.card {
			padding: 4rem 2rem;
		}
	}
	@media (min-widthe: 1366px) {
		/* your desktop styles go here */
	}
</style>
