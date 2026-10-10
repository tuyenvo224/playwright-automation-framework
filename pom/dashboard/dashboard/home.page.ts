import { Locator, Page } from "@playwright/test";
import { DashboardBasePage } from "../dashboard.base.page";

export class HomePage extends DashboardBasePage {
    page: Page;
    
    

    constructor(page: Page) {
        super(page);
        this.page = page;

    }

    // Triển khai thêm các locator và methods khác cho POM Home tab

  

};

