// controllers/authController.js
const ixcService = require("../services/ixc");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { login, senha } = req.body;

  if (!login || !senha) {
    return res.status(400).json({ message: "Login e senha são obrigatórios" });
  }

  try {
    // Usa seu token admin do IXC para validar as credenciais do cliente
    const cliente = await ixcService.login(login, senha);

    if (!cliente) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    // Gera SEU JWT (do seu backend) — esse é o único token que o frontend vai conhecer
    const token = jwt.sign(
      {
        ixcId: cliente.id,
        email: cliente.email,
        nome: cliente.nome,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.json({
      token,
      user: {
        nome: cliente.nome,
        email: cliente.email,
        cpf_cnpj: cliente.cpf_cnpj,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error.message);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};
