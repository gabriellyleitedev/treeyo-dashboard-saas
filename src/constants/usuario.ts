export interface Usuario {
  nome: string;
  nomeCompleto: string;
  apelido: string;
  avatar: string;
}

// Usuário fixo enquanto não existe login/back-end.
export const USUARIO: Usuario = {
  nome: 'Gabrielly',
  nomeCompleto: 'Gabrielly Leite',
  apelido: 'Gabi',
  avatar: 'https://github.com/gabriellyleitedev.png',
};
