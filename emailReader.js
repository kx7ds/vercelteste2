// backend/index.js
const express = require("express");
const cors = require("cors");
const imaps = require("imap-simple");
const simpleParser = require("mailparser").simpleParser;

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

const configIMAP = {
  imap: {
    user: "admin@irrelevante.com.br",
    password: "997784Ar@",
    host: "imap.irrelevante.com.br",
    port: 993,
    tls: true,
    authTimeout: 3000
  }
};

function extrairCodigo(texto) {
  const match = texto.match(/\b\d{6}\b/);
  return match ? match[0] : null;
}

app.get("/codigo", async (req, res) => {
  try {
    const emailAlvo = req.query.email;
    if (!emailAlvo) return res.status(400).json({ erro: "Email não informado" });

    const connection = await imaps.connect(configIMAP);
    await connection.openBox("INBOX");

    const searchCriteria = ["UNSEEN"];
    const fetchOptions = { bodies: [""], markSeen: false };

    const messages = await connection.search(searchCriteria, fetchOptions);

    for (const item of messages.reverse()) {
      const all = item.parts.find(part => part.which === "");
      const parsed = await simpleParser(all.body);

      if (parsed.text && parsed.text.toLowerCase().includes(emailAlvo.toLowerCase())) {
        const codigo = extrairCodigo(parsed.text);
        if (codigo) {
          return res.json({ codigo });
        }
      }
    }

    res.status(404).json({ erro: "Código não encontrado" });
  } catch (err) {
    console.error("Erro ao buscar o código:", err);
    res.status(500).json({ erro: "Erro interno" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
