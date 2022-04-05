import { LightningElement } from "lwc";

export default class Paginator extends LightningElement {
  handlePrevious() {
    this.dispatchEvent(new CustomEvent("previous"));
  }

  handleNext() {
    this.dispatchEvent(new CustomEvent("next"));
  }

  handleFirst() {
    this.dispatchEvent(new CustomEvent("first"));
  }

  handleLast() {
    this.dispatchEvent(new CustomEvent("last"));
  }
}
