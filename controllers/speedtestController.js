// controllers/SpeedtestController.js

/**
 * @desc Simula a execução de um teste de velocidade.
 * NOTA: A execução de testes Ookla reais em ambientes Serverless/Render é complexa e instável.
 * Use a lógica do worker do frontend (Librespeed) ou implemente um teste de ping básico aqui.
 * @route POST /api/speedtest/run
 */
exports.run = async (req, res) => {
  try {
    // Simulação de resultados, pois o módulo universal-speedtest está desativado
    const pingLatency = Math.floor(Math.random() * (20 - 5 + 1)) + 5;
    const jitter = Math.floor(Math.random() * (5 - 1 + 1)) + 1;

    return res.json({
      ping: pingLatency,
      jitter: jitter,
      download: 0, // Zera porque o teste real deve ser feito no frontend (Librespeed worker)
      upload: 0,
      clientIp: req.ip || "127.0.0.1",
      message:
        "Teste iniciado, mas os resultados de download/upload devem ser reportados pelo cliente (Librespeed).",
    });
  } catch (error) {
    console.error("Erro no Speedtest Controller:", error);
    return res
      .status(500)
      .json({ message: "Falha ao executar teste de velocidade simulado." });
  }
};
