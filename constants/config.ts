/*
Este é o arquivo de configuração principal do seu aplicativo.
Ele informa ao aplicativo onde encontrar todas as suas APIs (endpoints).
*/

// --- 1. Integração Principal do IXC ---
// Estes são os dados para conectar no seu IXCSoft.

/**
 * A URL completa do seu IXCSoft.
 * Eu já preenchi com o caminho padrão do webservice.
 */
export const IXC_CONFIG = {
  BASE_URL: "https://centralfiber.online/webservice/v1",
  TOKEN: "21:40112b3d6db245dbf0ac40379896f26c1c7efc100ed0a47fa45739e85c5971c1",
  ENDPOINTS: {
    CLIENTE: "/cliente",
    CONTRATO: "/cliente_contrato",
    FATURAS: "/fn_areacliente_faturas",
    SUPORTE: "/su_oss_chamado",
    FN_ARECEBER: "/fn_areceber", // Para listar faturas
    GET_BOLETO: "/get_boleto", // Para buscar o boleto
  },
};

// --- 2. Endpoints do seu Backend (Ponte de Serviços) ---
// O seu aplicativo não fala direto com o GenieACS ou Downdetector.
// Ele fala com o seu próprio backend (o arquivo AplicativoFIber/backend/server.js),
// e o backend faz essa ponte.
//
// Você precisará hospedar esse 'server.js' em algum lugar
// (ex: https://api.centralfiber.online) e colocar as URLs abaixo.
const BACKEND_URL = "https://api.centralfiber.online";

// Os outros serviços provavelmente esperam objetos similares
export const GENIE_ACS_CONFIG = {
  BASE_URL: `${BACKEND_URL}/api/ont`
};

export const DOWNDETECTOR_CONFIG = {
  BASE_URL: `${BACKEND_URL}/api/status`
};

export const FIBERBOT_CONFIG = {
  BASE_URL: `${BACKEND_URL}/api/bot`
};

// --- 3. Outros Serviços ---

/**
 * URL do seu servidor de Teste de Velocidade.
 * Como você optou por usar a biblioteca 'fast-speedtest-api',
 * esta variável provavelmente NÃO será usada pelo 'services/speedTestService.ts',
 * mas a mantemos aqui para consistência do arquivo.
 */
export const SPEED_TEST_CONFIG = {
  // Nenhuma configuração de URL necessária
};