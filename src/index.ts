import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();

// Configuración CORS para producción
const allowedOrigins = [
  'http://localhost:5173', // Desarrollo
  'https://solveria.cl', // Dominio principal
  'https://www.solveria.cl',
  'https://ia-enterprise-8g11a7dpp-ssanmaps-projects.vercel.app' // URL de Vercel
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Configuración mejorada para Zoho
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || 'contacto@solveria.cl',
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // Solo para desarrollo/testing
  }
});

// Ruta con validación mejorada
app.post('/send-email', async (req, res) => {
  try {
    const { to, subject, html, clientName } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos',
        details: { required: ['to', 'subject', 'html'] }
      });
    }

    const mailOptions = {
      from: `"${clientName || 'Formulario Solveria'}" <${process.env.EMAIL_USER}>`,
      to,
      subject: `[Solveria] ${subject}`,
      html: `
        ${html}
        <hr>
        <p><small>Mensaje enviado desde solveria.cl</small></p>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ 
      success: true,
      message: 'Mensaje enviado correctamente'
    });

  } catch (error:any) {
    console.error('Error en /send-email:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    service: 'Solveria Email API',
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
  console.log(`📧 SMTP configurado para: ${process.env.EMAIL_USER}`);
});