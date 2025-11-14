// services/authService.ts
//
// Refatorado para usar o endpoint /cliente como alternativa ao /login
// Não retorna token de sessão - usa token de admin para todas as requisições
//

import { ixcApi } from "./ixcApi";
import { IXC_CONFIG } from "@/constants/config";
import type { 
  IXCLoginRequest, 
  AuthUserData, 
  IXCClienteResponse,
  IXCContratoResponse
} from "@/types/ixc";

export const authService = {
  async login(credentials: IXCLoginRequest): Promise<AuthUserData> {
    try {
      // --- PASSO 1: PESQUISAR O CLIENTE POR E-MAIL/CPF ---
      // Determina o campo de busca baseado no formato do login
      const campoBusca = credentials.login.includes('@') 
        ? 'cliente.hotsite_email' 
        : 'cliente.cnpj_cpf';

      const searchBody = {
        qtype: campoBusca,
        query: credentials.login,
        oper: '=',
        page: '1',
        rp: '1', // Só queremos 1 resultado
        sortname: 'cliente.id',
        sortorder: 'asc',
      };

      // Usa o novo 'postList' para pesquisar no /cliente
      const clienteResponse = await ixcApi.postList<IXCClienteResponse>(
        IXC_CONFIG.ENDPOINTS.CLIENTE,
        searchBody
      );

      // Cliente não encontrado pelo e-mail/CPF
      if (clienteResponse.total === 0 || !clienteResponse.registros[0]) {
        throw new Error('Usuário ou senha inválidos');
      }

      const cliente = clienteResponse.registros[0];

      // --- PASSO 2: VALIDAR A SENHA (Inseguro, mas é a alternativa) ---
      // Compara a senha digitada com a senha em texto puro que veio da API
      if (cliente.senha !== credentials.senha) {
        throw new Error('Usuário ou senha inválidos');
      }

      // --- PASSO 3: BUSCAR O CONTRATO (Chamada Adicional) ---
      // O App precisa do id_contrato e do status_contrato
      const contratoBody = {
        qtype: 'cliente_contrato.id_cliente',
        query: cliente.id, // Usa o ID do cliente que acabamos de validar
        oper: '=',
        page: '1',
        rp: '1', // Pega o primeiro contrato
        sortname: 'cliente_contrato.id',
        sortorder: 'desc',
      };

      const contratoResponse = await ixcApi.postList<IXCContratoResponse>(
        IXC_CONFIG.ENDPOINTS.CONTRATO,
        contratoBody
      );

      if (contratoResponse.total === 0 || !contratoResponse.registros[0]) {
        throw new Error('Cliente validado, mas nenhum contrato encontrado.');
      }
      
      const contrato = contratoResponse.registros[0];

      // --- PASSO 4: MONTAR A RESPOSTA PARA O APP ---
      // O objeto que o AuthContext vai armazenar
      const userData: AuthUserData = {
        id_cliente: cliente.id,
        id_contrato: contrato.id,
        nome_cliente: cliente.razao,
        email: cliente.hotsite_email,
        telefone: cliente.telefone_celular,
        status_contrato: contrato.status, 
      };

      // Não há token de sessão para salvar
      return userData;

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erro no login: ${error.message}`);
      }
      throw new Error('Erro desconhecido ao fazer login');
    }
  },

  logout() {
    // Não há token de sessão para limpar
    // Nada a fazer aqui
  },
  
  // Função mockLogin mantida para testes (pode ser removida depois)
  async mockLogin(email: string, senha: string): Promise<AuthUserData> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id_cliente: '1',
      id_contrato: '1',
      nome_cliente: 'Cliente Teste',
      email: email,
      telefone: '(11) 99999-9999',
      status_contrato: 'Ativo',
    };
  },
};
