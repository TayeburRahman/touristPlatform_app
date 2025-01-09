import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import routes from './app/routes'; // Replace with your actual routes file
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import { NotFoundHandler } from './errors/NotFoundHandler';
import { PaymentController } from './app/modules/payment/payment.controller';

export const app: Application = express();

// Configure CORS
app.use(
  cors({
    origin: [
      "https://whatsupjaco.com",
      "http://whatsupjaco.com",
      "https://www.whatsupjaco.com",
      "https://dashboard.whatsupjaco.com",
      "https://www.dashboard.whatsupjaco.com",
    ],
    credentials: true, // Allow cookies and other credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  })
);

// Set body parsers and limits for payload size
app.use(express.json({ limit: '50mb' })); // Allow JSON payloads up to 50MB
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Allow URL-encoded payloads
app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' })); // Adjust as needed for large file uploads
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static("uploads")); // Serve static files

// Define specific routes (e.g., webhook)
app.post(
  '/payments/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.checkAndUpdateStatusByWebhook
);

// Define general routes
app.use('/', routes);

app.get('/', async (req: Request, res: Response) => {
  res.json('Welcome to Trading App');
});

// Global error handler
app.use(globalErrorHandler);

// Handle 404 (Not Found) errors
app.use(NotFoundHandler.handle);

// Export the app
export default app;
