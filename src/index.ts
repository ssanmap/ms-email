import express from 'express';
import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();


const app = express();
app.use(express.json());

// Config reusable para cualquier cliente
const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',  // Cambiado de Gmail a Zoho
    port: 465,
    secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Ruta única POST /send-email
app.post('/send-email', async (req, res) => {
  const { to, subject, html, clientName } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    await transporter.sendMail({
      from: `"${clientName || 'Formulario de Contacto'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error enviando email:', error);
    res.status(500).json({ error: 'Error al enviar el email' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Servidor listo en http://localhost:${PORT}`));