import { Locator, Page } from "@playwright/test";
import { DashboardBasePage } from "@pages/dashboard/dashboard.base.page";

export class UpdatesPage extends DashboardBasePage {
    readonly wordPressUpdatesHeadingLoc: Locator;

    constructor(page: Page) {
        super(page);
        this.wordPressUpdatesHeadingLoc = this.page.getByRole('heading', { name: 'WordPress Updates', exact: true });

    }

    // Triển khai thêm các locator và methods khác cho POM Updates tab

  

};

