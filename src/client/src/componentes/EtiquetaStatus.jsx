// ============================================================
// componentes/EtiquetaStatus.jsx
// A "pílula" colorida do status. A classe vem direto do valor do
// banco (status--publicado, status--devolvido...), e o CSS já tem
// uma cor para cada uma. O texto sempre acompanha a cor
// (acessibilidade: a cor nunca é a única pista).
// ============================================================
import { NOMES_STATUS } from '../utilitarios/formatar';

function EtiquetaStatus({ status }) {
  return <span className={`status status--${status}`}>{NOMES_STATUS[status] ?? status}</span>;
}

export default EtiquetaStatus;
