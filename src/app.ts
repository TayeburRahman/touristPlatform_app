import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import routes from './app/routes';
import { NotFoundHandler } from './errors/NotFoundHandler';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser'; 
import multer from 'multer';
import { PaymentController } from './app/modules/payment/payment.controller';

export const app: Application = express();

app.use(
  cors({
    origin: [ 
      "http://localhost:3000",
      "https://whatsupjaco.com",
      "https://www.whatsupjaco.com", 
      "https://dashboard.whatsupjaco.com",
      "https://www.dashboard.whatsupjaco.com", 
    ],
    credentials: true,
  }),
);

app.post(
  '/payments/webhook',
  express.raw({ type: 'application/json' }), 
  PaymentController.checkAndUpdateStatusByWebhook
);

// Unlimited payload sizes
app.use(express.json({ limit: 'Infinity' }));
app.use(express.urlencoded({ extended: true, limit: 'Infinity' }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: 'Infinity' }));
app.use(bodyParser.json({ limit: 'Infinity' }));
app.use(express.static("uploads"));

// File upload configuration (use your uploadFile function here)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage }).single('file');
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).send({ message: err.message });
    }
    res.status(200).send({ message: 'File uploaded successfully' });
  });
});

app.use('/', routes);

app.get('/', async (req: Request, res: Response) => {
  res.json('Welcome to Trading App');
});

app.use(globalErrorHandler);
app.use(NotFoundHandler.handle);
