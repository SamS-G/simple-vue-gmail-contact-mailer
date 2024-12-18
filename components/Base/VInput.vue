<script setup lang="ts">
import { useField } from 'vee-validate'
import type { InputProps } from '~/interfaces/form-component'
import { form as validationSchemas } from '~/server/schema/form'

const props = defineProps<InputProps>()

const { meta, errorMessage, handleBlur, handleChange, value } = useField(
  () => props.input.name,
  validationSchemas,
  {
    validateOnMount: false,
    validateOnValueUpdate: false,

  })
/**
 * Checks the field once the user moves on to the next one,
 * then performs a real-time validate when the user corrects.
 */
const validationListeners = {
  blur: (e: Event) => {
    handleBlur(e, true)
  },
  change: handleChange,
  input: (e: Event) => {
    const target = e.target as HTMLInputElement
    props.input.type === 'checkbox'
      ? handleChange(target.checked, !!errorMessage.value)
      : handleChange(e, !!errorMessage.value)
  },
}
</script>

<template>
  <div
    :class="{
      'input-wrapper-checkbox': props.input.type === 'checkbox',
      'input-wrapper-text-area': props.input.type === 'textarea',
      'input-wrapper': props.input.type !== 'checkbox' && props.input.type !== 'textarea',
    }"
  >
    <!-- Input and text area label -->
    <label :for="props.input.id">{{ input.label }}</label>
    <div
      v-if="props.input.type === 'textarea'"
      class="text-area-container"
    >
      <span
        v-if="meta.valid && props.input.type !== 'submit'"
        class="isValidTextA"
      ><font-awesome
        :icon="['fas', 'check']"
        size="l"
      /></span>
      <textarea
        :id="props.input.id"
        class="form-control"
        :class="{ error: errorMessage }"
        :placeholder="props.input.placeholder"
        :rows="props.input.rows"
        :cols="props.input.cols"
        :name="props.input.name"
        :value="value as undefined"
        v-on="validationListeners"
      />
      <!-- Valid field error -->
      <p v-if="errorMessage">
        <small
          class="form-text text-danger"
        >{{ errorMessage }}</small>
      </p>
    </div>
    <div
      v-else
      class="input-container"
      :class="{
        submit: input.type === 'submit',
        checkbox: input.type === 'checkbox',
      }"
    >
      <!-- Field is valid icon -->
      <span
        v-if="meta.valid && props.input.type !== 'submit'"
        :class="['checkbox', 'radio'].includes(props.input.type) ? 'isValidCheck' : 'isValidInput'"
      ><font-awesome
        :icon="['fas', 'check']"
        size="l"
      /></span>
      <!-- Input or checkbox -->
      <input
        :id="props.input.id"
        :checked="input.type === 'checkbox' && value !== false"
        :value="input.type === 'submit' ? input.value : value"
        :name="props.input.name"
        :class="{
          'form-control': input.type !== 'checkbox' && 'submit',
          'form-check-input': input.type === 'checkbox',
          'btn btn-success btn-sm': input.type === 'submit',
          'error': errorMessage,
        }"
        :placeholder="input.placeholder"
        :type="input.type"
        v-on="validationListeners"
      >
      <!-- Checkbox label -->
      <label
        v-if="input.checkboxLabel"
        :for="props.input.id"
        class="checkbox-label"
      >
        {{ input.checkboxLabel }}
      </label>
      <!-- Valid field error -->
      <p
        v-if="errorMessage"
        class="error"
      >
        <small class="form-text text-danger">{{ errorMessage }}</small>
      </p>
    </div>
  </div>
</template>

<style scoped>
.checkbox .input-container {
  margin-right: 1rem;
  border-color: dimgrey;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  align-items: center;
  gap: 10px;
}
.form-check-input {
  grid-column: 1;
  grid-row: 1;
  border: 1px solid dimgrey;
}
.checkbox-label {
  grid-column: 2;
  grid-row: 1;
  margin-left: 1rem;
  padding: 0!important;
  font-weight: normal!important;
  font-size: 0.87rem;
  font-style: italic;
}
p {
  grid-column: 1 / span 2;
  grid-row: 2;
}
.btn-sm {
  width: max-content;
}
.isValidCheck svg, .isValidTextA svg,
.isValidInput svg {
  color: #28a745;
  filter: none;
}
.error {
  border-color: red;
}
.input-container, .text-area-container {
  position: relative;
  align-items: center;
  width: 100%;
  padding-left: 2rem;
  padding-right: 2rem;
  margin-top: 0.5vh;
}
.input-container .isValidCheck,
.text-area-container .isValidTextA,
.input-container .isValidInput {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  padding-left: 0.5vw;
}
.input-wrapper {
  position: relative;
}
.input-wrapper label, .input-wrapper-text-area label {
  padding-left: 2rem;
  padding-right: 2rem;
  font-weight: bolder;
  display: block;
}
.submit {
  min-height: 0;
}

.checkbox p {
  margin: 0;
}
</style>
