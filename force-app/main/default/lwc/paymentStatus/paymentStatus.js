import { LightningElement, wire } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import { client } from "./client";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import CASE_OBJECT from "@salesforce/schema/Case";
import CASE_TYPE_FIELD from "@salesforce/schema/Case.Type";
import CASE_SUBTYPE_FIELD from "@salesforce/schema/Case.Subtype__c";
import CASE_ORIGIN_FIELD from "@salesforce/schema/Case.Origin";
import CASE_SUBJECT_FIELD from "@salesforce/schema/Case.Subject";
import CASE_DESCRIPTION_FIELD from "@salesforce/schema/Case.Description";
import CASE_RECORDTYPEID_FIELD from "@salesforce/schema/Case.RecordTypeId";
import CASE_OWNERID_FIELD from "@salesforce/schema/Case.OwnerId";
import CASE_SERVICELINE_FIELD from "@salesforce/schema/Case.UITS_Service_Line__c";
import { createRecord } from "lightning/uiRecordApi";
import getRecordTypeId from "@salesforce/apex/CaseUtil.getRecordTypeId";
import getCaseOwnerId from "@salesforce/apex/CaseUtil.getCaseOwnerId";
import getServiceId from "@salesforce/apex/CaseUtil.getServiceId";
import Id from "@salesforce/user/Id";
import { formatPaymentDate } from "./util";

const RECORDS_PER_PAGE = 20;
const DEFAULT_VENDOR = "";
const DEFAULT_PO = "";

export default class PaymentStatus extends LightningElement {
  vendorName = DEFAULT_VENDOR;
  poNumber = DEFAULT_PO;
  invoiceId;
  recordSum;
  records = [];
  hasError = false;
  errorDetail = {};
  fetchedRecords = false;
  loading = false;
  paginate = false;
  currentPage = 1;
  totalPages = 1;

  @wire(getRecord, { recordId: Id, fields: ["User.Name"] })
  currentUser;

  currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format;

  get noRecords() {
    return (
      !this.records.length &&
      this.fetchedRecords &&
      !this.hasError &&
      !this.isLoading
    );
  }

  get isLoading() {
    return this.loading && this.records.length === 0;
  }

  get displayRecords() {
    const start = (this.currentPage - 1) * RECORDS_PER_PAGE;
    const end = start + RECORDS_PER_PAGE;
    return this.records.slice(start, end);
  }

  get start() {
    return (this.currentPage - 1) * RECORDS_PER_PAGE + 1;
  }

  get finish() {
    const end = this.start + RECORDS_PER_PAGE - 1;
    if (end > this.recordTotal) {
      return this.recordTotal;
    }
    return end;
  }

  get recordTotal() {
    return this.records.length;
  }

  poNumberChangeHandler = (event) =>
    (this.poNumber = event.target.value.replace(/[ ]+/g, ""));
  invoiceIdChangeHandler = (event) =>
    (this.invoiceId = event.target.value.replace(/[ ]+/g, ""));
  vendorNameChangeHandler = (event) => (this.vendorName = event.target.value);

  async handleClick() {
    try {
      // clear error detail from previous errors, if any
      this.hasError = false;

      // check validation
      if (!this.handleValidation()) return;

      // vendor name is required, and either po number OR invoice id OR both are required
      if ((!this.invoiceId && !this.poNumber) || !this.vendorName) {
        this.records = [];
        this.hasError = true;
        this.errorDetail.message =
          "PO Number or Invoice ID must be filled out to check payment status.";
        return;
      }

      this.loading = true;
      this.records = [];
      const boomiData = await client.post(this.createBody());
      this.fetchedRecords = true;
      this.loading = false;

      const vendorPortal = boomiData?.vendorPortal;
      const records = this.getRecordArray(vendorPortal);

      if (records) {
        const formattedRecords = this.formatRecords(records);

        this.records = formattedRecords;
        this.recordSum = this.currencyFormatter(
          records.reduce((total, record) => {
            let val = parseFloat(record.Sum_Monetary_Amount);
            if (isNaN(val)) {
              val = 0;
            }
            return (total += val);
          }, 0)
        );

        if (formattedRecords.length > RECORDS_PER_PAGE) {
          this.totalPages = Math.ceil(
            formattedRecords.length / RECORDS_PER_PAGE
          );
          this.paginate = true;
        }
      }
    } catch (err) {
      console.log(err);
      this.handleAPIError(err);
    }
  }

  createBody() {
    const body = {};

    // only assign properties if they are truthy. When searching using the invoice ID with the presence of poNumber as an empty string
    // will return an array of results with the vendor's name.
    if (this.poNumber) body.PO_ID = this.poNumber.replace(/ /g, "");
    if (this.invoiceId) body.INVOICE_ID = this.invoiceId.replace(/ /g, "");

    body["Vendor Name"] = this.vendorName;

    return JSON.stringify(body);
  }

  getRecordArray(recordList) {
    if (recordList && this.invoiceId) {
      // filter by provided invoice ID - only applicable when BOTH invoice ID & PO number are filled out
      return recordList.filter(
        (record) =>
          record.InvoiceID.toLowerCase() === this.invoiceId.toLowerCase()
      );
    } else if (recordList && !this.invoiceId) {
      // return full list of records. used when searching by PO number
      return recordList;
    }
    // no account information is found
    return undefined;
  }

  formatPayment(amount) {
    const formattedPayment = this.currencyFormatter(amount);
    return parseFloat(amount) < 0 ? `(${formattedPayment})` : formattedPayment;
  }

  formatRecords(records) {
    return records.map((r) => ({
      ...r,
      Scheduled_Pay_DT:
        r.Scheduled_Pay_DT && formatPaymentDate(r.Scheduled_Pay_DT),
      Payment_DT: r.Payment_DT && formatPaymentDate(r.Payment_DT),
      Payment_Status:
        r.Payment_Status && r.Payment_Status.toLowerCase() === "p"
          ? "Paid"
          : "Unpaid",
      Sum_Monetary_Amount: this.currencyFormatter(r.Sum_Monetary_Amount),
      labelText:
        "Invoice ID: " +
        r.InvoiceID +
        " - " +
        this.formatPayment(r.Sum_Monetary_Amount),
      poID: r["PO-ID"],
      Payment_Hold: r.Payment_Hold && r.Payment_Hold === "Y" ? "Yes" : "No"
    }));
  }

  handleClear() {
    this.vendorName = DEFAULT_VENDOR;
    this.poNumber = DEFAULT_PO;
    this.invoiceId = undefined;
    this.recordSum = undefined;
    this.records = [];
    this.hasError = false;
    this.errorDetail = {};
    this.fetchedRecords = false;
    this.loading = false;
    this.paginate = false;
    this.currentPage = 1;
    this.totalPages = 1;
  }

  showNotification() {
    const event = new ShowToastEvent({
      title: "Uh Oh!",
      message: "Something broke! A case has been created to fix the issue.",
      variant: "error",
      mode: "sticky"
    });
    this.dispatchEvent(event);
  }

  async handleAPIError(err) {
    try {
      await this.createCase(String(err));
      this.showNotification();
      this.records = [];
      this.hasError = true;
      this.errorDetail.message =
        "Something broke! A case has been created to fix the issue.";
    } catch (e) {
      console.log("Error creating case\n", e);
    }
  }

  handleValidation() {
    return [...this.template.querySelectorAll("lightning-input")].reduce(
      (validSoFar, inputCmp) => {
        inputCmp.reportValidity();
        return validSoFar && inputCmp.checkValidity();
      },
      true
    );
  }

  async createCase(err) {
    const caseRecord = {
      apiName: CASE_OBJECT.objectApiName,
      fields: {
        [CASE_RECORDTYPEID_FIELD.fieldApiName]: await getRecordTypeId(),
        [CASE_OWNERID_FIELD.fieldApiName]: await getCaseOwnerId(),
        [CASE_SERVICELINE_FIELD.fieldApiName]: await getServiceId(),
        [CASE_TYPE_FIELD.fieldApiName]: "Incident",
        [CASE_SUBTYPE_FIELD.fieldApiName]: "Error",
        [CASE_ORIGIN_FIELD.fieldApiName]: "LWC - Invoice Component",
        [CASE_SUBJECT_FIELD.fieldApiName]:
          "LWC - Invoice Payment Status API error",
        [CASE_DESCRIPTION_FIELD.fieldApiName]:
          "Originated from " +
          this.currentUser.data.fields.Name.value +
          "\n\nError Message:\n" +
          String(err)
      }
    };

    await createRecord(caseRecord);
  }

  handlePrevious() {
    if (this.currentPage === 1) {
      return;
    }
    --this.currentPage;
  }

  handleNext() {
    if (this.currentPage === this.totalPages) {
      return;
    }
    ++this.currentPage;
  }

  handleFirst() {
    this.currentPage = 1;
  }

  handleLast() {
    this.currentPage = this.totalPages;
  }
}
