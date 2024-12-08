import dotenv from 'dotenv';
dotenv.config();

interface IEnvConfig {
    appPort: number;
    openIdApi: string;
    prodBackEndUrl: string;
    nodeEnv: string;
}

export const envConfig: IEnvConfig = {
    openIdApi: process.env.OPENID_API || "",   
    appPort: parseInt(process.env.PORT || "3006"),
    nodeEnv: process.env.NODE_ENV || "development",
    prodBackEndUrl: process.env.PROD_BACKEND_URL || "https://prod-backend.com",
}

