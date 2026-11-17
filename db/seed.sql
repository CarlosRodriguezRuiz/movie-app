-- Usuarios de PRUEBA (contraseña de ambos: 123456). Solo para desarrollo.
-- Sus ids (1 y 2) coinciden con los de /dev/login/user y /dev/login/admin.
INSERT INTO users (name, email, password, role) VALUES
  ('Usuario Prueba', 'user@test.com',  '$2b$10$TRzMr8xdXlHTPsrrFZ2GjOovdxxapbTnZuzJb6Nv2bulV15tfenzW', 'user'),
  ('Admin Prueba',   'admin@test.com', '$2b$10$TRzMr8xdXlHTPsrrFZ2GjOovdxxapbTnZuzJb6Nv2bulV15tfenzW', 'admin');
