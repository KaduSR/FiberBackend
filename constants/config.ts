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
const IXC_API_URL = "https://centralfiber.online/webservice/v1";

/**
 * O Token de API que você gerou no painel do IXC.
 * Siga as instruções no arquivo: docs/IXC_AUTH_GUIDE.md
 */
const IXC_API_TOKEN =
  "21:40112b3d6db245dbf0ac40379896f26c1c7efc100ed0a47fa45739e85c5971c1";

// --- 2. Endpoints do seu Backend (Ponte de Serviços) ---
// O seu aplicativo não fala direto com o GenieACS ou Downdetector.
// Ele fala com o seu próprio backend (o arquivo AplicativoFIber/backend/server.js),
// e o backend faz essa ponte.
//
// Você precisará hospedar esse 'server.js' em algum lugar
// (ex: https://api.centralfiber.online) e colocar as URLs abaixo.

/**
 * URL do seu backend para a integração com GenieACS (ONT/Roteador).
 * Ex: 'https://api.centralfiber.online/api/ont'
 */
const GENIE_ACS_API_URL = "https://URL_DO_SEU_BACKEND/api/ont";

/**
 * URL do seu backend para o serviço de "Downdetector" (Status dos Serviços).
 * Como você solicitou, isso vai apontar para sua própria API.
 * Ex: 'https://api.centralfiber.online/api/status'
 */
const DOWNDETECTOR_API_URL = "https://URL_DO_SEU_BACKEND/api/status";

/**
 * URL do seu backend para o "FiberBot" (IA).
 * Ex: 'https://api.centralfiber.online/api/bot'
 */
const FIBERBOT_API_URL = "https://URL_DO_SEU_BACKEND/api/bot";

// --- 3. Outros Serviços ---

/**
 * URL do seu servidor de Teste de Velocidade.
 * Como você optou por usar a biblioteca 'fast-speedtest-api',
 * esta variável provavelmente NÃO será usada pelo 'services/speedTestService.ts',
 * mas a mantemos aqui para consistência do arquivo.
 */
const SPEED_TEST_URL = ""; // Deixe em branco, pois não será usado

// Exporta todas as variáveis para o restante do aplicativo usar
export {
  IXC_API_URL,
  IXC_API_TOKEN,
  GENIE_ACS_API_URL,
  DOWNDETECTOR_API_URL,
  FIBERBOT_API_URL,
  SPEED_TEST_URL,
};
