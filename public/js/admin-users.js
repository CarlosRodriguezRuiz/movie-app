// Panel del admin (/users): crear, editar y borrar usuarios con fetch a la API.
// Mismo funcionamiento que admin-movies.js: si la API responde bien, recargamos /users.

const form = document.querySelector('#user-form');
const formTitle = document.querySelector('#user-form-title');
const formErrors = document.querySelector('#user-form-errors');
const passwordField = document.querySelector('#password-field');
const btnNew = document.querySelector('#btn-new-user');
const btnCancel = document.querySelector('#btn-cancel-user');

// null = estamos creando; un número = estamos editando ese usuario
let editingId = null;

/** Pinta la lista de errores (o la oculta si no hay) */
const showErrors = (messages) => {
  formErrors.innerHTML = '';
  messages.forEach((msg) => {
    const li = document.createElement('li');
    li.textContent = msg; // textContent (no innerHTML) para no ejecutar HTML que venga en el texto
    formErrors.appendChild(li);
  });
  formErrors.hidden = messages.length === 0;
};

/** Abre el formulario vacío (crear) o relleno con los datos de un usuario (editar) */
const openForm = (user) => {
  form.reset();
  showErrors([]);
  if (user) {
    editingId = user.id;
    formTitle.textContent = `Editar a ${user.name}`;
    form.elements.name.value = user.name;
    form.elements.email.value = user.email;
    form.elements.role.value = user.role;
    // Al editar no se cambia la contraseña: ocultamos el campo.
    passwordField.hidden = true;
    // Si entra con Google, su email no se puede cambiar.
    form.elements.email.readOnly = user.provider === 'google';
  } else {
    editingId = null;
    formTitle.textContent = 'Crear usuario';
    passwordField.hidden = false;
    form.elements.email.readOnly = false;
  }
  form.hidden = false;
  form.scrollIntoView({ behavior: 'smooth' });
};

const closeForm = () => {
  form.hidden = true;
  editingId = null;
};

/** Saca los mensajes de error de la respuesta: { errors: [{ msg }] } */
const getErrors = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (data.errors) {
    return data.errors.map((err) => err.msg);
  }
  return ['Algo ha fallado, inténtalo de nuevo'];
};

// ---- Botones ----
btnNew.addEventListener('click', () => openForm(null));
btnCancel.addEventListener('click', closeForm);

// "Editar": cada botón lleva el usuario entero en data-user (en JSON)
document.querySelectorAll('.btn-edit-user').forEach((button) => {
  button.addEventListener('click', () => openForm(JSON.parse(button.dataset.user)));
});

// "Eliminar": pide confirmación y manda DELETE /api/users/:id
document.querySelectorAll('.btn-delete-user').forEach((button) => {
  button.addEventListener('click', async () => {
    if (!confirm('¿Seguro que quieres borrar este usuario? También se borrarán sus favoritos.')) {
      return;
    }
    const res = await fetch(`/api/users/${button.dataset.id}`, { method: 'DELETE' });
    if (res.ok) {
      window.location.href = '/users';
      return;
    }
    const errors = await getErrors(res);
    alert(errors.join('\n'));
  });
});

// ---- Guardar (crear o editar) ----
form.addEventListener('submit', async (event) => {
  event.preventDefault(); // que el formulario no se envíe "a la antigua" y recargue la página

  // Recogemos los campos del formulario en un objeto { name, email, password, role }
  const data = Object.fromEntries(new FormData(form));

  // Crear → POST /api/users. Editar → PUT /api/users/:id (sin contraseña).
  let url = '/api/users';
  let method = 'POST';
  if (editingId) {
    url = `/api/users/${editingId}`;
    method = 'PUT';
    delete data.password;
  }

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    window.location.href = '/users';
    return;
  }
  showErrors(await getErrors(res));
});
