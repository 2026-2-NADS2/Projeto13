// ============================================================
// utilitarios/useBusca.js
// Hook próprio (capítulo 16 da apostila) que junta o padrão que se
// repete em quase toda página: useState para dados/carregando/erro
// + useEffect que busca na API, com a flag "cancelado".
//
// Uso:
//   const { dados, carregando, erro, recarregar } =
//     useBusca(() => buscarMeusAlunos(token), [token]);
//
// - O 1º argumento é uma função que devolve uma Promise (o serviço).
// - O 2º é a lista de dependências: quando um valor dela muda, a
//   busca roda de novo (igual ao array do useEffect).
// - recarregar() força uma nova busca (ex.: depois de salvar).
// ============================================================
import { useEffect, useState } from 'react';

export function useBusca(funcaoDeBusca, dependencias = []) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  // Um número que só serve para "disparar" o efeito de novo.
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    // "cancelado" evita atualizar o estado de uma busca antiga: se o
    // usuário trocar de filtro rápido, a resposta velha é ignorada.
    let cancelado = false;
    setCarregando(true);
    setErro(null);

    funcaoDeBusca()
      .then((resultado) => {
        if (!cancelado) setDados(resultado);
      })
      .catch((e) => {
        if (!cancelado) setErro(e.message);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
    // As dependências vêm de quem chamou o hook; a função muda a cada
    // renderização, então de propósito ela NÃO entra na lista.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, versao]);

  return { dados, carregando, erro, recarregar: () => setVersao((v) => v + 1) };
}
