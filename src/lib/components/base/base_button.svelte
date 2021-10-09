<script lang="ts">
	export let disabled: boolean = false;
	export let type: string = 'button';
</script>

<button {type} {disabled}><slot /></button>

<style>
	/* your mobile styles go here */
	button {
		padding: 0.1rem 0.5rem;
		background-color: var(--primary-color);
		color: var(--white);
		border: 0.1rem solid var(--primary-color);
	}
	button:hover {
		cursor: pointer;
		background-color: var(--white);
		color: var(--primary-color);
		border: 0.1rem solid var(--primary-color);
	}
	button:disabled {
		background-color: var(--disabled-grey);
		color: var(--white);
		border: 0.1rem solid var(--disabled-grey);
		cursor: not-allowed;
	}
	@media (min-width: 768px) {
		/* your tablet styles go here */
	}
	@media (min-widthe: 1366px) {
		/* your desktop styles go here */
	}
</style>
