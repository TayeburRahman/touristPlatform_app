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
      "http://localhost:3000",
      "http://localhost:3001", 
      "http://localhost:3002",
      "http://localhost:3003",
      "http://localhost:3004",
      "http://localhost:3005",
      "http://localhost:3006",
      "http://localhost:3007",
      "http://localhost:3008",
      "http://localhost:3009",
      "http://localhost:30010",
      "http://192.168.10.25:3000",
      "http://192.168.10.25:3001",
      "http://192.168.10.25:3002",
      "http://192.168.10.25:3003",
      "http://192.168.10.25:3004",
      "http://192.168.10.25:3005",
      "http://192.168.10.25:3006",
      "http://192.168.10.25:3007",
      "http://192.168.10.25:3008",
      "http://192.168.10.25:3009", 
      "http://167.71.179.42:4173",
      "http://167.71.179.42:3000"
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
