import { expect, Locator, Page } from "@playwright/test";

export class BasePage {
    readonly page: Page;
    readonly baseUrl: string;

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

    // Điền giá trị và xác nhận ô thật sự nhận đúng giá trị.
    // WordPress có JS tự chuyển focus sau khi trang tải (VD: trang login focus ô Username sau ~200ms),
    // nếu rơi đúng lúc đang fill thì chữ bị chèn nhầm ô -> kiểm tra lại, sai thì fill lại.
    async fillAndVerify(locator: Locator, value: string) {
        await expect(async () => {
            await locator.fill(value);
            await expect(locator).toHaveValue(value, { timeout: 1000 });
        }).toPass({ timeout: 10000 });
    }

};

