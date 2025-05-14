import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';

export async function buscarCodigo(email, senha, host = 'imap.gmail.com') {
  const config = {
    imap: {
      user: email,
      password: senha,
      host,
      port: 993,
      tls: true,
      authTimeout: 10000
    }
  };

  try {
    const connection = await imaps.connect(config);
    await connection.openBox('INBOX');

    const searchCriteria = ['UNSEEN', ['FROM', 'noreply@rockstargames.com']];
    const fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'], markSeen: false };

    const messages = await connection.search(searchCriteria, fetchOptions);

    for (const item of messages) {
      const all = item.parts.find(part => part.which === 'TEXT');
      const parsed = await simpleParser(all.body);

      const match = parsed.text?.match(/\b\d{4,8}\b/);
      if (match) {
        return match[0];
      }
    }

    return null;
  } catch (err) {
    console.error('Erro ao buscar código:', err);
    return null;
  }
}