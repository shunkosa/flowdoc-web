import { LightningElement } from 'lwc';

export default class App extends LightningElement {
    accessToken;

    connectedCallback() {
        this.accessToken = this.getCookie('access_token');
    }

    get showsList() {
        return this.accessToken !== undefined && document.location.toString().includes('/flows');
    }

    getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length === 2) { 
            return parts.pop().split(";").shift();
        }
        return undefined;
    }
}
