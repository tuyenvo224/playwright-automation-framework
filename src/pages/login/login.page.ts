import { BasePage } from "@pages/base.page";
import { expect, Locator, Page } from "@playwright/test";

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

    // async fillUserNameLogin(userName: string) {
    //     await this.userNameLogin.fill(userName);
    // }

    // async fillPasswordLogin(password: string) {
    //     await this.passwordLogin.fill(password);
    // }

    async fillUserNameLogin(userName: string) {
        await this.fillAndVerify(this.userNameLogin, userName);
    }

    async fillPasswordLogin(password: string) {
        await this.fillAndVerify(this.passwordLogin, password);
    }


    async clickLoginButton() {
        await this.loginButton.click();
    }

    // async login(userName: string, password: string) {
    //     await this.userNameLogin.fill(userName);
    //     await this.passwordLogin.fill(password);
    //     await this.loginButton.click();
    // }

    async login(userName: string, password: string) {
        await expect(async () => {
            await this.userNameLogin.fill(userName);
            await this.passwordLogin.fill(password);
            await expect(this.userNameLogin).toHaveValue(userName, { timeout: 1000 });
            await expect(this.passwordLogin).toHaveValue(password, { timeout: 1000 });
        }).toPass({ timeout: 10000 });
        await this.loginButton.click();
    }



    async getErrorMessage(userName: string) {
        const errorMsg = this.page.getByText(`Error: The username ${userName} is not registered on this site. If you are unsure of your username, try your email address instead.`)
        return errorMsg;
    }
};

