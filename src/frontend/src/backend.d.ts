import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Booking {
    id: bigint;
    date: string;
    name: string;
    slotTime: string;
    issue: string;
    phone: string;
}
export interface backendInterface {
    addBooking(name: string, phone: string, issue: string, slotTime: string, date: string): Promise<bigint>;
    getBookedSlots(date: string): Promise<Array<string>>;
    getBookings(): Promise<Array<Booking>>;
}
