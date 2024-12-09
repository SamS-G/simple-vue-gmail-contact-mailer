<script setup lang="ts">
import { ref } from 'vue'
import VForm from '@/components/Base/VForm.vue'
import VSelect from '@/components/Base/VSelect.vue'
import VInput from '@/components/Base/VInput.vue'
import VModalStatus from '~/components/Base/VModalStatus.vue'
import type { ModalStatus } from '~/server/interfaces/modal-status'
// Your data represent yours fields order / content
const data = ref({
  select: {
    id: 'reason',
    name: 'reason',
    type: 'select',
    placeholder: 'Veuillez sélectionner le motif',
    label: 'Motif *',

    options: [
      {
        label: 'Question commercial',
        value: 'Commerce',
      },
      {
        label: 'Question après-vente',
        value: 'Après-vente',
      },
      {
        label: 'Autre',
        value: 'Autre',
      },
    ],
  },

  inputs: [
    // input text
    {
      id: 'subject',
      name: 'subject',
      label: 'Sujet *',
      placeholder: 'Entrez votre sujet',
      type: 'text',
    },
    {
      id: 'name',
      name: 'name',
      label: 'Nom et prénom *',
      placeholder: 'Entrez votre nom et prénom',
      type: 'text',
    },
    {
      id: 'email',
      name: 'email',
      label: 'Email *',
      placeholder: 'Entrez votre adresse email',
      type: 'email',
    },
    // textarea
    {
      id: 'message',
      name: 'message',
      placeholder: 'Votre message *',
      rows: '10',
      label: 'Votre message *',
      type: 'textarea',
    },
    // checkbox
    {
      id: 'terms',
      name: 'terms',
      type: 'checkbox',
      checkboxLabel:
        'J\'accepte que mes coordonnées soient collectées et utilisées pour être recontacté.',
      options: {
        excludeFromData: true,
      },
    },
    // button
    {
      id: 'submit-button',
      name: 'submit',
      type: 'submit',
      value: 'Envoyer',
    },
  ],
})
const modalValues = ref<ModalStatus>({ visible: false })
const modalStatusEmailSent = (val: ModalStatus) => {
  modalValues.value = val
  setTimeout(modalStatusClear, 5000) // Remove after 5s
}
const modalStatusClear = () => {
  modalValues.value.visible = false
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
          Un projet commence par une rencontre. Je serai ravi de pouvoir faire
          votre connaissance, à très vite !
        </p>
      </div>
      <div class="container mt-5">
        <div class="contact-form">
          <h3 class="text-center">
            <span class="line-behind">Formulaire de contact</span>
          </h3>

          <VForm
            @form-send="modalStatusEmailSent"
          >
            <template #select="errors">
              <VSelect
                :select="data.select"
                :errors="errors"
              />
            </template>
            <template #input="errors">
              <VInput
                v-for="(input, i) in data.inputs"
                :key="i"
                :input="input"
                :validate="true"
                :errors="errors"
              />
            </template>
            <template #modal>
              <VModalStatus
                :visible="modalValues.visible"
                :status="modalValues.status"
                :success-message="modalValues.successMessage"
                :error-message="modalValues.errorMessage"
                :success-title="modalValues.successTitle"
                :error-title="modalValues.errorTitle"
                @close="modalValues.visible=false"
              />
            </template>
          </VForm>
          <p class="my-3 mx-3">
            <strong>*</strong> Ces champs sont requis.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>
