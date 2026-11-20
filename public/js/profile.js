// Perfil (/profile): guarda los cambios con fetch PUT /api/user.

const form = document.querySelector('#profile-form');
const errorsList = document.querySelector('#profile-errors');
const okMensage = document.querySelector('#profile-ok');

/**
 * Pinta la lista de errores (o la esconde si no hay).
 * @param {string[]} messages - Mensajes de error.
 * @returns {void}
 */
const showErrors = (messages) => {
  errorsList.innerHTML = '';
  messages.forEach((msg) => {
    const li = document.createElement('li');
    li.textContent = msg;
    errorsList.appendChild(li);
  });
  errorsList.hidden = messages.length === 0;
};

form.addEventListener('submit', async (event) => {
  event.preventDefault(); // no enviar el formulario "a la antigua"
  okMensage.hidden = true;

  // { name: '...', email: '...' }
  const data = Object.fromEntries(new FormData(form));

  const res = await fetch('/api/user', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    showErrors([]);
    okMensage.hidden = false;
    return;
  }

  // 400 y 409 → { errors: [...] }; otros → { msg }
  const body = await res.json().catch(() => ({}));
  if (body.errors) {
    showErrors(body.errors.map((err) => err.msg));
  } else {
    showErrors([body.msg || 'Algo ha fallado, inténtalo de nuevo']);
  }
});
