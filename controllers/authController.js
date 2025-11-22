const jwt = require("jsonwebtoken");
const ixcService = require("../services/ixc");

/**
 * @desc Autentica o cliente usando email/CPF/CNPJ e senha do hotsite,
 * e emite um token JWT se o IXC validar as credenciais.
 * @route POST /api/v1/auth/login
 */
exports.login = async (req, res) => {
  const { login, senha } = req.body;

  if (!login || !senha) {
    return res.status(400).json({ message: "Login e senha são obrigatórios." });
  }

  try {
    // 1. Limpa o login (seu frontend faz isso, mas o backend garante)
    const cleanLogin = login.includes("@") ? login : login.replace(/\D/g, "");

    // 2. Tenta autenticar via serviço IXC (Busca cliente, verifica senha MD5)
    const clienteData = await ixcService.authenticate(cleanLogin, senha);

    if (!clienteData) {
      return res
        .status(401)
        .json({
          message:
            "Credenciais inválidas. Verifique seu login/senha do Hotsite.",
        });
    }

    // 3. Verifica se o acesso ao Hotsite está ativo
    if (
      clienteData.status_hotsite !== "A" &&
      clienteData.status_hotsite !== "Ativo"
    ) {
      return res
        .status(403)
        .json({
          message:
            "Seu acesso à Central do Assinante está inativo. Contate o suporte.",
        });
    }

    // 4. Geração do Token JWT (Expira em 24h)
    const token = jwt.sign(
      {
        ixcId: clienteData.id,
        email: clienteData.email,
        nome: clienteData.nome,
      },
      process.env.JWT_SECRET || "sua_chave_secreta_padrao",
      { expiresIn: "24h" }
    );

    // 5. Retorna o token e os dados essenciais do cliente
    res.json({
      token,
      cliente: {
        id: clienteData.id,
        nome: clienteData.nome,
        email: clienteData.email,
        cpf_cnpj: clienteData.cpf_cnpj,
      },
      message: "Autenticação bem-sucedida. JWT emitido.",
    });
  } catch (error) {
    console.error("[AuthController] Erro durante o login:", error);
    res
      .status(500)
      .json({ error: "Erro interno no servidor de autenticação." });
  }
};
