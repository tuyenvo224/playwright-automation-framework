import { Page } from "@playwright/test";

export class BasePage {
    readonly page: Page;
    readonly baseUrl : string;

    constructor(page: Page) {
        this.page = page;
        this.baseUrl = process.env.BASE_URL!;
    }

    async goto(path: string = "") {
        await this.page.goto(this.baseUrl + path);
    }

    async waitForPageLoad(state: "load" | "domcontentloaded" | "networkidle" = "load") {
        await this.page.waitForLoadState(state);
    }

    async getTitle() {
        return this.page.title();
    }
};

