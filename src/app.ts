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
