import { expect, Locator, Page } from "@playwright/test";
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
        await this.waitForPageLoad();   // chờ sự kiện 'load': toàn bộ script đã tải và chạy xong
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

    async logout() {
        // Menu Howdy do JS (hoverIntent) mở khi chuột "đi vào" phần tử.
        // Mỗi lần thử: đưa chuột ra ngoài trước để lần hover sau tạo ra sự kiện "đi vào" mới.
        await expect(async () => {
            await this.page.mouse.move(0, 0);
            await this.hoverProfileLoc.hover();
            await this.logoutLoc.click({ timeout: 2000 });
        }).toPass({ timeout: 15000 });

        //click({ timeout: 2000 }): nếu sau 2 giây vẫn không click được thì báo lỗi ngay, thay vì treo tới 30 giây.
        //toPass({ timeout: 15000 }): khi gặp lỗi đó, chạy lại từ bước hover, tối đa 15 giây.
    }

};

