
import { IOTPService } from "../interfaces/Iotp/IOTP"; 

export class OTPService implements IOTPService {
    generateOtp(): string {
        return Math.floor(1000 + Math.random() * 9000).toString(); 
    }
}
