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
			The human mind is an excellent pattern recognition device; so much so that
			it can’t help but assign images and concepts where they may not otherwise
			exist. My artwork focuses almost entirely on color in a way that allows
			the viewer to get a glimpse into this usually unnoticed mental process of
			pattern recognition.
		</p>
		<p>
			Everyone has experienced this process when seeing images in the clouds, or
			when viewing a Rorschach test. In my work, I give the viewer an abstract
			composition of texture and flowing color so that their visual senses have
			the necessary building blocks to let their mind naturally sculpt out
			patterns, forms, and concepts. Through this, my work exists in two
			different forms, both concretely in the physical form and uniquely in the
			viewer’s mind.
		</p>
		<p>
			Throughout my body of work the different mediums influence this mental
			process in different ways. Where paint allows for a more visual reaction
			in the viewer’s mind, the digital medium allows for a more conceptual
			reaction.
		</p>
	</div>

	<!-- TODO: Add in about the artist. -->
	<!-- <div class="card">
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
	</div> -->
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
