import express, { Express } from 'express'
import cors, { CorsOptions } from 'cors';
import config from './config/env';
import userRoute from './routes/userRoutes';


const app: Express = express();

const corsOptions: cors.CorsOptions = {
    origin: config.CLIENT_URL,
    methods: "GET,POST,PUT,DELETE,PATCH",
    allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/', userRoute);


export default app;