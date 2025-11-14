import Speedtest from "fast-speedtest-api";

/**
 * Interface para os dados de atualização em tempo real.
 */
export interface SpeedTestUpdate {
  speed: number;
  progress: number;
  unit: string;
}

/**
 * Executa o teste de velocidade e atualiza o estado do app
 * em tempo real através da função 'onUpdate'.
 * * @param onUpdate - Função de callback para enviar dados (velocidade, progresso) para a tela.
 */
export const runSpeedTest = (
  onUpdate: (data: SpeedTestUpdate) => void
): Promise<number> => {
  // Usamos uma Promise para que a tela saiba quando o teste terminou.
  return new Promise((resolve, reject) => {
    try {
      // 1. Cria a instância do teste
      const speedtest = new Speedtest({
        token: "token", // Token público padrão para a API do fast.com
        verbose: false,
        timeout: 10000,
        https: true,
        unit: Speedtest.UNITS.Mbps, // Queremos os resultados em Mbps
      });

      let finalSpeed = 0;

      // 2. Define o que fazer quando recebe dados
      speedtest.on("data", (data) => {
        const speed = parseFloat(data.speed);
        const progress = data.progress; // Progresso de 0 a 1

        if (!isNaN(speed)) {
          finalSpeed = speed; // Guarda a velocidade mais recente
          // Envia os dados para a tela (para o gráfico/velocímetro)
          onUpdate({
            speed: speed,
            progress: progress,
            unit: Speedtest.UNITS.Mbps,
          });
        }
      });

      // 3. Define o que fazer quando o teste terminar
      speedtest.on("done", (data) => {
        if (data && data.speed) {
          finalSpeed = parseFloat(data.speed);
        }
        console.log("Teste de velocidade finalizado:", finalSpeed);
        resolve(finalSpeed); // Resolve a Promise com a velocidade final
      });

      // 4. Define o que fazer em caso de erro
      speedtest.on("error", (err) => {
        console.error("Erro no speedtest:", err);
        reject(err); // Rejeita a Promise
      });

      // 5. Inicia o teste
      speedtest.getSpeed();
    } catch (error) {
      console.error("Falha ao iniciar o speedtest:", error);
      reject(error);
    }
  });
};
