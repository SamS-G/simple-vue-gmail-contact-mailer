<script setup lang="ts">
import { ref } from 'vue'
import VForm from '@/components/Base/VForm.vue'
import VSelect from '@/components/Base/VSelect.vue'
import VInput from '@/components/Base/VInput.vue'
import VModalStatus from '~/components/Base/VModalStatus.vue'
import type { ModalStatus } from '~/server/interfaces/modal-status'
// Your data represent yours fields order / content
const fieldsData = ref({
  select: {
    id: 'reason',
    name: 'reason',
    type: 'select',
    placeholder: 'Please select the reason',
    label: 'Reason *',

    options: [
      {
        label: 'Sales',
        value: 'sales',
      },
      {
        label: 'After-sales',
        value: 'after-sales',
      },
      {
        label: 'Other',
        value: 'other',
      },
    ],
  },

  inputs: [
    // input text
    {
      id: 'subject',
      name: 'subject',
      label: 'Subject *',
      placeholder: 'Please enter your subject',
      type: 'text',
    },
    {
      id: 'name',
      name: 'name',
      label: 'First and last name *',
      placeholder: 'Enter your first and last name',
      type: 'text',
    },
    {
      id: 'email',
      name: 'email',
      label: 'Email *',
      placeholder: 'Enter your email',
      type: 'email',
    },
    // textarea
    {
      id: 'message',
      name: 'message',
      placeholder: 'Your message *',
      rows: '10',
      label: 'You message *',
      type: 'textarea',
    },
    // checkbox
    {
      id: 'terms',
      name: 'terms',
      type: 'checkbox',
      checkboxLabel:
        'I accept the general conditions',
      options: {
        excludeFromData: true,
      },
    },
    // button
    {
      id: 'submit-button',
      name: 'submit',
      type: 'submit',
      value: 'Submit',
    },
  ],
})
const modalData = ref<ModalStatus>({ visible: false })
const statusModalState = (val: ModalStatus) => {
  modalData.value = val
  setTimeout(clearModalStatus, 5000) // Remove after 5s
}
const clearModalStatus = () => {
  modalData.value.visible = false
}
</script>

<template>
  <section
    id="contact"
    class="container"
  >
    <div>
      <div class="text-center">
        <h3 class="section-title">
          <font-awesome :icon="['fa', 'address-card']" />
          Contacts
          <font-awesome :icon="['fa', 'address-card']" />
        </h3>
        <p>
          Hello, keyboard adventurer! Got a question, problem or just want to drop us a line? Fill in this form.
          We'll get back to you as quickly as if we had an unlimited coffee machine.
        </p>
      </div>
      <div class="container mt-5">
        <div class="contact-form">
          <h3 class="text-center">
            <span class="line-behind">Contact form</span>
          </h3>

          <VForm
            @update-status-modal="statusModalState"
          >
            <template #select>
              <VSelect
                :select="fieldsData.select"
              />
            </template>
            <template #input>
              <VInput
                v-for="(input, i) in fieldsData.inputs"
                :key="i"
                :input="input"
                :validate="true"
                :errors="errors"
              />
            </template>
            <template #modal>
              <VModalStatus
                :visible="modalData.visible"
                :status="modalData.status"
                :success-message="modalData.successMessage"
                :error-message="modalData.errorMessage"
                :success-title="modalData.successTitle"
                :error-title="modalData.errorTitle"
                @close="modalData.visible = false"
              />
            </template>
          </VForm>
          <p class="my-3 mx-3">
            <strong>*</strong> These fields are required.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
