export interface Usuario {
  nome: string;
  nomeCompleto: string;
  apelido: string;
  /** Exibidas no lugar da foto de perfil */
  iniciais: string;
}

// Usuário fixo enquanto não existe login/back-end.
export const USUARIO: Usuario = {
  nome: 'Gabrielly',
  nomeCompleto: 'Gabrielly Leite',
  apelido: 'Gabi',
  iniciais: 'GL',
};
