import { LightningElement, wire } from 'lwc';
import getSession from 'api/getSession';
export default class App extends LightningElement {
    @wire(getSession)
    session;

    get hasSession() {
        if (this.session && this.session.data) {
            return document.location.toString().includes('/flows') && this.session.data.hasSession;
        }
        return false;
    }
}
