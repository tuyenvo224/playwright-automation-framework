import { Locator, Page } from "@playwright/test";
import { BasePage } from "@pages/base.page";

export class DashboardBasePage extends BasePage {
    readonly usersTabLoc: Locator;
    readonly allUsersTabLoc: Locator
    readonly addUserTabLoc: Locator;

    readonly hoverProfileLoc: Locator;
    readonly logoutLoc: Locator;

    readonly dashboardTabLoc: Locator;
    readonly homeTabLoc: Locator;
    readonly updatesTabLoc: Locator;

    readonly postsTabLoc: Locator;
    readonly mediaTabLoc: Locator;
    readonly pagesTabLoc: Locator;
    readonly commentsTabLoc: Locator;
    readonly profileTabLoc: Locator;
    readonly toolsTabLoc: Locator;
    readonly appearanceTabLoc: Locator;
    readonly pluginsTabLoc: Locator;

    readonly dashboardHeadingLoc: Locator;
    readonly atAGlanceHeadingLoc: Locator;
    readonly activityHeadingLoc: Locator;


    constructor(page: Page) {
        super(page);

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

        this.dashboardHeadingLoc = this.page.getByRole('heading', { name: 'Dashboard' });
        this.atAGlanceHeadingLoc = this.page.getByRole('heading', { name: 'At a Glance' });
        this.activityHeadingLoc = this.page.getByRole('heading', { name: 'Activity' });
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

