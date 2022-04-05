import { LightningElement, api } from "lwc";

export default class RecordDetail extends LightningElement {
  @api record;

  get paymentLabel() {
    return !this.record.Payment_DT ? "Amount" : "Payment Amount";
  }

  get hasBeenPaid() {
    return Boolean(this.record.Payment_DT);
  }
}
