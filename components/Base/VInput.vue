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
 * then performs a real-time validate when the user corrects
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
    class="input-wrapper"
    :class="{ checkbox: props.input.type === 'checkbox' }"
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
        :class="props.input.type === 'checkbox' || props.input.type === 'radio' ? 'isValidCheck' : 'isValidInput'"
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
.checkbox input {
  margin-right: 1rem;
  border-color: dimgrey;
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
  display: inline-block;
  width: 100%;
  padding-left: 2rem;
  padding-right: 2rem;
  min-height: 9vh;
}
.input-wrapper .isValidCheck,
.input-wrapper .isValidTextA,
.input-wrapper .isValidInput {
  position: absolute;
  left: 0.4vw;
  transform: translateY(-50%);
  cursor: pointer;
}
.input-wrapper .isValidCheck {
  top: 16%;
}
.input-wrapper .isValidInput {
  top: 25%;
}
.input-wrapper .isValidTextA {
  top: 5%;
}
.input-wrapper label {
  padding-left: 2rem;
  padding-right: 2rem;
  font-weight: bolder;
}
.checkbox-label {
  padding: 0!important;
  font-weight: normal!important;
  font-size: 0.87rem;
  font-style: italic;
}
.submit {
  min-height: 0;
}

.checkbox p {
  margin: 0;
}
</style>
