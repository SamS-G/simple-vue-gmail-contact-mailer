<script setup lang="ts">
import { useForm } from 'vee-validate'
import { form } from '~/server/schema/form'
import type { AuthResponseData } from '~/interfaces/form-component'
import { sanitizeObject } from '~/composables/sanitizeObject'
import type { ModalStatus } from '~/server/interfaces/modal-status'

const statusModal = ref<ModalStatus>()

const emit = defineEmits(['formSend', 'close'])

const SEND_EMAIL_URL = '/api/send-email'

const { handleSubmit, resetForm } = useForm({
  validationSchema: form,
  initialValues: {
    email: '',
    reason: false,
    subject: '',
    name: '',
    message: '',
    terms: false,
    submit: undefined,
  },
})
const handleReset = () => {
  resetForm({
    values: {
      email: '',
      reason: true,
      subject: '',
      name: '',
      message: '',
      terms: false,
    },
  })
}
const onSubmit = handleSubmit(async (values) => {
  try {
    // await $fetch('/api/auth', { method: 'GET' })
    statusModal.value = {
      visible: true,
      status: 'loading',
    }
    emit('formSend', statusModal.value)
    // Traitement du formulaire
    const sanitizedForm = await sanitizeObject(values, [
      'terms',
      'submit',
    ])
    await $fetch<AuthResponseData>(
      SEND_EMAIL_URL,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: sanitizedForm,
      })
      .then((data) => {
        if (data) {
          statusModal.value = {
            visible: true,
            status: 'success',
            successMessage: 'Votre message a bien été envoyé, j\'y répondrai très rapidement',
            successTitle: 'Succès',
          }
        }
        emit('formSend', statusModal.value)
      })
      .catch((error) => {
        if (error) {
          statusModal.value = {
            visible: true,
            status: 'error',
            errorMessage: 'Désolé mais une erreur s\'est produite, pourriez vous réessayer ?',
            errorTitle: 'Erreur',
          }
        }
        emit('formSend', statusModal.value)
      })
    handleReset()
  }
  catch
  (error) {
    console.error(error)
  }
})
</script>

<template>
  <div class="container form-container">
    <form
      class="mt-4"
      @submit.prevent="onSubmit"
    >
      <div class="controls">
        <div class="form-group">
          <slot name="select" />
          <slot name="input" />
        </div>
      </div>
    </form>
    <slot name="modal" />
  </div>
</template>

<style scoped>
form {
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group {
  padding-top: 2rem;
  padding-bottom: 2rem;
  display: flex;
  flex-direction: column;
}
.form-container {
  position: relative;
}
</style>
