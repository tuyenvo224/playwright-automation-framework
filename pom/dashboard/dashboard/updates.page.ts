import { Locator, Page } from "@playwright/test";
import { DashboardBasePage } from "../dashboard.base.page";

export class UpdatesPage extends DashboardBasePage {
    page: Page;
    wordPressUpdatesHeadingLoc: Locator;
    

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.wordPressUpdatesHeadingLoc = this.page.getByRole('heading', { name: 'WordPress Updates', exact: true });

    }

    // Triển khai thêm các locator và methods khác cho POM Updates tab

  

};

