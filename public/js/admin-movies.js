// Panel del admin (/movies): crear, editar y borrar películas con fetch a la API.
// La API responde en JSON; si todo va bien, recargamos /movies para ver la lista actualizada.

const form = document.querySelector('#movie-form');
const formTitle = document.querySelector('#form-title');
const formErrors = document.querySelector('#form-errors');
const btnNew = document.querySelector('#btn-new');
const btnCancel = document.querySelector('#btn-cancel');

// null = estamos creando; un id = estamos editando esa película
let editingId = null;

// ---- Mostrar / ocultar el formulario ----

const showErrors = (messages) => {
  formErrors.innerHTML = '';
  messages.forEach((msg) => {
    const li = document.createElement('li');
    li.textContent = msg;
    formErrors.appendChild(li);
  });
  formErrors.hidden = messages.length === 0;
};

const openForm = (movie) => {
  form.reset();
  showErrors([]);
  if (movie) {
    // Editar: rellenamos cada campo con lo que ya tiene la película
    editingId = movie.id;
    formTitle.textContent = `Editar "${movie.title}"`;
    Object.keys(movie).forEach((field) => {
      if (form.elements[field]) {
        form.elements[field].value = movie[field];
      }
    });
  } else {
    // Crear: formulario vacío
    editingId = null;
    formTitle.textContent = 'Crear película';
  }
  form.hidden = false;
  form.scrollIntoView({ behavior: 'smooth' });
};

const closeForm = () => {
  form.hidden = true;
  editingId = null;
};

// ---- Leer la respuesta de la API ----

// Saca los mensajes de error de la respuesta (400 → { errors: [...] }, otros → { error })
const getErrors = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (data.errors) {
    return data.errors.map((err) => err.msg);
  }
  return [data.error || 'Algo ha fallado, inténtalo de nuevo'];
};

// ---- Crear y editar ----

form.addEventListener('submit', async (event) => {
  event.preventDefault(); // no enviar el formulario "a la antigua"

  // { title: '...', poster: '...', year: '...' }
  const movie = Object.fromEntries(new FormData(form));

  const url = editingId ? `/api/movie/${editingId}` : '/api/movie';
  const method = editingId ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(movie),
  });

  if (res.ok) {
    window.location.href = '/movies';
    return;
  }
  showErrors(await getErrors(res));
});

btnNew.addEventListener('click', () => openForm(null));
btnCancel.addEventListener('click', closeForm);

// ---- Botones de cada tarjeta ----

document.querySelectorAll('.btn-edit').forEach((button) => {
  button.addEventListener('click', () => {
    openForm(JSON.parse(button.dataset.movie));
  });
});

document.querySelectorAll('.btn-delete').forEach((button) => {
  button.addEventListener('click', async () => {
    if (!confirm('¿Seguro que quieres eliminar esta película?')) {
      return;
    }
    const res = await fetch(`/api/movie/${button.dataset.id}`, { method: 'DELETE' });
    if (res.ok) {
      window.location.href = '/movies';
      return;
    }
    const errors = await getErrors(res);
    alert(errors.join('\n'));
  });
});
