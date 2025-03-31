import { Request, Response } from 'express'
import { Iuser } from '../Models/Iuser'


export interface IuserController {
    register(req: Request, res: Response): Promise<void>
    
}