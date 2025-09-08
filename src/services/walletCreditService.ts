import { inject, injectable } from "tsyringe";
import { IPaymentRepository } from "../interfaces/Irepositories/IpaymentRepository";
import { IWalletCreditService } from "../interfaces/Iservices/IwalletCreditService";
import { IWalletRepository } from "../interfaces/Irepositories/IwalletRepository";
import { IPayment } from "../interfaces/Models/Ipayment";

@injectable()
export class WalletCreditService implements IWalletCreditService {
  constructor(
    @inject("IPaymentRepository")
    private _paymentRepository: IPaymentRepository,
    @inject("IWalletRepository") private _walletRepository: IWalletRepository
  ) {}

  async processWalletCredits(): Promise<void> {
    try {
      console.log(
        "entered to the function in wallet credit service that procees the pending wallet credits"
      );
      const paymentToCredits =
        await this._paymentRepository.findPaymentsReadyForCredit();
      console.log(`found ${paymentToCredits.length} payments ready for credit`);

      let creditCount = 0;

      for (const payment of paymentToCredits) {
        await this.creditTechnicianWallet(payment);
        creditCount++;
      }

      console.log(`successfully credit ${creditCount} technican wallets`);
    } catch (error) {
      console.log("error occured while processing the wallet credits:", error);
    }
  }

  private async creditTechnicianWallet(payment: IPayment): Promise<void> {
    try {
      const technicianId = payment.technicianId.toString();

      if (!payment.technicianShare || payment.technicianShare <= 0) {
        console.log(`Invalid technician share for payment ${payment._id}`);
        return;
      }
      const amount = payment.technicianShare;
      const shortPaymentId = payment._id.toString().slice(-8).toUpperCase();

      await this._walletRepository.updateWalletBalanceWithTransaction(
        technicianId,
        "technician" as const,
        amount,
        "Credit" as const,
        `service payment credited ${shortPaymentId}`,
        payment._id.toString()
      );

      await this._paymentRepository.updatePayment(payment._id.toString(), {
        technicianPaid: true,
        technicianPaidAt: new Date(),
      });
      console.log(
        `successfully credited the ${amount} for the technician ${technicianId}`
      );
    } catch (error) {
      console.log(
        "error occured while crediting the money for the technician wallet:",
        error
      );
    }
  }
}
