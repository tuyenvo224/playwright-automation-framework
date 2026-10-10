import { faker } from '@faker-js/faker';
// dùng thư viện có sẵn faker-js/faker của Playwright, Cần cài thêm: npm install -D @faker-js/faker.

export function randomUserName(prefix: string = 'E101-tuyen'): string { // đây là default parameter
    return `${prefix}-${Date.now()}`; // userName = `E101-tuyen-${Date.now()}`; 
}
// randomUserName();          // dùng mặc định 'E101-tuyen'
// randomUserName('Tuyen');   // dùng 'Tuyen'

export function randomEmail(prefix: string = 'tuyen'): string {
    return `${prefix}-${Date.now()}@gmail.com`; // email = `tuyen-${Date.now()}@gmail.com`;
}

export const defaultTestPassword = "Editor123456!@#!@";

export function randomNumericString(length: number): string {
    return faker.string.numeric(length);  // toàn số
}

export function randomAlphaString(length: number): string {
    return faker.string.alpha(length); // toàn chữ
}

export function randomAlphanumericString(length: number): string {
    return faker.string.alphanumeric(length); // trộn số và chữ
}

