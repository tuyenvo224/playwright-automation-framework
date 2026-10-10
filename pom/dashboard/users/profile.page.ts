import { Locator, Page } from "@playwright/test";
import { DashboardBasePage } from "../dashboard.base.page";

export class ProfilePage extends DashboardBasePage {
    page: Page;
    profileHeadingLoc: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.profileHeadingLoc = this.page.getByRole('heading', { name: 'Profile', exact: true });
    }

    // Triển khai thêm các locator và methods khác cho POM Profile tab

};

