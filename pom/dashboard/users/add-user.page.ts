import { Locator, Page } from "@playwright/test";
import { DashboardBasePage } from "../dashboard.base.page";

export class UserPage extends DashboardBasePage {
    page: Page;

    usersHeadingLoc: Locator;
    addUserButtonLoc: Locator;

    addUserHeadingLoc: Locator;

    userNameTextboxLoc: Locator;
    emailTextboxLoc: Locator;
    firstNameTextboxLoc: Locator;
    lastNameTextboxLoc: Locator;
    passwordTextBoxLoc: Locator;
    roleComboboxLoc: Locator;
    submitAddUserLoc: Locator;
    msgCreateUserLoc: Locator;

    searchUserTextboxLoc: Locator;
    searchUserButtonLoc: Locator;
    deleteUserButtonLoc: Locator;
    submitDeleteUserLoc: Locator;
    optionDeleteUserLoc: Locator;
    msgDeleteUserLoc: Locator;

    errorEmailMsgLoc: Locator;
    errorUserNameMsgLoc: Locator;
    duplicateUserNameMsgLoc: Locator;
    duplicatedEmailMsgLoc: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;

        this.usersHeadingLoc = this.page.getByRole('heading', { name: 'Users', exact: true });
        this.addUserButtonLoc = this.page.locator('#wpbody-content').getByRole('link', { name: 'Add User' });

        this.addUserHeadingLoc = this.page.getByRole('heading', { name: 'Add User', exact: true });

        this.userNameTextboxLoc = this.page.getByLabel('Username (required)'); // page.getByRole('textbox', { name: 'Username (required)'})
        this.emailTextboxLoc = this.page.getByLabel('Email (required)');
        this.firstNameTextboxLoc = this.page.getByLabel('First Name ');
        this.lastNameTextboxLoc = this.page.getByLabel('Last Name ');
        this.passwordTextBoxLoc = this.page.getByRole('textbox', { name: 'Password' });
        this.roleComboboxLoc = this.page.getByLabel('Role'); // page.getByRole('combobox', {name: 'Role'})
        this.submitAddUserLoc = this.page.getByRole('button', { name: 'Add User' });
        this.msgCreateUserLoc = this.page.getByText('New user created. ');

        this.searchUserTextboxLoc = this.page.getByLabel('Search Users:'); // page.getByRole('searchbox', { name: 'Search Users:'})
        this.searchUserButtonLoc = this.page.getByRole('button', { name: 'Search Users' });
        this.deleteUserButtonLoc = this.page.getByRole('link', { name: 'Delete' });
        this.submitDeleteUserLoc = this.page.getByRole('button', { name: 'Confirm Deletion' });
        this.optionDeleteUserLoc = this.page.getByRole('radio', { name: 'Delete all content.' }); // page.getByLabel('Delete all content.')
        this.msgDeleteUserLoc = this.page.getByText('No users found.');

        this.errorEmailMsgLoc = this.page.getByText(` The email address is not correct.`);
        this.errorUserNameMsgLoc = this.page.getByText(` This username is invalid because it uses illegal characters. Please enter a valid username.`);
        this.duplicateUserNameMsgLoc = this.page.getByText(`This username is already registered. Please choose another one.`);
        this.duplicatedEmailMsgLoc = this.page.getByText(` This email is already registered. Please choose another one.`);
    }

    async clickAddUserButton() {
        await this.addUserButtonLoc.click();
    }

    async fillUserName(userName: string) {
        await this.userNameTextboxLoc.fill(userName);
    }

    async fillEmail(email: string) {
        await this.emailTextboxLoc.fill(email);
    }

    async fillFirstName(firstName: string) {
        await this.firstNameTextboxLoc.fill(firstName);
    }

    async fillLastName(lastName: string) {
        await this.lastNameTextboxLoc.fill(lastName);
    }

    async fillPassword(password: string) {
        await this.passwordTextBoxLoc.fill(password);
    }

    async selectRole(role: string) {
        await this.roleComboboxLoc.selectOption(role);
    }

    async submitAddUser() {
        await this.submitAddUserLoc.click();
    }

    async fillSearchUser(userName: string) {
        await this.searchUserTextboxLoc.fill(userName);
    }

    async clickSearchUser() {
        await this.searchUserButtonLoc.click();
    }

    async hoverUserName(userName: string) {
        await this.page.getByRole('link', { name: userName, exact: true }).hover();
    }

    async clickDeleteUser() {
        await this.deleteUserButtonLoc.click();
    }

    async submitDeleteUser() {
        await this.submitDeleteUserLoc.click();
    }

    async checkOptionDeleteUser() {
        await this.optionDeleteUserLoc.check();
    }
};

