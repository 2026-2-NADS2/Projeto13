SET NAMES utf8mb4;

USE kfka;

-- Usuários (1 administrador, 2 professores, 2 responsáveis)
INSERT INTO usuario (id, nome, email, senha_hash, perfil) VALUES
  (1, 'Coordenação Escolar', 'coordenacao@escola-teste.com', '$2b$10$jMNpXuJcGwKO4zNIAeoZp.egeKeoB/QzNyqrJe0CywY2gfdB2H6xO', 'administrador'),
  (2, 'Carla Lima', 'carla.lima@escola-teste.com', '$2b$10$jMNpXuJcGwKO4zNIAeoZp.egeKeoB/QzNyqrJe0CywY2gfdB2H6xO', 'professor'),
  (3, 'Rafael Dias', 'rafael.dias@escola-teste.com', '$2b$10$jMNpXuJcGwKO4zNIAeoZp.egeKeoB/QzNyqrJe0CywY2gfdB2H6xO', 'professor'),
  (4, 'Mariana Souza', 'mariana.souza@exemplo.com', '$2b$10$jMNpXuJcGwKO4zNIAeoZp.egeKeoB/QzNyqrJe0CywY2gfdB2H6xO', 'responsavel'),
  (5, 'João Pereira', 'joao.pereira@exemplo.com', '$2b$10$jMNpXuJcGwKO4zNIAeoZp.egeKeoB/QzNyqrJe0CywY2gfdB2H6xO', 'responsavel');

-- Turmas
INSERT INTO turma (id, nome, serie, ano_letivo) VALUES
  (1, '5º A', '5º ano', 2026),
  (2, '2º B', '2º ano', 2026);

-- Áreas e disciplinas
INSERT INTO area_disciplina (id, nome) VALUES
  (1, 'Matemática'),
  (2, 'Linguagens'),
  (3, 'Ciências da Natureza');

INSERT INTO disciplina (id, nome, area_id) VALUES
  (1, 'Matemática', 1),
  (2, 'Língua Portuguesa', 2),
  (3, 'Ciências', 3);


INSERT INTO bimestre (id, numero, ano_letivo, data_abertura, data_encerramento) VALUES
  (1, 1, 2026, '2026-04-01 00:00:00', '2026-04-20 23:59:00'),
  (2, 2, 2026, '2026-06-20 00:00:00', '2026-07-05 23:59:00'),
  (3, 3, 2026, '2026-09-10 00:00:00', '2026-09-30 23:59:00'),
  (4, 4, 2026, '2026-11-01 00:00:00', '2026-12-10 23:59:00');

-- Tags de acompanhamento
INSERT INTO tag (id, nome) VALUES
  (1, 'Participativo'),
  (2, 'Precisa de reforço'),
  (3, 'Boa evolução'),
  (4, 'Entrega as atividades'),
  (5, 'Colabora com a turma');

-- Alunos (nomes e datas de nascimento inventados)
INSERT INTO aluno (id, nome, data_nascimento, turma_id) VALUES
  (1, 'Ana Souza',    '2015-03-10', 1),
  (2, 'Pedro Souza',  '2018-07-22', 2),
  (3, 'Bruno Lima',   '2015-05-02', 1),
  (4, 'Carla Mendes', '2015-11-18', 1),
  (5, 'Igor Pereira', '2018-01-30', 2);

-- Quem dá aula de quê em cada turma
INSERT INTO turma_disc_prof (turma_id, disciplina_id, professor_id) VALUES
  (1, 1, 2), (1, 2, 3), (1, 3, 2),
  (2, 1, 2), (2, 2, 3);

-- Vínculos responsável -> aluno (Mariana tem dois filhos)
INSERT INTO aluno_responsavel (aluno_id, usuario_id) VALUES
  (1, 4), (2, 4), (5, 5);

-- Acompanhamentos (13 publicados + outros status, para testar filtros e paginação)
INSERT INTO acompanhamento (id, aluno_id, turma_id, disciplina_id, professor_id, bimestre_id, descricao, media, status, criado_em, atualizado_em) VALUES
  (1, 1, 1, 1, 2, 1, 'Resolve bem as operações do bimestre e participa das correções coletivas.', 8.5, 'publicado', '2026-04-28 10:00:00', '2026-04-28 15:00:00'),
  (2, 1, 1, 2, 3, 1, 'Lê com fluência e produz textos organizados; pode caprichar mais na revisão.', 9.0, 'publicado', '2026-04-28 10:00:00', '2026-04-28 15:00:00'),
  (3, 1, 1, 3, 2, 1, 'Demonstra curiosidade nas atividades práticas e registra bem as observações.', 7.5, 'publicado', '2026-04-28 10:00:00', '2026-04-28 15:00:00'),
  (4, 1, 1, 1, 2, 2, 'Resolve bem as operações do bimestre e participa das correções coletivas.', 7.5, 'publicado', '2026-07-10 10:00:00', '2026-07-10 15:00:00'),
  (5, 1, 1, 2, 3, 2, 'Lê com fluência e produz textos organizados; pode caprichar mais na revisão.', 8.5, 'publicado', '2026-07-10 10:00:00', '2026-07-10 15:00:00'),
  (6, 1, 1, 3, 2, 2, 'Demonstra curiosidade nas atividades práticas e registra bem as observações.', 8.0, 'publicado', '2026-07-10 10:00:00', '2026-07-10 15:00:00'),
  (7, 1, 1, 1, 2, 3, 'Resolve bem as operações do bimestre e participa das correções coletivas.', 8.5, 'publicado', '2026-09-18 10:00:00', '2026-09-18 15:00:00'),
  (8, 1, 1, 2, 3, 3, 'Lê com fluência e produz textos organizados; pode caprichar mais na revisão.', 9.0, 'publicado', '2026-09-18 10:00:00', '2026-09-18 15:00:00'),
  (9, 1, 1, 3, 2, 4, 'Demonstra curiosidade nas atividades práticas e registra bem as observações.', 8.0, 'em_revisao', '2026-11-02 10:00:00', '2026-11-02 15:00:00'),
  (10, 2, 2, 1, 2, 1, 'Resolve bem as operações do bimestre e participa das correções coletivas.', 7.0, 'publicado', '2026-04-28 10:00:00', '2026-04-28 15:00:00'),
  (11, 2, 2, 2, 3, 1, 'Lê com fluência e produz textos organizados; pode caprichar mais na revisão.', 8.0, 'publicado', '2026-04-28 10:00:00', '2026-04-28 15:00:00'),
  (12, 2, 2, 1, 2, 2, 'Resolve bem as operações do bimestre e participa das correções coletivas.', 7.5, 'publicado', '2026-07-10 10:00:00', '2026-07-10 15:00:00'),
  (13, 2, 2, 2, 3, 2, 'Lê com fluência e produz textos organizados; pode caprichar mais na revisão.', 8.5, 'publicado', '2026-07-10 10:00:00', '2026-07-10 15:00:00'),
  (14, 5, 2, 2, 3, 2, 'Lê com fluência e produz textos organizados; pode caprichar mais na revisão.', 6.5, 'publicado', '2026-07-10 10:00:00', '2026-07-10 15:00:00'),
  (15, 3, 1, 1, 2, 4, 'Tem se esforçado, mas ainda apresenta dificuldade em frações equivalentes.', 6.0, 'devolvido', '2026-11-02 10:00:00', '2026-11-03 15:00:00'),
  (16, 4, 1, 1, 2, 4, 'Acompanha bem frações e geometria; precisa organizar melhor os cálculos.', 7.0, 'enviado_revisao', '2026-11-02 10:00:00', '2026-11-02 15:00:00'),
  (17, 2, 2, 1, 2, 4, 'Rascunho em andamento.', 7.5, 'rascunho', '2026-11-02 10:00:00', '2026-11-02 15:00:00');

-- Tags de alguns acompanhamentos
INSERT INTO acomp_tag (acompanhamento_id, tag_id) VALUES
  (7, 1), (7, 3), (8, 4), (15, 2), (16, 1);

-- Histórico (auditoria). A coluna "observacao" guarda o motivo da
-- devolução ou a justificativa de uma alteração do Administrador.
INSERT INTO historico (acompanhamento_id, usuario_id, estado_anterior, estado_posterior, observacao, data_hora) VALUES
  (7, 2, NULL, 'rascunho', NULL, '2026-09-15 09:00:00'),
  (7, 2, 'rascunho', 'enviado_revisao', NULL, '2026-09-16 11:00:00'),
  (7, 1, 'enviado_revisao', 'em_revisao', NULL, '2026-09-17 14:00:00'),
  (7, 1, 'em_revisao', 'publicado', NULL, '2026-09-18 15:00:00'),
  (9, 2, NULL, 'enviado_revisao', NULL, '2026-11-02 10:00:00'),
  (9, 1, 'enviado_revisao', 'em_revisao', NULL, '2026-11-02 15:00:00'),
  (15, 2, NULL, 'rascunho', NULL, '2026-11-02 10:00:00'),
  (15, 2, 'rascunho', 'enviado_revisao', NULL, '2026-11-02 11:00:00'),
  (15, 1, 'enviado_revisao', 'em_revisao', NULL, '2026-11-03 09:00:00'),
  (15, 1, 'em_revisao', 'devolvido', 'Explique quais atividades de reforço foram propostas para as frações equivalentes.', '2026-11-03 15:00:00'),
  (16, 2, NULL, 'enviado_revisao', NULL, '2026-11-02 15:00:00'),
  (17, 2, NULL, 'rascunho', NULL, '2026-11-02 15:00:00');

-- Ciência (RF12): Mariana já registrou ciência de um relatório da Ana.
INSERT INTO ciencia (acompanhamento_id, responsavel_id, observacao, registrada_em) VALUES
  (7, 4, 'Obrigada pelo retorno! Vamos reforçar a tabuada em casa.', '2026-09-20 19:30:00');
