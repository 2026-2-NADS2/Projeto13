-- Dados fictícios para demonstração (rodar DEPOIS do schema.sql). Senha de todos: 123456
SET NAMES utf8mb4;
USE kfka;

INSERT INTO usuario (nome, email, senha_hash, perfil) VALUES
('Ana Admin',        'admin@kfka.com',       '$2b$10$Obtqi0kWUUpbIm29uB4br.tTT5bgo7P2omyB6TIT/3/QB2gYm5VtC', 'administrador'),
('Paulo Professor',  'professor@kfka.com',   '$2b$10$Obtqi0kWUUpbIm29uB4br.tTT5bgo7P2omyB6TIT/3/QB2gYm5VtC', 'professor'),
('Rita Responsavel', 'responsavel@kfka.com', '$2b$10$Obtqi0kWUUpbIm29uB4br.tTT5bgo7P2omyB6TIT/3/QB2gYm5VtC', 'responsavel');

INSERT INTO turma (nome, serie, ano_letivo) VALUES ('5A', '5º ano', 2026);
INSERT INTO area_disciplina (nome) VALUES ('Exatas'), ('Linguagens');
INSERT INTO disciplina (nome, area_id) VALUES ('Matemática', 1), ('Português', 2);
INSERT INTO aluno (nome, data_nascimento, turma_id) VALUES ('Lucas Silva', '2015-03-10', 1);
INSERT INTO turma_disc_prof (turma_id, disciplina_id, professor_id) VALUES (1, 1, 2); -- Paulo dá Matemática no 5A
INSERT INTO aluno_responsavel (aluno_id, usuario_id) VALUES (1, 3);                  -- Rita é responsável pelo Lucas
INSERT INTO tag (nome) VALUES ('Participativo'), ('Precisa de reforço'), ('Evoluiu no bimestre');

-- 3º bimestre aberto para digitação agora (facilita a demonstração)
INSERT INTO bimestre (numero, ano_letivo, data_abertura, data_encerramento)
VALUES (3, 2026, NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 30 DAY);
