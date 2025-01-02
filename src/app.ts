import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import routes from './app/routes';
import { NotFoundHandler } from './errors/NotFoundHandler';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser'; 
import { PaymentController } from './app/modules/payment/payment.controller';

export const app: Application = express();

app.use(
  cors({
    origin: [
      'http://192.168.10.16:3000',
      "http://167.71.179.42:3001",
      "http://localhost:3000", 
      "http://192.168.10.25:3000",
      "http://192.168.10.25:3001",
      "http://192.168.10.25:3002",
      "http://167.71.179.42:3000",
      "http://167.71.179.42:3002",
      "http://localhost:3001 ",
      "https://whatsupjaco.com",
      "https://www.whatsupjaco.com", 
      "https://dashboard.whatsupjaco.com",
      "https://www.dashboard.whatsupjaco.com",
      "http://localhost:3001"
    ],
    credentials: true,
  }),
);
 
app.post(
  '/payments/webhook',
  express.raw({ type: 'application/json' }), 
  PaymentController.checkAndUpdateStatusByWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("uploads"));  


app.use('/', routes);

app.get('/', async (req: Request, res: Response) => {
  res.json('Welcome to Trading App');
});

app.use(globalErrorHandler);

app.use(NotFoundHandler.handle);
