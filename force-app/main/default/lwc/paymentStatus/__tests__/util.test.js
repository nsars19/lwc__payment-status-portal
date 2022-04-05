import { calculateScheduledPaymentDate } from "../util";

describe("calculateScheduledPaymentDate", () => {
  it("Makes no changes on Tuesdays (payment day)", () => {
    const tuesday = "2022-05-10";
    const tuesdayPayDate = calculateScheduledPaymentDate(tuesday);
    expect(tuesdayPayDate).toBe(tuesday);
  });

  it("Makes no changes on Thursdays (payment day)", () => {
    const thursday = "2022-05-12";
    const thursdayPayDate = calculateScheduledPaymentDate(thursday);
    expect(thursdayPayDate).toBe(thursday);
  });
  it("Changes Wednesdays to Tuesdays", () => {
    const wednesday = "2022-05-11";
    const tuesday = "2022-05-10";
    const wednesdayPayDate = calculateScheduledPaymentDate(wednesday);
    expect(wednesdayPayDate).toBe(tuesday);
  });

  it("Changes Friday to the previous Thursday", () => {
    const thursday = "2022-06-16";
    const friday = "2022-06-17";
    const fridayPayDate = calculateScheduledPaymentDate(friday);
    expect(fridayPayDate).toBe(thursday);
  });
  it("Changes Saturday to the previous Thursday", () => {
    const thursday = "2022-06-16";
    const saturday = "2022-06-18";
    const saturdayPayDate = calculateScheduledPaymentDate(saturday);
    expect(saturdayPayDate).toBe(thursday);
  });
  it("Changes Sunday to the previous Thursday", () => {
    const thursday = "2022-06-16";
    const sunday = "2022-06-19";
    const sundayPayDate = calculateScheduledPaymentDate(sunday);
    expect(sundayPayDate).toBe(thursday);
  });
  it("Changes Monday to the previous Thursday", () => {
    const thursday = "2022-06-16";
    const monday = "2022-06-20";
    const mondayPayDate = calculateScheduledPaymentDate(monday);
    expect(mondayPayDate).toBe(thursday);
  });

  it("Wraps over months", () => {
    const previousThursday = "2022-09-29";
    const monday = "2022-10-3";
    const mondayPayDate = calculateScheduledPaymentDate(monday);
    expect(mondayPayDate).toBe(previousThursday);
  });

  it("Wraps over years", () => {
    const previousThursday = "2022-12-29";
    const monday = "2023-01-02";
    const mondayPayDate = calculateScheduledPaymentDate(monday);
    expect(mondayPayDate).toBe(previousThursday);
  });
});
