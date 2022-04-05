import { createElement } from "lwc";
import PaymentStatus from "c/paymentStatus";
// import { clientSuccess, clientFailure, clientError } from "./data/client";

describe("c-payment-status", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("has all inputs present", () => {
    const element = createElement("c-payment-status", { is: PaymentStatus });
    document.body.appendChild(element);
    const inputs = element.shadowRoot.querySelectorAll("lightning-input");
    expect(inputs.length).toBe(3);
  });

  it("has all buttons present", () => {
    const element = createElement("c-payment-status", { is: PaymentStatus });
    document.body.appendChild(element);
    const buttons = element.shadowRoot.querySelectorAll("lightning-button");
    expect(buttons.length).toBe(2);
  });
});
