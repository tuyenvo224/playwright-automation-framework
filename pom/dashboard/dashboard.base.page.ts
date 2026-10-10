import { Locator, Page } from "@playwright/test";
import { LoginPage } from "./login/login.page";

export class DashboardBasePage extends LoginPage {
    page: Page;
    usersTabLoc: Locator;
    allUsersTabLoc: Locator
    addUserTabLoc: Locator;

    hoverProfileLoc: Locator;
    logoutLoc: Locator;

    dashboardTabLoc: Locator;
    homeTabLoc: Locator;
    updatesTabLoc: Locator;

    postsTabLoc: Locator;
    mediaTabLoc: Locator;
    pagesTabLoc: Locator;
    commentsTabLoc: Locator;
    profileTabLoc: Locator;
    toolsTabLoc: Locator;
    appearanceTabLoc: Locator;
    pluginsTabLoc: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;

        this.usersTabLoc = this.page.getByRole('link', { name: 'Users', exact: true });
        this.allUsersTabLoc = this.page.getByRole('link', { name: 'All Users', exact: true });
        this.addUserTabLoc = this.page.getByLabel('Main menu', { exact: true }).getByRole('link', { name: 'Add User' });

        this.hoverProfileLoc = this.page.getByRole('menuitem', { name: /Howdy/ });
        this.logoutLoc = page.getByRole('menuitem', { name: 'Log Out' }); // page.getByText('Log Out')

        this.dashboardTabLoc = this.page.getByRole('link', { name: 'Dashboard' });
        this.homeTabLoc = this.page.getByRole('link', { name: 'Home' });
        this.updatesTabLoc = this.page.getByRole('link', { name: 'Updates ' });

        this.postsTabLoc = this.page.getByRole('link', { name: 'Posts', exact: true });
        this.mediaTabLoc = this.page.getByRole('link', { name: 'Media', exact: true });
        this.pagesTabLoc = this.page.getByRole('link', { name: 'Pages', exact: true });
        this.commentsTabLoc = this.page.getByRole('link', { name: 'Comments ', exact: true });
        this.profileTabLoc = this.page.getByRole('link', { name: 'Profile', exact: true });
        this.toolsTabLoc = this.page.getByRole('link', { name: 'Tools' });
        this.appearanceTabLoc = this.page.getByRole('link', { name: 'Appearance' });
        this.pluginsTabLoc = this.page.getByRole('link', { name: 'Plugins ' });
    }

    async clickUserTab() {
        await this.usersTabLoc.click();
    }

    async clickAllUsersTab() {
        await this.allUsersTabLoc.click();
    }

    async clickAddUserTab() {
        await this.addUserTabLoc.click();
    }

    async clickProfileTab() {
        await this.profileTabLoc.click();
    }

    async clickDashboardTab() {
        await this.dashboardTabLoc.click();
    }

    async clickHomeTab() {
        await this.homeTabLoc.click();
    }

    async clickUpdatesTab() {
        await this.updatesTabLoc.click();
    }

    async hoverProfile() {
        await this.hoverProfileLoc.hover();
    }

    async clickLogout() {
        await this.logoutLoc.click();
    }
};

