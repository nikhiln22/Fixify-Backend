import app from './app'
import config from './config/env';
import { database } from './config/database';

async function startServer() {
    try {
        await database.connect();
        app.listen(config.PORT, () => {
            console.log(`server is running on http://localhost:${config.PORT}`);
        })
    } catch (error) {
        console.log('server failed to start due to database error:', error);
        process.exit(1)
    }
}

startServer()