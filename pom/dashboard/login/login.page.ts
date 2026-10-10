import { Locator, Page } from "@playwright/test";

export class LoginPage {
    page: Page;
    readonly userNameLogin: Locator;
    readonly passwordLogin: Locator;
    loginButton: Locator;
    baseUrl: string;

    dashboardHeadingLoc: Locator;
    atAGlanceHeadingLoc: Locator;
    activityHeadingLoc: Locator;

    constructor(page: Page) {
        this.page = page;
        this.baseUrl = process.env.BASE_URL!;
        this.userNameLogin = this.page.getByRole('textbox', { name: 'Username or Email Address' });
        this.passwordLogin = this.page.getByRole('textbox', { name: 'Password' });
        this.loginButton = this.page.getByRole('button', { name: 'Log In' });

        this.dashboardHeadingLoc = this.page.getByRole('heading', { name: 'Dashboard' });
        this.atAGlanceHeadingLoc = this.page.getByRole('heading', { name: 'At a Glance' });
        this.activityHeadingLoc = this.page.getByRole('heading', { name: 'Activity' });
    }

    async openPlaywrightPage() {
        await this.page.goto(this.baseUrl);
    }

    async fillUserNameLogin(userName: string) {
        await this.userNameLogin.fill(userName);
    }

    async fillPasswordLogin(password: string) {
        await this.passwordLogin.fill(password);
    }

    async clickLoginButton() {
        await this.loginButton.click();
    }

    async login(userName: string, password: string) {
        await this.userNameLogin.fill(userName);
        await this.passwordLogin.fill(password);
        await this.loginButton.click();
    }

    async getErrorMessage(userName: string) {
        const errorMsg = this.page.getByText(`Error: The username ${userName} is not registered on this site. If you are unsure of your username, try your email address instead.`)
        return errorMsg;
    }
};

