import { EmailType } from "../../config/emailConfig";
import { EmailContentResult, EmailData } from "../../utils/emailTemplates";

export interface IemailTemplateService {
  generateEmailContent(type: EmailType, data: EmailData): EmailContentResult;
}
