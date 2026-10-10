import { BasePage } from "@pages/base.page";
import { Locator, Page } from "@playwright/test";

export class LoginPage extends BasePage {
    readonly userNameLogin: Locator;
    readonly passwordLogin: Locator;
    readonly loginButton: Locator;

    constructor(page: Page) {
        super(page)
        this.userNameLogin = this.page.getByRole('textbox', { name: 'Username or Email Address' });
        this.passwordLogin = this.page.getByRole('textbox', { name: 'Password' });
        this.loginButton = this.page.getByRole('button', { name: 'Log In' });

    }

    async openPlaywrightPage() {
        await this.goto();
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

