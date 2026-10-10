import { Locator, Page } from "@playwright/test";
import { LoginPage } from "../dashboard/login/login.page";


export class StroreFrontHomePage extends LoginPage {
    page: Page;
    storeFrontPageLoc:string = "#wp-admin-bar-site-name"; 
    titleStoreFrontLoc: Locator;
    


    constructor(page: Page) {
        super(page);
        this.page = page;

        this.titleStoreFrontLoc = this.page.getByRole('heading', { name: 'Playwright practice site -' }).getByRole('link'); 
 
    }

    async clickstoreFrontPage() {
        await this.page.locator(this.storeFrontPageLoc).click();
    }


};

