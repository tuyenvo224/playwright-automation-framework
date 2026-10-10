import { Locator, Page } from "@playwright/test";
import { BasePage } from "@pages/base.page";


export class StoreFrontHomePage extends BasePage {
    readonly storeFrontPageLoc: string = "#wp-admin-bar-site-name";
    readonly titleStoreFrontLoc: Locator;


    constructor(page: Page) {
        super(page);

        this.titleStoreFrontLoc = this.page.getByRole('heading', { name: 'Playwright practice site -' }).getByRole('link');

    }

    async clickStoreFrontPage() {
        await this.page.locator(this.storeFrontPageLoc).click();
    }


};

