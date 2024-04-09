<script>
	import Icon from '$lib/atoms/Icon.svelte'
	import Label from '$lib/atoms/Label.svelte'
    import CheckInput from '$lib/atoms/inputfields/CheckInput.svelte';

	export let iconSrc
	export let labelFor
	export let labelText
    export let inputType
	export let checkName;
	export let checkId;
	export let options;
    export let isRequired;
    export let data;
</script>

<div class="form-field">
	<span>
		<Icon {iconSrc} --icon-width="1.4rem"></Icon>
		<Label {labelFor} {labelText}></Label>
	</span>

	<CheckInput {inputType} {checkName} {checkId} {options} {isRequired} {data}></CheckInput>
</div>

<style>
    .form-field {
        display: flex;
        flex-direction: column;
    }
	span {
		display: flex;
		flex-direction: row;
		align-items: center;
		column-gap: 0.3rem;
		margin-bottom: 0.3rem;
	}
</style>
