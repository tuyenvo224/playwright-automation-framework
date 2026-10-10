import { Locator, Page } from "@playwright/test";
import { DashboardBasePage } from "@pages/dashboard/dashboard.base.page";

export class ProfilePage extends DashboardBasePage {
    readonly profileHeadingLoc: Locator;

    constructor(page: Page) {
        super(page);
        this.profileHeadingLoc = this.page.getByRole('heading', { name: 'Profile', exact: true });
    }

    // Triển khai thêm các locator và methods khác cho POM Profile tab

};

