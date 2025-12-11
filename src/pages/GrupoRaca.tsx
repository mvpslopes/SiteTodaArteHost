/**
 * Página do Grupo Raça
 * Acessível apenas via link direto: /gruporaca
 * NÃO aparece no menu de navegação do site
 * 
 * Usa iframe para carregar a landing page do Grupo Raça de forma isolada
 */
export function GrupoRacaPage() {
  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      margin: 0, 
      padding: 0,
      overflow: 'hidden'
    }}>
      <iframe
        src="/gruporaca/index.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        title="Grupo Raça - Landing Page"
        allow="fullscreen"
      />
    </div>
  );
}

