

const sendFavorite = (method, button) =>
  fetch('/api/favorites', {
    method,
    // Le avisamos al servidor de que el body va en JSON.
    // Así express.json() lo convierte en req.body.
    headers: { 'Content-Type': 'application/json' },
    // button.dataset.id lee el atributo data-id del botón (y dataset.source, data-source).
    // JSON.stringify convierte el objeto en texto JSON, que es lo que viaja por internet.
    body: JSON.stringify({ movieId: button.dataset.id, source: button.dataset.source }),
    // La cookie con el token viaja sola (misma web), no hay que añadirla.
  });

document.querySelectorAll('.js-add-favorite').forEach((button) => {
  button.addEventListener('click', async () => {
    const res = await sendFavorite('POST', button);

    if (res.status === 201 || res.status === 409) {
      button.textContent = '✅ En Mis películas';
      button.disabled = true; // para que no le dé otra vez
      return;
    }
    alert('No se ha podido añadir');
  });
});

document.querySelectorAll('.js-remove-favorite').forEach((button) => {
  button.addEventListener('click', async () => {
    const res = await sendFavorite('DELETE', button);
    if (res.ok) {
      window.location.reload()
      return;
    }
    alert('No se ha podido quitar');
  });
});

const markFavorites = async () => {
  const addButtons = document.querySelectorAll('.js-add-favorite');
  // Si en esta página no hay botones de añadir (p. ej. en /favorites), no preguntamos nada.
  if (addButtons.length === 0) {
    return;
  }

  const res = await fetch('/api/favorites');
  if (!res.ok) {
    return; // si falla, se quedan como estaban
  }
  const favorites = await res.json(); // lista de películas: [{ id, source, ... }]

  addButtons.forEach((button) => {
    // ¿Hay algún favorito con el mismo id y source que este botón?
    const isFavorite = favorites.some(
      (movie) => movie.id === button.dataset.id && movie.source === button.dataset.source
    );
    if (isFavorite) {
      button.textContent = '✅ En Mis películas';
      button.disabled = true;
    }
  });
};
markFavorites();
