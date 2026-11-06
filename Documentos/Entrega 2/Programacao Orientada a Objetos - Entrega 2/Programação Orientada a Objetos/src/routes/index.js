const express = require('express');

// As rotas só traduzem HTTP -> chamada da classe principal.
// O usuário logado vem do token JWT (Authorization: Bearer <token>), lido pelo Autenticador.
module.exports = function criarRotas(sistema, autenticador) {
  const r = express.Router();
  const usuario = (req) => autenticador.lerUsuarioId(req.header('authorization'));
  const h = (fn) => (req, res, next) => fn(req, res).catch(next);
  const id = (req) => Number(req.params.id);

  // Login (público)
  r.post('/login', h(async (req, res) =>
    res.json(await sistema.login(req.body?.email, req.body?.senha))));
  r.get('/eu', h(async (req, res) =>
    res.json(await sistema.quemSouEu(usuario(req)))));

  // Administrador
  r.post('/alunos', h(async (req, res) =>
    res.status(201).json(await sistema.cadastrarAluno(usuario(req), req.body))));
  r.get('/alunos', h(async (req, res) =>
    res.json(await sistema.listarAlunos(usuario(req)))));
  r.post('/bimestres', h(async (req, res) =>
    res.status(201).json(await sistema.definirBimestre(usuario(req), req.body))));
  r.get('/revisao', h(async (req, res) =>
    res.json(await sistema.listarParaRevisao(usuario(req), req.query.status || undefined))));

  // Professor
  r.get('/professor/acompanhamentos', h(async (req, res) =>
    res.json(await sistema.listarMeusAcompanhamentos(usuario(req), req.query.status || null))));
  r.post('/acompanhamentos', h(async (req, res) =>
    res.status(201).json(await sistema.registrarAcompanhamento(usuario(req), req.body))));
  r.patch('/acompanhamentos/:id/enviar', h(async (req, res) =>
    res.json(await sistema.enviarParaRevisao(usuario(req), id(req)))));

  // Revisão (Administrador)
  r.patch('/acompanhamentos/:id/revisar', h(async (req, res) =>
    res.json(await sistema.iniciarRevisao(usuario(req), id(req)))));
  r.patch('/acompanhamentos/:id/publicar', h(async (req, res) =>
    res.json(await sistema.publicar(usuario(req), id(req)))));
  r.patch('/acompanhamentos/:id/devolver', h(async (req, res) =>
    res.json(await sistema.devolver(usuario(req), id(req), req.body?.motivo))));
  r.patch('/acompanhamentos/:id/cancelar', h(async (req, res) =>
    res.json(await sistema.cancelar(usuario(req), id(req)))));
  r.get('/acompanhamentos/:id/historico', h(async (req, res) =>
    res.json(await sistema.consultarHistorico(usuario(req), id(req)))));
  r.get('/acompanhamentos/:id/ciencias', h(async (req, res) =>
    res.json(await sistema.consultarCiencias(usuario(req), id(req)))));

  // Pai/Responsável
  r.get('/responsavel/alunos/:alunoId/relatorios', h(async (req, res) =>
    res.json(await sistema.consultarRelatoriosDoAluno(usuario(req), Number(req.params.alunoId)))));
  r.post('/acompanhamentos/:id/ciencia', h(async (req, res) =>
    res.status(201).json(await sistema.registrarCiencia(usuario(req), id(req), req.body?.observacao))));

  return r;
};
