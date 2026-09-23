const express = require('express');

// As rotas só traduzem HTTP -> chamada da classe principal.
// Enquanto o login (JWT) não existe, o usuário logado é simulado pelo header "x-usuario-id".
module.exports = function criarRotas(sistema) {
  const r = express.Router();
  const usuario = (req) => Number(req.header('x-usuario-id'));
  const h = (fn) => (req, res, next) => fn(req, res).catch(next);

  // Administrador
  r.post('/alunos', h(async (req, res) =>
    res.status(201).json(await sistema.cadastrarAluno(usuario(req), req.body))));
  r.get('/alunos', h(async (req, res) =>
    res.json(await sistema.listarAlunos(usuario(req)))));
  r.post('/bimestres', h(async (req, res) =>
    res.status(201).json(await sistema.definirBimestre(usuario(req), req.body))));

  // Professor
  r.post('/acompanhamentos', h(async (req, res) =>
    res.status(201).json(await sistema.registrarAcompanhamento(usuario(req), req.body))));
  r.patch('/acompanhamentos/:id/enviar', h(async (req, res) =>
    res.json(await sistema.enviarParaRevisao(usuario(req), Number(req.params.id)))));

  // Revisão (Administrador)
  r.patch('/acompanhamentos/:id/revisar', h(async (req, res) =>
    res.json(await sistema.iniciarRevisao(usuario(req), Number(req.params.id)))));
  r.patch('/acompanhamentos/:id/publicar', h(async (req, res) =>
    res.json(await sistema.publicar(usuario(req), Number(req.params.id)))));
  r.patch('/acompanhamentos/:id/devolver', h(async (req, res) =>
    res.json(await sistema.devolver(usuario(req), Number(req.params.id)))));
  r.patch('/acompanhamentos/:id/cancelar', h(async (req, res) =>
    res.json(await sistema.cancelar(usuario(req), Number(req.params.id)))));
  r.get('/acompanhamentos/:id/historico', h(async (req, res) =>
    res.json(await sistema.consultarHistorico(usuario(req), Number(req.params.id)))));

  // Pai/Responsável
  r.get('/responsavel/alunos/:alunoId/relatorios', h(async (req, res) =>
    res.json(await sistema.consultarRelatoriosDoAluno(usuario(req), Number(req.params.alunoId)))));

  return r;
};
