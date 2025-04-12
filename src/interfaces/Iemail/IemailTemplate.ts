import { EmailType } from '../../config/emailConfig';

export interface EmailContentResult {
  html: string;
  text: string;
}

export interface IemailTemplateService {
  generateEmailContent(type: EmailType, data: any): EmailContentResult;
}