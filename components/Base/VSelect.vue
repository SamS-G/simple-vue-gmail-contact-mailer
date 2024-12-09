<script setup lang="ts">
import { defineProps } from 'vue'
import { useField } from 'vee-validate'
import VOption from '@/components/Base/VOption.vue'
import type { SelectProps } from '~/interfaces/form-component'
import { form as validationSchemas } from '~/server/schema/form'

const props = defineProps<SelectProps>()

const { meta, errorMessage, handleBlur, handleChange, value } = useField(
  () => props.select.name,
  validationSchemas,
  {
    validateOnMount: false,
    validateOnValueUpdate: false,

  })
const validationListeners = {
  blur: (e: Event) => handleBlur(e, true),
  change: handleChange,
  input: (e: Event) => handleChange(e, !!errorMessage.value),
}
</script>

<template>
  <div
    :id="props.select.id"
    class="select-wrapper"
  >
    <!-- Select label -->
    <label>{{ props.select.label }}</label>
    <span
      v-if="meta.valid && props.select.type !== 'submit'"
      class="is-valid"
    ><font-awesome
      :icon="['fas', 'check']"
      size="ll"
    /></span>
    <VOption
      :reset="value as boolean"
      :class="{ error: errorMessage }"
      :options="props.select.options"
      :placeholder="props.select.placeholder"
      v-on="validationListeners"
      @update:model-value="handleChange"
    />
    <!-- Valid field error -->
    <p
      v-if="errorMessage"
      class="error-message"
    >
      <small
        v-if="errorMessage"
        class="form-text text-danger"
      >
        {{ errorMessage }}
      </small>
    </p>
  </div>
</template>

<style scoped>
.select-wrapper {
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: max-content;
  position: relative;
  display: inline-block;
  padding-left: 2rem;
  padding-right: 2rem;
  min-height: 10vh;
}
.select-wrapper.is-open {
  border-color: #666;
}
.select-wrapper .is-valid {
  position: absolute;
  left: 0.3vw;
  top: 40%;
  transform: translateY(-50%);
  cursor: pointer;
}
.error-message {
  border-color: red;
}
.is-valid svg {
  color: #28a745;
  filter: none;
}
p {
  margin: 0;
}
.select-wrapper label {
  font-weight: bolder;
}
</style>
